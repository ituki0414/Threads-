'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);

  useEffect(() => {
    setMounted(true);

    // URLパラメータをチェック
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      // アカウントIDをLocalStorageに保存
      const accountId = params.get('account_id');
      if (accountId) {
        localStorage.setItem('account_id', accountId);
        console.log('✅ Account ID saved to localStorage:', accountId);
      }

      setShowConnectedMessage(true);
      // 3秒後にメッセージを非表示
      setTimeout(() => setShowConnectedMessage(false), 3000);
      // URLからパラメータを削除
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // モックデータ
  const bestTime = { hour: 19, minute: 30 };
  const weeklyProgress = { completed: 3, target: 5 };
  const streakDays = 7;
  const pendingApprovals = 5;
  const insights = [
    '保存率↑：冒頭に結論を置いた投稿が反応良好',
    '19:30-20:00の投稿が最も高いエンゲージメント',
    'コメント返信の速度が先週比50%改善',
  ];

  // 固定値のモックデータ（ランダムではなく）
  const recentPosts = [
    { id: 1, saveRate: 9.2, daysAgo: 1 },
    { id: 2, saveRate: 12.5, daysAgo: 2 },
    { id: 3, saveRate: 8.7, daysAgo: 3 },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* 接続完了メッセージ */}
      {showConnectedMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-up">
          <div className="bg-success text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Threadsアカウントに接続しました！</span>
          </div>
        </div>
      )}

      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-foreground">ダッシュボード</h1>
          <Link href="/composer">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              新規投稿
            </Button>
          </Link>
        </header>

        {/* Dashboard content */}
        <div className="flex-1 overflow-auto bg-background p-6">
          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* おすすめ時間カード */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-5 h-5 text-primary" />
                  今日のおすすめ時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {bestTime.hour}:{bestTime.minute.toString().padStart(2, '0')}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  過去のデータから最も高いエンゲージメント
                </p>
                <Link href="/composer">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    この時間で予約する
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* 今週の進捗カード */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  今週の進捗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-foreground">{weeklyProgress.completed}</span>
                  <span className="text-muted-foreground">/ {weeklyProgress.target} 投稿</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mb-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(weeklyProgress.completed / weeklyProgress.target) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-warning/10 rounded-lg">
                  <span className="text-base">🔥</span>
                  <span className="text-sm font-medium text-foreground">連続{streakDays}日投稿中</span>
                </div>
              </CardContent>
            </Card>

            {/* 承認待ちカード */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className="w-5 h-5 text-warning" />
                  承認待ち
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-2">{pendingApprovals}</div>
                <p className="text-sm text-muted-foreground mb-4">件の確認が必要</p>
                <Link href="/inbox?filter=pending">
                  <Button variant="secondary" className="w-full bg-secondary text-foreground hover:bg-secondary/80">
                    受信箱で確認
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* インサイトカード */}
          <Card className="border-border shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">直近のインサイト</span>
                <Link href="/analytics" className="text-sm text-muted-foreground hover:text-foreground">
                  すべて見る
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近の投稿カード */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">最近の投稿</span>
                <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground">
                  すべて見る
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded">
                            配信済み
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <p className="text-sm text-foreground truncate">
                          サンプル投稿テキスト #{post.id}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-muted-foreground">保存率</div>
                        <div className="text-lg font-bold text-foreground">
                          {post.saveRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
