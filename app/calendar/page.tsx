'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar as CalendarIcon, Plus, RefreshCw, Home, User, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { PostModal } from '@/components/PostModal';
import { PostCreateModal } from '@/components/PostCreateModal';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Post } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function CalendarPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [createPostDate, setCreatePostDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'week' | 'month'>('month');

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

      // Supabaseから投稿を取得（予約投稿と公開済み投稿）
      // Limit increased to 10000 to fetch all posts (default is 1000)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('account_id', accId)
        .in('state', ['scheduled', 'published'])
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(10000);

      if (error) {
        console.error('❌ Error fetching posts:', error);
      } else {
        console.log('✅ Fetched posts from Supabase:', data);
        console.log('📊 Posts count:', data?.length || 0);

        // 10月30日の投稿を確認
        const oct30Posts = data?.filter(p => {
          const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return date.getDate() === 30 && date.getMonth() === 9;
        });
        console.log('🔍 Oct 30 posts count:', oct30Posts?.length || 0);
        console.log('🔍 Oct 30 posts:', oct30Posts?.map(p => ({
          threads_post_id: p.threads_post_id,
          caption: p.caption?.substring(0, 30),
          published_at: p.published_at
        })));

        console.log('📅 Sample posts:', data?.slice(0, 5).map(p => ({
          id: p.id,
          caption: p.caption?.substring(0, 30),
          scheduled_at: p.scheduled_at,
          published_at: p.published_at,
          state: p.state
        })));
        setPosts(data || []);
      }
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
      if (result.synced > 0) {
        const accId = localStorage.getItem('account_id');
        if (accId) {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('account_id', accId)
            .in('state', ['scheduled', 'published'])
            .order('published_at', { ascending: false, nullsFirst: false })
            .limit(10000);

          if (!error && data) {
            setPosts(data);
            console.log(`🔄 Updated posts after sync: ${data.length} total`);
          }
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

    return () => {
      clearInterval(syncInterval);
      clearInterval(metricsInterval);
    };
  }, []);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleSlotClick = (date: Date) => {
    console.log('Slot clicked:', date);
    setCreatePostDate(date);
    setIsCreatingPost(true);
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
        alert('投稿の更新に失敗しました');
      } else {
        setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
        setSelectedPost(null);
        alert('投稿を更新しました');
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
        alert('投稿の削除に失敗しました');
      } else {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setSelectedPost(null);
        alert('投稿を削除しました');
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          state: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) {
        console.error('Error publishing post:', error);
        alert('投稿の公開に失敗しました');
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, state: 'published' as const, published_at: new Date().toISOString() }
              : p
          )
        );
        setSelectedPost(null);
        alert('投稿を公開しました');
      }
    } catch (error) {
      console.error('Failed to publish post:', error);
      alert('投稿の公開に失敗しました');
    }
  };

  const handlePostMove = async (postId: string, newDate: Date) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          scheduled_at: newDate.toISOString(),
        })
        .eq('id', postId);

      if (error) {
        console.error('Error moving post:', error);
        alert('投稿の移動に失敗しました');
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, scheduled_at: newDate.toISOString() } : p
          )
        );
      }
    } catch (error) {
      console.error('Failed to move post:', error);
      alert('投稿の移動に失敗しました');
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
        alert('アカウント情報が見つかりません');
        return;
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          account_id: accId,
          caption,
          scheduled_at: scheduledAt.toISOString(),
          state: 'scheduled',
          media: media,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        alert('投稿の作成に失敗しました');
      } else {
        setPosts((prev) => [...prev, data]);
        setIsCreatingPost(false);
        setCreatePostDate(null);

        const mediaText = media.length > 0 ? `（メディア${media.length}件）` : '';
        alert(`投稿を予約しました${mediaText}`);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('投稿の作成に失敗しました');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - Buffer style */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground">カレンダー</h1>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setCurrentView('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === 'week'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                週
              </button>
              <button
                onClick={() => setCurrentView('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentView === 'month'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                }`}
              >
                月
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchPosts}
              disabled={isLoading}
              className="p-2 hover:bg-secondary rounded-lg transition-colors disabled:opacity-50"
              title="投稿を再読み込み"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Calendar content */}
        <div className="flex-1 overflow-auto bg-background p-6">
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
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <WeekView
                posts={posts}
                onPostClick={handlePostClick}
                onSlotClick={handleSlotClick}
                onPostMove={handlePostMove}
              />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg shadow-sm">
              <MonthView
                posts={posts}
                onPostClick={handlePostClick}
                onSlotClick={handleSlotClick}
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
            initialDate={createPostDate}
          />
        )}
      </main>
    </div>
  );
}
