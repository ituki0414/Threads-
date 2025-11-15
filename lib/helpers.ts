/**
 * アプリケーション全体で使用するヘルパー関数
 */

import { PG_ERROR_CODES } from './constants';

// ===== 遅延関数 =====

/**
 * 指定したミリ秒待機する
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// ===== エラーハンドリング =====

/**
 * PostgreSQLエラーが特定のエラーコードか判定
 */
export function isPgError(error: any, code: string): boolean {
  return error?.code === code;
}

/**
 * UNIQUE制約違反エラーか判定
 */
export function isUniqueViolation(error: any): boolean {
  return isPgError(error, PG_ERROR_CODES.UNIQUE_VIOLATION);
}

/**
 * 外部キー制約違反エラーか判定
 */
export function isForeignKeyViolation(error: any): boolean {
  return isPgError(error, PG_ERROR_CODES.FOREIGN_KEY_VIOLATION);
}

/**
 * NOT NULL制約違反エラーか判定
 */
export function isNotNullViolation(error: any): boolean {
  return isPgError(error, PG_ERROR_CODES.NOT_NULL_VIOLATION);
}

/**
 * エラーオブジェクトから安全にメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

// ===== 日付/時刻関数 =====

/**
 * 日付が過去かどうか判定
 */
export function isPastDate(date: Date): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < now;
}

/**
 * 日付が未来かどうか判定
 */
export function isFutureDate(date: Date): boolean {
  const now = new Date();
  return date > now;
}

// ===== データ変換 =====

/**
 * 配列から重複を削除
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * 配列をチャンク（指定サイズの配列に分割）
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * オブジェクトから null/undefined を除外
 */
export function removeNullish<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null)
  ) as Partial<T>;
}

// ===== バリデーション =====

/**
 * 文字列が空でないか検証
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * 配列が空でないか検証
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * 有効なURLか検証
 */
export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// ===== ログ関数 =====

/**
 * 構造化ログを出力（開発用）
 */
export function logInfo(message: string, data?: Record<string, any>): void {
  if (data) {
    console.log(`ℹ️  ${message}`, data);
  } else {
    console.log(`ℹ️  ${message}`);
  }
}

/**
 * エラーログを出力
 */
export function logError(message: string, error?: unknown): void {
  console.error(`❌ ${message}`, error || '');
}

/**
 * 警告ログを出力
 */
export function logWarning(message: string, data?: Record<string, any>): void {
  if (data) {
    console.warn(`⚠️  ${message}`, data);
  } else {
    console.warn(`⚠️  ${message}`);
  }
}

/**
 * 成功ログを出力
 */
export function logSuccess(message: string, data?: Record<string, any>): void {
  if (data) {
    console.log(`✅ ${message}`, data);
  } else {
    console.log(`✅ ${message}`);
  }
}
