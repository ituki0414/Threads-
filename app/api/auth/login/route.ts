import { NextResponse } from 'next/server';
import { getThreadsAuthUrl } from '@/lib/threads-api';

/**
 * Threads OAuth認証を開始
 * GET /api/auth/login
 */
export async function GET() {
  const redirectUri = process.env.NEXT_PUBLIC_THREADS_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
  const authUrl = getThreadsAuthUrl(redirectUri);

  return NextResponse.redirect(authUrl);
}
