"use client";

import { Fish, GitBranch, Newspaper, ShoppingBag } from "lucide-react";

export type TabId = "home" | "fish" | "lineage" | "news" | "shop";

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: "medaka" | "fish" | "lineage" | "news" | "shop" }[] = [
  { id: "home",    label: "ホーム",   icon: "medaka" },
  { id: "fish",    label: "魚管理",   icon: "fish" },
  { id: "lineage", label: "育種",     icon: "lineage" },
  { id: "news",    label: "最新情報", icon: "news" },
  { id: "shop",    label: "グッズ",   icon: "shop" },
];

function TabIcon({ icon, isActive }: { icon: typeof tabs[number]["icon"]; isActive: boolean }) {
  const cls = `w-5 h-5 transition-all ${isActive ? "scale-110" : "scale-100"}`;
  if (icon === "medaka") {
    return (
      <img
        src="/medaka/app-icon.png"
        alt=""
        className={`w-5 h-5 object-contain transition-all ${isActive ? "scale-110" : "scale-100 opacity-40"}`}
      />
    );
  }
  if (icon === "fish")    return <Fish        className={cls} />;
  if (icon === "lineage") return <GitBranch   className={cls} />;
  if (icon === "news")    return <Newspaper   className={cls} />;
  return                         <ShoppingBag className={cls} />;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
      <div className="glass border-t border-white/60 px-2 pb-safe">
        <div className="flex">
          {tabs.map(({ id, label, icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center py-3 gap-0.5 relative transition-all duration-200 min-h-[56px]"
              >
                {isActive && (
                  <span className="absolute top-1.5 w-8 h-1 bg-cyan-500 rounded-full" />
                )}
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-cyan-50 text-cyan-600" : "text-gray-400"
                  }`}
                >
                  <TabIcon icon={icon} isActive={isActive} />
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-cyan-600" : "text-gray-400"
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
