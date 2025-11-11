import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhookのテスト用エンドポイント
 * 実際のWebhookイベントと同じ形式でテストできる
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🧪 Webhook Test Event:', JSON.stringify(body, null, 2));

    // Webhook URLにリクエストを転送
    const webhookUrl = `${request.nextUrl.origin}/api/webhooks/threads`;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    return NextResponse.json({
      message: 'Test webhook sent',
      webhook_url: webhookUrl,
      status: response.status,
      result,
    });
  } catch (error: any) {
    console.error('Test webhook error:', error);
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Webhookの検証トークン確認
 */
export async function GET(request: NextRequest) {
  const verifyToken = process.env.THREADS_WEBHOOK_VERIFY_TOKEN;

  return NextResponse.json({
    webhook_url: 'https://atnoise.jp/api/webhooks/threads',
    verify_token: verifyToken,
    app_id: process.env.THREADS_APP_ID,
    instructions: {
      1: 'Go to Meta Developer Console: https://developers.facebook.com/apps',
      2: `Open your app (ID: ${process.env.THREADS_APP_ID})`,
      3: 'Go to Webhooks section',
      4: 'Add webhook URL: https://atnoise.jp/api/webhooks/threads',
      5: `Use verify token: ${verifyToken}`,
      6: 'Subscribe to: mentions, replies',
    },
  });
}
