'use client';

import { X } from 'lucide-react';
import { Post } from '@/lib/types';

interface ThreadsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caption: string;
  media?: string[];
  profileName?: string;
  profileImage?: string;
}

export function ThreadsPreviewModal({
  isOpen,
  onClose,
  caption,
  media = [],
  profileName = 'あなたのアカウント',
  profileImage,
}: ThreadsPreviewModalProps) {
  if (!isOpen) return null;

  // 現在時刻を取得
  const now = new Date();
  const timeString = now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">プレビュー</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Threads-style post preview */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-4">
            {/* Profile section */}
            <div className="flex items-start gap-3 mb-3">
              {/* Profile image */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profileName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profileName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Post content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">{profileName}</span>
                  <span className="text-gray-500 text-xs">{timeString}</span>
                </div>

                {/* Caption */}
                {caption && (
                  <p className="text-gray-900 text-sm whitespace-pre-wrap mb-3 leading-relaxed">
                    {caption}
                  </p>
                )}

                {/* Media */}
                {media && media.length > 0 && (
                  <div className="space-y-2">
                    {media.length === 1 ? (
                      // Single media
                      <div className="rounded-xl overflow-hidden border border-gray-200">
                        {media[0].includes('.mp4') || media[0].includes('video') ? (
                          <video
                            src={media[0]}
                            controls
                            className="w-full max-h-[400px] object-cover bg-black"
                          />
                        ) : (
                          <img
                            src={media[0]}
                            alt="投稿画像"
                            className="w-full max-h-[400px] object-cover"
                          />
                        )}
                      </div>
                    ) : (
                      // Multiple media - grid layout
                      <div className={`grid gap-1 rounded-xl overflow-hidden border border-gray-200 ${
                        media.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                      }`}>
                        {media.slice(0, 4).map((mediaUrl, idx) => (
                          <div
                            key={idx}
                            className={`relative ${
                              media.length === 3 && idx === 0 ? 'col-span-2' : ''
                            }`}
                          >
                            {mediaUrl.includes('.mp4') || mediaUrl.includes('video') ? (
                              <video
                                src={mediaUrl}
                                className="w-full h-48 object-cover bg-black"
                                muted
                              />
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={`画像${idx + 1}`}
                                className="w-full h-48 object-cover"
                              />
                            )}
                            {/* Show +N overlay for last image if more than 4 */}
                            {idx === 3 && media.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                  +{media.length - 4}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement buttons (static) */}
                <div className="flex items-center gap-4 mt-4 text-gray-500">
                  <button className="hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="hover:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <button className="hover:text-green-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button className="hover:text-purple-500 transition-colors ml-auto">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview note */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <span className="font-bold">💡 プレビュー:</span> これは投稿のプレビューです。実際の投稿では、いいね数やコメント数などが表示されます。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
