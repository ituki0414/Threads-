import { Post, BestTime, InboxItem, Rule } from './types';

// モック投稿データ
export const mockPosts: Post[] = [
  {
    id: '1',
    account_id: 'acc1',
    state: 'scheduled',
    caption: '今日の学びをシェア✨ 成功する人の共通点は「行動力」。考えるだけじゃなく、まず1歩踏み出すことが大切です。',
    media: [],
    threads: null,
    threads_post_id: null,
    permalink: null,
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2時間後
    slot_quality: 'best',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null,
    retry_count: 0,
  },
  {
    id: '2',
    account_id: 'acc1',
    state: 'scheduled',
    caption: '朝活のメリット3選📝\n1. 集中力UP\n2. 時間の有効活用\n3. 達成感でモチベ向上\n\nあなたは朝派？夜派？',
    media: [],
    threads: null,
    threads_post_id: null,
    permalink: null,
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明日
    slot_quality: 'best',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null,
    retry_count: 0,
  },
  {
    id: '3',
    account_id: 'acc1',
    state: 'draft',
    caption: '週末の過ごし方で人生が変わる💡 自己投資の時間にしよう！',
    media: [],
    threads: null,
    threads_post_id: null,
    permalink: null,
    scheduled_at: null,
    slot_quality: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: null,
    retry_count: 0,
  },
  {
    id: '4',
    account_id: 'acc1',
    state: 'published',
    caption: '今週の振り返り🎯 小さな進歩も積み重ねれば大きな成果に。',
    media: [],
    threads: null,
    threads_post_id: 'threads_123456',
    permalink: 'https://www.threads.net/@username/post/abc123',
    scheduled_at: null,
    slot_quality: 'normal',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    retry_count: 0,
  },
];

// ベストタイム（曜日×時間帯のスコア）
export const mockBestTimes: BestTime[] = [
  // 月曜日
  { account_id: 'acc1', weekday: 1, hour: 7, score: 65 },
  { account_id: 'acc1', weekday: 1, hour: 12, score: 72 },
  { account_id: 'acc1', weekday: 1, hour: 19, score: 88 },
  { account_id: 'acc1', weekday: 1, hour: 21, score: 85 },
  // 火曜日
  { account_id: 'acc1', weekday: 2, hour: 7, score: 68 },
  { account_id: 'acc1', weekday: 2, hour: 12, score: 75 },
  { account_id: 'acc1', weekday: 2, hour: 19, score: 92 },
  { account_id: 'acc1', weekday: 2, hour: 21, score: 87 },
  // 水曜日
  { account_id: 'acc1', weekday: 3, hour: 7, score: 70 },
  { account_id: 'acc1', weekday: 3, hour: 12, score: 78 },
  { account_id: 'acc1', weekday: 3, hour: 19, score: 95 },
  { account_id: 'acc1', weekday: 3, hour: 21, score: 89 },
  // 木曜日
  { account_id: 'acc1', weekday: 4, hour: 7, score: 67 },
  { account_id: 'acc1', weekday: 4, hour: 12, score: 74 },
  { account_id: 'acc1', weekday: 4, hour: 19, score: 90 },
  { account_id: 'acc1', weekday: 4, hour: 21, score: 86 },
  // 金曜日
  { account_id: 'acc1', weekday: 5, hour: 7, score: 64 },
  { account_id: 'acc1', weekday: 5, hour: 12, score: 71 },
  { account_id: 'acc1', weekday: 5, hour: 19, score: 93 },
  { account_id: 'acc1', weekday: 5, hour: 22, score: 88 },
  // 土曜日
  { account_id: 'acc1', weekday: 6, hour: 9, score: 80 },
  { account_id: 'acc1', weekday: 6, hour: 14, score: 82 },
  { account_id: 'acc1', weekday: 6, hour: 20, score: 85 },
  // 日曜日
  { account_id: 'acc1', weekday: 0, hour: 10, score: 78 },
  { account_id: 'acc1', weekday: 0, hour: 15, score: 80 },
  { account_id: 'acc1', weekday: 0, hour: 20, score: 83 },
];

// 受信箱アイテム
export const mockInboxItems: InboxItem[] = [
  {
    id: 'inbox1',
    type: 'comment',
    author_id: 'user1',
    author_name: '田中太郎',
    author_avatar: undefined,
    text: 'とても参考になりました！保存します📝',
    ts: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    priority: 'high',
    flags: ['positive', 'save_intent'],
    is_read: false,
    is_approved: false,
    auto_reply_scheduled: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
  },
  {
    id: 'inbox2',
    type: 'dm',
    author_id: 'user2',
    author_name: '佐藤花子',
    author_avatar: undefined,
    text: '特典の資料をいただけますか？',
    ts: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    priority: 'high',
    flags: ['bonus_request'],
    is_read: false,
    is_approved: false,
  },
  {
    id: 'inbox3',
    type: 'comment',
    author_id: 'user3',
    author_name: '鈴木次郎',
    author_avatar: undefined,
    text: 'いつも素敵な投稿ありがとうございます✨',
    ts: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'medium',
    flags: ['positive'],
    is_read: true,
    is_approved: true,
  },
];

// ルール
export const mockRules: Rule[] = [
  {
    id: 'rule1',
    name: '保存お礼DM',
    trigger: 'comment',
    conditions: {
      keywords: ['保存', 'ブックマーク', 'あとで見る'],
      sentiment: 'positive',
    },
    action: {
      type: 'dm',
      template: 'ありがとうございます！特典資料をお送りしますね😊',
    },
    auto: false, // 承認必須
    cooldown_s: 86400, // 24時間
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rule2',
    name: 'ポジティブコメント返信',
    trigger: 'comment',
    conditions: {
      sentiment: 'positive',
      follower_days: 30,
    },
    action: {
      type: 'reply',
      template: 'ありがとうございます✨ これからも役立つ情報をシェアしていきますね！',
    },
    auto: false,
    cooldown_s: 3600, // 1時間
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'rule3',
    name: '特典リクエスト自動送信（Yes検知）',
    trigger: 'dm',
    conditions: {
      keywords: ['はい', 'yes', 'お願い', 'ください', '欲しい'],
    },
    action: {
      type: 'dm',
      template: '特典資料をお送りします！📩\n\n▼ こちらからダウンロード\nhttps://example.com/bonus\n\n何かご質問があればお気軽にどうぞ😊',
    },
    auto: true, // 自動送信
    cooldown_s: 604800, // 7日間（同じユーザーへの重複送信防止）
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// ヘルパー関数：特定の日時のスロット品質を取得
export function getSlotQuality(date: Date): 'best' | 'normal' | 'avoid' {
  const weekday = date.getDay();
  const hour = date.getHours();

  const bestTime = mockBestTimes.find(
    (bt) => bt.weekday === weekday && bt.hour === hour
  );

  if (!bestTime) return 'normal';

  if (bestTime.score >= 85) return 'best';
  if (bestTime.score >= 70) return 'normal';
  return 'avoid';
}
