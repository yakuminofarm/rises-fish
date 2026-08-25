"use client";

import { useState } from "react";
import { AlertTriangle, Search, Worm } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Larva, LarvaStage } from "@/types/kuwagata";
import {
  BOTTLE_CHANGE_INTERVAL_DAYS,
  STAGE_COLORS,
  STAGE_LABELS,
  STAGE_ORDER,
  daysSinceLastChange,
  genderColor,
  latestBottleChange,
  latestWeight,
  speciesGradient,
} from "@/lib/kuwagataUtils";
import { getGenderLabel } from "@/lib/utils";
import { AddLarvaModal } from "@/components/kuwagata/AddLarvaModal";
import { LarvaDetailModal } from "@/components/kuwagata/LarvaDetailModal";
import { EmptyState, Fab } from "@/components/kuwagata/KuwaUI";

type StageFilter = "all" | LarvaStage;

function LarvaCard({ larva, onClick }: { larva: Larva; onClick: () => void }) {
  const lines = useKuwagataStore((s) => s.lines);
  const line = larva.lineId ? lines.find((l) => l.id === larva.lineId) : undefined;
  const weight = latestWeight(larva);
  const lastChange = latestBottleChange(larva);
  const days = daysSinceLastChange(larva);
  const needsChange =
    larva.isAlive &&
    (larva.stage === "L1" || larva.stage === "L2" || larva.stage === "L3") &&
    days != null &&
    days >= BOTTLE_CHANGE_INTERVAL_DAYS;

  return (
    <button
      onClick={onClick}
      className="kuwa-card w-full text-left pl-6 pr-4 py-4 transition-all active:scale-[0.98] relative overflow-hidden"
      style={{
        opacity: larva.isAlive ? 1 : 0.62,
        borderColor: needsChange ? "rgba(163,80,47,0.4)" : undefined,
      }}
    >
      <span
        className={`absolute left-0 top-0 bottom-0 w-[5px] bg-gradient-to-b ${speciesGradient(larva.species)}`}
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "var(--kuwa-ink)" }}>
            {larva.code}
          </p>
          <span className={`kuwa-badge font-maru flex-shrink-0 ${STAGE_COLORS[larva.stage]}`}>
            {STAGE_LABELS[larva.stage]}
          </span>
          {!larva.isAlive && (
            <span className="kuwa-badge font-maru bg-[#ded5c6] text-[#7a7062]">飼育終了</span>
          )}
        </div>
        {weight != null && larva.stage !== "adult" && (
          <p
            className="text-lg font-bold flex-shrink-0"
            style={{ color: "var(--kuwa-moss)", fontVariantNumeric: "tabular-nums" }}
          >
            {weight}
            <span className="text-xs font-semibold ml-0.5" style={{ opacity: 0.6 }}>
              g
            </span>
          </p>
        )}
        {larva.stage === "adult" && larva.emergedSizeMm != null && (
          <p
            className="text-lg font-bold flex-shrink-0"
            style={{ color: "var(--kuwa-bark)", fontVariantNumeric: "tabular-nums" }}
          >
            {larva.emergedSizeMm}
            <span className="text-xs font-semibold ml-0.5" style={{ opacity: 0.6 }}>
              mm
            </span>
          </p>
        )}
      </div>

      <div
        className="flex items-center gap-3 mt-2 flex-wrap text-xs"
        style={{ color: "var(--kuwa-ink-soft)" }}
      >
        <span className="truncate">{larva.species}</span>
        {line && (
          <span className="font-bold" style={{ color: "var(--kuwa-amber)" }}>
            {line.name}
          </span>
        )}
        {larva.gender !== "unknown" && (
          <span className={`font-bold ${genderColor(larva.gender)}`}>
            {getGenderLabel(larva.gender)}
          </span>
        )}
        {lastChange && larva.stage !== "adult" && larva.stage !== "pupa" && (
          <span>
            {lastChange.bottleType}
            {lastChange.bottleSize && ` ${lastChange.bottleSize}`}
          </span>
        )}
      </div>

      {needsChange && (
        <p
          className="mt-2.5 text-xs font-bold flex items-center gap-1.5"
          style={{ color: "var(--kuwa-clay)" }}
        >
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.4} />
          前回の交換から{days}日。そろそろ交換してあげましょう
        </p>
      )}
    </button>
  );
}

export function LarvaTab() {
  const { larvae } = useKuwagataStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");

  const searched = larvae.filter(
    (l) =>
      !search ||
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.species.includes(search)
  );
  const filtered =
    stageFilter === "all" ? searched : searched.filter((l) => l.stage === stageFilter);

  const sorted = [...filtered].sort((a, b) => {
    const aliveDiff = Number(b.isAlive) - Number(a.isAlive);
    if (aliveDiff !== 0) return aliveDiff;
    return a.code.localeCompare(b.code, "ja");
  });

  const selected = larvae.find((l) => l.id === selectedId);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
          strokeWidth={2.2}
          style={{ color: "#b3a189" }}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="管理番号・種類でさがす"
          className="kuwa-input kuwa-input-search"
          style={{ fontSize: 14 }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {(["all", ...STAGE_ORDER] as StageFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            data-on={stageFilter === s}
            className="kuwa-chip kuwa-chip-moss font-maru"
          >
            {s === "all" ? "すべて" : STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {larvae.length > 0 && (
        <p className="text-xs px-1" style={{ color: "var(--kuwa-ink-soft)" }}>
          {sorted.length} 頭を表示中
        </p>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon={Worm}
          color="var(--kuwa-moss)"
          title={
            search || stageFilter !== "all"
              ? "この条件に合う幼虫はいませんでした"
              : "まだ幼虫が登録されていません"
          }
          hint={
            search || stageFilter !== "all"
              ? "条件をゆるめてもう一度さがしてみましょう"
              : "ブリードの割り出しを記録すると、ここに自動で並びます"
          }
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((l, i) => (
            <div key={l.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <LarvaCard larva={l} onClick={() => setSelectedId(l.id)} />
            </div>
          ))}
        </div>
      )}

      <Fab onClick={() => setShowAdd(true)} label="幼虫を登録" />

      {showAdd && <AddLarvaModal onClose={() => setShowAdd(false)} />}
      {selected && <LarvaDetailModal larva={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
