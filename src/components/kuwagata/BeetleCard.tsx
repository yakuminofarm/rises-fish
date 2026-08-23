"use client";

import { Heart, Ruler } from "lucide-react";
import { Beetle } from "@/types/kuwagata";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { getGenderColor, getGenderLabel } from "@/lib/utils";

interface BeetleCardProps {
  beetle: Beetle;
  onClick: () => void;
}

export function BeetleCard({ beetle, onClick }: BeetleCardProps) {
  const toggleFavorite = useKuwagataStore((s) => s.toggleFavorite);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl p-4 border shadow-sm transition-all active:scale-[0.98] ${
        beetle.isAlive ? "border-amber-100/60" : "border-gray-100 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">
          🪲
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-gray-900 truncate">{beetle.code}</p>
            {beetle.name && (
              <p className="text-xs text-gray-400 truncate">「{beetle.name}」</p>
            )}
            {!beetle.isAlive && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                ★飼育終了
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {beetle.species}
            {beetle.locality && <span className="text-gray-400"> / {beetle.locality}</span>}
          </p>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <span className={`text-xs font-bold ${getGenderColor(beetle.gender)}`}>
              {getGenderLabel(beetle.gender)}
            </span>
            {beetle.generation && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                {beetle.generation}
              </span>
            )}
            {beetle.sizeMm != null && (
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <Ruler className="w-3 h-3" />
                {beetle.sizeMm}mm
              </span>
            )}
            {beetle.matured && beetle.isAlive && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                後食済み
              </span>
            )}
          </div>
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(beetle.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.stopPropagation();
              toggleFavorite(beetle.id);
            }
          }}
          className="p-1.5 flex-shrink-0"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              beetle.isFavorite ? "text-rose-500 fill-rose-500" : "text-gray-300"
            }`}
          />
        </span>
      </div>
    </button>
  );
}
