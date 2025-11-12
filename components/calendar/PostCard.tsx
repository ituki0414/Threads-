'use client';

import { Post } from '@/lib/types';
import { Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  compact?: boolean;
  onDragStart?: (post: Post) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export function PostCard({ post, onClick, compact = false, onDragStart, onDragEnd, isDragging = false }: PostCardProps) {
  const getStateConfig = () => {
    switch (post.state) {
      case 'published':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle className="w-3 h-3" />,
          label: '公開済み',
        };
      case 'scheduled':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: <Clock className="w-3 h-3" />,
          label: '予約済み',
        };
      case 'needs_approval':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-700',
          icon: <Clock className="w-3 h-3" />,
          label: '承認待ち',
        };
      case 'failed':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <Clock className="w-3 h-3" />,
          label: '失敗',
        };
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          text: 'text-slate-700',
          icon: <Clock className="w-3 h-3" />,
          label: '下書き',
        };
    }
  };

  // 投稿時刻を取得
  const getPostTime = () => {
    // 公開済みの場合はpublished_at、予約済みの場合はscheduled_atを使用
    const date = post.state === 'published' && post.published_at
      ? new Date(post.published_at)
      : post.scheduled_at
      ? new Date(post.scheduled_at)
      : null;
    if (!date) return '';
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  const config = getStateConfig();

  // コンパクトモード（月表示用）
  if (compact) {
    return (
      <div
        draggable={true}
        onDragStart={(e) => {
          if (onDragStart) {
            e.stopPropagation();
            onDragStart(post);
          }
        }}
        onDragEnd={() => {
          if (onDragEnd) {
            onDragEnd();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`${config.bg} ${config.border} border rounded px-2 py-1 transition-all duration-150 cursor-move hover:shadow-sm ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-1.5">
          {/* メディアサムネイル */}
          {post.media && post.media.length > 0 && (
            <div className="w-5 h-5 rounded overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={post.media[0]}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          <p className="text-[11px] text-slate-700 line-clamp-1 flex-1">
            {post.caption || '（本文なし）'}
          </p>
          {getPostTime() && (
            <span className={`text-[9px] font-medium ${config.text} ml-1 flex-shrink-0`}>
              {getPostTime()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 通常モード（週表示用）- Buffer style with state indicators + thumbnail
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`h-full rounded border p-2 cursor-pointer hover:shadow transition-all duration-150 flex flex-col overflow-hidden ${
        post.state === 'published'
          ? 'bg-green-50 border-green-300 hover:border-green-400'
          : 'bg-blue-50 border-blue-300 hover:border-blue-400'
      }`}
    >
      {/* Header: Status badge + Time */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {config.icon}
          <span className={`text-[10px] font-bold uppercase tracking-wide ${config.text}`}>
            {config.label}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-900">
          {getPostTime() || '--:--'}
        </span>
      </div>

      {/* Content with thumbnail layout */}
      <div className="flex gap-2.5 flex-1 overflow-hidden">
        {/* Text content */}
        <p className={`text-sm line-clamp-4 leading-[1.3] flex-1 font-normal ${
          post.state === 'published' ? 'text-gray-800' : 'text-gray-700'
        }`}>
          {post.caption || '（本文なし）'}
        </p>

        {/* Thumbnails - if media exists */}
        {post.media && post.media.length > 0 && (
          <div className="flex-shrink-0">
            {post.media.length === 1 ? (
              // 1枚の場合: 大きく表示
              <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 relative">
                {post.media[0].includes('.mp4') || post.media[0].includes('video') ? (
                  <>
                    <video
                      src={post.media[0]}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </>
                ) : (
                  <img
                    src={post.media[0]}
                    alt="投稿画像"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              // 複数枚の場合: 2x2グリッド（最大4枚まで表示）
              <div className="w-[52px] grid grid-cols-2 gap-0.5">
                {post.media.slice(0, 4).map((mediaUrl, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-sm overflow-hidden bg-gray-100 relative"
                  >
                    {mediaUrl.includes('.mp4') || mediaUrl.includes('video') ? (
                      <>
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={mediaUrl}
                        alt={`画像${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    {/* 5枚以上ある場合、4枚目に+Nオーバーレイ */}
                    {idx === 3 && post.media.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">
                          +{post.media.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media count indicator at bottom */}
      {post.media && post.media.length > 1 && (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-200">
          <ImageIcon className="w-3 h-3" />
          <span className="font-medium">{post.media.length}枚</span>
        </div>
      )}
    </div>
  );
}
