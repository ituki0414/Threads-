-- posts テーブルに 'processing' 状態を追加
-- Cronジョブの競合対策用

-- 既存の CHECK 制約を削除
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_state_check;

-- 新しい CHECK 制約を追加（'processing' 状態を含む）
ALTER TABLE posts ADD CONSTRAINT posts_state_check
  CHECK (state IN ('published', 'scheduled', 'draft', 'needs_approval', 'failed', 'processing'));

-- processing 状態のインデックスを追加（stuck 検出用）
CREATE INDEX IF NOT EXISTS idx_posts_processing ON posts(updated_at) WHERE state = 'processing';

COMMENT ON COLUMN posts.state IS 'Post state: published, scheduled, draft, needs_approval, failed, processing (temporary during cron job)';
