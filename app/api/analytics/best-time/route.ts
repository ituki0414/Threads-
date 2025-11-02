import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 加重エンゲージメントスコアを計算
// いいね×1 + コメント×3 + 保存×4（保存は最も価値が高い）
function calculateEngagementScore(metrics: any): number {
  return (
    (metrics.likes || 0) * 1 +
    (metrics.comments || 0) * 3 +
    (metrics.saves || 0) * 4
  );
}

// 日本時間のDateオブジェクトを取得
function toJST(date: Date): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
}

// 15分刻みのスロットに変換（0-95の範囲）
function getTimeSlot(date: Date): number {
  const jstDate = toJST(date);
  const hour = jstDate.getHours();
  const minute = jstDate.getMinutes();
  return hour * 4 + Math.floor(minute / 15);
}

// スロット番号から時刻文字列に変換
function slotToTime(slot: number): { hour: number; minute: number; label: string } {
  const hour = Math.floor(slot / 4);
  const minute = (slot % 4) * 15;
  return {
    hour,
    minute,
    label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
  };
}

export async function GET() {
  try {
    console.log('📊 Analyzing best posting time with advanced algorithm...');

    // 公開済み投稿でメトリクスがあるものを取得
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('state', 'published')
      .not('metrics', 'is', null)
      .not('published_at', 'is', null);

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️ No posts with metrics found');
      return NextResponse.json({
        bestTime: { hour: 19, minute: 30 },
        insights: [
          '過去の投稿データを分析中...',
          'より多くの投稿データが蓄積されると、より正確な分析が可能になります',
        ],
      });
    }

    console.log(`📈 Analyzing ${posts.length} posts with weighted engagement score (15-min slots)`);

    // 15分スロットごとのエンゲージメントを集計（96スロット = 24h × 4）
    interface TimeSlotData {
      slot: number; // 0-95
      hour: number;
      minute: number;
      totalEngagement: number;
      count: number;
      avgEngagement: number;
      posts: any[];
      // ベイズ推定用の統計
      variance: number;
      confidenceScore: number; // データ数に基づく信頼度
    }

    const timeSlots: { [slot: number]: TimeSlotData } = {};

    for (const post of posts) {
      const publishedAt = new Date(post.published_at);
      const slot = getTimeSlot(publishedAt);
      const { hour, minute } = slotToTime(slot);

      if (!timeSlots[slot]) {
        timeSlots[slot] = {
          slot,
          hour,
          minute,
          totalEngagement: 0,
          count: 0,
          avgEngagement: 0,
          posts: [],
          variance: 0,
          confidenceScore: 0,
        };
      }

      // 新しい加重エンゲージメントスコア：いいね×1 + コメント×3 + 保存×4
      const metrics = post.metrics as any;
      const engagement = calculateEngagementScore(metrics);

      timeSlots[slot].totalEngagement += engagement;
      timeSlots[slot].count += 1;
      timeSlots[slot].posts.push({
        caption: post.caption?.substring(0, 30),
        engagement,
        likes: metrics.likes,
        comments: metrics.comments,
        saves: metrics.saves,
      });
    }

    // 平均エンゲージメントと信頼度スコアを計算
    for (const slotNum in timeSlots) {
      const slot = timeSlots[slotNum];
      slot.avgEngagement = slot.totalEngagement / slot.count;

      // 分散を計算
      const sumSquaredDiff = slot.posts.reduce(
        (sum, p) => sum + Math.pow(p.engagement - slot.avgEngagement, 2),
        0
      );
      slot.variance = slot.count > 1 ? sumSquaredDiff / (slot.count - 1) : 0;

      // 信頼度スコア = データ数の平方根（データが多いほど信頼できる）
      slot.confidenceScore = Math.sqrt(slot.count);
    }

    // ベイズ推定風の調整：データが少ないスロットにペナルティ
    // 全体平均をpriorとして使用
    const globalAvg =
      Object.values(timeSlots).reduce((sum, s) => sum + s.totalEngagement, 0) /
      Object.values(timeSlots).reduce((sum, s) => sum + s.count, 0);

    const MIN_SAMPLES = 3; // 最低3件のデータが必要
    const adjustedSlots = Object.values(timeSlots).map((slot) => {
      // データが少ない場合は全体平均に引き寄せる（Empirical Bayes）
      const weight = slot.count / (slot.count + MIN_SAMPLES);
      const adjustedAvg = weight * slot.avgEngagement + (1 - weight) * globalAvg;

      return {
        ...slot,
        adjustedAvgEngagement: adjustedAvg,
      };
    });

    // 調整後の平均エンゲージメントが最も高い時間帯を見つける
    const bestSlot = adjustedSlots.reduce((prev, current) =>
      current.adjustedAvgEngagement > prev.adjustedAvgEngagement ? current : prev
    );

    console.log(
      `✨ Best time slot: ${bestSlot.hour}:${bestSlot.minute
        .toString()
        .padStart(2, '0')} (adjusted avg: ${bestSlot.adjustedAvgEngagement.toFixed(2)}, samples: ${
        bestSlot.count
      })`
    );
    console.log(`📊 Confidence score: ${bestSlot.confidenceScore.toFixed(2)}`);
    console.log(
      `🔥 Top post at this slot:`,
      bestSlot.posts.sort((a, b) => b.engagement - a.engagement)[0]
    );

    // インサイトを生成
    const insights: string[] = [];

    // 1. 最適な時間帯（15分精度）
    const bestTimeLabel = `${bestSlot.hour.toString().padStart(2, '0')}:${bestSlot.minute
      .toString()
      .padStart(2, '0')}`;
    const timeRange = `${bestTimeLabel}-${String(
      (bestSlot.hour * 60 + bestSlot.minute + 15) % 1440
    )
      .padStart(4, '0')
      .replace(/(\d{2})(\d{2})/, '$1:$2')}`;

    insights.push(
      `${timeRange}が最も反応が良い時間帯（加重スコア: ${bestSlot.adjustedAvgEngagement.toFixed(1)}、投稿数: ${
        bestSlot.count
      }件）`
    );

    // 2. 投稿数が最も多い時間帯
    const mostActiveSlot = adjustedSlots.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    );
    if (mostActiveSlot.slot !== bestSlot.slot) {
      const activeTimeLabel = `${mostActiveSlot.hour.toString().padStart(2, '0')}:${mostActiveSlot.minute
        .toString()
        .padStart(2, '0')}`;
      insights.push(`${activeTimeLabel}台に最も多く投稿しています（${mostActiveSlot.count}件）`);
    }

    // 3. トップパフォーマー
    const topPost = posts.reduce((prev, current) => {
      const prevMetrics = prev.metrics as any;
      const currentMetrics = current.metrics as any;
      const prevEngagement =
        (prevMetrics.likes || 0) + (prevMetrics.comments || 0) * 2 + (prevMetrics.saves || 0) * 3;
      const currentEngagement =
        (currentMetrics.likes || 0) + (currentMetrics.comments || 0) * 2 + (currentMetrics.saves || 0) * 3;
      return currentEngagement > prevEngagement ? current : prev;
    });

    const topMetrics = topPost.metrics as any;
    const totalLikes = posts.reduce((sum, p) => sum + ((p.metrics as any).likes || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + ((p.metrics as any).comments || 0), 0);
    const totalSaves = posts.reduce((sum, p) => sum + ((p.metrics as any).saves || 0), 0);

    if (topMetrics.likes > 10 || topMetrics.comments > 5) {
      insights.push(
        `最も反応が良かった投稿: ${topMetrics.likes}いいね・${topMetrics.comments}コメント・${topMetrics.saves}保存`
      );
    }

    // 4. 全体的な統計
    insights.push(
      `過去${posts.length}件の投稿で合計${totalLikes}いいね・${totalComments}コメントを獲得`
    );

    return NextResponse.json({
      bestTime: {
        hour: bestSlot.hour,
        minute: bestSlot.minute,
      },
      insights,
      stats: {
        totalPosts: posts.length,
        bestSlot: bestSlot.slot,
        bestTimeLabel: `${bestSlot.hour.toString().padStart(2, '0')}:${bestSlot.minute
          .toString()
          .padStart(2, '0')}`,
        adjustedAvgEngagement: bestSlot.adjustedAvgEngagement,
        confidenceScore: bestSlot.confidenceScore,
        samplesAtBestTime: bestSlot.count,
      },
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze best time' },
      { status: 500 }
    );
  }
}
