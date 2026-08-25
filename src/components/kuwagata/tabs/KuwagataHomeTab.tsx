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
  speciesGradient,
} from "@/lib/kuwagataUtils";
import { formatDateShort } from "@/lib/utils";
import { LineStatus } from "@/types/kuwagata";

interface KuwagataHomeTabProps {
  onNavigate: (tab: KuwagataTabId) => void;
}

/* 自然色パレットに合わせたステータス色 */
const STATUS_WARM: Record<LineStatus, { bg: string; fg: string }> = {
  pairing:       { bg: "#eccfc2", fg: "#94472a" },
  laying:        { bg: "var(--kuwa-amber-soft)", fg: "var(--kuwa-amber)" },
  waiting_split: { bg: "#eec98f", fg: "#8a5410" },
  split_done:    { bg: "var(--kuwa-moss-bg)", fg: "var(--kuwa-moss)" },
  finished:      { bg: "#ded5c6", fg: "#7a7062" },
};

/* セクション見出し */
function SectionTitle({
  icon: Icon,
  color,
  children,
}: {
  icon: typeof Bug;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color, color: "#fffdf6" }}
      >
        <Icon className="w-[15px] h-[15px]" strokeWidth={2.4} />
      </span>
      <h2 className="font-maru text-[15px] font-bold" style={{ color: "var(--kuwa-ink)" }}>
        {children}
      </h2>
    </div>
  );
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

  const dateLabel = new Date().toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  const stats = [
    { label: "成虫", value: aliveBeetles.length, unit: "頭", icon: Bug, tab: "adults" as const },
    { label: "幼虫", value: aliveLarvae.length, unit: "頭", icon: Worm, tab: "larvae" as const },
    { label: "ライン", value: activeLines.length, unit: "本", icon: GitBranch, tab: "breeding" as const },
  ];

  const cardStyle = {
    background: "var(--kuwa-card)",
    border: "1px solid var(--kuwa-line)",
  };

  return (
    <div className="space-y-7">
      {/* ヒーロー: 黒土と樹液 */}
      <div
        className="relative overflow-hidden rounded-[20px] p-6 text-white kuwa-shadow-lg"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 0%, #5c4022 0%, #3a2917 45%, var(--kuwa-soil) 100%)",
        }}
      >
        <div className="absolute -right-7 -bottom-9 opacity-[0.17] rotate-12 pointer-events-none">
          <KuwagataSVG size={178} color="var(--kuwa-gold)" />
        </div>
        <div className="relative">
          <p
            className="font-maru text-[11px] font-bold tracking-wider"
            style={{ color: "var(--kuwa-gold)" }}
          >
            {dateLabel}
          </p>
          <h2 className="font-maru text-[22px] font-bold mt-1.5 leading-snug">
            今日も<span style={{ color: "var(--kuwa-gold)" }}>ブリード日和</span>
          </h2>
          <p
            className="text-xs mt-2"
            style={{ color: "rgba(247,232,203,0.72)", textWrap: "pretty" }}
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
                className="flex-1 rounded-2xl px-3 py-3 text-left active:scale-[0.96] transition-all"
                style={{
                  background: "rgba(224, 166, 63, 0.14)",
                  border: "1px solid rgba(224, 166, 63, 0.28)",
                }}
              >
                <div className="flex items-center gap-1" style={{ color: "var(--kuwa-gold)" }}>
                  <s.icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.4} />
                  <span className="font-maru text-[10px] font-bold whitespace-nowrap">
                    {s.label}
                  </span>
                </div>
                <p
                  className="text-[24px] font-bold mt-1 leading-none"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {s.value}
                  <span
                    className="text-[10px] font-semibold ml-0.5"
                    style={{ color: "rgba(247,232,203,0.6)" }}
                  >
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
        <div className="mb-3 px-0.5">
          <SectionTitle icon={CalendarClock} color="var(--kuwa-amber)">
            やることリスト
          </SectionTitle>
        </div>
        {tasks.length === 0 ? (
          <div className="rounded-2xl p-6 text-center kuwa-shadow" style={cardStyle}>
            <p className="text-sm" style={{ color: "var(--kuwa-ink-soft)" }}>
              今日はおやすみ。次の作業時期が来たらここでお知らせします
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 kuwa-shadow relative overflow-hidden"
                style={{
                  background: "var(--kuwa-card)",
                  border: t.overdue
                    ? "1px solid rgba(163,80,47,0.35)"
                    : "1px solid var(--kuwa-line)",
                }}
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-[5px]"
                  style={{
                    background: t.overdue ? "var(--kuwa-clay)" : "var(--kuwa-amber)",
                  }}
                />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-1"
                  style={
                    t.overdue
                      ? { background: "var(--kuwa-clay-bg)", color: "var(--kuwa-clay)" }
                      : { background: "var(--kuwa-amber-soft)", color: "var(--kuwa-amber)" }
                  }
                >
                  <CalendarClock className="w-[18px] h-[18px]" strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--kuwa-ink)" }}>
                    {t.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
                    {t.detail}
                  </p>
                </div>
                {t.overdue && (
                  <span
                    className="font-maru text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: "var(--kuwa-clay)", color: "#fff6ef" }}
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
          className="w-full flex items-center justify-between mb-3 px-0.5"
        >
          <SectionTitle icon={GitBranch} color="var(--kuwa-bark)">
            進行中のブリードライン
          </SectionTitle>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--kuwa-bark)", opacity: 0.55 }} />
        </button>
        {activeLines.length === 0 ? (
          <div className="rounded-2xl p-6 text-center kuwa-shadow" style={cardStyle}>
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
                  className="rounded-2xl pl-6 pr-5 py-4 flex items-center justify-between gap-3 kuwa-shadow relative overflow-hidden"
                  style={cardStyle}
                >
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b ${speciesGradient(line.species)}`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--kuwa-ink)" }}>
                      {line.name}
                      <span
                        className="text-xs font-medium ml-2"
                        style={{ color: "var(--kuwa-ink-soft)" }}
                      >
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
            className="w-full flex items-center justify-between mb-3 px-0.5"
          >
            <SectionTitle icon={Worm} color="var(--kuwa-moss)">
              大型候補たち
            </SectionTitle>
            <ChevronRight className="w-4 h-4" style={{ color: "var(--kuwa-moss)", opacity: 0.55 }} />
          </button>
          <div className="space-y-3">
            {topLarvae.map((l, i) => (
              <div
                key={l.id}
                className="rounded-2xl px-5 py-4 flex items-center gap-4 kuwa-shadow"
                style={cardStyle}
              >
                <span
                  className="font-maru w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0"
                  style={
                    i === 0
                      ? { background: "linear-gradient(140deg, #e0a63f, #a3660f)", color: "#fffdf6" }
                      : { background: "var(--kuwa-moss)", color: "#fffdf6", opacity: 0.55 }
                  }
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--kuwa-ink)" }}>
                    {l.code}
                  </p>
                  <p className="text-xs truncate mt-0.5" style={{ color: "var(--kuwa-ink-soft)" }}>
                    {l.species}
                  </p>
                </div>
                <p
                  className="text-xl font-bold flex-shrink-0"
                  style={{ color: "var(--kuwa-moss)", fontVariantNumeric: "tabular-nums" }}
                >
                  {latestWeight(l)}
                  <span className="text-xs font-semibold ml-0.5" style={{ opacity: 0.6 }}>
                    g
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 収支: 画面下部の色の重心 */}
      <section className="pb-1">
        <button
          onClick={() => onNavigate("cost")}
          className="w-full rounded-[20px] px-5 py-5 text-left active:scale-[0.98] transition-all kuwa-shadow relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7a4f26 0%, var(--kuwa-bark) 100%)" }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(224,166,63,0.22)", color: "var(--kuwa-gold)" }}
            >
              <JapaneseYen className="w-5 h-5" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-maru text-[15px] font-bold" style={{ color: "#fdf6e7" }}>
                収支をみる
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(247,232,203,0.7)" }}>
                つかったお金 {formatYen(summary.totalSpent)}
              </p>
            </div>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "var(--kuwa-gold)", opacity: 0.7 }}
            />
          </div>
          <div
            className="mt-4 pt-4 flex items-baseline gap-2"
            style={{ borderTop: "1px solid rgba(224,166,63,0.2)" }}
          >
            <span className="text-[11px] font-semibold" style={{ color: "rgba(247,232,203,0.6)" }}>
              販売による売上
            </span>
            <span
              className="text-lg font-bold"
              style={{ color: "var(--kuwa-gold)", fontVariantNumeric: "tabular-nums" }}
            >
              {formatYen(summary.salesTotal)}
            </span>
          </div>
        </button>
      </section>
    </div>
  );
}
