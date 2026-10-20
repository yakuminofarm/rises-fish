"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";
import { addDays, todayISO } from "../date";
import { useAnken } from "../store";
import { SOURCE_LABEL } from "../templates";
import type { RequestSource } from "../types";
import { btn, inputCls, PartySelect, useToast } from "../ui";

/** どの画面からでも依頼を受付箱に入れるためのダイアログ */
export function QuickAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const addRequest = useAnken((s) => s.addRequest);
  const currentUserId = useAnken((s) => s.currentUserId);
  const toast = useToast((s) => s.show);
  const [title, setTitle] = useState("");
  const [fromId, setFromId] = useState(currentUserId);
  const [source, setSource] = useState<RequestSource>("chatwork");
  const [desiredDue, setDesiredDue] = useState("");
  const [note, setNote] = useState("");

  const reset = () => {
    setTitle("");
    setFromId(currentUserId);
    setSource("chatwork");
    setDesiredDue("");
    setNote("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addRequest({
      title: title.trim(),
      fromId,
      source: fromId === currentUserId ? "memo" : source,
      desiredDue: desiredDue || undefined,
      note: note.trim() || undefined,
    });
    toast("受付箱に登録しました");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="anken fixed left-1/2 top-[8vh] z-50 w-[min(520px,calc(100vw-24px))] -translate-x-1/2 rounded-xl border border-ak-line bg-ak-sheet p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-[16px] font-bold">依頼を登録</Dialog.Title>
              <Dialog.Description className="text-[12.5px] text-ak-ink3">
                まず受付箱に入れておき、あとで案件にするか決めます。
              </Dialog.Description>
            </div>
            <Dialog.Close className="rounded p-1 text-ak-ink3 hover:bg-ak-wire" aria-label="閉じる">
              <X size={18} />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
              依頼内容
              <input
                id="qa-title"
                autoFocus
                className={inputCls}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：店頭用の会員アプリ案内POPを作ってほしい"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
                依頼元
                <PartySelect id="qa-from" value={fromId} onChange={setFromId} include={["member", "client", "vendor"]} />
              </label>
              <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
                どこから来たか
                <select
                  id="qa-source"
                  className={inputCls}
                  value={fromId === currentUserId ? "memo" : source}
                  disabled={fromId === currentUserId}
                  onChange={(e) => setSource(e.target.value as RequestSource)}
                >
                  {(Object.keys(SOURCE_LABEL) as RequestSource[]).map((k) => (
                    <option key={k} value={k}>
                      {SOURCE_LABEL[k]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
              希望納期（分かれば）
              <input
                id="qa-due"
                type="date"
                className={inputCls}
                value={desiredDue}
                min={todayISO()}
                onChange={(e) => setDesiredDue(e.target.value)}
              />
              <span className="flex gap-1.5">
                {[7, 14, 30].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="rounded border border-ak-line px-1.5 text-[11px] text-ak-ink2 hover:bg-ak-wire"
                    onClick={() => setDesiredDue(addDays(todayISO(), n))}
                  >
                    {n === 7 ? "1週間後" : n === 14 ? "2週間後" : "1か月後"}
                  </button>
                ))}
              </span>
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-ak-ink3">
              メモ
              <textarea
                id="qa-note"
                rows={3}
                className={inputCls}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="チャットの文面を貼り付けてもOK"
              />
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <Dialog.Close className={`${btn.base} ${btn.ghost}`} type="button">
                やめる
              </Dialog.Close>
              <button type="submit" className={`${btn.base} ${btn.primary}`} disabled={!title.trim()}>
                受付箱に入れる
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
