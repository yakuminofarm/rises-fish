"use client";

import { useState, useTransition } from "react";
import { Check, Clock, MoreHorizontal, Trash2 } from "lucide-react";

import {
  completeTaskAction,
  deleteTaskAction,
  postponeAction,
  setStatusAction,
} from "@/app/work/actions";
import { diffDays, relativeLabel } from "@/lib/work/date";
import { Task } from "@/lib/work/types";
import {
  CATEGORY_CLASS,
  PRIORITY_CLASS,
  PRIORITY_LABEL,
  dueClass,
  formatMinutes,
} from "./taskStyles";

interface TaskItemProps {
  task: Task;
  today: string;
  /** 今日の作戦で表示する理由タグ */
  reasons?: string[];
  /** 通し番号（今日の作戦のみ） */
  index?: number;
}

export function TaskItem({ task, today, reasons, index }: TaskItemProps) {
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);

  const daysLeft = task.dueDate ? diffDays(task.dueDate, today) : null;
  const isDone = task.status === "done";
  const isDropped = task.status === "dropped";

  const run = (fn: () => Promise<void>) => {
    setMenuOpen(false);
    startTransition(async () => {
      await fn();
    });
  };

  return (
    <div
      className={`group relative flex gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
        isDone || isDropped
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white hover:border-teal-300"
      } ${pending ? "opacity-50" : ""}`}
    >
      {index !== undefined && (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
          {index}
        </span>
      )}

      <button
        type="button"
        aria-label={isDone ? "完了済み" : "完了にする"}
        disabled={isDone || pending}
        onClick={() => run(() => completeTaskAction(task.id))}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
          isDone
            ? "border-teal-500 bg-teal-500 text-white"
            : "border-slate-300 hover:border-teal-500 hover:bg-teal-50"
        }`}
      >
        {isDone && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            isDone || isDropped
              ? "text-slate-400 line-through"
              : "font-medium text-slate-800"
          }`}
        >
          {task.title}
        </p>

        {task.detail && (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
            {task.detail}
          </p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span
            className={`rounded border px-1.5 py-0.5 ${
              CATEGORY_CLASS[task.category] ?? CATEGORY_CLASS["その他"]
            }`}
          >
            {task.category}
          </span>

          {task.priority !== "mid" && (
            <span
              className={`rounded border px-1.5 py-0.5 ${PRIORITY_CLASS[task.priority]}`}
            >
              {PRIORITY_LABEL[task.priority]}
            </span>
          )}

          <span className={dueClass(daysLeft)}>
            {task.dueDate ? relativeLabel(task.dueDate, today) : "期限なし"}
          </span>

          {task.estimateMin !== null && (
            <span className="flex items-center gap-0.5 text-slate-400">
              <Clock className="h-3 w-3" />
              {formatMinutes(task.estimateMin)}
            </span>
          )}

          {task.status === "doing" && (
            <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700">
              進行中
            </span>
          )}

          {task.repeat !== "none" && (
            <span className="text-slate-400">繰り返し</span>
          )}
        </div>

        {reasons && reasons.length > 0 && (
          <p className="mt-1.5 text-xs text-teal-700">{reasons.join("・")}</p>
        )}
      </div>

      {!isDone && (
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="操作メニュー"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              {/* 外側クリックで閉じる */}
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {task.status !== "doing" && (
                  <MenuButton
                    onClick={() => run(() => setStatusAction(task.id, "doing"))}
                  >
                    着手する
                  </MenuButton>
                )}
                <MenuButton onClick={() => run(() => postponeAction(task.id, 1))}>
                  明日に回す
                </MenuButton>
                <MenuButton onClick={() => run(() => postponeAction(task.id, 7))}>
                  1週間後に回す
                </MenuButton>
                <MenuButton
                  onClick={() => run(() => setStatusAction(task.id, "dropped"))}
                >
                  やらないことにする
                </MenuButton>
                <MenuButton
                  danger
                  onClick={() => run(() => deleteTaskAction(task.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  削除
                </MenuButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 px-3 py-1.5 text-left text-xs transition-colors hover:bg-slate-50 ${
        danger ? "text-rose-600" : "text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
