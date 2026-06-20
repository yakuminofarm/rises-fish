"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { MedakaCard } from "@/components/medaka/MedakaCard";
import { AddMedakaModal } from "@/components/medaka/AddMedakaModal";
import { MedakaDetailModal } from "@/components/medaka/MedakaDetailModal";
import { Medaka } from "@/types/medaka";
import { MedakaFishSVG } from "@/components/ui/MedakaIllustration";

// ── フィルター（複数選択可） ──────────────────────────
type FilterKey = "alive" | "male" | "female" | "favorite";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "alive",    label: "🌊 生存中" },
  { key: "male",     label: "♂ オス" },
  { key: "female",   label: "♀ メス" },
  { key: "favorite", label: "♥ お気に入り" },
];

// ── ソート（単一選択） ────────────────────────────────
type SortKey = "newest" | "oldest" | "variety_count" | "generation" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",       label: "登録が新しい順" },
  { key: "oldest",       label: "登録が古い順" },
  { key: "variety_count",label: "品種個体数順" },
  { key: "generation",   label: "世代順" },
  { key: "name",         label: "名前順" },
];

function applyFilter(medakas: Medaka[], active: Set<FilterKey>): Medaka[] {
  if (active.size === 0) return medakas;
  return medakas.filter((m) => {
    if (active.has("alive")    && !m.isAlive)                return false;
    if (active.has("male")     && m.gender !== "male")        return false;
    if (active.has("female")   && m.gender !== "female")      return false;
    if (active.has("favorite") && !m.isFavorite)              return false;
    return true;
  });
}

function applySort(medakas: Medaka[], key: SortKey, varietyCounts: Record<string, number>): Medaka[] {
  return [...medakas].sort((a, b) => {
    switch (key) {
      case "newest":        return b.acquiredDate.localeCompare(a.acquiredDate);
      case "oldest":        return a.acquiredDate.localeCompare(b.acquiredDate);
      case "variety_count": return (varietyCounts[b.variety] ?? 0) - (varietyCounts[a.variety] ?? 0);
      case "generation":    return (a.generation ?? 999) - (b.generation ?? 999);
      case "name":          return a.name.localeCompare(b.name, "ja");
      default:              return 0;
    }
  });
}

export function FishTab() {
  const { medakas } = useMedakaStore();
  const [showAdd,     setShowAdd]     = useState(false);
  const [selected,    setSelected]    = useState<Medaka | null>(null);
  const [search,      setSearch]      = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [sortKey,     setSortKey]     = useState<SortKey>("newest");
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  // 品種別個体数（ソート用）
  const varietyCounts = medakas.reduce<Record<string, number>>((acc, m) => {
    acc[m.variety] = (acc[m.variety] ?? 0) + 1;
    return acc;
  }, {});

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const searched = medakas.filter((m) =>
    !search || m.name.includes(search) || m.variety.includes(search) || m.notes.includes(search)
  );
  const filtered = applyFilter(searched, activeFilters);
  const sorted   = applySort(filtered, sortKey, varietyCounts);

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

      {/* 絞り込み */}
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
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-sm shadow-cyan-200"
                    : "bg-white text-gray-500 border-gray-100"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 並び順 */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-0.5">並び順</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                sortKey === s.key
                  ? "bg-violet-500 text-white border-violet-500 shadow-sm shadow-violet-200"
                  : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ヒット件数 */}
      {medakas.length > 0 && (
        <p className="text-xs text-gray-400 px-0.5">
          {sorted.length} 匹表示中
          {activeFilters.size > 0 && <span className="text-cyan-500 font-semibold"> （絞り込み中）</span>}
        </p>
      )}

      {/* スワイプ開放時オーバーレイ */}
      {openSwipeId && (
        <div className="fixed inset-0 z-0" onClick={() => setOpenSwipeId(null)} />
      )}

      {/* 個体リスト */}
      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <MedakaFishSVG color="#bae6fd" size={72} />
          </div>
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
          {sorted.map((m, i) => (
            <div key={m.id} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
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
        className="fixed right-5 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center transition-all active:scale-90 z-40 animate-pulse-glow"
        style={{
          bottom: "calc(max(8px, env(safe-area-inset-bottom)) + 72px)",
          boxShadow: "0 4px 20px rgba(6,182,212,0.4)",
        }}
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
