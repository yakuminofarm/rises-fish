"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { fmtDateTime, fmtMDW } from "../date";
import { partyLabel, useAnken } from "../store";
import { btn, inputCls, usePartyMap } from "../ui";

/** 社内クライアント・外注先がリンクから開く確認画面（ログイン不要の想定） */
export function ReviewView({ taskId }: { taskId: string }) {
  const task = useAnken((s) => s.tasks.find((t) => t.id === taskId));
  const project = useAnken((s) => s.projects.find((p) => p.id === task?.projectId));
  const allActivities = useAnken((s) => s.activities);
  const passBall = useAnken((s) => s.passBall);
  const addComment = useAnken((s) => s.addComment);
  const parties = usePartyMap();
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState<null | "ok" | "fix">(null);
  const [needComment, setNeedComment] = useState(false);

  const reviewer = task ? parties[task.ballId] : undefined;
  const recent = allActivities
    .filter((a) => a.projectId === project?.id && a.actorId !== "system")
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 3);

  const answer = (kind: "ok" | "fix") => {
    if (!task || !project || !reviewer) return;
    if (kind === "fix" && !comment.trim()) {
      setNeedComment(true);
      return;
    }
    const head = kind === "ok" ? `「${task.title}」OKです。` : `「${task.title}」修正をお願いします。`;
    addComment(project.id, comment.trim() ? `${head}\n${comment.trim()}` : head, reviewer.id);
    passBall(task.id, task.assigneeId, reviewer.id);
    setSent(kind);
  };

  return (
    <div className="anken min-h-screen px-4 py-6">
      <div className="mx-auto flex max-w-[480px] flex-col gap-4">
        <p className="rounded-md border border-dashed border-ak-accent bg-ak-accent-soft px-3 py-2 text-[12px] text-ak-accent">
          試作版の表示です。実際には相手先に届くリンクで、相手はこの画面だけを見ます。
          <Link href={project ? `/anken/projects/${project.id}` : "/anken"} className="ml-1 underline">
            案件ボードに戻る
          </Link>
        </p>

        {!task || !project ? (
          <div className="rounded-xl border border-ak-line bg-ak-sheet p-6 text-center text-[13.5px] text-ak-ink2">
            このリンクは無効になっています。営業企画課にお問い合わせください。
          </div>
        ) : sent ? (
          <div className="rounded-xl border border-ak-line bg-ak-sheet p-6 text-center">
            <p className="text-[16px] font-bold">{sent === "ok" ? "OKを送りました" : "修正依頼を送りました"}</p>
            <p className="mt-1 text-[13px] text-ak-ink2">営業企画課の担当者に通知されます。ありがとうございました。</p>
          </div>
        ) : task.status !== "waiting" || reviewer?.kind === "member" ? (
          <div className="rounded-xl border border-ak-line bg-ak-sheet p-6 text-center text-[13.5px] text-ak-ink2">
            この確認はすでに完了しています。
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-xl border border-ak-line bg-ak-sheet p-5">
            <div>
              <p className="text-[12px] text-ak-ink3">
                営業企画課から {partyLabel(reviewer)} へ確認のお願い
              </p>
              <h1 className="mt-1 text-[18px] font-bold">{task.title}</h1>
              <p className="text-[12.5px] text-ak-ink2">
                {project.title} ・ 期限 {fmtMDW(task.due)}
              </p>
            </div>
            <div className="grid h-36 place-items-center rounded-md border border-ak-line bg-[repeating-linear-gradient(135deg,var(--ak-wire)_0_6px,var(--ak-sheet)_6px_12px)] text-[12px] text-ak-ink3">
              確認するファイル（STEP 2 で添付に対応）
            </div>
            {recent.length > 0 && (
              <div className="flex flex-col gap-2 rounded-md bg-ak-wire p-3 text-[12.5px]">
                {recent.map((a) => (
                  <div key={a.id}>
                    <span className="font-bold">{partyLabel(parties[a.actorId])}</span>
                    <span className="ml-1.5 font-mono text-[10.5px] text-ak-ink3">{fmtDateTime(a.at)}</span>
                    <p className="whitespace-pre-wrap text-ak-ink2">{a.text}</p>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
              コメント{needComment && <span className="text-ak-late">修正内容を書いてください</span>}
              <textarea
                id="rv-comment"
                rows={3}
                className={cn(inputCls, needComment && "border-ak-late")}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setNeedComment(false);
                }}
                placeholder="修正してほしい点があれば書いてください"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className={cn(btn.base, btn.secondary, "py-2.5")} onClick={() => answer("fix")}>
                修正依頼
              </button>
              <button type="button" className={cn(btn.base, btn.primary, "py-2.5")} onClick={() => answer("ok")}>
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
