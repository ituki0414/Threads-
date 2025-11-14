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
 * DateオブジェクトをデータベースISO形式に変換
 *
 * JavaScript Dateオブジェクトは内部的にUTC時刻を保持しています。
 * 例: `new Date(2025, 10, 19, 4, 0)` は「JST 2025-11-19 04:00」を表し、
 * 内部的には「UTC 2025-11-18 19:00」として保持されます。
 *
 * PostgreSQLの`timestamp without time zone`カラムはUTCとして扱うため、
 * Dateオブジェクトの内部UTC値をそのまま保存すればOKです。
 */
export function formatDateForDatabase(date: Date): string {
  // DateオブジェクトのUTC値を使用
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  // ISO 8601 format without timezone (will be treated as UTC by PostgreSQL)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * データベースから取得した日時文字列をDateオブジェクトに変換
 *
 * PostgreSQLは`timestamp without time zone`をUTCとして返します（+00:00付き）。
 * JavaScriptのDateオブジェクトは内部的にUTCを保持するため、
 * そのままDate.UTC()で変換すればOKです。
 *
 * 例: DB「2025-11-18T19:00:00+00:00」→ Date(UTC 19:00) → ローカル表示で「2025-11-19 04:00 JST」
 */
export function parseDateFromDatabase(dateString: string): Date {
  // ISO 8601形式 (2025-11-14T19:00:00+00:00 または 2025-11-14T19:00:00Z) をパース
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/);

  if (match) {
    const [, year, month, day, hours, minutes, seconds] = match;

    // UTCとしてDateオブジェクトを作成（内部的にUTCを保持）
    return new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    ));
  }

  // マッチしない場合はエラーログを出して現在時刻を返す
  console.error('Failed to parse date from database:', dateString);
  return new Date();
}
