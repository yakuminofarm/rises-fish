"use client";

import { useMedakaStore } from "@/store/medakaStore";
import { VarietyDistributionChart, GenerationChart } from "@/components/charts/TraitChart";
import { Fish, Heart, GitBranch, TrendingUp } from "lucide-react";

export function HomeTab() {
  const { medakas, breedingRecords } = useMedakaStore();

  const alive = medakas.filter((m) => m.isAlive);
  const males = alive.filter((m) => m.gender === "male");
  const females = alive.filter((m) => m.gender === "female");
  const varieties = new Set(medakas.map((m) => m.variety)).size;
  const hasGenerations = medakas.some((m) => m.generation);

  return (
    <div className="space-y-4">
      {/* サマリーカード */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Fish className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">総個体数</span>
          </div>
          <p className="text-3xl font-bold">{alive.length}</p>
          <p className="text-xs opacity-70 mt-1">
            ♂{males.length} ♀{females.length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">品種数</span>
          </div>
          <p className="text-3xl font-bold">{varieties}</p>
          <p className="text-xs opacity-70 mt-1">登録品種</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">繁殖記録</span>
          </div>
          <p className="text-3xl font-bold">{breedingRecords.length}</p>
          <p className="text-xs opacity-70 mt-1">交配ペア</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 opacity-80" />
            <span className="text-sm opacity-80">血統記録</span>
          </div>
          <p className="text-3xl font-bold">
            {medakas.filter((m) => m.parentIds?.father || m.parentIds?.mother).length}
          </p>
          <p className="text-xs opacity-70 mt-1">個体</p>
        </div>
      </div>

      {/* 品種分布チャート */}
      {medakas.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">品種別個体数</h3>
          <VarietyDistributionChart medakas={medakas} />
        </div>
      )}

      {/* 世代別チャート */}
      {hasGenerations && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">世代別個体数</h3>
          <GenerationChart medakas={medakas} />
        </div>
      )}

      {/* 空状態 */}
      {medakas.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <Fish className="w-16 h-16 mx-auto text-cyan-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">まずメダカを登録しましょう</h3>
          <p className="text-sm text-gray-400">
            「魚管理」タブからメダカを追加してください。<br />
            血統チャートや特性記録が使えるようになります。
          </p>
        </div>
      )}

      {/* 最近追加した個体 */}
      {medakas.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">最近登録した個体</h3>
          <div className="space-y-2">
            {[...medakas]
              .sort((a, b) => b.acquiredDate.localeCompare(a.acquiredDate))
              .slice(0, 3)
              .map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                    <Fish className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.variety}</p>
                  </div>
                  <span className="text-xs text-gray-400">{m.acquiredDate}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
