"use client";

import { useState } from "react";
import { mockNews } from "@/lib/mockData";
import { NewsItem } from "@/types/medaka";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";
import { Newspaper, ExternalLink, Sparkles } from "lucide-react";

const CATEGORY_VARIANT: Record<string, "default" | "success" | "info" | "warning" | "error"> = {
  品種: "info",
  飼育: "success",
  イベント: "warning",
  商品: "default",
  ニュース: "error",
};

function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-100 flex-shrink-0 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={CATEGORY_VARIANT[item.category] || "default"}>{item.category}</Badge>
            <span className="text-xs text-gray-400">{formatDateShort(item.publishedAt)}</span>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.title}</h3>
          <p className={`text-xs text-gray-500 mt-1 leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>
            {item.summary}
          </p>
          <p className="text-xs text-gray-400 mt-2">by {item.source}</p>
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
      {/* 準備中バナー */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>近日実装予定:</strong> リアルタイムニュース取得・SNS投稿連携・品評会情報など。現在はサンプルデータを表示しています。
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
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

      {/* ニュースリスト */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
