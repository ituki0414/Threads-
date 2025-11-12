'use client';

import { useState } from 'react';
import { X, Calendar, Edit2, Trash2, Send, Clock, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Post } from '@/lib/types';
import { ThreadsPreviewModal } from './ThreadsPreviewModal';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onUpdate: (updatedPost: Post) => void;
  onDelete: (postId: string) => void;
  onPublish: (postId: string) => void;
}

export function PostModal({ post, onClose, onUpdate, onDelete, onPublish }: PostModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [scheduledAt, setScheduledAt] = useState(
    post.scheduled_at ? new Date(post.scheduled_at) : null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSave = () => {
    const updatedPost: Post = {
      ...post,
      caption,
      scheduled_at: scheduledAt?.toISOString() || null,
    };
    onUpdate(updatedPost);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(post.id);
  };

  const handlePublishNow = () => {
    if (confirm('この投稿を今すぐ公開しますか？')) {
      onPublish(post.id);
      onClose();
    }
  };

  const getStateLabel = () => {
    switch (post.state) {
      case 'published':
        return { label: '公開済み', color: 'bg-green-100 text-green-700' };
      case 'scheduled':
        return { label: '予約済み', color: 'bg-blue-100 text-blue-700' };
      case 'draft':
        return { label: '下書き', color: 'bg-slate-100 text-slate-700' };
      case 'needs_approval':
        return { label: '承認待ち', color: 'bg-orange-100 text-orange-700' };
      case 'failed':
        return { label: '失敗', color: 'bg-red-100 text-red-700' };
      default:
        return { label: '不明', color: 'bg-slate-100 text-slate-700' };
    }
  };

  const stateInfo = getStateLabel();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">投稿詳細</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${stateInfo.color}`}>
              {stateInfo.label}
            </span>
            {/* 公開済み投稿を見るボタン */}
            {post.state === 'published' && post.permalink && (
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-800 transition-all shadow-sm hover:shadow-md border border-slate-800"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                投稿を見る
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="space-y-6">
          {/* 本文 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">投稿内容</label>
              {!isEditing && post.state !== 'published' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  編集
                </Button>
              )}
            </div>
            {isEditing ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-48 p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-wrap">
                {caption}
              </div>
            )}
            <div className="text-xs text-slate-500 mt-1">{caption.length} / 500文字</div>
          </div>

          {/* スレッド投稿 - ツリー形式 */}
          {post.threads && post.threads.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">
                スレッド投稿（{post.threads.length}件）
              </label>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                {/* 親投稿 */}
                <div className="relative mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">親</span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
                        <div className="text-xs text-blue-600 font-medium mb-2">メイン投稿</div>
                        <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                          {caption}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 接続線 */}
                  <div className="absolute left-5 top-12 w-0.5 h-8 bg-gradient-to-b from-blue-400 to-blue-300"></div>
                </div>

                {/* スレッド子投稿 */}
                <div className="space-y-3 ml-2">
                  {post.threads.map((threadText, index) => (
                    <div key={index} className="relative">
                      {/* 接続線 */}
                      <div className="absolute left-3 -top-3 w-0.5 h-6 bg-gradient-to-b from-blue-300 to-blue-200"></div>

                      <div className="flex items-start gap-3">
                        {/* ツリー接続インジケーター */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md border-2 border-white">
                            <span className="text-white font-bold text-xs">{index + 1}</span>
                          </div>
                          {/* 次の投稿への接続線 */}
                          {index < (post.threads?.length ?? 0) - 1 && (
                            <div className="absolute left-1/2 top-8 w-0.5 h-7 bg-gradient-to-b from-blue-300 to-blue-200 -translate-x-1/2"></div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-100 hover:border-blue-300 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-xs text-blue-600 font-medium">スレッド {index + 1}</div>
                              <div className="h-1 w-1 rounded-full bg-blue-300"></div>
                              <div className="text-xs text-slate-400">返信</div>
                            </div>
                            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {threadText}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* メディア */}
          {post.media && post.media.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">添付メディア</label>
              <div className="grid grid-cols-2 gap-2">
                {post.media.map((url, idx) => (
                  <div key={idx} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                    {url.includes('.mp4') || url.includes('video') ? (
                      // 動画の場合
                      <video
                        src={url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // 画像の場合
                      <img
                        src={url}
                        alt={`Media ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* スケジュール */}
          {post.state !== 'published' && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-slate-600" />
                <label className="text-sm font-medium text-slate-700">投稿日時</label>
              </div>
              {isEditing ? (
                <input
                  type="datetime-local"
                  value={scheduledAt ? scheduledAt.toISOString().slice(0, 16) : ''}
                  onChange={(e) =>
                    setScheduledAt(e.target.value ? new Date(e.target.value) : null)
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : scheduledAt ? (
                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">
                    {new Date(scheduledAt).toLocaleString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-slate-500">スケジュール未設定</div>
              )}
            </div>
          )}

          {/* スロット品質 */}
          {post.slot_quality && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">スロット品質</label>
              <div
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
                  post.slot_quality === 'best'
                    ? 'bg-green-100 text-green-700'
                    : post.slot_quality === 'normal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                <span className="text-sm font-medium">
                  {post.slot_quality === 'best'
                    ? '最適な時間帯'
                    : post.slot_quality === 'normal'
                    ? '通常の時間帯'
                    : '避けるべき時間帯'}
                </span>
              </div>
            </div>
          )}

          {/* メタ情報 */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="text-xs text-slate-500 mb-1">作成日時</div>
              <div className="text-sm text-slate-900">
                {new Date(post.created_at).toLocaleString('ja-JP')}
              </div>
            </div>
            {post.published_at && (
              <div>
                <div className="text-xs text-slate-500 mb-1">公開日時</div>
                <div className="text-sm text-slate-900">
                  {new Date(post.published_at).toLocaleString('ja-JP')}
                </div>
              </div>
            )}
          </div>

          {/* エンゲージメント（公開済みの場合） */}
          {post.state === 'published' && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">
                  {post.metrics?.likes || 0}
                </div>
                <div className="text-xs text-slate-500">いいね</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">
                  {post.metrics?.comments || 0}
                </div>
                <div className="text-xs text-slate-500">コメント</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold text-slate-900">
                  {post.metrics?.saves || 0}
                </div>
                <div className="text-xs text-slate-500">保存</div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setCaption(post.caption);
                  setScheduledAt(post.scheduled_at ? new Date(post.scheduled_at) : null);
                  setIsEditing(false);
                }}
              >
                キャンセル
              </Button>
              <Button onClick={handleSave}>変更を保存</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setIsPreviewOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  プレビュー
                </Button>
                {post.state === 'scheduled' && (
                  <Button onClick={handlePublishNow}>
                    <Send className="w-4 h-4 mr-2" />
                    今すぐ公開
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <ThreadsPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        caption={caption}
        media={post.media || []}
      />
    </div>
  );
}
