import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getLongLivedToken, ThreadsAPIClient } from '@/lib/threads-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Threads OAuth コールバック
 * GET /api/auth/callback?code=xxx
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // エラーハンドリング
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_code', baseUrl)
    );
  }

  try {
    const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

    // 1. 認証コードをアクセストークンに交換
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    // 2. 短期トークンを長期トークンに交換（60日間有効）
    const longLivedToken = await getLongLivedToken(tokenData.access_token);

    // 3. ユーザー情報を取得
    const threadsClient = new ThreadsAPIClient(longLivedToken.access_token);
    const user = await threadsClient.getUser();

    // 4. Supabaseにアカウント情報を保存
    const expiresAt = new Date(Date.now() + longLivedToken.expires_in * 1000);

    const { data: account, error: dbError } = await supabaseAdmin
      .from('accounts')
      .upsert({
        threads_user_id: user.id,
        threads_username: user.username,
        access_token: longLivedToken.access_token,
        token_expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'threads_user_id',  // 重複時はthreads_user_idで判断してUPDATE
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.redirect(
        new URL('/?error=database_error', baseUrl)
      );
    }

    // 5. アカウントIDをURLパラメータで渡す（LocalStorageに保存させるため）
    const response = NextResponse.redirect(new URL(`/?connected=true&account_id=${account.id}`, baseUrl));

    console.log('✅ Redirecting with account ID:', { accountId: account.id, baseUrl });

    return response;
  } catch (err) {
    console.error('Auth callback error:', err);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(String(err))}`, baseUrl)
    );
  }
}
