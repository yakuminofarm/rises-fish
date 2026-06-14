"use client";

import { useState } from "react";
import { ColumnArticle } from "@/types/medaka";
import { Clock, X, ChevronRight, Award, MapPin, Users } from "lucide-react";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { getVarietyColor } from "@/components/ui/MedakaIllustration";

// ─────────────────────────────────────────────
// ブリーダーアバター
// ─────────────────────────────────────────────
function BreederAvatar({
  breeder,
  size = "md",
}: {
  breeder: ColumnArticle["breeder"];
  size?: "sm" | "md" | "lg";
}) {
  const s = size === "sm" ? "w-8 h-8 text-base" : size === "lg" ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg";
  return (
    <div
      className={`${s} rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-sm`}
      style={{ background: `${breeder.avatarColor}22`, border: `2px solid ${breeder.avatarColor}55` }}
    >
      {breeder.avatarEmoji}
    </div>
  );
}

// ─────────────────────────────────────────────
// コラム詳細モーダル
// ─────────────────────────────────────────────
function ColumnDetailModal({
  article,
  onClose,
}: {
  article: ColumnArticle;
  onClose: () => void;
}) {
  const { breeder } = article;
  const accentColor = article.featuredVariety
    ? getVarietyColor(article.featuredVariety)
    : breeder.avatarColor;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[92vh] flex flex-col">
        {/* ヘッダー画像エリア */}
        <div className="relative flex-shrink-0" style={{ height: 180 }}>
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.title}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          {/* カテゴリ */}
          <div className="absolute top-4 left-4">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ background: accentColor }}
            >
              {article.category}
            </span>
          </div>
          {/* 閉じるボタン */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          {/* タイトル */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-base font-black text-white leading-snug drop-shadow">
              {article.title}
            </h2>
          </div>
        </div>

        {/* スクロールコンテンツ */}
        <div className="overflow-y-auto flex-1">
          {/* ブリーダー情報 */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <BreederAvatar breeder={breeder} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{breeder.name}</p>
                  <span className="text-xs text-gray-400">{breeder.handle}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />{breeder.location}
                  </span>
                  {breeder.followersK && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />{breeder.followersK}K フォロワー
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                  {breeder.bio}
                </p>
              </div>
            </div>
            {/* 受賞歴 */}
            {breeder.awards && breeder.awards.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {breeder.awards.map((a, i) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                    <Award className="w-2.5 h-2.5" />{a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 記事本文 */}
          <div className="px-4 py-4 space-y-4">
            {/* 読了時間・日付 */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />約{article.readMinutes}分で読める
              </span>
              <span>{article.publishedAt}</span>
            </div>

            {/* リード文 */}
            <p className="text-sm font-semibold text-gray-700 leading-relaxed border-l-4 pl-3"
              style={{ borderColor: accentColor }}>
              {article.lead}
            </p>

            {/* 品種イラスト */}
            {article.featuredVariety && (
              <div
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: `${accentColor}0e` }}
              >
                <VarietyMedakaSVG variety={article.featuredVariety} size={96} />
                <div>
                  <p className="text-xs text-gray-400 font-medium">この記事の品種</p>
                  <p className="text-base font-black" style={{ color: accentColor }}>
                    {article.featuredVariety}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">得意品種: {breeder.specialty}</p>
                </div>
              </div>
            )}

            {/* 本文段落 */}
            {article.body.map((para, i) => (
              <p key={i} className="text-sm text-gray-700 leading-[1.8]">{para}</p>
            ))}

            {/* タグ */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {article.tags.map((tag) => (
                <span key={tag} className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// コラムカード (一覧表示用)
// ─────────────────────────────────────────────
function ColumnCard({
  article,
  featured = false,
  onClick,
}: {
  article: ColumnArticle;
  featured?: boolean;
  onClick: () => void;
}) {
  const { breeder } = article;
  const accentColor = article.featuredVariety
    ? getVarietyColor(article.featuredVariety)
    : breeder.avatarColor;

  if (featured) {
    return (
      <div
        onClick={onClick}
        className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
        style={{ boxShadow: `0 8px 32px ${accentColor}30` }}
      >
        {/* 背景画像 */}
        {article.imageUrl && (
          <img src={article.imageUrl} alt={article.title}
            className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative z-10 p-5" style={{ minHeight: 220 }}>
          {/* カテゴリ + 読了時間 */}
          <div className="flex items-center gap-2 mb-auto">
            <span
              className="text-[10px] font-black px-2.5 py-1 rounded-full text-white"
              style={{ background: accentColor }}
            >
              {article.category}
            </span>
            <span className="text-[10px] text-white/60 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />約{article.readMinutes}分
            </span>
          </div>

          {/* 品種イラスト (右上) */}
          {article.featuredVariety && (
            <div className="absolute right-4 top-4 opacity-70">
              <VarietyMedakaSVG variety={article.featuredVariety} size={72} />
            </div>
          )}

          {/* タイトル・リード (下寄せ) */}
          <div className="mt-20">
            <h3 className="text-base font-black text-white leading-snug drop-shadow mb-1.5">
              {article.title}
            </h3>
            <p className="text-xs text-white/70 leading-relaxed line-clamp-2">{article.lead}</p>
          </div>

          {/* ブリーダー情報 */}
          <div className="flex items-center gap-2 mt-3">
            <BreederAvatar breeder={breeder} size="sm" />
            <div>
              <p className="text-xs font-bold text-white">{breeder.name}</p>
              <p className="text-[10px] text-white/50">{breeder.specialty} 専門</p>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 ml-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all flex"
      style={{
        border: `1px solid ${accentColor}28`,
        boxShadow: `0 2px 12px ${accentColor}10`,
      }}
    >
      {/* 左アクセントバー */}
      <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ background: accentColor }} />

      {/* サムネイル */}
      {article.imageUrl && (
        <div className="w-20 flex-shrink-0 relative">
          <img src={article.imageUrl} alt={article.title}
            className="w-full h-full object-cover absolute inset-0" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
        </div>
      )}

      {/* テキスト */}
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: accentColor }}
          >
            {article.category}
          </span>
          <span className="text-[10px] text-gray-300 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{article.readMinutes}分
          </span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
          {article.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-2">
          <BreederAvatar breeder={breeder} size="sm" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-700 truncate">{breeder.name}</p>
            <p className="text-[10px] text-gray-400">{breeder.specialty} 専門</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// コラムセクション (NewsTab 内に埋め込む)
// ─────────────────────────────────────────────
export function ColumnSection({ articles }: { articles: ColumnArticle[] }) {
  const [selected, setSelected] = useState<ColumnArticle | null>(null);

  if (articles.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* セクションヘッダー */}
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 bg-amber-400 rounded-full" />
        <h2 className="text-sm font-black text-gray-800">ブリーダーコラム</h2>
        <span className="text-[10px] text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full font-semibold ml-auto">
          プロの知恵
        </span>
      </div>

      {/* フィーチャーコラム */}
      <ColumnCard article={articles[0]} featured onClick={() => setSelected(articles[0])} />

      {/* その他コラム */}
      <div className="space-y-2">
        {articles.slice(1).map((a) => (
          <ColumnCard key={a.id} article={a} onClick={() => setSelected(a)} />
        ))}
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <ColumnDetailModal article={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
