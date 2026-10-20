"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProjectForm } from "../components/ProjectForm";
import { addDays, fmtDateTime, fmtMD, todayISO } from "../date";
import { partyLabel, useAnken } from "../store";
import { SOURCE_LABEL } from "../templates";
import type { Request } from "../types";
import { Avatar, btn, EmptyNote, panelCls, Segmented, usePartyMap, useToast } from "../ui";

const TABS: { id: Request["state"]; label: string }[] = [
  { id: "new", label: "未処理" },
  { id: "hold", label: "保留" },
  { id: "converted", label: "案件化済み" },
  { id: "declined", label: "見送り" },
];

export function InboxView() {
  const requests = useAnken((s) => s.requests);
  const createProject = useAnken((s) => s.createProject);
  const setRequestState = useAnken((s) => s.setRequestState);
  const parties = usePartyMap();
  const toast = useToast((s) => s.show);
  const router = useRouter();
  const [tab, setTab] = useState<Request["state"]>("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = requests.filter((r) => r.state === tab).sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
  const selected = list.find((r) => r.id === selectedId) ?? list[0];
  const counts = Object.fromEntries(TABS.map((t) => [t.id, requests.filter((r) => r.state === t.id).length]));
  const from = selected ? parties[selected.fromId] : undefined;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold">受付箱</h1>
          <p className="text-[12.5px] text-ak-ink3">依頼はまず全部ここへ。案件にするか、保留・見送りにするかを決めます。</p>
        </div>
        <Segmented
          label="受付箱の表示"
          value={tab}
          onChange={(v) => {
            setTab(v);
            setSelectedId(null);
          }}
          options={TABS.map((t) => ({ id: t.id, label: `${t.label} ${counts[t.id]}` }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className={cn(panelCls, "flex flex-col gap-2 p-3")} aria-label="依頼の一覧">
          {list.length === 0 && <EmptyNote>{tab === "new" ? "未処理の依頼はありません。" : "ここに入っている依頼はありません。"}</EmptyNote>}
          {list.map((r) => {
            const p = parties[r.fromId];
            const on = selected?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                aria-pressed={on}
                className={cn(
                  "flex flex-col gap-0.5 rounded-md border p-2.5 text-left",
                  on ? "border-ak-ink bg-ak-wire" : "border-ak-line hover:border-ak-ink3",
                )}
              >
                <span className="flex items-center justify-between gap-2 text-[11.5px] text-ak-ink3">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Avatar party={p} size={16} />
                    <span className="truncate">
                      {p?.kind === "member" ? "自分のメモ" : partyLabel(p)} ・ {SOURCE_LABEL[r.source]}
                    </span>
                  </span>
                  <span className="tabular whitespace-nowrap font-mono">{fmtDateTime(r.receivedAt)}</span>
                </span>
                <span className="text-[13.5px] font-bold">{r.title}</span>
                {r.desiredDue && <span className="text-[11.5px] text-ak-ink3">希望納期 {fmtMD(r.desiredDue)}</span>}
              </button>
            );
          })}
        </section>

        <section className={cn(panelCls, "p-4")} aria-label="選んだ依頼">
          {!selected ? (
            <EmptyNote>左の一覧から依頼を選んでください。</EmptyNote>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-md bg-ak-wire p-3 text-[12.5px]">
                <div className="mb-1 flex items-center gap-1.5 text-ak-ink3">
                  <Avatar party={from} size={18} />
                  {partyLabel(from)} から ・ {SOURCE_LABEL[selected.source]} ・ {fmtDateTime(selected.receivedAt)}
                </div>
                <p className="font-bold">{selected.title}</p>
                {selected.note && <p className="mt-1 whitespace-pre-wrap text-ak-ink2">{selected.note}</p>}
              </div>

              {selected.state === "converted" && selected.projectId ? (
                <Link href={`/anken/projects/${selected.projectId}`} className={cn(btn.base, btn.secondary, "self-start")}>
                  作成した案件を開く
                </Link>
              ) : (
                <>
                  <h2 className="text-[14px] font-bold">案件にする</h2>
                  <ProjectForm
                    key={selected.id}
                    initial={{
                      title: selected.title,
                      due: selected.desiredDue ?? addDays(todayISO(), 30),
                      clientId: from?.kind === "client" ? from.id : undefined,
                      vendorId: undefined,
                      requestId: selected.id,
                    }}
                    submitLabel="案件化する"
                    onSubmit={(input) => {
                      const id = createProject(input);
                      toast("案件にしました");
                      router.push(`/anken/projects/${id}`);
                    }}
                    extraActions={
                      <>
                        {selected.state !== "hold" && (
                          <button type="button" className={cn(btn.base, btn.ghost)} onClick={() => setRequestState(selected.id, "hold")}>
                            保留
                          </button>
                        )}
                        {selected.state !== "new" && (
                          <button type="button" className={cn(btn.base, btn.ghost)} onClick={() => setRequestState(selected.id, "new")}>
                            未処理に戻す
                          </button>
                        )}
                        {selected.state !== "declined" && (
                          <button type="button" className={cn(btn.base, btn.ghost)} onClick={() => setRequestState(selected.id, "declined")}>
                            見送り
                          </button>
                        )}
                      </>
                    }
                  />
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
