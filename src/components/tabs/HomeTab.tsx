"use client";

import { useMedakaStore } from "@/store/medakaStore";
import { VarietyDistributionChart, GenerationChart } from "@/components/charts/TraitChart";
import { Fish, Heart, GitBranch, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { WaterWaveSVG, getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";
import { AquaSceneSVG, VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";

function StatCard({
  label,
  value,
  sub,
  gradient,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl p-4 text-white ripple-container ${gradient}`}>
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
      <div className="relative z-10">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium opacity-90">{label}</span>
        </div>
        <p className="text-4xl font-black tracking-tight">{value}</p>
        {sub && <p className="text-xs opacity-70 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function RecentMedakaRow({
  name,
  variety,
  acquiredDate,
  photoUrl,
}: {
  name: string;
  variety: string;
  acquiredDate: string;
  photoUrl?: string;
}) {
  const color = getVarietyColor(variety);
  const emoji = getVarietyEmoji(variety);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-12 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <VarietyMedakaSVG variety={variety} size={48} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs truncate" style={{ color }}>{variety}</p>
      </div>
      <span className="text-xs text-gray-300 flex-shrink-0">{acquiredDate}</span>
      <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    </div>
  );
}

// 品種ショーケースデータ
const SHOWCASE_VARIETIES = [
  { variety: "幹之",   desc: "青白い体外光" },
  { variety: "楊貴妃", desc: "深い橙色発色" },
  { variety: "三色",   desc: "三色まだら模様" },
  { variety: "夜桜",   desc: "幻想的なピンク" },
  { variety: "煌",     desc: "金色の輝き" },
  { variety: "紅帝",   desc: "鮮血の深紅" },
];

export function HomeTab() {
  const { medakas, breedingRecords } = useMedakaStore();

  const alive = medakas.filter((m) => m.isAlive);
  const males = alive.filter((m) => m.gender === "male");
  const females = alive.filter((m) => m.gender === "female");
  const varieties = new Set(medakas.map((m) => m.variety)).size;
  const hasGenerations = medakas.some((m) => m.generation);

  return (
    <div className="space-y-4 -mt-4 -mx-4">
      {/* ヒーローバナー (水景SVG) */}
      <div className="relative overflow-hidden" style={{ minHeight: 200 }}>
        {/* 水景イラスト */}
        <AquaSceneSVG className="absolute inset-0 w-full h-full object-cover" />
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/70 via-blue-800/50 to-indigo-900/60" />

        {/* 泡エフェクト */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute rounded-full border border-white/40"
            style={{
              width: `${8 + (i % 3) * 7}px`,
              height: `${8 + (i % 3) * 7}px`,
              left: `${10 + i * 14}%`,
              bottom: `${20 + (i % 4) * 14}%`,
              opacity: 0.3 + (i % 3) * 0.12,
            }}
          />
        ))}

        {/* テキスト */}
        <div className="relative z-10 px-6 pt-8 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-200 text-xs font-semibold tracking-wide">
              メダカ品種改良サポート
            </span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
            あなたのメダカ<br />
            <span className="text-cyan-200">品種改良を管理</span>
          </h2>
        </div>

        {/* 水面の波 */}
        <div className="relative z-10 mt-6">
          <WaterWaveSVG color="#f0f9ff" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* スタッツグリッド */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="総個体数" value={alive.length}
            sub={`♂${males.length} ♀${females.length}`}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600" icon={Fish} />
          <StatCard label="品種数" value={varieties} sub="登録品種"
            gradient="bg-gradient-to-br from-violet-500 to-purple-700" icon={TrendingUp} />
          <StatCard label="繁殖記録" value={breedingRecords.length} sub="交配ペア"
            gradient="bg-gradient-to-br from-rose-400 to-pink-600" icon={Heart} />
          <StatCard
            label="血統個体"
            value={medakas.filter((m) => m.parentIds?.father || m.parentIds?.mother).length}
            sub="親情報あり"
            gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
            icon={GitBranch}
          />
        </div>

        {/* 品種分布チャート */}
        {medakas.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 bg-cyan-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-800">品種別個体数</h3>
            </div>
            <VarietyDistributionChart medakas={medakas} />
          </div>
        )}

        {/* 世代別チャート */}
        {hasGenerations && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
              <h3 className="text-sm font-bold text-gray-800">世代別個体数</h3>
            </div>
            <GenerationChart medakas={medakas} />
          </div>
        )}

        {/* 空状態 — 品種ショーケース (SVGイラスト) */}
        {medakas.length === 0 && (
          <div className="space-y-3">
            <div className="card px-5 py-4 text-center">
              <h3 className="text-base font-bold text-gray-800 mb-1">最初のメダカを登録しよう！</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                「魚管理」タブからメダカを追加すると<br />血統チャートや特性分析が使えます。
              </p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-5 bg-cyan-500 rounded-full" />
                <h3 className="text-sm font-bold text-gray-800">人気品種ギャラリー</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SHOWCASE_VARIETIES.map(({ variety, desc }) => {
                  const color = getVarietyColor(variety);
                  return (
                    <div
                      key={variety}
                      className="rounded-2xl overflow-hidden flex flex-col items-center py-3 px-1"
                      style={{ background: `${color}14`, border: `1px solid ${color}30` }}
                    >
                      <VarietyMedakaSVG variety={variety} size={80} className="animate-float-fish" />
                      <p className="text-xs font-bold mt-1.5" style={{ color }}>{variety}</p>
                      <p className="text-[9px] text-gray-400 text-center mt-0.5 leading-tight">{desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 最近登録した個体 */}
        {medakas.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-5 bg-orange-400 rounded-full" />
              <h3 className="text-sm font-bold text-gray-800">最近の個体</h3>
            </div>
            {[...medakas]
              .sort((a, b) => b.acquiredDate.localeCompare(a.acquiredDate))
              .slice(0, 5)
              .map((m) => (
                <RecentMedakaRow
                  key={m.id}
                  name={m.name}
                  variety={m.variety}
                  acquiredDate={m.acquiredDate}
                  photoUrl={m.photos[0]?.url}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
