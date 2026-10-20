"use client";

import { CalendarRange, Columns3, FolderKanban, House, Inbox, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAnken } from "../store";
import { useToast } from "../ui";
import { QuickAddDialog } from "./QuickAddDialog";

const NAV = [
  { href: "/anken", label: "ホーム", icon: House },
  { href: "/anken/inbox", label: "受付箱", icon: Inbox },
  { href: "/anken/board", label: "カンバン", icon: Columns3 },
  { href: "/anken/timeline", label: "タイムライン", icon: CalendarRange },
  { href: "/anken/projects", label: "案件一覧", icon: FolderKanban },
];

function isActive(pathname: string, href: string) {
  return href === "/anken" ? pathname === "/anken" : pathname.startsWith(href);
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [adding, setAdding] = useState(false);
  const inboxCount = useAnken((s) => s.requests.filter((r) => r.state === "new").length);
  const toast = useToast((s) => s.msg);

  return (
    <div className="anken min-h-screen w-full md:grid md:grid-cols-[208px_minmax(0,1fr)]">
      {/* PC: 左のナビ */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r border-ak-line bg-ak-wire px-3 py-4 md:flex">
        <Link href="/anken" className="px-2 pb-3 text-[15px] font-bold">
          案件ボード
          <span className="ml-1.5 rounded bg-ak-accent-soft px-1.5 py-0.5 align-middle text-[10px] font-bold text-ak-accent">
            試作
          </span>
        </Link>
        <button type="button" onClick={() => setAdding(true)} className="mb-3 flex items-center justify-center gap-1.5 rounded-md bg-ak-ink py-2 text-[13px] font-bold text-ak-sheet hover:opacity-90">
          <Plus size={16} /> 依頼を登録
        </button>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13.5px]",
              isActive(pathname, href)
                ? "border border-ak-line bg-ak-sheet font-bold text-ak-ink"
                : "border border-transparent text-ak-ink2 hover:bg-ak-sheet/60",
            )}
          >
            <Icon size={16} className="flex-none" />
            <span className="flex-1">{label}</span>
            {href === "/anken/inbox" && inboxCount > 0 && (
              <span className="tabular rounded-full bg-ak-ink px-1.5 font-mono text-[11px] text-ak-sheet">{inboxCount}</span>
            )}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <Link
            href="/anken/settings"
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13.5px]",
              isActive(pathname, "/anken/settings") ? "border border-ak-line bg-ak-sheet font-bold" : "text-ak-ink2 hover:bg-ak-sheet/60",
            )}
          >
            <Settings size={16} /> 設定・取り込み
          </Link>
          <p className="px-2.5 text-[11px] leading-relaxed text-ak-ink3">
            試作版です。データはこのブラウザの中だけに保存されます。
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* スマホ: 上のバー */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ak-line bg-ak-sheet/95 px-4 py-2.5 backdrop-blur md:hidden">
          <Link href="/anken" className="text-[15px] font-bold">
            案件ボード
            <span className="ml-1.5 rounded bg-ak-accent-soft px-1.5 py-0.5 align-middle text-[10px] font-bold text-ak-accent">試作</span>
          </Link>
          <Link href="/anken/settings" aria-label="設定・取り込み" className="rounded p-1.5 text-ak-ink2 hover:bg-ak-wire">
            <Settings size={18} />
          </Link>
        </header>

        <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-7 md:pb-10 md:pt-6">{children}</main>

        {/* スマホ: 下のタブと追加ボタン */}
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="依頼を登録"
          className="fixed bottom-[76px] right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-ak-ink text-ak-sheet shadow-lg md:hidden"
        >
          <Plus size={22} />
        </button>
        <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ak-line bg-ak-sheet pb-[env(safe-area-inset-bottom)] md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 text-[10px]",
                isActive(pathname, href) ? "font-bold text-ak-ink" : "text-ak-ink3",
              )}
            >
              <Icon size={19} />
              {label}
              {href === "/anken/inbox" && inboxCount > 0 && (
                <span className="absolute right-[22%] top-1 rounded-full bg-ak-ball px-1 font-mono text-[9px] text-ak-sheet">{inboxCount}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <QuickAddDialog open={adding} onOpenChange={setAdding} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 md:bottom-6">
        {toast && (
          <div className="anken rounded-lg bg-ak-ink px-4 py-2 text-[13px] font-medium text-ak-sheet shadow-lg">{toast}</div>
        )}
      </div>
    </div>
  );
}
