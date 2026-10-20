"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, diffDays, fmtMD, parseISO, startOfWeek, todayISO, WEEKDAYS, weekday } from "../date";
import { useAnken } from "../store";
import type { Task } from "../types";
import { Avatar, byDue, catBg, CategoryChip, isLate, panelCls, Segmented } from "../ui";

const LABEL_W = 220;

export function TimelineView() {
  const tasks = useAnken((s) => s.tasks);
  const projects = useAnken((s) => s.projects);
  const parties = useAnken((s) => s.parties);
  const [weeks, setWeeks] = useState<"2" | "4">("2");
  const [offset, setOffset] = useState(0);
  const [showDone, setShowDone] = useState(false);
  const today = todayISO();
  const start = addDays(startOfWeek(today), offset * 7);
  const n = Number(weeks) * 7;
  const end = addDays(start, n - 1);
  const days = Array.from({ length: n }, (_, i) => addDays(start, i));
  const members = parties.filter((p) => p.kind === "member");

  const rows = projects
        .filter((p) => !p.done)
        .map((p) => ({
          project: p,
          tasks: tasks
            .filter((t) => t.projectId === p.id && (showDone || t.status !== "done"))
            .filter((t) => t.due >= start && t.start <= end)
            .sort(byDue),
        }))
        .filter((r) => r.tasks.length > 0 || (r.project.due >= start && r.project.due <= end))
    .sort((a, b) => (a.project.due < b.project.due ? -1 : 1));

  // その日に動いている（開始〜期日の間にある）未完了タスク数
  const load = members.map((m) => ({
        member: m,
        counts: days.map(
          (d) => tasks.filter((t) => t.status !== "done" && t.assigneeId === m.id && t.start <= d && t.due >= d).length,
    ),
  }));

  const col = (d: string) => diffDays(start, d); // 0 始まり
  const gridCols = `${LABEL_W}px repeat(${n}, minmax(${weeks === "2" ? 40 : 24}px, 1fr))`;
  const todayIdx = col(today);

  const bar = (t: Task, category: keyof typeof catBg) => {
    const s = Math.max(0, col(t.start));
    const e = Math.min(n - 1, col(t.due));
    const waiting = t.status === "waiting";
    return (
      <div
        className="relative flex h-full items-center"
        style={{ gridColumn: `${s + 2} / ${e + 3}` }}
        title={`${t.title}（${fmtMD(t.start)}〜${fmtMD(t.due)}）`}
      >
        <div
          className={cn(
            "h-3.5 w-full rounded-sm",
            waiting ? "ak-hatch" : catBg[category],
            t.status === "done" && "opacity-30",
            isLate(t, today) && "ring-2 ring-ak-late",
          )}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">タイムライン</h1>
          <p className="text-[12.5px] text-ak-ink3">
            斜線はクライアント・外注先にボールがある期間、◆は案件の納期、赤い枠は期限切れです。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-md border border-ak-line bg-ak-sheet text-[12px]">
            <button type="button" className="px-2 py-1 hover:bg-ak-wire" onClick={() => setOffset((o) => o - 1)} aria-label="1週前へ">
              ←
            </button>
            <button type="button" className="border-x border-ak-line px-2 py-1 hover:bg-ak-wire" onClick={() => setOffset(0)}>
              今週
            </button>
            <button type="button" className="px-2 py-1 hover:bg-ak-wire" onClick={() => setOffset((o) => o + 1)} aria-label="1週後へ">
              →
            </button>
          </div>
          <Segmented
            label="表示期間"
            value={weeks}
            onChange={setWeeks}
            options={[
              { id: "2", label: "2週間" },
              { id: "4", label: "4週間" },
            ]}
          />
          <label className="flex items-center gap-1.5 text-[12px] text-ak-ink2">
            <input id="tl-done" type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} />
            完了も表示
          </label>
        </div>
      </div>

      <div className={cn(panelCls, "overflow-x-auto")}>
        <div className="relative min-w-[880px]">
          <div className="grid" style={{ gridTemplateColumns: gridCols }}>
            <div className="sticky left-0 z-10 border-b border-r border-ak-line bg-ak-wire px-3 py-1.5 text-[11.5px] text-ak-ink3">
              案件・タスク
            </div>
            {days.map((d) => {
              const wd = weekday(d);
              return (
                <div
                  key={d}
                  className={cn(
                    "tabular border-b border-l border-ak-wire2 bg-ak-wire py-1 text-center font-mono text-[10.5px] leading-tight text-ak-ink3",
                    (wd === 0 || wd === 6) && "opacity-60",
                    d === today && "bg-ak-accent-soft font-bold text-ak-accent",
                  )}
                >
                  {weeks === "2" || wd === 1 ? fmtMD(d) : parseISO(d).getDate()}
                  <br />
                  {WEEKDAYS[wd]}
                </div>
              );
            })}

            {rows.map(({ project, tasks: ts }) => (
              <div key={project.id} className="contents">
                <div className="sticky left-0 z-10 flex min-w-0 items-center gap-1.5 border-t border-r border-ak-line bg-ak-sheet px-3 py-1.5">
                  <CategoryChip category={project.category} />
                  <Link href={`/anken/projects/${project.id}`} className="truncate text-[12.5px] font-bold hover:underline">
                    {project.title}
                  </Link>
                </div>
                <div className="relative grid border-t border-ak-line" style={{ gridColumn: `2 / ${n + 2}`, gridTemplateColumns: `repeat(${n}, 1fr)` }}>
                  {project.due >= start && project.due <= end && (
                    <div className="flex items-center justify-center" style={{ gridColumn: `${col(project.due) + 1}` }} title={`納期 ${fmtMD(project.due)}`}>
                      <span className={cn("h-3 w-3 rotate-45", project.due < today ? "bg-ak-late" : "bg-ak-ink")} />
                    </div>
                  )}
                </div>
                {ts.map((t) => (
                  <div key={t.id} className="contents">
                    <div className="sticky left-0 z-10 flex min-w-0 items-center gap-1.5 border-r border-ak-line bg-ak-sheet py-1 pl-6 pr-3 text-[12px] text-ak-ink2">
                      <Avatar party={parties.find((p) => p.id === (t.status === "waiting" ? t.ballId : t.assigneeId))} size={16} />
                      <span className={cn("truncate", t.status === "done" && "line-through opacity-60")}>{t.title}</span>
                    </div>
                    <div className="grid h-7" style={{ gridColumn: `2 / ${n + 2}`, gridTemplateColumns: `repeat(${n}, 1fr)` }}>
                      {bar(t, project.category)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          {todayIdx >= 0 && todayIdx < n && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 w-0.5 bg-ak-accent/70"
              style={{ left: `calc(${LABEL_W}px + (100% - ${LABEL_W}px) * ${(todayIdx + 0.5) / n})` }}
              aria-hidden
            />
          )}
        </div>
      </div>

      <section className={cn(panelCls, "overflow-x-auto")}>
        <div className="min-w-[880px]">
          <div className="border-b border-ak-line px-3 py-2 text-[13px] font-bold">
            担当者別の負荷 <span className="font-normal text-ak-ink3">（その日に動いている担当タスク数）</span>
          </div>
          <div className="grid" style={{ gridTemplateColumns: gridCols }}>
            {load.map(({ member, counts }) => (
              <div key={member.id} className="contents">
                <div className="flex items-center gap-1.5 border-r border-t border-ak-line px-3 py-1.5 text-[12.5px]">
                  <Avatar party={member} size={18} />
                  {member.name}
                </div>
                {counts.map((c, i) => (
                  <div
                    key={days[i]}
                    title={`${fmtMD(days[i])} ${c}件`}
                    className={cn(
                      "tabular grid place-items-center border-l border-t border-ak-sheet font-mono text-[10.5px]",
                      c === 0 && "bg-ak-wire text-ak-ink3",
                      c === 1 && "bg-ak-wire2 text-ak-ink2",
                      c === 2 && "bg-ak-ball-soft text-ak-ink",
                      c === 3 && "bg-ak-ball text-ak-sheet",
                      c >= 4 && "bg-ak-late text-ak-sheet",
                    )}
                  >
                    {c || ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
