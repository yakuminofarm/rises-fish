"use client";

import { useMedakaStore } from "@/store/medakaStore";
import { VarietyDistributionChart, GenerationChart } from "@/components/charts/TraitChart";
import { Fish, Heart, GitBranch, TrendingUp, Sparkles, ChevronRight } from "lucide-react";
import { MedakaFishSVG, WaterWaveSVG, getVarietyColor, getVarietyEmoji } from "@/components/ui/MedakaIllustration";

function StatCard({
  label,
  value,
  sub,
  gradient,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: number | string;
  sub?: string;
  gradient: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl p-4 text-white ripple-container ${gradient}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 背景の装飾円 */}
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

function RecentMedakaRow({ name, variety, acquiredDate }: { name: string; variety: string; acquiredDate: string }) {
  const color = getVarietyColor(variety);
  const emoji = getVarietyEmoji(variety);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-base flex-shrink-0"
        style={{ background: `${color}22` }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
        <p className="text-xs text-gray-400 truncate">{variety}</p>
      </div>
      <span className="text-xs text-gray-300 flex-shrink-0">{acquiredDate}</span>
      <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
    </div>
  );
}

export function HomeTab() {
  const { medakas, breedingRecords } = useMedakaStore();

  const alive = medakas.filter((m) => m.isAlive);
  const males = alive.filter((m) => m.gender === "male");
  const females = alive.filter((m) => m.gender === "female");
  const varieties = new Set(medakas.map((m) => m.variety)).size;
  const hasGenerations = medakas.some((m) => m.generation);

  return (
    <div className="space-y-4 -mt-4 -mx-4">
      {/* ヒーローバナー */}
      <div className="relative bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 px-6 pt-8 pb-0 overflow-hidden">
        {/* 泡 */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/30"
            style={{
              width: `${8 + (i % 3) * 6}px`,
              height: `${8 + (i % 3) * 6}px`,
              left: `${10 + i * 11}%`,
              bottom: `${20 + (i % 4) * 12}%`,
              opacity: 0.4 + (i % 3) * 0.15,
            }}
          />
        ))}
        {/* テキスト */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-yellow-200 text-xs font-medium">メダカ品種改良サポート</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight">
            あなたのメダカ<br />
            <span className="text-cyan-200">品種改良を管理</span>
          </h2>
        </div>
        {/* メダカイラスト群 */}
        <div className="relative flex items-end gap-2 px-2">
          <MedakaFishSVG color="#fbbf24" size={56} className="animate-float-fish mb-2" />
          <MedakaFishSVG color="#f97316" size={44} className="animate-float-fish mb-1 [animation-delay:0.8s]" />
          <MedakaFishSVG color="#60a5fa" size={52} className="animate-float-fish mb-3 [animation-delay:1.5s]" />
          <MedakaFishSVG color="#c084fc" size={36} className="animate-float-fish mb-1 [animation-delay:0.4s]" />
        </div>
        {/* 水面の波 */}
        <div className="relative -mx-0 mt-0">
          <WaterWaveSVG color="#ffffff" />
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* スタッツグリッド */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="総個体数"
            value={alive.length}
            sub={`♂${males.length} ♀${females.length}`}
            gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
            icon={Fish}
            delay={0}
          />
          <StatCard
            label="品種数"
            value={varieties}
            sub="登録品種"
            gradient="bg-gradient-to-br from-violet-500 to-purple-700"
            icon={TrendingUp}
            delay={100}
          />
          <StatCard
            label="繁殖記録"
            value={breedingRecords.length}
            sub="交配ペア"
            gradient="bg-gradient-to-br from-rose-400 to-pink-600"
            icon={Heart}
            delay={200}
          />
          <StatCard
            label="血統個体"
            value={medakas.filter((m) => m.parentIds?.father || m.parentIds?.mother).length}
            sub="親情報あり"
            gradient="bg-gradient-to-br from-emerald-400 to-teal-600"
            icon={GitBranch}
            delay={300}
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

        {/* 空状態 */}
        {medakas.length === 0 && (
          <div className="card p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-float-fish">
                <MedakaFishSVG color="#06b6d4" size={72} />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              最初のメダカを登録しよう！
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              「魚管理」タブからメダカを追加すると<br />
              血統チャートや特性分析が使えます。
            </p>
            <div className="mt-4 flex justify-center gap-3">
              {["幹之", "楊貴妃", "三色", "夜桜"].map((v) => (
                <span
                  key={v}
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    background: `${getVarietyColor(v)}22`,
                    color: getVarietyColor(v),
                  }}
                >
                  {getVarietyEmoji(v)} {v}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 最近登録した個体 */}
        {medakas.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-orange-400 rounded-full" />
                <h3 className="text-sm font-bold text-gray-800">最近の個体</h3>
              </div>
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
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
