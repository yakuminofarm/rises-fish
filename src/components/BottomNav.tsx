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
  { id: "lineage" as TabId, label: "血統", Icon: GitBranch },
  { id: "news" as TabId, label: "最新情報", Icon: Newspaper },
  { id: "shop" as TabId, label: "グッズ", Icon: ShoppingBag },
];

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 safe-area-bottom">
      <div className="flex max-w-md mx-auto">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
              activeTab === id ? "text-cyan-500" : "text-gray-400"
            }`}
          >
            <Icon className={`w-5 h-5 ${activeTab === id ? "text-cyan-500" : "text-gray-400"}`} />
            <span className={`text-[10px] font-medium ${activeTab === id ? "text-cyan-600" : "text-gray-400"}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
