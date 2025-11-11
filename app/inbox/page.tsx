'use client';

import { useState } from 'react';
import { Inbox as InboxIcon, Filter, CheckCheck, Clock, Home, Calendar, Plus, User, Zap } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { InboxItem } from '@/lib/types';
import { mockInboxItems } from '@/lib/mock-data';

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>(mockInboxItems);
  const [filter, setFilter] = useState<'all' | 'dm' | 'comment' | 'pending'>('all');
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !item.is_approved;
    return item.type === filter;
  });

  const pendingCount = items.filter((item) => !item.is_approved).length;

  const handleApprove = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_approved: true, is_read: true } : item
      )
    );
  };

  const handleApproveAll = () => {
    setItems((prev) =>
      prev.map((item) => ({ ...item, is_approved: true, is_read: true }))
    );
  };

  const handleSecretReply = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // 公開返信を送信（軽い内容）
    console.log('公開返信:', { itemId, reply: 'ありがとうございます！' });

    // 同時にDM下書きを生成（CV導線）
    console.log('DM下書き生成:', {
      to: item.author_name,
      message: '保存ありがとうございます！特典送りましょうか？',
    });

    alert(`✅ シークレットリプライ完了\n\n【公開コメント】\n「ありがとうございます！」\n\n【DM下書き】\n「保存ありがとうございます！特典送りましょうか？」\n\nユーザーが「はい」と返信したら自動で特典リンクを送信します。`);

    // アイテムを承認済みにマーク
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, is_approved: true, is_read: true } : i
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-red-500';
      case 'medium':
        return 'border-l-4 border-l-orange-500';
      default:
        return 'border-l-4 border-l-slate-300';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'dm' ? '📩' : '💬';
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
          <h1 className="text-lg md:text-xl font-semibold text-foreground">受信箱</h1>
          {pendingCount > 0 && (
            <Button size="sm" onClick={handleApproveAll}>
              <CheckCheck className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">一括承認</span>
            </Button>
          )}
        </header>

        {/* Content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 左ペイン：受信箱リスト */}
          <div className="lg:col-span-2">
            {pendingCount > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">
                  {pendingCount}件の承認待ち
                </p>
              </div>
            )}

            {/* フィルター */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                すべて ({items.length})
              </button>
              <button
                onClick={() => setFilter('dm')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'dm'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                DM ({items.filter((i) => i.type === 'dm').length})
              </button>
              <button
                onClick={() => setFilter('comment')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'comment'
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                コメント ({items.filter((i) => i.type === 'comment').length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                承認待ち ({pendingCount})
              </button>
            </div>

            {/* 受信箱アイテムリスト */}
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer hover:shadow-lg transition-all ${getPriorityColor(
                    item.priority
                  )} ${selectedItem?.id === item.id ? 'ring-2 ring-primary-500' : ''} ${
                    !item.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <div>
                        <div className="font-semibold text-slate-900">{item.author_name}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(item.ts).toLocaleString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!item.is_approved && item.type === 'comment' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSecretReply(item.id);
                          }}
                          className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-300"
                        >
                          🤫 シークレット
                        </Button>
                      )}
                      {!item.is_approved && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(item.id);
                          }}
                        >
                          承認
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{item.text}</p>
                  <div className="flex items-center gap-2">
                    {item.flags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                      >
                        {flag}
                      </span>
                    ))}
                    {item.auto_reply_scheduled && (
                      <span className="flex items-center gap-1 text-xs text-primary-600">
                        <Clock className="w-3 h-3" />
                        自動送信予定
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* 右ペイン：詳細とAI返信候補 */}
          <div>
            {/* シークレットリプライの説明 */}
            <Card className="mb-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <div className="flex items-start gap-3">
                <div className="text-2xl">🤫</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-purple-900 mb-2">シークレットリプライとは？</h3>
                  <ul className="text-xs text-purple-800 space-y-1">
                    <li>• <strong>公開コメント</strong>：軽い返信（「ありがとうございます！」）</li>
                    <li>• <strong>非公開DM</strong>：CV導線（「特典送りましょうか？」）</li>
                    <li>• <strong>自動化</strong>：「はい」返信で特典リンク自動送信</li>
                    <li className="mt-2 text-purple-700">💡 公開を汚さずに収益化できます</li>
                  </ul>
                </div>
              </div>
            </Card>

            {selectedItem ? (
              <>
                <Card className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">メッセージ詳細</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">送信者</div>
                      <div className="font-medium text-slate-900">{selectedItem.author_name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">受信日時</div>
                      <div className="text-sm text-slate-700">
                        {new Date(selectedItem.ts).toLocaleString('ja-JP')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">優先度</div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedItem.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : selectedItem.priority === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {selectedItem.priority === 'high'
                          ? '高'
                          : selectedItem.priority === 'medium'
                          ? '中'
                          : '低'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span>✨</span>
                    AI返信候補
                  </h3>
                  <div className="space-y-3">
                    {['丁寧な返信', 'カジュアルな返信', 'シンプルな返信'].map((type, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      >
                        <div className="text-xs text-slate-500 mb-1">{type}</div>
                        <p className="text-sm text-slate-800">
                          {idx === 0
                            ? 'ご連絡いただきありがとうございます。大変参考になるコメントをいただき、嬉しく思います。'
                            : idx === 1
                            ? 'ありがとうございます！嬉しいです😊 これからも役立つ情報をシェアしていきますね！'
                            : 'ありがとうございます！'}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="text-center py-12">
                <InboxIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">メッセージを選択してください</p>
              </Card>
            )}
          </div>
        </div>
        </div>

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-5 h-14">
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
              <span className="text-[10px] font-medium">予定</span>
            </a>
            <a
              href="/auto-reply"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
            >
              <Zap className="w-5 h-5" />
              <span className="text-[10px] font-medium">自動返信</span>
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
