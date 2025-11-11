import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // すべてのアカウントを取得
    const { data: accounts, error } = await supabaseAdmin
      .from('accounts')
      .select('id, threads_user_id, threads_username, created_at, has_access_token:access_token')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      total: accounts?.length || 0,
      accounts: accounts?.map(acc => ({
        id: acc.id,
        threads_user_id: acc.threads_user_id,
        username: acc.threads_username,
        has_access_token: !!acc.has_access_token,
        created_at: acc.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
