'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Post } from '@/lib/types';
import { PostCard } from './PostCard';
import { Button } from '@/components/ui/Button';

interface WeekViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onSlotClick: (date: Date) => void;
  onPostMove?: (postId: string, newDate: Date) => void;
}

export function WeekView({ posts, onPostClick, onSlotClick, onPostMove }: WeekViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  // デバッグ
  console.log('📅 WeekView received posts:', posts);
  console.log('📅 Current week start:', currentWeekStart);

  // 10月30日の投稿を確認
  const oct30Posts = posts.filter(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getDate() === 30 && date.getMonth() === 9 && date.getFullYear() === 2025;
  });
  console.log(`🔍 WeekView Oct 30 posts: ${oct30Posts.length} posts`);
  oct30Posts.forEach(p => {
    const dateStr = p.state === 'published' ? p.published_at : p.scheduled_at;
    const date = new Date(dateStr!);
    console.log(`  📌 ${p.threads_post_id}: ${date.getHours()}時${String(date.getMinutes()).padStart(2, '0')}分 - ${p.caption?.substring(0, 50)}`);
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  // 1時間ごとに表示（0:00-23:00 = 24時間）
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i; // 0時から開始
    return {
      hour: hour,
      label: `${hour}:00`,
    };
  });

  const goToPreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  // 特定の時間帯の投稿を取得（1時間単位）
  const getPostsForSlot = (date: Date, hour: number): Post[] => {
    const filtered = posts.filter((post) => {
      // 配信済みの場合はpublished_at、予約済みの場合はscheduled_atを使用
      const dateStr = post.state === 'published' && post.published_at
        ? post.published_at
        : post.scheduled_at;

      if (!dateStr) {
        console.log('⚠️ Post has no date:', post.id, 'state:', post.state);
        return false;
      }

      const postDate = new Date(dateStr);
      const isSame = isSameDay(postDate, date);
      const postHour = postDate.getHours();
      const hourMatch = postHour === hour;

      if (isSame && hourMatch) {
        console.log('✅ Matched post:', {
          id: post.id,
          state: post.state,
          date: postDate.toISOString(),
          hour: postHour,
          slotHour: hour,
          caption: post.caption?.substring(0, 30)
        });
      }

      return isSame && hourMatch;
    });

    return filtered;
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (e: React.DragEvent, post: Post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', post.id);
  };

  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotKey);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, newDate: Date) => {
    e.preventDefault();
    if (draggedPost && onPostMove) {
      onPostMove(draggedPost.id, newDate);
    }
    setDraggedPost(null);
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setDragOverSlot(null);
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentWeekStart, 'yyyy年M月', { locale: ja })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              aria-label="前の週"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              aria-label="次の週"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors border border-border"
        >
          今日
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto mb-6">
        <div className="min-w-[1000px]">
          {/* Day Headers */}
          <div className="flex gap-3 mb-3 pl-[76px]">
            {weekDays.map((day) => {
              const dayIsToday = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 text-center pb-2 ${
                    dayIsToday
                      ? 'border-b-2 border-primary'
                      : 'border-b border-border'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    {format(day, 'EEE', { locale: ja })}
                  </div>
                  <div
                    className={`text-lg font-semibold ${
                      dayIsToday
                        ? 'text-primary'
                        : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          {timeSlots.map(({ hour, label }) => (
            <div key={hour} className="flex mb-1">
              {/* Time Label */}
              <div className="w-[68px] flex-shrink-0 pr-3 text-right pt-1">
                <span className="text-[11px] text-gray-500 font-semibold">{label}</span>
              </div>

              {/* Days */}
              <div className="flex-1 flex gap-1.5">
                {weekDays.map((day) => {
                  const postsInSlot = getPostsForSlot(day, hour);
                  const slotKey = `${day.toISOString()}-${hour}`;
                  const isOver = dragOverSlot === slotKey;
                  const post = postsInSlot[0]; // Buffer風: 1スロットに1投稿

                  // 過去・未来判定
                  const slotDate = new Date(day);
                  slotDate.setHours(hour, 0, 0, 0);
                  const now = new Date();
                  const isPast = slotDate < now;

                  return (
                    <div
                      key={slotKey}
                      className={`flex-1 h-[110px] rounded border transition-all ${
                        isOver
                          ? 'bg-blue-50 border-blue-300'
                          : post
                          ? 'bg-transparent border-transparent'
                          : isPast
                          ? 'bg-gray-50 border-gray-100 opacity-50'
                          : 'bg-transparent border-gray-100 hover:bg-gray-50'
                      } p-2 cursor-pointer relative group`}
                      onClick={() => onSlotClick(new Date(day.setHours(hour, 0, 0, 0)))}
                      onDragOver={(e) => handleDragOver(e, slotKey)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, new Date(day.setHours(hour, 0, 0, 0)))}
                    >
                      {post ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, post)}
                          onDragEnd={handleDragEnd}
                          className={`h-full ${
                            draggedPost?.id === post.id ? 'opacity-50' : 'opacity-100'
                          } cursor-move`}
                        >
                          <PostCard
                            post={post}
                            onClick={() => onPostClick(post)}
                          />
                        </div>
                      ) : !isPast ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Simplified */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-card border border-border rounded"></div>
            <span>未来の日</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary border border-border rounded opacity-60"></div>
            <span>過去の日</span>
          </div>
        </div>
      </div>
    </div>
  );
}
