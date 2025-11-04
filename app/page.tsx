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
        <section className="bg-white pt-24 pb-32">
          <div className="max-w-7xl mx-auto px-6">
            {/* Problem Statement Banner */}
            <div className="mb-12 text-center lg:text-left">
              <div className="inline-block bg-red-50 border-l-4 border-red-500 px-6 py-3 mb-4">
                <p className="text-red-700 font-bold text-lg">
                  ⚠️ Threads投稿、毎日手動でやってませんか？
                </p>
              </div>
              <p className="text-gray-600 text-base">
                その時間、<span className="font-bold text-red-600">月20時間以上</span>も無駄にしています。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left: Text Content */}
              <div>
                <div className="inline-block bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-black mb-4 animate-pulse">
                  🔥 累計500社以上が導入
                </div>
                <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
                  Threads運用を<br />
                  <span className="text-yellow-400">自動化</span>して、<br />
                  <span className="relative">
                    売上3倍
                    <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 -z-10"></span>
                  </span>
                  に。
                </h1>
                <p className="text-xl text-gray-700 mb-2 leading-relaxed font-bold">
                  たった5分の設定で、<br />
                  <span className="text-yellow-500">あなたの代わりに24時間働く</span>AIアシスタント
                </p>
                <p className="text-base text-gray-600 mb-6">
                  予約投稿・自動返信・AI分析で<span className="font-bold">運用時間を80%削減</span>
                </p>

                {/* Social Proof */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
                    <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-white"></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">1,200人以上</span>のマーケターが利用中
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-10">
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-sm text-gray-600">今なら</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tight">
                      30日間無料
                    </p>
                  </div>
                  <p className="text-base text-gray-600 mb-3">その後も月額たったの</p>
                  <p className="text-4xl font-black text-gray-900 tracking-tight">
                    7,000<span className="text-2xl">円</span><span className="text-xl text-gray-500 font-normal ml-1">(税別)〜</span>
                  </p>
                  <p className="text-sm text-yellow-600 font-bold mt-2">
                    ※ 1日あたり約233円 = コーヒー1杯以下
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-3">
                  <Link href="/api/auth/login">
                    <button className="w-full sm:w-auto px-10 py-4 bg-yellow-400 text-black text-lg font-black rounded-lg hover:bg-yellow-300 transition-all shadow-xl hover:shadow-2xl hover:scale-105 relative overflow-hidden group">
                      <span className="relative z-10">30日間無料で試す →</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    </button>
                  </Link>
                  <div className="text-xs text-gray-500 flex items-start gap-1 mt-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>クレカ登録不要・3分で開始</span>
                  </div>
                </div>
              </div>

              {/* Right: Visual with Phone Mockup Style */}
              <div className="relative">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-3xl transform rotate-3 opacity-50"></div>

                {/* Main Content */}
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200 transform -rotate-2 hover:rotate-0 transition-transform">
                      <div className="w-14 h-14 bg-yellow-400 rounded-xl mb-3 flex items-center justify-center shadow-md">
                        <Calendar className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mb-1">予約投稿</div>
                      <div className="text-xs text-gray-500">最適な時間に自動投稿</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200 transform rotate-1 hover:rotate-0 transition-transform">
                      <div className="w-14 h-14 bg-yellow-400 rounded-xl mb-3 flex items-center justify-center shadow-md">
                        <BarChart3 className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mb-1">詳細分析</div>
                      <div className="text-xs text-gray-500">データで改善</div>
                    </div>
                  </div>
                  <div className="space-y-4 mt-12">
                    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200 transform rotate-2 hover:rotate-0 transition-transform">
                      <div className="w-14 h-14 bg-yellow-400 rounded-xl mb-3 flex items-center justify-center shadow-md">
                        <Bot className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mb-1">自動返信</div>
                      <div className="text-xs text-gray-500">24時間対応</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-xl border border-gray-200 transform -rotate-1 hover:rotate-0 transition-transform">
                      <div className="w-14 h-14 bg-yellow-400 rounded-xl mb-3 flex items-center justify-center shadow-md">
                        <Sparkles className="w-7 h-7 text-black" />
                      </div>
                      <div className="text-base font-bold text-gray-900 mb-1">AI最適化</div>
                      <div className="text-xs text-gray-500">自動で最適化</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section - Stats Banner */}
        <section className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-8">
              <p className="text-black font-black text-2xl">スレぽす導入企業の実績</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-5xl font-black text-black mb-2">3.2倍</p>
                <p className="text-sm text-black/80 font-bold">エンゲージメント増加</p>
              </div>
              <div>
                <p className="text-5xl font-black text-black mb-2">80%</p>
                <p className="text-sm text-black/80 font-bold">運用時間削減</p>
              </div>
              <div>
                <p className="text-5xl font-black text-black mb-2">24時間</p>
                <p className="text-sm text-black/80 font-bold">自動対応</p>
              </div>
              <div>
                <p className="text-5xl font-black text-black mb-2">500社+</p>
                <p className="text-sm text-black/80 font-bold">導入実績</p>
              </div>
            </div>
          </div>
        </section>

        {/* What is Section - Black Background */}
        <section className="bg-black py-32 relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] border-8 border-yellow-400 rounded-full opacity-10"></div>
          <div className="absolute left-10 bottom-10 w-32 h-32 border-4 border-yellow-400 rounded-full opacity-20"></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="max-w-4xl">
              <div className="text-yellow-400 text-xs font-black mb-6 tracking-[0.3em] uppercase">Threads運用を完全自動化</div>
              <h2 className="text-6xl font-black text-white mb-8 leading-[1.15] tracking-tight">
                <span className="text-yellow-400">寝ている間も、</span><br />
                あなたの代わりに働き続ける。
              </h2>
              <p className="text-3xl text-white mb-6 font-black leading-tight">
                ピッと設定、パッと投稿、サクっと成果。
              </p>
              <p className="text-2xl text-gray-300 leading-relaxed font-normal mb-8">
                <span className="text-yellow-400 font-bold">AIが最適な投稿時間を分析</span>し、<br />
                自動で投稿・返信。あなたは売上を見るだけ。
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-black">
                  ✓ 設定5分
                </div>
                <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-black">
                  ✓ 24時間自動
                </div>
                <div className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-black">
                  ✓ 売上3倍
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Cards - White Background */}
        <section className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                あなたの時間を<span className="text-yellow-400">80%削減</span>する、<br />
                5つの自動化機能
              </h2>
              <p className="text-xl text-gray-600">
                手作業でやっていた全てを、AIが代行します
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {/* Feature Card 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:border-yellow-400 transition-all hover:shadow-xl group">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Calendar className="w-9 h-9 text-black" />
                  </div>
                </div>
                <h3 className="text-center font-black text-gray-900 mb-2 text-sm leading-tight">
                  予約投稿
                </h3>
                <p className="text-center text-gray-500 mb-3 text-xs">
                  (スケジュール管理)
                </p>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  最適なタイミングで自動投稿
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:border-yellow-400 transition-all hover:shadow-xl group">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-9 h-9 text-black" />
                  </div>
                </div>
                <h3 className="text-center font-black text-gray-900 mb-2 text-sm leading-tight">
                  自動返信
                </h3>
                <p className="text-center text-gray-500 mb-3 text-xs">
                  (リアルタイム対応)
                </p>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  キーワード検知で即座に返信
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:border-yellow-400 transition-all hover:shadow-xl group">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-9 h-9 text-black" />
                  </div>
                </div>
                <h3 className="text-center font-black text-gray-900 mb-2 text-sm leading-tight">
                  セキュア認証
                </h3>
                <p className="text-center text-gray-500 mb-3 text-xs">
                  (Meta公式API)
                </p>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  安全にデータを管理
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:border-yellow-400 transition-all hover:shadow-xl group">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-9 h-9 text-black" />
                  </div>
                </div>
                <h3 className="text-center font-black text-gray-900 mb-2 text-sm leading-tight">
                  詳細分析
                </h3>
                <p className="text-center text-gray-500 mb-3 text-xs">
                  (手数料2.59%〜)
                </p>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  投稿パフォーマンス可視化
                </p>
              </div>

              {/* Feature Card 5 */}
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 hover:border-yellow-400 transition-all hover:shadow-xl group">
                <div className="flex justify-center mb-5">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-9 h-9 text-black" />
                  </div>
                </div>
                <h3 className="text-center font-black text-gray-900 mb-2 text-sm leading-tight">
                  導入サポート
                </h3>
                <p className="text-center text-gray-500 mb-3 text-xs">
                  (運用まで徹底)
                </p>
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  専門スタッフが全面サポート
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

        {/* Urgency Section */}
        <section className="bg-red-50 py-16 border-y-4 border-red-500">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-red-600 font-black text-3xl mb-4">
              ⚠️ 今すぐ始めないと、毎月20時間を失い続けます
            </p>
            <p className="text-gray-700 text-xl mb-6">
              競合が自動化している間、あなたは手作業を続けますか？
            </p>
            <p className="text-red-600 font-bold text-lg">
              ※ この無料期間は<span className="underline">予告なく終了</span>する可能性があります
            </p>
          </div>
        </section>

        {/* CTA Section - Black Background */}
        <section className="bg-black py-28 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/20 to-transparent"></div>

          {/* Floating elements */}
          <div className="absolute top-10 left-10 bg-yellow-400 w-20 h-20 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 bg-yellow-400 w-32 h-32 rounded-full opacity-10"></div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="inline-block bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm mb-6 animate-bounce">
              🎁 今だけ！30日間完全無料
            </div>
            <h2 className="text-6xl font-black text-white mb-6 leading-tight tracking-tight">
              あなたの<span className="text-yellow-400">売上を3倍</span>に<br />
              する準備は、できましたか？
            </h2>
            <p className="text-2xl text-gray-300 mb-8 font-bold">
              たった3分で、月20時間の自由を手に入れる
            </p>

            {/* Benefit List */}
            <div className="flex flex-col items-center gap-3 mb-12 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 text-white">
                <Check className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="font-medium">30日間無料でフル機能を試せる</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Check className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="font-medium">クレジットカード登録不要</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Check className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="font-medium">3分で設定完了、今すぐ使える</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Check className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <span className="font-medium">いつでもキャンセル可能</span>
              </div>
            </div>

            <Link href="/api/auth/login">
              <button className="inline-flex items-center gap-3 px-16 py-6 bg-yellow-400 text-black text-2xl font-black rounded-xl hover:bg-yellow-300 transition-all shadow-2xl hover:shadow-yellow-400/50 hover:scale-105 transform mb-6">
                今すぐ30日間無料で試す
                <ArrowRight className="w-7 h-7" />
              </button>
            </Link>

            <p className="text-sm text-gray-400 mb-4">
              ※ 無料期間中に解約すれば、一切料金はかかりません
            </p>
            <p className="text-yellow-400 font-bold text-lg animate-pulse">
              👇 登録は3分で完了します 👇
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
