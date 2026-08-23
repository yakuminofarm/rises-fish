"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Beetle } from "@/types/kuwagata";
import { BeetleCard } from "@/components/kuwagata/BeetleCard";
import { AddBeetleModal } from "@/components/kuwagata/AddBeetleModal";
import { BeetleDetailModal } from "@/components/kuwagata/BeetleDetailModal";

type FilterKey = "alive" | "male" | "female" | "matured" | "favorite" | "sold";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "alive",    label: "🪲 飼育中" },
  { key: "male",     label: "♂ オス" },
  { key: "female",   label: "♀ メス" },
  { key: "matured",  label: "🍌 後食済み" },
  { key: "favorite", label: "♥ お気に入り" },
  { key: "sold",     label: "💰 販売済み" },
];

type SortKey = "newest" | "oldest" | "size" | "code";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "登録が新しい順" },
  { key: "oldest", label: "登録が古い順" },
  { key: "size",   label: "サイズ順" },
  { key: "code",   label: "管理番号順" },
];

function applyFilter(beetles: Beetle[], active: Set<FilterKey>): Beetle[] {
  if (active.size === 0) return beetles;
  return beetles.filter((b) => {
    if (active.has("alive") && (!b.isAlive || b.soldPriceYen != null)) return false;
    if (active.has("sold") && b.soldPriceYen == null) return false;
    if (active.has("male") && b.gender !== "male") return false;
    if (active.has("female") && b.gender !== "female") return false;
    if (active.has("matured") && !b.matured) return false;
    if (active.has("favorite") && !b.isFavorite) return false;
    return true;
  });
}

function applySort(beetles: Beetle[], key: SortKey): Beetle[] {
  return [...beetles].sort((a, b) => {
    switch (key) {
      case "newest": return b.acquiredDate.localeCompare(a.acquiredDate);
      case "oldest": return a.acquiredDate.localeCompare(b.acquiredDate);
      case "size":   return (b.sizeMm ?? 0) - (a.sizeMm ?? 0);
      case "code":   return a.code.localeCompare(b.code, "ja");
      default:       return 0;
    }
  });
}

export function AdultTab() {
  const { beetles } = useKuwagataStore();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const searched = beetles.filter(
    (b) =>
      !search ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.name ?? "").includes(search) ||
      b.species.includes(search) ||
      (b.locality ?? "").includes(search)
  );
  const sorted = applySort(applyFilter(searched, activeFilters), sortKey);
  const selected = beetles.find((b) => b.id === selectedId);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="管理番号・種類・産地で検索..."
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-300"
          style={{ boxShadow: "0 2px 8px rgba(180,120,30,0.08)", border: "1px solid rgba(253,230,190,0.7)" }}
        />
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">絞り込み</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {FILTER_OPTIONS.map((f) => {
            const on = activeFilters.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleFilter(f.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  on
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200"
                    : "bg-white text-gray-500 border-gray-100"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">並び順</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                sortKey === s.key
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                  : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {beetles.length > 0 && (
        <p className="text-xs text-gray-400 px-0.5">
          {sorted.length} 頭表示中
          {activeFilters.size > 0 && <span className="text-amber-600 font-semibold"> （絞り込み中）</span>}
        </p>
      )}

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🪲</p>
          <p className="text-gray-400 text-sm font-medium">
            {search || activeFilters.size > 0
              ? "条件に合う個体がありません"
              : "まだ個体が登録されていません"}
          </p>
          {!search && activeFilters.size === 0 && (
            <p className="text-gray-300 text-xs mt-1">右下の＋ボタンから追加しましょう</p>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {sorted.map((b, i) => (
            <div key={b.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
              <BeetleCard beetle={b} onClick={() => setSelectedId(b.id)} />
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

      {showAdd && <AddBeetleModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <BeetleDetailModal beetle={selected} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
