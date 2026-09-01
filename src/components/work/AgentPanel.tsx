"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { RotateCcw, SendHorizontal, Sparkles } from "lucide-react";

import {
  AgentActionState,
  askAgent,
  resetChat,
} from "@/app/work/actions";
import { ChatMessage } from "@/lib/work/types";

const initialState: AgentActionState = { error: null };

/** 何を書けばいいか分からない人向けの入口 */
const EXAMPLES = [
  "明日ヤマトで3件発送、水曜までに餌の発注、あと今週中に選別",
  "今日は何から手をつければいい？",
  "溜まってるタスク、いらないものを整理したい",
];

interface AgentPanelProps {
  chat: ChatMessage[];
  offline: boolean;
}

export function AgentPanel({ chat, offline }: AgentPanelProps) {
  const [state, formAction, pending] = useActionState(askAgent, initialState);
  const [draft, setDraft] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // 新しい発言が入ったら最下部へ
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [chat.length, pending]);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-800">AI秘書</h2>
            <p className="text-[11px] text-slate-400">
              {offline ? "簡易モード（APIキー未設定）" : "思いついた順に書けば整理します"}
            </p>
          </div>
        </div>

        {chat.length > 0 && (
          <form action={resetChat}>
            <button
              type="submit"
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              <RotateCcw className="h-3 w-3" />
              履歴を消す
            </button>
          </form>
        )}
      </header>

      <div
        ref={logRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
      >
        {chat.length === 0 && !pending && (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-slate-500">
              頭の中にあることを、まとまっていないまま書いてください。
              日付や優先度はこちらで推測して登録します。
            </p>
            <div className="space-y-1.5">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDraft(example)}
                  className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:border-teal-400 hover:bg-teal-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}

        {pending && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
            考えています…
          </div>
        )}

        {state.error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
          >
            {state.error}
          </p>
        )}
      </div>

      <form
        ref={formRef}
        action={(formData) => {
          // 送信内容は formData に入っているので、入力欄はここで空にしてよい
          formAction(formData);
          setDraft("");
        }}
        className="border-t border-slate-100 p-3"
      >
        <div className="flex items-end gap-2">
          <textarea
            name="message"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              // Ctrl/Cmd + Enter で送信。改行は普通に打てるようにする
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            rows={3}
            maxLength={4000}
            placeholder="例）明日までに発送3件、あと餌が切れそう"
            className="min-h-[72px] flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <button
            type="submit"
            disabled={pending || draft.trim().length === 0}
            aria-label="送信"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:opacity-40"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          Ctrl（⌘）+ Enter で送信
        </p>
      </form>
    </section>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-teal-600 text-white"
            : "border border-slate-200 bg-slate-50 text-slate-700"
        }`}
      >
        {message.text}

        {message.actions.length > 0 && (
          <ul className="mt-2 space-y-0.5 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
            {message.actions.map((action, i) => (
              <li key={`${message.id}-${i}`}>{action}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
