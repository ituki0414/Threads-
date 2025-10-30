'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // モックデータ
  const saveRateData = [
    { date: '1/1', rate: 5.2 },
    { date: '1/2', rate: 6.1 },
    { date: '1/3', rate: 7.8 },
    { date: '1/4', rate: 8.5 },
    { date: '1/5', rate: 9.2 },
    { date: '1/6', rate: 10.1 },
    { date: '1/7', rate: 11.3 },
  ];

  const templatePerformance = [
    { type: '保存誘導', posts: 12, avgSaveRate: 11.3, trend: '+2.1%' },
    { type: '会話促進', posts: 8, avgSaveRate: 7.8, trend: '+1.5%' },
    { type: '告知', posts: 5, avgSaveRate: 6.2, trend: '-0.3%' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-6">
        {/* ページヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">分析</h2>
            <p className="text-sm text-slate-600">保存率と初動速度を中心に分析</p>
          </div>
        </div>

        {/* KPIカード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>平均保存率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-green-600">9.2%</span>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +1.8%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">過去7日間の平均</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>初動コメント率</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-blue-600">3.5%</span>
                <span className="text-sm text-blue-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +0.7%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">投稿後30分以内</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>平均応答時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-purple-600">12分</span>
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  -8分
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">DM・コメント返信まで</p>
            </CardContent>
          </Card>
        </div>

        {/* 保存率トレンド */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>保存率トレンド（過去7日間）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {saveRateData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                    style={{ height: `${data.rate * 20}px` }}
                  />
                  <div className="text-xs text-slate-500 mt-2">{data.date}</div>
                  <div className="text-sm font-bold text-slate-900">{data.rate}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* テンプレート別パフォーマンス */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>テンプレート別パフォーマンス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templatePerformance.map((template, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">
                        {template.type === '保存誘導' ? '📌' : template.type === '会話促進' ? '💬' : '🎁'}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{template.type}</div>
                      <div className="text-sm text-slate-500">{template.posts}件の投稿</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">{template.avgSaveRate}%</div>
                    <div
                      className={`text-sm font-medium ${
                        template.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {template.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* インサイト */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">AIインサイト</h3>
              <ul className="text-xs text-purple-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>
                    <strong>保存誘導テンプレート</strong>が最も高い保存率（11.3%）を記録。冒頭に「保存版」を入れると効果的
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>
                    <strong>19:30-20:00の投稿</strong>が最も高いエンゲージメント。この時間帯での投稿を増やすことを推奨
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>
                    <strong>コメント返信速度</strong>が先週比50%改善。初動エンゲージメント率も+20%向上
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
