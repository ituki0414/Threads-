'use client';

import { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, isPast } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Post } from '@/lib/types';
import { PostCard } from './PostCard';

interface MonthViewProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onSlotClick: (date: Date) => void;
  onPostMove?: (postId: string, newDate: Date) => void;
}

export function MonthView({ posts, onPostClick, onSlotClick, onPostMove }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);


  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // 月の最初と最後の日を取得
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // カレンダー表示用の最初と最後の日（週の始まりと終わりを含む）
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜日始まり
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // カレンダーの全ての日を生成
  const calendarDays: Date[] = [];
  let day = new Date(calendarStart); // Create a copy
  while (day <= calendarEnd) {
    calendarDays.push(new Date(day)); // Push a copy, not the reference
    day = addDays(day, 1);
  }

  // 週ごとに分割
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }


  // 特定の日の投稿を取得
  const getPostsForDay = (date: Date): Post[] => {
    const filtered = posts.filter((post) => {
      const dateStr = post.state === 'published' && post.published_at
        ? post.published_at
        : post.scheduled_at;

      if (!dateStr) {
        // 日付がない投稿をログ
        console.log(`⚠️ Post has no date: ID=${post.threads_post_id}, state=${post.state}`);
        return false;
      }

      const postDate = new Date(dateStr);
      return isSameDay(postDate, date);
    });

    return filtered;
  };

  return (
    <div className="flex flex-col h-full p-3 md:p-6">
      {/* Header - X style mobile-first */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <div className="flex items-center gap-0">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 md:p-2 hover:bg-secondary/80 rounded-full transition-colors"
              aria-label="前の月"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 md:p-2 hover:bg-secondary/80 rounded-full transition-colors"
              aria-label="次の月"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <button
          onClick={goToToday}
          className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-foreground hover:bg-secondary/80 rounded-full transition-colors border border-border"
        >
          今日
        </button>
      </div>

      {/* Calendar Grid - responsive */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-full md:min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-[10px] md:text-xs font-bold py-1.5 md:py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks - mobile optimized */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
              {week.map((day, dayIndex) => {
                const postsInDay = getPostsForDay(day);
                const isDayToday = isToday(day);
                const isDayPast = isPast(day) && !isDayToday;
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[70px] md:min-h-[120px] rounded-md md:rounded-lg border transition-all ${
                      isDayToday
                        ? 'bg-primary/5 border-primary ring-1 ring-primary'
                        : isDayPast
                        ? 'bg-secondary/30 border-border/50 opacity-60'
                        : 'bg-card border-border/50 hover:border-border active:bg-secondary/20'
                    } ${
                      !isCurrentMonth ? 'opacity-30' : ''
                    } ${
                      draggedPost && !isDayPast ? 'hover:ring-2 hover:ring-primary/50' : ''
                    } p-1.5 md:p-2 cursor-pointer touch-manipulation`}
                    onClick={() => !isDayPast && onSlotClick(day)}
                    onDragOver={(e) => {
                      if (draggedPost && !isDayPast) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedPost && !isDayPast && onPostMove) {
                        onPostMove(draggedPost.id, day);
                        setDraggedPost(null);
                      }
                    }}
                  >
                    {/* Date */}
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span
                        className={`text-xs md:text-sm font-semibold ${
                          isDayToday
                            ? 'text-primary'
                            : dayIndex === 0
                            ? 'text-red-500'
                            : dayIndex === 6
                            ? 'text-blue-500'
                            : isCurrentMonth
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {postsInDay.length > 0 && (
                        <span className="text-[9px] md:text-xs text-muted-foreground font-medium">
                          {postsInDay.length}
                        </span>
                      )}
                    </div>

                    {/* Posts */}
                    <div className="space-y-0.5 md:space-y-1 max-h-[50px] md:max-h-[80px] overflow-y-auto scrollbar-thin">
                      {postsInDay.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPostClick(post);
                          }}
                        >
                          <PostCard
                            post={post}
                            onClick={() => onPostClick(post)}
                            compact
                            onDragStart={(p) => setDraggedPost(p)}
                            onDragEnd={() => setDraggedPost(null)}
                            isDragging={draggedPost?.id === post.id}
                          />
                        </div>
                      ))}
                      {postsInDay.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center pt-1">
                          +{postsInDay.length - 3}件
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-border mt-4">
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
