import { supabaseAdmin } from './supabase-admin';
import { SlotQuality } from './types';

/**
 * BestTimeデータに基づいてslot_qualityを計算
 */

interface BestTimeData {
  weekday: number;
  hour: number;
  score: number;
}

/**
 * 予定投稿時刻からslot_qualityを計算
 * @param accountId アカウントID
 * @param scheduledAt 予定投稿時刻（ISO文字列またはDate）
 * @returns SlotQuality ('best' | 'normal' | 'avoid') または null
 */
export async function calculateSlotQuality(
  accountId: string,
  scheduledAt: string | Date | null
): Promise<SlotQuality | null> {
  if (!scheduledAt) {
    return null;
  }

  try {
    // 予定時刻をJSTに変換
    const date = new Date(scheduledAt);
    const jstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const weekday = jstDate.getDay(); // 0=日曜日
    const hour = jstDate.getHours();

    // アカウントのBestTimeデータを取得
    const { data: bestTimes, error } = await supabaseAdmin
      .from('best_times')
      .select('weekday, hour, score')
      .eq('account_id', accountId);

    if (error || !bestTimes || bestTimes.length === 0) {
      // BestTimeデータがない場合は null を返す
      return null;
    }

    // 該当する時間帯のスコアを取得
    const matchingTime = bestTimes.find(
      (bt: BestTimeData) => bt.weekday === weekday && bt.hour === hour
    );

    if (!matchingTime) {
      // 該当時間帯のデータがない場合は 'normal'
      return 'normal';
    }

    // スコアに基づいてslot_qualityを決定
    // スコア: 0-100
    // best: 70以上
    // normal: 30-69
    // avoid: 30未満
    if (matchingTime.score >= 70) {
      return 'best';
    } else if (matchingTime.score >= 30) {
      return 'normal';
    } else {
      return 'avoid';
    }
  } catch (error) {
    console.error('Error calculating slot quality:', error);
    return null;
  }
}

/**
 * 複数の時間帯のslot_qualityを一括計算（効率化版）
 */
export async function calculateSlotQualitiesForAccount(
  accountId: string
): Promise<Map<string, SlotQuality>> {
  const qualityMap = new Map<string, SlotQuality>();

  try {
    const { data: bestTimes, error } = await supabaseAdmin
      .from('best_times')
      .select('weekday, hour, score')
      .eq('account_id', accountId);

    if (error || !bestTimes) {
      return qualityMap;
    }

    for (const bt of bestTimes as BestTimeData[]) {
      const key = `${bt.weekday}-${bt.hour}`;
      let quality: SlotQuality;

      if (bt.score >= 70) {
        quality = 'best';
      } else if (bt.score >= 30) {
        quality = 'normal';
      } else {
        quality = 'avoid';
      }

      qualityMap.set(key, quality);
    }

    return qualityMap;
  } catch (error) {
    console.error('Error calculating slot qualities:', error);
    return qualityMap;
  }
}

/**
 * 最適な投稿時刻を提案
 */
export async function suggestBestTime(
  accountId: string,
  targetDate?: Date
): Promise<{ hour: number; minute: number; weekday: number; score: number } | null> {
  try {
    const { data: bestTimes, error } = await supabaseAdmin
      .from('best_times')
      .select('weekday, hour, score')
      .eq('account_id', accountId)
      .order('score', { ascending: false })
      .limit(1);

    if (error || !bestTimes || bestTimes.length === 0) {
      // デフォルト: 19:30
      return { hour: 19, minute: 30, weekday: -1, score: 0 };
    }

    const best = bestTimes[0] as BestTimeData;
    return {
      hour: best.hour,
      minute: 0, // 時間単位のため分は0
      weekday: best.weekday,
      score: best.score,
    };
  } catch (error) {
    console.error('Error suggesting best time:', error);
    return null;
  }
}
