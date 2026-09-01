// APIキーが無い環境でも「書き殴り → タスク化」が成立するための簡易パーサ。
// AI の代替ではなく、あくまで最低ラインの保証。
// サーバー専用にはせず、単体テストしやすいよう副作用なしで書く。

import { addDays, todayJst } from "./date";
import { TaskDraft } from "./tasks";

// 上から順に判定する。「餌の発注」のように主語と動作が別分類にまたがる場合、
// 動作を表す語のほうが業務の区分としては正しいので、世話は最後に置く。
const CATEGORY_RULES: [string, RegExp][] = [
  ["出荷", /発送|出荷|梱包|配送|納品|ヤマト|郵便|宅配|袋詰|パッキング/],
  ["仕入", /仕入|発注|注文|購入|買う|買い|補充|調達|取り寄せ/],
  [
    "事務",
    /請求|入金|振込|支払|確定申告|帳簿|経費|領収書|見積|契約|申請|税|保険|銀行|書類|返信|メール|電話/,
  ],
  [
    "販促",
    /投稿|SNS|インスタ|ツイート|撮影|写真|イベント|即売|販売会|告知|宣伝|メルカリ|ヤフオク|出品|チラシ|ホームページ/,
  ],
  [
    "世話",
    /餌|エサ|えさ|水換|水替|掃除|選別|産卵|採卵|針子|稚魚|親魚|越冬|グリーンウォーター|ゾウリムシ|ミジンコ|水質|エアレーション|飼育|容器|ヒーター/,
  ],
];

const HIGH_PRIORITY = /至急|急ぎ|大至急|今すぐ|最優先|重要|絶対|マスト|やばい|ヤバい|忘れずに/;
const LOW_PRIORITY = /いつか|余裕|そのうち|できれば|暇な|後で|あとで|優先度低/;

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

interface Extracted {
  dueDate: string | null;
  /** 消費した文字列。タイトルから取り除く */
  consumed: string[];
}

/** 「明日」「3日後」「12/5」などから期限を割り出す */
function extractDue(text: string, today: string): Extracted {
  const consumed: string[] = [];

  const rel: [RegExp, number][] = [
    [/今日|本日|きょう/, 0],
    [/明日|あした|あす/, 1],
    [/明後日|あさって/, 2],
    [/明々後日|しあさって/, 3],
  ];
  for (const [re, offset] of rel) {
    const m = text.match(re);
    if (m) {
      consumed.push(m[0]);
      return { dueDate: addDays(today, offset), consumed };
    }
  }

  const nDays = text.match(/(\d{1,2})\s*日後/);
  if (nDays) {
    consumed.push(nDays[0]);
    return { dueDate: addDays(today, Number(nDays[1])), consumed };
  }

  const nWeeks = text.match(/(\d{1,2})\s*週間後/);
  if (nWeeks) {
    consumed.push(nWeeks[0]);
    return { dueDate: addDays(today, Number(nWeeks[1]) * 7), consumed };
  }

  // 「今週末」「来週」など、ざっくりした指定。長い語から先に見る
  const vague: [RegExp, number][] = [
    [/来週末/, daysUntilWeekday(today, 6) + 7],
    [/今週末|週末/, daysUntilWeekday(today, 6)],
    [/再来週/, 14],
    [/来週/, 7],
    [/今週中|今週|週内/, daysUntilWeekday(today, 0)],
    [/今月末|月末|今月中|月内/, daysUntilMonthEnd(today)],
  ];
  for (const [re, offset] of vague) {
    const m = text.match(re);
    if (m) {
      consumed.push(m[0]);
      return { dueDate: addDays(today, offset), consumed };
    }
  }

  // 「月曜まで」「金曜日」
  const wd = text.match(/([日月火水木金土])曜(?:日)?/);
  if (wd) {
    const target = WEEKDAYS.indexOf(wd[1]);
    const offset = daysUntilWeekday(today, target);
    consumed.push(wd[0]);
    return { dueDate: addDays(today, offset), consumed };
  }

  // 「12月5日」「12/5」
  const md = text.match(/(\d{1,2})\s*[月\/]\s*(\d{1,2})\s*日?/);
  if (md) {
    const month = Number(md[1]);
    const day = Number(md[2]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      consumed.push(md[0]);
      return { dueDate: resolveMonthDay(today, month, day), consumed };
    }
  }

  return { dueDate: null, consumed };
}

/** 今日から見て次に target 曜日が来るまでの日数（今日なら7日後扱いにはしない） */
function daysUntilWeekday(today: string, target: number): number {
  const current = new Date(`${today}T00:00:00+09:00`).getUTCDay();
  const diff = (target - current + 7) % 7;
  return diff;
}

function daysUntilMonthEnd(today: string): number {
  const [y, m, d] = today.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.max(lastDay - d, 0);
}

/** 月日から年を補う。過ぎている日付は来年とみなす */
function resolveMonthDay(today: string, month: number, day: number): string {
  const year = Number(today.slice(0, 4));
  const pad = (n: number) => String(n).padStart(2, "0");
  const candidate = `${year}-${pad(month)}-${pad(day)}`;
  return candidate >= today ? candidate : `${year + 1}-${pad(month)}-${pad(day)}`;
}

function extractEstimate(text: string): { min: number | null; consumed: string[] } {
  const half = text.match(/半日/);
  if (half) return { min: 240, consumed: [half[0]] };

  const hours = text.match(/(\d{1,2}(?:\.\d)?)\s*時間/);
  if (hours) {
    return { min: Math.round(Number(hours[1]) * 60), consumed: [hours[0]] };
  }

  const mins = text.match(/(\d{1,3})\s*分/);
  if (mins) return { min: Number(mins[1]), consumed: [mins[0]] };

  return { min: null, consumed: [] };
}

function extractRepeat(text: string): {
  repeat: TaskDraft["repeat"];
  consumed: string[];
} {
  const daily = text.match(/毎日|日次/);
  if (daily) return { repeat: "daily", consumed: [daily[0]] };
  const weekly = text.match(/毎週|週次/);
  if (weekly) return { repeat: "weekly", consumed: [weekly[0]] };
  const monthly = text.match(/毎月|月次/);
  if (monthly) return { repeat: "monthly", consumed: [monthly[0]] };
  return { repeat: "none", consumed: [] };
}

function detectCategory(text: string): string {
  for (const [category, re] of CATEGORY_RULES) {
    if (re.test(text)) return category;
  }
  return "その他";
}

/**
 * 走り書きを行・句読点で割って、それぞれをタスクにする。
 * 1行が長すぎる場合だけ「、」でも割る（自然文を刻みすぎないため）。
 */
function splitSegments(input: string): string[] {
  const segments: string[] = [];

  for (const rawLine of input.split(/\r?\n/)) {
    const line = rawLine.replace(/^[\s\-*・+>＞●○■□◆]+/, "").trim();
    if (!line) continue;

    const byPeriod = line
      .split(/[。;；]/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of byPeriod) {
      if (part.length > 60 && /[、,]/.test(part)) {
        segments.push(
          ...part
            .split(/[、,]/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 2),
        );
      } else {
        segments.push(part);
      }
    }
  }

  return segments.slice(0, 40);
}

/** タイトルから、期限などに読み替えた語を取り除いて読みやすくする */
function stripConsumed(text: string, consumed: string[]): string {
  let out = text;
  for (const token of consumed) {
    out = out.replace(token, " ");
  }
  return out
    .replace(/^[\s、,。]*(までに|まで|には|に|は|を|の)\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 優先度として解釈した語を、タイトルから取り除くために拾う */
function matchPriority(segment: string): {
  priority: TaskDraft["priority"];
  consumed: string[];
} {
  const high = segment.match(HIGH_PRIORITY);
  if (high) return { priority: "high", consumed: [high[0]] };
  const low = segment.match(LOW_PRIORITY);
  if (low) return { priority: "low", consumed: [low[0]] };
  return { priority: "mid", consumed: [] };
}

export interface OfflineParseResult {
  drafts: TaskDraft[];
  note: string;
}

/** 走り書きテキストをタスク下書きの配列にする */
export function parseBrainDump(
  input: string,
  today: string = todayJst(),
): OfflineParseResult {
  const drafts: TaskDraft[] = [];

  for (const segment of splitSegments(input)) {
    const due = extractDue(segment, today);
    const estimate = extractEstimate(segment);
    const repeat = extractRepeat(segment);
    const priority = matchPriority(segment);

    const consumed = [
      ...due.consumed,
      ...estimate.consumed,
      ...repeat.consumed,
      ...priority.consumed,
    ];
    const title = stripConsumed(segment, consumed) || segment;

    drafts.push({
      title,
      detail: "",
      priority: priority.priority,
      category: detectCategory(segment),
      // 繰り返しなのに日付が無いと今日の作戦に出てこないので、今日から始める
      dueDate: due.dueDate ?? (repeat.repeat !== "none" ? today : null),
      estimateMin: estimate.min,
      repeat: repeat.repeat,
    });
  }

  return {
    drafts,
    note:
      drafts.length === 0
        ? "タスクとして読み取れる文がありませんでした。"
        : `${drafts.length}件を登録しました。日付や優先度は推測なので、違っていたら直してください。`,
  };
}
