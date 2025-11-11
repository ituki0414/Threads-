import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import crypto from 'crypto';

/**
 * Threads Webhook エンドポイント
 *
 * GET: Webhook検証（Meta Developer Consoleからの検証リクエスト）
 * POST: イベント受信（コメント、いいね、リポストなど）
 */

/**
 * Webhook検証 (GET)
 * Meta Developer Consoleが送信する検証リクエストに応答
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.THREADS_WEBHOOK_VERIFY_TOKEN || 'threadstep_webhook_token_2025';

  console.log('🔍 Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('❌ Webhook verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  }
}

/**
 * Webhookイベント受信 (POST)
 * コメント、いいね、リポストなどのイベントを受信して処理
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得（署名検証のため）
    const rawBody = await request.text();
    console.log('📨 Raw webhook payload received');
    console.log('📨 Payload length:', rawBody.length);
    console.log('📨 Complete raw body:', rawBody);
    console.log('📨 Body is empty?', rawBody.length === 0);

    // すべてのヘッダーをログ
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('📨 Headers:', JSON.stringify(headers, null, 2));

    // Webhook署名検証（本番環境ではセキュリティのため必須）
    const signature = request.headers.get('x-hub-signature-256');
    if (signature && process.env.THREADS_APP_SECRET) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        process.env.THREADS_APP_SECRET
      );
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
      console.log('✅ Webhook signature verified');
    } else {
      console.log('⚠️ Signature verification skipped (no signature or secret)');
    }

    // 空のボディの場合はテストPingとして扱う
    if (!rawBody || rawBody.length === 0) {
      console.log('⚠️ Empty webhook body - likely a test ping');
      return NextResponse.json({ success: true, message: 'Test ping received' }, { status: 200 });
    }

    // JSONパース
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log('📨 Webhook event received:');
      console.log('   Object:', body.object);
      console.log('   Entry count:', body.entry?.length || 0);
      console.log('   Full payload:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      console.error('   Raw body:', rawBody);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // bodyがundefinedまたはobjectがない場合
    if (!body || !body.object) {
      console.log('⚠️ Webhook body missing object field - likely a test ping');
      console.log('   Body:', JSON.stringify(body));
      return NextResponse.json({ success: true, message: 'Received but no object field' }, { status: 200 });
    }

    // イベント処理 - Threads APIの新しい形式
    if (body.values && Array.isArray(body.values)) {
      console.log(`✅ Processing Threads webhook with ${body.values.length} values`);
      for (const item of body.values) {
        await processWebhookChange(item);
      }
    }
    // 従来のInstagram API形式（互換性のため残す）
    else if (body.object === 'instagram' || body.object === 'threads' || body.object === 'page') {
      console.log(`✅ Processing ${body.object} webhook`);
      for (const entry of body.entry || []) {
        console.log('📦 Processing entry:', JSON.stringify(entry, null, 2));

        // changes配列がある場合
        if (entry.changes) {
          for (const change of entry.changes) {
            await processWebhookChange(change);
          }
        }

        // messaging配列がある場合（別の形式）
        if (entry.messaging) {
          console.log('💬 Found messaging data:', entry.messaging);
        }
      }
    } else {
      console.log('⚠️ Unknown webhook format:', JSON.stringify(body).substring(0, 200));
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('   Stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

/**
 * Webhook署名検証
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Webhookイベントの変更を処理
 */
async function processWebhookChange(change: any) {
  console.log('🔄 Processing change:', {
    field: change.field,
    value: JSON.stringify(change.value).substring(0, 200),
  });

  // リプライ（返信）イベント
  if (change.field === 'replies') {
    const replyData = change.value;
    console.log('💬 Reply data:', JSON.stringify(replyData, null, 2));

    // リプライが投稿された場合
    if (replyData && replyData.id && replyData.text) {
      await handleNewComment({
        comment_id: replyData.id,
        post_id: replyData.root_post?.id || replyData.replied_to?.id,
        from_id: replyData.from?.id || '',
        from_username: replyData.username || '',
        text: replyData.text || '',
        timestamp: replyData.timestamp || '',
      });
    } else {
      console.log('⚠️ Reply data missing required fields');
    }
  }

  // コメントイベント（念のため残す）
  if (change.field === 'comments') {
    const commentData = change.value;
    console.log('💬 Comment data:', commentData);

    // コメントが投稿された場合
    if (commentData && (commentData.text || commentData.id)) {
      await handleNewComment({
        comment_id: commentData.id,
        post_id: commentData.media?.id || commentData.media_id || commentData.parent_id,
        from_id: commentData.from?.id || commentData.user_id,
        from_username: commentData.from?.username || commentData.username,
        text: commentData.text || '',
        timestamp: commentData.timestamp || commentData.created_time,
      });
    } else {
      console.log('⚠️ Comment data missing required fields');
    }
  }

  // メンションイベント
  if (change.field === 'mentions') {
    const mentionData = change.value;
    console.log('📢 Mention data:', mentionData);
    // メンションもコメントとして処理
    if (mentionData && (mentionData.text || mentionData.id)) {
      await handleNewComment({
        comment_id: mentionData.id,
        post_id: mentionData.media?.id || mentionData.media_id || mentionData.parent_id,
        from_id: mentionData.from?.id || mentionData.user_id,
        from_username: mentionData.from?.username || mentionData.username,
        text: mentionData.text || mentionData.comment_text || '',
        timestamp: mentionData.timestamp || mentionData.created_time,
      });
    }
  }

  // いいねイベント（将来の拡張用）
  if (change.field === 'likes') {
    console.log('👍 Like event received:', change.value);
  }

  // リポストイベント（将来の拡張用）
  if (change.field === 'reposts') {
    console.log('🔁 Repost event received:', change.value);
  }
}

/**
 * 新しいコメントを処理して自動返信を実行
 */
async function handleNewComment(comment: {
  comment_id: string;
  post_id: string;
  from_id: string;
  from_username: string;
  text: string;
  timestamp: string;
}) {
  console.log('💬 New comment received:', {
    comment_id: comment.comment_id,
    post_id: comment.post_id,
    from_id: comment.from_id,
    from_username: comment.from_username,
    text: comment.text?.substring(0, 50),
  });

  // 必須フィールドのチェック
  if (!comment.comment_id || !comment.post_id) {
    console.error('❌ Missing required fields:', comment);
    return;
  }

  try {
    // 1. 投稿IDから該当するpostsレコードを検索
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('*, accounts(*)')
      .eq('threads_post_id', comment.post_id)
      .single();

    if (postError || !post) {
      console.log('⚠️ Post not found in database for threads_post_id:', comment.post_id);
      console.log('   Error:', postError?.message);
      return;
    }

    console.log('📍 Found post:', post.id, 'Account:', post.accounts.threads_username);

    // 2. このアカウントのアクティブな自動返信ルールを取得
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('auto_reply_rules')
      .select('*')
      .eq('account_id', post.account_id)
      .eq('is_active', true)
      .eq('trigger_reply', true); // リプライトリガーが有効なもののみ

    if (rulesError || !rules || rules.length === 0) {
      console.log('⚠️ No active auto-reply rules for this account');
      return;
    }

    console.log(`📋 Found ${rules.length} active rules with reply trigger`);

    // 3. 各ルールをチェックして条件に合致すれば自動返信
    const threadsClient = new ThreadsAPIClient(post.accounts.access_token);

    for (const rule of rules) {
      // 対象投稿のチェック
      if (rule.target_post_id && rule.target_post_id !== post.id) {
        console.log(`⏭️ Skipping rule "${rule.name}": Different target post`);
        continue;
      }

      // 既に処理済みかチェック
      const { data: existingReply } = await supabaseAdmin
        .from('auto_replies')
        .select('id')
        .eq('rule_id', rule.id)
        .eq('trigger_threads_id', comment.comment_id)
        .single();

      if (existingReply) {
        console.log(`⏭️ Already processed for rule "${rule.name}"`);
        continue;
      }

      // キーワード条件チェック
      const keywordMatches = matchesKeywordCondition(comment.text, rule);
      console.log(`🔍 Keyword check for "${comment.text}":`, {
        matches: keywordMatches,
        keywords: rule.keywords,
        condition: rule.keyword_condition,
      });

      if (!keywordMatches) {
        console.log(`⏭️ Skipping rule "${rule.name}": Keywords don't match`);
        continue;
      }

      // 期間フィルターチェック
      if (!matchesDateFilter(rule)) {
        console.log(`⏭️ Skipping rule "${rule.name}": Outside date range`);
        continue;
      }

      // 自動返信を実行
      console.log(`✨ Executing auto-reply for rule "${rule.name}"`);

      const replyRecord = {
        account_id: post.account_id,
        rule_id: rule.id,
        post_id: post.id,
        trigger_type: 'reply' as const,
        trigger_user_id: comment.from_id,
        trigger_username: comment.from_username,
        trigger_text: comment.text,
        trigger_threads_id: comment.comment_id,
        reply_status: 'pending' as const,
        reply_text: rule.reply_text,
      };

      // タイミングによって処理を分岐
      if (rule.timing_type === 'immediate') {
        await processImmediateSend(threadsClient, rule, replyRecord, comment.comment_id);
      } else if (rule.timing_type === 'delayed') {
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
    }
  } catch (error) {
    console.error('❌ Error handling comment:', error);
  }
}

/**
 * キーワード条件チェック
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
 * 期間フィルターチェック
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
  targetId: string
) {
  try {
    console.log(`📤 Sending ${rule.reply_type} to ${replyRecord.trigger_username}`);

    if (rule.reply_type === 'none') {
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

    let result;

    if (rule.reply_type === 'reply') {
      result = await threadsClient.replyToPost(targetId, replyText);
    } else if (rule.reply_type === 'quote') {
      result = await threadsClient.createPost({
        text: replyText,
        mediaUrl: rule.reply_media_url || undefined,
        mediaType: rule.reply_media_type as 'IMAGE' | 'VIDEO' | undefined,
      });
    }

    // 送信成功
    await supabaseAdmin.from('auto_replies').insert({
      ...replyRecord,
      reply_status: 'sent',
      reply_threads_id: result?.id,
      sent_at: new Date().toISOString(),
    });

    console.log(`✅ Auto-reply sent successfully to @${replyRecord.trigger_username}`);
  } catch (error) {
    // 送信失敗
    await supabaseAdmin.from('auto_replies').insert({
      ...replyRecord,
      reply_status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
    console.error(`❌ Failed to send auto-reply:`, error);
  }
}
