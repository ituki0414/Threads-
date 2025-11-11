'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Power, PowerOff, RefreshCw, Zap, Calendar, MessageSquare, Home, User } from 'lucide-react';
import { AutoReplyRule } from '@/lib/types/auto-reply';

export default function AutoReplyPage() {
  const [rules, setRules] = useState<AutoReplyRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoReplyRule | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const accountId = localStorage.getItem('account_id');
      if (!accountId) return;

      const response = await fetch(`/api/auto-reply/v2?account_id=${accountId}`);
      if (!response.ok) throw new Error('Failed to fetch rules');

      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
      alert('自動返信ルールの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (ruleId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/auto-reply/v2', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ruleId,
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle rule');
      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      alert('ルールの切り替えに失敗しました');
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('このルールを削除しますか？')) return;

    try {
      const response = await fetch(`/api/auto-reply/v2?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      alert('自動返信ルールを削除しました');
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('自動返信ルールの削除に失敗しました');
    }
  };

  const handleProcessAutoReplies = async () => {
    if (!confirm('自動返信を実行しますか？最新の投稿へのリプライをチェックして自動返信を行います。')) return;

    setIsProcessing(true);
    try {
      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        alert('アカウント情報が見つかりません');
        return;
      }

      const response = await fetch('/api/auto-reply/v2/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accountId }),
      });

      if (!response.ok) throw new Error('Failed to process auto-replies');

      const result = await response.json();
      alert(`自動返信処理が完了しました！\n処理数: ${result.processed}件`);
    } catch (error) {
      console.error('Error processing auto-replies:', error);
      alert('自動返信の処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTriggerText = (rule: AutoReplyRule) => {
    const triggers = [];
    if (rule.trigger_reply) triggers.push('リプライ');
    if (rule.trigger_repost) triggers.push('リポスト');
    if (rule.trigger_quote) triggers.push('引用');
    if (rule.trigger_like) triggers.push('いいね');
    return triggers.join(', ') || 'なし';
  };

  const getTimingText = (rule: AutoReplyRule) => {
    if (rule.timing_type === 'immediate') return '即時';
    if (rule.timing_type === 'delayed') return `${rule.delay_minutes}分後`;
    if (rule.timing_type === 'like_threshold') return `${rule.like_threshold}いいね到達`;
    return '-';
  };

  const getReplyTypeText = (rule: AutoReplyRule) => {
    if (rule.reply_type === 'reply') return 'リプライ';
    if (rule.reply_type === 'none') return '返信なし';
    return '-';
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar - X style mobile-first */}
        <header className="h-14 md:h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-foreground truncate">自動返信設定</h1>
            <span className="hidden sm:inline text-xs md:text-sm text-muted-foreground whitespace-nowrap">
              {rules.filter(r => r.is_active).length}個有効
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleProcessAutoReplies}
              disabled={isProcessing}
              className="p-2 md:px-3 md:py-2"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 md:mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 md:mr-2" />
              )}
              <span className="hidden md:inline">実行</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="p-2 md:px-3 md:py-2"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">新規</span>
            </Button>
          </div>
        </header>

        {/* Content - mobile optimized */}
        <div className="flex-1 overflow-auto bg-background p-2 md:p-4 lg:p-6 pb-20 lg:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : rules.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  自動返信ルールがありません
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  自動返信ルールを作成して、コメントやリプライに自動で返信できます
                </p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  新規ルールを作成
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground">{rule.name}</h3>
                        <button
                          onClick={() => handleToggleActive(rule.id, rule.is_active)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            rule.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {rule.is_active ? (
                            <>
                              <Power className="w-3 h-3 inline mr-1" />
                              有効
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-3 h-3 inline mr-1" />
                              無効
                            </>
                          )}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground mb-1">トリガー</div>
                          <div className="font-medium">{getTriggerText(rule)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">タイミング</div>
                          <div className="font-medium">{getTimingText(rule)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">返信タイプ</div>
                          <div className="font-medium">{getReplyTypeText(rule)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">キーワード</div>
                          <div className="font-medium">
                            {rule.keywords && rule.keywords.length > 0
                              ? `${rule.keywords.length}個`
                              : 'なし'}
                          </div>
                        </div>
                      </div>

                      {rule.reply_text && (
                        <div className="p-3 bg-secondary/50 rounded-lg mb-3">
                          <div className="text-xs text-muted-foreground mb-1">返信テキスト:</div>
                          <div className="text-sm text-foreground line-clamp-2">
                            {rule.reply_text}
                          </div>
                        </div>
                      )}

                      {(rule.filter_start_date || rule.filter_end_date) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {rule.filter_start_date &&
                              new Date(rule.filter_start_date).toLocaleDateString('ja-JP')}
                            {rule.filter_start_date && rule.filter_end_date && ' 〜 '}
                            {rule.filter_end_date &&
                              new Date(rule.filter_end_date).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground mt-3">
                        作成日: {new Date(rule.created_at).toLocaleString('ja-JP')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateRuleModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchRules();
            }}
          />
        )}

        {/* Edit Modal */}
        {editingRule && (
          <CreateRuleModal
            editingRule={editingRule}
            onClose={() => setEditingRule(null)}
            onSuccess={() => {
              setEditingRule(null);
              fetchRules();
            }}
          />
        )}

        {/* Mobile Bottom Navigation - X style */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
          <div className="grid grid-cols-5 h-14">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-muted-foreground hover:text-foreground"
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
              className="flex flex-col items-center justify-center gap-1 transition-colors active:scale-95 text-primary"
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

function CreateRuleModal({
  editingRule,
  onClose,
  onSuccess,
}: {
  editingRule?: AutoReplyRule | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    target_post_id: null as string | null,
    target_post_source: 'recent' as 'recent' | 'search' | 'scheduled' | 'auto_reply',
    trigger_reply: true,
    trigger_repost: false,
    trigger_quote: false,
    trigger_like: false,
    keyword_condition: 'none' as 'all' | 'any' | 'none',
    keywords: [] as string[],
    keyword_match_type: 'partial' as 'exact' | 'partial',
    hashtag_filter: false,
    hashtags: [] as string[],
    filter_start_date: null as string | null,
    filter_end_date: null as string | null,
    timing_type: 'immediate' as 'immediate' | 'delayed' | 'like_threshold',
    delay_minutes: null as number | null,
    like_threshold: null as number | null,
    reply_type: 'reply' as 'reply' | 'none',
    reply_text: '',
    reply_media_url: null as string | null,
    reply_media_type: null as 'image' | 'video' | null,
    enable_lottery: false,
    lottery_id: null as string | null,
    is_active: true,
  });

  const [keywordInput, setKeywordInput] = useState('');

  // 投稿を取得する関数
  const fetchPosts = async (source: string, query: string = '') => {
    setLoadingPosts(true);
    try {
      const accountId = localStorage.getItem('account_id');
      if (!accountId) return;

      let url = `/api/auto-reply/posts?account_id=${accountId}&source=${source}`;
      if (source === 'search' && query) {
        url += `&search=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // 初回ロード時に直近20投稿を取得
  useEffect(() => {
    fetchPosts('recent');
  }, []);

  // 編集モードの場合、既存データをフォームに読み込む
  useEffect(() => {
    if (editingRule) {
      setFormData({
        name: editingRule.name,
        target_post_id: editingRule.target_post_id,
        target_post_source: editingRule.target_post_source,
        trigger_reply: editingRule.trigger_reply,
        trigger_repost: editingRule.trigger_repost,
        trigger_quote: editingRule.trigger_quote,
        trigger_like: editingRule.trigger_like,
        keyword_condition: editingRule.keyword_condition || 'none',
        keywords: editingRule.keywords || [],
        keyword_match_type: editingRule.keyword_match_type || 'partial',
        hashtag_filter: editingRule.hashtag_filter || false,
        hashtags: editingRule.hashtags || [],
        filter_start_date: editingRule.filter_start_date,
        filter_end_date: editingRule.filter_end_date,
        timing_type: editingRule.timing_type,
        delay_minutes: editingRule.delay_minutes,
        like_threshold: editingRule.like_threshold,
        reply_type: editingRule.reply_type,
        reply_text: editingRule.reply_text || '',
        reply_media_url: editingRule.reply_media_url,
        reply_media_type: editingRule.reply_media_type,
        enable_lottery: editingRule.enable_lottery || false,
        lottery_id: editingRule.lottery_id,
        is_active: editingRule.is_active,
      });
      // 編集時は対象投稿のソースに応じて投稿リストを取得
      if (editingRule.target_post_source) {
        fetchPosts(editingRule.target_post_source);
      }
    }
  }, [editingRule]);

  const handleSubmit = async () => {
    const accountId = localStorage.getItem('account_id');
    if (!accountId) return;

    try {
      const isEditing = !!editingRule;
      const response = await fetch('/api/auto-reply/v2', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEditing
            ? { id: editingRule.id, ...formData }
            : { account_id: accountId, ...formData }
        ),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || (isEditing ? '更新に失敗しました' : '作成に失敗しました'));
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
      alert(editingRule ? '更新に失敗しました' : '作成に失敗しました');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keywordInput.trim()],
      });
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keyword),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">
            {editingRule ? 'ルールを編集' : '新規ルール作成'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ステップ {step + 1}/4
          </p>
        </div>

        <div className="p-6 space-y-6">
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">返信対象の投稿を選ぶ</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="recent"
                        checked={formData.target_post_source === 'recent'}
                        onChange={(e) => {
                          setFormData({ ...formData, target_post_source: e.target.value as any });
                          fetchPosts(e.target.value as any, '');
                        }}
                      />
                      <span>直近20投稿</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="scheduled"
                        checked={formData.target_post_source === 'scheduled'}
                        onChange={(e) => {
                          setFormData({ ...formData, target_post_source: e.target.value as any });
                          fetchPosts(e.target.value as any, '');
                        }}
                      />
                      <span>予約投稿</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="auto_reply"
                        checked={formData.target_post_source === 'auto_reply'}
                        onChange={(e) => {
                          setFormData({ ...formData, target_post_source: e.target.value as any });
                          fetchPosts(e.target.value as any, '');
                        }}
                      />
                      <span>自動返信</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="search"
                        checked={formData.target_post_source === 'search'}
                        onChange={(e) => {
                          setFormData({ ...formData, target_post_source: e.target.value as any });
                        }}
                      />
                      <span>検索</span>
                    </label>
                  </div>

                  {formData.target_post_source === 'search' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="キーワードまたは投稿ID"
                        className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                      <Button onClick={() => fetchPosts('search', searchQuery)}>検索</Button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">投稿を選択</label>
                {loadingPosts ? (
                  <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    投稿が見つかりませんでした
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => setFormData({ ...formData, target_post_id: post.id })}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.target_post_id === post.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {post.media && post.media.length > 0 && (
                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={post.media[0]}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2 mb-1">{post.caption || '（テキストなし）'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">ルール名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: リプライ自動返信_2025年11月"
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">トリガー設定</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.trigger_reply}
                      onChange={(e) =>
                        setFormData({ ...formData, trigger_reply: e.target.checked })
                      }
                    />
                    <span>リプライをトリガーにする</span>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    ※ 現在はリプライのみ対応しています
                  </p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">キーワード条件</label>
                <select
                  value={formData.keyword_condition}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      keyword_condition: e.target.value as 'all' | 'any' | 'none',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="none">キーワードフィルターなし</option>
                  <option value="any">いずれか一致</option>
                  <option value="all">すべて一致</option>
                </select>
              </div>

              {formData.keyword_condition !== 'none' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">マッチタイプ</label>
                    <select
                      value={formData.keyword_match_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          keyword_match_type: e.target.value as 'exact' | 'partial',
                        })
                      }
                      className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <option value="partial">部分一致</option>
                      <option value="exact">完全一致</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">キーワード</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        placeholder="キーワードを入力してEnter"
                        className="flex-1 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                      <Button
                        onClick={addKeyword}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        追加
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword) => (
                        <div
                          key={keyword}
                          className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">送信タイミング</label>
                <select
                  value={formData.timing_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timing_type: e.target.value as 'immediate' | 'delayed' | 'like_threshold',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="immediate">即時送信</option>
                  <option value="delayed">遅延送信</option>
                  <option value="like_threshold">いいね数条件</option>
                </select>
              </div>

              {formData.timing_type === 'delayed' && (
                <div>
                  <label className="block text-sm font-medium mb-2">遅延時間（分）</label>
                  <input
                    type="number"
                    value={formData.delay_minutes || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, delay_minutes: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              )}

              {formData.timing_type === 'like_threshold' && (
                <div>
                  <label className="block text-sm font-medium mb-2">いいね数の閾値</label>
                  <input
                    type="number"
                    value={formData.like_threshold || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, like_threshold: Number(e.target.value) })
                    }
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">返信タイプ</label>
                <select
                  value={formData.reply_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reply_type: e.target.value as 'reply' | 'none',
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="reply">リプライ</option>
                  <option value="none">返信なし（履歴のみ）</option>
                </select>
              </div>

              {formData.reply_type !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    返信テキスト
                  </label>
                  <div className="mb-2 text-xs text-muted-foreground space-y-1">
                    <p>• {'{username}'} - リプライしたユーザー名</p>
                    <p>• {'{original_text}'} - リプライの元テキスト</p>
                  </div>
                  <textarea
                    value={formData.reply_text}
                    onChange={(e) => setFormData({ ...formData, reply_text: e.target.value })}
                    placeholder="返信テキストを入力してください"
                    rows={4}
                    className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-foreground"
                  />
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">例:</p>
                    <p>• @{'{username}'} さん、リプライありがとうございます！</p>
                    <p>• @{'{username}'} さん、「{'{original_text}'}」というリプライありがとうございます！</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-between">
          {step > 0 ? (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
            >
              戻る
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={onClose}
            >
              キャンセル
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 0 && !formData.target_post_id) ||
                (step === 1 && !formData.name)
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              次へ
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.target_post_id || !formData.trigger_reply}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {editingRule ? '更新' : '作成'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
