"use client";

import { useState } from "react";
import { KuwagataBottomNav, KuwagataTabId } from "@/components/kuwagata/KuwagataBottomNav";
import { KuwagataHomeTab } from "@/components/kuwagata/tabs/KuwagataHomeTab";
import { AdultTab } from "@/components/kuwagata/tabs/AdultTab";
import { BreedingTab } from "@/components/kuwagata/tabs/BreedingTab";
import { LarvaTab } from "@/components/kuwagata/tabs/LarvaTab";
import { CostTab } from "@/components/kuwagata/tabs/CostTab";
import { ArticlesTab } from "@/components/kuwagata/tabs/ArticlesTab";
import { ToastProvider } from "@/components/ui/Toast";

const TAB_TITLES: Record<KuwagataTabId, string> = {
  home: "クワガタ手帳",
  adults: "成虫管理",
  breeding: "ブリード管理",
  larvae: "幼虫管理",
  cost: "収支管理",
  articles: "読みもの",
};

export default function KuwagataPage() {
  const [activeTab, setActiveTab] = useState<KuwagataTabId>("home");

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fbf7ef] max-w-md mx-auto">
        <header className="sticky top-0 z-20 glass border-b border-white/60 px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-100 text-lg">
            🪲
          </div>
          <h1 className="text-base font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
        </header>

        <main className="px-4 pt-4 pb-24">
          {activeTab === "home" && (
            <KuwagataHomeTab onNavigate={setActiveTab} />
          )}
          {activeTab === "adults" && <AdultTab />}
          {activeTab === "breeding" && <BreedingTab />}
          {activeTab === "larvae" && <LarvaTab />}
          {activeTab === "cost" && <CostTab />}
          {activeTab === "articles" && <ArticlesTab />}
        </main>

        <KuwagataBottomNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
    </ToastProvider>
  );
}
