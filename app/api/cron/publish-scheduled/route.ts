import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';

/**
 * 予約投稿を自動公開するCronエンドポイント
 * GET /api/cron/publish-scheduled
 *
 * Vercel Cronまたは外部cronサービスから1分ごとに呼び出される想定
 * scheduled_atが現在時刻以前の投稿を自動公開する
 */
export async function GET(request: NextRequest) {
  try {
    // Vercel Cronからのリクエストを検証
    // Vercel Cronは自動的にauthorizationヘッダーを送信します
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // 本番環境ではCRON_SECRETをチェック、開発環境ではスキップ
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('❌ Unauthorized cron request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date().toISOString();
    console.log(`🕐 [${now}] Checking for scheduled posts to publish...`);

    // 公開すべき予約投稿を取得（scheduled_at <= 現在時刻）
    const { data: scheduledPosts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*, accounts(*)')
      .eq('state', 'scheduled')
      .not('scheduled_at', 'is', null)
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(50); // 一度に最大50件

    if (fetchError) {
      console.error('❌ Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      console.log('✅ No scheduled posts to publish');
      return NextResponse.json({
        success: true,
        published: 0,
        message: 'No posts to publish'
      });
    }

    console.log(`📋 Found ${scheduledPosts.length} posts to publish`);

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // 各投稿を公開
    for (const post of scheduledPosts) {
      try {
        console.log(`📤 Publishing post ${post.id} (scheduled for ${post.scheduled_at})`);
        console.log(`   Retry count: ${post.retry_count || 0}/3`);

        if (!post.accounts || !post.accounts.access_token) {
          throw new Error('Account access token not found');
        }

        const threadsClient = new ThreadsAPIClient(post.accounts.access_token);

        let threadsPostId: string;
        let permalink: string | undefined;

        // メディアがある場合
        if (post.media && post.media.length > 0) {
          // カルーセル投稿（複数メディア）
          if (post.media.length > 1) {
            const childIds: string[] = [];

            for (const mediaUrl of post.media) {
              const mediaType = mediaUrl.toLowerCase().match(/\.(mp4|mov)$/) ? 'VIDEO' : 'IMAGE';
              const childContainer = await threadsClient.createMediaContainer({
                mediaUrl,
                mediaType,
                isCarouselItem: true,
              });
              childIds.push(childContainer.id);
            }

            const carouselContainer = await threadsClient.createCarouselContainer({
              text: post.caption,
              children: childIds,
            });

            const published = await threadsClient.publishContainer(carouselContainer.id);
            threadsPostId = published.id;
            permalink = published.permalink;
          } else {
            // 単一メディア投稿
            const mediaUrl = post.media[0];
            const mediaType = mediaUrl.toLowerCase().match(/\.(mp4|mov)$/) ? 'VIDEO' : 'IMAGE';

            const result = await threadsClient.createPost({
              text: post.caption,
              mediaUrl,
              mediaType,
            });
            threadsPostId = result.id;
            permalink = result.permalink;
          }
        } else {
          // テキストのみ投稿
          const result = await threadsClient.createPost({
            text: post.caption,
          });
          threadsPostId = result.id;
          permalink = result.permalink;
        }

        // データベースを更新（公開済みに変更）
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            state: 'published',
            threads_post_id: threadsPostId,
            permalink: permalink,
            published_at: post.scheduled_at, // 予定時刻を使用
            retry_count: 0, // 成功したらリセット
            error_message: null, // エラーメッセージをクリア
          })
          .eq('id', post.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Successfully published post ${post.id} as ${threadsPostId}`);
        console.log(`   Permalink: ${permalink}`);
        results.success.push(post.id);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to publish post ${post.id}:`, errorMessage);
        console.error(`   Full error:`, error);

        const currentRetryCount = post.retry_count || 0;

        // エラーを記録
        results.failed.push({
          id: post.id,
          error: errorMessage,
        });

        // 5xx エラーやネットワークエラーの場合は再試行可能
        const isRetryableError =
          errorMessage.includes('5xx') ||
          errorMessage.includes('Server Error') ||
          errorMessage.includes('fetch failed') ||
          errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('ETIMEDOUT') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('network');

        // 最大3回まで再試行
        if (isRetryableError && currentRetryCount < 3) {
          console.log(`⏳ Retry ${currentRetryCount + 1}/3: Keeping post ${post.id} as 'scheduled'`);

          // retry_countをインクリメント（一時的エラーメッセージも保存）
          await supabaseAdmin
            .from('posts')
            .update({
              retry_count: currentRetryCount + 1,
              error_message: `Retry ${currentRetryCount + 1}/3: ${errorMessage}`,
            })
            .eq('id', post.id);
        } else {
          // 再試行回数超過または永続的エラー
          const failureReason = isRetryableError
            ? `最大リトライ回数(3回)を超過: ${errorMessage}`
            : `永続的エラー: ${errorMessage}`;

          console.log(`❌ Marking post ${post.id} as 'failed': ${failureReason}`);

          // 失敗状態に変更してエラーメッセージを保存
          await supabaseAdmin
            .from('posts')
            .update({
              state: 'failed',
              retry_count: currentRetryCount + 1,
              error_message: failureReason,
            })
            .eq('id', post.id);
        }
      }
    }

    console.log(`✅ Cron job completed: ${results.success.length} published, ${results.failed.length} failed`);

    return NextResponse.json({
      success: true,
      published: results.success.length,
      failed: results.failed.length,
      results,
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
