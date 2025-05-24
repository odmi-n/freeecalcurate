// HH:MM → 分
export function toMinutes(timeStr: string): number {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return NaN;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// 分 → 時間表示
export function formatMinutes(total: number): string {
  const h = Math.floor(Math.abs(total) / 60);
  const m = Math.abs(total) % 60;
  return `${total < 0 ? '-' : ''}${h}時間${m}分`;
}

// 金額をフォーマット
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
}

// 現在の時刻を HH:MM 形式で取得
export function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// 現在の日付を YYYY/MM/DD 形式で取得
export function getCurrentDate(): string {
  const now = new Date();
  return `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
}

// 現在の日付を YYYY-MM-DD 形式で取得（フォーマット用）
export function getCurrentDateFormatted(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const weekday = weekdays[now.getDay()];
  return `${year}年${month}月${day}日（${weekday}）`;
} 