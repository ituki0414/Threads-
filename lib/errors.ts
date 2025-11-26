import { NextResponse } from 'next/server';
import { logger } from './logger';

/**
 * 統一されたエラーハンドリング
 * すべてのAPIルートで一貫したエラーレスポンスを提供
 */

// カスタムエラークラス
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// よく使うエラー
export class BadRequestError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, message, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(429, 'Too many requests', 'RATE_LIMIT', { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR');
    this.name = 'InternalError';
  }
}

// エラーレスポンスの型
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

/**
 * エラーをNextResponseに変換
 */
export function createErrorResponse(error: unknown): NextResponse<ErrorResponse> {
  // AppErrorの場合
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  // 標準Errorの場合
  if (error instanceof Error) {
    // Supabaseエラーの処理
    if ('code' in error) {
      const supabaseError = error as Error & { code: string };

      // よくあるSupabaseエラーコードの処理
      switch (supabaseError.code) {
        case '23505': // unique_violation
          return NextResponse.json(
            { error: { message: 'Resource already exists', code: 'DUPLICATE' } },
            { status: 409 }
          );
        case '23503': // foreign_key_violation
          return NextResponse.json(
            { error: { message: 'Referenced resource not found', code: 'REFERENCE_ERROR' } },
            { status: 400 }
          );
        case 'PGRST116': // not found (single row expected)
          return NextResponse.json(
            { error: { message: 'Resource not found', code: 'NOT_FOUND' } },
            { status: 404 }
          );
      }
    }

    // その他のエラー
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      {
        error: {
          message: isProduction ? 'An unexpected error occurred' : error.message,
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }

  // 不明なエラー
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  );
}

/**
 * APIルートのエラーハンドリングラッパー
 * 使用例:
 * export async function GET(request: NextRequest) {
 *   return handleApiError(async () => {
 *     // 処理
 *     return NextResponse.json({ data: ... });
 *   });
 * }
 */
export async function handleApiError<T>(
  handler: () => Promise<NextResponse<T>>,
  context?: { method?: string; path?: string }
): Promise<NextResponse<T | ErrorResponse>> {
  try {
    return await handler();
  } catch (error) {
    // ログ記録
    logger.logError(
      `API Error${context ? ` [${context.method} ${context.path}]` : ''}`,
      error
    );

    return createErrorResponse(error);
  }
}

/**
 * エラーを安全に文字列化
 */
export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}
