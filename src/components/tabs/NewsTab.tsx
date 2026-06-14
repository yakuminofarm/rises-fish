"use client";

import { useState } from "react";
import { mockNews } from "@/lib/mockData";
import { NewsItem } from "@/types/medaka";
import { formatDateShort } from "@/lib/utils";
import { Zap } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  品種: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-400" },
  飼育: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  イベント: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-400" },
  商品: { bg: "bg-violet-50", text: "text-violet-600", dot: "bg-violet-400" },
  ニュース: { bg: "bg-rose-50", text: "text-rose-600", dot: "bg-rose-400" },
};

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["ニュース"];

  if (featured) {
    return (
      <div
        onClick={() => setExpanded(!expanded)}
        className="relative rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-5 text-white"
        style={{ boxShadow: "0 8px 32px rgba(6,182,212,0.3)" }}
      >
        {/* 装飾 */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-8 top-2 w-16 h-16 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5 text-xs font-semibold">
              <Zap className="w-3 h-3 text-yellow-300" />
              注目
            </span>
            <span className="text-xs opacity-70">{formatDateShort(item.publishedAt)}</span>
          </div>
          <h3 className="text-base font-bold leading-snug mb-2">{item.title}</h3>
          <p className={`text-sm opacity-80 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {item.summary}
          </p>
          <p className="text-xs opacity-50 mt-3">by {item.source}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all"
      style={{ border: "1px solid rgba(186,230,253,0.5)", boxShadow: "0 2px 8px rgba(6,182,212,0.05)" }}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
              {item.category}
            </span>
            <span className="text-[10px] text-gray-300">{formatDateShort(item.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h3>
          <p className={`text-xs text-gray-500 mt-1.5 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {item.summary}
          </p>
          <p className="text-[10px] text-gray-300 mt-2">by {item.source}</p>
        </div>
      </div>
    </div>
  );
}

export function NewsTab() {
  const [activeCategory, setActiveCategory] = useState<string>("すべて");

  const categories = ["すべて", "品種", "飼育", "イベント", "商品", "ニュース"];
  const filtered =
    activeCategory === "すべて"
      ? mockNews
      : mockNews.filter((n) => n.category === activeCategory);

  return (
    <div className="space-y-3">
      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-200"
                : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 注目記事（先頭1件をフィーチャー） */}
      {filtered.length > 0 && <NewsCard item={filtered[0]} featured />}

      {/* 残りの記事 */}
      <div className="space-y-2">
        {filtered.slice(1).map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {/* 準備中 */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-3.5 border border-cyan-100 text-center">
        <p className="text-xs text-cyan-600 font-medium">
          🚀 近日公開 — リアルタイムニュース・SNS連携・品評会情報
        </p>
      </div>
    </div>
  );
}
