"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Search } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Larva, LarvaStage } from "@/types/kuwagata";
import {
  BOTTLE_CHANGE_INTERVAL_DAYS,
  STAGE_COLORS,
  STAGE_LABELS,
  STAGE_ORDER,
  daysSinceLastChange,
  latestBottleChange,
  latestWeight,
} from "@/lib/kuwagataUtils";
import { getGenderColor, getGenderLabel } from "@/lib/utils";
import { AddLarvaModal } from "@/components/kuwagata/AddLarvaModal";
import { LarvaDetailModal } from "@/components/kuwagata/LarvaDetailModal";

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
      className={`w-full text-left bg-white rounded-2xl p-4 border shadow-sm transition-all active:scale-[0.98] ${
        !larva.isAlive
          ? "border-gray-100 opacity-60"
          : needsChange
          ? "border-red-200"
          : "border-amber-100/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{larva.code}</p>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STAGE_COLORS[larva.stage]}`}
          >
            {STAGE_LABELS[larva.stage]}
          </span>
          {!larva.isAlive && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
              ★
            </span>
          )}
        </div>
        {weight != null && larva.stage !== "adult" && (
          <p className="text-base font-bold text-emerald-600 flex-shrink-0">
            {weight}
            <span className="text-xs text-gray-400 font-semibold">g</span>
          </p>
        )}
        {larva.stage === "adult" && larva.emergedSizeMm != null && (
          <p className="text-base font-bold text-violet-600 flex-shrink-0">
            {larva.emergedSizeMm}
            <span className="text-xs text-gray-400 font-semibold">mm</span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap text-xs text-gray-400">
        <span className="truncate">{larva.species}</span>
        {line && <span className="text-amber-600 font-semibold">{line.name}</span>}
        {larva.gender !== "unknown" && (
          <span className={`font-bold ${getGenderColor(larva.gender)}`}>
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
        <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          前回交換から{days}日経過 — ビン交換の時期です
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
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="管理番号・種類で検索..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-gray-300"
          style={{ boxShadow: "0 2px 8px rgba(16,185,129,0.08)", border: "1px solid rgba(209,250,229,0.8)" }}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {(["all", ...STAGE_ORDER] as StageFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStageFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              stageFilter === s
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                : "bg-white text-gray-500 border-gray-100"
            }`}
          >
            {s === "all" ? "すべて" : STAGE_LABELS[s]}
          </button>
        ))}
      </div>

      {larvae.length > 0 && (
        <p className="text-xs text-gray-400 px-0.5">{sorted.length} 頭表示中</p>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🐛</p>
          <p className="text-gray-400 text-sm font-medium">
            {search || stageFilter !== "all"
              ? "条件に合う幼虫がいません"
              : "まだ幼虫が登録されていません"}
          </p>
          {!search && stageFilter === "all" && (
            <p className="text-gray-300 text-xs mt-1">
              割り出し記録から自動作成するか、＋ボタンから追加できます
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((l, i) => (
            <div key={l.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <LarvaCard larva={l} onClick={() => setSelectedId(l.id)} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-5 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center transition-all active:scale-90 z-40"
        style={{
          bottom: "calc(max(8px, env(safe-area-inset-bottom)) + 72px)",
          boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
        }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && <AddLarvaModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <LarvaDetailModal larva={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
