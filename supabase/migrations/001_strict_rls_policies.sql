-- RLSポリシーの厳格化
-- 注意: このアプリはサービスロールキーを使用するため、APIルートからのアクセスはRLSをバイパスします
-- このポリシーは、クライアントからanon keyでの直接アクセスを防ぐためのものです

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can only access their own data" ON accounts;
DROP POLICY IF EXISTS "Users can only access their own posts" ON posts;
DROP POLICY IF EXISTS "Users can only access their own inbox" ON inbox_items;
DROP POLICY IF EXISTS "Users can only access their own rules" ON rules;
DROP POLICY IF EXISTS "Users can only access their own best times" ON best_times;

-- accounts テーブル: anon key からのアクセスを完全に禁止
-- 認証はアプリケーション層で行われるため、anon key での直接アクセスは不要
CREATE POLICY "Deny all access with anon key" ON accounts
FOR ALL
TO anon
USING (false);

CREATE POLICY "Allow service role full access" ON accounts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- posts テーブル
CREATE POLICY "Deny anon access to posts" ON posts
FOR ALL
TO anon
USING (false);

CREATE POLICY "Allow service role access to posts" ON posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- inbox_items テーブル
CREATE POLICY "Deny anon access to inbox" ON inbox_items
FOR ALL
TO anon
USING (false);

CREATE POLICY "Allow service role access to inbox" ON inbox_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- rules テーブル
CREATE POLICY "Deny anon access to rules" ON rules
FOR ALL
TO anon
USING (false);

CREATE POLICY "Allow service role access to rules" ON rules
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- best_times テーブル
CREATE POLICY "Deny anon access to best_times" ON best_times
FOR ALL
TO anon
USING (false);

CREATE POLICY "Allow service role access to best_times" ON best_times
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- auto_reply_rules テーブル（存在する場合）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'auto_reply_rules') THEN
    DROP POLICY IF EXISTS "Allow all access to auto_reply_rules" ON auto_reply_rules;

    EXECUTE 'CREATE POLICY "Deny anon access to auto_reply_rules" ON auto_reply_rules
    FOR ALL
    TO anon
    USING (false)';

    EXECUTE 'CREATE POLICY "Allow service role access to auto_reply_rules" ON auto_reply_rules
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- auto_replies テーブル（存在する場合）
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'auto_replies') THEN
    DROP POLICY IF EXISTS "Allow all access to auto_replies" ON auto_replies;

    EXECUTE 'CREATE POLICY "Deny anon access to auto_replies" ON auto_replies
    FOR ALL
    TO anon
    USING (false)';

    EXECUTE 'CREATE POLICY "Allow service role access to auto_replies" ON auto_replies
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true)';
  END IF;
END $$;

-- 追加のセキュリティ: ストレージバケットへのアクセス制限
-- メディアバケットは認証されたユーザーのみアクセス可能に
-- 注意: Supabaseダッシュボードで手動で設定が必要な場合があります

COMMENT ON TABLE accounts IS 'Protected by RLS - anon key access denied';
COMMENT ON TABLE posts IS 'Protected by RLS - anon key access denied';
COMMENT ON TABLE inbox_items IS 'Protected by RLS - anon key access denied';
COMMENT ON TABLE rules IS 'Protected by RLS - anon key access denied';
COMMENT ON TABLE best_times IS 'Protected by RLS - anon key access denied';
