-- 既存のテーブルを削除（必要に応じて）
DROP TABLE IF EXISTS auto_replies CASCADE;
DROP TABLE IF EXISTS auto_reply_rules CASCADE;

-- 自動返信ルールテーブル（新仕様）
CREATE TABLE auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,

  -- 1. 基本情報
  name TEXT NOT NULL, -- 管理用の名前（例：2025-11-01_100いいね到達_自動返信）

  -- 2. 返信対象の投稿
  target_post_id UUID REFERENCES posts(id) ON DELETE CASCADE, -- 紐付ける投稿
  target_post_source TEXT NOT NULL CHECK (target_post_source IN ('recent', 'search', 'scheduled', 'auto_reply')), -- 投稿の選択元

  -- 3. トリガー設定
  trigger_reply BOOLEAN DEFAULT false, -- リプライをトリガーにする
  trigger_repost BOOLEAN DEFAULT false, -- リポストをトリガーにする
  trigger_quote BOOLEAN DEFAULT false, -- 引用をトリガーにする
  trigger_like BOOLEAN DEFAULT false, -- いいねをトリガーにする

  -- 3-a. キーワード条件
  keyword_condition TEXT CHECK (keyword_condition IN ('all', 'any', 'none')), -- すべて一致/いずれか一致/なし
  keywords TEXT[] DEFAULT '{}', -- キーワードリスト
  keyword_match_type TEXT CHECK (keyword_match_type IN ('exact', 'partial')), -- 完全一致/部分一致

  -- 3-d. ハッシュタグ条件
  hashtag_filter BOOLEAN DEFAULT false, -- ハッシュタグフィルターを使う
  hashtags TEXT[] DEFAULT '{}', -- ハッシュタグリスト

  -- 4. 追加フィルター
  filter_start_date TIMESTAMP WITH TIME ZONE, -- 有効期間開始
  filter_end_date TIMESTAMP WITH TIME ZONE, -- 有効期間終了

  -- 5. 送信タイミング
  timing_type TEXT NOT NULL CHECK (timing_type IN ('immediate', 'delayed', 'like_threshold')), -- 即時/遅延/いいね数条件
  delay_minutes INTEGER, -- 遅延時間（分）
  like_threshold INTEGER, -- いいね数の閾値

  -- 6. 返信の種類
  reply_type TEXT NOT NULL CHECK (reply_type IN ('reply', 'quote', 'none')), -- リプライ/引用/返信なし

  -- 7. 返信内容
  reply_text TEXT, -- 返信テキスト
  reply_media_url TEXT, -- 添付メディアURL（1つまで）
  reply_media_type TEXT CHECK (reply_media_type IN ('image', 'video')), -- メディアタイプ
  enable_lottery BOOLEAN DEFAULT false, -- 抽選を有効にする
  lottery_id UUID, -- 抽選ID（別テーブル参照、未実装）

  -- 管理情報
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自動返信履歴テーブル（新仕様）
CREATE TABLE auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES auto_reply_rules(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- 元の投稿

  -- トリガー情報
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('reply', 'repost', 'quote', 'like')), -- トリガーの種類
  trigger_user_id TEXT NOT NULL, -- アクションしたユーザーのThreads ID
  trigger_username TEXT NOT NULL, -- アクションしたユーザー名
  trigger_text TEXT, -- リプライ/引用の場合のテキスト
  trigger_threads_id TEXT NOT NULL, -- トリガーとなったThreads投稿ID

  -- 返信情報
  reply_status TEXT NOT NULL CHECK (reply_status IN ('pending', 'waiting_likes', 'sent', 'failed')), -- 送信ステータス
  reply_text TEXT, -- 送信した返信テキスト
  reply_threads_id TEXT, -- 送信したThreads投稿ID
  scheduled_send_at TIMESTAMP WITH TIME ZONE, -- 送信予定日時（遅延の場合）
  sent_at TIMESTAMP WITH TIME ZONE, -- 実際の送信日時
  error_message TEXT, -- エラーメッセージ

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_auto_reply_rules_account_id ON auto_reply_rules(account_id);
CREATE INDEX idx_auto_reply_rules_target_post_id ON auto_reply_rules(target_post_id);
CREATE INDEX idx_auto_reply_rules_is_active ON auto_reply_rules(is_active);
CREATE INDEX idx_auto_replies_account_id ON auto_replies(account_id);
CREATE INDEX idx_auto_replies_rule_id ON auto_replies(rule_id);
CREATE INDEX idx_auto_replies_trigger_threads_id ON auto_replies(trigger_threads_id);
CREATE INDEX idx_auto_replies_reply_status ON auto_replies(reply_status);
CREATE INDEX idx_auto_replies_scheduled_send_at ON auto_replies(scheduled_send_at);
CREATE INDEX idx_auto_replies_created_at ON auto_replies(created_at);

-- RLS (Row Level Security) ポリシー
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own auto-reply rules" ON auto_reply_rules
  FOR ALL USING (true);

CREATE POLICY "Users can manage their own auto-replies" ON auto_replies
  FOR ALL USING (true);

-- コメント
COMMENT ON TABLE auto_reply_rules IS '自動返信ルール設定（新仕様）';
COMMENT ON TABLE auto_replies IS '自動返信の実行履歴（新仕様）';

COMMENT ON COLUMN auto_reply_rules.target_post_source IS '投稿の選択元: recent(直近20投稿), search(検索), scheduled(予約投稿), auto_reply(自動返信)';
COMMENT ON COLUMN auto_reply_rules.keyword_condition IS 'キーワード条件: all(すべて一致), any(いずれか一致), none(なし)';
COMMENT ON COLUMN auto_reply_rules.keyword_match_type IS 'キーワード一致パターン: exact(完全一致), partial(部分一致)';
COMMENT ON COLUMN auto_reply_rules.timing_type IS '送信タイミング: immediate(即時), delayed(遅延), like_threshold(いいね数条件)';
COMMENT ON COLUMN auto_reply_rules.reply_type IS '返信の種類: reply(リプライ), quote(引用), none(返信なし)';
COMMENT ON COLUMN auto_replies.reply_status IS '送信ステータス: pending(待機中), waiting_likes(いいね待ち), sent(送信済み), failed(失敗)';
