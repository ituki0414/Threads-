-- 自動返信ルールテーブル
CREATE TABLE IF NOT EXISTS auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('all', 'keywords')),
  trigger_keywords TEXT[] DEFAULT '{}',
  reply_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自動返信履歴テーブル
CREATE TABLE IF NOT EXISTS auto_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES auto_reply_rules(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  reply_id TEXT NOT NULL, -- Threads APIのリプライID
  reply_text TEXT NOT NULL,
  threads_reply_id TEXT, -- 自動返信したThreads投稿ID
  original_text TEXT,
  original_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_account_id ON auto_reply_rules(account_id);
CREATE INDEX IF NOT EXISTS idx_auto_reply_rules_is_active ON auto_reply_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_auto_replies_account_id ON auto_replies(account_id);
CREATE INDEX IF NOT EXISTS idx_auto_replies_rule_id ON auto_replies(rule_id);
CREATE INDEX IF NOT EXISTS idx_auto_replies_reply_id ON auto_replies(reply_id);
CREATE INDEX IF NOT EXISTS idx_auto_replies_created_at ON auto_replies(created_at);

-- RLS (Row Level Security) ポリシー
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replies ENABLE ROW LEVEL SECURITY;

-- 自動返信ルールのポリシー
CREATE POLICY "Users can view their own auto-reply rules" ON auto_reply_rules
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own auto-reply rules" ON auto_reply_rules
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own auto-reply rules" ON auto_reply_rules
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete their own auto-reply rules" ON auto_reply_rules
  FOR DELETE USING (true);

-- 自動返信履歴のポリシー
CREATE POLICY "Users can view their own auto-replies" ON auto_replies
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own auto-replies" ON auto_replies
  FOR INSERT WITH CHECK (true);

-- コメント
COMMENT ON TABLE auto_reply_rules IS '自動返信ルール設定';
COMMENT ON TABLE auto_replies IS '自動返信の実行履歴';
COMMENT ON COLUMN auto_reply_rules.trigger_type IS 'トリガータイプ: all（すべて）, keywords（キーワード）';
COMMENT ON COLUMN auto_reply_rules.trigger_keywords IS 'トリガーとなるキーワード配列';
COMMENT ON COLUMN auto_reply_rules.reply_template IS '返信テンプレート（変数: {username}, {original_text}）';
