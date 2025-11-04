'use client';

import { useState, useEffect } from 'react';
import { Clock, TrendingUp, CheckCircle, AlertCircle, Plus, Zap, Calendar, MessageSquare, BarChart3, Shield, ArrowRight, Check, Sparkles, Bot, Target } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white text-base font-bold">ス</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">スレぽす</span>
            </div>
            <nav className="flex items-center gap-8">
              <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms-of-service" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                利用規約
              </Link>
              <Link href="/api/auth/login">
                <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300">
                  ログイン
                </button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Background gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-8 border border-indigo-200/50"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI搭載の次世代Threads自動化ツール
                </span>
              </motion.div>

              <h1 className="text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                Threads運用を<br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  完全自動化
                </span>
              </h1>

              <p className="text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
                予約投稿・自動返信・AI分析。運用に必要な機能をすべて、一つのプラットフォームで。
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Link href="/api/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:shadow-2xl hover:shadow-indigo-500/50 transition-all duration-300 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      無料で始める
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.button>
                </Link>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>クレカ不要</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>3分で開始</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>いつでもキャンセル可</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section - Bento Grid Style */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    パワフル
                  </span>
                  な機能
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Threads運用を完全自動化する、すべてが揃ったプラットフォーム
                </p>
              </motion.div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Feature Card 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 group relative bg-gradient-to-br from-indigo-50 to-purple-50 p-10 rounded-3xl border border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">AI予約投稿</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    AIが過去データを分析し、最適な投稿時間を自動提案。カレンダービューで直感的にスケジュール管理が可能。
                  </p>
                </div>
              </motion.div>

              {/* Small Feature Card 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative bg-white p-8 rounded-3xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/30">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">自動返信</h3>
                <p className="text-gray-600 leading-relaxed">
                  24時間体制でキーワード検知。自動リプライでエンゲージメント維持。
                </p>
              </motion.div>

              {/* Small Feature Card 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group relative bg-white p-8 rounded-3xl border border-gray-200 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">詳細分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  投稿パフォーマンスを可視化。データドリブンな戦略立案。
                </p>
              </motion.div>

              {/* Large Feature Card 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="md:col-span-2 group relative bg-gradient-to-br from-purple-50 to-pink-50 p-10 rounded-3xl border border-purple-100 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">AIアシスタント</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    投稿文の自動生成、トレンド分析、最適化提案まで。AIがあなたのThreads運用をサポート。
                  </p>
                </div>
              </motion.div>

              {/* Tall Feature Card 5 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="md:row-span-2 group relative bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">安心のセキュリティ</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Meta公式API使用。エンタープライズグレードのセキュリティでデータを保護。
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>データ暗号化</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Meta公式認証</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>GDPR準拠</span>
                  </div>
                </div>
              </motion.div>

              {/* Medium Feature Card 6 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="md:col-span-2 group relative bg-white p-8 rounded-3xl border border-gray-200 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">パフォーマンス最適化</h3>
                <p className="text-gray-600 leading-relaxed">
                  リアルタイムで投稿パフォーマンスを追跡。A/Bテスト、エンゲージメント分析で継続的に改善。
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative py-32 overflow-hidden">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YTQgNCAwIDAgMCA4IDB2OGE0IDQgMCAwIDAtOCAwdi04ek0yMCA0NGE0IDQgMCAwIDAgOCAwdi04YTQgNCAwIDAgMC04IDB2OHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

          <div className="relative max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-6xl font-extrabold text-white mb-8 leading-tight">
                Threads運用を、<br />
                今すぐ自動化しよう
              </h2>
              <p className="text-2xl text-indigo-100 mb-12 max-w-3xl mx-auto">
                クレジットカード不要。3分で始められます。
              </p>

              <Link href="/api/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-12 py-6 bg-white text-purple-600 text-xl font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    無料で始める
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </motion.button>
              </Link>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>クレカ登録不要</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>今すぐ利用開始</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>いつでもキャンセル</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-gray-900 to-gray-800 border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white text-base font-bold">ス</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">スレぽす</span>
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
