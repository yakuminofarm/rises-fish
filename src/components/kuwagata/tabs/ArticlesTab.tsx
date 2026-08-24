"use client";

import { useState } from "react";
import { BookOpen, CalendarDays, Clock, ExternalLink as ExternalLinkIcon, X } from "lucide-react";
import {
  ARTICLES,
  ARTICLE_CATEGORIES,
  Article,
  ArticleCategory,
  EXTERNAL_LINKS,
  MONTHLY_TOPICS,
} from "@/lib/kuwagataArticles";

type CategoryFilter = "all" | ArticleCategory;

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  "基礎": "bg-gray-100 text-gray-600",
  "産卵": "bg-pink-100 text-pink-700",
  "幼虫飼育": "bg-emerald-100 text-emerald-700",
  "温度管理": "bg-sky-100 text-sky-700",
  "羽化・成虫": "bg-violet-100 text-violet-700",
  "販売": "bg-amber-100 text-amber-700",
};

function ArticleReaderModal({ article, onClose }: { article: Article; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <span
              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${CATEGORY_COLORS[article.category]}`}
            >
              {article.category}
            </span>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{article.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5">
          <p className="text-sm font-semibold text-amber-800 bg-amber-50 rounded-xl px-4 py-3 leading-relaxed">
            {article.lead}
          </p>
          <div className="mt-5 space-y-4">
            {article.body.map((para, i) => (
              <p key={i} className="text-[15px] text-gray-700 leading-[1.9]">
                {para}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-6 pb-6">
            {article.tags.map((t) => (
              <span
                key={t}
                className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticlesTab() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [selected, setSelected] = useState<Article | null>(null);

  const month = new Date().getMonth() + 1;
  const topics = MONTHLY_TOPICS[month] ?? [];

  const filtered =
    category === "all" ? ARTICLES : ARTICLES.filter((a) => a.category === category);

  return (
    <div className="space-y-5">
      {/* 今月のトピック */}
      <section>
        <div className="rounded-3xl bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 p-5 text-white shadow-lg">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-amber-300" />
            <p className="text-[11px] font-bold tracking-wider text-amber-200/70 uppercase">
              {month}月のブリードトピック
            </p>
          </div>
          <div className="mt-3 space-y-3">
            {topics.map((t, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{t.title}</p>
                  <p className="text-xs text-amber-100/60 mt-0.5 leading-relaxed">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 飼育コラム */}
      <section>
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-gray-800">飼育コラム</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {(["all", ...ARTICLE_CATEGORIES] as CategoryFilter[]).map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                category === c
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm shadow-amber-200"
                  : "bg-white text-gray-500 border-gray-100"
              }`}
            >
              {c === "all" ? "すべて" : c}
            </button>
          ))}
        </div>

        <div className="space-y-2.5 mt-1">
          {filtered.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className="w-full text-left bg-white rounded-2xl p-4 border border-amber-100/60 shadow-sm transition-all active:scale-[0.98] animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLORS[a.category]}`}
                >
                  {a.category}
                </span>
                <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {a.readMinutes}分で読める
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug">{a.title}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-2">{a.lead}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 外部リンク */}
      <section className="pb-2">
        <div className="flex items-center gap-1.5 mb-1 px-0.5">
          <ExternalLinkIcon className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-800">業界情報を探す</h2>
        </div>
        <p className="text-xs text-gray-400 mb-2 px-0.5">
          最新のニュース・相場は外部サイトで。検索リンクで開きます。
        </p>
        <div className="bg-white rounded-2xl border border-amber-100/60 divide-y divide-gray-50">
          {EXTERNAL_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 active:bg-amber-50/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">{l.label}</p>
                <p className="text-xs text-gray-400 truncate">{l.description}</p>
              </div>
              <ExternalLinkIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </a>
          ))}
        </div>
      </section>

      {selected && (
        <ArticleReaderModal article={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
