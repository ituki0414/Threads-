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
}

export function MonthView({ posts, onPostClick, onSlotClick }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());


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
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              aria-label="前の月"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-secondary rounded-md transition-colors"
              aria-label="次の月"
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
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center text-xs font-semibold py-2 ${
                  index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-muted-foreground'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-2 mb-2">
              {week.map((day, dayIndex) => {
                const postsInDay = getPostsForDay(day);
                const isDayToday = isToday(day);
                const isDayPast = isPast(day) && !isDayToday;
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[120px] rounded-lg border transition-all ${
                      isDayPast
                        ? 'bg-secondary/50 border-border opacity-60'
                        : 'bg-card border-border hover:border-muted-foreground/30 hover:shadow-sm'
                    } ${
                      !isCurrentMonth ? 'opacity-40' : ''
                    } p-2 cursor-pointer`}
                    onClick={() => !isDayPast && onSlotClick(day)}
                  >
                    {/* Date */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          dayIndex === 0
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
                        <span className="text-xs text-muted-foreground">
                          {postsInDay.length}件
                        </span>
                      )}
                    </div>

                    {/* Posts */}
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {postsInDay.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onPostClick(post);
                          }}
                        >
                          <PostCard post={post} onClick={() => onPostClick(post)} compact />
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
