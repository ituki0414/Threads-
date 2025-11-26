import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

/**
 * 認証・認可ユーティリティ
 * すべてのAPIルートで統一的な認証チェックを提供
 */

export interface AuthResult {
  success: true;
  accountId: string;
  account: {
    id: string;
    threads_user_id: string;
    threads_username: string;
    access_token: string;
    token_expires_at: string;
  };
}

export interface AuthError {
  success: false;
  error: string;
  status: 401 | 403;
}

export type AuthResponse = AuthResult | AuthError;

/**
 * Cookieから認証済みaccount_idを取得し、存在を検証
 * すべてのAPIルートで使用する主要な認証関数
 */
export async function getAuthenticatedAccount(): Promise<AuthResponse> {
  try {
    const cookieStore = cookies();
    const accountId = cookieStore.get('account_id')?.value;

    if (!accountId) {
      return {
        success: false,
        error: 'Unauthorized - No session found',
        status: 401,
      };
    }

    // UUID形式の検証
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(accountId)) {
      return {
        success: false,
        error: 'Unauthorized - Invalid session',
        status: 401,
      };
    }

    // アカウントの存在確認
    const { data: account, error } = await supabaseAdmin
      .from('accounts')
      .select('id, threads_user_id, threads_username, access_token, token_expires_at')
      .eq('id', accountId)
      .single();

    if (error || !account) {
      return {
        success: false,
        error: 'Unauthorized - Account not found',
        status: 401,
      };
    }

    // トークンの有効期限チェック
    if (new Date(account.token_expires_at) < new Date()) {
      return {
        success: false,
        error: 'Unauthorized - Session expired',
        status: 401,
      };
    }

    return {
      success: true,
      accountId: account.id,
      account,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Unauthorized - Authentication failed',
      status: 401,
    };
  }
}

/**
 * リクエストボディのaccount_idが認証済みアカウントと一致するか検証
 * POSTリクエストでbodyにaccount_idが含まれる場合に使用
 */
export async function verifyAccountOwnership(
  requestAccountId: string | null | undefined
): Promise<AuthResponse> {
  const authResult = await getAuthenticatedAccount();

  if (!authResult.success) {
    return authResult;
  }

  // リクエストのaccount_idが指定されている場合、一致するか検証
  if (requestAccountId && requestAccountId !== authResult.accountId) {
    return {
      success: false,
      error: 'Forbidden - Account mismatch',
      status: 403,
    };
  }

  return authResult;
}

/**
 * リソースの所有権を検証（投稿、ルールなど）
 */
export async function verifyResourceOwnership(
  table: string,
  resourceId: string,
  authAccountId: string
): Promise<{ owned: boolean; resource?: Record<string, unknown> }> {
  try {
    const { data: resource, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .eq('id', resourceId)
      .single();

    if (error || !resource) {
      return { owned: false };
    }

    // account_idカラムがある場合は所有権チェック
    if ('account_id' in resource && resource.account_id !== authAccountId) {
      return { owned: false };
    }

    return { owned: true, resource };
  } catch {
    return { owned: false };
  }
}

/**
 * 認証エラーのレスポンスを生成
 */
export function createAuthErrorResponse(authError: AuthError): NextResponse {
  return NextResponse.json(
    { error: authError.error },
    { status: authError.status }
  );
}

/**
 * 認証が必要なAPIルートのラッパー
 * 使用例:
 * export async function GET(request: NextRequest) {
 *   return withAuth(async (auth) => {
 *     // auth.accountId, auth.account が使用可能
 *     return NextResponse.json({ data: ... });
 *   });
 * }
 */
export async function withAuth(
  handler: (auth: AuthResult) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await getAuthenticatedAccount();

  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  return handler(authResult);
}
