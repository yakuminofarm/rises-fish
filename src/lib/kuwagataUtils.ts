import { Beetle, BreedingLine, Expense, ExpenseCategory, Larva, LarvaStage, LineStatus } from "@/types/kuwagata";

export const SPECIES_OPTIONS = [
  "オオクワガタ",
  "ヒラタクワガタ",
  "コクワガタ",
  "ノコギリクワガタ",
  "ミヤマクワガタ",
  "パラワンオオヒラタ",
  "スマトラオオヒラタ",
  "アンタエウスオオクワガタ",
  "ギラファノコギリクワガタ",
  "ニジイロクワガタ",
  "タランドゥスオオツヤクワガタ",
  "オウゴンオニクワガタ",
  "その他",
];

export const LINE_STATUS_LABELS: Record<LineStatus, string> = {
  pairing: "ペアリング中",
  laying: "産卵セット中",
  waiting_split: "割り出し待ち",
  split_done: "割り出し済み",
  finished: "終了",
};

export const LINE_STATUS_COLORS: Record<LineStatus, string> = {
  pairing: "bg-pink-100 text-pink-700",
  laying: "bg-amber-100 text-amber-700",
  waiting_split: "bg-orange-100 text-orange-700",
  split_done: "bg-emerald-100 text-emerald-700",
  finished: "bg-gray-100 text-gray-500",
};

export const LINE_STATUS_ORDER: LineStatus[] = [
  "pairing",
  "laying",
  "waiting_split",
  "split_done",
  "finished",
];

export const STAGE_LABELS: Record<LarvaStage, string> = {
  egg: "卵",
  L1: "初齢",
  L2: "2齢",
  L3: "3齢",
  pupa: "蛹",
  adult: "羽化",
};

export const STAGE_COLORS: Record<LarvaStage, string> = {
  egg: "bg-gray-100 text-gray-600",
  L1: "bg-lime-100 text-lime-700",
  L2: "bg-green-100 text-green-700",
  L3: "bg-emerald-100 text-emerald-700",
  pupa: "bg-amber-100 text-amber-700",
  adult: "bg-violet-100 text-violet-700",
};

export const STAGE_ORDER: LarvaStage[] = ["egg", "L1", "L2", "L3", "pupa", "adult"];

/** ビン交換の目安間隔 (日) */
export const BOTTLE_CHANGE_INTERVAL_DAYS = 90;

export function daysBetween(from: string, to: Date = new Date()): number {
  const ms = to.getTime() - new Date(from).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function latestBottleChange(larva: Larva) {
  if (larva.bottleChanges.length === 0) return undefined;
  return [...larva.bottleChanges].sort((a, b) => b.date.localeCompare(a.date))[0];
}

export function latestWeight(larva: Larva): number | undefined {
  const withWeight = larva.bottleChanges
    .filter((c) => c.weightG != null)
    .sort((a, b) => b.date.localeCompare(a.date));
  return withWeight[0]?.weightG;
}

/** ビン交換からの経過日数 (幼虫・生存中のみ対象) */
export function daysSinceLastChange(larva: Larva): number | undefined {
  const last = latestBottleChange(larva);
  if (!last) return undefined;
  return daysBetween(last.date);
}

// ── 種類別のビジュアルカラー (アバターのグラデーション) ──────
export const SPECIES_GRADIENTS: Record<string, string> = {
  "オオクワガタ": "from-slate-700 to-indigo-950",
  "ヒラタクワガタ": "from-zinc-600 to-zinc-900",
  "コクワガタ": "from-stone-500 to-stone-800",
  "ノコギリクワガタ": "from-orange-700 to-red-950",
  "ミヤマクワガタ": "from-yellow-700 to-amber-950",
  "パラワンオオヒラタ": "from-slate-600 to-slate-950",
  "スマトラオオヒラタ": "from-gray-600 to-gray-950",
  "アンタエウスオオクワガタ": "from-indigo-700 to-indigo-950",
  "ギラファノコギリクワガタ": "from-amber-700 to-yellow-950",
  "ニジイロクワガタ": "from-emerald-500 via-teal-600 to-fuchsia-700",
  "タランドゥスオオツヤクワガタ": "from-neutral-600 to-black",
  "オウゴンオニクワガタ": "from-yellow-400 to-amber-700",
};

export function speciesGradient(species: string): string {
  return SPECIES_GRADIENTS[species] ?? "from-amber-600 to-amber-900";
}

// ── 費用・収支 ──────────────────────────────────────
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "ゼリー",
  "菌糸ビン",
  "マット",
  "産卵材",
  "器具・用品",
  "その他",
];

export function formatYen(n: number): string {
  return `¥${Math.round(n).toLocaleString("ja-JP")}`;
}

/** ペアの合計金額を2個体に按分する (端数は1匹目に寄せる) */
export function splitPairAmount(total: number): [number, number] {
  const a = Math.ceil(total / 2);
  return [a, total - a];
}

/** 幼虫1頭あたりのコスト = 入手金額 + ビン・マット代の累計 */
export function larvaCost(larva: Larva): number {
  const bottles = larva.bottleChanges.reduce((sum, c) => sum + (c.costYen ?? 0), 0);
  return (larva.priceYen ?? 0) + bottles;
}

export interface CostSummary {
  beetlePurchase: number;   // 成虫の入手金額合計
  larvaPurchase: number;    // 幼虫の入手金額合計
  bottleCost: number;       // ビン・マット代合計 (幼虫の交換記録)
  expenseByCategory: Partial<Record<ExpenseCategory, number>>;
  expenseTotal: number;     // 消耗品・経費合計
  totalSpent: number;       // 総支出
  salesTotal: number;       // 販売額合計
  balance: number;          // 収支 (売上 - 支出)
}

export function calcCostSummary(
  beetles: Beetle[],
  larvae: Larva[],
  expenses: Expense[]
): CostSummary {
  const beetlePurchase = beetles.reduce((s, b) => s + (b.priceYen ?? 0), 0);
  const larvaPurchase = larvae.reduce((s, l) => s + (l.priceYen ?? 0), 0);
  const bottleCost = larvae.reduce(
    (s, l) => s + l.bottleChanges.reduce((t, c) => t + (c.costYen ?? 0), 0),
    0
  );
  const expenseByCategory: Partial<Record<ExpenseCategory, number>> = {};
  let expenseTotal = 0;
  for (const e of expenses) {
    expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + e.amountYen;
    expenseTotal += e.amountYen;
  }
  const totalSpent = beetlePurchase + larvaPurchase + bottleCost + expenseTotal;
  const salesTotal = beetles.reduce((s, b) => s + (b.soldPriceYen ?? 0), 0);
  return {
    beetlePurchase,
    larvaPurchase,
    bottleCost,
    expenseByCategory,
    expenseTotal,
    totalSpent,
    salesTotal,
    balance: salesTotal - totalSpent,
  };
}

export interface UpcomingTask {
  id: string;
  kind: "bottle" | "split" | "set";
  title: string;
  detail: string;
  overdue: boolean;
}

/** ダッシュボード用: 今やるべき作業を導出する */
export function deriveUpcomingTasks(lines: BreedingLine[], larvae: Larva[]): UpcomingTask[] {
  const tasks: UpcomingTask[] = [];

  // ペアリング開始から1週間経過 → 産卵セット投入の目安
  for (const line of lines) {
    if (line.status === "pairing" && line.pairingDate) {
      const days = daysBetween(line.pairingDate);
      if (days >= 7) {
        tasks.push({
          id: `set-${line.id}`,
          kind: "set",
          title: `${line.name} 産卵セット投入`,
          detail: `ペアリング開始から${days}日経過`,
          overdue: days >= 14,
        });
      }
    }
    // セット投入から1ヶ月経過 → 割り出しの目安
    if ((line.status === "laying" || line.status === "waiting_split") && line.setDate) {
      const days = daysBetween(line.setDate);
      if (days >= 30) {
        tasks.push({
          id: `split-${line.id}`,
          kind: "split",
          title: `${line.name} 割り出し`,
          detail: `セット投入から${days}日経過`,
          overdue: days >= 60,
        });
      }
    }
  }

  // 最終ビン交換から一定日数経過した幼虫 → ビン交換の目安
  for (const larva of larvae) {
    if (!larva.isAlive) continue;
    if (larva.stage === "pupa" || larva.stage === "adult" || larva.stage === "egg") continue;
    const days = daysSinceLastChange(larva);
    if (days != null && days >= BOTTLE_CHANGE_INTERVAL_DAYS - 10) {
      tasks.push({
        id: `bottle-${larva.id}`,
        kind: "bottle",
        title: `${larva.code} ビン交換`,
        detail: `前回交換から${days}日経過`,
        overdue: days >= BOTTLE_CHANGE_INTERVAL_DAYS,
      });
    }
  }

  return tasks.sort((a, b) => Number(b.overdue) - Number(a.overdue));
}
