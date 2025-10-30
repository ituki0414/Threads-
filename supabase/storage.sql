-- Supabase Storage バケット作成

-- メディアファイル用のストレージバケット
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシー: 全ユーザーがアップロード可能
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- ストレージポリシー: 全ユーザーが読み取り可能（publicバケットなので不要だが念のため）
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- ストレージポリシー: 自分のファイルのみ削除可能
CREATE POLICY "Allow delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND auth.uid()::text = owner);
