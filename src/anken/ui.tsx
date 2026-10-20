"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { diffDays, fmtMD, todayISO } from "./date";
import { partyLabel, useAnken } from "./store";
import { CATEGORIES, WAIT_ALERT_DAYS } from "./templates";
import type { Category, Party, Task } from "./types";

// ── データの引き方 ──────────────────────────────

export function usePartyMap(): Record<string, Party> {
  const parties = useAnken((s) => s.parties);
  return useMemo(() => Object.fromEntries(parties.map((p) => [p.id, p])), [parties]);
}

export function useProjectMap() {
  const projects = useAnken((s) => s.projects);
  return useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p])), [projects]);
}

export const isOpen = (t: Task) => t.status !== "done";
export const isLate = (t: Task, today = todayISO()) => isOpen(t) && t.due < today;
export const waitDays = (t: Task, today = todayISO()) => diffDays(t.ballSince, today);

export const byDue = (a: Task, b: Task) => (a.due === b.due ? a.order - b.order : a.due < b.due ? -1 : 1);

// ── トースト ──────────────────────────────

export const useToast = create<{ msg: string | null; show: (m: string) => void }>((set) => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    msg: null,
    show: (msg) => {
      clearTimeout(timer);
      set({ msg });
      timer = setTimeout(() => set({ msg: null }), 2600);
    },
  };
});

// ── 見た目の部品 ──────────────────────────────

export const catBg: Record<Category, string> = {
  promo: "bg-ak-promo",
  service: "bg-ak-service",
  web: "bg-ak-web",
};

export function CategoryChip({ category, className }: { category: Category; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded px-1.5 text-[11px] font-bold leading-[18px] text-ak-sheet",
        catBg[category],
        className,
      )}
    >
      {CATEGORIES[category].short}
    </span>
  );
}

export function DueBadge({ due, done, className }: { due: string; done?: boolean; className?: string }) {
  const today = todayISO();
  const d = diffDays(today, due);
  const tone = done
    ? "border-ak-line text-ak-ink3"
    : d < 0
      ? "border-ak-late bg-ak-late-soft text-ak-late"
      : d <= 1
        ? "border-ak-ball text-ak-ball"
        : "border-ak-line text-ak-ink2";
  const label = !done && d === 0 ? "今日" : !done && d === 1 ? "明日" : fmtMD(due);
  return (
    <span
      className={cn(
        "tabular inline-block whitespace-nowrap rounded border px-1.5 font-mono text-[11px] leading-[18px]",
        tone,
        className,
      )}
      title={`期日 ${due}`}
    >
      {label}
    </span>
  );
}

export function WaitDays({ task }: { task: Task }) {
  const n = waitDays(task);
  return (
    <span
      className={cn(
        "tabular whitespace-nowrap font-mono text-[11px]",
        n >= WAIT_ALERT_DAYS ? "font-bold text-ak-late" : "text-ak-ink3",
      )}
    >
      {n === 0 ? "今日から" : `${n}日待ち`}
    </span>
  );
}

export function BallMark({ label, className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-bold text-ak-ball", className)}>
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-ak-ball" aria-hidden />
      {label}
    </span>
  );
}

export function Avatar({ party, size = 22 }: { party?: Party; size?: number }) {
  const external = party && party.kind !== "member";
  return (
    <span
      title={partyLabel(party)}
      style={{ width: size, height: size, fontSize: size * 0.48 }}
      className={cn(
        "inline-grid flex-none place-items-center rounded-full border bg-ak-wire font-bold text-ak-ink2",
        external ? "border-dashed border-ak-ball" : "border-ak-ink3",
      )}
    >
      {party?.short ?? "?"}
    </span>
  );
}

export const btn = {
  base: "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-[13px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
  primary: "border-ak-ink bg-ak-ink text-ak-sheet hover:opacity-90",
  secondary: "border-ak-ink bg-ak-sheet text-ak-ink hover:bg-ak-wire",
  ghost: "border-ak-line bg-ak-sheet font-medium text-ak-ink2 hover:border-ak-ink3 hover:text-ak-ink",
  danger: "border-ak-late bg-ak-sheet text-ak-late hover:bg-ak-late-soft",
};

export const inputCls =
  "w-full min-w-0 rounded-md border border-ak-line bg-ak-sheet px-2.5 py-1.5 text-[13px] text-ak-ink placeholder:text-ak-ink3 focus:border-ak-ink3 focus:outline-none";

export const panelCls = "rounded-lg border border-ak-line bg-ak-sheet";

export function SectionTitle({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="text-[14px] font-bold">{children}</h2>
      {aside && <div className="text-[12px] text-ak-ink3">{aside}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex overflow-hidden rounded-md border border-ak-line bg-ak-sheet">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "whitespace-nowrap px-2.5 py-1 text-[12px]",
            value === o.id ? "bg-ak-ink font-bold text-ak-sheet" : "text-ak-ink2 hover:bg-ak-wire",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** ボールを渡す相手を選ぶセレクト。課内・社内クライアント・外注先でグループ分け */
export function PartySelect({
  value,
  onChange,
  include = ["member", "client", "vendor"],
  className,
  id,
  ariaLabel,
  emptyLabel,
}: {
  value: string;
  onChange: (id: string) => void;
  include?: Party["kind"][];
  className?: string;
  id?: string;
  ariaLabel?: string;
  emptyLabel?: string;
}) {
  const parties = useAnken((s) => s.parties);
  const groups: { kind: Party["kind"]; label: string }[] = [
    { kind: "member", label: "営業企画課" },
    { kind: "client", label: "社内クライアント" },
    { kind: "vendor", label: "外注先" },
  ];
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(inputCls, "py-1", className)}
    >
      {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
      {groups
        .filter((g) => include.includes(g.kind))
        .map((g) => (
          <optgroup key={g.kind} label={g.label}>
            {parties
              .filter((p) => p.kind === g.kind)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {partyLabel(p)}
                </option>
              ))}
          </optgroup>
        ))}
    </select>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-[13px] text-ak-ink3">{children}</p>;
}
