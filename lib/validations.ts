import { z } from 'zod';

/**
 * 入力バリデーションスキーマ
 * すべてのAPIリクエストで使用する共通のバリデーション
 */

// 基本的なID検証
export const uuidSchema = z.string().uuid('Invalid UUID format');

// 投稿作成スキーマ
export const createPostSchema = z.object({
  caption: z
    .string()
    .max(500, 'Caption must be 500 characters or less')
    .transform(val => sanitizeHtml(val)),
  media: z
    .array(z.string().url('Invalid media URL'))
    .max(10, 'Maximum 10 media items allowed')
    .optional()
    .default([]),
  threads: z.any().optional().nullable(),
  scheduled_at: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  publish_now: z.boolean().optional().default(false),
  account_id: z.string().optional(),
});

// スレッド投稿スキーマ
export const createThreadSchema = z.object({
  posts: z
    .array(
      z.object({
        caption: z
          .string()
          .max(500, 'Caption must be 500 characters or less')
          .transform(val => sanitizeHtml(val)),
        media: z
          .array(z.string().url('Invalid media URL'))
          .max(10, 'Maximum 10 media items allowed')
          .optional()
          .default([]),
      })
    )
    .min(1, 'At least one post is required')
    .max(10, 'Maximum 10 posts in a thread'),
  scheduled_at: z
    .string()
    .datetime({ message: 'Invalid date format' })
    .optional()
    .nullable(),
  publish_now: z.boolean().optional().default(false),
  account_id: z.string().optional(),
});

// 自動返信ルール作成スキーマ
export const createAutoReplyRuleSchema = z.object({
  account_id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(val => sanitizeHtml(val)),
  trigger_type: z.enum(['dm', 'comment', 'reply', 'repost', 'quote', 'like']).optional(),
  trigger_keywords: z
    .array(
      z
        .string()
        .max(50, 'Keyword must be 50 characters or less')
        .transform(val => sanitizeHtml(val))
    )
    .max(20, 'Maximum 20 keywords allowed')
    .optional()
    .default([]),
  reply_template: z
    .string()
    .max(500, 'Reply template must be 500 characters or less')
    .transform(val => sanitizeHtml(val))
    .optional(),
  is_active: z.boolean().optional().default(true),
});

// 自動返信ルール更新スキーマ
export const updateAutoReplyRuleSchema = z.object({
  id: uuidSchema,
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(val => sanitizeHtml(val))
    .optional(),
  trigger_type: z.enum(['dm', 'comment', 'reply', 'repost', 'quote', 'like']).optional(),
  trigger_keywords: z
    .array(
      z
        .string()
        .max(50, 'Keyword must be 50 characters or less')
        .transform(val => sanitizeHtml(val))
    )
    .max(20, 'Maximum 20 keywords allowed')
    .optional(),
  reply_template: z
    .string()
    .max(500, 'Reply template must be 500 characters or less')
    .transform(val => sanitizeHtml(val))
    .optional(),
  is_active: z.boolean().optional(),
});

// 自動返信ルールV2スキーマ
export const createAutoReplyRuleV2Schema = z.object({
  account_id: z.string().optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .transform(val => sanitizeHtml(val)),
  trigger_reply: z.boolean().optional().default(false),
  trigger_repost: z.boolean().optional().default(false),
  trigger_quote: z.boolean().optional().default(false),
  trigger_like: z.boolean().optional().default(false),
  reply_type: z.enum(['none', 'reply', 'quote', 'dm']).optional().default('reply'),
  reply_text: z
    .string()
    .max(500, 'Reply text must be 500 characters or less')
    .transform(val => sanitizeHtml(val))
    .optional(),
  reply_media_url: z.string().url('Invalid media URL').optional().nullable(),
  reply_media_type: z.enum(['IMAGE', 'VIDEO']).optional().nullable(),
  target_post_id: uuidSchema.optional().nullable(),
  keywords: z
    .array(
      z
        .string()
        .max(50, 'Keyword must be 50 characters or less')
        .transform(val => sanitizeHtml(val))
    )
    .max(20, 'Maximum 20 keywords allowed')
    .optional()
    .default([]),
  keyword_condition: z.enum(['any', 'all', 'none']).optional().default('any'),
  keyword_match_type: z.enum(['partial', 'exact']).optional().default('partial'),
  timing_type: z.enum(['immediate', 'delayed', 'like_threshold']).optional().default('immediate'),
  delay_minutes: z.number().int().min(0).max(1440).optional().default(0),
  like_threshold: z.number().int().min(0).max(10000).optional().default(0),
  filter_start_date: z.string().datetime().optional().nullable(),
  filter_end_date: z.string().datetime().optional().nullable(),
  is_active: z.boolean().optional().default(true),
}).refine(
  data => data.trigger_reply || data.trigger_repost || data.trigger_quote || data.trigger_like,
  { message: 'At least one trigger is required' }
);

// ファイルアップロードスキーマ
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    file => file.size <= 100 * 1024 * 1024,
    'File size must be 100MB or less'
  ),
  account_id: z.string().optional(),
});

// 許可されるMIMEタイプ
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
] as const;

/**
 * HTMLタグを除去してXSSを防止
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';

  return input
    // HTMLタグを除去
    .replace(/<[^>]*>/g, '')
    // 特殊文字をエスケープ
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    // 制御文字を除去
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * バリデーションエラーをフォーマット
 */
export function formatValidationErrors(error: z.ZodError): string {
  return error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
}

/**
 * リクエストボディをバリデート
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        error: formatValidationErrors(result.error),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch {
    return {
      success: false,
      error: 'Invalid JSON body',
    };
  }
}

// 型エクスポート
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreateAutoReplyRuleInput = z.infer<typeof createAutoReplyRuleSchema>;
export type UpdateAutoReplyRuleInput = z.infer<typeof updateAutoReplyRuleSchema>;
export type CreateAutoReplyRuleV2Input = z.infer<typeof createAutoReplyRuleV2Schema>;
