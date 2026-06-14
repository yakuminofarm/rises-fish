"use client";

import { useState } from "react";
import { mockProducts } from "@/lib/mockData";
import { Product } from "@/types/medaka";
import { Badge } from "@/components/ui/Badge";
import { Star, ShoppingBag, ExternalLink, Sparkles } from "lucide-react";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"
          }`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-7 h-7 text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</h3>
              <p className="text-xs text-gray-400">{product.brand}</p>
            </div>
            {product.price && (
              <p className="text-sm font-bold text-cyan-600 flex-shrink-0">
                ¥{product.price.toLocaleString()}
              </p>
            )}
          </div>
          {product.rating && <StarRating rating={product.rating} />}
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge>{product.category}</Badge>
            {product.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-gray-400">#{tag}</span>
            ))}
          </div>
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
    <div className="space-y-3">
      {/* 準備中バナー */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-violet-700">
          <strong>近日実装予定:</strong> AIによるパーソナライズレコメンド・価格比較・レビュー連携。現在はサンプルデータを表示しています。
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeCategory === cat
                ? "bg-cyan-500 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 商品リスト */}
      <div className="space-y-2">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
