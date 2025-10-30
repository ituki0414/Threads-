# ThreadStep Design System

## プロジェクト概要
ThreadStepは、Threadsの投稿管理ツールです。Bufferのような直感的なUI/UXを目指しています。

## デザイン哲学
- **シンプルさ第一**: 機能よりも使いやすさを優先
- **視覚的な階層**: 重要な情報は目立たせ、補助的な情報は控えめに
- **余白の活用**: 窮屈にせず、呼吸できるレイアウト
- **一貫性**: 全ページで統一されたパターンとスタイル

## 参考デザイン
- **Buffer** (https://publish.buffer.com): カレンダーUI、クリーンなレイアウト
- **Linear**: モダンなダークモード、洗練されたアニメーション
- **Notion**: カード型UI、柔軟なレイアウト

## カラーパレット
### プライマリカラー
- Primary 500: `#3B82F6` (青)
- Primary 600: `#2563EB` (濃い青)
- Primary 50: `#EFF6FF` (薄い青)

### ニュートラルカラー
- Slate 50: `#F8FAFC` (背景)
- Slate 200: `#E2E8F0` (ボーダー)
- Slate 600: `#475569` (セカンダリテキスト)
- Slate 900: `#0F172A` (メインテキスト)

### セマンティックカラー
- Success: `#10B981` (緑 - 公開済み)
- Warning: `#F59E0B` (オレンジ - 予約)
- Error: `#EF4444` (赤 - エラー)

## タイポグラフィ
- **見出し**: Inter フォント、Bold、大きめのサイズ
- **本文**: Inter フォント、Regular、読みやすいサイズ
- **コード**: JetBrains Mono（必要な場合）

### サイズスケール
- h1: `text-3xl font-bold` (30px)
- h2: `text-2xl font-bold` (24px)
- h3: `text-xl font-semibold` (20px)
- body: `text-base` (16px)
- small: `text-sm` (14px)
- tiny: `text-xs` (12px)

## スペーシング
- **パディング**: 余裕を持たせる (p-6, p-8)
- **マージン**: セクション間は mb-6 ~ mb-8
- **Gap**: フレックス/グリッドは gap-3 ~ gap-6

## コンポーネントスタイル

### ボタン
```
プライマリ: bg-primary-600, hover:bg-primary-700, text-white
セカンダリ: bg-white, border-slate-200, text-slate-900
ゴースト: hover:bg-slate-100, text-slate-600
```

### カード
```
border: border-slate-200
radius: rounded-xl (12px)
shadow: shadow-sm
background: bg-white
```

### インプット
```
border: border-slate-200
focus: ring-2 ring-primary-500
radius: rounded-lg (8px)
padding: px-4 py-2.5
```

## レイアウトパターン

### ヘッダー
- 高さ: ~70px
- 背景: bg-white, border-b border-slate-200
- ナビゲーション: 右側にリンク、左側にロゴ

### メインコンテンツ
- max-width: 1600px (カレンダー), 7xl (その他)
- padding: px-6 py-6

### カレンダーグリッド
- 7列（曜日）× 4行（時間帯）
- カード: rounded-xl, hover効果
- 今日: 目立つボーダー (border-primary-500)

### 投稿カード
- コンパクト: 120px高さ
- 状態アイコン: 左上
- 時刻表示: 右上
- ホバー: shadow-lg, scale-105

## アニメーション
- **トランジション**: transition-all duration-200
- **ホバー効果**: scale, shadow, border color
- **ローディング**: spin animation
- **ページ遷移**: fade-in (animate-in)

## アクセシビリティ
- **カラーコントラスト**: WCAG AA準拠
- **フォーカス**: ring-2 ring-primary-500
- **キーボード操作**: すべてのインタラクティブ要素
- **ARIA**: 適切なラベルとロール

## 避けるべきこと
- ❌ 派手すぎるグラデーション
- ❌ 不必要なアニメーション
- ❌ 極端に小さい文字サイズ
- ❌ コントラストの低い色の組み合わせ
- ❌ 過度に装飾的なフォント

## 目指すべきこと
- ✅ クリーンで広々としたレイアウト
- ✅ 明確な視覚的階層
- ✅ スムーズで控えめなアニメーション
- ✅ 一貫したスペーシングとアライメント
- ✅ レスポンシブで柔軟なデザイン
