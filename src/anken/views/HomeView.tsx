"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TaskRow } from "../components/TaskRow";
import { addDays, diffDays, fmtMD, fmtMDW, startOfWeek, todayISO, WEEKDAYS, weekday } from "../date";
import { partyLabel, useAnken } from "../store";
import type { HomeVariant, Task } from "../types";
import {
  Avatar,
  btn,
  byDue,
  catBg,
  DueBadge,
  EmptyNote,
  isLate,
  isOpen,
  panelCls,
  SectionTitle,
  Segmented,
  usePartyMap,
  useProjectMap,
  useToast,
  WaitDays,
} from "../ui";
import { BoardView } from "./BoardView";

const VARIANTS: { id: HomeVariant; label: string }[] = [
  { id: "A", label: "A ボール中心" },
  { id: "B", label: "B カレンダー中心" },
  { id: "C", label: "C カンバン" },
];

export function HomeView() {
  const variant = useAnken((s) => s.homeVariant);
  const setVariant = useAnken((s) => s.setHomeVariant);
  const today = todayISO();

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] text-ak-ink3">{fmtMDW(today)}</p>
          <h1 className="text-[20px] font-bold">今日やること</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-ak-ink3">ホームの表示を比べる</span>
          <Segmented label="ホームの表示" value={variant} options={VARIANTS} onChange={setVariant} />
        </div>
      </div>
      {variant === "A" && <HomeBall />}
      {variant === "B" && <HomeCalendar />}
      {variant === "C" && <BoardView embedded />}
    </div>
  );
}

function useHomeData() {
  const tasks = useAnken((s) => s.tasks);
  const me = useAnken((s) => s.currentUserId);
  const today = todayISO();
  return useMemo(() => {
    const open = tasks.filter(isOpen);
    const weekEnd = addDays(startOfWeek(today), 6);
    return {
      me,
      open,
      late: open.filter((t) => isLate(t, today)),
      thisWeek: open.filter((t) => t.due >= today && t.due <= weekEnd),
      myBall: open.filter((t) => t.ballId === me).sort(byDue),
      waiting: open.filter((t) => t.status === "waiting").sort((a, b) => (a.ballSince < b.ballSince ? -1 : 1)),
    };
  }, [tasks, me, today]);
}

function Kpi({ n, label, tone }: { n: number; label: string; tone?: "late" | "ball" }) {
  return (
    <div className={cn(panelCls, "px-4 py-3")}>
      <div
        className={cn(
          "tabular font-mono text-[26px] leading-tight",
          tone === "late" && n > 0 && "text-ak-late",
          tone === "ball" && "text-ak-ball",
        )}
      >
        {n}
      </div>
      <div className="text-[12px] text-ak-ink3">{label}</div>
    </div>
  );
}

function HomeBall() {
  const { me, open, late, thisWeek, myBall, waiting } = useHomeData();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const shownWaiting = scope === "mine" ? waiting.filter((t) => t.assigneeId === me) : waiting;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi n={late.filter((t) => t.ballId === me || t.assigneeId === me).length} label="期限切れ（自分の関わる分）" tone="late" />
        <Kpi n={thisWeek.filter((t) => t.assigneeId === me).length} label="今週締切（自分の担当）" />
        <Kpi n={myBall.length} label="自分がボールを持っている" tone="ball" />
        <Kpi n={waiting.filter((t) => t.assigneeId === me).length} label="クライアント・外注の返事待ち" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className={cn(panelCls, "p-4")}>
          <SectionTitle aside="期限が近い順">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-ak-ball" aria-hidden />
              自分がボールを持っているタスク
            </span>
          </SectionTitle>
          {myBall.length ? myBall.map((t) => <TaskRow key={t.id} task={t} />) : <EmptyNote>いま自分の番のタスクはありません。</EmptyNote>}
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <section className={cn(panelCls, "bg-ak-wire p-4")}>
            <SectionTitle
              aside={
                <Segmented
                  label="返事待ちの範囲"
                  value={scope}
                  onChange={setScope}
                  options={[
                    { id: "mine", label: "自分の担当" },
                    { id: "all", label: "課全体" },
                  ]}
                />
              }
            >
              相手の返事待ち
            </SectionTitle>
            {shownWaiting.length ? (
              shownWaiting.map((t) => <WaitingRow key={t.id} task={t} />)
            ) : (
              <EmptyNote>返事待ちはありません。</EmptyNote>
            )}
          </section>
          <TeamLoad open={open} />
        </div>
      </div>

      <Milestones />
    </>
  );
}

export function WaitingRow({ task }: { task: Task }) {
  const parties = usePartyMap();
  const projects = useProjectMap();
  const moveTask = useAnken((s) => s.moveTask);
  const toast = useToast((s) => s.show);
  const who = parties[task.ballId];
  const project = projects[task.projectId];

  const remind = async () => {
    const url = `${window.location.origin}/anken/review/${task.id}`;
    const text = `${partyLabel(who)}\n【確認のお願い】${project?.title ?? ""}\n「${task.title}」のご確認をお願いします。期限は${fmtMD(task.due)}です。\nこちらから確認・OKができます：${url}`;
    try {
      await navigator.clipboard.writeText(text);
      toast("催促文をコピーしました。Chatworkに貼り付けてください");
    } catch {
      toast("コピーできませんでした");
    }
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-ak-line py-2 first:border-t-0">
      <div className="min-w-0">
        <Link href={`/anken/projects/${task.projectId}`} className="block truncate text-[13.5px] font-medium hover:underline">
          {task.title}
        </Link>
        <div className="flex items-center gap-1.5 text-[11.5px] text-ak-ink3">
          <Avatar party={who} size={16} />
          <span className="truncate">
            {who?.kind === "vendor" ? "外注先" : "社内クライアント"} ・ {partyLabel(who)}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <WaitDays task={task} />
        <div className="flex gap-1">
          <button type="button" onClick={remind} className="rounded border border-ak-line bg-ak-sheet px-2 text-[11.5px] text-ak-ink2 hover:border-ak-ink3">
            催促
          </button>
          <button
            type="button"
            onClick={() => moveTask(task.id, "doing")}
            className="rounded border border-ak-line bg-ak-sheet px-2 text-[11.5px] text-ak-ink2 hover:border-ak-ink3"
            title="返事が来たので自分に戻す"
          >
            戻ってきた
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamLoad({ open }: { open: Task[] }) {
  const parties = useAnken((s) => s.parties);
  const today = todayISO();
  const members = parties.filter((p) => p.kind === "member");
  const max = Math.max(1, ...members.map((m) => open.filter((t) => t.assigneeId === m.id).length));
  return (
    <section className={cn(panelCls, "p-4")}>
      <SectionTitle aside="担当している未完了タスク">課の3人の抱え量</SectionTitle>
      <div className="flex flex-col gap-2">
        {members.map((m) => {
          const mine = open.filter((t) => t.assigneeId === m.id);
          const late = mine.filter((t) => isLate(t, today)).length;
          return (
            <div key={m.id} className="grid grid-cols-[64px_minmax(0,1fr)_96px] items-center gap-2 text-[12.5px]">
              <span className="flex items-center gap-1.5">
                <Avatar party={m} size={18} />
                {m.name}
              </span>
              <span className="h-2.5 overflow-hidden rounded-full bg-ak-wire">
                <span className="block h-full rounded-full bg-ak-ink2" style={{ width: `${(mine.length / max) * 100}%` }} />
              </span>
              <span className="tabular text-right font-mono text-[11.5px] text-ak-ink2">
                {mine.length}件{late > 0 && <span className="text-ak-late"> ・ 遅れ{late}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const MILESTONE_RE = /入稿|公開|納品|リリース|承認/;

function Milestones() {
  const tasks = useAnken((s) => s.tasks);
  const projects = useAnken((s) => s.projects);
  const today = todayISO();
  const end = addDays(today, 14);
  const items = useMemo(() => {
    const list: { key: string; date: string; label: string; projectId: string; category: string }[] = [];
    projects
      .filter((p) => !p.done && p.due >= today && p.due <= end)
      .forEach((p) => list.push({ key: p.id, date: p.due, label: `${p.title} 納期`, projectId: p.id, category: p.category }));
    tasks
      .filter((t) => isOpen(t) && t.due >= today && t.due <= end && MILESTONE_RE.test(t.title + (t.step ?? "")))
      .forEach((t) => {
        const p = projects.find((x) => x.id === t.projectId);
        if (p) list.push({ key: t.id, date: t.due, label: t.title, projectId: p.id, category: p.category });
      });
    return list.sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [tasks, projects, today, end]);

  return (
    <section className={cn(panelCls, "p-4")}>
      <SectionTitle aside="入稿・公開・納品・承認と案件の納期">今後2週間の動かせない日付</SectionTitle>
      {items.length ? (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {items.map((m) => (
            <Link key={m.key} href={`/anken/projects/${m.projectId}`} className="flex items-center gap-1.5 text-[12.5px] hover:underline">
              <span className={cn("h-2.5 w-2.5 rotate-45", catBg[m.category as keyof typeof catBg])} aria-hidden />
              <DueBadge due={m.date} />
              {m.label}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyNote>2週間以内に決まった日付はありません。</EmptyNote>
      )}
    </section>
  );
}

function HomeCalendar() {
  const { me, open, late } = useHomeData();
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const today = todayISO();
  const [selected, setSelected] = useState(today);
  const projects = useProjectMap();
  const start = startOfWeek(today);
  const days = Array.from({ length: 14 }, (_, i) => addDays(start, i));
  const scoped = scope === "mine" ? open.filter((t) => t.assigneeId === me || t.ballId === me) : open;
  const dayTasks = scoped.filter((t) => t.due === selected).sort(byDue);
  const lateScoped = late.filter((t) => scoped.includes(t)).sort(byDue);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12.5px] text-ak-ink3">日付を押すと、その日が期日のタスクが下に出ます。</p>
        <Segmented
          label="カレンダーの範囲"
          value={scope}
          onChange={setScope}
          options={[
            { id: "mine", label: "自分の分" },
            { id: "all", label: "課全体" },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <div className={cn(panelCls, "grid min-w-[700px] grid-cols-7 overflow-hidden")}>
          {WEEKDAYS.slice(1)
            .concat(WEEKDAYS[0])
            .map((w) => (
              <div key={w} className="border-b border-ak-line bg-ak-wire py-1 text-center text-[11.5px] text-ak-ink3">
                {w}
              </div>
            ))}
          {days.map((d) => {
            const list = scoped.filter((t) => t.due === d).sort(byDue);
            const wd = weekday(d);
            const isToday = d === today;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelected(d)}
                className={cn(
                  "flex min-h-[112px] flex-col gap-1 border-b border-l border-ak-wire2 p-1.5 text-left first:border-l-0 [&:nth-child(7n+8)]:border-l-0",
                  (wd === 0 || wd === 6) && "bg-ak-wire/50",
                  selected === d && "outline outline-2 -outline-offset-2 outline-ak-accent",
                  d < today && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "tabular self-start rounded px-1 font-mono text-[11.5px]",
                    isToday ? "bg-ak-accent font-bold text-ak-sheet" : "text-ak-ink2",
                  )}
                >
                  {fmtMD(d)}
                </span>
                {list.slice(0, 3).map((t) => (
                  <span
                    key={t.id}
                    className={cn(
                      "flex items-center gap-1 truncate rounded px-1 text-[11px] leading-[17px]",
                      t.ballId === me ? "bg-ak-ball-soft font-bold" : "bg-ak-wire",
                    )}
                  >
                    <span className={cn("h-2 w-1 flex-none rounded-sm", catBg[projects[t.projectId]?.category ?? "promo"])} />
                    <span className="truncate">{t.title}</span>
                  </span>
                ))}
                {list.length > 3 && <span className="text-[10.5px] text-ak-ink3">ほか{list.length - 3}件</span>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cn(panelCls, "p-4")}>
          <SectionTitle aside={`${dayTasks.length}件`}>
            {fmtMDW(selected)}が期日{selected === today && "（今日）"}
          </SectionTitle>
          {dayTasks.length ? dayTasks.map((t) => <TaskRow key={t.id} task={t} />) : <EmptyNote>この日が期日のタスクはありません。</EmptyNote>}
        </section>
        <section className={cn(panelCls, "p-4")}>
          <SectionTitle aside={`${lateScoped.length}件`}>
            <span className="text-ak-late">期限切れ</span>
          </SectionTitle>
          {lateScoped.length ? (
            lateScoped.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <TaskRow task={t} showBallSelect={false} />
                </div>
                <span className="tabular whitespace-nowrap font-mono text-[11px] text-ak-late">{diffDays(t.due, today)}日超過</span>
              </div>
            ))
          ) : (
            <EmptyNote>期限切れはありません。</EmptyNote>
          )}
          <Link href="/anken/board" className={cn(btn.base, btn.ghost, "mt-2")}>
            カンバンで並べ替える
          </Link>
        </section>
      </div>
    </>
  );
}
