"use client";

import { BookOpen, Bug, GitBranch, Home, JapaneseYen, Worm } from "lucide-react";

export type KuwagataTabId = "home" | "adults" | "breeding" | "larvae" | "cost" | "articles";

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
  { id: "articles", label: "記事" },
];

function TabIcon({ id }: { id: KuwagataTabId }) {
  const props = { className: "w-[19px] h-[19px]", strokeWidth: 2 };
  if (id === "home")     return <Home        {...props} />;
  if (id === "adults")   return <Bug         {...props} />;
  if (id === "breeding") return <GitBranch   {...props} />;
  if (id === "larvae")   return <Worm        {...props} />;
  if (id === "cost")     return <JapaneseYen {...props} />;
  return                        <BookOpen    {...props} />;
}

export function KuwagataBottomNav({ activeTab, onChange }: KuwagataBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto">
      <div
        className="px-2 pb-safe"
        style={{
          background: "rgba(246, 239, 227, 0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid var(--kuwa-line)",
        }}
      >
        <div className="flex">
          {tabs.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex-1 flex flex-col items-center py-3 gap-1 transition-all duration-200 min-h-[58px]"
              >
                <div
                  className="px-2.5 py-1.5 rounded-xl transition-all duration-200"
                  style={
                    isActive
                      ? { background: "var(--kuwa-amber-soft)", color: "var(--kuwa-bark)" }
                      : { color: "var(--kuwa-ink-soft)", opacity: 0.65 }
                  }
                >
                  <TabIcon id={id} />
                </div>
                <span
                  className="font-maru text-[10px] font-bold transition-colors"
                  style={
                    isActive
                      ? { color: "var(--kuwa-bark)" }
                      : { color: "var(--kuwa-ink-soft)", opacity: 0.65 }
                  }
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
