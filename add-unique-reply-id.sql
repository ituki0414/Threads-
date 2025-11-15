-- auto_repliesテーブルにtrigger_threads_idのUNIQUE制約を追加
-- 同じリプライに対して複数回返信することを防ぐ

-- 既存の重複データを削除（最新のものを残す）
DELETE FROM auto_replies a
USING auto_replies b
WHERE a.trigger_threads_id = b.trigger_threads_id
  AND a.created_at < b.created_at;

-- UNIQUE制約を追加
ALTER TABLE auto_replies
ADD CONSTRAINT auto_replies_trigger_threads_id_unique UNIQUE (trigger_threads_id);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_auto_replies_trigger_threads_id
ON auto_replies (trigger_threads_id);

-- 確認用クエリ
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'auto_replies';
