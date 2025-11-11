import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { AutoReplyRule } from '@/lib/types/auto-reply';

/**
 * トリガーがキーワード条件にマッチするかチェック
 */
function matchesKeywordCondition(
  text: string,
  rule: AutoReplyRule
): boolean {
  if (rule.keyword_condition === 'none' || !rule.keywords || rule.keywords.length === 0) {
    return true; // キーワード条件なし
  }

  const matches = rule.keywords.map(keyword => {
    if (rule.keyword_match_type === 'exact') {
      // 完全一致
      return text === keyword;
    } else {
      // 部分一致
      return text.toLowerCase().includes(keyword.toLowerCase());
    }
  });

  if (rule.keyword_condition === 'all') {
    // すべて一致
    return matches.every(m => m);
  } else {
    // いずれか一致
    return matches.some(m => m);
  }
}

/**
 * 期間フィルターをチェック
 */
function matchesDateFilter(rule: AutoReplyRule): boolean {
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
 * 自動返信を処理（新仕様）
 * POST /api/auto-reply/v2/process
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    console.log('🤖 [V2] Starting auto-reply processing...');

    // アカウント情報を取得
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // アクティブな自動返信ルールを取得
    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('auto_reply_rules')
      .select('*')
      .eq('account_id', account_id)
      .eq('is_active', true);

    if (rulesError) {
      throw rulesError;
    }

    if (!rules || rules.length === 0) {
      return NextResponse.json({
        message: 'No active auto-reply rules',
        processed: 0,
      });
    }

    console.log(`📋 Found ${rules.length} active auto-reply rules`);

    const threadsClient = new ThreadsAPIClient(account.access_token);
    let totalProcessed = 0;

    // 各ルールを処理
    for (const rule of rules as AutoReplyRule[]) {
      try {
        // 期間フィルターチェック
        if (!matchesDateFilter(rule)) {
          console.log(`⏭️ Rule "${rule.name}": Outside date range, skipping`);
          continue;
        }

        // 対象投稿を取得
        let posts: any[] = [];
        if (rule.target_post_id) {
          // 特定の投稿に紐付けられている場合
          const { data: post, error: postError } = await supabaseAdmin
            .from('posts')
            .select('*')
            .eq('id', rule.target_post_id)
            .single();

          if (postError || !post || !post.threads_post_id) {
            console.log(`⚠️ Rule "${rule.name}": Target post not found or not published`);
            continue;
          }
          posts = [post];
        } else {
          // すべての公開済み投稿を対象にする
          const { data: allPosts, error: postsError } = await supabaseAdmin
            .from('posts')
            .select('*')
            .eq('account_id', account_id)
            .eq('state', 'published')
            .not('threads_post_id', 'is', null)
            .order('published_at', { ascending: false })
            .limit(10); // 最新10件のみチェック

          if (postsError || !allPosts) {
            console.log(`⚠️ Rule "${rule.name}": No posts found`);
            continue;
          }
          posts = allPosts;
        }

        console.log(`📝 Processing rule "${rule.name}" for ${posts.length} post(s)`);

        // 各投稿を処理
        for (const post of posts) {

        // 投稿へのリプライを取得（trigger_replyがtrueの場合）
        if (rule.trigger_reply) {
          try {
            const replies = await threadsClient.getReplies(post.threads_post_id);
            console.log(`💬 Found ${replies.length} replies`);

            for (const reply of replies) {
              // 既に処理済みかチェック
              const { data: existingReply } = await supabaseAdmin
                .from('auto_replies')
                .select('id')
                .eq('rule_id', rule.id)
                .eq('trigger_threads_id', reply.id)
                .single();

              if (existingReply) {
                continue; // 既に処理済み
              }

              // キーワード条件チェック
              if (!matchesKeywordCondition(reply.text, rule)) {
                continue;
              }

              // 自動返信履歴を作成（pending状態）
              const replyRecord = {
                account_id: account_id,
                rule_id: rule.id,
                post_id: post.id,
                trigger_type: 'reply' as const,
                trigger_user_id: reply.from_id,
                trigger_username: reply.username,
                trigger_text: reply.text,
                trigger_threads_id: reply.id,
                reply_status: 'pending' as const,
                reply_text: rule.reply_text,
              };

              // タイミングによって処理を分岐
              if (rule.timing_type === 'immediate') {
                // 即時送信
                await processImmediateSend(threadsClient, rule, replyRecord, post.threads_post_id);
                totalProcessed++;
              } else if (rule.timing_type === 'delayed') {
                // 遅延送信
                const scheduledTime = new Date(Date.now() + (rule.delay_minutes || 0) * 60 * 1000);
                await supabaseAdmin.from('auto_replies').insert({
                  ...replyRecord,
                  scheduled_send_at: scheduledTime.toISOString(),
                });
                console.log(`⏰ Scheduled for ${scheduledTime.toLocaleString('ja-JP')}`);
              } else if (rule.timing_type === 'like_threshold') {
                // いいね数条件
                const currentLikes = post.metrics?.likes || 0;
                if (currentLikes >= (rule.like_threshold || 0)) {
                  await processImmediateSend(threadsClient, rule, replyRecord, post.threads_post_id);
                  totalProcessed++;
                } else {
                  // いいね待ち状態で保存
                  await supabaseAdmin.from('auto_replies').insert({
                    ...replyRecord,
                    reply_status: 'waiting_likes',
                  });
                  console.log(`👍 Waiting for ${rule.like_threshold} likes (current: ${currentLikes})`);
                }
              }

              // API rate limitを避けるため、少し待機
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.error(`❌ Error processing replies for rule "${rule.name}":`, error);
          }
        }

        // TODO: リポスト、引用、いいねのトリガー処理を追加
        // Threads APIの制限により、これらの情報を取得する方法が限られている可能性があります

        } // 投稿のループを閉じる

      } catch (error) {
        console.error(`❌ Error processing rule "${rule.name}":`, error);
      }
    }

    // 遅延送信の処理（scheduled_send_atが過ぎたものを送信）
    await processScheduledReplies(threadsClient, account_id);

    console.log(`✨ Auto-reply processing complete: ${totalProcessed} replies processed`);

    return NextResponse.json({
      message: 'Auto-reply processing complete',
      processed: totalProcessed,
    });
  } catch (error) {
    console.error('Auto-reply process error:', error);
    return NextResponse.json(
      { error: 'Failed to process auto-replies' },
      { status: 500 }
    );
  }
}

/**
 * 即時送信を処理
 * @param targetId - 元の投稿のThreads ID（リプライのIDではない）
 */
async function processImmediateSend(
  threadsClient: ThreadsAPIClient,
  rule: AutoReplyRule,
  replyRecord: any,
  targetId: string
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

    let result;

    if (rule.reply_type === 'reply') {
      // リプライとして送信
      result = await threadsClient.replyToPost(targetId, replyText);
    } else if (rule.reply_type === 'quote') {
      // 引用として送信（createPostで引用）
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

    console.log(`✅ Sent ${rule.reply_type} to @${replyRecord.trigger_username}`);
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

/**
 * スケジュール済み返信を処理
 */
async function processScheduledReplies(threadsClient: ThreadsAPIClient, accountId: string) {
  const { data: scheduledReplies, error } = await supabaseAdmin
    .from('auto_replies')
    .select(`
      *,
      rule:auto_reply_rules(*),
      post:posts(*)
    `)
    .eq('account_id', accountId)
    .eq('reply_status', 'pending')
    .not('scheduled_send_at', 'is', null)
    .lte('scheduled_send_at', new Date().toISOString());

  if (error || !scheduledReplies || scheduledReplies.length === 0) {
    return;
  }

  console.log(`⏰ Processing ${scheduledReplies.length} scheduled replies`);

  for (const reply of scheduledReplies) {
    try {
      const rule = reply.rule as unknown as AutoReplyRule;
      const post = reply.post as any;

      if (!post || !post.threads_post_id) {
        console.error('❌ Post not found or not published for scheduled reply');
        continue;
      }

      await processImmediateSend(threadsClient, rule, reply, post.threads_post_id);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error processing scheduled reply:', error);
    }
  }
}
