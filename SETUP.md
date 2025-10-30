# ThreadStep - セットアップガイド

## 🚀 Threads API + Supabase統合セットアップ

### 1️⃣ Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にアクセス
2. 「New Project」をクリック
3. プロジェクト名を入力（例: `threadstep`）
4. データベースパスワードを設定
5. リージョンを選択（推奨: `Northeast Asia (Tokyo)`）
6. 「Create new project」をクリック

### 2️⃣ データベーススキーマの作成

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `/Users/itsukiokamoto/threadstep/supabase/schema.sql`の内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック
4. 成功すると5つのテーブルが作成される:
   - `accounts`
   - `posts`
   - `inbox_items`
   - `rules`
   - `best_times`

### 2️⃣-2 ストレージバケットの作成

1. Supabaseダッシュボードで「Storage」を開く
2. 「SQL Editor」に戻り、`/Users/itsukiokamoto/threadstep/supabase/storage.sql`の内容をコピー
3. SQL Editorに貼り付けて「Run」をクリック
4. 成功すると`media`バケットが作成される（画像・動画アップロード用）

### 3️⃣ Supabase認証情報の取得

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`（使わない）
   - **service_role key**: `eyJhbGc...`（重要！秘密にする）

### 4️⃣ 環境変数の設定

`.env.local`ファイルを編集:

```env
# Threads API
THREADS_APP_ID=601122372860281
THREADS_APP_SECRET=4a227761b5bbcc3cdcf49132edb0c325
NEXT_PUBLIC_THREADS_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...（ここにservice_role keyを貼り付け）
```

### 5️⃣ Threads App設定の確認

1. [Meta for Developers](https://developers.facebook.com/apps/)にアクセス
2. アプリ ID `601122372860281` を選択
3. 「Threads」タブを開く
4. **リダイレクトURI**に以下を追加:
   ```
   http://localhost:3000/api/auth/callback
   ```
5. **権限**を確認（以下が必要）:
   - `threads_basic`
   - `threads_content_publish`
   - `threads_manage_insights`
   - `threads_manage_replies`
   - `threads_read_replies`

### 6️⃣ 開発サーバーの起動

```bash
cd /Users/itsukiokamoto/threadstep
npm run dev
```

サーバーが起動したら: `http://localhost:3000`

---

## 🔐 初回ログインフロー

### Step 1: Threads連携
1. `http://localhost:3000/api/auth/login`にアクセス
2. Threadsの認証画面にリダイレクトされる
3. 「許可」をクリック
4. アプリに戻ってくる（`/?connected=true`）

### Step 2: 確認
1. ブラウザの開発者ツールを開く
2. Application → Cookies → `account_id`があればOK
3. Supabaseダッシュボードで「Table Editor」→「accounts」を開く
4. 自分のアカウント情報が保存されているか確認

---

## 📝 実装された機能

### ✅ Threads API連携
- OAuth認証フロー
- 投稿作成（即時投稿）
- 画像・動画付き投稿
- 投稿一覧取得
- インサイト取得
- 返信投稿

### ✅ データ永続化
- Supabaseでの投稿管理
- 予約投稿の保存
- ルール設定の保存
- ベストタイムの保存
- Supabase Storageでのメディアファイル管理

### ✅ メディアアップロード
- ドラッグ&ドロップ対応
- 画像・動画プレビュー
- ファイルサイズ・個数制限
- Supabase Storageへのアップロード
- 公開URL生成

### ⏳ 未実装（次のステップ）
- 予約投稿の自動実行（Cron Job）
- 受信箱のリアルタイム同期
- ルールエンジンの実装
- Yes検知の自動実行

---

## 🧪 テスト方法

### 1. 即時投稿のテスト

Composerページ（`http://localhost:3000/composer`）で:
1. 投稿本文を入力
2. 「今すぐ投稿」ボタンをクリック
3. Threadsアプリで投稿が表示されるか確認
4. Supabaseの`posts`テーブルに保存されるか確認

### 2. 画像・動画投稿のテスト

Composerページで:
1. 投稿本文を入力
2. 画像または動画をアップロード（ドラッグ&ドロップ または クリックで選択）
3. プレビューが表示されることを確認
4. 「今すぐ投稿」ボタンをクリック
5. アップロード中の表示が出ることを確認
6. Threadsアプリで画像・動画付き投稿が表示されるか確認
7. Supabaseの`storage/media`バケットにファイルが保存されるか確認

**制限事項:**
- 最大10ファイルまで
- 1ファイル100MBまで
- 対応形式: JPEG, PNG, GIF, WebP, MP4, MOV
- Threads APIは1投稿につき1つのメディアのみ対応

### 3. 予約投稿のテスト

Composerページで:
1. 投稿本文を入力
2. 日時を選択
3. 「予約する」ボタンをクリック
4. Calendarページで予約が表示されるか確認
5. Supabaseの`posts`テーブルで`state='scheduled'`か確認

---

## 🐛 トラブルシューティング

### エラー: "Unauthorized"
- `.env.local`の`THREADS_APP_ID`と`THREADS_APP_SECRET`を確認
- `/api/auth/login`で再ログイン

### エラー: "Database error"
- Supabaseの`schema.sql`が正しく実行されたか確認
- `SUPABASE_SERVICE_ROLE_KEY`が正しいか確認

### エラー: "Failed to create post"
- Threadsのアクセストークンが有効か確認（60日間有効）
- 投稿本文が空でないか確認
- Meta for DevelopersでThreads APIが有効か確認

### 予約投稿が実行されない
- Cron Jobがまだ実装されていません
- 次のステップで実装予定

---

## 📚 次のステップ

### 優先度: 高
1. **Cron Job実装**: 予約投稿を自動実行
2. **受信箱同期**: ThreadsからDM/コメントを取得
3. **ルールエンジン**: 自動返信ロジック

### 優先度: 中
4. **Yes検知**: キーワード検出の実装
5. **シークレットリプライ**: 実際のDM送信
6. **エンゲージメント分析**: インサイトの定期取得

### 優先度: 低
7. **複数アカウント対応**
8. **チーム機能**
9. **Webhook統合**: リアルタイム通知

---

## 🔗 参考リンク

- [Threads API Documentation](https://developers.facebook.com/docs/threads)
- [Supabase Documentation](https://supabase.com/docs)
- [Meta for Developers](https://developers.facebook.com/)
