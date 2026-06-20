"use client";

import { useEffect, useRef } from "react";
import { Medaka } from "@/types/medaka";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { ChevronRight, Dna, Trash2, Heart } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { useToast } from "@/components/ui/Toast";

// お気に入り + 削除 の2ボタン分
const BTN_WIDTH    = 72;
const ACTION_WIDTH = BTN_WIDTH * 2;
const SNAP_THRESHOLD  = ACTION_WIDTH * 0.35;
const FLICK_VELOCITY  = 0.4;
const CLOSE_VELOCITY  = 0.3;
const SPRING_OPEN  = "transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SPRING_CLOSE = "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)";

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
  const { deleteMedaka, toggleFavorite } = useMedakaStore();
  const { showToast } = useToast();

  const color       = getVarietyColor(medaka.variety);
  const emoji       = getVarietyEmoji(medaka.variety);
  const hasPhoto    = medaka.photos.length > 0;
  const hasLineage  = medaka.parentIds?.father || medaka.parentIds?.mother;
  const baseOpacity = medaka.isAlive ? 1 : 0.55;

  const cardRef     = useRef<HTMLDivElement>(null);
  const startX      = useRef(0);
  const startY      = useRef(0);
  const axis        = useRef<"h" | "v" | null>(null);
  const active      = useRef(false);
  const moved       = useRef(false);
  const offsetRef   = useRef(0);
  const prevX       = useRef(0);
  const prevTime    = useRef(0);
  const velocityRef = useRef(0);

  const applyTransform = (x: number, transition: string | null) => {
    const el = cardRef.current;
    if (!el) return;
    offsetRef.current = x;
    el.style.transition = transition ?? "none";
    el.style.transform  = `translateX(${x}px)`;
  };

  const snapOpen  = () => { applyTransform(-ACTION_WIDTH, SPRING_OPEN);  onSwipeOpen?.();  };
  const snapClose = () => { applyTransform(0,             SPRING_CLOSE); onSwipeClose?.(); };

  useEffect(() => {
    if (!isSwipeOpen && offsetRef.current !== 0) snapClose();
  }, [isSwipeOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onMove = (e: TouchEvent) => {
      if (!active.current) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (!axis.current) {
        if (Math.abs(dy) > Math.abs(dx) + 4) { axis.current = "v"; return; }
        if (Math.abs(dx) > 5) axis.current = "h";
        else return;
      }
      if (axis.current === "v") return;

      e.preventDefault();
      moved.current = true;

      const now = Date.now();
      const dt  = now - prevTime.current;
      if (dt > 0) velocityRef.current = (touch.clientX - prevX.current) / dt;
      prevX.current    = touch.clientX;
      prevTime.current = now;

      const base = isSwipeOpen ? -ACTION_WIDTH : 0;
      let next   = base + dx;
      if (next > 0)             next = next / 3;
      if (next < -ACTION_WIDTH) next = -ACTION_WIDTH + (next + ACTION_WIDTH) / 3;

      applyTransform(next, null);
      if (next < -6 && !isSwipeOpen) onSwipeOpen?.();
    };

    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, [isSwipeOpen, onSwipeOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startX.current      = t.clientX;
    startY.current      = t.clientY;
    prevX.current       = t.clientX;
    prevTime.current    = Date.now();
    velocityRef.current = 0;
    axis.current        = null;
    active.current      = true;
    moved.current       = false;
    if (cardRef.current) cardRef.current.style.transition = "none";
  };

  const onTouchEnd = () => {
    active.current = false;
    if (axis.current !== "h") return;

    const v    = velocityRef.current;
    const dist = offsetRef.current;

    if (v < -FLICK_VELOCITY)        snapOpen();
    else if (v > CLOSE_VELOCITY)    snapClose();
    else if (dist < -SNAP_THRESHOLD) snapOpen();
    else                             snapClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`${medaka.name} を削除しますか？`)) {
      deleteMedaka(medaka.id);
      showToast(`${medaka.name} を削除しました`, "error");
    } else {
      snapClose();
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(medaka.id);
    showToast(
      medaka.isFavorite ? `${medaka.name} をお気に入りから外しました` : `${medaka.name} をお気に入りに追加しました`,
      medaka.isFavorite ? "info" : "success"
    );
    snapClose();
  };

  const handleCardClick = () => {
    if (isSwipeOpen || moved.current || Math.abs(offsetRef.current) > 4) {
      snapClose();
      return;
    }
    onClick?.();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* アクションエリア（お気に入り + 削除）*/}
      <div className="absolute right-0 top-0 bottom-0 flex" style={{ width: ACTION_WIDTH }}>
        {/* お気に入り */}
        <button
          onClick={handleFavorite}
          className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
          style={{
            background: medaka.isFavorite ? "#f43f5e" : "#fb7185",
          }}
        >
          <Heart
            className="w-5 h-5 text-white"
            fill={medaka.isFavorite ? "white" : "none"}
            strokeWidth={2}
          />
          <span className="text-[10px] text-white font-bold">
            {medaka.isFavorite ? "解除" : "お気に入り"}
          </span>
        </button>
        {/* 削除 */}
        <button
          onClick={handleDelete}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-500 active:bg-red-600 rounded-r-3xl"
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
        onTouchEnd={onTouchEnd}
        className="bg-white cursor-pointer relative z-10"
        style={{
          border:       `1px solid ${color}33`,
          boxShadow:    `0 2px 12px ${color}18`,
          borderRadius: "1.5rem",
          transform:    "translateX(0px)",
          opacity:      baseOpacity,
          willChange:   "transform",
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
            {/* お気に入りバッジ */}
            {medaka.isFavorite && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shadow">
                <Heart className="w-3 h-3 text-white" fill="white" />
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
