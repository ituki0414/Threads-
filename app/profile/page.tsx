'use client';

import { useState, useEffect } from 'react';
import { User, BarChart3, Calendar, Link as LinkIcon, LogOut, Home, Plus, Zap } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ProfileData {
  account: {
    id: string;
    username: string;
    threadsUserId: string;
    profilePicture?: string;
    connectedAt: string;
  };
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalSaves: number;
    totalEngagement: number;
    avgSaveRate: number;
  };
}

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const accId = localStorage.getItem('account_id');
      console.log('🔑 Account ID from localStorage:', accId);
      setAccountId(accId || null);

      if (!accId) {
        console.log('❌ No account ID found');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/profile?account_id=${accId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Profile data:', data);
        setProfile(data);
      } else {
        console.error('❌ Failed to fetch profile:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Threadsアカウントとの連携を解除しますか？')) {
      localStorage.removeItem('account_id');
      setAccountId(null);
      setProfile(null);
      alert('アカウントの連携を解除しました');
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, []);

  if (!mounted) {
    return null;
  }

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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">プロフィール</h1>
        </header>

        {/* Profile content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">読み込み中...</p>
              </div>
            </div>
          ) : !accountId || !profile ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <User className="w-16 h-16 text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Threadsアカウントに接続</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  プロフィールを表示するにはアカウントを接続してください
                </p>
                <Link href="/api/auth/login">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    接続する
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* プロフィールカード */}
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {profile.account.profilePicture ? (
                        <img
                          src={profile.account.profilePicture}
                          alt={profile.account.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-1">
                        @{profile.account.username}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-3">
                        連携日: {new Date(profile.account.connectedAt).toLocaleDateString('ja-JP')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-success/10 text-success text-sm font-semibold rounded-full flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          連携中
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleDisconnect}
                      className="bg-secondary text-foreground hover:bg-secondary/80"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      連携解除
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 統計カード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 総投稿数 */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="w-5 h-5 text-primary" />
                      総投稿数
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {profile.stats.totalPosts}
                    </div>
                    <p className="text-sm text-muted-foreground">公開済み投稿</p>
                  </CardContent>
                </Card>

                {/* 総エンゲージメント */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      総エンゲージメント
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {profile.stats.totalEngagement.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {profile.stats.totalLikes} いいね · {profile.stats.totalComments} コメント · {profile.stats.totalSaves} 保存
                    </p>
                  </CardContent>
                </Card>

                {/* 平均保存率 */}
                <Card className="border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      平均保存率
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {profile.stats.avgSaveRate}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      全投稿の平均値
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* エンゲージメント詳細 */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">エンゲージメント内訳</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* いいね */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">いいね</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.stats.totalLikes.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (profile.stats.totalLikes / profile.stats.totalEngagement) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* コメント */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">コメント</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.stats.totalComments.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (profile.stats.totalComments / profile.stats.totalEngagement) * 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* 保存 */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground">保存</span>
                        <span className="text-sm font-semibold text-foreground">
                          {profile.stats.totalSaves.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (profile.stats.totalSaves / profile.stats.totalEngagement) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* アカウント情報 */}
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">アカウント情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">ユーザーID</span>
                      <span className="text-sm font-mono text-foreground">{profile.account.threadsUserId}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">ユーザー名</span>
                      <span className="text-sm text-foreground">@{profile.account.username}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">連携日時</span>
                      <span className="text-sm text-foreground">
                        {new Date(profile.account.connectedAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-5 h-14">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">ホーム</span>
            </Link>
            <Link
              href="/calendar"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">予定</span>
            </Link>
            <Link
              href="/auto-reply"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-medium">自動返信</span>
            </Link>
            <Link
              href="/composer"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">投稿</span>
            </Link>
            <Link
              href="/profile"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-primary"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">設定</span>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
