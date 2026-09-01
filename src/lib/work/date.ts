// 日付ユーティリティ。サーバー・クライアント双方から使うので副作用なし。
// このツールは日本国内での運用前提のため、日付は常に JST(+09:00) で解釈する。

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 現在時刻(または指定時刻)の JST における YYYY-MM-DD */
export function todayJst(now: Date = new Date()): string {
  return new Date(now.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** YYYY-MM-DD を JST の 0 時として扱った UNIX ミリ秒 */
function dayStartMs(ymd: string): number {
  return Date.parse(`${ymd}T00:00:00+09:00`);
}

/** b から見た a の日数差（a が未来なら正） */
export function diffDays(a: string, b: string): number {
  return Math.round((dayStartMs(a) - dayStartMs(b)) / 86_400_000);
}

export function addDays(ymd: string, days: number): string {
  return new Date(dayStartMs(ymd) + days * 86_400_000 + JST_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function weekdayJa(ymd: string): string {
  return WEEKDAYS[new Date(dayStartMs(ymd)).getUTCDay()];
}

/** 「今日」「明日」「3日前」など、人が読む相対表現 */
export function relativeLabel(ymd: string, today: string): string {
  const d = diffDays(ymd, today);
  if (d === 0) return "今日";
  if (d === 1) return "明日";
  if (d === 2) return "明後日";
  if (d === -1) return "昨日";
  if (d < 0) return `${-d}日超過`;
  if (d <= 7) return `${d}日後`;
  return formatMd(ymd);
}

export function formatMd(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${Number(m)}/${Number(d)}`;
}

export function isValidYmd(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(dayStartMs(value))
  );
}

/** ISO 文字列から JST の日付を得る */
export function ymdFromIso(iso: string): string {
  return todayJst(new Date(iso));
}
