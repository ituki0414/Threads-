-- auto_repliesテーブルにreply_idのUNIQUE制約を追加
-- 同じリプライに対して複数回返信することを防ぐ

-- 既存の重複データを削除（最新のものを残す）
DELETE FROM auto_replies a
USING auto_replies b
WHERE a.reply_id = b.reply_id
  AND a.created_at < b.created_at;

-- UNIQUE制約を追加
ALTER TABLE auto_replies
ADD CONSTRAINT auto_replies_reply_id_unique UNIQUE (reply_id);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_auto_replies_reply_id
ON auto_replies (reply_id);

-- 確認用クエリ
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'auto_replies';
