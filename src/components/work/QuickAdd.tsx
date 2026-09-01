"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import { createTaskAction } from "@/app/work/actions";
import { TASK_CATEGORIES } from "@/lib/work/types";

/** AI を挟まず、自分で項目を決めて入れたいとき用 */
export function QuickAdd({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm text-slate-500 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
      >
        <Plus className="h-4 w-4" />
        自分で入力して追加
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createTaskAction(formData);
        formRef.current?.reset();
        setOpen(false);
      }}
      className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3"
    >
      <input
        name="title"
        required
        maxLength={120}
        autoFocus
        placeholder="やること"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">期限</span>
          <input
            type="date"
            name="dueDate"
            min="2020-01-01"
            defaultValue={today}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">
            見積り（分）
          </span>
          <input
            type="number"
            name="estimateMin"
            min={5}
            max={1440}
            step={5}
            placeholder="30"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">分類</span>
          <select
            name="category"
            defaultValue="その他"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
          >
            {TASK_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">優先度</span>
          <select
            name="priority"
            defaultValue="mid"
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
          >
            <option value="high">重要</option>
            <option value="mid">通常</option>
            <option value="low">後で</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-[11px] text-slate-500">繰り返し</span>
        <select
          name="repeat"
          defaultValue="none"
          className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-teal-500"
        >
          <option value="none">なし</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
        </select>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
        >
          追加
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
        >
          やめる
        </button>
      </div>
    </form>
  );
}
