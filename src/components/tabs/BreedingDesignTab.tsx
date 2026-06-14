"use client";

import { useState } from "react";
import { useMedakaStore } from "@/store/medakaStore";
import {
  VARIETY_DESIGN_PROFILES,
  TRAIT_DEFINITIONS,
  TRAIT_LEVEL_LABELS,
  TRAIT_LEVEL_WIDTH,
  INHERITANCE_BADGE,
  getDesignProfile,
  VarietyDesignProfile,
  GenerationStep,
} from "@/lib/geneticData";
import { getVarietyColor } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";
import { Target, ChevronRight, ChevronDown, Dna, FlaskConical, Users, Lightbulb, CheckCircle2 } from "lucide-react";

// ──────────────────────────────────────────────
// 品種選択グリッド
// ──────────────────────────────────────────────
function VarietySelectGrid({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-5 bg-violet-500 rounded-full" />
        <h3 className="text-sm font-bold text-gray-800">目標品種を選ぶ</h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {VARIETY_DESIGN_PROFILES.map((profile) => {
          const color = getVarietyColor(profile.variety);
          return (
            <button
              key={profile.variety}
              onClick={() => onSelect(profile.variety)}
              className="relative rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-all"
              style={{ border: `1.5px solid ${color}30`, background: `${color}08` }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-black" style={{ color }}>{profile.variety}</span>
                  <span className="text-xs text-gray-400">{profile.difficulty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-gray-500 leading-snug">{profile.nickname}</p>
                  <VarietyMedakaSVG variety={profile.variety} size={40} />
                </div>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
                style={{ background: color }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 形質プロファイル
// ──────────────────────────────────────────────
function TraitProfile({ profile }: { profile: VarietyDesignProfile }) {
  const color = getVarietyColor(profile.variety);
  const activeTrait = profile.traits.filter((t) => t.level !== "none");

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dna className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-bold text-gray-800">形質プロファイル</h3>
      </div>
      <div className="space-y-2.5">
        {activeTrait.map((t) => {
          const def = TRAIT_DEFINITIONS.find((d) => d.id === t.traitId);
          if (!def) return null;
          const badge = INHERITANCE_BADGE[def.inheritance];
          return (
            <div key={t.traitId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">{def.label}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: badge.color }}
                  >
                    {badge.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: def.color }}>
                  {TRAIT_LEVEL_LABELS[t.level]}
                </span>
              </div>
              {/* バーグラフ */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: TRAIT_LEVEL_WIDTH[t.level], background: def.color }}
                />
              </div>
              {t.note && (
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{t.note}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 推奨交配
// ──────────────────────────────────────────────
function RecommendedCrosses({
  profile,
  myVarieties,
}: {
  profile: VarietyDesignProfile;
  myVarieties: Set<string>;
}) {
  const color = getVarietyColor(profile.variety);

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-bold text-gray-800">推奨交配</h3>
      </div>
      <div className="space-y-3">
        {profile.recommendedCrosses.map((cross, i) => {
          const hasFather = myVarieties.has(cross.fatherVariety);
          const hasMother = myVarieties.has(cross.motherVariety);
          const hasAll = hasFather && hasMother;
          return (
            <div
              key={i}
              className="rounded-2xl p-3 space-y-2"
              style={{
                background: hasAll ? `${color}0a` : "#f9fafb",
                border: `1px solid ${hasAll ? color + "30" : "#e5e7eb"}`,
              }}
            >
              {/* 親の組み合わせ */}
              <div className="flex items-center gap-2">
                <FishChip variety={cross.fatherVariety} gender="♂" owned={hasFather} />
                <span className="text-gray-300 font-bold">×</span>
                <FishChip variety={cross.motherVariety} gender="♀" owned={hasMother} />
                <div className="ml-auto text-right">
                  <p className="text-xs font-black" style={{ color }}>
                    {cross.targetProbability}%
                  </p>
                  <p className="text-[9px] text-gray-400">出現率</p>
                </div>
              </div>
              {/* 説明 */}
              <p className="text-[11px] text-gray-600 leading-relaxed">{cross.offspringNote}</p>
              {/* 世代数 */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  固定まで約 <b className="text-gray-600">{cross.generationsToFix}</b> 世代
                </span>
                {hasAll && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: color }}
                  >
                    ✓ 手持ちあり
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FishChip({ variety, gender, owned }: { variety: string; gender: string; owned: boolean }) {
  const color = getVarietyColor(variety);
  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-xl"
      style={{
        background: owned ? `${color}15` : "#f3f4f6",
        border: `1px solid ${owned ? color + "40" : "#e5e7eb"}`,
      }}
    >
      <VarietyMedakaSVG variety={variety} size={22} />
      <div>
        <p className="text-[10px] font-bold leading-none" style={{ color: owned ? color : "#6b7280" }}>
          {variety}
        </p>
        <p className="text-[9px] text-gray-400">{gender}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 世代別ロードマップ
// ──────────────────────────────────────────────
function Roadmap({ profile }: { profile: VarietyDesignProfile }) {
  const [openStep, setOpenStep] = useState<string | null>("P");
  const color = getVarietyColor(profile.variety);

  const genColor: Record<GenerationStep["generation"], string> = {
    P:  "#6b7280",
    F1: "#3b82f6",
    F2: "#8b5cf6",
    F3: "#ec4899",
    F4: "#f97316",
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-bold text-gray-800">品種設計ロードマップ</h3>
        <span className="ml-auto text-[10px] text-gray-400">
          約 {profile.generationsNeeded} 世代
        </span>
      </div>

      <div className="relative">
        {/* 縦ライン */}
        <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-gray-100" />

        <div className="space-y-2">
          {profile.roadmap.map((step) => {
            const isOpen = openStep === step.generation;
            const gc = genColor[step.generation];
            return (
              <div key={step.generation}>
                <button
                  onClick={() => setOpenStep(isOpen ? null : step.generation)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  {/* 世代バッジ */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-black z-10 shadow-sm"
                    style={{ background: gc }}
                  >
                    {step.generation}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-snug">{step.label}</p>
                    {!isOpen && (
                      <p className="text-[10px] text-gray-400 truncate">{step.description}</p>
                    )}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="ml-13 ml-[52px] mt-1 mb-2 space-y-2">
                    <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                    {step.expectedRatio && (
                      <div
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg inline-block"
                        style={{ background: `${gc}15`, color: gc }}
                      >
                        期待値: {step.expectedRatio}
                      </div>
                    )}
                    <div className="space-y-1">
                      {step.selectionCriteria.map((c, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: gc }} />
                          <p className="text-[11px] text-gray-600 leading-snug">{c}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// 手持ちマッチング
// ──────────────────────────────────────────────
function MyFishMatch({
  profile,
  myVarieties,
}: {
  profile: VarietyDesignProfile;
  myVarieties: Set<string>;
}) {
  const color = getVarietyColor(profile.variety);
  const needed = new Set(
    profile.recommendedCrosses.flatMap((c) => [c.fatherVariety, c.motherVariety])
  );
  const have = [...needed].filter((v) => myVarieties.has(v));
  const missing = [...needed].filter((v) => !myVarieties.has(v));
  const ratio = needed.size > 0 ? Math.round((have.length / needed.size) * 100) : 0;

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-bold text-gray-800">手持ち個体チェック</h3>
      </div>

      {/* 進捗バー */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">必要品種の保有率</span>
          <span className="text-sm font-black" style={{ color }}>{ratio}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${ratio}%`, background: color }}
          />
        </div>
      </div>

      {/* 保有済み */}
      {have.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-emerald-600 mb-1.5">✓ 保有済み</p>
          <div className="flex flex-wrap gap-1.5">
            {have.map((v) => (
              <span
                key={v}
                className="text-[11px] font-semibold px-2 py-1 rounded-xl"
                style={{ background: `${getVarietyColor(v)}15`, color: getVarietyColor(v) }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 未保有 */}
      {missing.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 mb-1.5">○ 未保有（入手が必要）</p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map((v) => (
              <span
                key={v}
                className="text-[11px] font-semibold px-2 py-1 rounded-xl bg-gray-50 text-gray-500 border border-gray-200"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// ヒント
// ──────────────────────────────────────────────
function TipsSection({ profile }: { profile: VarietyDesignProfile }) {
  const color = getVarietyColor(profile.variety);
  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-bold text-gray-800">ブリーダーのコツ</h3>
      </div>
      <div className="space-y-2">
        {profile.tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white"
              style={{ background: color }}
            >
              {i + 1}
            </span>
            <p className="text-xs text-gray-600 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// メインコンポーネント
// ──────────────────────────────────────────────
export function BreedingDesignTab() {
  const { medakas } = useMedakaStore();
  const [selectedVariety, setSelectedVariety] = useState<string | null>(null);

  const myVarieties = new Set(medakas.filter((m) => m.isAlive).map((m) => m.variety));
  const profile = selectedVariety ? getDesignProfile(selectedVariety) : null;
  const color = selectedVariety ? getVarietyColor(selectedVariety) : "#06b6d4";

  if (!profile) {
    return (
      <div className="space-y-4">
        {/* ヘッダー */}
        <div
          className="rounded-3xl p-4 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)" }}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-violet-200" />
              <span className="text-xs font-semibold text-violet-200">品種設計モード</span>
            </div>
            <p className="text-base font-black leading-snug">
              目標品種を選んで<br />
              <span className="text-violet-200">改良ロードマップを確認</span>
            </p>
            <p className="text-xs text-white/60 mt-1.5">
              遺伝様式・推奨交配・世代別選別基準を表示
            </p>
          </div>
        </div>

        <VarietySelectGrid onSelect={setSelectedVariety} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 選択中ヘッダー */}
      <div
        className="rounded-3xl p-4 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)` }}
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <button
          onClick={() => setSelectedVariety(null)}
          className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-1 text-xs text-white font-semibold"
        >
          ← 戻る
        </button>
        <div className="relative z-10 flex items-end gap-3">
          <VarietyMedakaSVG variety={profile.variety} size={80} />
          <div>
            <p className="text-2xl font-black drop-shadow">{profile.variety}</p>
            <p className="text-xs text-white/80">{profile.nickname}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{profile.difficulty}</span>
              <span className="text-[10px] text-white/70">{profile.difficultyNote}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 手持ちマッチング */}
      <MyFishMatch profile={profile} myVarieties={myVarieties} />

      {/* 形質プロファイル */}
      <TraitProfile profile={profile} />

      {/* 推奨交配 */}
      <RecommendedCrosses profile={profile} myVarieties={myVarieties} />

      {/* ロードマップ */}
      <Roadmap profile={profile} />

      {/* ヒント */}
      <TipsSection profile={profile} />
    </div>
  );
}
