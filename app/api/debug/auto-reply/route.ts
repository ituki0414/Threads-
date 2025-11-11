import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account_id = searchParams.get('account_id');

    if (!account_id) {
      return NextResponse.json({ error: 'account_id required' }, { status: 400 });
    }

    // アカウント情報
    const { data: account } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('id', account_id)
      .single();

    // 自動返信ルール
    const { data: rules } = await supabaseAdmin
      .from('auto_reply_rules')
      .select('*')
      .eq('account_id', account_id);

    // 最近の投稿
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('account_id', account_id)
      .eq('state', 'published')
      .not('threads_post_id', 'is', null)
      .order('published_at', { ascending: false })
      .limit(5);

    // 自動返信履歴
    const { data: autoReplies } = await supabaseAdmin
      .from('auto_replies')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      account: {
        id: account?.id,
        username: account?.username,
        has_access_token: !!account?.access_token,
      },
      rules: rules?.map(r => ({
        id: r.id,
        name: r.name,
        is_active: r.is_active,
        target_post_id: r.target_post_id,
        // Trigger settings
        trigger_reply: r.trigger_reply,
        trigger_repost: r.trigger_repost,
        trigger_quote: r.trigger_quote,
        trigger_like: r.trigger_like,
        // Keyword settings
        keywords: r.keywords,
        keyword_condition: r.keyword_condition,
        keyword_match_type: r.keyword_match_type,
        // Reply settings
        reply_type: r.reply_type,
        reply_text: r.reply_text,
        // Timing settings
        timing_type: r.timing_type,
        delay_minutes: r.delay_minutes,
        like_threshold: r.like_threshold,
      })),
      posts: posts?.map(p => ({
        id: p.id,
        threads_post_id: p.threads_post_id,
        caption: p.caption?.substring(0, 50),
        published_at: p.published_at,
      })),
      auto_replies: autoReplies?.map(ar => ({
        id: ar.id,
        rule_id: ar.rule_id,
        trigger_text: ar.trigger_text,
        original_text: ar.original_text,
        reply_text: ar.reply_text,
        reply_status: ar.reply_status,
        created_at: ar.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
