import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { cookies } from 'next/headers';

/**
 * Threads APIから投稿を同期
 * POST /api/posts/sync
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accountId = cookieStore.get('account_id')?.value;

    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // アカウント情報を取得
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Threads APIから投稿一覧を取得
    const threadsClient = new ThreadsAPIClient(account.access_token);
    const threadsPosts = await threadsClient.getPosts(50); // 最大50件取得

    console.log(`📥 Fetched ${threadsPosts.length} posts from Threads API`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const threadsPost of threadsPosts) {
      // 既存の投稿を確認
      const { data: existingPost } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('threads_post_id', threadsPost.id)
        .eq('account_id', accountId)
        .single();

      if (existingPost) {
        skippedCount++;
        continue; // 既に存在する場合はスキップ
      }

      // メディア情報を処理
      const mediaUrls: string[] = [];

      // カルーセルの場合は子要素から取得
      if (threadsPost.media_type === 'CAROUSEL_ALBUM' && threadsPost.children?.data) {
        for (const child of threadsPost.children.data) {
          if (child.media_type === 'VIDEO' && child.thumbnail_url) {
            mediaUrls.push(child.thumbnail_url); // 動画のサムネイル
          } else if (child.media_url) {
            mediaUrls.push(child.media_url); // 画像
          }
        }
      } else {
        // 単一メディアの場合
        if (threadsPost.media_type === 'VIDEO' && threadsPost.thumbnail_url) {
          mediaUrls.push(threadsPost.thumbnail_url); // 動画のサムネイル
        } else if (threadsPost.media_url) {
          mediaUrls.push(threadsPost.media_url); // 画像
        }
      }

      // 新しい投稿をデータベースに保存
      const { error: insertError } = await supabaseAdmin
        .from('posts')
        .insert({
          account_id: accountId,
          threads_post_id: threadsPost.id,
          state: 'published',
          caption: threadsPost.text || '', // 空の投稿の場合は空文字列
          media: mediaUrls,
          published_at: threadsPost.timestamp,
          scheduled_at: null,
          slot_quality: null,
        });

      if (insertError) {
        console.error('❌ Failed to insert post:', threadsPost.id, insertError);
      } else {
        syncedCount++;
        console.log('✅ Synced post:', threadsPost.id);
      }
    }

    console.log(`✨ Sync complete: ${syncedCount} new, ${skippedCount} existing`);

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      total: threadsPosts.length,
    });
  } catch (error) {
    console.error('Sync posts error:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync posts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
