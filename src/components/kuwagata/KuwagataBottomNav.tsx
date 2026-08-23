"use client";

import { Bug, GitBranch, Home, JapaneseYen, Worm } from "lucide-react";

export type KuwagataTabId = "home" | "adults" | "breeding" | "larvae" | "cost";

interface KuwagataBottomNavProps {
  activeTab: KuwagataTabId;
  onChange: (tab: KuwagataTabId) => void;
}

const tabs: { id: KuwagataTabId; label: string }[] = [
  { id: "home",     label: "ホーム" },
  { id: "adults",   label: "成虫" },
  { id: "breeding", label: "ブリード" },
  { id: "larvae",   label: "幼虫" },
  { id: "cost",     label: "収支" },
];

function TabIcon({ id, isActive }: { id: KuwagataTabId; isActive: boolean }) {
  const cls = `w-5 h-5 transition-all ${isActive ? "scale-110" : "scale-100"}`;
  if (id === "home")     return <Home        className={cls} />;
  if (id === "adults")   return <Bug         className={cls} />;
  if (id === "breeding") return <GitBranch   className={cls} />;
  if (id === "larvae")   return <Worm        className={cls} />;
  return                        <JapaneseYen className={cls} />;
}

export function KuwagataBottomNav({ activeTab, onChange }: KuwagataBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
      <div className="glass border-t border-white/60 px-2 pb-safe">
        <div className="flex">
          {tabs.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-all duration-200 min-h-[56px]"
              >
                {isActive && (
                  <span className="absolute top-1.5 w-8 h-1 bg-amber-600 rounded-full" />
                )}
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-amber-50 text-amber-700" : "text-gray-400"
                  }`}
                >
                  <TabIcon id={id} isActive={isActive} />
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-amber-700" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
