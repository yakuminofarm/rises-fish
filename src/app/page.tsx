"use client";

import { useState } from "react";
import { BottomNav, TabId } from "@/components/BottomNav";
import { HomeTab } from "@/components/tabs/HomeTab";
import { FishTab } from "@/components/tabs/FishTab";
import { LineageTab } from "@/components/tabs/LineageTab";
import { NewsTab } from "@/components/tabs/NewsTab";
import { ShopTab } from "@/components/tabs/ShopTab";

const TAB_TITLES: Record<TabId, string> = {
  home: "メダカの里",
  fish: "魚管理",
  lineage: "血統・チャート",
  news: "最新情報",
  shop: "おすすめグッズ",
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">🐟</span>
        </div>
        <h1 className="text-base font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
      </header>

      <main className="px-4 pt-4 pb-24">
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
