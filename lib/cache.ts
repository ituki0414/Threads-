/**
 * シンプルなインメモリキャッシュ
 * サーバーレス環境でも動作（リクエスト間で共有される可能性あり）
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // 5分ごとに期限切れエントリを削除
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * キャッシュに値を設定
   * @param key キャッシュキー
   * @param value 値
   * @param ttlSeconds 有効期限（秒）
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * キャッシュから値を取得
   * @param key キャッシュキー
   * @returns 値（存在しないまたは期限切れの場合はundefined）
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * キャッシュから値を削除
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * パターンにマッチするキーを削除
   */
  deletePattern(pattern: string): number {
    let count = 0;
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 期限切れエントリを削除
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * キャッシュの統計情報
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// シングルトンインスタンス
export const cache = new MemoryCache();

/**
 * キャッシュキーの生成ヘルパー
 */
export function createCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`;
}

// よく使うキャッシュキープレフィックス
export const CACHE_KEYS = {
  BEST_TIMES: 'best_times',
  ACCOUNT: 'account',
  SLOT_QUALITIES: 'slot_qualities',
  PROFILE: 'profile',
} as const;

// デフォルトTTL（秒）
export const CACHE_TTL = {
  SHORT: 60, // 1分
  MEDIUM: 300, // 5分
  LONG: 900, // 15分
  HOUR: 3600, // 1時間
} as const;

/**
 * キャッシュを使用してデータを取得するヘルパー
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // キャッシュをチェック
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // データを取得
  const data = await fetcher();

  // キャッシュに保存
  cache.set(key, data, ttlSeconds);

  return data;
}

export default cache;
