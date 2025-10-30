# Threads API セットアップ手順

## 🚨 現在の問題

エラー: **「セキュアではないログインがブロックされました」**

原因: `http://localhost:3000` がHTTPSではないため、Meta OAuth認証が拒否されています。

---

## 🔧 解決方法（3つのオプション）

### オプション1: Meta for Developers で開発モードを有効化（推奨）

1. **Meta for Developers**にアクセス: https://developers.facebook.com/apps/601122372860281/settings/basic/

2. **アプリモード**を「開発モード」に設定
   - 現在のモード確認: 画面上部の「App Mode」
   - 「Development」になっているか確認

3. **Threads設定**を開く:
   - 左側メニュー → **Products** → **Threads**
   - または: https://developers.facebook.com/apps/601122372860281/threads/settings/

4. **OAuth リダイレクトURI**に以下を追加:
   ```
   http://localhost:3000/api/auth/callback
   ```
   ⚠️ HTTPSではなく**HTTP**で追加

5. **デバイス設定**（もしあれば）:
   - 「Settings」→「Advanced」→「Client OAuth Settings」
   - 「Allow HTTP for Development」をONにする

6. **変更を保存**

---

### オプション2: ngrokでHTTPSトンネルを使う（即座に解決）

localhostをHTTPSで公開するツールを使います。

#### 手順:

1. **ngrokをインストール**:
   ```bash
   brew install ngrok
   # または
   npm install -g ngrok
   ```

2. **ngrokでトンネルを作成**:
   ```bash
   ngrok http 3000
   ```

3. **ngrokが提供するHTTPS URL**をコピー（例: `https://abc123.ngrok.io`）

4. **.env.local を更新**:
   ```env
   NEXT_PUBLIC_THREADS_REDIRECT_URI=https://abc123.ngrok.io/api/auth/callback
   ```

5. **Meta for Developers のリダイレクトURIを更新**:
   - https://developers.facebook.com/apps/601122372860281/threads/settings/
   - リダイレクトURIに追加: `https://abc123.ngrok.io/api/auth/callback`

6. **サーバーを再起動**して、ngrokのURLにアクセス:
   ```
   https://abc123.ngrok.io/api/auth/login
   ```

---

### オプション3: 本番環境（Vercel）にデプロイ

開発中は大変なので、後回し推奨。

---

## 🎯 推奨アクション

**まずはオプション2（ngrok）を試してください。**

理由:
- ✅ 即座に解決
- ✅ 設定変更が最小限
- ✅ Meta側の設定も不要かもしれない

### ngrok セットアップコマンド:

```bash
# 1. ngrokをインストール
brew install ngrok

# 2. Next.jsサーバーが起動している状態で、別のターミナルで実行
ngrok http 3000

# 3. 表示されたHTTPS URLをコピー（例: https://abc123.ngrok.io）
```

ngrokが起動したら、表示されたHTTPS URLを教えてください。
そのURLで`.env.local`を更新します。

---

## 📝 Meta for Developers チェックリスト

以下を確認してください:

1. **アプリモード**: 開発モード（Development）
2. **アプリの種類**: Consumer
3. **Threads 製品**: 追加済み
4. **リダイレクトURI**:
   - ✅ `http://localhost:3000/api/auth/callback`（HTTP）
   - または ✅ `https://YOUR_NGROK_URL/api/auth/callback`（HTTPS）

5. **権限（Permissions）**:
   - ✅ `threads_basic`
   - ✅ `threads_content_publish`
   - ✅ `threads_manage_insights`
   - ✅ `threads_manage_replies`
   - ✅ `threads_read_replies`

---

ngrokをインストールして起動するか、Meta for Developersの設定を確認してみてください！
