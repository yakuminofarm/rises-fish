"use client";

import { useRef, useState } from "react";
import { Medaka } from "@/types/medaka";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { ChevronRight, Dna, Trash2, Lock, Unlock } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { useToast } from "@/components/ui/Toast";

const SWIPE_THRESHOLD = 60;   // スワイプ判定距離(px)
const ACTION_WIDTH    = 72;    // アクションボタン幅(px)

interface MedakaCardProps {
  medaka: Medaka;
  onClick?: () => void;
}

export function MedakaCard({ medaka, onClick }: MedakaCardProps) {
  const { deleteMedaka, updateMedaka } = useMedakaStore();
  const { showToast } = useToast();
  const hasPhoto   = medaka.photos.length > 0;
  const color      = getVarietyColor(medaka.variety);
  const emoji      = getVarietyEmoji(medaka.variety);
  const hasLineage = medaka.parentIds?.father || medaka.parentIds?.mother;

  // スワイプ状態
  const [offsetX, setOffsetX] = useState(0);
  const startX  = useRef(0);
  const startY  = useRef(0);
  const dragging = useRef(false);
  const direction = useRef<"left" | "right" | null>(null);

  // ── タッチハンドラ ──────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    dragging.current = true;
    direction.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // 縦スクロール優先
    if (!direction.current) {
      if (Math.abs(dy) > Math.abs(dx)) { dragging.current = false; return; }
      direction.current = dx < 0 ? "left" : "right";
    }

    e.preventDefault(); // 横スワイプ中はページスクロール抑制
    const clamped = direction.current === "left"
      ? Math.max(-ACTION_WIDTH, Math.min(0, dx))
      : Math.min(ACTION_WIDTH, Math.max(0, dx));
    setOffsetX(clamped);
  };

  const onTouchEnd = () => {
    dragging.current = false;
    const abs = Math.abs(offsetX);
    if (abs >= SWIPE_THRESHOLD) {
      // スワイプ量が閾値超えたらアクションボタンを表示したまま保持
      setOffsetX(offsetX < 0 ? -ACTION_WIDTH : ACTION_WIDTH);
    } else {
      setOffsetX(0);
    }
  };

  const resetSwipe = () => setOffsetX(0);

  // ── アクション ──────────────────────────────
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${medaka.name} を削除しますか？`)) {
      deleteMedaka(medaka.id);
      showToast(`${medaka.name} を削除しました`, "error");
    }
    resetSwipe();
  };

  const handleToggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !medaka.isAlive;
    updateMedaka(medaka.id, { isAlive: next });
    showToast(next ? `${medaka.name} を生存中に変更` : `${medaka.name} を永眠に記録`, "info");
    resetSwipe();
  };

  // カードをタップ（スワイプ中でなければ）
  const handleCardClick = () => {
    if (Math.abs(offsetX) > 4) { resetSwipe(); return; }
    onClick?.();
  };

  const showLeft  = offsetX < -4;   // 削除ボタン
  const showRight = offsetX > 4;    // ロックボタン

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* ── 左アクション（削除）──────────────── */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
        style={{ width: ACTION_WIDTH, opacity: showLeft ? 1 : 0, transition: "opacity 0.15s" }}
      >
        <button
          onClick={handleDelete}
          className="w-14 h-14 rounded-2xl bg-red-500 flex flex-col items-center justify-center gap-0.5 shadow-lg"
        >
          <Trash2 className="w-5 h-5 text-white" />
          <span className="text-[9px] text-white font-bold">削除</span>
        </button>
      </div>

      {/* ── 右アクション（生存/永眠）──────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
        style={{ width: ACTION_WIDTH, opacity: showRight ? 1 : 0, transition: "opacity 0.15s" }}
      >
        <button
          onClick={handleToggleLock}
          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg ${
            medaka.isAlive ? "bg-amber-400" : "bg-emerald-500"
          }`}
        >
          {medaka.isAlive
            ? <Lock   className="w-5 h-5 text-white" />
            : <Unlock className="w-5 h-5 text-white" />}
          <span className="text-[9px] text-white font-bold">
            {medaka.isAlive ? "永眠" : "生存"}
          </span>
        </button>
      </div>

      {/* ── メインカード ─────────────────────── */}
      <div
        onClick={handleCardClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="bg-white cursor-pointer active:brightness-95 relative z-10"
        style={{
          border: `1px solid ${color}33`,
          boxShadow: `0 2px 12px ${color}18`,
          borderRadius: "1.5rem",
          transform: `translateX(${offsetX}px)`,
          transition: dragging.current ? "none" : "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)",
          willChange: "transform",
          opacity: medaka.isAlive ? 1 : 0.6,
        }}
      >
        <div className="flex items-stretch">
          {/* 左カラーバー */}
          <div
            className="w-1.5 flex-shrink-0 rounded-l-3xl"
            style={{ background: `linear-gradient(to bottom, ${color}, ${color}66)` }}
          />

          {/* 写真 or SVG */}
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
    </div>
  );
}
