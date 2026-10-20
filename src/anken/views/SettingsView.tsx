"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, fmtMD, todayISO, toISO } from "../date";
import type { ImportRow } from "../store";
import { useAnken } from "../store";
import { CATEGORIES, CATEGORY_ORDER } from "../templates";
import type { Category, HomeVariant, Party, PartyKind } from "../types";
import { btn, inputCls, panelCls, SectionTitle, useToast } from "../ui";

const VARIANT_INFO: { id: HomeVariant; title: string; body: string }[] = [
  { id: "A", title: "A ボール中心", body: "自分の番のタスクと、相手の返事待ちを左右に並べる。" },
  { id: "B", title: "B カレンダー中心", body: "2週間のカレンダーに期日を置き、選んだ日のタスクを下に出す。" },
  { id: "C", title: "C カンバン", body: "開いたらすぐ課全体のカンバン。" },
];

export function SettingsView() {
  const variant = useAnken((s) => s.homeVariant);
  const setVariant = useAnken((s) => s.setHomeVariant);
  const resetSample = useAnken((s) => s.resetSample);
  const toast = useToast((s) => s.show);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="mx-auto flex max-w-[960px] flex-col gap-5">
      <h1 className="text-[20px] font-bold">設定・取り込み</h1>

      <section className={cn(panelCls, "p-4")}>
        <SectionTitle aside="ホーム画面の右上からも切り替えられます">ホームの表示</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="ホームの表示">
          {VARIANT_INFO.map((v) => (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={variant === v.id}
              onClick={() => setVariant(v.id)}
              className={cn(
                "flex flex-col gap-1 rounded-md border p-3 text-left",
                variant === v.id ? "border-ak-ink bg-ak-wire" : "border-ak-line hover:border-ak-ink3",
              )}
            >
              <span className="text-[13.5px] font-bold">{v.title}</span>
              <span className="text-[12px] text-ak-ink2">{v.body}</span>
            </button>
          ))}
        </div>
      </section>

      <BulkImport />
      <PartiesEditor />

      <section className={cn(panelCls, "p-4")}>
        <SectionTitle>データ</SectionTitle>
        <p className="mb-3 text-[12.5px] text-ak-ink2">
          試作版のため、データはこのブラウザの中だけに保存されています。ほかの人やほかのPCとは共有されません。
        </p>
        {confirmReset ? (
          <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
            <span>いまのデータを消して、サンプルデータに戻します。よろしいですか。</span>
            <button
              type="button"
              className={cn(btn.base, btn.danger)}
              onClick={() => {
                resetSample();
                setConfirmReset(false);
                toast("サンプルデータに戻しました");
              }}
            >
              戻す
            </button>
            <button type="button" className={cn(btn.base, btn.ghost)} onClick={() => setConfirmReset(false)}>
              やめる
            </button>
          </div>
        ) : (
          <button type="button" className={cn(btn.base, btn.ghost)} onClick={() => setConfirmReset(true)}>
            サンプルデータに戻す
          </button>
        )}
      </section>
    </div>
  );
}

/** 「10/25」「2026/10/25」「2026-10-25」「10月25日」を YYYY-MM-DD にする */
export function parseLooseDate(s: string, today = todayISO()): string | null {
  const t = s.trim().replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  let m = t.match(/^(\d{4})[/\-.年](\d{1,2})[/\-.月](\d{1,2})日?$/);
  if (m) return toISO(new Date(+m[1], +m[2] - 1, +m[3]));
  m = t.match(/^(\d{1,2})[/\-.月](\d{1,2})日?$/);
  if (m) {
    const year = +today.slice(0, 4);
    let iso = toISO(new Date(year, +m[1] - 1, +m[2]));
    // 半年以上前になる日付は来年とみなす
    if (iso < addDays(today, -180)) iso = toISO(new Date(year + 1, +m[1] - 1, +m[2]));
    return iso;
  }
  return null;
}

function BulkImport() {
  const parties = useAnken((s) => s.parties);
  const me = useAnken((s) => s.currentUserId);
  const importTasks = useAnken((s) => s.importTasks);
  const toast = useToast((s) => s.show);
  const router = useRouter();
  const [text, setText] = useState("");
  const [title, setTitle] = useState(`手持ちタスク 取り込み ${fmtMD(todayISO())}`);
  const [category, setCategory] = useState<Category>("promo");
  const members = useMemo(() => parties.filter((p) => p.kind === "member"), [parties]);

  const rows = useMemo<(ImportRow & { warn?: string })[]>(() => {
    const today = todayISO();
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const cols = line.split(/\t|,|、/).map((c) => c.trim());
        const name = cols[0];
        const due = cols[1] ? parseLooseDate(cols[1], today) : null;
        const who = cols[2] ? members.find((m) => cols[2].includes(m.name)) : undefined;
        const warn = [cols[1] && !due ? "期日を読めないため1週間後に" : "", cols[2] && !who ? "担当が見つからないため自分に" : ""]
          .filter(Boolean)
          .join("・");
        return { title: name, due: due ?? addDays(today, 7), assigneeId: who?.id ?? me, warn: warn || undefined };
      });
  }, [text, members, me]);

  return (
    <section className={cn(panelCls, "p-4")}>
      <SectionTitle aside="Excelからのコピーも可">手持ちタスクをまとめて登録</SectionTitle>
      <p className="mb-3 text-[12.5px] text-ak-ink2">
        1行に1タスク。「タスク名, 期日, 担当」の順に、カンマかタブで区切って貼り付けてください。期日と担当は省略できます。
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <textarea
            id="imp-text"
            rows={8}
            className={cn(inputCls, "font-mono text-[12.5px]")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"展示会パネルの原稿, 10/30, 佐藤\nショップのバナー差し替え, 11/2\n販促費の月次まとめ"}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input id="imp-title" aria-label="まとめる案件名" className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            <select id="imp-cat" aria-label="種別" className={cn(inputCls, "w-auto")} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIES[c].label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="min-w-0">
          <div className="mb-1 text-[12px] text-ak-ink3">読み取り結果（{rows.length}件）</div>
          <div className="max-h-[220px] overflow-y-auto rounded-md border border-ak-line">
            {rows.length === 0 ? (
              <p className="p-4 text-center text-[12.5px] text-ak-ink3">貼り付けるとここに表示されます。</p>
            ) : (
              <table className="w-full text-[12.5px]">
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t border-ak-wire2 first:border-t-0">
                      <td className="px-2 py-1.5">
                        {r.title}
                        {r.warn && <div className="text-[11px] text-ak-ball">{r.warn}</div>}
                      </td>
                      <td className="tabular whitespace-nowrap px-2 font-mono text-ak-ink2">{fmtMD(r.due)}</td>
                      <td className="whitespace-nowrap px-2 text-ak-ink2">{members.find((m) => m.id === r.assigneeId)?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button
            type="button"
            className={cn(btn.base, btn.primary, "mt-3")}
            disabled={rows.length === 0 || !title.trim()}
            onClick={() => {
              const id = importTasks(title.trim(), category, rows);
              toast(`${rows.length}件を登録しました`);
              setText("");
              router.push(`/anken/projects/${id}`);
            }}
          >
            {rows.length}件を登録する
          </button>
        </div>
      </div>
    </section>
  );
}

const KIND_LABEL: Record<PartyKind, string> = { member: "営業企画課", client: "社内クライアント", vendor: "外注先" };

function PartiesEditor() {
  const parties = useAnken((s) => s.parties);
  const updateParty = useAnken((s) => s.updateParty);
  const addParty = useAnken((s) => s.addParty);
  const [kind, setKind] = useState<Exclude<PartyKind, "member">>("client");
  const [org, setOrg] = useState("");
  const [name, setName] = useState("");

  const row = (p: Party) => (
    <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_56px] gap-2">
      <input
        aria-label={`${p.name}の所属`}
        className={cn(inputCls, "py-1")}
        value={p.org}
        disabled={p.kind === "member"}
        onChange={(e) => updateParty(p.id, { org: e.target.value })}
      />
      <input aria-label={`${p.org}の名前`} className={cn(inputCls, "py-1")} value={p.name} onChange={(e) => updateParty(p.id, { name: e.target.value })} />
      <input
        aria-label={`${p.name}のアイコン文字`}
        maxLength={1}
        className={cn(inputCls, "py-1 text-center")}
        value={p.short}
        onChange={(e) => updateParty(p.id, { short: e.target.value || p.short })}
      />
    </div>
  );

  return (
    <section className={cn(panelCls, "p-4")}>
      <SectionTitle aside="所属・名前・アイコンの1文字">メンバーと相手先</SectionTitle>
      <div className="grid gap-5 lg:grid-cols-3">
        {(["member", "client", "vendor"] as PartyKind[]).map((k) => (
          <div key={k} className="flex flex-col gap-2">
            <h3 className="text-[12.5px] font-bold text-ak-ink2">{KIND_LABEL[k]}</h3>
            {parties.filter((p) => p.kind === k).map(row)}
          </div>
        ))}
      </div>
      <form
        className="mt-4 grid grid-cols-1 gap-2 border-t border-dashed border-ak-line pt-3 sm:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!org.trim() || !name.trim()) return;
          addParty({ kind, org: org.trim(), name: name.trim(), short: org.trim()[0] });
          setOrg("");
          setName("");
        }}
      >
        <select id="pe-kind" aria-label="区分" className={cn(inputCls, "w-auto")} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="client">社内クライアント</option>
          <option value="vendor">外注先</option>
        </select>
        <input id="pe-org" className={inputCls} placeholder="部署名・会社名" value={org} onChange={(e) => setOrg(e.target.value)} />
        <input id="pe-name" className={inputCls} placeholder="担当者名" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className={cn(btn.base, btn.secondary)} disabled={!org.trim() || !name.trim()}>
          追加
        </button>
      </form>
    </section>
  );
}
