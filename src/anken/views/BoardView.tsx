"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { todayISO } from "../date";
import { useAnken } from "../store";
import { CATEGORIES, CATEGORY_ORDER, STATUSES } from "../templates";
import type { Category, Task, TaskStatus } from "../types";
import { Avatar, BallMark, btn, byDue, DueBadge, inputCls, PartySelect, usePartyMap, useProjectMap, WaitDays } from "../ui";

const DONE_LIMIT = 8;

const topBorder: Record<Category, string> = {
  promo: "border-t-ak-promo",
  service: "border-t-ak-service",
  web: "border-t-ak-web",
};

export function BoardView({ embedded = false }: { embedded?: boolean }) {
  const tasks = useAnken((s) => s.tasks);
  const parties = useAnken((s) => s.parties);
  const me = useAnken((s) => s.currentUserId);
  const moveTask = useAnken((s) => s.moveTask);
  const projects = useProjectMap();
  const [cats, setCats] = useState<Category[]>([]);
  const [assignee, setAssignee] = useState("");
  const [onlyMyBall, setOnlyMyBall] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [handoff, setHandoff] = useState<Task | null>(null);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        const p = projects[t.projectId];
        if (!p || p.done) return false;
        if (cats.length && !cats.includes(p.category)) return false;
        if (assignee && t.assigneeId !== assignee) return false;
        if (onlyMyBall && t.ballId !== me) return false;
        return true;
      }),
    [tasks, projects, cats, assignee, onlyMyBall, me],
  );

  const changeStatus = (task: Task, status: TaskStatus) => {
    if (status === "waiting") setHandoff(task);
    else moveTask(task.id, status);
  };

  const toggleCat = (c: Category) => setCats((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <div className={cn("flex flex-col gap-4", !embedded && "mx-auto max-w-[1400px]")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {!embedded && <h1 className="text-[20px] font-bold">カンバン</h1>}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setCats([])}
            className={cn("rounded px-2 text-[12px] leading-6", cats.length === 0 ? "bg-ak-ink font-bold text-ak-sheet" : "border border-ak-line text-ak-ink2")}
          >
            すべて
          </button>
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cats.includes(c)}
              onClick={() => toggleCat(c)}
              className={cn(
                "rounded px-2 text-[12px] leading-6",
                cats.includes(c) ? "bg-ak-ink font-bold text-ak-sheet" : "border border-ak-line text-ak-ink2",
              )}
            >
              {CATEGORIES[c].label}
            </button>
          ))}
          <select id="board-assignee" aria-label="担当で絞り込み" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={cn(inputCls, "w-auto py-0.5 text-[12px]")}>
            <option value="">担当：全員</option>
            {parties
              .filter((p) => p.kind === "member")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  担当：{p.name}
                </option>
              ))}
          </select>
          <label className="flex items-center gap-1.5 text-[12px] text-ak-ink2">
            <input id="board-myball" type="checkbox" checked={onlyMyBall} onChange={(e) => setOnlyMyBall(e.target.checked)} className="accent-[var(--ak-ball)]" />
            自分がボールのものだけ
          </label>
        </div>
      </div>
      <p className="-mt-2 text-[12px] text-ak-ink3">
        カードをドラッグして列を移動できます。スマホでは各カード下の選択欄で変更します。
      </p>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
        <div className="grid min-w-[1080px] grid-cols-5 items-start gap-3">
          {STATUSES.map((col) => {
            let list = filtered.filter((t) => t.status === col.id);
            list = col.id === "done" ? list.sort((a, b) => ((a.doneAt ?? "") < (b.doneAt ?? "") ? 1 : -1)) : list.sort(byDue);
            const hidden = col.id === "done" ? Math.max(0, list.length - DONE_LIMIT) : 0;
            if (hidden) list = list.slice(0, DONE_LIMIT);
            return (
              <section
                key={col.id}
                aria-label={col.label}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverCol(col.id);
                }}
                onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
                onDrop={(e) => {
                  e.preventDefault();
                  const t = tasks.find((x) => x.id === dragId);
                  if (t) changeStatus(t, col.id);
                  setDragId(null);
                  setOverCol(null);
                }}
                className={cn(
                  "flex min-h-[200px] flex-col gap-2 rounded-lg p-2.5 transition-colors",
                  col.id === "waiting" ? "bg-ak-ball-soft" : "bg-ak-wire",
                  overCol === col.id && "outline outline-2 outline-ak-accent",
                )}
              >
                <h2 className="flex items-center justify-between px-0.5 text-[12.5px] font-bold">
                  {col.label}
                  <span className="tabular font-mono font-normal text-ak-ink3">{list.length + hidden}</span>
                </h2>
                {list.map((t) => (
                  <BoardCard
                    key={t.id}
                    task={t}
                    category={projects[t.projectId]?.category ?? "promo"}
                    projectTitle={projects[t.projectId]?.title ?? ""}
                    onDragStart={() => setDragId(t.id)}
                    onStatus={(s) => changeStatus(t, s)}
                    dragging={dragId === t.id}
                  />
                ))}
                {hidden > 0 && <p className="text-center text-[11px] text-ak-ink3">ほか{hidden}件</p>}
              </section>
            );
          })}
        </div>
      </div>

      <HandoffDialog task={handoff} onClose={() => setHandoff(null)} />
    </div>
  );
}

function BoardCard({
  task,
  category,
  projectTitle,
  onDragStart,
  onStatus,
  dragging,
}: {
  task: Task;
  category: Category;
  projectTitle: string;
  onDragStart: () => void;
  onStatus: (s: TaskStatus) => void;
  dragging: boolean;
}) {
  const parties = usePartyMap();
  const me = useAnken((s) => s.currentUserId);
  const ball = parties[task.ballId];
  const assignee = parties[task.assigneeId];
  const done = task.status === "done";
  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      className={cn(
        "flex cursor-grab flex-col gap-1.5 rounded-md border border-t-[3px] border-ak-line bg-ak-sheet p-2.5 active:cursor-grabbing",
        topBorder[category],
        dragging && "opacity-40",
        done && "opacity-60",
      )}
    >
      <Link href={`/anken/projects/${task.projectId}`} className="text-[11px] text-ak-ink3 hover:underline">
        {projectTitle}
      </Link>
      <div className="text-[13px] font-medium leading-snug">{task.title}</div>
      <div className="flex items-center justify-between gap-2">
        {task.status === "waiting" ? <WaitDays task={task} /> : <DueBadge due={task.due} done={done} />}
        <div className="flex items-center gap-1">
          {!done && task.ballId === me && <BallMark label="自分" />}
          {task.status === "waiting" ? <Avatar party={ball} size={20} /> : <Avatar party={assignee} size={20} />}
        </div>
      </div>
      <select
        aria-label={`${task.title}の状態`}
        value={task.status}
        onChange={(e) => onStatus(e.target.value as TaskStatus)}
        className="rounded border border-ak-line bg-ak-sheet px-1 py-0.5 text-[11.5px] text-ak-ink2 md:hidden"
      >
        {STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </article>
  );
}

/** 待ちの列に移すときに、ボールを渡す相手を選ぶ */
export function HandoffDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const passBall = useAnken((s) => s.passBall);
  const me = useAnken((s) => s.currentUserId);
  const projects = useProjectMap();
  const project = task ? projects[task.projectId] : undefined;
  const suggested = task?.side === "vendor" ? project?.vendorId : project?.clientId;
  const [picked, setPicked] = useState<string>("");
  const value = picked || suggested || "";

  return (
    <Dialog.Root
      open={!!task}
      onOpenChange={(o) => {
        if (!o) {
          setPicked("");
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="anken fixed left-1/2 top-[15vh] z-50 w-[min(440px,calc(100vw-24px))] -translate-x-1/2 rounded-xl border border-ak-line bg-ak-sheet p-5 shadow-xl">
          <Dialog.Title className="text-[16px] font-bold">誰にボールを渡しますか</Dialog.Title>
          <Dialog.Description className="mb-3 text-[12.5px] text-ak-ink3">
            「{task?.title}」を相手に渡すと、今日から待ち日数を数えます（{todayISO()}）。
          </Dialog.Description>
          <PartySelect id="handoff-to" value={value} onChange={setPicked} include={["client", "vendor"]} emptyLabel="相手を選んでください" />
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close className={cn(btn.base, btn.ghost)}>やめる</Dialog.Close>
            <button
              type="button"
              disabled={!value}
              className={cn(btn.base, btn.primary)}
              onClick={() => {
                if (task && value) passBall(task.id, value, me);
                setPicked("");
                onClose();
              }}
            >
              渡す
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
