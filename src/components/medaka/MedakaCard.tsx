"use client";

import { useEffect, useRef } from "react";
import { Medaka } from "@/types/medaka";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { ChevronRight, Dna, Trash2 } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { useToast } from "@/components/ui/Toast";

// カード幅の約1/3 = 削除ボタンが中央寄りに見える
const ACTION_WIDTH    = 96;
const SNAP_THRESHOLD  = ACTION_WIDTH * 0.5; // この距離超えたらスナップ

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

  const baseOpacity = medaka.isAlive ? 1 : 0.55;

  const startX    = useRef(0);
  const startY    = useRef(0);
  const axis      = useRef<"h" | "v" | null>(null);
  const active    = useRef(false);
  const offsetRef = useRef(0);
  const moved     = useRef(false);
  const cardRef   = useRef<HTMLDivElement>(null);

  // DOM を直接操作（再レンダリングなしで滑らかに）
  const SNAP = "transform 0.28s cubic-bezier(0.22,1,0.36,1)";
  const applyTransform = (x: number, withTransition: boolean) => {
    const el = cardRef.current;
    if (!el) return;
    offsetRef.current = x;
    el.style.transition = withTransition ? SNAP : "none";
    el.style.transform  = `translateX(${x}px)`;
    el.style.opacity    = `${baseOpacity}`;
  };

  // 外部から閉じる（別行がスワイプされたとき）
  useEffect(() => {
    if (!isSwipeOpen && offsetRef.current !== 0) applyTransform(0, true);
  }, [isSwipeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // passive:false の native touchmove listener（iOS scroll 抑制）
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const handler = (e: TouchEvent) => {
      if (!active.current) return;
      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (!axis.current) {
        if (Math.abs(dy) > Math.abs(dx) + 3) { axis.current = "v"; return; }
        if (Math.abs(dx) > 6) axis.current = "h";
        else return;
      }
      if (axis.current === "v") return;

      // 横スワイプ確定 → ページスクロール抑制
      e.preventDefault();
      moved.current = true;

      const base = isSwipeOpen ? -ACTION_WIDTH : 0;
      // ゴム感: 端ではさらに重く
      const next = Math.max(-ACTION_WIDTH, Math.min(0, base + dx));
      applyTransform(next, false);

      if (next < -4 && !isSwipeOpen) onSwipeOpen?.();
    };
    el.addEventListener("touchmove", handler, { passive: false });
    return () => el.removeEventListener("touchmove", handler);
  }, [isSwipeOpen, onSwipeOpen, baseOpacity]);

  // ── タッチ開始 ──────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    axis.current   = null;
    active.current = true;
    moved.current  = false;
  };

  // ── タッチ終了 ──────────────────────────────
  const onTouchEnd = () => {
    active.current = false;
    if (axis.current !== "h") return;

    if (offsetRef.current < -SNAP_THRESHOLD) {
      applyTransform(-ACTION_WIDTH, true);
      onSwipeOpen?.();
    } else {
      applyTransform(0, true);
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
      applyTransform(0, true);
      onSwipeClose?.();
    }
  };

  // ── カードタップ ─────────────────────────────
  const handleCardClick = () => {
    if (isSwipeOpen || moved.current || Math.abs(offsetRef.current) > 4) {
      applyTransform(0, true);
      onSwipeClose?.();
      return;
    }
    onClick?.();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* 削除エリア（左スワイプで出現）*/}
      <button
        onClick={handleDelete}
        className="absolute right-0 top-0 bottom-0 bg-red-500 active:bg-red-600 flex flex-col items-center justify-center gap-1 rounded-r-3xl"
        style={{ width: ACTION_WIDTH }}
      >
        <Trash2 className="w-5 h-5 text-white" />
        <span className="text-[10px] text-white font-bold">削除</span>
      </button>

      {/* メインカード */}
      <div
        ref={cardRef}
        onClick={handleCardClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="bg-white cursor-pointer relative z-10"
        style={{
          border: `1px solid ${color}33`,
          boxShadow: `0 2px 12px ${color}18`,
          borderRadius: "1.5rem",
          transform: "translateX(0px)",
          opacity: baseOpacity,
          willChange: "transform",
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
