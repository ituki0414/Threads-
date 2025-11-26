'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar as CalendarIcon, Plus, RefreshCw, Home, User, LayoutGrid, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { RecurringConfig } from '@/components/RecurringPostModal';

// 動的インポート - バンドルサイズ最適化
const WeekView = dynamic(() => import('@/components/calendar/WeekView').then(mod => mod.WeekView));
const MonthView = dynamic(() => import('@/components/calendar/MonthView').then(mod => mod.MonthView));
const PostModal = dynamic(() => import('@/components/PostModal').then(mod => mod.PostModal), { ssr: false });
const PostCreateModal = dynamic(() => import('@/components/PostCreateModal').then(mod => mod.PostCreateModal), { ssr: false });
const TimePickerModal = dynamic(() => import('@/components/TimePickerModal').then(mod => mod.TimePickerModal), { ssr: false });
const RecurringPostModal = dynamic(() => import('@/components/RecurringPostModal').then(mod => mod.RecurringPostModal), { ssr: false });
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Post } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Toast';
import { formatDateForDatabase } from '@/lib/datetime-utils';

// 投稿データのフィールド定義（共通化）
const POST_SELECT_FIELDS = 'id, account_id, threads_post_id, state, caption, media, published_at, scheduled_at, slot_quality, created_at, retry_count, error_message, permalink, metrics';

// 投稿データにデフォルト値を追加するヘルパー関数
const normalizePost = (post: any): Post => ({
  ...post,
  media: post.media || [],
  threads: null,
  permalink: post.permalink || null,
  metrics: post.metrics || null,
  updated_at: post.created_at,
  retry_count: post.retry_count || 0,
});

// 投稿データを一括で正規化
const normalizePosts = (posts: any[]): Post[] => posts.map(normalizePost);

export default function CalendarPage() {
  const router = useRouter();
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostDate, setCreatePostDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'month'>('month');

  // Time picker modal state
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ postId: string; newDate: Date } | null>(null);

  // Multi-select state
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Recurring post state
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringBaseDate, setRecurringBaseDate] = useState<Date | null>(null);
  const [pendingRecurringPost, setPendingRecurringPost] = useState<{
    caption: string;
    media: string[];
    threads: string[];
  } | null>(null);

  // 投稿を取得する共通関数
  const fetchPostsFromDB = async (accId: string): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select(POST_SELECT_FIELDS)
      .eq('account_id', accId)
      .in('state', ['scheduled', 'published', 'failed'])
      .order('created_at', { ascending: false })
      .limit(10000);

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return [];
    }

    return normalizePosts(data || []);
  };

  // 投稿を取得
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // LocalStorageからaccount_idを取得
      const accId = localStorage.getItem('account_id');
      console.log('🔑 Account ID from localStorage:', accId);
      setAccountId(accId || null);

      if (!accId) {
        console.log('❌ No account ID found in localStorage');
        setIsLoading(false);
        return;
      }

      // 共通関数を使って投稿を取得
      const fetchedPosts = await fetchPostsFromDB(accId);
      console.log('✅ Fetched posts from Supabase:', fetchedPosts.length);

      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // エンゲージメントメトリクスを同期
  const syncMetrics = async () => {
    try {
      const accId = localStorage.getItem('account_id');
      if (!accId) {
        console.warn('⚠️ No account_id found - skipping metrics sync');
        return;
      }

      console.log('📊 Syncing metrics...');
      const response = await fetch('/api/posts/sync-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accId }),
      });

      if (!response.ok) {
        throw new Error('Metrics sync failed');
      }

      const result = await response.json();
      console.log('✨ Metrics sync result:', result);

      // メトリクス同期後に投稿一覧を再取得
      if (result.updated > 0) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Failed to sync metrics:', error);
    }
  };

  // Threads APIから投稿を自動同期（バックグラウンド）
  const syncPosts = async () => {
    try {
      const accId = localStorage.getItem('account_id');
      if (!accId) {
        console.warn('⚠️ No account_id found - skipping sync');
        return;
      }

      const response = await fetch('/api/posts/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ account_id: accId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Sync failed:', errorData);
        throw new Error('Sync failed');
      }

      const result = await response.json();
      console.log('✨ Auto-sync result:', result);

      // 同期後に投稿一覧を再取得（ローディング表示なし）
      if (result.synced > 0 || result.deleted > 0) {
        const accId = localStorage.getItem('account_id');
        if (accId) {
          const fetchedPosts = await fetchPostsFromDB(accId);
          setPosts(fetchedPosts);
          console.log(`🔄 Updated posts after sync: ${fetchedPosts.length} total`);
        }
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
      // エラーは無視（バックグラウンド処理のため）
    }
  };

  useEffect(() => {
    fetchPosts();

    // 初回同期（ページ読み込み時）
    syncPosts();
    syncMetrics();

    // 定期的に自動同期（5分ごと）
    const syncInterval = setInterval(() => {
      syncPosts();
    }, 5 * 60 * 1000); // 5分 = 300,000ms

    // メトリクスは10分ごとに同期（API制限を考慮）
    const metricsInterval = setInterval(() => {
      syncMetrics();
    }, 10 * 60 * 1000); // 10分 = 600,000ms

    // ページがフォーカスされた時に再取得（新規投稿後の反映用）
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(syncInterval);
      clearInterval(metricsInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handlePostClick = (post: Post) => {
    if (isMultiSelectMode) {
      // Multi-select mode: toggle selection
      setSelectedPostIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(post.id)) {
          newSet.delete(post.id);
        } else {
          newSet.add(post.id);
        }
        return newSet;
      });
    } else {
      // Normal mode: open post modal
      setSelectedPost(post);
    }
  };

  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedPostIds(new Set());
  };

  const handleBulkMove = async (newDate: Date) => {
    if (selectedPostIds.size === 0) return;

    try {
      const postIdsArray = Array.from(selectedPostIds);
      const selectedPosts = posts.filter(p => postIdsArray.includes(p.id));

      for (const post of selectedPosts) {
        await supabase
          .from('posts')
          .update({
            scheduled_at: formatDateForDatabase(newDate),
          })
          .eq('id', post.id);
      }

      // Update local state
      setPosts((prev) =>
        prev.map((p) =>
          selectedPostIds.has(p.id)
            ? { ...p, scheduled_at: formatDateForDatabase(newDate) }
            : p
        )
      );

      toast.success(`${selectedPostIds.size}件の投稿を${newDate.toLocaleString('ja-JP')}に移動しました`);
      setSelectedPostIds(new Set());
      setIsMultiSelectMode(false);
    } catch (error) {
      console.error('Failed to bulk move posts:', error);
      toast.error('一括移動に失敗しました');
    }
  };

  const handleSlotClick = (date: Date) => {
    if (isMultiSelectMode && selectedPostIds.size > 0) {
      // Multi-select mode: open time picker for bulk move
      const mockPostId = Array.from(selectedPostIds)[0]; // Use first post ID as placeholder
      setPendingMove({ postId: mockPostId, newDate: date });
      setIsTimePickerOpen(true);
    } else {
      // Normal mode: create new post
      // 過去の日付には投稿作成不可
      const now = new Date();
      now.setHours(0, 0, 0, 0); // 日付のみで比較
      const clickedDate = new Date(date);
      clickedDate.setHours(0, 0, 0, 0);

      if (clickedDate < now) {
        toast.error('過去の日付には予約投稿できません');
        return;
      }

      console.log('Slot clicked:', date);
      setCreatePostDate(date);
      setIsCreatingPost(true);
    }
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          caption: updatedPost.caption,
          scheduled_at: updatedPost.scheduled_at,
          media: updatedPost.media,
        })
        .eq('id', updatedPost.id);

      if (error) {
        console.error('Error updating post:', error);
        toast.error('投稿の更新に失敗しました');
      } else {
        // データベースから最新の投稿データを再取得
        const { data: refreshedPost, error: fetchError } = await supabase
          .from('posts')
          .select(POST_SELECT_FIELDS)
          .eq('id', updatedPost.id)
          .single();

        if (!fetchError && refreshedPost) {
          const normalizedPost = normalizePost(refreshedPost);
          setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? normalizedPost : p)));
        } else {
          // フォールバック: refreshに失敗したら元のupdatedPostを使用
          setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
        }
        setSelectedPost(null);
        toast.success('投稿を更新しました');
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('投稿の更新に失敗しました');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('この投稿を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        toast.error('投稿の削除に失敗しました');
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setSelectedPost(null);
        toast.success('投稿を削除しました');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      // 投稿データを取得
      const post = posts.find(p => p.id === postId);
      if (!post) {
        alert('投稿が見つかりません');
        return;
      }

      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        alert('アカウント情報が見つかりません');
        return;
      }

      // Threads APIを使って実際に公開
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: post.caption,
          media: post.media,
          threads: post.threads,
          publish_now: true, // 今すぐ公開
          account_id: accountId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿の公開に失敗しました');
      }

      const result = await response.json();

      // データベースを更新（threads_post_idとpermalinkを設定）
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          state: 'published',
          published_at: new Date().toISOString(),
          threads_post_id: result.threads_post_id,
          permalink: result.permalink,
        })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating post in database:', updateError);
        // APIには投稿できたので、エラーは無視してもOK
      }

      // データベースから最新の投稿データを再取得
      const { data: refreshedPost, error: fetchError } = await supabase
        .from('posts')
        .select(POST_SELECT_FIELDS)
        .eq('id', postId)
        .single();

      if (!fetchError && refreshedPost) {
        const normalizedPost = normalizePost(refreshedPost);
        setPosts((prev) => prev.map((p) => (p.id === postId ? normalizedPost : p)));
      }

      setSelectedPost(null);
      toast.success('投稿を公開しました！');
    } catch (error) {
      console.error('Failed to publish post:', error);
      const errorMsg = error instanceof Error ? error.message : '投稿の公開に失敗しました';
      alert(errorMsg);
    }
  };

  const handlePostMove = (postId: string, newDate: Date) => {
    // Time picker modalを表示
    setPendingMove({ postId, newDate });
    setIsTimePickerOpen(true);
  };

  const handleTimeConfirm = async (finalDateTime: Date) => {
    if (!pendingMove) return;

    // Check if this is a bulk move
    if (isMultiSelectMode && selectedPostIds.size > 0) {
      try {
        const postIdsArray = Array.from(selectedPostIds);
        for (const postId of postIdsArray) {
          await supabase
            .from('posts')
            .update({
              scheduled_at: formatDateForDatabase(finalDateTime),
            })
            .eq('id', postId);
        }

        setPosts((prev) =>
          prev.map((p) =>
            selectedPostIds.has(p.id)
              ? { ...p, scheduled_at: formatDateForDatabase(finalDateTime) }
              : p
          )
        );

        toast.success(`${selectedPostIds.size}件の投稿を${finalDateTime.toLocaleString('ja-JP')}に移動しました`);
        setSelectedPostIds(new Set());
        setIsMultiSelectMode(false);
        setPendingMove(null);
        return;
      } catch (error) {
        console.error('Failed to bulk move posts:', error);
        toast.error('一括移動に失敗しました');
        return;
      }
    }

    try {
      // 元の投稿を取得
      const originalPost = posts.find(p => p.id === pendingMove.postId);
      if (!originalPost) {
        console.error('Post not found');
        return;
      }

      const isPublished = originalPost.state === 'published';

      if (isPublished) {
        // 公開済み投稿の場合：同じ内容で再投稿（新しい投稿として作成）
        if (!confirm('この投稿を選択した日時に再投稿しますか？\n（元の投稿は削除されます）')) {
          setPendingMove(null);
          return;
        }

        try {
          // 新規予約投稿として作成（スレッドデータも含む）
          const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              account_id: originalPost.account_id,
              caption: originalPost.caption,
              media: originalPost.media || [],
              threads: originalPost.threads || null,
              scheduled_at: formatDateForDatabase(finalDateTime),
              publish_now: false,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to repost');
          }

          const result = await response.json();

          // 元の投稿を削除
          await supabase
            .from('posts')
            .delete()
            .eq('id', pendingMove.postId);

          // 新しい投稿を追加
          setPosts((prev) => [
            ...prev.filter(p => p.id !== pendingMove.postId),
            result.post
          ]);

          toast.success(`投稿を${finalDateTime.toLocaleString('ja-JP')}に再予約しました`);
          console.log(`✅ Post rescheduled to ${finalDateTime.toLocaleString('ja-JP')}`);
        } catch (error) {
          console.error('Failed to repost:', error);
          toast.error('再投稿に失敗しました');
        }
      } else {
        // 予約投稿の場合：scheduled_atを更新
        const { error } = await supabase
          .from('posts')
          .update({
            scheduled_at: formatDateForDatabase(finalDateTime),
          })
          .eq('id', pendingMove.postId);

        if (error) {
          console.error('Error moving post:', error);
          toast.error('投稿の移動に失敗しました');
        } else {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === pendingMove.postId ? { ...p, scheduled_at: formatDateForDatabase(finalDateTime) } : p
            )
          );
          console.log(`✅ Post moved to ${finalDateTime.toLocaleString('ja-JP')}`);
        }
      }
    } catch (error) {
      console.error('Failed to move post:', error);
      toast.error('投稿の移動に失敗しました');
    } finally {
      setPendingMove(null);
    }
  };

  const handleCreatePost = async (
    caption: string,
    scheduledAt: Date,
    media: string[] = []
  ) => {
    try {
      const accId = localStorage.getItem('account_id');
      if (!accId) {
        toast.error('アカウント情報が見つかりません');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          account_id: accId,
          caption,
          scheduled_at: formatDateForDatabase(scheduledAt),
          state: 'scheduled',
          media: media,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        toast.error('投稿の作成に失敗しました');
      } else {
        setPosts((prev) => [...prev, data]);
        setIsCreatingPost(false);
        setCreatePostDate(null);

        const mediaText = media.length > 0 ? `（メディア${media.length}件）` : '';
        toast.success(`投稿を予約しました${mediaText}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('投稿の作成に失敗しました');
    }
  };

  const handleRecurringPostConfirm = async (config: RecurringConfig) => {
    if (!pendingRecurringPost || !recurringBaseDate || !accountId) return;

    try {
      const { caption, media, threads } = pendingRecurringPost;
      const createdPosts: Post[] = [];
      let currentDate = new Date(recurringBaseDate);

      for (let i = 0; i < config.count; i++) {
        let nextDate: Date;

        if (config.frequency === 'daily') {
          nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + (i * config.interval));
        } else if (config.frequency === 'weekly') {
          // 週次の場合、指定された曜日に投稿を作成
          if (!config.daysOfWeek || config.daysOfWeek.length === 0) continue;

          const weekOffset = Math.floor(i / config.daysOfWeek.length);
          const dayIndex = i % config.daysOfWeek.length;
          const targetDay = config.daysOfWeek[dayIndex];

          nextDate = new Date(currentDate);
          nextDate.setDate(nextDate.getDate() + (weekOffset * 7 * config.interval));

          // 指定された曜日に調整
          const currentDay = nextDate.getDay();
          const daysToAdd = (targetDay - currentDay + 7) % 7;
          nextDate.setDate(nextDate.getDate() + daysToAdd);
        } else { // monthly
          nextDate = new Date(currentDate);
          nextDate.setMonth(nextDate.getMonth() + (i * config.interval));
        }

        // 終了日を超えたらスキップ
        if (nextDate > config.endDate) continue;

        const { data, error } = await supabase
          .from('posts')
          .insert({
            account_id: accountId,
            caption,
            scheduled_at: formatDateForDatabase(nextDate),
            state: 'scheduled',
            media: media,
            threads: threads.length > 0 ? threads : null,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (!error && data) {
          createdPosts.push(data);
        }
      }

      if (createdPosts.length > 0) {
        setPosts((prev) => [...prev, ...createdPosts]);
        toast.success(`${createdPosts.length}件の繰り返し投稿を作成しました`);
      } else {
        toast.warning('投稿が作成されませんでした');
      }

      setPendingRecurringPost(null);
      setRecurringBaseDate(null);
      setIsCreatingPost(false);
    } catch (error) {
      console.error('Failed to create recurring posts:', error);
      toast.error('繰り返し投稿の作成に失敗しました');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - X style mobile-first */}
        <header className="h-14 md:h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 md:gap-4 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-foreground">カレンダー</h1>
            {/* View toggle - compact on mobile */}
            <div className="flex items-center gap-0.5 md:gap-1 bg-secondary/50 rounded-full p-0.5 md:p-1">
              <button
                onClick={() => setCurrentView('month')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                  currentView === 'month'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                月
              </button>
              <button
                onClick={() => setCurrentView('week')}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                  currentView === 'week'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                週
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isMultiSelectMode && selectedPostIds.size > 0 && (
              <span className="text-sm text-primary font-medium">
                {selectedPostIds.size}件選択中
              </span>
            )}
            <button
              onClick={handleToggleMultiSelect}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                isMultiSelectMode
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              {isMultiSelectMode ? '完了' : '選択'}
            </button>
            <button
              onClick={fetchPosts}
              disabled={isLoading}
              className="p-2 hover:bg-secondary/80 rounded-full transition-colors disabled:opacity-50"
              title="投稿を再読み込み"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Failed posts notification banner */}
        {posts.filter(p => p.state === 'failed').length > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-destructive" />
                <p className="text-sm font-medium text-destructive">
                  {posts.filter(p => p.state === 'failed').length}件の投稿が失敗しました
                </p>
              </div>
              <button
                onClick={() => {
                  const failedPosts = posts.filter(p => p.state === 'failed');
                  if (failedPosts.length > 0) {
                    setSelectedPost(failedPosts[0]);
                  }
                }}
                className="text-xs font-medium text-destructive hover:underline"
              >
                確認する
              </button>
            </div>
          </div>
        )}

        {/* Calendar content - mobile optimized with bottom nav spacing */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">投稿を読み込み中...</p>
              </div>
            </div>
          ) : !accountId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <CalendarIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Threadsアカウントに接続</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  投稿をスケジュールするにはアカウントを接続してください
                </p>
                <Link href="/api/auth/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    接続する
                  </Button>
                </Link>
              </div>
            </div>
          ) : currentView === 'week' ? (
            <div className="bg-card border-0 md:border md:border-border rounded-none md:rounded-lg shadow-none md:shadow-sm">
              <WeekView
                posts={posts}
                onPostClick={handlePostClick}
                onSlotClick={handleSlotClick}
                onPostMove={handlePostMove}
              />
            </div>
          ) : (
            <div className="bg-card border-0 md:border md:border-border rounded-none md:rounded-lg shadow-none md:shadow-sm">
              <MonthView
                posts={posts}
                onPostClick={handlePostClick}
                onSlotClick={handleSlotClick}
                onPostMove={handlePostMove}
                isMultiSelectMode={isMultiSelectMode}
                selectedPostIds={selectedPostIds}
              />
            </div>
          )}
        </div>

        {/* 投稿編集モーダル */}
        {selectedPost && (
          <PostModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={handleUpdatePost}
            onDelete={handleDeletePost}
            onPublish={handlePublishPost}
          />
        )}

        {/* 新規投稿モーダル */}
        {isCreatingPost && createPostDate && (
          <PostCreateModal
            onClose={() => {
              setIsCreatingPost(false);
              setCreatePostDate(null);
            }}
            onCreate={handleCreatePost}
            onCreateRecurring={(caption, scheduledAt, media, threads) => {
              setPendingRecurringPost({ caption, media, threads });
              setRecurringBaseDate(scheduledAt);
              setIsRecurringModalOpen(true);
            }}
            initialDate={createPostDate}
          />
        )}

        {/* 繰り返し投稿モーダル */}
        {isRecurringModalOpen && recurringBaseDate && (
          <RecurringPostModal
            isOpen={isRecurringModalOpen}
            onClose={() => {
              setIsRecurringModalOpen(false);
              setPendingRecurringPost(null);
              setRecurringBaseDate(null);
            }}
            onConfirm={handleRecurringPostConfirm}
            initialDate={recurringBaseDate}
          />
        )}

        {/* 時刻選択モーダル */}
        {isTimePickerOpen && pendingMove && (
          <TimePickerModal
            isOpen={isTimePickerOpen}
            onClose={() => {
              setIsTimePickerOpen(false);
              setPendingMove(null);
            }}
            onConfirm={handleTimeConfirm}
            initialDate={pendingMove.newDate}
            postCaption={posts.find(p => p.id === pendingMove.postId)?.caption}
          />
        )}

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-5 h-14">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">ホーム</span>
            </Link>
            <Link href="/calendar" className="flex flex-col items-center justify-center gap-1 text-primary transition-colors">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-[10px] font-medium">予定</span>
            </Link>
            <Link href="/auto-reply" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-medium">自動返信</span>
            </Link>
            <Link href="/composer" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">投稿</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">設定</span>
            </Link>
          </div>
        </nav>

        {/* Toast Notifications */}
        <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
      </main>
    </div>
  );
}
