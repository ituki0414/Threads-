-- postsテーブルにthreads_post_idとaccount_idの組み合わせでUNIQUE制約を追加
-- 同じThreads投稿が同じアカウントで重複することを防ぐ

-- 既存の重複データを削除（最新のものを残す）
DELETE FROM posts a
USING posts b
WHERE a.threads_post_id = b.threads_post_id
  AND a.account_id = b.account_id
  AND a.threads_post_id IS NOT NULL
  AND a.created_at < b.created_at;

-- UNIQUE制約を追加
ALTER TABLE posts
ADD CONSTRAINT posts_threads_post_id_account_id_unique UNIQUE (threads_post_id, account_id);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_posts_threads_post_id_account_id
ON posts (threads_post_id, account_id) WHERE threads_post_id IS NOT NULL;

-- 確認用クエリ
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'posts';
