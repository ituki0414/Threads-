# ThreadStep 要件定義書

**プロジェクト名**: ThreadStep
**バージョン**: 1.0.0
**作成日**: 2025年11月26日
**最終更新日**: 2025年11月26日

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [目的と目標](#2-目的と目標)
3. [スコープ](#3-スコープ)
4. [ステークホルダー](#4-ステークホルダー)
5. [機能要件](#5-機能要件)
6. [非機能要件](#6-非機能要件)
7. [システムアーキテクチャ](#7-システムアーキテクチャ)
8. [データベース設計](#8-データベース設計)
9. [API設計](#9-api設計)
10. [UI/UX要件](#10-uiux要件)
11. [セキュリティ要件](#11-セキュリティ要件)
12. [外部サービス連携](#12-外部サービス連携)
13. [運用要件](#13-運用要件)
14. [制約事項](#14-制約事項)
15. [用語集](#15-用語集)

---

## 1. プロジェクト概要

### 1.1 プロジェクト名
**ThreadStep** - Threads運用を最短化するSocial Media Manager

### 1.2 概要説明
ThreadStepは、Meta社が提供するSNS「Threads」の投稿管理・スケジューリング・自動返信機能を備えたSNS運用支援Webアプリケーションです。Threads APIとSupabaseを活用し、効率的なソーシャルメディア運用を実現します。

### 1.3 ビジョン
「Threads運用における時間と労力を最小化し、クリエイターやビジネスがコンテンツ作成に集中できる環境を提供する」

### 1.4 対象ユーザー
- 個人クリエイター
- インフルエンサー
- 中小企業のマーケティング担当者
- ソーシャルメディアマネージャー
- コンテンツマーケター

---

## 2. 目的と目標

### 2.1 ビジネス目的
1. Threads運用における作業効率の向上
2. 投稿スケジュール管理の自動化
3. エンゲージメント向上のためのデータドリブンな意思決定支援
4. コミュニティ管理の自動化による負担軽減

### 2.2 達成目標

| 目標カテゴリ | 具体的目標 | 測定指標 |
|-------------|----------|---------|
| 効率化 | 投稿作業時間の削減 | 従来比50%削減 |
| 自動化 | 予約投稿の自動公開 | 成功率99%以上 |
| エンゲージメント | 最適な投稿時間の提案 | ベストタイムスコア活用率 |
| 運用負担軽減 | 自動返信による応答時間短縮 | 平均応答時間の削減 |

### 2.3 成功基準
- ユーザーが予約投稿を作成し、指定時刻に自動公開されること
- メディア（画像・動画）を含む投稿が正常に作成されること
- カレンダーUIで投稿スケジュールを視覚的に管理できること
- 自動返信ルールが正しく動作すること
- 投稿のエンゲージメント（いいね、コメント）を確認できること

---

## 3. スコープ

### 3.1 対象範囲（In Scope）

#### コア機能
- ✅ Threads OAuth認証・アカウント管理
- ✅ 投稿作成（テキスト・メディア）
- ✅ 予約投稿・自動公開
- ✅ カレンダーベースのスケジュール管理
- ✅ 投稿メトリクス（いいね・コメント）の取得・表示
- ✅ 自動返信ルール設定・実行
- ✅ メディアアップロード・管理
- ✅ プロフィール・統計表示

#### 補助機能
- ✅ ダッシュボード（概要表示）
- ✅ ベストタイム分析
- ✅ 週間進捗表示
- ✅ 投稿編集・削除
- ✅ ドラッグ&ドロップによるスケジュール変更

### 3.2 対象外（Out of Scope）

- ❌ Instagram連携
- ❌ Facebook連携
- ❌ Twitter/X連携
- ❌ AI自動投稿文生成
- ❌ 競合分析
- ❌ インフルエンサーマーケティング機能
- ❌ チーム管理・マルチユーザー機能（v1.0）
- ❌ 課金・サブスクリプション機能（v1.0）
- ❌ モバイルアプリ（v1.0）

---

## 4. ステークホルダー

### 4.1 ステークホルダー一覧

| 役割 | 責任 | 関心事項 |
|-----|------|---------|
| エンドユーザー | サービス利用 | 使いやすさ、機能充実度 |
| 開発者 | システム開発・保守 | 技術的実現性、保守性 |
| 運用者 | サービス運用 | 安定性、モニタリング |
| Meta（Threads API提供者） | API提供 | API利用規約遵守 |

### 4.2 ユーザーペルソナ

#### ペルソナ1: 個人クリエイター（田中さん）
- **年齢**: 28歳
- **職業**: フリーランスデザイナー
- **目標**: Threadsでの認知度向上、ポートフォリオ発信
- **課題**: 投稿のタイミング管理、継続的な発信の難しさ
- **ニーズ**: 簡単な予約投稿、最適な投稿時間の提案

#### ペルソナ2: マーケティング担当者（佐藤さん）
- **年齢**: 35歳
- **職業**: 中小企業マーケティング担当
- **目標**: 企業アカウントのエンゲージメント向上
- **課題**: 複数SNSの管理、効果測定、コメント対応
- **ニーズ**: 効率的な投稿管理、自動返信、分析レポート

---

## 5. 機能要件

### 5.1 認証・アカウント管理

#### FR-AUTH-001: Threads OAuth認証
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AUTH-001 |
| **機能名** | Threads OAuth認証 |
| **説明** | ユーザーがThreadsアカウントでログインし、APIアクセス権限を付与する |
| **優先度** | 必須（P0） |
| **入力** | Threads認証コード |
| **出力** | 長期アクセストークン（60日有効） |
| **処理フロー** | 1. ログインボタンクリック<br>2. Threads認可画面へリダイレクト<br>3. ユーザー認可<br>4. コールバックで認証コード受信<br>5. 短期トークン取得<br>6. 長期トークンに変換<br>7. アカウント情報保存 |
| **エラーハンドリング** | 認証失敗時はエラーメッセージ表示、リトライ可能 |

#### FR-AUTH-002: トークン管理
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AUTH-002 |
| **機能名** | アクセストークン管理 |
| **説明** | アクセストークンの保存、有効期限管理、更新 |
| **優先度** | 必須（P0） |
| **仕様** | - 長期トークン: 60日間有効<br>- データベースに暗号化保存<br>- 有効期限をtoken_expires_atで管理 |

#### FR-AUTH-003: ログアウト
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AUTH-003 |
| **機能名** | ログアウト |
| **説明** | ユーザーセッションの終了 |
| **優先度** | 必須（P0） |
| **処理** | ローカルストレージのaccount_idをクリア |

---

### 5.2 投稿管理

#### FR-POST-001: 投稿作成（即時公開）
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-001 |
| **機能名** | 即時投稿作成 |
| **説明** | テキスト・メディアを含む投稿を即座にThreadsに公開 |
| **優先度** | 必須（P0） |
| **入力** | - キャプション（最大500文字）<br>- メディア（最大10ファイル） |
| **出力** | 公開された投稿情報 |
| **処理フロー** | 1. 投稿コンテンツ入力<br>2. バリデーション<br>3. Threads APIでコンテナ作成<br>4. 投稿公開<br>5. データベースに保存（state='published'） |
| **制約** | - テキスト: 500文字以内<br>- 画像: JPEG, PNG, GIF, WebP<br>- 動画: MP4, MOV（最大100MB） |

#### FR-POST-002: 予約投稿作成
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-002 |
| **機能名** | 予約投稿作成 |
| **説明** | 指定日時に自動公開される投稿を作成 |
| **優先度** | 必須（P0） |
| **入力** | - キャプション<br>- メディア（任意）<br>- 予約日時 |
| **出力** | 予約投稿情報 |
| **処理フロー** | 1. 投稿コンテンツ入力<br>2. 予約日時選択<br>3. バリデーション<br>4. データベースに保存（state='scheduled'）<br>5. Cronジョブが指定時刻に公開 |
| **制約** | - 予約日時は現在時刻より未来<br>- 最大予約期間: 制限なし |

#### FR-POST-003: 投稿編集
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-003 |
| **機能名** | 投稿編集 |
| **説明** | 予約投稿の内容・日時を編集 |
| **優先度** | 高（P1） |
| **制約** | 公開済み投稿は編集不可（Threads API制限） |
| **編集可能項目** | - キャプション（予約投稿のみ）<br>- 予約日時<br>- メディア（予約投稿のみ） |

#### FR-POST-004: 投稿削除
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-004 |
| **機能名** | 投稿削除 |
| **説明** | 投稿をシステムから削除 |
| **優先度** | 高（P1） |
| **処理** | - 予約投稿: データベースから削除<br>- 公開済み: データベースから削除（Threadsには残る） |

#### FR-POST-005: 投稿一覧取得
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-005 |
| **機能名** | 投稿一覧取得 |
| **説明** | ユーザーの全投稿を一覧表示 |
| **優先度** | 必須（P0） |
| **表示項目** | - 投稿本文<br>- メディアサムネイル<br>- 状態（公開/予約/下書き/失敗）<br>- 公開日時/予約日時<br>- メトリクス |
| **ソート** | 作成日時降順（デフォルト） |

#### FR-POST-006: Threads投稿同期
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-006 |
| **機能名** | Threads投稿同期 |
| **説明** | Threads APIから投稿データを取得しローカルDBと同期 |
| **優先度** | 高（P1） |
| **取得上限** | 500件 |
| **同期項目** | - 投稿ID<br>- 本文<br>- メディア<br>- パーマリンク<br>- 公開日時 |

#### FR-POST-007: メトリクス同期
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-007 |
| **機能名** | 投稿メトリクス同期 |
| **説明** | 投稿のエンゲージメント指標を定期更新 |
| **優先度** | 高（P1） |
| **取得メトリクス** | - いいね数（likes）<br>- コメント数（comments）<br>- ビュー数（views） |
| **更新頻度** | 手動またはページ読み込み時 |

#### FR-POST-008: スレッド投稿
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-POST-008 |
| **機能名** | スレッド（連続投稿）作成 |
| **説明** | 複数の投稿を連続したスレッドとして作成 |
| **優先度** | 中（P2） |
| **制約** | 各投稿は500文字以内 |

---

### 5.3 メディア管理

#### FR-MEDIA-001: メディアアップロード
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-MEDIA-001 |
| **機能名** | メディアアップロード |
| **説明** | 画像・動画ファイルをアップロードして投稿に添付 |
| **優先度** | 必須（P0） |
| **対応フォーマット** | - 画像: JPEG, PNG, GIF, WebP<br>- 動画: MP4, MOV |
| **ファイルサイズ** | 最大100MB/ファイル |
| **ファイル数** | 最大10ファイル/投稿 |
| **アップロード方法** | - ドラッグ&ドロップ<br>- クリックしてファイル選択 |
| **保存先** | Supabase Storage（mediaバケット） |

#### FR-MEDIA-002: メディアプレビュー
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-MEDIA-002 |
| **機能名** | メディアプレビュー |
| **説明** | アップロードしたメディアのプレビュー表示 |
| **優先度** | 高（P1） |
| **機能** | - サムネイル表示<br>- 削除ボタン<br>- 並び替え |

#### FR-MEDIA-003: メディア削除
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-MEDIA-003 |
| **機能名** | メディア削除 |
| **説明** | アップロード済みメディアの削除 |
| **優先度** | 高（P1） |
| **処理** | Supabase Storageからファイル削除 |

---

### 5.4 カレンダー・スケジュール管理

#### FR-CAL-001: 週表示カレンダー
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CAL-001 |
| **機能名** | 週表示カレンダー |
| **説明** | 7日間の投稿スケジュールを時間軸で表示 |
| **優先度** | 必須（P0） |
| **表示範囲** | 6:00〜23:00（1時間刻み） |
| **表示要素** | - 日付ヘッダー<br>- 時間軸<br>- 投稿カード<br>- スロット品質（色分け） |

#### FR-CAL-002: 月表示カレンダー
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CAL-002 |
| **機能名** | 月表示カレンダー |
| **説明** | 月単位で投稿スケジュールを俯瞰表示 |
| **優先度** | 高（P1） |
| **表示要素** | - 月間カレンダーグリッド<br>- 各日の投稿数<br>- 投稿サマリー |

#### FR-CAL-003: ドラッグ&ドロップスケジュール変更
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CAL-003 |
| **機能名** | ドラッグ&ドロップ |
| **説明** | 投稿カードをドラッグして予約日時を変更 |
| **優先度** | 高（P1） |
| **対象** | 予約投稿（state='scheduled'）のみ |
| **フィードバック** | ドラッグ中のビジュアルフィードバック |

#### FR-CAL-004: スロット品質表示
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CAL-004 |
| **機能名** | スロット品質表示 |
| **説明** | 投稿時間帯の推奨度を色で表示 |
| **優先度** | 中（P2） |
| **品質レベル** | - Best（緑）: スコア85以上<br>- Normal（黄）: スコア70-84<br>- Avoid（赤）: スコア70未満 |

#### FR-CAL-005: 投稿作成（カレンダーから）
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CAL-005 |
| **機能名** | カレンダーからの投稿作成 |
| **説明** | カレンダーの時間スロットをクリックして予約投稿作成 |
| **優先度** | 高（P1） |
| **動作** | クリックした日時が予約日時として自動設定 |

---

### 5.5 自動返信

#### FR-AR-001: 自動返信ルール作成
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AR-001 |
| **機能名** | 自動返信ルール作成 |
| **説明** | 特定条件で自動的に返信するルールを作成 |
| **優先度** | 高（P1） |
| **設定項目** | - ルール名<br>- トリガー種別<br>- フィルター条件<br>- 返信内容<br>- 送信タイミング |

#### FR-AR-002: トリガー種別
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AR-002 |
| **機能名** | トリガー種別設定 |
| **説明** | 自動返信を発動するイベントの種類 |
| **優先度** | 高（P1） |
| **トリガー種別** | - reply: 返信を受けた時<br>- repost: リポストされた時<br>- quote: 引用された時<br>- like: いいねされた時 |

#### FR-AR-003: フィルター条件
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AR-003 |
| **機能名** | フィルター条件設定 |
| **説明** | 自動返信の対象を絞り込む条件 |
| **優先度** | 高（P1） |
| **条件種別** | - キーワード（完全一致/部分一致）<br>- ハッシュタグ<br>- 除外キーワード |

#### FR-AR-004: 送信タイミング
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AR-004 |
| **機能名** | 送信タイミング設定 |
| **説明** | 自動返信を送信するタイミング |
| **優先度** | 高（P1） |
| **オプション** | - immediate: 即座に送信<br>- delayed: 指定分後に送信<br>- threshold: いいね数が閾値を超えた時 |

#### FR-AR-005: ルール管理
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-AR-005 |
| **機能名** | ルール管理 |
| **説明** | 自動返信ルールの有効化/無効化、編集、削除 |
| **優先度** | 高（P1） |
| **操作** | - ON/OFFトグル<br>- 編集<br>- 削除<br>- 複製 |

---

### 5.6 分析・インサイト

#### FR-ANALYTICS-001: ダッシュボード
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-ANALYTICS-001 |
| **機能名** | ダッシュボード |
| **説明** | 主要指標のサマリー表示 |
| **優先度** | 必須（P0） |
| **表示項目** | - 今日のベストタイム<br>- 週間進捗<br>- 直近の投稿<br>- エンゲージメントサマリー |

#### FR-ANALYTICS-002: ベストタイム分析
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-ANALYTICS-002 |
| **機能名** | ベストタイム分析 |
| **説明** | 曜日・時間帯別の最適投稿時間を分析 |
| **優先度** | 中（P2） |
| **表示形式** | ヒートマップ（曜日×時間帯） |
| **スコア範囲** | 0〜100 |

#### FR-ANALYTICS-003: 週間進捗
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-ANALYTICS-003 |
| **機能名** | 週間進捗表示 |
| **説明** | 週間の投稿数と目標達成状況 |
| **優先度** | 中（P2） |
| **表示項目** | - 今週の投稿数<br>- 目標との差<br>- 連続投稿日数（ストリーク） |

#### FR-ANALYTICS-004: プロフィール統計
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-ANALYTICS-004 |
| **機能名** | プロフィール統計 |
| **説明** | アカウントの全体統計を表示 |
| **優先度** | 高（P1） |
| **表示項目** | - 総投稿数<br>- 総いいね数<br>- 総コメント数<br>- フォロワー数 |

---

### 5.7 予約投稿自動公開

#### FR-CRON-001: 予約投稿自動公開
| 項目 | 内容 |
|-----|------|
| **機能ID** | FR-CRON-001 |
| **機能名** | 予約投稿自動公開 |
| **説明** | 予約時刻に達した投稿を自動的にThreadsに公開 |
| **優先度** | 必須（P0） |
| **実行間隔** | 毎分（* * * * *） |
| **処理フロー** | 1. scheduled_at <= 現在時刻の投稿を検索<br>2. Threads APIで投稿作成<br>3. state='published'に更新<br>4. published_atを記録 |
| **リトライ** | 最大3回、失敗時はstate='failed' |
| **認証** | CRON_SECRETヘッダーで検証 |

---

## 6. 非機能要件

### 6.1 性能要件

| 要件ID | 項目 | 要件値 |
|--------|-----|-------|
| NFR-PERF-001 | ページ読み込み時間 | 3秒以内 |
| NFR-PERF-002 | API応答時間 | 2秒以内（95パーセンタイル） |
| NFR-PERF-003 | 投稿作成処理時間 | 5秒以内 |
| NFR-PERF-004 | メディアアップロード | 100MB/30秒以内 |
| NFR-PERF-005 | 同時接続ユーザー数 | 100ユーザー |

### 6.2 可用性要件

| 要件ID | 項目 | 要件値 |
|--------|-----|-------|
| NFR-AVAIL-001 | サービス稼働率 | 99.5%以上 |
| NFR-AVAIL-002 | 計画停止時間 | 月間4時間以内 |
| NFR-AVAIL-003 | 障害復旧時間（RTO） | 4時間以内 |
| NFR-AVAIL-004 | データ復旧時点（RPO） | 1時間以内 |

### 6.3 拡張性要件

| 要件ID | 項目 | 要件値 |
|--------|-----|-------|
| NFR-SCALE-001 | ユーザー数 | 10,000ユーザーまでスケール可能 |
| NFR-SCALE-002 | 投稿データ | 100万件まで対応 |
| NFR-SCALE-003 | ストレージ | 必要に応じて拡張可能 |

### 6.4 ユーザビリティ要件

| 要件ID | 項目 | 要件値 |
|--------|-----|-------|
| NFR-UX-001 | レスポンシブ対応 | デスクトップ、タブレット |
| NFR-UX-002 | 対応ブラウザ | Chrome, Safari, Firefox, Edge（最新2バージョン） |
| NFR-UX-003 | アクセシビリティ | WCAG 2.1 Level AA準拠（目標） |
| NFR-UX-004 | 言語 | 日本語（v1.0） |

### 6.5 保守性要件

| 要件ID | 項目 | 要件値 |
|--------|-----|-------|
| NFR-MAINT-001 | コードカバレッジ | 70%以上（目標） |
| NFR-MAINT-002 | ドキュメント | API仕様書、セットアップガイド完備 |
| NFR-MAINT-003 | ログ出力 | エラーログ、アクセスログを出力 |

---

## 7. システムアーキテクチャ

### 7.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                        クライアント                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   ブラウザ（React）                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │Dashboard │ │Composer  │ │Calendar  │ │AutoReply │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel（ホスティング）                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Next.js Application                      │   │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐  │   │
│  │  │   App Router     │  │      API Routes              │  │   │
│  │  │  (Server/Client  │  │  /api/posts                  │  │   │
│  │  │   Components)    │  │  /api/auth                   │  │   │
│  │  │                  │  │  /api/media                  │  │   │
│  │  │                  │  │  /api/auto-reply             │  │   │
│  │  │                  │  │  /api/cron                   │  │   │
│  │  └──────────────────┘  └──────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    │                         │
          ┌─────────┘                         └─────────┐
          ▼                                             ▼
┌─────────────────────┐                     ┌─────────────────────┐
│      Supabase       │                     │    Threads API      │
│  ┌───────────────┐  │                     │  (Meta Graph API)   │
│  │  PostgreSQL   │  │                     │                     │
│  │  - accounts   │  │                     │  - OAuth認証        │
│  │  - posts      │  │                     │  - 投稿作成         │
│  │  - rules      │  │                     │  - インサイト取得   │
│  │  - inbox_items│  │                     │  - 返信投稿         │
│  │  - best_times │  │                     │                     │
│  ├───────────────┤  │                     └─────────────────────┘
│  │   Storage     │  │
│  │  (media)      │  │
│  └───────────────┘  │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│    cron-job.org     │
│  (予約投稿トリガー)   │
│  毎分実行            │
└─────────────────────┘
```

### 7.2 技術スタック

| レイヤー | 技術 | バージョン |
|---------|-----|----------|
| フロントエンド | Next.js | 14.2.33 |
| | React | 18.3.1 |
| | TypeScript | 5.7.3 |
| | Tailwind CSS | 3.4.18 |
| | Radix UI | 最新 |
| | Framer Motion | 11.15.0 |
| | Zustand | 5.0.2 |
| バックエンド | Next.js API Routes | - |
| | Node.js | 18+ |
| データベース | Supabase (PostgreSQL) | - |
| ストレージ | Supabase Storage | - |
| 外部API | Threads Graph API | v1.0 |
| ホスティング | Vercel | - |
| Cron | cron-job.org | - |

### 7.3 ディレクトリ構成

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # 認証API
│   │   ├── posts/        # 投稿管理API
│   │   ├── media/        # メディアAPI
│   │   ├── auto-reply/   # 自動返信API
│   │   ├── cron/         # Cron API
│   │   └── analytics/    # 分析API
│   ├── dashboard/        # ダッシュボード
│   ├── composer/         # 投稿作成
│   ├── calendar/         # カレンダー
│   ├── auto-reply/       # 自動返信設定
│   ├── profile/          # プロフィール
│   └── settings/         # 設定
├── components/            # Reactコンポーネント
│   ├── ui/               # 基本UIコンポーネント
│   └── calendar/         # カレンダー関連
├── lib/                   # 共有ライブラリ
│   ├── threads-api.ts    # Threads APIクライアント
│   ├── supabase.ts       # Supabaseクライアント
│   ├── types/            # 型定義
│   └── utils.ts          # ユーティリティ
├── hooks/                 # カスタムフック
└── supabase/             # DBスキーマ
```

---

## 8. データベース設計

### 8.1 ER図

```
┌─────────────────┐       ┌─────────────────┐
│    accounts     │       │     posts       │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │
│ threads_user_id │  │    │ account_id (FK) │──┐
│ threads_username│  └───▶│ threads_post_id │  │
│ access_token    │       │ state           │  │
│ token_expires_at│       │ caption         │  │
│ created_at      │       │ media[]         │  │
│ updated_at      │       │ scheduled_at    │  │
└─────────────────┘       │ published_at    │  │
         │                │ metrics (JSONB) │  │
         │                │ created_at      │  │
         │                │ updated_at      │  │
         │                └─────────────────┘  │
         │                                     │
         │                ┌─────────────────┐  │
         │                │     rules       │  │
         │                ├─────────────────┤  │
         └───────────────▶│ id (PK)         │  │
                          │ account_id (FK) │◀─┤
                          │ name            │  │
                          │ trigger         │  │
                          │ conditions      │  │
                          │ action          │  │
                          │ is_active       │  │
                          │ created_at      │  │
                          │ updated_at      │  │
                          └─────────────────┘  │
                                               │
                          ┌─────────────────┐  │
                          │   inbox_items   │  │
                          ├─────────────────┤  │
                          │ id (PK)         │  │
                          │ account_id (FK) │◀─┤
                          │ threads_item_id │  │
                          │ type            │  │
                          │ author_id       │  │
                          │ text            │  │
                          │ is_read         │  │
                          │ created_at      │  │
                          └─────────────────┘  │
                                               │
                          ┌─────────────────┐  │
                          │   best_times    │  │
                          ├─────────────────┤  │
                          │ id (PK)         │  │
                          │ account_id (FK) │◀─┘
                          │ weekday         │
                          │ hour            │
                          │ score           │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
```

### 8.2 テーブル定義

#### accounts テーブル
| カラム名 | データ型 | NULL | 制約 | 説明 |
|---------|---------|------|------|-----|
| id | UUID | NO | PRIMARY KEY, DEFAULT uuid_generate_v4() | 主キー |
| threads_user_id | TEXT | NO | UNIQUE | Threads ユーザーID |
| threads_username | TEXT | YES | | Threads ユーザー名 |
| access_token | TEXT | NO | | アクセストークン |
| token_expires_at | TIMESTAMP | YES | | トークン有効期限 |
| created_at | TIMESTAMP | NO | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | DEFAULT NOW() | 更新日時 |

#### posts テーブル
| カラム名 | データ型 | NULL | 制約 | 説明 |
|---------|---------|------|------|-----|
| id | UUID | NO | PRIMARY KEY | 主キー |
| account_id | UUID | NO | FOREIGN KEY | アカウント参照 |
| threads_post_id | TEXT | YES | UNIQUE | Threads投稿ID |
| state | TEXT | NO | CHECK | 状態（published/scheduled/draft/failed） |
| caption | TEXT | YES | | 投稿本文 |
| media | TEXT[] | YES | | メディアURL配列 |
| permalink | TEXT | YES | | Threadsパーマリンク |
| scheduled_at | TIMESTAMP | YES | | 予約日時 |
| published_at | TIMESTAMP | YES | | 公開日時 |
| slot_quality | TEXT | YES | | スロット品質 |
| retry_count | INTEGER | YES | DEFAULT 0 | リトライ回数 |
| error_message | TEXT | YES | | エラーメッセージ |
| metrics | JSONB | YES | | {likes, comments, views} |
| created_at | TIMESTAMP | NO | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | DEFAULT NOW() | 更新日時 |

#### rules テーブル
| カラム名 | データ型 | NULL | 制約 | 説明 |
|---------|---------|------|------|-----|
| id | UUID | NO | PRIMARY KEY | 主キー |
| account_id | UUID | NO | FOREIGN KEY | アカウント参照 |
| name | TEXT | NO | | ルール名 |
| trigger | TEXT | NO | | トリガー種別 |
| conditions | JSONB | YES | | フィルター条件 |
| action | JSONB | YES | | アクション設定 |
| is_active | BOOLEAN | NO | DEFAULT true | 有効フラグ |
| cooldown_s | INTEGER | YES | | クールダウン秒数 |
| created_at | TIMESTAMP | NO | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | DEFAULT NOW() | 更新日時 |

#### inbox_items テーブル
| カラム名 | データ型 | NULL | 制約 | 説明 |
|---------|---------|------|------|-----|
| id | UUID | NO | PRIMARY KEY | 主キー |
| account_id | UUID | NO | FOREIGN KEY | アカウント参照 |
| threads_item_id | TEXT | NO | UNIQUE | Threads項目ID |
| type | TEXT | NO | | dm/comment |
| author_id | TEXT | YES | | 投稿者ID |
| author_name | TEXT | YES | | 投稿者名 |
| text | TEXT | YES | | 本文 |
| is_read | BOOLEAN | NO | DEFAULT false | 既読フラグ |
| priority | TEXT | YES | | 優先度 |
| created_at | TIMESTAMP | NO | DEFAULT NOW() | 作成日時 |

#### best_times テーブル
| カラム名 | データ型 | NULL | 制約 | 説明 |
|---------|---------|------|------|-----|
| id | UUID | NO | PRIMARY KEY | 主キー |
| account_id | UUID | NO | FOREIGN KEY | アカウント参照 |
| weekday | INTEGER | NO | CHECK (0-6) | 曜日（0=日〜6=土） |
| hour | INTEGER | NO | CHECK (0-23) | 時間 |
| score | INTEGER | NO | CHECK (0-100) | スコア |
| created_at | TIMESTAMP | NO | DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | DEFAULT NOW() | 更新日時 |
| | | | UNIQUE(account_id, weekday, hour) | 複合ユニーク |

### 8.3 インデックス

```sql
-- posts テーブル
CREATE INDEX idx_posts_account_id ON posts(account_id);
CREATE INDEX idx_posts_state ON posts(state);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE state = 'scheduled';

-- inbox_items テーブル
CREATE INDEX idx_inbox_items_account_id ON inbox_items(account_id);
CREATE INDEX idx_inbox_items_is_read ON inbox_items(is_read);

-- rules テーブル
CREATE INDEX idx_rules_account_id ON rules(account_id);
CREATE INDEX idx_rules_is_active ON rules(is_active);

-- best_times テーブル
CREATE INDEX idx_best_times_account_id ON best_times(account_id);
```

---

## 9. API設計

### 9.1 API一覧

| エンドポイント | メソッド | 説明 | 認証 |
|---------------|---------|------|-----|
| /api/auth/login | GET | OAuth認証開始 | 不要 |
| /api/auth/callback | GET | OAuthコールバック | 不要 |
| /api/posts | GET | 投稿一覧取得 | 必要 |
| /api/posts | POST | 投稿作成 | 必要 |
| /api/posts/[id] | PUT | 投稿更新 | 必要 |
| /api/posts/[id] | DELETE | 投稿削除 | 必要 |
| /api/posts/sync | GET | Threads同期 | 必要 |
| /api/posts/sync-metrics | GET | メトリクス同期 | 必要 |
| /api/media/upload | POST | メディアアップロード | 必要 |
| /api/media/upload | DELETE | メディア削除 | 必要 |
| /api/auto-reply/v2 | GET | ルール一覧取得 | 必要 |
| /api/auto-reply/v2 | POST | ルール作成 | 必要 |
| /api/auto-reply/v2 | PUT | ルール更新 | 必要 |
| /api/auto-reply/v2 | DELETE | ルール削除 | 必要 |
| /api/cron/publish-scheduled | GET | 予約投稿公開 | CRON_SECRET |
| /api/profile | GET | プロフィール取得 | 必要 |
| /api/analytics/best-time | GET | ベストタイム | 必要 |

### 9.2 API詳細仕様

#### POST /api/posts - 投稿作成

**リクエスト**
```json
{
  "account_id": "uuid",
  "caption": "投稿本文",
  "media": ["https://storage.url/image.jpg"],
  "scheduled_at": "2025-01-15T10:00:00Z"  // 予約投稿の場合
}
```

**レスポンス（成功）**
```json
{
  "success": true,
  "post": {
    "id": "uuid",
    "state": "scheduled",
    "caption": "投稿本文",
    "media": ["https://storage.url/image.jpg"],
    "scheduled_at": "2025-01-15T10:00:00Z",
    "created_at": "2025-01-10T12:00:00Z"
  }
}
```

**レスポンス（エラー）**
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

#### POST /api/media/upload - メディアアップロード

**リクエスト**
- Content-Type: multipart/form-data
- file: ファイルデータ
- account_id: アカウントID

**レスポンス（成功）**
```json
{
  "success": true,
  "url": "https://supabase.storage.url/media/account_id/timestamp_filename.jpg"
}
```

#### POST /api/auto-reply/v2 - ルール作成

**リクエスト**
```json
{
  "account_id": "uuid",
  "name": "ルール名",
  "trigger_type": "reply",
  "filter": {
    "keywords": ["keyword1", "keyword2"],
    "match_type": "contains"
  },
  "reply_content": "返信テンプレート",
  "timing": {
    "type": "delayed",
    "delay_minutes": 5
  },
  "is_active": true
}
```

---

## 10. UI/UX要件

### 10.1 画面一覧

| 画面ID | 画面名 | パス | 説明 |
|-------|-------|-----|------|
| SCR-001 | ダッシュボード | / | メイン画面、概要表示 |
| SCR-002 | 投稿作成 | /composer | 投稿作成・編集 |
| SCR-003 | カレンダー | /calendar | スケジュール管理 |
| SCR-004 | 自動返信 | /auto-reply | ルール設定 |
| SCR-005 | プロフィール | /profile | 統計・プロフィール |
| SCR-006 | 分析 | /analytics | 詳細分析 |
| SCR-007 | 設定 | /settings | アプリ設定 |

### 10.2 共通UI要素

#### ナビゲーション（サイドバー）
- 固定表示
- 各ページへのリンク
- アクティブ状態の視覚的表示
- ユーザーメニュー

#### トースト通知
- 成功/エラー/警告/情報
- 自動消去（5秒）
- 手動消去可能

#### モーダルダイアログ
- 背景オーバーレイ
- ESCキーで閉じる
- 外部クリックで閉じる

### 10.3 デザイントークン

```javascript
// カラーパレット
colors: {
  primary: '#2563eb',      // Blue 600
  secondary: '#64748b',    // Slate 500
  accent: '#f59e0b',       // Amber 500
  success: '#22c55e',      // Green 500
  warning: '#eab308',      // Yellow 500
  error: '#ef4444',        // Red 500
  background: '#f8fafc',   // Slate 50
  foreground: '#0f172a',   // Slate 900
}

// スペーシング
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}

// フォント
font: {
  family: 'Inter, system-ui, sans-serif',
  size: {
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
  }
}
```

### 10.4 レスポンシブブレークポイント

| ブレークポイント | 幅 | 対象デバイス |
|----------------|-----|------------|
| sm | 640px | スマートフォン |
| md | 768px | タブレット |
| lg | 1024px | 小型デスクトップ |
| xl | 1280px | デスクトップ |
| 2xl | 1536px | 大型デスクトップ |

---

## 11. セキュリティ要件

### 11.1 認証・認可

| 要件ID | 項目 | 要件 |
|--------|-----|------|
| SEC-001 | OAuth認証 | Threads OAuth 2.0準拠 |
| SEC-002 | トークン保存 | データベースに保存（Supabase） |
| SEC-003 | セッション管理 | ローカルストレージでaccount_id管理 |
| SEC-004 | RLS | Row Level Security有効化 |

### 11.2 データ保護

| 要件ID | 項目 | 要件 |
|--------|-----|------|
| SEC-005 | 通信暗号化 | HTTPS必須 |
| SEC-006 | APIキー | 環境変数で管理、クライアント非公開 |
| SEC-007 | Cron認証 | CRON_SECRETヘッダー検証 |
| SEC-008 | 入力検証 | すべてのAPI入力をバリデーション |

### 11.3 脆弱性対策

| 要件ID | 対策 | 実装方法 |
|--------|-----|---------|
| SEC-009 | XSS対策 | React自動エスケープ、sanitize |
| SEC-010 | CSRF対策 | Same-Site Cookie |
| SEC-011 | SQLインジェクション | Supabaseパラメータ化クエリ |
| SEC-012 | ファイルアップロード | MIME型検証、サイズ制限 |

---

## 12. 外部サービス連携

### 12.1 Threads API

#### 基本情報
| 項目 | 値 |
|-----|---|
| API名 | Threads Graph API |
| ベースURL | https://graph.threads.net/v1.0 |
| 認証方式 | OAuth 2.0 |
| レート制限 | 500リクエスト/時間 |

#### 使用エンドポイント
| エンドポイント | 用途 |
|---------------|-----|
| GET /me | ユーザー情報取得 |
| GET /me/threads | 投稿一覧取得 |
| POST /me/threads | 投稿コンテナ作成 |
| POST /me/threads_publish | 投稿公開 |
| GET /{id}/insights | インサイト取得 |
| POST /{id}/replies | 返信投稿 |

#### 権限スコープ
- threads_basic
- threads_content_publish
- threads_manage_insights
- threads_manage_replies
- threads_read_replies

### 12.2 Supabase

#### 基本情報
| 項目 | 値 |
|-----|---|
| サービス名 | Supabase |
| 機能 | PostgreSQL、Storage、Auth |
| 認証 | Service Role Key（サーバー）、Anon Key（クライアント） |

#### 使用機能
| 機能 | 用途 |
|-----|-----|
| Database | 投稿、ルール、アカウント管理 |
| Storage | メディアファイル保存 |
| RLS | 行レベルセキュリティ |

### 12.3 cron-job.org

#### 基本情報
| 項目 | 値 |
|-----|---|
| サービス名 | cron-job.org |
| 用途 | 定期実行（予約投稿公開） |
| 実行間隔 | 毎分 |

#### 設定
```
URL: https://[domain]/api/cron/publish-scheduled
Method: GET
Headers: Authorization: Bearer {CRON_SECRET}
Schedule: * * * * *
```

---

## 13. 運用要件

### 13.1 デプロイメント

| 項目 | 内容 |
|-----|------|
| ホスティング | Vercel |
| ビルドコマンド | npm run build |
| 環境変数 | Vercel Dashboard で設定 |
| 自動デプロイ | GitHub main ブランチへのpush時 |

### 13.2 監視・ログ

| 項目 | ツール/方法 |
|-----|------------|
| アプリケーションログ | Vercel Logs |
| エラー監視 | Vercel Error Tracking |
| パフォーマンス | Vercel Analytics |
| Cron監視 | cron-job.org ダッシュボード |

### 13.3 バックアップ

| 項目 | 内容 |
|-----|------|
| データベース | Supabase自動バックアップ（日次） |
| ストレージ | Supabase Storage冗長化 |
| リストア | Supabase管理画面から実行 |

### 13.4 環境変数

```env
# Threads API
THREADS_APP_ID=xxxxxxxxxx
THREADS_APP_SECRET=xxxxxxxxxx
NEXT_PUBLIC_THREADS_REDIRECT_URI=https://domain/api/auth/callback
NEXT_PUBLIC_BASE_URL=https://domain

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyxxx...
SUPABASE_SERVICE_ROLE_KEY=eyxxx...

# Cron
CRON_SECRET=your_cron_secret
```

---

## 14. 制約事項

### 14.1 技術的制約

| 制約 | 内容 | 影響 |
|-----|------|-----|
| Threads API制限 | 500リクエスト/時間 | 大量同期時に制限 |
| トークン有効期限 | 60日 | 定期的な再認証必要 |
| 投稿文字数 | 500文字 | Threads仕様 |
| メディアサイズ | 100MB | Supabase Storage制限 |
| 公開済み投稿編集 | 不可 | Threads API仕様 |

### 14.2 ビジネス制約

| 制約 | 内容 |
|-----|------|
| 対応プラットフォーム | Threadsのみ（v1.0） |
| 対応言語 | 日本語のみ（v1.0） |
| マルチユーザー | 非対応（v1.0） |
| 課金機能 | 非対応（v1.0） |

### 14.3 運用制約

| 制約 | 内容 |
|-----|------|
| Cron精度 | 最大1分の遅延可能性 |
| サーバーレス制限 | 10秒タイムアウト（Vercel） |
| コールドスタート | 初回アクセス時遅延 |

---

## 15. 用語集

| 用語 | 説明 |
|-----|------|
| Threads | Meta社が提供するテキストベースのSNSプラットフォーム |
| OAuth | 認可のための業界標準プロトコル |
| アクセストークン | APIにアクセスするための認証情報 |
| 予約投稿 | 指定日時に自動公開される投稿 |
| 自動返信 | 条件に基づいて自動的に送信される返信 |
| エンゲージメント | いいね、コメント、リポストなどの反応 |
| インサイト | 投稿のパフォーマンスデータ |
| ベストタイム | 最もエンゲージメントが期待できる投稿時間 |
| RLS | Row Level Security（行レベルセキュリティ） |
| Cron | 定期実行のスケジューラー |
| スロット品質 | 投稿時間帯の推奨度スコア |
| パーマリンク | 投稿への永続的なURL |
| JSONB | PostgreSQLのJSONバイナリ型 |

---

## 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|-----|---------|-------|
| 1.0.0 | 2025-11-26 | 初版作成 | Claude |

---

## 付録

### A. 画面遷移図

```
[ログイン] → [ダッシュボード] ←→ [投稿作成]
                 ↓↑
            [カレンダー] ←→ [投稿詳細モーダル]
                 ↓↑
            [自動返信設定]
                 ↓↑
            [プロフィール/統計]
                 ↓↑
              [設定]
```

### B. 状態遷移図（投稿）

```
[draft] → [scheduled] → [published]
              ↓              ↑
          [failed] ──────────┘
            (リトライ)
```

### C. 参考ドキュメント

- [Threads API公式ドキュメント](https://developers.facebook.com/docs/threads)
- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Vercel公式ドキュメント](https://vercel.com/docs)

---

**以上**
