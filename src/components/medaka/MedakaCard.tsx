"use client";

import { Medaka } from "@/types/medaka";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { ChevronRight, Dna } from "lucide-react";

interface MedakaCardProps {
  medaka: Medaka;
  onClick?: () => void;
}

export function MedakaCard({ medaka, onClick }: MedakaCardProps) {
  const hasPhoto = medaka.photos.length > 0;
  const color = getVarietyColor(medaka.variety);
  const emoji = getVarietyEmoji(medaka.variety);
  const hasLineage = medaka.parentIds?.father || medaka.parentIds?.mother;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all duration-150"
      style={{
        border: `1px solid ${color}33`,
        boxShadow: `0 2px 12px ${color}18`,
      }}
    >
      <div className="flex items-stretch">
        {/* 左カラーバー */}
        <div
          className="w-1.5 flex-shrink-0 rounded-l-3xl"
          style={{ background: `linear-gradient(to bottom, ${color}, ${color}66)` }}
        />

        {/* 写真 or 品種別SVGイラスト */}
        <div
          className="w-24 flex-shrink-0 relative overflow-hidden flex items-center justify-center"
          style={{ background: `${color}0e`, minHeight: 72 }}
        >
          {hasPhoto ? (
            <img
              src={medaka.photos[medaka.photos.length - 1].url}
              alt={medaka.name}
              className="w-full h-full object-cover absolute inset-0"
            />
          ) : (
            <div className="py-2 animate-float-fish">
              <VarietyMedakaSVG variety={medaka.variety} size={88} />
            </div>
          )}
        </div>

        {/* テキスト情報 */}
        <div className="flex-1 px-3 py-3 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base leading-none">{emoji}</span>
                <h3 className="font-bold text-gray-900 text-sm truncate">{medaka.name}</h3>
              </div>
              <p className="text-xs font-semibold mt-0.5" style={{ color }}>{medaka.variety}</p>
            </div>
            <span className={`text-lg font-black leading-none flex-shrink-0 mt-0.5 ${getGenderColor(medaka.gender)}`}>
              {medaka.gender === "male" ? "♂" : medaka.gender === "female" ? "♀" : "？"}
            </span>
          </div>

          {/* バッジ行 */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {medaka.generation && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${color}20`, color }}
              >
                F{medaka.generation}世代
              </span>
            )}
            {hasLineage && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <Dna className="w-2.5 h-2.5" />
                血統
              </span>
            )}
            {!medaka.isAlive && (
              <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                ★ 永眠
              </span>
            )}
          </div>

          {medaka.notes && (
            <p className="text-[11px] text-gray-400 mt-1.5 truncate leading-relaxed">{medaka.notes}</p>
          )}
        </div>

        <div className="flex items-center pr-3 flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-200" />
        </div>
      </div>
    </div>
  );
}
