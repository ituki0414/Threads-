'use client'

import { Sidebar } from '@/components/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Hero Card */}
        <div className="bg-white border border-[#DBDBDB] rounded-3xl p-12 mb-8 flex items-center justify-between shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.12)] transition-all duration-200">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[#737373] text-xs font-semibold mb-4 uppercase tracking-wider">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              今日のおすすめ
            </div>
            <h1 className="text-[32px] font-bold text-black mb-4 tracking-tight leading-tight">今日のおすすめ投稿時間は 19:30</h1>
            <p className="text-[#737373] text-[15px] mb-8 leading-relaxed max-w-xl">過去のデータから、この時間帯が最も高いエンゲージメントを獲得しています</p>
            <button className="bg-black text-white px-8 py-4 rounded-full font-semibold text-[15px] hover:bg-[#262626] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-150">
              この時間で予約する
            </button>
          </div>
          <div className="w-[140px] h-[140px] bg-gradient-to-br from-[#F6F6F6] to-[#EFEFEF] rounded-3xl flex items-center justify-center text-6xl ml-8">
            🕐
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 mb-10">
          {/* Progress Card */}
          <Card className="bg-white border-[#DBDBDB] rounded-3xl p-8 shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-semibold text-[#737373] uppercase tracking-wider">今週の進捗</div>
              <Badge className="bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#E8F5E9] text-xs font-bold px-3 py-1.5 rounded-full">
                順調
              </Badge>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-black mb-2 tracking-tight">
                3 <span className="text-[22px] text-[#A0A0A0]">/ 5</span>
              </div>
              <div className="text-sm text-[#A0A0A0]">投稿完了</div>
            </div>
            <Progress value={60} className="mb-6 h-2" />
            <div className="inline-flex items-center gap-2 px-4 py-3 bg-[#FFF3E0] border border-[#FFE0B2] rounded-full text-sm font-semibold text-[#E65100]">
              🔥 連続7日投稿中
            </div>
          </Card>

          {/* Approval Card */}
          <Card className="bg-white border-[#DBDBDB] rounded-3xl p-8 shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200">
            <div className="mb-6">
              <div className="text-xs font-semibold text-[#737373] uppercase tracking-wider">承認待ち</div>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-[#E65100] mb-2 tracking-tight">5</div>
              <div className="text-sm text-[#A0A0A0]">件の確認が必要</div>
            </div>
            <div className="h-2 mb-6"></div>
            <button className="w-full py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-[#262626] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-150">
              受信箱で確認
            </button>
          </Card>

          {/* Insights Card */}
          <Card className="bg-white border-[#DBDBDB] rounded-3xl p-8 shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-200">
            <div className="mb-6">
              <div className="text-xs font-semibold text-[#737373] uppercase tracking-wider">直近のインサイト</div>
            </div>
            <div className="mb-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-black font-medium">
                <svg width="18" height="18" fill="none" stroke="#2E7D32" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                </svg>
                保存率↑冒頭に結論
              </div>
              <div className="flex items-center gap-3 text-sm text-black font-medium">
                <svg width="18" height="18" fill="none" stroke="#2E7D32" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                </svg>
                19:30最適時間帯
              </div>
            </div>
            <div className="h-2 mb-6"></div>
            <button className="w-full py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-[#262626] hover:shadow-[0_4px_16px_rgba(0,0,0,0.2)] transition-all duration-150">
              詳細を見る
            </button>
          </Card>
        </div>

        {/* Posts Section */}
        <div className="bg-white border border-[#DBDBDB] rounded-3xl p-8 shadow-[0_0_1px_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-black tracking-tight">最近の投稿</h2>
            <a href="#" className="text-sm font-semibold text-black opacity-60 hover:opacity-100 transition-opacity duration-150">
              すべて見る →
            </a>
          </div>
          <div className="space-y-5">
            {[
              { status: '公開済み', date: '2025年10月29日', text: 'サンプル投稿テキスト #1', rate: '9.2%' },
              { status: '公開済み', date: '2025年10月28日', text: 'サンプル投稿テキスト #2', rate: '12.5%' },
              { status: '公開済み', date: '2025年10月27日', text: 'サンプル投稿テキスト #3', rate: '8.7%' }
            ].map((post, i) => (
              <div key={i} className="flex items-center gap-5 p-6 border border-[#DBDBDB] rounded-2xl hover:border-[#C7C7C7] hover:bg-[#FAFAFA] hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-200">
                <div className="w-20 h-20 bg-gradient-to-br from-[#F6F6F6] to-[#E8E8E8] rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1.5 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[11px] font-bold uppercase tracking-wide">
                      {post.status}
                    </span>
                    <span className="text-xs text-[#A0A0A0]">{post.date}</span>
                  </div>
                  <div className="text-[15px] text-black font-medium truncate">{post.text}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-[#A0A0A0] uppercase tracking-wide mb-1">保存率</div>
                  <div className="text-xl font-bold text-black tracking-tight">{post.rate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
