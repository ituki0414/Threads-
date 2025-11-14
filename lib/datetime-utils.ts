/**
 * datetime-local input用のユーティリティ関数
 * ブラウザのローカルタイムゾーンで正しく動作します
 */

/**
 * DateオブジェクトをYYYY-MM-DDTHH:MM形式の文字列に変換
 * ローカルタイムゾーンを使用
 */
export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * YYYY-MM-DDTHH:MM形式の文字列をDateオブジェクトに変換
 * ローカルタイムゾーンとして解釈
 */
export function parseDateFromInput(dateString: string): Date {
  // YYYY-MM-DDTHH:MM形式の文字列をパース
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // ローカルタイムゾーンでDateオブジェクトを作成
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * DateオブジェクトをデータベースSQL形式に変換
 * ローカルタイムゾーンを保持したままPostgreSQLのtimestamp形式に変換
 */
export function formatDateForDatabase(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // PostgreSQL timestamp format (without timezone, treated as local)
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * データベースから取得した日時文字列をDateオブジェクトに変換
 * ローカルタイムゾーンとして解釈（タイムゾーン変換を避ける）
 *
 * Supabaseは timestamp を ISO 8601形式で返すが、
 * タイムゾーン情報を無視してローカル時刻として扱う
 */
export function parseDateFromDatabase(dateString: string): Date {
  // ISO 8601形式 (2025-11-14T21:10:02+00:00 または 2025-11-14T21:10:02Z) または
  // PostgreSQL形式 (2025-11-14 21:10:02) をパース

  // タイムゾーン情報を削除して、ローカル時刻として扱う
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);

  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );
  }

  // マッチしない場合はエラーログを出して現在時刻を返す
  console.error('Failed to parse date from database:', dateString);
  return new Date();
}
