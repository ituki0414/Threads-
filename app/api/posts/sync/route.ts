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
    // リクエストボディから account_id を取得（Cookieの代わり）
    const body = await request.json().catch(() => ({}));
    const accountId = body.account_id;

    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized: account_id is required' }, { status: 401 });
    }

    console.log('🔄 Syncing posts for account:', accountId);

    // アカウント情報を取得
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Threads APIから投稿一覧を取得（すべての投稿）
    const threadsClient = new ThreadsAPIClient(account.access_token);
    const threadsPosts = await threadsClient.getPosts(); // ページネーションですべて取得

    console.log(`📥 Fetched ${threadsPosts.length} posts from Threads API (all pages)`);

    // スレッド投稿をグループ化（親投稿に子投稿を結合）
    const postsMap = new Map<string, typeof threadsPosts[0] & { threadTexts?: string[] }>();
    const replyPosts = new Set<string>();

    // まず全投稿をマップに追加
    for (const post of threadsPosts) {
      postsMap.set(post.id, { ...post, threadTexts: [] });
      if (post.is_reply || post.reply_to_id) {
        replyPosts.add(post.id);
      }
    }

    // リプライ投稿を親投稿に結合
    for (const post of threadsPosts) {
      if (post.reply_to_id && postsMap.has(post.reply_to_id)) {
        const parentPost = postsMap.get(post.reply_to_id)!;
        if (!parentPost.threadTexts) parentPost.threadTexts = [];
        parentPost.threadTexts.push(post.text || '');
      }
    }

    console.log(`🔗 Found ${replyPosts.size} reply posts`);

    let syncedCount = 0;
    let skippedCount = 0;

    for (const threadsPost of threadsPosts) {
      // リプライ投稿は個別に保存しない（親投稿に含まれる）
      if (replyPosts.has(threadsPost.id)) {
        skippedCount++;
        continue;
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

      // 既存の投稿を確認（最初の1件のみ）
      const { data: existingPosts } = await supabaseAdmin
        .from('posts')
        .select('id')
        .eq('threads_post_id', threadsPost.id)
        .eq('account_id', accountId)
        .limit(1);

      const existingPost = existingPosts?.[0];

      if (existingPost) {
        // 既存の投稿を更新（メディア、パーマリンク、キャプションを最新に）
        const { error: updateError } = await supabaseAdmin
          .from('posts')
          .update({
            permalink: threadsPost.permalink,
            caption: threadsPost.text || '',
            media: mediaUrls,
            published_at: threadsPost.timestamp,
          })
          .eq('id', existingPost.id);

        if (updateError) {
          console.error('❌ Failed to update post:', threadsPost.id, updateError);
        } else {
          skippedCount++;
          console.log('🔄 Updated existing post:', threadsPost.id);
        }
      } else {
        // 新しい投稿をデータベースに保存
        const { error: insertError } = await supabaseAdmin
          .from('posts')
          .insert({
            account_id: accountId,
            threads_post_id: threadsPost.id,
            permalink: threadsPost.permalink,
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
          console.log('✅ Synced new post:', threadsPost.id);
        }
      }
    }

    console.log(`✨ Sync complete: ${syncedCount} new, ${skippedCount} existing`);

    // Threadsから削除された投稿を検知して削除
    console.log('🗑️  Checking for deleted posts...');

    // DB内の公開済み投稿を取得
    const { data: dbPosts } = await supabaseAdmin
      .from('posts')
      .select('id, threads_post_id')
      .eq('account_id', accountId)
      .eq('state', 'published')
      .not('threads_post_id', 'is', null);

    if (dbPosts && dbPosts.length > 0) {
      // Threads APIから取得した投稿IDのセット
      const threadsPostIds = new Set(threadsPosts.map(p => p.id));

      // DB内にあるがThreadsに存在しない投稿を検出
      const deletedPosts = dbPosts.filter(
        post => !threadsPostIds.has(post.threads_post_id!)
      );

      if (deletedPosts.length > 0) {
        console.log(`🗑️  Found ${deletedPosts.length} deleted posts on Threads`);

        // 削除された投稿をDBから削除
        const deletedIds = deletedPosts.map(p => p.id);
        const { error: deleteError } = await supabaseAdmin
          .from('posts')
          .delete()
          .in('id', deletedIds);

        if (deleteError) {
          console.error('❌ Failed to delete posts:', deleteError);
        } else {
          console.log(`✅ Deleted ${deletedPosts.length} posts from database`);
        }
      } else {
        console.log('✅ No deleted posts found');
      }
    }

    return NextResponse.json({
      success: true,
      synced: syncedCount,
      skipped: skippedCount,
      deleted: dbPosts ? dbPosts.filter(post => !threadsPosts.some(tp => tp.id === post.threads_post_id)).length : 0,
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
