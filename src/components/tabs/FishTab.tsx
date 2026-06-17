"use client";

import { useState } from "react";
import { Plus, Search, Fish } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { MedakaCard } from "@/components/medaka/MedakaCard";
import { AddMedakaModal } from "@/components/medaka/AddMedakaModal";
import { MedakaDetailModal } from "@/components/medaka/MedakaDetailModal";
import { Medaka } from "@/types/medaka";
import { MedakaFishSVG } from "@/components/ui/MedakaIllustration";

export function FishTab() {
  const { medakas } = useMedakaStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Medaka | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "male" | "female" | "alive">("all");
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  const filtered = medakas.filter((m) => {
    const matchSearch =
      m.name.includes(search) || m.variety.includes(search) || m.notes.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "male" && m.gender === "male") ||
      (filter === "female" && m.gender === "female") ||
      (filter === "alive" && m.isAlive);
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-3">
      {/* 検索バー */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・品種で検索..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-gray-300"
          style={{ boxShadow: "0 2px 8px rgba(6,182,212,0.08)", border: "1px solid rgba(186,230,253,0.6)" }}
        />
      </div>

      {/* フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "all", label: "すべて" },
          { value: "alive", label: "🌊 生存中" },
          { value: "male", label: "♂ オス" },
          { value: "female", label: "♀ メス" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
              filter === f.value
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-200"
                : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {f.label}
          </button>
        ))}
        {medakas.length > 0 && (
          <span className="flex-shrink-0 px-3 py-1.5 text-xs text-gray-300 self-center">
            {filtered.length}匹
          </span>
        )}
      </div>

      {/* スワイプ開放時の背景タップで閉じるオーバーレイ */}
      {openSwipeId && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setOpenSwipeId(null)}
        />
      )}

      {/* 個体リスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <MedakaFishSVG color="#bae6fd" size={72} />
          </div>
          <p className="text-gray-400 text-sm font-medium">
            {search || filter !== "all"
              ? "条件に合う個体がありません"
              : "まだ個体が登録されていません"}
          </p>
          {!search && filter === "all" && (
            <p className="text-gray-300 text-xs mt-1">右下の＋ボタンから追加しましょう</p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((m, i) => (
            <div
              key={m.id}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <MedakaCard
                medaka={m}
                onClick={() => setSelected(m)}
                isSwipeOpen={openSwipeId === m.id}
                onSwipeOpen={() => setOpenSwipeId(m.id)}
                onSwipeClose={() => setOpenSwipeId(null)}
              />
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center transition-all active:scale-90 z-40 animate-pulse-glow"
        style={{ boxShadow: "0 4px 20px rgba(6,182,212,0.4)" }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showAdd && <AddMedakaModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <MedakaDetailModal medaka={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
