"use client";

import { useState } from "react";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types/medaka";
import { Star, ShoppingCart } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  餌: "🍀",
  水槽: "🪣",
  フィルター: "💧",
  薬品: "💊",
  産卵グッズ: "🥚",
  その他: "📦",
};

const CATEGORY_COLORS: Record<string, { from: string; to: string }> = {
  餌: { from: "#86efac", to: "#4ade80" },
  水槽: { from: "#7dd3fc", to: "#38bdf8" },
  フィルター: { from: "#93c5fd", to: "#60a5fa" },
  薬品: { from: "#fca5a5", to: "#f87171" },
  産卵グッズ: { from: "#fde68a", to: "#fbbf24" },
  その他: { from: "#d1d5db", to: "#9ca3af" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      <span className="text-[11px] text-gray-400 ml-1 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const colors = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS["その他"];
  const icon = CATEGORY_ICONS[product.category] ?? "📦";

  return (
    <div
      className="bg-white rounded-3xl p-4 active:scale-[0.98] transition-all"
      style={{
        border: "1px solid rgba(186,230,253,0.5)",
        boxShadow: "0 2px 12px rgba(6,182,212,0.06)",
      }}
    >
      <div className="flex gap-3">
        {/* アイコン */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${colors.from}44, ${colors.to}33)`,
            border: `1px solid ${colors.from}55`,
          }}
        >
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-medium">{product.brand}</p>
              <h3 className="text-sm font-bold text-gray-900 leading-snug mt-0.5">
                {product.name}
              </h3>
            </div>
            {product.price && (
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-gray-400">参考価格</p>
                <p className="text-base font-black text-cyan-600">
                  ¥{product.price.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {product.rating && (
            <div className="mt-1.5">
              <StarRating rating={product.rating} />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">
        {product.description}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: `${colors.from}44`, color: colors.to }}
        >
          {product.category}
        </span>
        {product.tags.map((tag) => (
          <span key={tag} className="text-[10px] text-gray-300">#{tag}</span>
        ))}
      </div>
    </div>
  );
}

const CATEGORIES = ["すべて", "餌", "水槽", "フィルター", "薬品", "産卵グッズ", "その他"];

export function ShopTab() {
  const [activeCategory, setActiveCategory] = useState("すべて");

  const filtered =
    activeCategory === "すべて"
      ? mockProducts
      : mockProducts.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* ヘッダーバナー */}
      <div
        className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
          boxShadow: "0 8px 32px rgba(14,165,233,0.3)",
        }}
      >
        <div className="absolute -right-4 -bottom-4 w-28 h-28 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-xs opacity-70 mb-1 font-medium">メダカ飼育グッズ</p>
          <h2 className="text-lg font-black">おすすめアイテム</h2>
          <p className="text-xs opacity-70 mt-1">飼育歴に合わせたセレクション</p>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl opacity-30">🛒</div>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-200"
                : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {cat === "すべて" ? cat : `${CATEGORY_ICONS[cat]} ${cat}`}
          </button>
        ))}
      </div>

      {/* 商品リスト */}
      <div className="space-y-3">
        {filtered.map((product, i) => (
          <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-3.5 border border-violet-100 text-center">
        <p className="text-xs text-violet-600 font-medium">
          🤖 近日公開 — AIパーソナライズ・価格比較・在庫通知
        </p>
      </div>
    </div>
  );
}
