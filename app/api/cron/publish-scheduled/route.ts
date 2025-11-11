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
    // 認証トークンをチェック（セキュリティのため）
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'threadstep_cron_secret_2025';

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

        if (!post.accounts || !post.accounts.access_token) {
          throw new Error('Account access token not found');
        }

        const threadsClient = new ThreadsAPIClient(post.accounts.access_token);

        // メディアタイプを判定
        let mediaType: 'IMAGE' | 'VIDEO' | undefined;
        if (post.media && post.media.length > 0) {
          const url = post.media[0].toLowerCase();
          if (url.includes('.mp4') || url.includes('.mov') || url.includes('video')) {
            mediaType = 'VIDEO';
          } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('image')) {
            mediaType = 'IMAGE';
          }
        }

        // Threads APIで投稿
        const result = await threadsClient.createPost({
          text: post.caption,
          mediaUrl: post.media && post.media.length > 0 ? post.media[0] : undefined,
          mediaType,
        });

        // データベースを更新
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            state: 'published',
            threads_post_id: result.id,
            published_at: post.scheduled_at, // 予定時刻を使用
          })
          .eq('id', post.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`✅ Successfully published post ${post.id} as ${result.id}`);
        results.success.push(post.id);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Failed to publish post ${post.id}:`, errorMessage);

        // エラーを記録してスキップ
        results.failed.push({
          id: post.id,
          error: errorMessage,
        });

        // 失敗した投稿にエラー状態を記録（オプション）
        await supabaseAdmin
          .from('posts')
          .update({
            state: 'failed',
          })
          .eq('id', post.id);
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
