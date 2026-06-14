"use client";

import { useState } from "react";
import { useMedakaStore, LineageNode } from "@/store/medakaStore";
import { ChevronRight, GitBranch, FlaskConical } from "lucide-react";
import { getGenderColor } from "@/lib/utils";
import { getVarietyColor } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { MedakaRadarChart } from "@/components/charts/TraitChart";
import { BreedingDesignTab } from "@/components/tabs/BreedingDesignTab";

type SubTab = "lineage" | "design";

function LineageNodeCard({ node, depth = 0 }: { node: LineageNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasParents = node.father || node.mother;

  return (
    <div className={`${depth > 0 ? "ml-4 border-l-2 border-gray-100 pl-3" : ""}`}>
      <div
        onClick={() => hasParents && setExpanded(!expanded)}
        className={`flex items-center gap-2 py-2 ${hasParents ? "cursor-pointer" : ""}`}
      >
        <div
          className="w-14 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: `${getVarietyColor(node.medaka.variety)}14` }}
        >
          <VarietyMedakaSVG variety={node.medaka.variety} size={56} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{node.medaka.name}</p>
          <p className="text-xs text-gray-400">{node.medaka.variety}</p>
        </div>
        <span className={`text-sm ${getGenderColor(node.medaka.gender)}`}>
          {node.medaka.gender === "male" ? "♂" : node.medaka.gender === "female" ? "♀" : "?"}
        </span>
        {hasParents && (
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        )}
      </div>
      {expanded && (
        <div className="mt-1 space-y-1">
          {node.father && (
            <div>
              <span className="text-xs text-blue-400 ml-4">父</span>
              <LineageNodeCard node={node.father} depth={depth + 1} />
            </div>
          )}
          {node.mother && (
            <div>
              <span className="text-xs text-pink-400 ml-4">母</span>
              <LineageNodeCard node={node.mother} depth={depth + 1} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LineageView() {
  const { medakas, getLineage } = useMedakaStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMedaka = medakas.find((m) => m.id === selectedId);
  const lineage = selectedId ? getLineage(selectedId, 3) : null;
  const hasTraits = selectedMedaka && selectedMedaka.traits.some((t) => typeof t.value === "number");

  const withLineage = medakas.filter(
    (m) => m.parentIds?.father || m.parentIds?.mother
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">個体を選択</label>
        <select
          value={selectedId || ""}
          onChange={(e) => setSelectedId(e.target.value || null)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <option value="">-- 個体を選択 --</option>
          {medakas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.variety})
            </option>
          ))}
        </select>
      </div>

      {lineage && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">血統ツリー</h3>
          <LineageNodeCard node={lineage} />
        </div>
      )}

      {selectedMedaka && hasTraits && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">{selectedMedaka.name} 特性レーダー</h3>
          <MedakaRadarChart medaka={selectedMedaka} />
        </div>
      )}

      {!selectedId && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            血統記録あり ({withLineage.length}個体)
          </h3>
          {withLineage.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              親が設定された個体がありません。<br />
              「魚管理」から個体を登録する際に親を設定してください。
            </p>
          ) : (
            <div className="space-y-2">
              {withLineage.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-xl p-2 transition-colors"
                >
                  <div
                    className="w-14 h-8 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: `${getVarietyColor(m.variety)}14` }}
                  >
                    <VarietyMedakaSVG variety={m.variety} size={56} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.variety}{m.generation ? ` / F${m.generation}` : ""}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LineageTab() {
  const [subTab, setSubTab] = useState<SubTab>("lineage");

  return (
    <div className="space-y-4">
      {/* サブナビ */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
        <button
          onClick={() => setSubTab("lineage")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "lineage"
              ? "bg-white text-cyan-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          血統図
        </button>
        <button
          onClick={() => setSubTab("design")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
            subTab === "design"
              ? "bg-white text-violet-600 shadow-sm"
              : "text-gray-500"
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" />
          品種設計
        </button>
      </div>

      {subTab === "lineage" ? <LineageView /> : <BreedingDesignTab />}
    </div>
  );
}
