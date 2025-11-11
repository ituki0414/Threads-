'use client';

import { useState } from 'react';
import { Zap, Plus, ToggleLeft, ToggleRight, Edit2, Trash2, Play, Home, Calendar, User } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Rule } from '@/lib/types';
import { mockRules } from '@/lib/mock-data';

export default function RulesPage() {
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('このルールを削除しますか？')) {
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    }
  };

  const getTriggerLabel = (trigger: string) => {
    return trigger === 'dm' ? 'DM受信時' : 'コメント受信時';
  };

  const getActionLabel = (action: any) => {
    return action.type === 'dm' ? 'DMを送信' : action.type === 'reply' ? '返信' : 'タグ付け';
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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">自動化ルール</h1>
          <Button
            size="sm"
            className="p-2 md:px-4 md:py-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">新規</span>
          </Button>
        </header>

        {/* Content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">

        {/* 安全設計の説明 */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🛡️</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">BAN回避の安全設計</h3>
              <ul className="text-xs text-amber-800 space-y-1">
                <li>• <strong>半自動デフォルト</strong>：すべてのルールは初期状態で承認必須</li>
                <li>• <strong>速度制御</strong>：推奨レート以上の設定時に警告を表示</li>
                <li>• <strong>クールダウン</strong>：同一ユーザーへの連続送信を自動抑制</li>
                <li>• <strong>多様化</strong>：語尾・絵文字をランダム化して機械的な印象を回避</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* ルールリスト */}
        <div className="space-y-4">
          {rules.map((rule) => (
            <Card
              key={rule.id}
              className={`transition-all ${
                rule.is_active ? 'border-green-300 bg-green-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold text-slate-900">{rule.name}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rule.is_active ? '有効' : '無効'}
                    </span>
                    {!rule.auto && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        承認必須
                      </span>
                    )}
                  </div>

                  {/* トリガー */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">トリガー</div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {getTriggerLabel(rule.trigger)}
                      </span>
                      {rule.conditions.keywords && rule.conditions.keywords.length > 0 && (
                        <>
                          <span className="text-slate-400">→</span>
                          <div className="flex items-center gap-1">
                            {rule.conditions.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* アクション */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-500 mb-1">アクション</div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                        {getActionLabel(rule.action)}
                      </span>
                      <span className="text-slate-400">→</span>
                      <div className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg flex-1">
                        {rule.action.template}
                      </div>
                    </div>
                  </div>

                  {/* クールダウン */}
                  <div className="text-xs text-slate-500">
                    クールダウン: {rule.cooldown_s / 3600}時間
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleRuleActive(rule.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title={rule.is_active ? '無効化' : '有効化'}
                  >
                    {rule.is_active ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <button
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="編集"
                  >
                    <Edit2 className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Yes検知の説明 */}
        <Card className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-900 mb-2">Yes検知機能とは？</h3>
              <p className="text-xs text-green-800 mb-3">
                シークレットリプライでDMした相手が「はい」「お願い」などのキーワードで返信すると、自動で特典リンクを送信します。
              </p>
              <div className="space-y-2 text-xs text-green-800">
                <div className="flex items-start gap-2">
                  <span className="font-medium">1.</span>
                  <span>コメントに軽い返信 + DM下書き送信</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">2.</span>
                  <span>ユーザーが「はい」「お願いします」と返信</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">3.</span>
                  <span><strong>自動検知</strong>して特典リンクを送信（承認不要）</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white/50 rounded border border-green-300">
                <div className="text-xs text-green-900">
                  <strong>検知キーワード:</strong> 「はい」「yes」「お願い」「ください」「欲しい」など
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* プリセットテンプレート */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">プリセットテンプレート</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: '保存お礼DM',
                trigger: 'コメント',
                keywords: ['保存', 'ブックマーク'],
                action: 'DM送信',
                template: 'ありがとうございます！特典資料をお送りしますね😊',
                highlight: false,
              },
              {
                name: 'ポジティブ返信',
                trigger: 'コメント',
                keywords: ['ありがとう', '素敵', '参考'],
                action: '返信',
                template: 'ありがとうございます✨ 嬉しいです！',
                highlight: false,
              },
              {
                name: '✅ Yes検知 → 特典自動送信',
                trigger: 'DM',
                keywords: ['はい', 'yes', 'お願い'],
                action: 'DM送信（自動）',
                template: '特典資料をお送りします📩\n\nhttps://example.com/bonus',
                highlight: true,
              },
            ].map((preset, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  preset.highlight
                    ? 'border-green-300 bg-green-50/30 hover:border-green-400'
                    : 'hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className={`font-semibold ${preset.highlight ? 'text-green-900' : 'text-slate-900'}`}>
                    {preset.name}
                  </h4>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">トリガー: </span>
                    <span className="text-slate-700">{preset.trigger}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">キーワード: </span>
                    <span className="text-slate-700">{preset.keywords.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">アクション: </span>
                    <span className={preset.highlight ? 'text-green-700 font-medium' : 'text-slate-700'}>
                      {preset.action}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className={`p-2 rounded whitespace-pre-wrap ${
                      preset.highlight ? 'text-green-800 bg-white border border-green-200' : 'text-slate-600 bg-slate-50'
                    }`}>
                      {preset.template}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* テストセクション */}
        <Card className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">ルールのテスト</h3>
              <p className="text-xs text-blue-800 mb-3">
                過去の受信メッセージでルールをテストして、動作を確認できます
              </p>
              <Button size="sm" variant="secondary">
                テストを実行
              </Button>
            </div>
          </div>
        </Card>
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
