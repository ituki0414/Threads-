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
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="h-full bg-white rounded-xl p-2 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-150 flex flex-col"
    >
      {/* Time and Status */}
      <div className="flex items-center justify-between mb-1">
        {getPostTime() && (
          <span className="text-[13px] font-bold text-gray-900">
            {getPostTime()}
          </span>
        )}
        <div className={`flex items-center gap-0.5 ${config.text}`}>
          {config.icon}
          <span className="text-[10px] font-semibold uppercase tracking-wide">{config.label}</span>
        </div>
      </div>

      {/* Content */}
      <p className="text-[12px] text-gray-700 line-clamp-2 leading-tight font-normal flex-1">
        {post.caption || '（本文なし）'}
      </p>

      {/* Media indicator */}
      {post.media && post.media.length > 0 && (
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1 pt-1 border-t border-gray-100">
          <ImageIcon className="w-3 h-3" />
          <span className="font-medium">{post.media.length}枚</span>
        </div>
      )}
    </div>
  );
}
