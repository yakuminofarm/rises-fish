// 日付は "YYYY-MM-DD" の文字列で持ち、ローカル時刻で計算する

const pad = (n: number) => String(n).padStart(2, "0");

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(s: string, n: number): string {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** b - a の日数 */
export function diffDays(a: string, b: string): number {
  return Math.round((parseISO(b).getTime() - parseISO(a).getTime()) / 86400000);
}

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function weekday(s: string): number {
  return parseISO(s).getDay();
}

export function fmtMD(s: string): string {
  const d = parseISO(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtMDW(s: string): string {
  return `${fmtMD(s)}（${WEEKDAYS[weekday(s)]}）`;
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** その週の月曜日 */
export function startOfWeek(s: string): string {
  const wd = weekday(s);
  return addDays(s, wd === 0 ? -6 : 1 - wd);
}

export function maxISO(a: string, b: string): string {
  return a > b ? a : b;
}
