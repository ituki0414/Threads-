import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * 自動返信用の投稿一覧を取得
 * GET /api/auto-reply/posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('account_id');
    const source = searchParams.get('source'); // recent, scheduled, auto_reply
    const search = searchParams.get('search'); // キーワード検索
    const postId = searchParams.get('post_id'); // ポストIDで検索

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    let query = supabaseAdmin
      .from('posts')
      .select('id, caption, threads_post_id, state, published_at, scheduled_at, created_at, media, metrics')
      .eq('account_id', accountId);

    // ポストIDで直接検索
    if (postId) {
      query = query.eq('threads_post_id', postId);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json({ posts: data ? [data] : [] });
    }

    // ソースによるフィルタリング
    if (source === 'recent') {
      // 直近20投稿（公開済みのみ、重複を除外）
      const { data: recentPosts, error: recentError } = await supabaseAdmin
        .from('posts')
        .select('id, caption, threads_post_id, state, published_at, scheduled_at, created_at, media, metrics')
        .eq('account_id', accountId)
        .eq('state', 'published')
        .not('threads_post_id', 'is', null)
        .order('published_at', { ascending: false });

      if (recentError) throw recentError;

      // threads_post_idでユニークにする（最新のもののみ残す）
      const uniquePosts = Array.from(
        new Map(recentPosts?.map(post => [post.threads_post_id, post]) || []).values()
      ).slice(0, 20);

      return NextResponse.json({ posts: uniquePosts });
    } else if (source === 'scheduled') {
      // 予約投稿
      query = query
        .eq('state', 'scheduled')
        .not('scheduled_at', 'is', null)
        .order('scheduled_at', { ascending: false })
        .limit(20);
    } else if (source === 'auto_reply') {
      // 自動返信で生成された投稿
      // auto_repliesテーブルから取得
      const { data: autoReplies, error: autoReplyError } = await supabaseAdmin
        .from('auto_replies')
        .select('reply_threads_id, post_id')
        .eq('account_id', accountId)
        .not('reply_threads_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (autoReplyError) throw autoReplyError;

      const threadsIds = autoReplies?.map(r => r.reply_threads_id).filter(Boolean) || [];
      if (threadsIds.length === 0) {
        return NextResponse.json({ posts: [] });
      }

      query = query.in('threads_post_id', threadsIds);
    }

    // キーワード検索
    if (search) {
      query = query.ilike('caption', `%${search}%`);
    }

    const { data: posts, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ posts: posts || [] });
  } catch (error) {
    console.error('Get posts for auto-reply error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
