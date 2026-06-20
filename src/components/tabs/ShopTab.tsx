"use client";

import { useState } from "react";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types/medaka";
import { Star } from "lucide-react";

const CATEGORY_ICONS: Record<string, string> = {
  餌: "🍀", 水槽: "🪣", フィルター: "💧", 薬品: "💊", 産卵グッズ: "🥚", その他: "📦",
};

const CATEGORY_COLORS: Record<string, { accent: string; bg: string }> = {
  餌:        { accent: "#22c55e", bg: "#f0fdf4" },
  水槽:      { accent: "#0ea5e9", bg: "#f0f9ff" },
  フィルター:{ accent: "#6366f1", bg: "#eef2ff" },
  薬品:      { accent: "#ef4444", bg: "#fef2f2" },
  産卵グッズ:{ accent: "#f59e0b", bg: "#fffbeb" },
  その他:    { accent: "#6b7280", bg: "#f9fafb" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1 font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const colors = CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS["その他"];
  const icon   = CATEGORY_ICONS[product.category] ?? "📦";

  return (
    <div
      className="bg-white rounded-3xl overflow-hidden active:scale-[0.98] transition-transform"
      style={{
        border: "1px solid rgba(186,230,253,0.5)",
        boxShadow: "0 2px 16px rgba(6,182,212,0.07)",
      }}
    >
      <div className="flex items-stretch">
        {/* サムネイル */}
        <div className="w-28 flex-shrink-0 relative" style={{ minHeight: 108 }}>
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
              <span
                className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: colors.bg, color: colors.accent }}
              >
                {icon}
              </span>
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ background: colors.bg, minHeight: 108 }}
            >
              {icon}
            </div>
          )}
        </div>

        {/* テキスト */}
        <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium mb-0.5">{product.brand}</p>
                <h3 className="text-sm font-bold text-gray-900 leading-snug">{product.name}</h3>
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: colors.bg, color: colors.accent }}
              >
                {product.category}
              </span>
            </div>

            {product.rating && (
              <div className="mt-2">
                <StarRating rating={product.rating} />
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">
              {product.description}
            </p>
          </div>

          {product.price && (
            <p className="text-lg font-black mt-3" style={{ color: colors.accent }}>
              ¥{product.price.toLocaleString()}
              <span className="text-xs text-gray-300 font-normal ml-1">参考価格</span>
            </p>
          )}
        </div>
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
    <div className="space-y-4">
      {/* ヘッダーバナー */}
      <div
        className="relative rounded-3xl overflow-hidden text-white"
        style={{ minHeight: 110, boxShadow: "0 8px 32px rgba(14,165,233,0.3)" }}
      >
        <img
          src="https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80&auto=format&fit=crop"
          alt="メダカ"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/60" />
        <div className="relative z-10 px-5 py-5">
          <p className="text-xs opacity-70 mb-0.5 font-medium tracking-wide">メダカ飼育グッズ</p>
          <h2 className="text-xl font-black">おすすめアイテム</h2>
          <p className="text-xs opacity-60 mt-0.5">飼育歴に合わせたセレクション</p>
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
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
          <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100 text-center">
        <p className="text-xs text-violet-600 font-medium">
          🤖 近日公開 — AIパーソナライズ・価格比較・在庫通知
        </p>
      </div>
    </div>
  );
}
