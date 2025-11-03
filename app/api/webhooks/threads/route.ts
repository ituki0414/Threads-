import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { AutoReplyRule } from '@/lib/types/auto-reply';

// Webhook の検証トークン（環境変数で設定）
const VERIFY_TOKEN = process.env.THREADS_WEBHOOK_VERIFY_TOKEN || 'threadstep_webhook_secret_2024';

/**
 * GET: Webhook 検証エンドポイント
 * Meta が Webhook URL を検証するときに呼ばれる
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('🔍 Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.log('❌ Webhook verification failed');
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST: Webhook イベント受信エンドポイント
 * リプライが来たときに Meta から呼ばれる
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📨 Webhook event received:', JSON.stringify(body, null, 2));

    // イベントの処理
    if (body.object === 'page') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'replies') {
            // リプライイベントを処理
            await handleReplyEvent(change.value);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * リプライイベントを処理
 */
async function handleReplyEvent(eventData: any) {
  try {
    console.log('💬 Processing reply event:', eventData);

    const replyId = eventData.id;
    const parentPostId = eventData.parent_id;
    const fromUserId = eventData.from?.id;
    const fromUsername = eventData.from?.username;
    const replyText = eventData.text || '';

    if (!replyId || !parentPostId) {
      console.log('⚠️ Missing required fields in reply event');
      return;
    }

    // 親投稿がDBに存在するか確認
    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('threads_post_id', parentPostId)
      .single();

    if (!post) {
      console.log('⚠️ Parent post not found in database');
      return;
    }

    console.log(`📝 Reply to post: ${post.id}`);

    // このポストに対するアクティブな自動返信ルールを取得
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('auto_reply_rules')
      .select('*, account:accounts(*)')
      .eq('target_post_id', post.id)
      .eq('is_active', true)
      .eq('trigger_reply', true);

    if (rulesError || !rules || rules.length === 0) {
      console.log('⚠️ No active auto-reply rules found for this post');
      return;
    }

    console.log(`📋 Found ${rules.length} active rules`);

    // 各ルールを処理
    for (const rule of rules as any[]) {
      try {
        // 既に処理済みかチェック
        const { data: existingReply } = await supabaseAdmin
          .from('auto_replies')
          .select('id')
          .eq('rule_id', rule.id)
          .eq('trigger_threads_id', replyId)
          .single();

        if (existingReply) {
          console.log(`⏭️ Already processed for rule: ${rule.name}`);
          continue;
        }

        // キーワード条件チェック
        if (!matchesKeywordCondition(replyText, rule)) {
          console.log(`⏭️ Keywords don't match for rule: ${rule.name}`);
          continue;
        }

        // 期間フィルターチェック
        if (!matchesDateFilter(rule)) {
          console.log(`⏭️ Outside date range for rule: ${rule.name}`);
          continue;
        }

        console.log(`✅ Rule "${rule.name}" matched, processing...`);

        // 自動返信履歴を作成
        const replyRecord = {
          account_id: rule.account_id,
          rule_id: rule.id,
          post_id: post.id,
          trigger_type: 'reply' as const,
          trigger_user_id: fromUserId,
          trigger_username: fromUsername,
          trigger_text: replyText,
          trigger_threads_id: replyId,
          reply_status: 'pending' as const,
          reply_text: rule.reply_text,
        };

        const account = rule.account;
        if (!account || !account.access_token) {
          console.log('❌ Account or access token not found');
          continue;
        }

        const threadsClient = new ThreadsAPIClient(account.access_token);

        // タイミングによって処理を分岐
        if (rule.timing_type === 'immediate') {
          // 即時送信
          await processImmediateSend(threadsClient, rule, replyRecord, post.threads_post_id);
        } else if (rule.timing_type === 'delayed') {
          // 遅延送信
          const scheduledTime = new Date(Date.now() + (rule.delay_minutes || 0) * 60 * 1000);
          await supabaseAdmin.from('auto_replies').insert({
            ...replyRecord,
            scheduled_send_at: scheduledTime.toISOString(),
          });
          console.log(`⏰ Scheduled for ${scheduledTime.toLocaleString('ja-JP')}`);
        } else if (rule.timing_type === 'like_threshold') {
          // いいね待ち状態で保存
          await supabaseAdmin.from('auto_replies').insert({
            ...replyRecord,
            reply_status: 'waiting_likes',
          });
          console.log(`👍 Waiting for ${rule.like_threshold} likes`);
        }

        // API rate limitを避けるため、少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error processing rule "${rule.name}":`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error handling reply event:', error);
  }
}

/**
 * キーワード条件にマッチするかチェック
 */
function matchesKeywordCondition(text: string, rule: any): boolean {
  if (rule.keyword_condition === 'none' || !rule.keywords || rule.keywords.length === 0) {
    return true;
  }

  const matches = rule.keywords.map((keyword: string) => {
    if (rule.keyword_match_type === 'exact') {
      return text === keyword;
    } else {
      return text.toLowerCase().includes(keyword.toLowerCase());
    }
  });

  if (rule.keyword_condition === 'all') {
    return matches.every((m: boolean) => m);
  } else {
    return matches.some((m: boolean) => m);
  }
}

/**
 * 期間フィルターをチェック
 */
function matchesDateFilter(rule: any): boolean {
  const now = new Date();

  if (rule.filter_start_date) {
    const startDate = new Date(rule.filter_start_date);
    if (now < startDate) return false;
  }

  if (rule.filter_end_date) {
    const endDate = new Date(rule.filter_end_date);
    if (now > endDate) return false;
  }

  return true;
}

/**
 * 即時送信を処理
 */
async function processImmediateSend(
  threadsClient: ThreadsAPIClient,
  rule: any,
  replyRecord: any,
  targetPostId: string
) {
  try {
    if (rule.reply_type === 'none') {
      // 返信なし（履歴のみ保存）
      await supabaseAdmin.from('auto_replies').insert({
        ...replyRecord,
        reply_status: 'sent',
        sent_at: new Date().toISOString(),
      });
      console.log(`✅ Logged (no reply sent)`);
      return;
    }

    // 返信テキストを準備
    let replyText = rule.reply_text || '';
    replyText = replyText.replace(/\{username\}/g, replyRecord.trigger_username);
    replyText = replyText.replace(/\{original_text\}/g, replyRecord.trigger_text || '');

    // リプライとして送信
    const result = await threadsClient.replyToPost(targetPostId, replyText);

    // 送信成功
    await supabaseAdmin.from('auto_replies').insert({
      ...replyRecord,
      reply_status: 'sent',
      reply_threads_id: result?.id,
      sent_at: new Date().toISOString(),
    });

    console.log(`✅ Sent reply to @${replyRecord.trigger_username}`);
  } catch (error) {
    // 送信失敗
    await supabaseAdmin.from('auto_replies').insert({
      ...replyRecord,
      reply_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error(`❌ Failed to send:`, error);
  }
}
