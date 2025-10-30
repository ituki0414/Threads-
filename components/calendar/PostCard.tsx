'use client';

import { Post } from '@/lib/types';
import { Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  compact?: boolean;
}

export function PostCard({ post, onClick, compact = false }: PostCardProps) {
  const getStateConfig = () => {
    switch (post.state) {
      case 'published':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle className="w-3 h-3" />,
          label: '配信済み',
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
    // 配信済みの場合はpublished_at、予約済みの場合はscheduled_atを使用
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
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`${config.bg} ${config.border} border rounded px-2 py-1 cursor-pointer hover:shadow-sm transition-all duration-150`}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-700 line-clamp-1 flex-1">
            {post.caption || '（本文なし）'}
          </p>
          {getPostTime() && (
            <span className={`text-[9px] font-medium ${config.text} ml-1`}>
              {getPostTime()}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 通常モード（週表示用）- Buffer style + Threads風UI
  const hasMedia = post.media && post.media.length > 0;
  const firstMediaUrl = hasMedia ? post.media[0] : null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-full bg-white rounded-xl p-2.5 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200 flex gap-2.5 border border-transparent"
    >
      {/* Left: Thumbnail if media exists */}
      {firstMediaUrl && (
        <div className="flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={firstMediaUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              // 画像読み込み失敗時はアイコン表示に切り替え
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
              }
            }}
          />
        </div>
      )}

      {/* Right: Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Time and Status */}
        <div className="flex items-center justify-between mb-1.5">
          <div className={`flex items-center gap-1 ${config.text}`}>
            {config.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
          </div>
          {getPostTime() && (
            <span className="text-xs font-bold text-gray-900">
              {getPostTime()}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-[13px] text-gray-800 line-clamp-2 leading-snug font-normal">
          {post.caption || '（本文なし）'}
        </p>

        {/* Media count indicator (if multiple images) */}
        {post.media && post.media.length > 1 && (
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-auto pt-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            <span className="font-medium">+{post.media.length - 1}</span>
          </div>
        )}
      </div>
    </div>
  );
}
