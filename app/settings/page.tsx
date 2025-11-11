'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Zap, User, Clock, Home, Calendar, Plus } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  // Rate limiting settings
  const [dmPerHour, setDmPerHour] = useState(10);
  const [commentPerHour, setCommentPerHour] = useState(15);
  const [cooldownMinutes, setCooldownMinutes] = useState(30);

  // Automation settings
  const [autoApprove, setAutoApprove] = useState(false);
  const [variationEnabled, setVariationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    alert('設定を保存しました');
  };

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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">設定</h1>
          <Button onClick={handleSave} size="sm" className="text-xs md:text-sm">
            保存
          </Button>
        </header>

        {/* Content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-16 lg:pb-6">
          <div className="space-y-4 md:space-y-6">
          {/* BAN回避設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <CardTitle>BAN回避設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* DM送信レート */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      DM送信レート（1時間あたり）
                    </label>
                    <span className="text-2xl font-bold text-slate-900">{dmPerHour}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={dmPerHour}
                    onChange={(e) => setDmPerHour(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>1</span>
                    <span className={dmPerHour > 20 ? 'text-red-600 font-medium' : ''}>
                      {dmPerHour > 20 ? '⚠️ 推奨値を超えています' : '✅ 安全範囲'}
                    </span>
                    <span>30</span>
                  </div>
                </div>

                {/* コメント送信レート */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      コメント送信レート（1時間あたり）
                    </label>
                    <span className="text-2xl font-bold text-slate-900">{commentPerHour}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={commentPerHour}
                    onChange={(e) => setCommentPerHour(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>1</span>
                    <span className={commentPerHour > 30 ? 'text-red-600 font-medium' : ''}>
                      {commentPerHour > 30 ? '⚠️ 推奨値を超えています' : '✅ 安全範囲'}
                    </span>
                    <span>40</span>
                  </div>
                </div>

                {/* クールダウン時間 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      同一ユーザーへのクールダウン（分）
                    </label>
                    <span className="text-2xl font-bold text-slate-900">{cooldownMinutes}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={cooldownMinutes}
                    onChange={(e) => setCooldownMinutes(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>5分</span>
                    <span>120分</span>
                  </div>
                </div>

                {/* 説明 */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>推奨設定:</strong> DM 10-15件/時間、コメント 15-20件/時間、クールダウン 30分以上
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 自動化設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle>自動化設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 自動承認 */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">完全自動モード</div>
                    <p className="text-xs text-slate-600">
                      ルールに一致したメッセージを承認なしで自動送信（リスク高）
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoApprove(!autoApprove)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      autoApprove ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        autoApprove ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* メッセージの多様化 */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">メッセージの多様化</div>
                    <p className="text-xs text-slate-600">
                      語尾・絵文字をランダム化して機械的な印象を回避
                    </p>
                  </div>
                  <button
                    onClick={() => setVariationEnabled(!variationEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      variationEnabled ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        variationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* バリエーション例 */}
                {variationEnabled && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs text-blue-900 font-medium mb-2">バリエーション例:</div>
                    <div className="space-y-1 text-xs text-blue-800">
                      <div>• 「ありがとうございます！」</div>
                      <div>• 「ありがとうございます😊」</div>
                      <div>• 「ありがとうございますね！」</div>
                      <div>• 「ありがとうございます✨」</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 通知設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600" />
                </div>
                <CardTitle>通知設定</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">プッシュ通知</div>
                    <p className="text-xs text-slate-600">
                      承認待ちメッセージ、高優先度DM、エラー時に通知
                    </p>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {notificationsEnabled && (
                  <div className="pl-4 space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-slate-700">承認待ちメッセージ</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-slate-700">高優先度DM</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-slate-700">自動化エラー</span>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* アカウント設定 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600" />
                </div>
                <CardTitle>連携アカウント</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">@your_account</div>
                      <div className="text-xs text-slate-500">Threads連携済み</div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    再連携
                  </Button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">アクセストークン有効期限</span>
                  </div>
                  <div className="text-sm text-slate-900">2025年2月28日まで</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 危険な操作 */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">危険な操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="secondary" className="w-full text-red-600 hover:bg-red-50">
                  すべてのルールを無効化
                </Button>
                <Button variant="secondary" className="w-full text-red-600 hover:bg-red-50">
                  すべてのデータをリセット
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-4 h-14">
            <a
              href="/"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">ホーム</span>
            </a>
            <a
              href="/calendar"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-medium">カレンダー</span>
            </a>
            <a
              href="/composer"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-medium">投稿</span>
            </a>
            <a
              href="/profile"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">設定</span>
            </a>
          </div>
        </nav>
      </main>
    </div>
  );
}
