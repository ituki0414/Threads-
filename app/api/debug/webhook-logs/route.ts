import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook受信ログを確認するためのデバッグエンドポイント
 *
 * このエンドポイントは、Webhookが正しく届いているかを確認するために使用します
 * 実際の本番環境では削除またはアクセス制限をかけてください
 */

// メモリ内にログを保存（最大100件）
const webhookLogs: Array<{
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  query: Record<string, string>;
}> = [];

const MAX_LOGS = 100;

export async function GET(request: NextRequest) {
  return NextResponse.json({
    total: webhookLogs.length,
    logs: webhookLogs.slice(-20).reverse(), // 最新20件を逆順で返す
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {};

    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const query: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const log = {
      timestamp: new Date().toISOString(),
      method: 'POST',
      headers,
      body: body ? JSON.parse(body) : null,
      query,
    };

    webhookLogs.push(log);

    // ログが多すぎる場合は古いものを削除
    if (webhookLogs.length > MAX_LOGS) {
      webhookLogs.shift();
    }

    console.log('📝 Webhook log saved:', log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging webhook:', error);
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
  }
}
