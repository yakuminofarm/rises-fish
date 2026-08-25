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
  home: "くわらぼ",
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
      {/* 丸ゴシック見出し用 Web フォント */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700&display=swap"
      />
      {/* 画面全体の地色 (共通bodyの色を上書き) */}
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "var(--kuwa-bg)" }}
        aria-hidden
      />
      <div className="min-h-screen max-w-md mx-auto" style={{ background: "var(--kuwa-bg)" }}>
        <header
          className="sticky top-0 z-20 px-5 py-3.5 flex items-center gap-3"
          style={{
            background: "rgba(246, 239, 227, 0.85)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--kuwa-line)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: "var(--kuwa-amber-soft)" }}
          >
            🪲
          </div>
          <h1 className="font-maru text-lg font-bold" style={{ color: "var(--kuwa-ink)" }}>
            {TAB_TITLES[activeTab]}
          </h1>
        </header>

        <main className="px-4 pt-5 pb-24">
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
