import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedAccount, createAuthErrorResponse } from '@/lib/auth';

// 日本時間のDateオブジェクトを取得
function toJST(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
}

// 日付の開始時刻を取得（00:00:00）
function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: Request) {
  try {
    // 認証チェック
    const authResult = await getAuthenticatedAccount();
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { accountId } = authResult;

    console.log('📊 Calculating weekly progress and streak for account:', accountId);

    // 公開済み投稿を取得（特定のアカウントのみ）
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('account_id', accountId)
      .eq('state', 'published')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️ No published posts found');
      return NextResponse.json({
        weeklyProgress: { completed: 0, target: 5 },
        streakDays: 0,
      });
    }

    const now = toJST(new Date());
    const today = getStartOfDay(now);

    // 今週の開始日（日曜日）を取得
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    // 今週の投稿数を計算
    const thisWeekPosts = posts.filter((post) => {
      const publishedAt = toJST(new Date(post.published_at));
      return publishedAt >= weekStart;
    });

    console.log(`📅 This week: ${thisWeekPosts.length} posts (since ${weekStart.toLocaleDateString('ja-JP')})`);

    // 連続投稿日数を計算
    let streakDays = 0;
    let checkDate = new Date(today);

    // 日付ごとの投稿数をマップ化
    const postsByDate = new Map<string, number>();
    for (const post of posts) {
      const publishedAt = toJST(new Date(post.published_at));
      const dateKey = getStartOfDay(publishedAt).toISOString().split('T')[0];
      postsByDate.set(dateKey, (postsByDate.get(dateKey) || 0) + 1);
    }

    // 今日から過去に遡って連続投稿日数を計算
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      const postsOnDate = postsByDate.get(dateKey) || 0;

      if (postsOnDate > 0) {
        streakDays++;
        console.log(`✅ ${dateKey}: ${postsOnDate} posts`);
      } else {
        // 投稿がない日が見つかったら終了
        console.log(`❌ ${dateKey}: No posts - streak ends`);
        break;
      }

      // 前日に移動
      checkDate.setDate(checkDate.getDate() - 1);

      // 安全のため、最大90日までチェック
      if (streakDays >= 90) {
        console.log('⚠️ Streak reached 90 days limit');
        break;
      }
    }

    console.log(`🔥 Current streak: ${streakDays} days`);

    // 承認待ちの投稿数を取得（特定のアカウントのみ）
    const { count: pendingCount, error: pendingError } = await supabaseAdmin
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('state', 'pending');

    console.log(`⏳ Pending approvals: ${pendingCount || 0}`);

    // 最近の投稿（上位3件）を取得し、エンゲージメント率を計算
    const recentPostsData = posts.slice(0, 3).map((post) => {
      const metrics = post.metrics as any;
      const views = metrics?.views || 0;
      const likes = metrics?.likes || 0;
      const comments = metrics?.comments || 0;
      const reposts = metrics?.reposts || 0;
      const quotes = metrics?.quotes || 0;

      // エンゲージメント率の計算：(いいね + コメント + リポスト + 引用) / 閲覧数 × 100
      // 閲覧数が0の場合は、総エンゲージメント数をそのまま表示
      const totalEngagement = likes + comments + reposts + quotes;
      const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0;

      return {
        id: post.id,
        caption: post.caption || '',
        publishedAt: post.published_at,
        saveRate: Number(engagementRate.toFixed(1)), // エンゲージメント率
        media: post.media || [],
        metrics: {
          views,
          likes,
          comments,
          reposts,
          quotes,
        },
      };
    });

    console.log(`📰 Recent posts: ${recentPostsData.length}`);

    return NextResponse.json({
      weeklyProgress: {
        completed: thisWeekPosts.length,
        target: 5, // 週5投稿を目標とする
      },
      streakDays,
      pendingApprovals: pendingCount || 0,
      recentPosts: recentPostsData,
      stats: {
        totalPosts: posts.length,
        thisWeekPosts: thisWeekPosts.length,
        lastPostDate: posts[0]?.published_at
          ? toJST(new Date(posts[0].published_at)).toLocaleDateString('ja-JP')
          : null,
      },
    });
  } catch (error) {
    console.error('❌ Progress calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate progress' },
      { status: 500 }
    );
  }
}
