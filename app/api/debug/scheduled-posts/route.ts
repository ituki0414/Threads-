import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // 最新の予約済み投稿を5件取得
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, caption, scheduled_at, created_at, state')
    .eq('state', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // デバッグ情報を整形
  const debugInfo = posts?.map(post => ({
    id: post.id,
    caption: post.caption?.substring(0, 50) + '...',
    scheduled_at_raw: post.scheduled_at,
    scheduled_at_type: typeof post.scheduled_at,
    created_at_raw: post.created_at,
    parsed_scheduled: post.scheduled_at ? new Date(post.scheduled_at).toString() : null,
  }));

  return NextResponse.json({
    posts: debugInfo,
    count: posts?.length || 0,
  });
}
