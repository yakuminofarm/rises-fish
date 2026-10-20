"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAnken } from "../store";
import type { Task } from "../types";
import { Avatar, BallMark, catBg, DueBadge, PartySelect, usePartyMap, useProjectMap, WaitDays } from "../ui";

/** 一覧で使うタスク1行。完了チェックとボールの受け渡しができる */
export function TaskRow({
  task,
  showProject = true,
  showBallSelect = true,
}: {
  task: Task;
  showProject?: boolean;
  showBallSelect?: boolean;
}) {
  const moveTask = useAnken((s) => s.moveTask);
  const passBall = useAnken((s) => s.passBall);
  const currentUserId = useAnken((s) => s.currentUserId);
  const parties = usePartyMap();
  const projects = useProjectMap();
  const project = projects[task.projectId];
  const done = task.status === "done";
  const ball = parties[task.ballId];
  const waiting = task.status === "waiting";

  return (
    <div className="grid grid-cols-[4px_18px_minmax(0,1fr)_auto] items-center gap-x-2.5 border-t border-ak-wire2 py-2 first:border-t-0">
      <span className={cn("h-full min-h-8 rounded-sm", project ? catBg[project.category] : "bg-ak-line")} aria-hidden />
      <input
        type="checkbox"
        checked={done}
        onChange={() => moveTask(task.id, done ? "doing" : "done")}
        aria-label={`${task.title}を${done ? "未完了に戻す" : "完了にする"}`}
        className="h-4 w-4 accent-[var(--ak-ink2)]"
      />
      <div className="min-w-0">
        <div className={cn("truncate text-[13.5px] font-medium", done && "text-ak-ink3 line-through")}>{task.title}</div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[11.5px] text-ak-ink3">
          {showProject && project && (
            <Link href={`/anken/projects/${project.id}`} className="truncate hover:text-ak-accent hover:underline">
              {project.title}
            </Link>
          )}
          {!showProject && task.step && <span>{task.step}</span>}
          {waiting && ball && (
            <span className="inline-flex items-center gap-1">
              <Avatar party={ball} size={16} />
              {ball.org} {ball.name}さん ・ <WaitDays task={task} />
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!done && task.ballId === currentUserId && !showBallSelect && <BallMark label="自分" />}
        {showBallSelect && !done && (
          <PartySelect
            value={task.ballId}
            onChange={(id) => passBall(task.id, id, currentUserId)}
            ariaLabel={`${task.title}のボール保持者`}
            className="hidden w-[150px] text-[12px] sm:block"
          />
        )}
        <DueBadge due={task.due} done={done} />
      </div>
    </div>
  );
}
