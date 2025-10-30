import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ThreadsAPIClient } from '@/lib/threads-api';
import { cookies } from 'next/headers';

/**
 * 投稿一覧を取得
 * GET /api/posts
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accountId = cookieStore.get('account_id')?.value;

    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Supabaseから投稿一覧を取得
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

/**
 * 投稿を作成（即時投稿 or 予約投稿）
 * POST /api/posts
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accountId = cookieStore.get('account_id')?.value;

    if (!accountId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { caption, media = [], scheduled_at, publish_now = false } = body;

    // アカウント情報を取得
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 即時投稿の場合
    if (publish_now) {
      const threadsClient = new ThreadsAPIClient(account.access_token);

      // メディアタイプを判定（URLから拡張子を取得）
      let mediaType: 'IMAGE' | 'VIDEO' | undefined;
      if (media[0]) {
        const url = media[0].toLowerCase();
        if (url.includes('.mp4') || url.includes('.mov') || url.includes('video')) {
          mediaType = 'VIDEO';
        } else if (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('image')) {
          mediaType = 'IMAGE';
        }
      }

      // Threads APIで投稿
      const result = await threadsClient.createPost({
        text: caption,
        mediaUrl: media[0], // 最初の1つのみ対応
        mediaType,
      });

      // Supabaseに保存
      const { data: post, error: insertError } = await supabaseAdmin
        .from('posts')
        .insert({
          account_id: accountId,
          threads_post_id: result.id,
          state: 'published',
          caption,
          media,
          published_at: new Date().toISOString(),
          scheduled_at: null,
          slot_quality: null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return NextResponse.json({ post });
    }

    // 予約投稿の場合
    const { data: post, error: insertError } = await supabaseAdmin
      .from('posts')
      .insert({
        account_id: accountId,
        threads_post_id: null,
        state: 'scheduled',
        caption,
        media,
        scheduled_at: scheduled_at || null,
        published_at: null,
        slot_quality: null, // TODO: BestTimeから計算
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
