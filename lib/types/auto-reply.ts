/**
 * 自動返信ルールの型定義
 */

export interface AutoReplyRule {
  id: string;
  account_id: string;

  // 1. 基本情報
  name: string;

  // 2. 返信対象の投稿
  target_post_id: string | null;
  target_post_source: 'recent' | 'search' | 'scheduled' | 'auto_reply';

  // 3. トリガー設定
  trigger_reply: boolean;
  trigger_repost: boolean;
  trigger_quote: boolean;
  trigger_like: boolean;

  // 3-a. キーワード条件
  keyword_condition: 'all' | 'any' | 'none' | null;
  keywords: string[];
  keyword_match_type: 'exact' | 'partial' | null;

  // 3-d. ハッシュタグ条件
  hashtag_filter: boolean;
  hashtags: string[];

  // 4. 追加フィルター
  filter_start_date: string | null;
  filter_end_date: string | null;

  // 5. 送信タイミング
  timing_type: 'immediate' | 'delayed' | 'like_threshold';
  delay_minutes: number | null;
  like_threshold: number | null;

  // 6. 返信の種類
  reply_type: 'reply' | 'none';

  // 7. 返信内容
  reply_text: string | null;
  reply_media_url: string | null;
  reply_media_type: 'image' | 'video' | null;
  enable_lottery: boolean;
  lottery_id: string | null;

  // 管理情報
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutoReply {
  id: string;
  account_id: string;
  rule_id: string;
  post_id: string | null;

  // トリガー情報
  trigger_type: 'reply' | 'repost' | 'quote' | 'like';
  trigger_user_id: string;
  trigger_username: string;
  trigger_text: string | null;
  trigger_threads_id: string;

  // 返信情報
  reply_status: 'pending' | 'waiting_likes' | 'sent' | 'failed';
  reply_text: string | null;
  reply_threads_id: string | null;
  scheduled_send_at: string | null;
  sent_at: string | null;
  error_message: string | null;

  created_at: string;
}

export interface AutoReplyRuleFormData {
  // 1. 基本情報
  name: string;

  // 2. 返信対象の投稿
  target_post_id: string | null;
  target_post_source: 'recent' | 'search' | 'scheduled' | 'auto_reply';

  // 3. トリガー設定
  trigger_reply: boolean;
  trigger_repost: boolean;
  trigger_quote: boolean;
  trigger_like: boolean;

  // 3-a. キーワード条件
  keyword_condition: 'all' | 'any' | 'none';
  keywords: string[];
  keyword_match_type: 'exact' | 'partial';

  // 3-d. ハッシュタグ条件
  hashtag_filter: boolean;
  hashtags: string[];

  // 4. 追加フィルター
  filter_start_date: string | null;
  filter_end_date: string | null;

  // 5. 送信タイミング
  timing_type: 'immediate' | 'delayed' | 'like_threshold';
  delay_minutes: number | null;
  like_threshold: number | null;

  // 6. 返信の種類
  reply_type: 'reply' | 'none';

  // 7. 返信内容
  reply_text: string;
  reply_media_url: string | null;
  reply_media_type: 'image' | 'video' | null;
  enable_lottery: boolean;
  lottery_id: string | null;

  // 管理情報
  is_active: boolean;
}
