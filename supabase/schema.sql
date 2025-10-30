-- ThreadStep Database Schema

-- アカウントテーブル
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  threads_user_id TEXT NOT NULL UNIQUE,
  threads_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 投稿テーブル
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  threads_post_id TEXT,
  state TEXT NOT NULL CHECK (state IN ('published', 'scheduled', 'draft', 'needs_approval', 'failed')),
  caption TEXT NOT NULL,
  media TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  slot_quality TEXT CHECK (slot_quality IN ('best', 'normal', 'avoid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 受信箱アイテムテーブル
CREATE TABLE IF NOT EXISTS inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  threads_item_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('dm', 'comment')),
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  text TEXT NOT NULL,
  ts TIMESTAMP WITH TIME ZONE NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  flags TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  auto_reply_scheduled TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ルールテーブル
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL CHECK (trigger IN ('dm', 'comment')),
  conditions JSONB NOT NULL DEFAULT '{}',
  action JSONB NOT NULL,
  auto BOOLEAN DEFAULT FALSE,
  cooldown_s INTEGER DEFAULT 3600,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ベストタイムテーブル
CREATE TABLE IF NOT EXISTS best_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, weekday, hour)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_posts_account_id ON posts(account_id);
CREATE INDEX IF NOT EXISTS idx_posts_state ON posts(state);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at) WHERE state = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_inbox_items_account_id ON inbox_items(account_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_is_approved ON inbox_items(is_approved);
CREATE INDEX IF NOT EXISTS idx_rules_account_id ON rules(account_id);
CREATE INDEX IF NOT EXISTS idx_rules_is_active ON rules(is_active);
CREATE INDEX IF NOT EXISTS idx_best_times_account_id ON best_times(account_id);

-- トリガー: updated_atを自動更新
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inbox_items_updated_at BEFORE UPDATE ON inbox_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_best_times_updated_at BEFORE UPDATE ON best_times
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) を有効化
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE best_times ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（サービスロールキーを使う場合は不要だが、念のため）
-- ユーザーは自分のアカウントのデータのみアクセス可能
CREATE POLICY "Users can only access their own data" ON accounts
FOR ALL USING (true); -- サービスロールキー使用時は全アクセス許可

CREATE POLICY "Users can only access their own posts" ON posts
FOR ALL USING (true);

CREATE POLICY "Users can only access their own inbox" ON inbox_items
FOR ALL USING (true);

CREATE POLICY "Users can only access their own rules" ON rules
FOR ALL USING (true);

CREATE POLICY "Users can only access their own best times" ON best_times
FOR ALL USING (true);
