-- 既存の重複投稿を削除するだけのSQL（制約は既に存在）

-- 1. 現在の制約を確認
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'posts';

-- 2. 重複投稿を確認
SELECT
  threads_post_id,
  account_id,
  COUNT(*) as duplicate_count
FROM posts
WHERE threads_post_id IS NOT NULL
GROUP BY threads_post_id, account_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 3. 重複データを削除（最新のものを残す）
DELETE FROM posts a
USING posts b
WHERE a.threads_post_id = b.threads_post_id
  AND a.account_id = b.account_id
  AND a.threads_post_id IS NOT NULL
  AND a.created_at < b.created_at;

-- 4. 削除後の確認
SELECT
  threads_post_id,
  account_id,
  COUNT(*) as count
FROM posts
WHERE threads_post_id IS NOT NULL
GROUP BY threads_post_id, account_id
HAVING COUNT(*) > 1;
