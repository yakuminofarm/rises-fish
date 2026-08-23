"use client";

import { AlertTriangle, Bug, CalendarClock, ChevronRight, GitBranch, Worm } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { KuwagataTabId } from "@/components/kuwagata/KuwagataBottomNav";
import {
  LINE_STATUS_COLORS,
  LINE_STATUS_LABELS,
  deriveUpcomingTasks,
  latestWeight,
} from "@/lib/kuwagataUtils";
import { formatDateShort } from "@/lib/utils";

interface KuwagataHomeTabProps {
  onNavigate: (tab: KuwagataTabId) => void;
}

export function KuwagataHomeTab({ onNavigate }: KuwagataHomeTabProps) {
  const { beetles, lines, larvae } = useKuwagataStore();

  const aliveBeetles = beetles.filter((b) => b.isAlive);
  const aliveLarvae = larvae.filter((l) => l.isAlive && l.stage !== "adult");
  const activeLines = lines.filter((l) => l.status !== "finished");
  const tasks = deriveUpcomingTasks(lines, larvae);

  const topLarvae = [...larvae]
    .filter((l) => l.isAlive && latestWeight(l) != null)
    .sort((a, b) => (latestWeight(b) ?? 0) - (latestWeight(a) ?? 0))
    .slice(0, 3);

  const stats = [
    { label: "成虫", value: aliveBeetles.length, unit: "頭", icon: Bug, tab: "adults" as const, color: "text-amber-700 bg-amber-50" },
    { label: "幼虫", value: aliveLarvae.length, unit: "頭", icon: Worm, tab: "larvae" as const, color: "text-emerald-700 bg-emerald-50" },
    { label: "進行中ライン", value: activeLines.length, unit: "本", icon: GitBranch, tab: "breeding" as const, color: "text-orange-700 bg-orange-50" },
  ];

  return (
    <div className="space-y-5">
      {/* サマリー */}
      <div className="grid grid-cols-3 gap-2.5">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => onNavigate(s.tab)}
            className="bg-white rounded-2xl p-3.5 text-left shadow-sm border border-amber-100/60 active:scale-[0.97] transition-all"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {s.value}
              <span className="text-xs font-semibold text-gray-400 ml-0.5">{s.unit}</span>
            </p>
            <p className="text-[11px] text-gray-400 font-medium mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* やること */}
      <section>
        <div className="flex items-center gap-1.5 mb-2 px-0.5">
          <CalendarClock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-gray-800">やることリスト</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-amber-100/60">
            <p className="text-sm text-gray-400">直近の作業予定はありません 🎉</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <div
                key={t.id}
                className={`bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border ${
                  t.overdue ? "border-red-200" : "border-amber-100/60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    t.overdue ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {t.overdue ? <AlertTriangle className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.detail}</p>
                </div>
                {t.overdue && (
                  <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0">
                    要対応
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 進行中ライン */}
      <section>
        <button
          onClick={() => onNavigate("breeding")}
          className="w-full flex items-center justify-between mb-2 px-0.5"
        >
          <div className="flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-orange-600" />
            <h2 className="text-sm font-bold text-gray-800">進行中のブリードライン</h2>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300" />
        </button>
        {activeLines.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-amber-100/60">
            <p className="text-sm text-gray-400">進行中のラインはありません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeLines.map((line) => (
              <div
                key={line.id}
                className="bg-white rounded-2xl px-4 py-3 border border-amber-100/60 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-800">
                    {line.name}
                    <span className="text-xs font-medium text-gray-400 ml-1.5">{line.species}</span>
                  </p>
                  {line.setDate && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      セット投入 {formatDateShort(line.setDate)}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${LINE_STATUS_COLORS[line.status]}`}
                >
                  {LINE_STATUS_LABELS[line.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 大型候補 */}
      {topLarvae.length > 0 && (
        <section>
          <button
            onClick={() => onNavigate("larvae")}
            className="w-full flex items-center justify-between mb-2 px-0.5"
          >
            <div className="flex items-center gap-1.5">
              <Worm className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-800">大型候補 (体重上位)</h2>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
          <div className="space-y-2">
            {topLarvae.map((l, i) => (
              <div
                key={l.id}
                className="bg-white rounded-2xl px-4 py-3 border border-amber-100/60 flex items-center gap-3"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{l.code}</p>
                  <p className="text-xs text-gray-400 truncate">{l.species}</p>
                </div>
                <p className="text-base font-bold text-emerald-600 flex-shrink-0">
                  {latestWeight(l)}
                  <span className="text-xs font-semibold text-gray-400 ml-0.5">g</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
