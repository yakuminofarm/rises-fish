"use client";

import { useEffect, useRef, useState } from "react";
import { Medaka } from "@/types/medaka";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { ChevronRight, Dna, Trash2 } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { useToast } from "@/components/ui/Toast";

// カード幅の約1/3 = 削除ボタンが中央寄りに見える
const ACTION_WIDTH    = 96;
const SNAP_THRESHOLD  = ACTION_WIDTH * 0.55; // この距離超えたらスナップ
const RESISTANCE      = 0.65;                 // 指の動きに対する追従率（小さいほど重い）

interface MedakaCardProps {
  medaka: Medaka;
  onClick?: () => void;
  isSwipeOpen?: boolean;
  onSwipeOpen?: () => void;
  onSwipeClose?: () => void;
}

export function MedakaCard({
  medaka,
  onClick,
  isSwipeOpen = false,
  onSwipeOpen,
  onSwipeClose,
}: MedakaCardProps) {
  const { deleteMedaka } = useMedakaStore();
  const { showToast } = useToast();

  const color      = getVarietyColor(medaka.variety);
  const emoji      = getVarietyEmoji(medaka.variety);
  const hasPhoto   = medaka.photos.length > 0;
  const hasLineage = medaka.parentIds?.father || medaka.parentIds?.mother;

  const [offsetX, setOffsetX]   = useState(0);
  const startX    = useRef(0);
  const startY    = useRef(0);
  const axis      = useRef<"h" | "v" | null>(null);
  const active    = useRef(false);
  const offsetRef = useRef(0);
  const cardRef   = useRef<HTMLDivElement>(null);

  // offsetX を ref でも追跡（native handler 内で最新値を読むため）
  const setOffset = (v: number) => {
    offsetRef.current = v;
    setOffsetX(v);
  };

  // 外部から閉じる（別行がスワイプされたとき）
  useEffect(() => {
    if (!isSwipeOpen) setOffset(0);
  }, [isSwipeOpen]);

  // passive:false の native touchmove listener（iOS scroll 抑制）
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if (axis.current === "h") e.preventDefault();
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, []);

  // ── タッチ開始 ──────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    axis.current   = null;
    active.current = true;
  };

  // ── タッチ移動 ──────────────────────────────
  const onTouchMove = (e: React.TouchEvent) => {
    if (!active.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!axis.current) {
      if (Math.abs(dy) > Math.abs(dx) + 3) { axis.current = "v"; return; }
      if (Math.abs(dx) > 6) axis.current = "h";
      else return;
    }
    if (axis.current === "v") return;

    const raw  = Math.min(0, dx);
    const base = isSwipeOpen ? -ACTION_WIDTH : 0;
    const next = Math.max(-ACTION_WIDTH, Math.min(0, base + raw * RESISTANCE));
    setOffset(next);

    if (next < -4 && !isSwipeOpen) onSwipeOpen?.();
  };

  // ── タッチ終了 ──────────────────────────────
  const onTouchEnd = () => {
    active.current = false;
    if (axis.current !== "h") return;

    if (offsetRef.current < -SNAP_THRESHOLD) {
      setOffset(-ACTION_WIDTH);
      onSwipeOpen?.();
    } else {
      setOffset(0);
      onSwipeClose?.();
    }
  };

  // ── 削除 ────────────────────────────────────
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${medaka.name} を削除しますか？`)) {
      deleteMedaka(medaka.id);
      showToast(`${medaka.name} を削除しました`, "error");
    } else {
      setOffsetX(0);
      onSwipeClose?.();
    }
  };

  // ── カードタップ ─────────────────────────────
  const handleCardClick = () => {
    if (isSwipeOpen || Math.abs(offsetX) > 4) {
      setOffsetX(0);
      onSwipeClose?.();
      return;
    }
    onClick?.();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* 削除ボタン（左スワイプで出現）*/}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center justify-center"
        style={{ width: ACTION_WIDTH }}
      >
        <button
          onClick={handleDelete}
          className="w-16 h-16 rounded-2xl bg-red-500 active:bg-red-600 flex flex-col items-center justify-center gap-0.5 shadow-lg"
        >
          <Trash2 className="w-5 h-5 text-white" />
          <span className="text-[10px] text-white font-bold">削除</span>
        </button>
      </div>

      {/* メインカード */}
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="bg-white cursor-pointer relative z-10"
        style={{
          border: `1px solid ${color}33`,
          boxShadow: `0 2px 12px ${color}18`,
          borderRadius: "1.5rem",
          transform: `translateX(${offsetX}px)`,
          transition: active.current
            ? "none"
            : "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          willChange: "transform",
          opacity: medaka.isAlive ? 1 : 0.55,
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

          {/* テキスト */}
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
