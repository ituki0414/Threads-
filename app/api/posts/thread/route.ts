import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { cookies } from 'next/headers';

/**
 * スレッド投稿を作成
 * POST /api/posts/thread
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { posts, scheduled_at, publish_now, account_id } = body;

    // リクエストボディから account_id を取得（LocalStorage対応）
    const accountId = account_id;

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    if (!posts || !Array.isArray(posts) || posts.length === 0) {
      return NextResponse.json(
        { error: 'Posts array is required' },
        { status: 400 }
      );
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

    // 即時投稿の場合
    if (publish_now) {
      const threadsClient = new ThreadsAPIClient(account.access_token);

      // メディアURLとタイプを準備
      const threadPosts = posts.map((post: any) => {
        let mediaType: 'IMAGE' | 'VIDEO' | undefined;
        if (post.media && post.media[0]) {
          const url = post.media[0].toLowerCase();
          if (url.includes('.mp4') || url.includes('.mov') || url.includes('video')) {
            mediaType = 'VIDEO';
          } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('image')) {
            mediaType = 'IMAGE';
          }
        }

        return {
          text: post.caption,
          mediaUrl: post.media[0],
          mediaType,
        };
      });

      // スレッド投稿を実行
      const result = await threadsClient.createThread(threadPosts);

      // Supabaseに各投稿を保存
      const savedPosts = await Promise.all(
        posts.map(async (post: any, index: number) => {
          const { data: savedPost, error: insertError } = await supabaseAdmin
            .from('posts')
            .insert({
              account_id: accountId,
              threads_post_id: result.ids[index],
              state: 'published',
              caption: post.caption,
              media: post.media || [],
              published_at: new Date().toISOString(),
              scheduled_at: null,
              slot_quality: null,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Insert error for post:', insertError);
          }

          return savedPost;
        })
      );

      return NextResponse.json({
        thread: {
          ids: result.ids,
          posts: savedPosts,
        },
      });
    }

    // 予約投稿の場合
    const savedPosts = await Promise.all(
      posts.map(async (post: any, index: number) => {
        const { data: savedPost, error: insertError } = await supabaseAdmin
          .from('posts')
          .insert({
            account_id: accountId,
            threads_post_id: null,
            state: 'scheduled',
            caption: post.caption,
            media: post.media || [],
            scheduled_at: scheduled_at || null,
            published_at: null,
            slot_quality: null,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        return savedPost;
      })
    );

    return NextResponse.json({
      thread: {
        posts: savedPosts,
      },
    });
  } catch (error) {
    console.error('Create thread error:', error);
    return NextResponse.json(
      { error: 'Failed to create thread' },
      { status: 500 }
    );
  }
}
