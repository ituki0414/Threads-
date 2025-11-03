'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertCircle, Plus, Zap, Calendar, MessageSquare, BarChart3, Shield, ArrowRight } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConnectedMessage, setShowConnectedMessage] = useState(false);
  const [bestTime, setBestTime] = useState<{ hour: number; minute: number } | null>(null);
  const [topInsights, setTopInsights] = useState<string[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState({ completed: 0, target: 5 });
  const [streakDays, setStreakDays] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [recentPosts, setRecentPosts] = useState<Array<{
    id: string;
    caption: string;
    publishedAt: string;
    saveRate: number;
    media: string[];
    metrics: { likes: number; comments: number; saves: number };
  }>>([]);

  // 最適な投稿時間を計算
  const calculateBestTime = async () => {
    try {
      const response = await fetch('/api/analytics/best-time');
      if (response.ok) {
        const data = await response.json();
        if (data.bestTime) {
          setBestTime(data.bestTime);
        }
        if (data.insights) {
          setTopInsights(data.insights);
        }
      }
    } catch (error) {
      console.error('Failed to fetch best time:', error);
      setBestTime({ hour: 19, minute: 30 });
      setTopInsights([
        '過去の投稿データを分析中...',
        'より多くの投稿データが蓄積されると、より正確な分析が可能になります',
      ]);
    }
  };

  // 週間進捗と連続投稿日数を計算
  const calculateProgress = async () => {
    try {
      const response = await fetch('/api/analytics/progress');
      if (response.ok) {
        const data = await response.json();
        if (data.weeklyProgress) {
          setWeeklyProgress(data.weeklyProgress);
        }
        if (data.streakDays !== undefined) {
          setStreakDays(data.streakDays);
        }
        if (data.pendingApprovals !== undefined) {
          setPendingApprovals(data.pendingApprovals);
        }
        if (data.recentPosts) {
          setRecentPosts(data.recentPosts);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  useEffect(() => {
    setMounted(true);

    // LocalStorageでログイン状態を確認
    const accountId = localStorage.getItem('account_id');
    setIsLoggedIn(!!accountId);

    if (accountId) {
      calculateBestTime();
      calculateProgress();
    }

    // URLパラメータをチェック
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      const newAccountId = params.get('account_id');
      if (newAccountId) {
        localStorage.setItem('account_id', newAccountId);
        setIsLoggedIn(true);
        console.log('✅ Account ID saved to localStorage:', newAccountId);
      }

      setShowConnectedMessage(true);
      setTimeout(() => setShowConnectedMessage(false), 3000);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  if (!mounted) {
    return null;
  }

  // ログインしていない場合：ランディングページを表示
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[12px] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                スレぽす
              </h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms-of-service" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                利用規約
              </Link>
              <Link href="/api/auth/login">
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 active:scale-95">
                  ログイン
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section - White background with gradient */}
        <section className="relative bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-white opacity-60"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
            <div className="inline-block mb-6 px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              Threads運用を自動化
            </div>
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              投稿管理を、<br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                もっとスマートに
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              予約投稿・自動返信・詳細分析を一つに。<br />
              ThreadsマーケティングをAIが最適化します。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/api/auth/login">
                <button className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-full hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 active:scale-95 flex items-center gap-2">
                  無料で始める
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              クレジットカード不要 • 3分で開始
            </p>
          </div>
        </section>

        {/* Problem Section - Dark background */}
        <section className="bg-gray-900 text-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold mb-6">
                Threads運用、<br className="md:hidden" />こんな悩みありませんか？
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-[20px] border border-gray-700">
                <div className="text-4xl mb-4">⏰</div>
                <h4 className="text-xl font-semibold mb-3">投稿時間がバラバラ</h4>
                <p className="text-gray-400 leading-relaxed">
                  最適な時間に投稿できず、エンゲージメントが伸びない
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-[20px] border border-gray-700">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-xl font-semibold mb-3">返信が追いつかない</h4>
                <p className="text-gray-400 leading-relaxed">
                  コメントやDMへの対応に時間がかかり、機会損失
                </p>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-[20px] border border-gray-700">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-xl font-semibold mb-3">分析ができない</h4>
                <p className="text-gray-400 leading-relaxed">
                  何が効果的なのかわからず、戦略が立てられない
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - White background */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                スレぽすが、すべて解決
              </h3>
              <p className="text-xl text-gray-600">
                Threads運用に必要な機能を、オールインワンで
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 予約投稿 */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">予約投稿</h4>
                <p className="text-gray-600 leading-relaxed">
                  AIが最適な投稿時間を分析。カレンダービューで直感的にスケジュール管理
                </p>
              </div>

              {/* 自動返信 */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">自動返信</h4>
                <p className="text-gray-600 leading-relaxed">
                  キーワード検知で自動リプライ。24時間体制でエンゲージメント維持
                </p>
              </div>

              {/* アナリティクス */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">詳細分析</h4>
                <p className="text-gray-600 leading-relaxed">
                  投稿パフォーマンスを可視化。データドリブンな戦略立案が可能
                </p>
              </div>

              {/* ベストタイム */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">ベストタイム分析</h4>
                <p className="text-gray-600 leading-relaxed">
                  過去データから最適な投稿時間を自動提案。エンゲージメント最大化
                </p>
              </div>

              {/* セキュリティ */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">安心のセキュリティ</h4>
                <p className="text-gray-600 leading-relaxed">
                  Meta公式API使用。データは暗号化され、プライバシー保護を徹底
                </p>
              </div>

              {/* カスタマイズ */}
              <div className="group bg-white p-8 rounded-[20px] border-2 border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-[16px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">柔軟なカスタマイズ</h4>
                <p className="text-gray-600 leading-relaxed">
                  自動返信ルールや投稿設定を自由に調整。あなた専用の運用スタイルを
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Gradient background */}
        <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 text-white py-24 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              今すぐThreads運用を<br />
              次のレベルへ
            </h3>
            <p className="text-xl mb-10 text-purple-100 leading-relaxed">
              無料でアカウント作成。すべての機能を今すぐお試しください
            </p>
            <Link href="/api/auth/login">
              <button className="px-12 py-5 bg-white text-purple-600 text-lg font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95">
                無料で始める
              </button>
            </Link>
            <p className="mt-6 text-sm text-purple-200">
              3分で完了 • クレジットカード不要 • いつでもキャンセル可能
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[10px] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">スレぽす</span>
              </div>
              <div className="flex items-center gap-8">
                <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
                <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
                  利用規約
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                © 2025 スレぽす by 合同会社LESS. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // ログイン済み：ダッシュボードを表示
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
                {bestTime ? (
                  <>
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
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground">分析中...</div>
                  </div>
                )}
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
                    style={{
                      width: `${Math.min(100, (weeklyProgress.completed / weeklyProgress.target) * 100)}%`
                    }}
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
                {(topInsights.length > 0 ? topInsights : [
                  '保存率↑：冒頭に結論を置いた投稿が反応良好',
                  '19:30-20:00の投稿が最も高いエンゲージメント',
                  'コメント返信の速度が先週比50%改善',
                ]).map((insight, index) => (
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
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <div key={post.id} className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {post.media && post.media.length > 0 ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-secondary">
                            <img
                              src={post.media[0]}
                              alt="投稿画像"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-secondary rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-semibold rounded">
                              公開済み
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground truncate">
                            {post.caption || '(本文なし)'}
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
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    公開済みの投稿がありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
