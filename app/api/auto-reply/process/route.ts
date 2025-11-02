import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';

/**
 * 自動返信を処理
 * POST /api/auto-reply/process
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id } = body;

    if (!account_id) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    console.log('🤖 Starting auto-reply processing...');

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

    // 公開済みの投稿を取得
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('account_id', account_id)
      .eq('state', 'published')
      .not('threads_post_id', 'is', null)
      .order('published_at', { ascending: false })
      .limit(10); // 最新10件のみ処理

    if (postsError) {
      throw postsError;
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        message: 'No published posts to check',
        processed: 0,
      });
    }

    console.log(`📝 Checking ${posts.length} recent posts for replies...`);

    let totalReplies = 0;
    let processedReplies = 0;

    // 各投稿のリプライをチェック
    for (const post of posts) {
      try {
        // 投稿へのリプライを取得
        const replies = await threadsClient.getReplies(post.threads_post_id);

        if (replies.length === 0) {
          continue;
        }

        console.log(`💬 Post ${post.threads_post_id}: ${replies.length} replies`);
        totalReplies += replies.length;

        for (const reply of replies) {
          // 既に返信済みかチェック
          const { data: existingReply } = await supabaseAdmin
            .from('auto_replies')
            .select('id')
            .eq('reply_id', reply.id)
            .single();

          if (existingReply) {
            continue; // 既に処理済み
          }

          // 各ルールに対してマッチングチェック
          for (const rule of rules) {
            let shouldReply = false;

            if (rule.trigger_type === 'all') {
              shouldReply = true;
            } else if (rule.trigger_type === 'keywords') {
              // キーワードマッチング
              const keywords = rule.trigger_keywords || [];
              shouldReply = keywords.some((keyword: string) =>
                reply.text.toLowerCase().includes(keyword.toLowerCase())
              );
            }

            if (shouldReply) {
              console.log(`✅ Matched rule: "${rule.name}" for reply: "${reply.text.substring(0, 30)}..."`);

              try {
                // テンプレートに変数を差し込む
                let replyText = rule.reply_template;
                replyText = replyText.replace(/\{username\}/g, reply.username);
                replyText = replyText.replace(/\{original_text\}/g, reply.text);

                // 返信を投稿
                const result = await threadsClient.replyToPost(reply.id, replyText);

                // 返信履歴を保存
                await supabaseAdmin.from('auto_replies').insert({
                  account_id: account_id,
                  rule_id: rule.id,
                  post_id: post.id,
                  reply_id: reply.id,
                  reply_text: replyText,
                  threads_reply_id: result.id,
                  original_text: reply.text,
                  original_username: reply.username,
                });

                processedReplies++;
                console.log(`📤 Auto-replied to ${reply.username}`);

                // API rate limitを避けるため、少し待機
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 最初にマッチしたルールで返信したら、次のルールはスキップ
                break;
              } catch (error) {
                console.error(`❌ Failed to auto-reply:`, error);
              }
            }
          }
        }

        // API rate limitを避けるため、投稿間で少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error processing post ${post.threads_post_id}:`, error);
      }
    }

    console.log(`✨ Auto-reply processing complete: ${processedReplies}/${totalReplies} replies processed`);

    return NextResponse.json({
      message: 'Auto-reply processing complete',
      total_replies: totalReplies,
      processed: processedReplies,
    });
  } catch (error) {
    console.error('Auto-reply process error:', error);
    return NextResponse.json(
      { error: 'Failed to process auto-replies' },
      { status: 500 }
    );
  }
}
