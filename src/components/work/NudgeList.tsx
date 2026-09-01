"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Bell } from "lucide-react";

import {
  completeTaskAction,
  postponeAction,
  setStatusAction,
} from "@/app/work/actions";
import { Nudge } from "@/lib/work/types";
import { NUDGE_STYLE } from "./taskStyles";

const VISIBLE_DEFAULT = 4;

/**
 * リマインドを自分で組めない人のための「向こうから声をかける」欄。
 * 見るだけで終わらないよう、その場で片付けられる操作を並べる。
 */
export function NudgeList({ nudges }: { nudges: Nudge[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? nudges : nudges.slice(0, VISIBLE_DEFAULT);

  if (nudges.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">
            気になっている項目はありません。
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <h2 className="text-sm font-bold text-amber-900">
          気になっていること
          <span className="ml-2 text-xs font-normal text-amber-700">
            {nudges.length}件
          </span>
        </h2>
      </div>

      <ul className="space-y-2">
        {shown.map((nudge) => (
          <NudgeRow key={`${nudge.kind}-${nudge.taskId}`} nudge={nudge} />
        ))}
      </ul>

      {nudges.length > VISIBLE_DEFAULT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-xs font-medium text-amber-700 hover:underline"
        >
          {expanded
            ? "たたむ"
            : `他 ${nudges.length - VISIBLE_DEFAULT} 件を表示`}
        </button>
      )}
    </section>
  );
}

function NudgeRow({ nudge }: { nudge: Nudge }) {
  const [pending, startTransition] = useTransition();
  const style = NUDGE_STYLE[nudge.kind];

  const run = (fn: () => Promise<void>) => {
    startTransition(async () => {
      await fn();
    });
  };

  return (
    <li
      className={`rounded-xl border border-amber-200 bg-white px-3 py-2.5 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <span
          className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-white ${style.className}`}
        >
          {style.label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">
            {nudge.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{nudge.message}</p>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
        <ActionChip
          onClick={() => run(() => completeTaskAction(nudge.taskId))}
          primary
        >
          完了にする
        </ActionChip>
        <ActionChip onClick={() => run(() => postponeAction(nudge.taskId, 1))}>
          明日に回す
        </ActionChip>
        <ActionChip
          onClick={() => run(() => setStatusAction(nudge.taskId, "dropped"))}
        >
          やらない
        </ActionChip>
      </div>
    </li>
  );
}

function ActionChip({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        primary
          ? "bg-teal-600 text-white hover:bg-teal-700"
          : "border border-slate-300 text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
