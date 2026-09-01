"use client";

import { useTransition } from "react";

import { setCapacityAction } from "@/app/work/actions";
import { formatMinutes } from "./taskStyles";

const CHOICES = [120, 180, 240, 300, 360, 480];

/** 今日どれくらい作業に充てられるか。作戦の分量がこれで決まる */
export function CapacityControl({ value }: { value: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`flex items-center gap-1.5 ${pending ? "opacity-50" : ""}`}>
      <span className="text-[11px] text-slate-400">今日使える時間</span>
      <select
        value={value}
        disabled={pending}
        aria-label="1日に使える作業時間"
        onChange={(event) => {
          const next = Number(event.target.value);
          startTransition(async () => {
            await setCapacityAction(next);
          });
        }}
        className="rounded-lg border border-slate-300 px-2 py-1 text-xs outline-none focus:border-teal-500"
      >
        {CHOICES.map((minutes) => (
          <option key={minutes} value={minutes}>
            {formatMinutes(minutes)}
          </option>
        ))}
      </select>
    </div>
  );
}
