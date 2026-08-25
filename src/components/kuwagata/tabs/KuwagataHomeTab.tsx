"use client";

import {
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
  LINE_STATUS_LABELS,
  calcCostSummary,
  deriveUpcomingTasks,
  formatYen,
  latestWeight,
} from "@/lib/kuwagataUtils";
import { formatDateShort } from "@/lib/utils";
import { LineStatus } from "@/types/kuwagata";

interface KuwagataHomeTabProps {
  onNavigate: (tab: KuwagataTabId) => void;
}

/* 自然色パレットに合わせたステータス色 (ホーム画面用) */
const STATUS_WARM: Record<LineStatus, { bg: string; fg: string }> = {
  pairing:       { bg: "#f3e0da", fg: "#a05c48" },
  laying:        { bg: "var(--kuwa-amber-soft)", fg: "var(--kuwa-amber)" },
  waiting_split: { bg: "#f2e3c8", fg: "#a3701f" },
  split_done:    { bg: "var(--kuwa-moss-bg)", fg: "var(--kuwa-moss)" },
  finished:      { bg: "#eceae5", fg: "#9b948a" },
};

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
    <div className="space-y-7">
      {/* ヒーロー: 黒土と樹液の色 */}
      <div
        className="relative overflow-hidden rounded-[20px] p-6 text-white kuwa-shadow-lg"
        style={{
          background: "linear-gradient(135deg, #4a3823 0%, var(--kuwa-soil) 55%, #201810 100%)",
        }}
      >
        <div className="absolute -right-7 -bottom-9 opacity-[0.13] rotate-12 pointer-events-none">
          <KuwagataSVG size={175} color="#e8b45f" />
        </div>
        <div className="relative">
          <p className="text-[11px] font-bold tracking-wider" style={{ color: "rgba(232,180,95,0.75)" }}>
            {dateLabel}
          </p>
          <h2 className="font-maru text-xl font-bold mt-1.5 leading-snug">
            今日も<span style={{ color: "#e8b45f" }}>ブリード日和</span>
          </h2>
          <p
            className="text-xs mt-1.5"
            style={{ color: "rgba(244,227,194,0.65)", textWrap: "pretty" }}
          >
            {tasks.length > 0
              ? `やることが ${tasks.length}件。忘れないうちにチェックを`
              : "作業予定はありません。ゆっくり観察を楽しみましょう"}
          </p>

          <div className="flex gap-3 mt-5">
            {stats.map((s) => (
              <button
                key={s.label}
                onClick={() => onNavigate(s.tab)}
                className="flex-1 rounded-2xl px-3.5 py-3 text-left active:scale-[0.96] transition-all"
                style={{
                  background: "rgba(255, 245, 225, 0.09)",
                  border: "1px solid rgba(232, 180, 95, 0.16)",
                }}
              >
                <div className="flex items-center gap-1.5" style={{ color: "rgba(232,180,95,0.85)" }}>
                  <s.icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                  <span className="font-maru text-[10px] font-bold">{s.label}</span>
                </div>
                <p
                  className="text-[22px] font-bold mt-1"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {s.value}
                  <span className="text-[10px] font-semibold ml-0.5" style={{ color: "rgba(244,227,194,0.55)" }}>
                    {s.unit}
                  </span>
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* やること */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <CalendarClock className="w-4 h-4" style={{ color: "var(--kuwa-amber)" }} />
          <h2 className="font-maru text-[15px] font-bold" style={{ color: "var(--kuwa-ink)" }}>
            やることリスト
          </h2>
        </div>
        {tasks.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center kuwa-shadow"
            style={{ background: "var(--kuwa-card)", border: "1px solid var(--kuwa-line)" }}
          >
            <p className="text-sm" style={{ color: "var(--kuwa-ink-soft)" }}>
              今日はおやすみ。次の作業時期が来たらここでお知らせします
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 kuwa-shadow"
                style={{
                  background: "var(--kuwa-card)",
                  border: t.overdue ? "1px solid #dcb4a4" : "1px solid var(--kuwa-line)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={
                    t.overdue
                      ? { background: "#f4e0d7", color: "#b0614a" }
                      : { background: "var(--kuwa-amber-soft)", color: "var(--kuwa-amber)" }
                  }
                >
                  <CalendarClock className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--kuwa-ink)" }}>
                    {t.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
                    {t.detail}
                  </p>
                </div>
                {t.overdue && (
                  <span
                    className="font-maru text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: "#f4e0d7", color: "#b0614a" }}
                  >
                    そろそろ！
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
          className="w-full flex items-center justify-between mb-3 px-1"
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" style={{ color: "var(--kuwa-bark)" }} />
            <h2 className="font-maru text-[15px] font-bold" style={{ color: "var(--kuwa-ink)" }}>
              進行中のブリードライン
            </h2>
          </div>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--kuwa-ink-soft)", opacity: 0.5 }} />
        </button>
        {activeLines.length === 0 ? (
          <div
            className="rounded-2xl p-6 text-center kuwa-shadow"
            style={{ background: "var(--kuwa-card)", border: "1px solid var(--kuwa-line)" }}
          >
            <p className="text-sm" style={{ color: "var(--kuwa-ink-soft)" }}>
              まだラインがありません。ペアを組んで最初のラインを作ってみましょう
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeLines.map((line) => {
              const c = STATUS_WARM[line.status];
              return (
                <div
                  key={line.id}
                  className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3 kuwa-shadow"
                  style={{ background: "var(--kuwa-card)", border: "1px solid var(--kuwa-line)" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--kuwa-ink)" }}>
                      {line.name}
                      <span className="text-xs font-medium ml-2" style={{ color: "var(--kuwa-ink-soft)" }}>
                        {line.species}
                      </span>
                    </p>
                    {line.setDate && (
                      <p className="text-xs mt-1" style={{ color: "var(--kuwa-ink-soft)" }}>
                        セット投入 {formatDateShort(line.setDate)}
                      </p>
                    )}
                  </div>
                  <span
                    className="font-maru text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: c.bg, color: c.fg }}
                  >
                    {LINE_STATUS_LABELS[line.status]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 大型候補 */}
      {topLarvae.length > 0 && (
        <section>
          <button
            onClick={() => onNavigate("larvae")}
            className="w-full flex items-center justify-between mb-3 px-1"
          >
            <div className="flex items-center gap-2">
              <Worm className="w-4 h-4" style={{ color: "var(--kuwa-moss)" }} />
              <h2 className="font-maru text-[15px] font-bold" style={{ color: "var(--kuwa-ink)" }}>
                大型候補たち
              </h2>
            </div>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--kuwa-ink-soft)", opacity: 0.5 }} />
          </button>
          <div className="space-y-3">
            {topLarvae.map((l, i) => (
              <div
                key={l.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 kuwa-shadow"
                style={{ background: "var(--kuwa-card)", border: "1px solid var(--kuwa-line)" }}
              >
                <span
                  className="font-maru w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={
                    i === 0
                      ? { background: "linear-gradient(135deg, #e8b45f, #b97f24)", color: "#fffdf8" }
                      : { background: "var(--kuwa-moss-bg)", color: "var(--kuwa-moss)" }
                  }
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--kuwa-ink)" }}>
                    {l.code}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
                    {l.species}
                  </p>
                </div>
                <p
                  className="text-lg font-bold flex-shrink-0"
                  style={{ color: "var(--kuwa-moss)", fontVariantNumeric: "tabular-nums" }}
                >
                  {latestWeight(l)}
                  <span className="text-xs font-semibold ml-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
                    g
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 収支 */}
      <section className="pb-1">
        <button
          onClick={() => onNavigate("cost")}
          className="w-full rounded-2xl px-5 py-4 flex items-center gap-4 active:scale-[0.98] transition-all kuwa-shadow"
          style={{ background: "var(--kuwa-card)", border: "1px solid var(--kuwa-line)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--kuwa-bark-bg)", color: "var(--kuwa-bark)" }}
          >
            <JapaneseYen className="w-4 h-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="font-maru text-sm font-bold" style={{ color: "var(--kuwa-ink)" }}>
              収支をみる
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
              つかったお金 {formatYen(summary.totalSpent)} / 売上 {formatYen(summary.salesTotal)}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--kuwa-ink-soft)", opacity: 0.5 }} />
        </button>
      </section>
    </div>
  );
}
