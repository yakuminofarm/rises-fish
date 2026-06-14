"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, Fish } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { MedakaCard } from "@/components/medaka/MedakaCard";
import { AddMedakaModal } from "@/components/medaka/AddMedakaModal";
import { MedakaDetailModal } from "@/components/medaka/MedakaDetailModal";
import { Medaka } from "@/types/medaka";

export function FishTab() {
  const { medakas } = useMedakaStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Medaka | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "male" | "female" | "alive">("all");

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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・品種で検索..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      {/* フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { value: "all", label: "すべて" },
          { value: "alive", label: "生存中" },
          { value: "male", label: "♂ オス" },
          { value: "female", label: "♀ メス" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value as typeof filter)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 個体リスト */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Fish className="w-14 h-14 mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">
            {search || filter !== "all" ? "条件に合う個体がありません" : "まだ個体が登録されていません"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MedakaCard key={m.id} medaka={m} onClick={() => setSelected(m)} />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* モーダル */}
      {showAdd && <AddMedakaModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <MedakaDetailModal
          medaka={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
