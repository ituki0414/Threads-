/**
 * アプリケーション全体で使用する定数
 */

// ===== API制限 =====
export const API_LIMITS = {
  MAX_POSTS: 500,
  RATE_LIMIT_DELAY: 1000, // 1秒
  REPLY_PUBLISH_DELAY: 1500, // 1.5秒
  SYNC_INTERVAL: 5 * 60 * 1000, // 5分
  METRICS_SYNC_INTERVAL: 10 * 60 * 1000, // 10分
} as const;

// ===== データベース定数 =====
export const DB_CONSTANTS = {
  POST_STATES: {
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    FAILED: 'failed',
    PENDING: 'pending',
    SENT: 'sent',
  },
  REPLY_STATUS: {
    PENDING: 'pending',
    SENT: 'sent',
    FAILED: 'failed',
  },
  TRIGGER_TYPES: {
    REPLY: 'reply',
    MENTION: 'mention',
  },
} as const;

// ===== PostgreSQLエラーコード =====
export const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
} as const;

// ===== 投稿フィールド定義 =====
export const POST_SELECT_FIELDS = 'id, account_id, threads_post_id, state, caption, media, published_at, scheduled_at, slot_quality, created_at, retry_count, error_message, permalink, metrics';

// ===== Threads API定数 =====
export const THREADS_API = {
  BASE_URL: 'https://graph.threads.net/v1.0',
  AUTH_URL: 'https://threads.net/oauth/authorize',
  TOKEN_URL: 'https://graph.threads.net/oauth/access_token',
  SCOPES: 'threads_basic,threads_content_publish,threads_manage_insights,threads_manage_replies,threads_read_replies',
  TOKEN_EXCHANGE_URL: 'https://graph.threads.net/access_token',
} as const;

// ===== メディアタイプ =====
export const MEDIA_TYPES = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  CAROUSEL_ALBUM: 'CAROUSEL_ALBUM',
  TEXT_POST: 'TEXT_POST',
} as const;

// ===== エンゲージメントメトリクス =====
export const METRIC_NAMES = {
  VIEWS: 'views',
  LIKES: 'likes',
  REPLIES: 'replies',
  REPOSTS: 'reposts',
  QUOTES: 'quotes',
  COMMENTS: 'comments',
} as const;
