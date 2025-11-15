# Cron設定ガイド - 予約投稿の自動実行

## 📋 概要

予約投稿を**指定時刻ぴったり**に投稿するため、外部Cronサービスを**1分間隔**で実行します。

**注意**: Vercelの無料プランでは1日1回のCronのみ対応のため、外部サービスを使用します。

## 🚀 セットアップ方法（1分間隔で完璧に投稿）

### 1. cron-job.orgに登録

1. https://cron-job.org にアクセス
2. 無料アカウントを作成（メールアドレスのみ）
3. メール認証を完了

### 2. Cronジョブを作成（1分間隔）

#### 基本設定:
- **Title**: `ThreadStep - 予約投稿の自動実行（1分間隔）`
- **URL**: `https://threadstep.vercel.app/api/cron/publish-scheduled`
- **Schedule**: **Advanced (cron-style)**
  - **Cron式**: `* * * * *` （毎分実行）

#### 認証設定:
- **Request Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer threadstep_cron_secret_2025
  ```

#### 通知設定:
- **Notifications**: 失敗時のみメール通知を有効化

### 3. 動作確認

1. Cronジョブを保存して有効化
2. 5分待って「Execution History」を確認
3. ステータスが`200 OK`であることを確認

## 🔍 トラブルシューティング

### 401 Unauthorized エラー

**原因**: Authorizationヘッダーが間違っている

**解決方法**:
```
Authorization: Bearer threadstep_cron_secret_2025
```
を正確にコピーしてください（`Bearer`の後にスペースが必要）

### 500 Server Error

**原因**: アプリケーション内部エラー

**解決方法**:
1. Vercel Dashboard → プロジェクト → Functions
2. `/api/cron/publish-scheduled`のログを確認
3. エラーメッセージを確認して修正

### Cronが実行されない

**原因**: cron-job.orgでジョブが無効化されている

**解決方法**:
1. cron-job.orgにログイン
2. ジョブのステータスを確認
3. 無効化されている場合は「Enable」をクリック

## 📊 代替サービス

### 他の無料Cronサービス:

1. **EasyCron** (https://www.easycron.com)
   - 無料プラン: 100実行/日
   - 最短間隔: 5分

2. **Cronly** (https://cronly.app)
   - 無料プラン: 50実行/日
   - 最短間隔: 1分

3. **SetCronJob** (https://www.setcronjob.com)
   - 無料プラン: 無制限
   - 最短間隔: 5分

## 🔒 セキュリティ

現在のCRON_SECRET: `threadstep_cron_secret_2025`

**本番環境では必ず変更してください**:

```bash
# Vercel環境変数を更新
vercel env add CRON_SECRET production
# 新しいシークレットを入力: ランダムな文字列を推奨
```

## 📝 ログ確認

### Vercel Logs:
```bash
vercel logs --follow
```

### 成功ログの例:
```
🕐 [2025-01-15T12:00:00.000Z] Checking for scheduled posts to publish...
📋 Found 3 posts to publish
📤 Publishing post abc123 (scheduled for 2025-01-15T12:00:00.000Z)
✅ Successfully published post abc123 as th_456789
   Permalink: https://www.threads.net/@username/post/th_456789
✅ Cron job completed: 3 published, 0 failed
```

### 失敗ログの例:
```
❌ Failed to publish post abc123: Network timeout
⏳ Retry 1/3: Keeping post abc123 as 'scheduled'
```

## 🎯 推奨設定

**実行間隔**: **1分ごと（毎分）**
- **Cron式**: `* * * * *`
- **投稿精度**: 予約時刻から最大1分以内
- **例**: 14:23に予約 → 14:23〜14:24の間に投稿
- **無料プラン**: cron-job.orgの無料プランで対応可能

### 従来の5分間隔との比較

| 設定 | 最大遅延 | 投稿精度 | おすすめ度 |
|------|---------|---------|-----------|
| **1分間隔** (新) | 1分 | ⭐⭐⭐⭐⭐ | ✅ 推奨 |
| 5分間隔 (旧) | 5分 | ⭐⭐⭐ | ❌ 非推奨 |

## ✅ チェックリスト

- [ ] cron-job.orgアカウント作成完了
- [ ] Cronジョブ作成完了
- [ ] Authorizationヘッダー設定完了
- [ ] 動作確認完了（200 OKレスポンス）
- [ ] 失敗時の通知設定完了
- [ ] 予約投稿でテスト完了
