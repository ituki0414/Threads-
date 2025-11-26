/**
 * 動的インポートユーティリティ
 * バンドルサイズ最適化のための遅延ロード設定
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// ローディングコンポーネント
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
  </div>
);

// 共通のダイナミックインポートオプション
const defaultOptions = {
  loading: LoadingSpinner,
  ssr: false, // モーダルはクライアントサイドのみ
};

/**
 * モーダルコンポーネントの遅延ロード
 */

// 投稿作成モーダル
export const PostCreateModal = dynamic(
  () => import('@/components/PostCreateModal').then((mod) => mod.PostCreateModal),
  defaultOptions
);

// 投稿編集モーダル
export const PostModal = dynamic(
  () => import('@/components/PostModal').then((mod) => mod.PostModal),
  defaultOptions
);

// 定期投稿モーダル
export const RecurringPostModal = dynamic(
  () => import('@/components/RecurringPostModal').then((mod) => mod.RecurringPostModal),
  defaultOptions
);

// 時間選択モーダル
export const TimePickerModal = dynamic(
  () => import('@/components/TimePickerModal').then((mod) => mod.TimePickerModal),
  defaultOptions
);

/**
 * 重いコンポーネントの遅延ロード
 */

// カレンダービュー（月表示）
export const MonthView = dynamic(
  () => import('@/components/calendar/MonthView').then((mod) => mod.MonthView),
  { loading: LoadingSpinner }
);

// カレンダービュー（週表示）
export const WeekView = dynamic(
  () => import('@/components/calendar/WeekView').then((mod) => mod.WeekView),
  { loading: LoadingSpinner }
);

/**
 * 汎用の遅延ロードラッパー
 */
export function lazyLoad<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  exportName?: string
) {
  return dynamic(
    () =>
      importFn().then((mod) => {
        if (exportName && exportName in mod) {
          return { default: (mod as Record<string, T>)[exportName] };
        }
        return mod as { default: T };
      }),
    defaultOptions
  );
}
