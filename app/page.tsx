'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertCircle, Plus, Zap, Calendar, MessageSquare, BarChart3, Shield, ArrowRight, Check, Home, User } from 'lucide-react';
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
      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        console.warn('⚠️ No account_id found - using default best time');
        setBestTime({ hour: 19, minute: 30 });
        setTopInsights([
          '過去の投稿データを分析中...',
          'より多くの投稿データが蓄積されると、より正確な分析が可能になります',
        ]);
        return;
      }

      const response = await fetch(`/api/analytics/best-time?account_id=${accountId}`);
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
      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        console.warn('⚠️ No account_id found - skipping progress calculation');
        return;
      }

      const response = await fetch(`/api/analytics/progress?account_id=${accountId}`);
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

    // URLパラメータからaccount_idを取得（認証コールバック後）
    const urlParams = new URLSearchParams(window.location.search);
    const urlAccountId = urlParams.get('account_id');
    const connected = urlParams.get('connected');

    if (connected === 'true' && urlAccountId) {
      // 認証成功後、LocalStorageにaccount_idを保存
      localStorage.setItem('account_id', urlAccountId);
      setShowConnectedMessage(true);
      // URLパラメータをクリーンアップ
      window.history.replaceState({}, '', '/');
    }

    // LocalStorageでログイン状態を確認
    const accountId = localStorage.getItem('account_id');

    // 開発環境でログインをスキップ（ダッシュボードを常に表示）
    const isDevelopment = process.env.NODE_ENV === 'development';
    setIsLoggedIn(isDevelopment || !!accountId);

    if (accountId || isDevelopment) {
      calculateBestTime();
      calculateProgress();

      // 開発環境用のモックデータ
      if (isDevelopment && !accountId) {
        setRecentPosts([
          {
            id: '1',
            caption: 'Threadsの自動返信ツールがあんま良さげなのない。自分で開発しようかな 同じ意見の人いる?👍',
            publishedAt: '2025/10/30',
            saveRate: 0,
            media: [],
            metrics: { likes: 0, comments: 0, saves: 0 }
          },
          {
            id: '2',
            caption: '家庭用ロボ NEO の中身👍 身長：168cm（人と同じ目線） 体重：30kg（スーツケース1つ分） 持てる重さ：70kg（大人1人分） 運べる重さ：25kg（重い段ボールも） 手：人間と同じ5本指（細かい家事OK） 動き：筋肉...',
            publishedAt: '2025/10/30',
            saveRate: 0,
            media: ['https://example.com/image.jpg'],
            metrics: { likes: 0, comments: 0, saves: 0 }
          },
          {
            id: '3',
            caption: '月末の"請求書カオス"、AIで一発でチェックするツール作りました！ 請求書メールの確認...で毎回30分、見落としたって関係先に迷惑。今はn8nのシンプルフローで👇 ①Gmailの請求書PDFを自動リサーチ ②Googl...',
            publishedAt: '2025/10/30',
            saveRate: 16.7,
            media: ['https://example.com/image2.jpg'],
            metrics: { likes: 12, comments: 3, saves: 2 }
          }
        ]);
      }
    }

    // URLパラメータをチェック
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      const newAccountId = params.get('account_id');
      if (newAccountId) {
        localStorage.setItem('account_id', newAccountId);
        console.log('✅ Account ID saved to localStorage:', newAccountId);

        // ログイン完了後、カレンダーページにリダイレクト
        window.location.href = '/calendar';
        return; // リダイレクト後は処理を停止
      }
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
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">ス</span>
              </div>
              <span className="text-lg font-bold text-gray-900">スレぽす</span>
            </div>
            <nav className="flex items-center gap-8">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                プライバシーポリシー
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
                利用規約
              </Link>
              <Link href="/api/auth/login">
                <button className="px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors">
                  ログイン
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-white pt-20 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Threads運用を自動化する<br />
                オールインワンツール
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                予約投稿・自動返信・詳細分析。<br />
                運用に必要な機能をすべて、一つのプラットフォームで。
              </p>
              <Link href="/api/auth/login">
                <button className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 text-white text-base font-semibold rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                  無料で始める
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                クレジットカード不要・3分で開始
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                選ばれる理由
              </h2>
              <p className="text-lg text-gray-600">
                スレぽすが、Threads運用を効率化します
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <Calendar className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">予約投稿</h3>
                <p className="text-gray-600 leading-relaxed">
                  AIが最適な投稿時間を分析。カレンダービューで直感的にスケジュール管理。
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">自動返信</h3>
                <p className="text-gray-600 leading-relaxed">
                  キーワード検知で自動リプライ。24時間体制でエンゲージメント維持。
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">詳細分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  投稿パフォーマンスを可視化。データドリブンな戦略立案が可能。
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">ベストタイム分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  過去データから最適な投稿時間を自動提案。エンゲージメント最大化。
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">安心のセキュリティ</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meta公式API使用。データは暗号化され、プライバシー保護を徹底。
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">柔軟なカスタマイズ</h3>
                <p className="text-gray-600 leading-relaxed">
                  自動返信ルールや投稿設定を自由に調整。運用スタイルに合わせて。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                使い方はシンプル
              </h2>
              <p className="text-lg text-gray-600">
                3ステップで今すぐ始められます
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white text-2xl font-bold rounded-full mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">アカウント接続</h3>
                <p className="text-gray-600 leading-relaxed">
                  Threadsアカウントを安全に接続。Meta公式APIを使用。
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white text-2xl font-bold rounded-full mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">投稿を作成</h3>
                <p className="text-gray-600 leading-relaxed">
                  テキストや画像を追加。最適な時間に予約投稿を設定。
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white text-2xl font-bold rounded-full mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">分析・改善</h3>
                <p className="text-gray-600 leading-relaxed">
                  投稿パフォーマンスを分析。データに基づいて運用を最適化。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-blue-50 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                こんな方におすすめ
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                <Check className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Threads運用に時間をかけられない</h3>
                  <p className="text-gray-600 text-sm">予約投稿で効率化。時間を有効活用できます。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                <Check className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">エンゲージメントを高めたい</h3>
                  <p className="text-gray-600 text-sm">自動返信で24時間対応。機会損失を防ぎます。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                <Check className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">データに基づいて運用したい</h3>
                  <p className="text-gray-600 text-sm">詳細な分析機能で戦略的な運用が可能。</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-lg">
                <Check className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">複数アカウントを管理している</h3>
                  <p className="text-gray-600 text-sm">一つのダッシュボードで効率的に管理。</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              今すぐThreads運用を効率化
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              無料でアカウント作成。すべての機能を今すぐお試しください。
            </p>
            <Link href="/api/auth/login">
              <button className="inline-flex items-center gap-2 px-10 py-4 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600 transition-colors shadow-sm">
                無料で始める
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <p className="mt-6 text-sm text-gray-500">
              3分で完了・クレジットカード不要・いつでもキャンセル可能
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ス</span>
                </div>
                <span className="font-bold text-gray-900">スレぽす</span>
              </div>
              <div className="flex items-center gap-8">
                <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
                  プライバシーポリシー
                </Link>
                <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900">
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
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 接続完了メッセージ */}
        {showConnectedMessage && (
          <div className="fixed top-4 right-4 z-50 animate-slide-up">
            <div className="bg-success text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Threadsアカウントに接続しました！</span>
            </div>
          </div>
        )}

        {/* Top bar - X style mobile-first */}
        <header className="h-14 md:h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <h1 className="text-lg md:text-xl font-semibold text-foreground">ダッシュボード</h1>
          <Link href="/composer">
            <button className="p-2 hover:bg-secondary/80 rounded-full transition-colors md:px-4 md:py-2 md:rounded-full md:bg-primary md:text-primary-foreground md:hover:bg-primary/90">
              <Plus className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">新規投稿</span>
            </button>
          </Link>
        </header>

        {/* Dashboard content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">
          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
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
                      <div className="flex gap-3">
                        {post.media && post.media.length > 0 ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                            <img
                              src={post.media[0]}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                              公開済み
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                            </span>
                            <div className="ml-auto text-right">
                              <div className="text-xs text-gray-500">保存率</div>
                              <div className="text-sm font-bold text-gray-900">
                                {post.saveRate}%
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                            {post.caption || '(本文なし)'}
                          </p>
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

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-5 h-14">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-primary"
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
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
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
