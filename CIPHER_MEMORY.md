# ThreadStep プロジェクト - Cipher長期記憶

## プロジェクト情報
- **プロジェクト名**: ThreadStep
- **パス**: `/Users/itsukiokamoto/threadstep`
- **説明**: Threads投稿管理カレンダーアプリ
- **技術スタック**: Next.js 14, TypeScript, Supabase, Tailwind CSS
- **Github**: https://github.com/ituki0414/Threads-.git

## Threads風UIデザインルール
このプロジェクトは**Threads風のUIデザイン**を採用しています：
- **モノトーン基調**: グレー・白・黒を中心
- **丸みのあるデザイン**: `rounded-xl`, `rounded-lg`を多用
- **クリーンな余白**: 適切なpadding/margin
- **シンプルなアイコン**: lucide-reactを使用
- **影の使い方**: `hover:shadow-lg`で立体感

## Buffer風カレンダーレイアウト
BufferのカレンダーUIを参考にした設計：
- **1スロットに1投稿のみ表示**
- **スロット高さ**: 70px (`h-[70px]`)
- **クリーンな白背景**: `bg-white`
- **ドラッグ&ドロップ対応**
- **時間スロット**: 0:00-23:00の24時間表示

## PostCard コンポーネント設計
**ファイル**: `components/calendar/PostCard.tsx`

```typescript
// Threads風UI + Buffer風レイアウト
className="bg-white border border-gray-200 rounded-xl p-2.5 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all"

// 時刻表示
<span className="text-sm font-bold text-gray-900">{getPostTime()}</span>

// ステータス
<span className="text-[11px] font-semibold">{config.label}</span>

// 本文
<p className="text-[13px] text-gray-800 line-clamp-2 leading-snug font-normal">
```

**デザインポイント**:
- 白背景で清潔感
- 時刻は右上に太字で目立たせる
- 本文は2行まで表示
- メディアインジケーター付き

## WeekView コンポーネント設計
**ファイル**: `components/calendar/WeekView.tsx`

```typescript
// スロット設計
className="flex-1 h-[70px] rounded-lg border bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm p-2 cursor-pointer"

// ドラッグオーバー時
className="bg-blue-50 border-blue-300"
```

**レイアウトポイント**:
- 24時間表示（0:00-23:00）
- 1スロットに1投稿
- ドラッグ&ドロップでスケジュール変更可能
- クリーンなグリッドレイアウト

## 過去の問題と解決策

### 問題1: バックグラウンドプロセスの競合
**症状**: 23個のnpm devプロセスが同時に動作
**原因**: `run_in_background: true`を多用しすぎた
**解決策**:
- ユーザーが手動で`npm run dev`を1回だけ実行
- Claude Codeはdevサーバーを起動しない
- Next.jsのHot Reloadを活用

### 問題2: デザインの再現性
**症状**: スクリーンショットと実装が一致しない
**原因**: ピクセル単位での正確な測定ができていなかった
**解決策**:
- Threads風UIデザインルールを明確化
- Buffer風レイアウトを参考
- 具体的なTailwindクラスを文書化

## データベース設計
- **Supabase**を使用
- **posts**テーブル:
  - `threads_post_id`: Threads APIのID
  - `caption`: 投稿本文
  - `state`: published, scheduled, needs_approval, failed
  - `published_at`: 配信日時
  - `scheduled_at`: 予約日時
  - `media`: 画像情報（JSON配列）

## Threads API連携
- **ファイル**: `lib/threads-api.ts`
- **ページネーション対応**: 81件以上の投稿を取得可能
- **同期機能**: `/api/posts/sync/route.ts`

## 重要な注意事項
1. **devサーバーは手動起動**: `npm run dev`
2. **Hot Reload活用**: ファイル変更時は自動リロード
3. **Githubに常にpush**: 変更は必ずコミット
4. **Threads風UI厳守**: モノトーン・丸み・クリーン
5. **Buffer風レイアウト**: 1スロット1投稿

## 次回セッション時の確認事項
- [ ] devサーバーが1つだけ動いているか確認
- [ ] Threads風UIデザインルールを参照
- [ ] Buffer風カレンダーレイアウトを維持
- [ ] Githubの最新状態を確認
