/**
 * datetime-local input用のユーティリティ関数
 * ブラウザのローカルタイムゾーンで正しく動作します
 */

/**
 * DateオブジェクトをYYYY-MM-DDTHH:MM形式の文字列に変換
 * ローカルタイムゾーンを使用
 */
export function formatDateForInput(date: Date): string {
  // タイムゾーンオフセットを考慮してローカル時刻を取得
  const offset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
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
