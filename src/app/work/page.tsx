import type { Metadata } from "next";
import { LogOut } from "lucide-react";

import { logout } from "@/app/work/login/actions";
import { AgentPanel } from "@/components/work/AgentPanel";
import { CapacityControl } from "@/components/work/CapacityControl";
import { NudgeList } from "@/components/work/NudgeList";
import { QuickAdd } from "@/components/work/QuickAdd";
import { TaskItem } from "@/components/work/TaskItem";
import { TaskList } from "@/components/work/TaskList";
import { WeekLoad } from "@/components/work/WeekLoad";
import { formatMinutes } from "@/components/work/taskStyles";
import { hasAgentKey } from "@/lib/work/config";
import { requireSession } from "@/lib/work/dal";
import { todayJst, weekdayJa } from "@/lib/work/date";
import {
  buildNudges,
  buildTodayPlan,
  buildWeekLoad,
  summarize,
} from "@/lib/work/planner";
import { getWorkspace } from "@/lib/work/tasks";

export const metadata: Metadata = {
  title: "業務秘書",
  description: "AIと一緒に日々のやることを整理・実行するための業務管理ツール",
  robots: { index: false, follow: false },
};

export default async function WorkPage() {
  const { userId } = await requireSession();
  const { tasks, chat, settings } = await getWorkspace(userId);

  const today = todayJst();
  const capacity = settings.dailyCapacityMin;

  const stats = summarize(tasks, today);
  const { plan, overflow, plannedMin } = buildTodayPlan(tasks, today, capacity);
  const nudges = buildNudges(tasks, today);
  const week = buildWeekLoad(tasks, today);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-base font-bold text-slate-900">業務秘書</h1>
            <p className="text-xs text-slate-500">
              {today.replace(/-/g, "/")}（{weekdayJa(today)}）
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CapacityControl value={capacity} />

            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                hasAgentKey()
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {hasAgentKey() ? "AI接続中" : "AI未接続"}
            </span>

            <form action={logout}>
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="未完了" value={stats.open} />
          <Stat label="期限切れ" value={stats.overdue} tone="danger" />
          <Stat label="今日が期限" value={stats.dueToday} tone="warn" />
          <Stat label="今日の完了" value={stats.doneToday} tone="good" />
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-sm font-bold text-slate-800">
                  今日の作戦
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    上から順に片付ければ大丈夫です
                  </span>
                </h2>
                {plan.length > 0 && (
                  <span className="text-xs text-slate-500">
                    {plan.length}件 / 目安 {formatMinutes(plannedMin)}
                  </span>
                )}
              </div>

              {plan.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  未完了のタスクはありません。
                  <br />
                  右のAI秘書に、頭の中にあることを書き出してみてください。
                </p>
              ) : (
                <div className="space-y-2">
                  {plan.map((item, index) => (
                    <TaskItem
                      key={item.task.id}
                      task={item.task}
                      today={today}
                      reasons={item.reasons}
                      index={index + 1}
                    />
                  ))}
                </div>
              )}

              {overflow.length > 0 && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  残り {overflow.length} 件は今日の持ち時間に収まらないため外しました。
                  時間が余ったら「すべてのタスク」から拾ってください。
                </p>
              )}
            </section>

            <NudgeList nudges={nudges} />

            <WeekLoad buckets={week} capacityMin={capacity} />
          </div>

          <div className="space-y-3 lg:sticky lg:top-[68px] lg:self-start">
            <div className="h-[540px]">
              <AgentPanel chat={chat} offline={!hasAgentKey()} />
            </div>
            <QuickAdd today={today} />
          </div>
        </div>

        <TaskList tasks={tasks} today={today} />
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "plain",
}: {
  label: string;
  value: number;
  tone?: "plain" | "danger" | "warn" | "good";
}) {
  const toneClass = {
    plain: "text-slate-800",
    danger: value > 0 ? "text-rose-600" : "text-slate-300",
    warn: value > 0 ? "text-orange-600" : "text-slate-300",
    good: value > 0 ? "text-teal-600" : "text-slate-300",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`mt-0.5 text-2xl font-bold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
