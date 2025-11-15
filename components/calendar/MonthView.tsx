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
  isMultiSelectMode?: boolean;
  selectedPostIds?: Set<string>;
}

export function MonthView({ posts, onPostClick, onSlotClick, onPostMove, isMultiSelectMode = false, selectedPostIds = new Set() }: MonthViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedPost, setDraggedPost] = useState<Post | null>(null);

  // Debug logging for November 2025
  console.log('📊 MonthView - Total posts received:', posts.length);
  console.log('📊 MonthView - Current month:', format(currentMonth, 'yyyy-MM'));

  // Check November posts specifically
  const novemberPosts = posts.filter(post => {
    const dateStr = post.state === 'published' && post.published_at ? post.published_at : post.scheduled_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.getMonth() === 10 && date.getFullYear() === 2025; // November = 10 (0-indexed)
  });
  console.log('📊 MonthView - November 2025 posts:', novemberPosts.length);
  console.log('📊 MonthView - November posts sample:', novemberPosts.slice(0, 3).map(p => ({
    id: p.id,
    caption: p.caption?.substring(0, 30),
    scheduled_at: p.scheduled_at,
    published_at: p.published_at,
    state: p.state
  })));


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
    // Debug logging for specific dates
    const isNov14or15 = date.getDate() === 14 || date.getDate() === 15;
    const isNov2025 = date.getMonth() === 10 && date.getFullYear() === 2025;

    // Debug: show what we're looking for
    if (isNov14or15 && isNov2025) {
      console.log(`🔍 getPostsForDay called for: ${format(date, 'yyyy-MM-dd')} (${date.toISOString()})`);
      console.log(`🔍 Total posts to search: ${posts.length}`);
    }

    const filtered = posts.filter((post) => {
      const dateStr = post.state === 'published' && post.published_at
        ? post.published_at
        : post.scheduled_at;

      if (!dateStr) {
        // 日付がない投稿をログ
        if (isNov14or15 && isNov2025) {
          console.log(`⚠️ Post has no date: ID=${post.id}, threads_post_id=${post.threads_post_id}, state=${post.state}`);
        }
        return false;
      }

      const postDate = new Date(dateStr);
      const matches = isSameDay(postDate, date);

      // Debug log for Nov 14-15 - show ALL posts being checked, not just matches
      if (isNov14or15 && isNov2025) {
        console.log(`  📝 Checking post ${post.id.substring(0, 8)}: dateStr="${dateStr}", postDate local=${postDate.toLocaleString()}, matches=${matches}`);
      }

      // Debug log for matches
      if (isNov14or15 && isNov2025 && matches) {
        console.log(`    ✅ MATCH! ID=${post.id}, scheduled=${post.scheduled_at}, caption=${post.caption?.substring(0, 30)}`);
      }

      return matches;
    });

    // 重複を除去（threads_post_id または id でユニークにする）
    const uniquePosts = filtered.filter((post, index, self) => {
      // threads_post_idがある場合はそれで重複チェック
      if (post.threads_post_id) {
        return index === self.findIndex(p => p.threads_post_id === post.threads_post_id);
      }
      // threads_post_idがない場合（予約投稿など）はidで重複チェック
      return index === self.findIndex(p => p.id === post.id);
    });

    return uniquePosts;
  };

  // ヒートマップ用の背景色を取得（投稿数に応じて色の濃さを変える）
  const getHeatmapColor = (postCount: number): string => {
    if (postCount === 0) return '';
    if (postCount === 1) return 'bg-green-50';
    if (postCount === 2) return 'bg-green-100';
    if (postCount === 3) return 'bg-green-200';
    if (postCount === 4) return 'bg-green-300';
    return 'bg-green-400'; // 5件以上
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
                const postCount = postsInDay.length;
                const heatmapColor = getHeatmapColor(postCount);
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
                        : heatmapColor || 'bg-card'
                    } border-border/50 hover:border-border active:bg-secondary/20 ${
                      !isCurrentMonth ? 'opacity-30' : ''
                    } ${
                      draggedPost ? 'hover:ring-2 hover:ring-primary/50' : ''
                    } p-1.5 md:p-2 cursor-pointer touch-manipulation`}
                    onClick={() => !isDayPast && onSlotClick(day)}
                    onDragOver={(e) => {
                      if (draggedPost) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (draggedPost && onPostMove) {
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
                            isSelectable={isMultiSelectMode}
                            isSelected={selectedPostIds.has(post.id)}
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
        <div className="flex flex-col gap-3">
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

          {/* Heatmap Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">投稿頻度:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-50 border border-border rounded"></div>
              <span>1件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-border rounded"></div>
              <span>2件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-200 border border-border rounded"></div>
              <span>3件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-300 border border-border rounded"></div>
              <span>4件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 border border-border rounded"></div>
              <span>5件+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
