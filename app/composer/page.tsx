'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Edit3, Sparkles, Calendar, Send, BookmarkPlus, Bookmark, Trash2, Image, Video, X, Plus, ArrowDown, Lightbulb } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AISuggestion } from '@/lib/types';

interface SavedTemplate {
  id: string;
  name: string;
  caption: string;
  tags: string[];
  created_at: string;
}

interface ThreadPost {
  id: string;
  caption: string;
  mediaFiles: File[];
  mediaPreviews: string[];
}

// 日本時間の日付を YYYY-MM-DD 形式で取得
function getJSTDateString(date?: Date): string {
  const d = date || new Date();
  return new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))
    .toISOString()
    .split('T')[0];
}

// 日本時間の時刻を HH:MM 形式で取得
function getJSTTimeString(date?: Date): string {
  const d = date || new Date();
  const jstDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return jstDate.toTimeString().slice(0, 5);
}

export default function ComposerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduledAt = searchParams.get('scheduled_at');

  const [caption, setCaption] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    scheduledAt ? new Date(scheduledAt) : null
  );

  // 日時を個別に管理（日本時間）
  const [scheduleDate, setScheduleDate] = useState(
    scheduledAt ? getJSTDateString(new Date(scheduledAt)) : getJSTDateString()
  );
  const [scheduleTime, setScheduleTime] = useState(
    scheduledAt ? getJSTTimeString(new Date(scheduledAt)) : '12:00'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // スレッド投稿（ツリー形式）
  const [threadPosts, setThreadPosts] = useState<ThreadPost[]>([]);

  // AIテンプレート提案（モック）
  const mockSuggestions: AISuggestion[] = [
    {
      id: '1',
      template_type: 'save',
      caption: '【保存版】成功する人の5つの習慣✨\n\n1. 朝の1時間を自己投資に\n2. 毎日の振り返り習慣\n3. 失敗を学びに変える\n4. 小さな目標を積み重ねる\n5. 周囲に感謝を伝える\n\n💡 保存して毎朝チェック！',
      tags: ['#自己啓発', '#習慣化', '#成功マインド'],
      confidence: 0.92,
    },
    {
      id: '2',
      template_type: 'talk',
      caption: 'みんなは朝活してる？🌅\n\n私は最近5時起きにチャレンジ中💪\nまだ慣れないけど、朝の静かな時間が最高に集中できる！\n\nあなたのおすすめの朝活ルーティン教えて👇',
      tags: ['#朝活', '#早起き', '#ルーティン'],
      confidence: 0.88,
    },
    {
      id: '3',
      template_type: 'promo',
      caption: '🎁 期間限定プレゼント 🎁\n\n「時間術マスターガイド」を\nDMで無料配布中！\n\n✅ 朝の時間を2倍に増やす方法\n✅ 集中力を爆上げするテクニック\n✅ やる気が出ない時の対処法\n\nコメントに「受け取る」で\nDMにお送りします📩',
      tags: ['#無料プレゼント', '#時間術', '#限定特典'],
      confidence: 0.85,
    },
  ];

  const generateAISuggestions = () => {
    setIsGenerating(true);
    // モック: 2秒後に提案を表示
    setTimeout(() => {
      setAiSuggestions(mockSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    setCaption(suggestion.caption + '\n\n' + suggestion.tags.join(' '));
  };

  // 日時が変更されたらscheduledDateを更新（日本時間として扱う）
  const updateScheduledDate = (date: string, time: string) => {
    if (date && time) {
      // 日本時間の日時文字列を作成
      const jstDateTimeString = `${date}T${time}:00+09:00`;
      const combined = new Date(jstDateTimeString);
      setScheduledDate(combined);
    }
  };

  const handleDateChange = (newDate: string) => {
    setScheduleDate(newDate);
    updateScheduledDate(newDate, scheduleTime);
  };

  const handleTimeChange = (newTime: string) => {
    setScheduleTime(newTime);
    updateScheduledDate(scheduleDate, newTime);
  };

  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of mediaFiles) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Media upload error:', error);
      alert('メディアのアップロードに失敗しました');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSchedule = async () => {
    const hasThreads = threadPosts.length > 0;

    if (hasThreads) {
      if (threadPosts.some(p => !p.caption) || !scheduledDate) return;
    } else {
      if (!caption || !scheduledDate) return;
    }

    try {
      setIsUploading(true);

      if (hasThreads) {
        // スレッド投稿の予約
        const threadData = await Promise.all(
          threadPosts.map(async (post) => {
            const uploadedUrls: string[] = [];
            for (const file of post.mediaFiles) {
              const formData = new FormData();
              formData.append('file', file);
              const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                const data = await response.json();
                uploadedUrls.push(data.url);
              }
            }
            return {
              caption: post.caption,
              media: uploadedUrls,
            };
          })
        );

        const accountId = localStorage.getItem('account_id');
        if (!accountId) {
          alert('アカウント情報が見つかりません');
          return;
        }

        const response = await fetch('/api/posts/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            posts: threadData,
            scheduled_at: scheduledDate.toISOString(),
            publish_now: false,
            account_id: accountId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to schedule thread');
        }

        alert('スレッドを予約しました！');
      } else {
        // 通常の単一投稿の予約
        const mediaUrls = await uploadMediaFiles();

        const accountId = localStorage.getItem('account_id');
        if (!accountId) {
          alert('アカウント情報が見つかりません');
          return;
        }

        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption,
            media: mediaUrls,
            scheduled_at: scheduledDate.toISOString(),
            publish_now: false,
            account_id: accountId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to schedule post');
        }

        alert('投稿を予約しました！');
      }

      router.push('/calendar');
    } catch (error) {
      console.error('Schedule post error:', error);
      alert('予約投稿の作成に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublishNow = async () => {
    const hasThreads = threadPosts.length > 0;

    if (hasThreads) {
      if (threadPosts.some(p => !p.caption)) return;
    } else {
      if (!caption) return;
    }

    try {
      setIsUploading(true);

      const accountId = localStorage.getItem('account_id');
      if (!accountId) {
        alert('アカウント情報が見つかりません');
        return;
      }

      if (hasThreads) {
        // スレッド投稿の即時投稿
        const threadData = await Promise.all(
          threadPosts.map(async (post) => {
            const uploadedUrls: string[] = [];
            for (const file of post.mediaFiles) {
              const formData = new FormData();
              formData.append('file', file);
              const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                const data = await response.json();
                uploadedUrls.push(data.url);
              }
            }
            return {
              caption: post.caption,
              media: uploadedUrls,
            };
          })
        );

        const response = await fetch('/api/posts/thread', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            posts: threadData,
            publish_now: true,
            account_id: accountId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to publish thread');
        }

        alert('スレッドを投稿しました！');
      } else {
        // 通常の単一投稿の即時投稿
        const mediaUrls = await uploadMediaFiles();

        const response = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caption,
            media: mediaUrls,
            publish_now: true,
            account_id: accountId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to publish post');
        }

        alert('投稿しました！');
      }

      router.push('/');
    } catch (error) {
      console.error('Publish post error:', error);
      alert('投稿に失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      alert('テンプレート名を入力してください');
      return;
    }

    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      caption: caption,
      tags: caption.match(/#[\w]+/g) || [],
      created_at: new Date().toISOString(),
    };

    setSavedTemplates([...savedTemplates, newTemplate]);
    setTemplateName('');
    setShowSaveTemplateModal(false);
    alert('テンプレートを保存しました');
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    setCaption(template.caption);
    setShowTemplateLibrary(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('このテンプレートを削除しますか？')) {
      setSavedTemplates(savedTemplates.filter((t) => t.id !== templateId));
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // 最大10ファイルまで
    if (mediaFiles.length + files.length > 10) {
      alert('メディアは最大10個までアップロードできます');
      return;
    }

    // ファイルサイズチェック（1ファイル100MBまで）
    const oversized = files.find(f => f.size > 100 * 1024 * 1024);
    if (oversized) {
      alert(`${oversized.name} のサイズが大きすぎます（最大100MB）`);
      return;
    }

    // プレビューURLを生成
    const newPreviews = files.map(file => URL.createObjectURL(file));

    setMediaFiles([...mediaFiles, ...files]);
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const handleRemoveMedia = (index: number) => {
    // プレビューURLを解放
    URL.revokeObjectURL(mediaPreviews[index]);

    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
    setMediaPreviews(mediaPreviews.filter((_, i) => i !== index));
  };

  // ドラッグ&ドロップのハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, postId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validMediaFiles = files.filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    if (validMediaFiles.length === 0) {
      alert('画像または動画ファイルのみアップロードできます');
      return;
    }

    if (postId) {
      // スレッドモード: 特定の投稿に追加
      setThreadPosts(prev => prev.map(post => {
        if (post.id === postId) {
          if (post.mediaFiles.length + validMediaFiles.length > 10) {
            alert('メディアは最大10個までアップロードできます');
            return post;
          }
          const oversized = validMediaFiles.find(f => f.size > 100 * 1024 * 1024);
          if (oversized) {
            alert(`${oversized.name} のサイズが大きすぎます（最大100MB）`);
            return post;
          }
          const newPreviews = validMediaFiles.map(file => URL.createObjectURL(file));
          return {
            ...post,
            mediaFiles: [...post.mediaFiles, ...validMediaFiles],
            mediaPreviews: [...post.mediaPreviews, ...newPreviews]
          };
        }
        return post;
      }));
    } else {
      // 通常モード
      if (mediaFiles.length + validMediaFiles.length > 10) {
        alert('メディアは最大10個までアップロードできます');
        return;
      }
      const oversized = validMediaFiles.find(f => f.size > 100 * 1024 * 1024);
      if (oversized) {
        alert(`${oversized.name} のサイズが大きすぎます（最大100MB）`);
        return;
      }
      const newPreviews = validMediaFiles.map(file => URL.createObjectURL(file));
      setMediaFiles(prev => [...prev, ...validMediaFiles]);
      setMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // スレッド投稿用の関数
  const addThreadPost = () => {
    const newPost: ThreadPost = {
      id: Date.now().toString(),
      caption: '',
      mediaFiles: [],
      mediaPreviews: []
    };
    setThreadPosts([...threadPosts, newPost]);
  };

  const removeThreadPost = (postId: string) => {
    const post = threadPosts.find(p => p.id === postId);
    if (post) {
      post.mediaPreviews.forEach(url => URL.revokeObjectURL(url));
    }
    setThreadPosts(threadPosts.filter(p => p.id !== postId));
  };

  const updateThreadPostCaption = (postId: string, caption: string) => {
    setThreadPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, caption } : post
    ));
  };

  const handleThreadMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, postId: string) => {
    const files = Array.from(e.target.files || []);

    setThreadPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (post.mediaFiles.length + files.length > 10) {
          alert('メディアは最大10個までアップロードできます');
          return post;
        }
        const oversized = files.find(f => f.size > 100 * 1024 * 1024);
        if (oversized) {
          alert(`${oversized.name} のサイズが大きすぎます（最大100MB）`);
          return post;
        }
        const newPreviews = files.map(file => URL.createObjectURL(file));
        return {
          ...post,
          mediaFiles: [...post.mediaFiles, ...files],
          mediaPreviews: [...post.mediaPreviews, ...newPreviews]
        };
      }
      return post;
    }));
  };

  const removeThreadMedia = (postId: string, index: number) => {
    setThreadPosts(prev => prev.map(post => {
      if (post.id === postId) {
        URL.revokeObjectURL(post.mediaPreviews[index]);
        return {
          ...post,
          mediaFiles: post.mediaFiles.filter((_, i) => i !== index),
          mediaPreviews: post.mediaPreviews.filter((_, i) => i !== index)
        };
      }
      return post;
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左ペイン：エディタ */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">投稿作成</h2>
                  <p className="text-sm text-muted-foreground">テキストと画像・動画を追加</p>
                </div>
              </div>
            </div>

            {/* メイン投稿 */}
            <Card className="mb-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="投稿内容を入力してください..."
                className="w-full h-64 p-4 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg resize-none text-slate-900"
              />
              <div className="flex items-center justify-between px-4 pb-4 border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">
                  {caption.length} / 500文字
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplateLibrary(!showTemplateLibrary)}
                  >
                    <Bookmark className="w-4 h-4 mr-1" />
                    テンプレート
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSaveTemplateModal(true)}
                    disabled={!caption}
                  >
                    <BookmarkPlus className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateAISuggestions}
                    isLoading={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI提案
                  </Button>
                </div>
              </div>
            </Card>

            {/* テンプレートライブラリ */}
            {showTemplateLibrary && (
              <Card className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">保存済みテンプレート</h3>
                  <span className="text-xs text-slate-500">{savedTemplates.length}件</span>
                </div>
                {savedTemplates.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    保存されたテンプレートはありません
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadTemplate(template)}
                          >
                            <div className="font-medium text-slate-900 mb-1">{template.name}</div>
                            <p className="text-xs text-slate-600 line-clamp-2">{template.caption}</p>
                            <div className="flex items-center gap-1 mt-2">
                              {template.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* メディアアップロード */}
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">画像・動画</h3>
                </div>
                <span className="text-xs text-slate-500">{mediaFiles.length} / 10</span>
              </div>

              {/* プレビューグリッド */}
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {mediaPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                      {mediaFiles[index].type.startsWith('video/') ? (
                        <video src={preview} className="w-full h-full object-cover" />
                      ) : (
                        <img src={preview} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                      {mediaFiles[index].type.startsWith('video/') && (
                        <div className="absolute bottom-1 left-1 px-2 py-1 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          動画
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* アップロードボタン */}
              <label className="block">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleMediaSelect}
                  className="hidden"
                  disabled={mediaFiles.length >= 10}
                />
                <div
                  className={`w-full px-4 py-3 border-2 border-dashed rounded-lg transition-all cursor-pointer text-center ${
                    isDragging
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex items-center justify-center gap-2 text-slate-600">
                    <Image className="w-5 h-5" />
                    <Video className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {isDragging
                        ? 'ここにドロップ'
                        : mediaFiles.length === 0
                          ? '画像・動画を選択、またはドラッグ&ドロップ'
                          : 'さらに追加'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    最大10ファイル、1ファイル100MBまで
                  </p>
                </div>
              </label>
            </Card>

            {/* スケジュール設定 */}
            <Card className="mb-4 border-border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">投稿日時</h3>
                  <p className="text-xs text-muted-foreground">予約投稿の日時を設定</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">日付</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground text-foreground bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">時刻</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground text-foreground bg-background"
                    />
                  </div>
                </div>
                {scheduledDate && (
                  <div className="text-sm text-muted-foreground bg-secondary px-4 py-3 rounded-xl">
                    📅 {scheduledDate.toLocaleString('ja-JP', {
                      timeZone: 'Asia/Tokyo',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </Card>

            {/* スレッドを追加ボタン */}
            <Button
              onClick={addThreadPost}
              variant="ghost"
              className="w-full mb-4 border-2 border-dashed border-border hover:border-foreground hover:bg-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              スレッドを追加
            </Button>

            {/* スレッド投稿一覧 */}
            {threadPosts.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">スレッド</span>
                </div>
                {threadPosts.map((post, index) => (
                  <Card key={post.id} className="relative border-border bg-card">
                    <div className="flex items-start gap-3 p-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-medium text-foreground">
                          {index + 1}
                        </div>
                        {index < threadPosts.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={post.caption}
                          onChange={(e) => updateThreadPostCaption(post.id, e.target.value)}
                          placeholder={`スレッド ${index + 1} の内容...`}
                          className="w-full h-24 p-3 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground resize-none text-foreground bg-background mb-3"
                        />

                        {/* メディアプレビュー */}
                        {post.mediaPreviews.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {post.mediaPreviews.map((preview, idx) => (
                              <div key={idx} className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden group">
                                {post.mediaFiles[idx]?.type.startsWith('video/') ? (
                                  <video src={preview} className="w-full h-full object-cover" />
                                ) : (
                                  <img src={preview} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                                )}
                                <button
                                  onClick={() => removeThreadMedia(post.id, idx)}
                                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* メディアアップロード */}
                        <label className="block mb-3">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleThreadMediaSelect(e, post.id)}
                            className="hidden"
                          />
                          <div
                            className="w-full px-3 py-2 border-2 border-dashed border-border rounded-xl hover:border-foreground hover:bg-secondary transition-all cursor-pointer text-center"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, post.id)}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Image className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-medium text-muted-foreground">
                                {post.mediaFiles.length === 0 ? '画像・動画を追加' : `${post.mediaFiles.length} / 10`}
                              </span>
                            </div>
                          </div>
                        </label>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{post.caption.length} / 500文字</span>
                          <button
                            onClick={() => removeThreadPost(post.id)}
                            className="text-sm text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSchedule}
                disabled={!caption || !scheduledDate || isUploading}
                className="flex-1 inline-flex items-center justify-center bg-white hover:bg-gray-50 text-black border border-gray-300 font-medium rounded-full px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {isUploading ? 'アップロード中...' : '予約する'}
              </button>
              <button
                onClick={handlePublishNow}
                disabled={!caption || isUploading}
                className="flex-1 inline-flex items-center justify-center text-white font-medium rounded-full px-6 py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#000000' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
              >
                <Send className="w-4 h-4 mr-2" />
                {isUploading ? 'アップロード中...' : '今すぐ投稿'}
              </button>
            </div>
          </div>

          {/* 右ペイン：AI提案 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">AI提案</h2>
                <p className="text-sm text-muted-foreground">テンプレートをクリックして適用</p>
              </div>
            </div>

            {aiSuggestions.length === 0 ? (
              <Card className="text-center py-16 border-border bg-card">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">「AI提案」ボタンをクリックして<br />テンプレートを生成してください</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => (
                  <Card
                    key={suggestion.id}
                    className="cursor-pointer hover:bg-secondary transition-colors border-border bg-card p-4"
                    onClick={() => applySuggestion(suggestion)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-foreground">
                        {suggestion.template_type === 'save' ? '📌 保存誘導' : suggestion.template_type === 'talk' ? '💬 会話促進' : '🎁 告知'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(suggestion.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap mb-3 leading-relaxed">
                      {suggestion.caption}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {suggestion.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* テンプレート保存モーダル */}
        {showSaveTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">テンプレートとして保存</h3>
                <p className="text-sm text-slate-600">後で再利用できるようにテンプレート名を入力してください</p>
              </div>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="例: 朝活投稿テンプレート"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSaveTemplateModal(false);
                    setTemplateName('');
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button onClick={handleSaveAsTemplate} className="flex-1">
                  保存
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
