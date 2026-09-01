// 「今日なにをやるか」を決める採点ロジック。
// AI に頼らず動くことが要件（APIキーなしでもツールとして成立させる）。

import { Nudge, PlanItem, Task } from "./types";
import { diffDays, ymdFromIso } from "./date";

export function isOpen(task: Task): boolean {
  return task.status === "todo" || task.status === "doing";
}

interface Scored {
  score: number;
  reasons: string[];
}

/**
 * 優先度スコア。数字そのものに意味はなく、並び順を決めるための相対値。
 * 「期限」より「放置され続けていること」を重く見るのがこのツールの方針。
 */
export function scoreTask(task: Task, today: string): Scored {
  let score = 0;
  const reasons: string[] = [];

  if (task.dueDate) {
    const d = diffDays(task.dueDate, today);
    if (d < 0) {
      score += 100 + Math.min(-d, 30) * 8;
      reasons.push(`${-d}日超過`);
    } else if (d === 0) {
      score += 85;
      reasons.push("今日が期限");
    } else if (d === 1) {
      score += 45;
      reasons.push("明日が期限");
    } else if (d <= 3) {
      score += 28;
      reasons.push(`期限まで${d}日`);
    } else if (d <= 7) {
      score += 14;
      reasons.push("今週中");
    }
  } else {
    score += 4;
  }

  if (task.priority === "high") {
    score += 32;
    reasons.push("重要");
  } else if (task.priority === "mid") {
    score += 12;
  }

  if (task.status === "doing") {
    score += 18;
    reasons.push("着手済み");
  }

  // 何度も先送りしているものほど前に出す
  if (task.postponeCount >= 2) {
    score += task.postponeCount * 9;
    reasons.push(`${task.postponeCount}回先送り`);
  }

  // 動きのないまま古くなったタスク（塩漬け）を掘り起こす
  const idleDays = diffDays(today, ymdFromIso(task.updatedAt));
  if (idleDays >= 14) {
    score += 22;
    reasons.push(`${idleDays}日動きなし`);
  } else if (idleDays >= 7) {
    score += 10;
  }

  // 15分で終わるものは差し込みやすいので少しだけ優遇
  if (task.estimateMin !== null && task.estimateMin <= 15) {
    score += 6;
    reasons.push("すぐ終わる");
  }

  return { score, reasons };
}

/**
 * 今日の作戦を組む。
 * 1日の可処分時間(capacityMin)に収まる範囲で上から詰め、
 * 溢れたぶんは「今日は手を出さないもの」として返す。
 */
export function buildTodayPlan(
  tasks: Task[],
  today: string,
  capacityMin: number,
): { plan: PlanItem[]; overflow: PlanItem[]; plannedMin: number } {
  const ranked: PlanItem[] = tasks
    .filter(isOpen)
    .map((task) => {
      const { score, reasons } = scoreTask(task, today);
      return { task, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.task.title.localeCompare(b.task.title));

  const plan: PlanItem[] = [];
  const overflow: PlanItem[] = [];
  let plannedMin = 0;

  for (const item of ranked) {
    // 見積り未設定は 30 分とみなす（過小評価より詰め込みすぎを防ぐ）
    const cost = item.task.estimateMin ?? 30;
    const mustDoToday =
      item.task.dueDate !== null && diffDays(item.task.dueDate, today) <= 0;

    if (plannedMin + cost <= capacityMin || (mustDoToday && plan.length < 12)) {
      plan.push(item);
      plannedMin += cost;
    } else {
      overflow.push(item);
    }
  }

  return { plan, overflow, plannedMin };
}

/**
 * 「気になっていること」＝ 放っておくと事故になる項目。
 * リマインドを自分で組めない人向けに、システム側から声をかける材料。
 */
export function buildNudges(tasks: Task[], today: string): Nudge[] {
  const nudges: Nudge[] = [];

  for (const task of tasks) {
    if (!isOpen(task)) continue;

    if (task.dueDate) {
      const d = diffDays(task.dueDate, today);
      if (d < 0) {
        nudges.push({
          kind: "overdue",
          taskId: task.id,
          title: task.title,
          message: `期限を${-d}日過ぎています。今日やるか、期限を引き直すか決めましょう。`,
        });
        continue;
      }
      if (d === 0) {
        nudges.push({
          kind: "today",
          taskId: task.id,
          title: task.title,
          message: "今日が期限です。",
        });
        continue;
      }
    }

    if (task.postponeCount >= 3) {
      nudges.push({
        kind: "postponed",
        taskId: task.id,
        title: task.title,
        message: `${task.postponeCount}回先送りしています。小さく分割するか、思い切って見送りましょう。`,
      });
      continue;
    }

    const idleDays = diffDays(today, ymdFromIso(task.updatedAt));
    if (idleDays >= 14) {
      nudges.push({
        kind: "stale",
        taskId: task.id,
        title: task.title,
        message: `${idleDays}日間そのままです。まだ必要ですか？`,
      });
      continue;
    }

    if (!task.dueDate && task.priority === "high") {
      nudges.push({
        kind: "nodue",
        taskId: task.id,
        title: task.title,
        message: "重要なのに期限がありません。日付を決めておきましょう。",
      });
    }
  }

  const order: Record<Nudge["kind"], number> = {
    overdue: 0,
    today: 1,
    postponed: 2,
    stale: 3,
    nodue: 4,
  };
  return nudges.sort((a, b) => order[a.kind] - order[b.kind]);
}

export interface WeekBucket {
  date: string;
  count: number;
  minutes: number;
}

/** 今日から7日分の負荷。山が見えると前倒しの判断ができる */
export function buildWeekLoad(tasks: Task[], today: string): WeekBucket[] {
  const buckets = new Map<string, WeekBucket>();
  for (let i = 0; i < 7; i += 1) {
    const date = shift(today, i);
    buckets.set(date, { date, count: 0, minutes: 0 });
  }

  for (const task of tasks) {
    if (!isOpen(task) || !task.dueDate) continue;
    const bucket = buckets.get(task.dueDate);
    if (!bucket) continue;
    bucket.count += 1;
    bucket.minutes += task.estimateMin ?? 30;
  }

  return [...buckets.values()];
}

function shift(ymd: string, days: number): string {
  const ms = Date.parse(`${ymd}T00:00:00+09:00`) + days * 86_400_000;
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export interface Summary {
  open: number;
  overdue: number;
  dueToday: number;
  doneToday: number;
  doneThisWeek: number;
}

export function summarize(tasks: Task[], today: string): Summary {
  let open = 0;
  let overdue = 0;
  let dueToday = 0;
  let doneToday = 0;
  let doneThisWeek = 0;

  for (const task of tasks) {
    if (isOpen(task)) {
      open += 1;
      if (task.dueDate) {
        const d = diffDays(task.dueDate, today);
        if (d < 0) overdue += 1;
        else if (d === 0) dueToday += 1;
      }
    } else if (task.status === "done" && task.completedAt) {
      const d = diffDays(today, ymdFromIso(task.completedAt));
      if (d === 0) doneToday += 1;
      if (d >= 0 && d < 7) doneThisWeek += 1;
    }
  }

  return { open, overdue, dueToday, doneToday, doneThisWeek };
}
