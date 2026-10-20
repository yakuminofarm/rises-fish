"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, fmtMD, maxISO, todayISO } from "../date";
import type { NewProjectInput } from "../store";
import { useAnken } from "../store";
import { CATEGORIES, CATEGORY_ORDER, PRIORITIES, TEMPLATES, type TemplateStep } from "../templates";
import type { Category, Priority } from "../types";
import { btn, inputCls, PartySelect } from "../ui";

/** 受付箱からの案件化と、案件の直接作成で共通のフォーム */
export function ProjectForm({
  initial,
  submitLabel,
  onSubmit,
  extraActions,
}: {
  initial: Partial<NewProjectInput>;
  submitLabel: string;
  onSubmit: (input: NewProjectInput) => void;
  extraActions?: React.ReactNode;
}) {
  const me = useAnken((s) => s.currentUserId);
  const today = todayISO();
  const [title, setTitle] = useState(initial.title ?? "");
  const [category, setCategory] = useState<Category>(initial.category ?? "promo");
  const [ownerId, setOwnerId] = useState(initial.ownerId ?? me);
  const [clientId, setClientId] = useState(initial.clientId ?? "");
  const [vendorId, setVendorId] = useState(initial.vendorId ?? "");
  const [due, setDue] = useState(initial.due ?? addDays(today, 30));
  const [priority, setPriority] = useState<Priority>(initial.priority ?? "important");
  const [useTemplate, setUseTemplate] = useState(initial.useTemplate ?? true);

  // テンプレートを展開したときの期日をその場で見せる
  const preview = TEMPLATES[category].reduce<(TemplateStep & { due: string })[]>((acc, s) => {
    const prev = acc.length ? acc[acc.length - 1].due : today;
    return [...acc, { ...s, due: maxISO(prev, addDays(due, -s.before)) }];
  }, []);

  const field = "grid grid-cols-1 gap-1 sm:grid-cols-[84px_minmax(0,1fr)] sm:items-center sm:gap-3";
  const label = "text-[12px] text-ak-ink3";

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim() || !due) return;
        onSubmit({
          title: title.trim(),
          category,
          ownerId,
          clientId: clientId || undefined,
          vendorId: vendorId || undefined,
          due,
          priority,
          useTemplate,
          requestId: initial.requestId,
        });
      }}
    >
      <label className={field}>
        <span className={label}>案件名</span>
        <input id="pf-title" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <div className={field}>
        <span className={label}>種別</span>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="種別">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-[12.5px]",
                category === c ? "border-ak-ink bg-ak-ink font-bold text-ak-sheet" : "border-ak-line text-ak-ink2",
              )}
            >
              {CATEGORIES[c].label}
            </button>
          ))}
        </div>
      </div>
      <label className={field}>
        <span className={label}>納期</span>
        <input id="pf-due" type="date" className={inputCls} value={due} min={today} onChange={(e) => setDue(e.target.value)} />
      </label>
      <div className={field}>
        <span className={label}>工程</span>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-1.5 text-[12.5px] text-ak-ink2">
            <input id="pf-tpl" type="checkbox" checked={useTemplate} onChange={(e) => setUseTemplate(e.target.checked)} />
            テンプレートの工程をタスクとして作る
          </label>
          {useTemplate && (
            <ol className="flex flex-wrap items-center gap-1 text-[11.5px]">
              {preview.map((s, i) => (
                <li key={s.name} className="flex items-center gap-1">
                  {i > 0 && <span className="text-ak-ink3">→</span>}
                  <span
                    className={cn(
                      "rounded border px-1.5 leading-5",
                      s.side === "us" ? "border-ak-line" : "border-dashed border-ak-ball",
                    )}
                  >
                    {s.name} <span className="tabular font-mono text-ak-ink3">{fmtMD(s.due)}</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      <label className={field}>
        <span className={label}>責任者</span>
        <PartySelect id="pf-owner" value={ownerId} onChange={setOwnerId} include={["member"]} />
      </label>
      <label className={field}>
        <span className={label}>社内クライアント</span>
        <PartySelect id="pf-client" value={clientId} onChange={setClientId} include={["client"]} emptyLabel="なし" />
      </label>
      <label className={field}>
        <span className={label}>外注先</span>
        <PartySelect id="pf-vendor" value={vendorId} onChange={setVendorId} include={["vendor"]} emptyLabel="なし" />
      </label>
      <div className={field}>
        <span className={label}>優先度</span>
        <div className="grid max-w-[320px] grid-cols-2 gap-1" role="radiogroup" aria-label="優先度">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={priority === p.id}
              onClick={() => setPriority(p.id)}
              className={cn(
                "rounded border py-1 text-[12px]",
                priority === p.id ? "border-ak-ink bg-ak-ink font-bold text-ak-sheet" : "border-ak-line text-ak-ink3",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-end gap-2">
        {extraActions}
        <button type="submit" className={cn(btn.base, btn.primary)} disabled={!title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
