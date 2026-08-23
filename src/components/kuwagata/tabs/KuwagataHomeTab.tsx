"use client";

import {
  AlertTriangle,
  Bug,
  CalendarClock,
  ChevronRight,
  GitBranch,
  JapaneseYen,
  Worm,
} from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { KuwagataTabId } from "@/components/kuwagata/KuwagataBottomNav";
import { KuwagataSVG } from "@/components/kuwagata/KuwagataSVG";
import {
  LINE_STATUS_COLORS,
  LINE_STATUS_LABELS,
  calcCostSummary,
  deriveUpcomingTasks,
  formatYen,
  latestWeight,
  speciesGradient,
} from "@/lib/kuwagataUtils";
import { formatDateShort } from "@/lib/utils";

interface KuwagataHomeTabProps {
  onNavigate: (tab: KuwagataTabId) => void;
}

export function KuwagataHomeTab({ onNavigate }: KuwagataHomeTabProps) {
  const { beetles, lines, larvae, expenses } = useKuwagataStore();

  const aliveBeetles = beetles.filter((b) => b.isAlive && !b.soldDate);
  const aliveLarvae = larvae.filter((l) => l.isAlive && l.stage !== "adult");
  const activeLines = lines.filter((l) => l.status !== "finished");
  const tasks = deriveUpcomingTasks(lines, larvae);
  const summary = calcCostSummary(beetles, larvae, expenses);

  const topLarvae = [...larvae]
    .filter((l) => l.isAlive && latestWeight(l) != null)
    .sort((a, b) => (latestWeight(b) ?? 0) - (latestWeight(a) ?? 0))
    .slice(0, 3);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const stats = [
    { label: "成虫", value: aliveBeetles.length, unit: "頭", icon: Bug, tab: "adults" as const },
    { label: "幼虫", value: aliveLarvae.length, unit: "頭", icon: Worm, tab: "larvae" as const },
    { label: "ライン", value: activeLines.length, unit: "本", icon: GitBranch, tab: "breeding" as const },
  ];

  return (
    <div className="space-y-5">
      {/* ヒーロー: 夜の雑木林 */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 p-5 text-white shadow-lg">
        {/* 背景のシルエット */}
        <div className="absolute -right-6 -bottom-8 opacity-[0.14] rotate-12 pointer-events-none">
          <KuwagataSVG size={170} color="#fcd34d" />
        </div>
        <div className="relative">
          <p className="text-[11px] font-bold tracking-wider text-amber-200/70">{dateLabel}</p>
          <h2 className="text-xl font-bold mt-0.5">
            今日も<span className="text-amber-300">ブリード日和</span>
          </h2>
          <p className="text-xs text-amber-100/60 mt-1">
            {tasks.length > 0
              ? `やること ${tasks.length}件 — 忘れずにチェック`
              : "予定の作業はありません。個体をゆっくり観察しましょう"}
          </p>

          <div className="flex gap-2.5 mt-4">
            {stats.map((s) => (
              <button
                key={s.label}
                onClick={() => onNavigate(s.tab)}
                className="flex-1 bg-white/10 backdrop-blur rounded-2xl px-3 py-2.5 text-left active:scale-[0.96] transition-all border border-white/10"
              >
                <div className="flex items-center gap-1.5 text-amber-200/80">
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">{s.label}</span>
                </div>
                <p
                  className="text-xl font-bold mt-0.5"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {s.value}
                  <span className="text-[10px] font-semibold text-amber-100/50 ml-0.5">{s.unit}</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* やること */}
      <section>
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <CalendarClock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-gray-800">やることリスト</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-amber-100/60">
            <p className="text-sm text-gray-400">直近の作業予定はありません 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border ${
                  t.overdue ? "border-red-200" : "border-amber-100/60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    t.overdue ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {t.overdue ? <AlertTriangle className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.detail}</p>
                </div>
                {t.overdue && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
                    要対応
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 進行中ライン */}
      <section>
        <button
          onClick={() => onNavigate("breeding")}
          className="w-full flex items-center justify-between mb-2 px-0.5"
        >
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-bold text-gray-800">進行中のブリードライン</h2>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
        {activeLines.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-amber-100/60">
            <p className="text-sm text-gray-400">進行中のラインはありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeLines.map((line) => (
              <div
                key={line.id}
                className="bg-white rounded-2xl pl-1.5 pr-4 py-1.5 border border-amber-100/60 flex items-center gap-3"
              >
                <div
                  className={`self-stretch w-1.5 rounded-full bg-gradient-to-b ${speciesGradient(line.species)}`}
                />
                <div className="min-w-0 flex-1 py-1.5">
                  <p className="text-sm font-bold text-gray-800">
                    {line.name}
                    <span className="text-xs font-medium text-gray-400 ml-1.5">{line.species}</span>
                  </p>
                  {line.setDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      セット投入 {formatDateShort(line.setDate)}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${LINE_STATUS_COLORS[line.status]}`}
                >
                  {LINE_STATUS_LABELS[line.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 大型候補 */}
      {topLarvae.length > 0 && (
        <section>
          <button
            onClick={() => onNavigate("larvae")}
            className="w-full flex items-center justify-between mb-2 px-0.5"
          >
            <div className="flex items-center gap-1.5">
              <Worm className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-800">大型候補 (体重上位)</h2>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
          <div className="space-y-2">
            {topLarvae.map((l, i) => (
              <div
                key={l.id}
                className="bg-white rounded-2xl px-4 py-3 border border-amber-100/60 flex items-center gap-3"
              >
                <span
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    i === 0
                      ? "bg-gradient-to-br from-amber-400 to-yellow-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{l.code}</p>
                  <p className="text-xs text-gray-400 truncate">{l.species}</p>
                </div>
                <p
                  className="text-base font-bold text-emerald-600 flex-shrink-0"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {latestWeight(l)}
                  <span className="text-xs font-semibold text-gray-400 ml-0.5">g</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 収支サマリー */}
      <section className="pb-1">
        <button
          onClick={() => onNavigate("cost")}
          className="w-full bg-white rounded-2xl px-4 py-3.5 border border-amber-100/60 flex items-center gap-3 active:scale-[0.98] transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <JapaneseYen className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-bold text-gray-800">収支管理</p>
            <p className="text-xs text-gray-400">
              総支出 {formatYen(summary.totalSpent)} / 売上 {formatYen(summary.salesTotal)}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
        </button>
      </section>
    </div>
  );
}
