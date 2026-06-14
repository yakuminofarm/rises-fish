"use client";

import { useState } from "react";
import { BottomNav, TabId } from "@/components/BottomNav";
import { HomeTab } from "@/components/tabs/HomeTab";
import { FishTab } from "@/components/tabs/FishTab";
import { LineageTab } from "@/components/tabs/LineageTab";
import { NewsTab } from "@/components/tabs/NewsTab";
import { ShopTab } from "@/components/tabs/ShopTab";

const TAB_TITLES: Record<TabId, string> = {
  home: "めだか手帳",
  fish: "魚管理",
  lineage: "育種管理",
  news: "最新情報",
  shop: "おすすめグッズ",
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const isHome = activeTab === "home";

  return (
    <div className="min-h-screen bg-[#f0f9ff] max-w-md mx-auto">
      {/* ヘッダー: ホームは非表示（ヒーローに統合）、他タブは表示 */}
      {!isHome && (
        <header className="sticky top-0 z-20 glass border-b border-white/60 px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-cyan-200">
            <span className="text-base">🐟</span>
          </div>
          <h1 className="text-base font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
        </header>
      )}

      <main className={`${isHome ? "" : "px-4 pt-4"} pb-24`}>
        {activeTab === "home" && <HomeTab />}
        {activeTab === "fish" && <FishTab />}
        {activeTab === "lineage" && <LineageTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "shop" && <ShopTab />}
      </main>

      <BottomNav activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
