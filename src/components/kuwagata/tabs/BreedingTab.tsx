"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { BreedingLine, LineStatus } from "@/types/kuwagata";
import {
  LINE_STATUS_COLORS,
  LINE_STATUS_LABELS,
  LINE_STATUS_ORDER,
  daysBetween,
  speciesGradient,
} from "@/lib/kuwagataUtils";
import { formatDateShort } from "@/lib/utils";
import { AddLineModal } from "@/components/kuwagata/AddLineModal";
import { LineDetailModal } from "@/components/kuwagata/LineDetailModal";

type StatusFilter = "all" | LineStatus;

function LineCard({ line, onClick }: { line: BreedingLine; onClick: () => void }) {
  const { beetles, getLarvaeByLine } = useKuwagataStore();
  const male = line.maleId ? beetles.find((b) => b.id === line.maleId) : undefined;
  const female = line.femaleId ? beetles.find((b) => b.id === line.femaleId) : undefined;
  const larvaeCount = getLarvaeByLine(line.id).filter((l) => l.isAlive).length;

  const elapsed =
    line.status === "laying" && line.setDate
      ? `セットから${daysBetween(line.setDate)}日`
      : line.status === "pairing" && line.pairingDate
      ? `ペアリング${daysBetween(line.pairingDate)}日目`
      : undefined;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-4 border shadow-sm transition-all active:scale-[0.98] relative overflow-hidden ${
        line.status === "finished" ? "border-gray-100 opacity-60" : "border-amber-100/60"
      }`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${speciesGradient(line.species)}`}
      />
      <div className="flex items-center justify-between gap-2 mb-2 pl-1.5">
        <p className="text-sm font-bold text-gray-900">
          {line.name}
          <span className="text-xs font-medium text-gray-400 ml-1.5">{line.species}</span>
        </p>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${LINE_STATUS_COLORS[line.status]}`}
        >
          {LINE_STATUS_LABELS[line.status]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs pl-1.5">
        <span className="text-blue-600 font-semibold truncate">
          ♂ {male ? male.code : "未設定"}
        </span>
        <span className="text-gray-300">×</span>
        <span className="text-pink-600 font-semibold truncate">
          ♀ {female ? female.code : "未設定"}
        </span>
      </div>

      <div className="flex items-center gap-2.5 mt-2 flex-wrap text-xs text-gray-400 pl-1.5">
        {elapsed && <span className="text-amber-600 font-semibold">{elapsed}</span>}
        {line.splitDate && <span>割出 {formatDateShort(line.splitDate)}</span>}
        {line.larvaCount != null && <span>回収 {line.larvaCount}頭</span>}
        {larvaeCount > 0 && (
          <span className="text-emerald-600 font-semibold">飼育中幼虫 {larvaeCount}頭</span>
        )}
      </div>
    </button>
  );
}

export function BreedingTab() {
  const { lines } = useKuwagataStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filtered =
    statusFilter === "all" ? lines : lines.filter((l) => l.status === statusFilter);

  const sorted = [...filtered].sort((a, b) => {
    const activeDiff = Number(a.status === "finished") - Number(b.status === "finished");
    if (activeDiff !== 0) return activeDiff;
    return (b.pairingDate ?? "").localeCompare(a.pairingDate ?? "");
  });

  const selected = lines.find((l) => l.id === selectedId);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        {(["all", ...LINE_STATUS_ORDER] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              statusFilter === s
                ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200"
                : "bg-white text-gray-500 border-gray-100"
            }`}
          >
            {s === "all" ? "すべて" : LINE_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🐣</p>
          <p className="text-gray-400 text-sm font-medium">
            {statusFilter !== "all"
              ? "該当するラインがありません"
              : "まだブリードラインがありません"}
          </p>
          {statusFilter === "all" && (
            <p className="text-gray-300 text-xs mt-1">右下の＋ボタンからペアを組みましょう</p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((l, i) => (
            <div key={l.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <LineCard line={l} onClick={() => setSelectedId(l.id)} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-5 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center transition-all active:scale-90 z-40"
        style={{
          bottom: "calc(max(8px, env(safe-area-inset-bottom)) + 72px)",
          boxShadow: "0 4px 20px rgba(217,119,6,0.4)",
        }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && <AddLineModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <LineDetailModal line={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
