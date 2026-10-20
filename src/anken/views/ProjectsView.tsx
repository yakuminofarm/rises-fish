"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectForm } from "../components/ProjectForm";
import { todayISO } from "../date";
import { partyLabel, useAnken } from "../store";
import { CATEGORIES, CATEGORY_ORDER, PRIORITIES } from "../templates";
import type { Category } from "../types";
import { Avatar, btn, byDue, CategoryChip, DueBadge, EmptyNote, isLate, panelCls, Segmented, usePartyMap, useToast } from "../ui";

export function ProjectsView() {
  const projects = useAnken((s) => s.projects);
  const tasks = useAnken((s) => s.tasks);
  const createProject = useAnken((s) => s.createProject);
  const parties = usePartyMap();
  const toast = useToast((s) => s.show);
  const router = useRouter();
  const [cat, setCat] = useState<Category | "all">("all");
  const [state, setState] = useState<"active" | "done">("active");
  const [creating, setCreating] = useState(false);
  const today = todayISO();

  const rows = useMemo(
    () =>
      projects
        .filter((p) => (state === "done" ? p.done : !p.done) && (cat === "all" || p.category === cat))
        .sort((a, b) => (a.due < b.due ? -1 : 1))
        .map((p) => {
          const ts = tasks.filter((t) => t.projectId === p.id);
          const open = ts.filter((t) => t.status !== "done").sort(byDue);
          return {
            p,
            total: ts.length,
            done: ts.length - open.length,
            next: open[0],
            waiting: open.filter((t) => t.status === "waiting").length,
            late: open.filter((t) => isLate(t, today)).length,
          };
        }),
    [projects, tasks, cat, state, today],
  );

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold">案件一覧</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="種別"
            value={cat}
            onChange={setCat}
            options={[{ id: "all" as const, label: "すべて" }, ...CATEGORY_ORDER.map((c) => ({ id: c, label: CATEGORIES[c].label }))]}
          />
          <Segmented
            label="状態"
            value={state}
            onChange={setState}
            options={[
              { id: "active", label: "進行中" },
              { id: "done", label: "完了" },
            ]}
          />
          <button type="button" className={cn(btn.base, btn.secondary)} onClick={() => setCreating(true)}>
            案件を直接作る
          </button>
        </div>
      </div>

      <div className={cn(panelCls, "divide-y divide-ak-wire2")}>
        {rows.length === 0 && <EmptyNote>該当する案件はありません。</EmptyNote>}
        {rows.map(({ p, total, done, next, waiting, late }) => {
          const client = p.clientId ? parties[p.clientId] : undefined;
          return (
            <Link
              key={p.id}
              href={`/anken/projects/${p.id}`}
              className="grid grid-cols-1 gap-x-4 gap-y-1.5 px-4 py-3 hover:bg-ak-wire/60 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_120px_96px] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CategoryChip category={p.category} />
                  <span className="text-[11px] text-ak-ink3">{PRIORITIES.find((x) => x.id === p.priority)?.label}</span>
                </div>
                <div className="truncate text-[14px] font-bold">{p.title}</div>
                <div className="flex items-center gap-1.5 text-[11.5px] text-ak-ink3">
                  <Avatar party={parties[p.ownerId]} size={16} />
                  責任者 {parties[p.ownerId]?.name}
                  {client && <> ・ 依頼元 {partyLabel(client)}</>}
                </div>
              </div>
              <div className="min-w-0 text-[12px] text-ak-ink2">
                {next ? (
                  <>
                    <span className="text-ak-ink3">次：</span>
                    {next.title}
                  </>
                ) : (
                  <span className="text-ak-ink3">未完了のタスクなし</span>
                )}
                <div className="flex gap-2 text-[11.5px]">
                  {waiting > 0 && <span className="text-ak-ball">待ち {waiting}</span>}
                  {late > 0 && <span className="text-ak-late">期限切れ {late}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ak-wire">
                  <span className="block h-full bg-ak-ok" style={{ width: total ? `${(done / total) * 100}%` : 0 }} />
                </span>
                <span className="tabular font-mono text-[11px] text-ak-ink3">
                  {done}/{total}
                </span>
              </div>
              <div className="md:text-right">
                <span className="mr-1 text-[11px] text-ak-ink3">納期</span>
                <DueBadge due={p.due} done={p.done} />
              </div>
            </Link>
          );
        })}
      </div>

      <Dialog.Root open={creating} onOpenChange={setCreating}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Dialog.Content className="anken fixed left-1/2 top-[5vh] z-50 max-h-[90vh] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 overflow-y-auto rounded-xl border border-ak-line bg-ak-sheet p-5 shadow-xl">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <Dialog.Title className="text-[16px] font-bold">案件を直接作る</Dialog.Title>
                <Dialog.Description className="text-[12.5px] text-ak-ink3">
                  受付箱を通さずに案件を作ります。依頼が来た場合は受付箱からの案件化がおすすめです。
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded p-1 text-ak-ink3 hover:bg-ak-wire" aria-label="閉じる">
                <X size={18} />
              </Dialog.Close>
            </div>
            <ProjectForm
              initial={{}}
              submitLabel="作成する"
              onSubmit={(input) => {
                const id = createProject(input);
                setCreating(false);
                toast("案件を作成しました");
                router.push(`/anken/projects/${id}`);
              }}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
