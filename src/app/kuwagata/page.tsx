"use client";

import { useEffect, useState } from "react";
import { KuwagataBottomNav, KuwagataTabId } from "@/components/kuwagata/KuwagataBottomNav";
import { KuwagataHomeTab } from "@/components/kuwagata/tabs/KuwagataHomeTab";
import { AdultTab } from "@/components/kuwagata/tabs/AdultTab";
import { BreedingTab } from "@/components/kuwagata/tabs/BreedingTab";
import { LarvaTab } from "@/components/kuwagata/tabs/LarvaTab";
import { CostTab } from "@/components/kuwagata/tabs/CostTab";
import { ArticlesTab } from "@/components/kuwagata/tabs/ArticlesTab";
import { ForestBackdrop } from "@/components/kuwagata/ForestBackdrop";
import { KuwaAppIcon } from "@/components/kuwagata/KuwagataSVG";
import { FeedingReminder } from "@/components/kuwagata/FeedingReminder";
import { ReminderSheet } from "@/components/kuwagata/ReminderSheet";
import { BackupSheet } from "@/components/kuwagata/BackupSheet";
import { ServiceWorkerRegistrar } from "@/components/kuwagata/ServiceWorkerRegistrar";
import { Bell, DatabaseBackup } from "lucide-react";
import { ToastProvider, useToast } from "@/components/ui/Toast";

const TAB_TITLES: Record<KuwagataTabId, string> = {
  home: "くわらぼ",
  adults: "成虫管理",
  breeding: "ブリード管理",
  larvae: "育成管理 (幼虫・蛹)",
  cost: "収支管理",
  articles: "読みもの",
};

function StorageFullNotice() {
  const { showToast } = useToast();
  useEffect(() => {
    const onFull = () =>
      showToast("保存できませんでした。写真を何枚か外すと空きが作れます");
    window.addEventListener("kuwa-storage-full", onFull);
    return () => window.removeEventListener("kuwa-storage-full", onFull);
  }, [showToast]);
  return null;
}

export default function KuwagataPage() {
  const [activeTab, setActiveTab] = useState<KuwagataTabId>("home");
  const [showReminder, setShowReminder] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  return (
    <ToastProvider variant="kuwa">
      <StorageFullNotice />
      <FeedingReminder />
      <ServiceWorkerRegistrar />
      {/* 画面全体の地色 (共通bodyの色を上書き) */}
      <style>{`body { background: var(--kuwa-bg); }`}</style>
      <ForestBackdrop />
      <div className="min-h-screen w-full max-w-md mx-auto">
        <header
          className="sticky top-0 z-20 px-4 py-3.5 flex items-center gap-2.5"
          style={{
            background: "rgba(234, 217, 189, 0.9)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid var(--kuwa-line)",
          }}
        >
          <KuwaAppIcon size={36} />
          <h1 className="font-maru text-lg font-bold flex-1" style={{ color: "var(--kuwa-ink)" }}>
            {TAB_TITLES[activeTab]}
          </h1>
          <button
            onClick={() => setShowBackup(true)}
            aria-label="データの持ち出し"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
            style={{ background: "var(--kuwa-card)", color: "var(--kuwa-bark)", border: "1px solid var(--kuwa-line)" }}
          >
            <DatabaseBackup className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
          <button
            onClick={() => setShowReminder(true)}
            aria-label="エサやりのお知らせ設定"
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 active:scale-90 transition-all"
            style={{ background: "var(--kuwa-card)", color: "var(--kuwa-bark)", border: "1px solid var(--kuwa-line)" }}
          >
            <Bell className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
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

        {showReminder && <ReminderSheet onClose={() => setShowReminder(false)} />}
        {showBackup && <BackupSheet onClose={() => setShowBackup(false)} />}
      </div>
    </ToastProvider>
  );
}
