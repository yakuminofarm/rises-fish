"use client";

import { useState } from "react";
import { mockNews, mockColumns } from "@/lib/mockData";
import { NewsItem } from "@/types/medaka";
import { ColumnSection } from "@/components/tabs/ColumnSection";
import { formatDateShort } from "@/lib/utils";
import { Zap, ChevronRight } from "lucide-react";

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  品種:    { bg: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-100" },
  飼育:    { bg: "bg-emerald-50", text: "text-emerald-600",border: "border-emerald-100" },
  イベント:{ bg: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-100" },
  商品:    { bg: "bg-violet-50",  text: "text-violet-600", border: "border-violet-100" },
  ニュース:{ bg: "bg-rose-50",    text: "text-rose-600",   border: "border-rose-100" },
};

function FeaturedNewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      style={{ boxShadow: "0 8px 32px rgba(6,182,212,0.25)", minHeight: 200 }}
    >
      {/* 実写背景 */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {/* 暗めのグラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
      {/* コンテンツ */}
      <div className="relative z-10 p-5 flex flex-col justify-end h-full" style={{ minHeight: 200 }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-0.5 text-xs font-semibold text-white border border-white/30">
            <Zap className="w-3 h-3 text-yellow-300" />
            注目
          </span>
          <span className="text-[11px] text-white/60">{formatDateShort(item.publishedAt)}</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_STYLES[item.category]?.bg ?? "bg-white/20"} ${CATEGORY_STYLES[item.category]?.text ?? "text-white"}`}
          >
            {item.category}
          </span>
        </div>
        <h3 className="text-base font-black text-white leading-snug drop-shadow mb-1.5">
          {item.title}
        </h3>
        <p className={`text-xs text-white/75 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
          {item.summary}
        </p>
        <p className="text-[10px] text-white/40 mt-2">by {item.source}</p>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES["ニュース"];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform flex"
      style={{ border: "1px solid rgba(186,230,253,0.5)", boxShadow: "0 2px 8px rgba(6,182,212,0.05)" }}
    >
      {/* サムネイル */}
      {item.imageUrl && (
        <div className="w-24 flex-shrink-0 relative" style={{ minHeight: 96 }}>
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        </div>
      )}
      <div className="flex-1 p-3.5 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
            {item.category}
          </span>
          <span className="text-xs text-gray-300">{formatDateShort(item.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.title}</h3>
        <p className={`text-xs text-gray-500 mt-1.5 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
          {item.summary}
        </p>
        <p className="text-xs text-gray-300 mt-2">by {item.source}</p>
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
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat
                ? "bg-cyan-500 text-white shadow-sm shadow-cyan-200"
                : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* フィーチャー記事（実写大バナー） */}
      {filtered.length > 0 && <FeaturedNewsCard item={filtered[0]} />}

      {/* 残りの記事（サムネイル付き） */}
      <div className="space-y-2">
        {filtered.slice(1).map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {/* ブリーダーコラム（ニュース一覧の下に） */}
      {activeCategory === "すべて" && (
        <ColumnSection articles={mockColumns} />
      )}

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-3.5 border border-cyan-100 text-center">
        <p className="text-xs text-cyan-600 font-medium">
          🚀 近日公開 — リアルタイムニュース・SNS連携・品評会情報
        </p>
      </div>
    </div>
  );
}
