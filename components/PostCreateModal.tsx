'use client';

import { useState } from 'react';
import { X, Calendar, Clock, Image as ImageIcon, Video, Plus, Trash2, Eye, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThreadsPreviewModal } from './ThreadsPreviewModal';
import { formatDateForInput, parseDateFromInput } from '@/lib/datetime-utils';

interface ThreadPost {
  id: string;
  caption: string;
  mediaFiles: File[];
  mediaPreviews: string[];
}

interface PostCreateModalProps {
  onClose: () => void;
  onCreate: (caption: string, scheduledAt: Date, media: string[], threads: string[]) => void;
  onCreateRecurring?: (caption: string, scheduledAt: Date, media: string[], threads: string[]) => void;
  initialDate?: Date;
}

export function PostCreateModal({ onClose, onCreate, onCreateRecurring, initialDate }: PostCreateModalProps) {
  const [caption, setCaption] = useState('');
  const [scheduledAt, setScheduledAt] = useState<Date>(initialDate || new Date());
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [threads, setThreads] = useState<ThreadPost[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // ファイルサイズチェック（100MB = 100 * 1024 * 1024バイト）
    const maxSize = 100 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSize);

    if (invalidFiles.length > 0) {
      alert(`以下のファイルが100MBを超えています：\n${invalidFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')}`);
      return;
    }

    // 最大10ファイルまで
    const newFiles = files.slice(0, 10 - mediaFiles.length);
    setMediaFiles((prev) => [...prev, ...newFiles]);

    // プレビュー生成
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddThread = () => {
    const newThread: ThreadPost = {
      id: `thread-${Date.now()}`,
      caption: '',
      mediaFiles: [],
      mediaPreviews: [],
    };
    setThreads((prev) => [...prev, newThread]);
  };

  const handleRemoveThread = (id: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const handleThreadCaptionChange = (id: string, value: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, caption: value } : t))
    );
  };

  const handleThreadMediaUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // ファイルサイズチェック（100MB = 100 * 1024 * 1024バイト）
    const maxSize = 100 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxSize);

    if (invalidFiles.length > 0) {
      alert(`以下のファイルが100MBを超えています：\n${invalidFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n')}`);
      return;
    }

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== id) return thread;

        const currentCount = thread.mediaFiles.length;
        const newFiles = files.slice(0, 10 - currentCount);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

        return {
          ...thread,
          mediaFiles: [...thread.mediaFiles, ...newFiles],
          mediaPreviews: [...thread.mediaPreviews, ...newPreviews],
        };
      })
    );
  };

  const handleRemoveThreadMedia = (threadId: string, mediaIndex: number) => {
    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id !== threadId) return thread;

        return {
          ...thread,
          mediaFiles: thread.mediaFiles.filter((_, i) => i !== mediaIndex),
          mediaPreviews: thread.mediaPreviews.filter((_, i) => i !== mediaIndex),
        };
      })
    );
  };

  const handleCreate = () => {
    // バリデーションエラーをクリア
    setValidationError(null);

    if (!caption.trim()) {
      alert('投稿内容を入力してください');
      return;
    }

    // 過去の日時チェック
    const now = new Date();
    if (scheduledAt <= now) {
      setValidationError('過去の日時には予約投稿できません。現在時刻より後の日時を選択してください。');
      return;
    }

    // メディアURLを生成（実際のアップロードは後で実装）
    const mediaUrls = mediaPreviews; // 仮
    const threadCaptions = threads.map((t) => t.caption).filter((c) => c.trim());

    onCreate(caption, scheduledAt, mediaUrls, threadCaptions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">投稿詳細</h2>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              予約済み
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="space-y-6">
          {/* 本文 */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">投稿内容</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="投稿内容を入力..."
              className="w-full h-32 p-4 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-card text-foreground"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground mt-1">{caption.length} / 500文字</div>
          </div>

          {/* メディアアップロード */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              メディア（画像・動画）
            </label>
            <div className="space-y-3">
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {mediaPreviews.map((preview, index) => {
                    const isVideo = mediaFiles[index]?.type.startsWith('video/');
                    return (
                      <div key={index} className="relative aspect-square bg-secondary rounded-lg overflow-hidden group">
                        {isVideo ? (
                          <div className="relative w-full h-full">
                            <video
                              src={preview}
                              className="w-full h-full object-cover"
                              preload="metadata"
                              muted
                              playsInline
                              onLoadedMetadata={(e) => {
                                e.currentTarget.currentTime = 0.1;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center">
                                <Video className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={preview}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        <button
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {mediaFiles.length < 10 && (
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-lg hover:border-primary cursor-pointer transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                  <Plus className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    メディアを追加（{mediaFiles.length}/10）
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* ツリー形式投稿（スレッド） */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                スレッド（ツリー形式投稿）
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAddThread}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                追加
              </Button>
            </div>
            {threads.length > 0 && (
              <div className="space-y-2">
                {threads.map((thread, index) => (
                  <div key={thread.id} className="flex items-start gap-2 pl-4 border-l-2 border-primary/30">
                    <div className="flex-1 space-y-2">
                      <div className="text-xs text-muted-foreground">スレッド {index + 1}</div>
                      <textarea
                        value={thread.caption}
                        onChange={(e) => handleThreadCaptionChange(thread.id, e.target.value)}
                        placeholder={`スレッド ${index + 1} の内容...`}
                        className="w-full h-20 p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-card text-foreground text-sm"
                        maxLength={500}
                      />
                      <div className="text-xs text-muted-foreground">
                        {thread.caption.length} / 500文字
                      </div>

                      {/* スレッド用メディアプレビュー */}
                      {thread.mediaPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {thread.mediaPreviews.map((preview, mediaIndex) => {
                            const file = thread.mediaFiles[mediaIndex];
                            const isVideo = file?.type.startsWith('video/');

                            return (
                              <div key={mediaIndex} className="relative group">
                                {isVideo ? (
                                  <div className="relative">
                                    <video
                                      src={preview}
                                      className="w-full h-24 object-cover rounded border border-border"
                                      preload="metadata"
                                      muted
                                      playsInline
                                      onLoadedMetadata={(e) => {
                                        // 最初のフレームを表示
                                        e.currentTarget.currentTime = 0.1;
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                                        <Video className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={preview}
                                    alt=""
                                    className="w-full h-24 object-cover rounded border border-border"
                                    onError={(e) => {
                                      console.error('Image load error:', e);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                                <button
                                  onClick={() => handleRemoveThreadMedia(thread.id, mediaIndex)}
                                  className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* スレッド用メディア追加ボタン */}
                      {thread.mediaFiles.length < 10 && (
                        <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary transition-colors">
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleThreadMediaUpload(thread.id, e)}
                            className="hidden"
                          />
                          <Plus className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            メディアを追加（{thread.mediaFiles.length}/10）
                          </span>
                        </label>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveThread(thread.id)}
                      className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              スレッドを追加すると、複数の投稿を連続して投稿できます
            </div>
          </div>

          {/* スケジュール */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <label className="text-sm font-medium text-foreground">投稿日時</label>
            </div>
            <div>
              <input
                type="datetime-local"
                value={formatDateForInput(scheduledAt)}
                onChange={(e) => {
                  // バリデーションエラーをクリア
                  setValidationError(null);

                  const newDate = parseDateFromInput(e.target.value);
                  setScheduledAt(newDate);
                }}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-card text-foreground"
              />
              {validationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{validationError}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900">
                {scheduledAt.toLocaleString('ja-JP', {
                  timeZone: 'Asia/Tokyo',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* 作成日時 */}
          <div className="p-4 bg-secondary rounded-lg border border-border">
            <div className="text-xs text-muted-foreground mb-1">作成日時</div>
            <div className="text-sm text-foreground">
              {new Date().toLocaleString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              キャンセル
            </Button>
            {onCreateRecurring && (
              <Button
                variant="secondary"
                onClick={() => {
                  const threadCaptions = threads.map((t) => t.caption).filter((c) => c.trim());
                  onCreateRecurring(caption, scheduledAt, mediaPreviews, threadCaptions);
                }}
                className="flex items-center gap-2"
              >
                <Repeat className="w-4 h-4" />
                繰り返し
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              プレビュー
            </Button>
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              投稿を予約
            </Button>
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <ThreadsPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        caption={caption}
        media={mediaPreviews}
      />
    </div>
  );
}
