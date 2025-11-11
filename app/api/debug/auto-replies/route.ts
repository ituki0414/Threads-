import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const account_id = searchParams.get('account_id');

    if (!account_id) {
      return NextResponse.json({ error: 'account_id required' }, { status: 400 });
    }

    // 自動返信履歴を取得
    const { data: autoReplies, error } = await supabaseAdmin
      .from('auto_replies')
      .select('*')
      .eq('account_id', account_id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      total: autoReplies?.length || 0,
      auto_replies: autoReplies?.map(ar => ({
        id: ar.id,
        rule_id: ar.rule_id,
        trigger_text: ar.trigger_text,
        trigger_username: ar.trigger_username,
        trigger_threads_id: ar.trigger_threads_id,
        reply_text: ar.reply_text,
        reply_status: ar.reply_status,
        reply_threads_id: ar.reply_threads_id,
        error_message: ar.error_message,
        created_at: ar.created_at,
        sent_at: ar.sent_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
