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
