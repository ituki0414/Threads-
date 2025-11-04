'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertCircle, Plus, Zap, Calendar, MessageSquare, BarChart3, Shield, ArrowRight, Check, Bot, Sparkles, Target } from 'lucide-react';
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
        <header className="bg-black border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center">
                <span className="text-black text-sm font-bold">ス</span>
              </div>
              <span className="text-lg font-bold text-white">スレぽす</span>
            </div>
            <nav className="flex items-center gap-8">
              <Link href="/privacy-policy" className="text-sm text-gray-400 hover:text-white transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-400 hover:text-white transition-colors">
                利用規約
              </Link>
              <Link href="/api/auth/login">
                <button className="px-5 py-2 bg-yellow-400 text-black text-sm font-bold rounded-md hover:bg-yellow-300 transition-colors">
                  ログイン
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section - Two Column */}
        <section className="bg-white pt-16 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  ワクワクする<br />
                  <span className="text-yellow-400">Threads運用</span>を<br />
                  始めませんか？
                </h1>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  予約投稿、自動返信、リアルタイム分析など<br />
                  最高峰の機能を
                </p>
                <p className="text-lg text-gray-700 mb-2">
                  初回登録時<span className="font-bold text-yellow-500">無料</span>、30日間<span className="font-bold text-yellow-500">無料</span>、月額費用も
                </p>
                <p className="text-3xl font-bold text-yellow-500 mb-8">
                  7,000円<span className="text-lg text-gray-600">(税別)</span>〜と低価格なので始めやすい！
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/api/auth/login">
                    <button className="px-8 py-4 bg-yellow-400 text-black text-base font-bold rounded-md hover:bg-yellow-300 transition-colors shadow-lg">
                      無料トライアル
                    </button>
                  </Link>
                  <button className="px-8 py-4 bg-white text-gray-700 text-base font-medium rounded-md border-2 border-gray-300 hover:border-gray-400 transition-colors">
                    制作実績を見る
                  </button>
                </div>
              </div>

              {/* Right: Visual/Image Placeholder */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">予約投稿</div>
                    <div className="text-xs text-gray-600">最適な時間に自動投稿</div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg transform rotate-3 hover:rotate-0 transition-transform mt-8">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">自動返信</div>
                    <div className="text-xs text-gray-600">24時間自動対応</div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg transform -rotate-2 hover:rotate-0 transition-transform">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">詳細分析</div>
                    <div className="text-xs text-gray-600">データで改善</div>
                  </div>
                  <div className="bg-gray-100 rounded-2xl p-6 border-2 border-gray-200 shadow-lg transform rotate-2 hover:rotate-0 transition-transform mt-8">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg mb-4 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">AI最適化</div>
                    <div className="text-xs text-gray-600">自動で最適化</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What is Section - Black Background */}
        <section className="bg-black py-24 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-96 h-96 border-4 border-yellow-400 rounded-full opacity-20"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <div className="text-yellow-400 text-sm font-bold mb-4 tracking-wider">THREADS運用CMS</div>
              <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
                <span className="text-yellow-400">スレぽす</span>とは？
              </h2>
              <p className="text-2xl text-white mb-4 font-bold">
                ピッと パッと サクっと、
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                <span className="text-yellow-400 font-bold">セキュアなThreads運用・自動返信サイト</span>を<br />
                簡単に早く作成できる国産CMSです。
              </p>
            </div>
          </div>
        </section>

        {/* Features Cards - White Background */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Feature Card 1 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-3 text-sm">
                  オンデマンド配信<br />
                  <span className="text-xs font-normal">(収録した動画を配信)</span>
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  最適なタイミングで予約投稿。カレンダーで一目管理。
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-3 text-sm">
                  自動返信+チャット<br />
                  <span className="text-xs font-normal">リアルタイムで映像と音声を配信</span>
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  キーワード検知で即座に自動返信。
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-3 text-sm">
                  会員制機能
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  Meta公式API使用。安全にデータを管理。
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Target className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-3 text-sm">
                  決済機能<br />
                  <span className="text-xs font-normal">(手数料2.59%〜)</span>
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  低コストで決済機能を実装可能。
                </p>
              </div>

              {/* Feature Card 5 */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-100 hover:border-yellow-400 transition-all hover:shadow-xl">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-center font-bold text-gray-900 mb-3 text-sm">
                  導入から運用まで<br />
                  <span className="text-xs font-normal">徹底サポート</span>
                </h3>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  専門スタッフが全面サポート。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases - Light Gray Background */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                こんな方におすすめ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Threads運用に時間をかけられない方</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">予約投稿で効率化。時間を有効活用できます。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">エンゲージメントを高めたい方</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">自動返信で24時間対応。機会損失を防ぎます。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">データに基づいて運用したい方</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">詳細な分析機能で戦略的な運用が可能。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">複数アカウントを管理している方</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">一つのダッシュボードで効率的に管理。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Black Background */}
        <section className="bg-black py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              今すぐThreads運用を効率化
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              無料でアカウント作成。すべての機能を今すぐお試しください。
            </p>
            <Link href="/api/auth/login">
              <button className="inline-flex items-center gap-2 px-12 py-5 bg-yellow-400 text-black text-lg font-bold rounded-md hover:bg-yellow-300 transition-colors shadow-2xl">
                無料で始める
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="mt-6 text-sm text-gray-400">
              3分で完了・クレジットカード不要・いつでもキャンセル可能
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-yellow-400 rounded-md flex items-center justify-center">
                  <span className="text-black text-xs font-bold">ス</span>
                </div>
                <span className="font-bold text-white">スレぽす</span>
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
                © 2025 スレぽす by 合同会社LESS.
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
