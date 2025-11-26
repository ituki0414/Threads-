/**
 * 本番環境対応ロガー
 * 環境変数でログレベルを制御
 * 本番環境では機密情報を除去
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

// ログレベルの優先度
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 環境設定
const isProduction = process.env.NODE_ENV === 'production';
const configuredLevel = (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')) as LogLevel;
const minLevel = LOG_LEVELS[configuredLevel] || 0;

// 機密フィールドのリスト
const SENSITIVE_FIELDS = [
  'access_token',
  'token',
  'password',
  'secret',
  'api_key',
  'apiKey',
  'authorization',
  'cookie',
];

/**
 * 機密情報をマスク
 */
function sanitizeContext(context: LogContext): LogContext {
  const sanitized: LogContext = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeContext(value as LogContext);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * ログメッセージをフォーマット
 */
function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitizeContext(context) : undefined;

  if (isProduction) {
    // 本番環境: JSON形式
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(sanitizedContext && { context: sanitizedContext }),
    });
  }

  // 開発環境: 読みやすい形式
  const emoji = {
    debug: '🔍',
    info: '📝',
    warn: '⚠️',
    error: '❌',
  }[level];

  let output = `${emoji} [${timestamp}] ${message}`;
  if (sanitizedContext) {
    output += `\n   Context: ${JSON.stringify(sanitizedContext, null, 2)}`;
  }

  return output;
}

/**
 * ログを出力
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
  if (LOG_LEVELS[level] < minLevel) {
    return;
  }

  const formattedMessage = formatMessage(level, message, context);

  switch (level) {
    case 'debug':
    case 'info':
      console.log(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
      console.error(formattedMessage);
      break;
  }
}

/**
 * ロガーオブジェクト
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  // エラーオブジェクトを含むエラーログ
  logError: (message: string, error: unknown, context?: LogContext) => {
    const errorInfo: LogContext = {
      ...context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: isProduction ? undefined : error.stack,
            }
          : String(error),
    };
    log('error', message, errorInfo);
  },

  // APIリクエストのログ
  apiRequest: (method: string, path: string, context?: LogContext) => {
    log('info', `API ${method} ${path}`, context);
  },

  // APIレスポンスのログ
  apiResponse: (method: string, path: string, status: number, durationMs?: number) => {
    log('info', `API ${method} ${path} - ${status}`, { durationMs });
  },
};

export default logger;
