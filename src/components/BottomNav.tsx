"use client";

import { Fish, Home, GitBranch, Newspaper, ShoppingBag } from "lucide-react";

export type TabId = "home" | "fish" | "lineage" | "news" | "shop";

interface BottomNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const tabs = [
  { id: "home" as TabId, label: "ホーム", Icon: Home },
  { id: "fish" as TabId, label: "魚管理", Icon: Fish },
  { id: "lineage" as TabId, label: "育種", Icon: GitBranch },
  { id: "news" as TabId, label: "最新情報", Icon: Newspaper },
  { id: "shop" as TabId, label: "グッズ", Icon: ShoppingBag },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
      {/* すりガラス背景 */}
      <div className="glass border-t border-white/60 px-2 pb-safe">
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center py-2.5 gap-0.5 relative transition-all duration-200"
              >
                {/* アクティブインジケーター（ピル） */}
                {isActive && (
                  <span className="absolute top-1.5 w-8 h-1 bg-cyan-500 rounded-full" />
                )}
                <div
                  className={`p-1.5 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-cyan-50 text-cyan-600" : "text-gray-400"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-all ${isActive ? "scale-110" : "scale-100"}`} />
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
