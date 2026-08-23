"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Expense, ExpenseCategory } from "@/types/kuwagata";
import {
  EXPENSE_CATEGORIES,
  calcCostSummary,
  formatYen,
  larvaCost,
} from "@/lib/kuwagataUtils";
import { formatDateShort, generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

interface ExpenseFormState {
  date: string;
  category: ExpenseCategory;
  amountYen: string;
  memo: string;
}

function emptyForm(): ExpenseFormState {
  return {
    date: new Date().toISOString().split("T")[0],
    category: "ゼリー",
    amountYen: "",
    memo: "",
  };
}

function ExpenseForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: ExpenseFormState;
  onSubmit: (form: ExpenseFormState) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  const canSubmit = form.amountYen !== "" && parseInt(form.amountYen) > 0;
  return (
    <div className="bg-amber-50/70 rounded-2xl p-3.5 space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={inputCls}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
          className={inputCls}
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          value={form.amountYen}
          onChange={(e) => setForm({ ...form, amountYen: e.target.value })}
          placeholder="金額 (円)"
          className={inputCls}
        />
        <input
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          placeholder="メモ (任意)"
          className={inputCls}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1"
        >
          <X className="w-4 h-4" />
          キャンセル
        </button>
        <button
          onClick={() => canSubmit && onSubmit(form)}
          disabled={!canSubmit}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-all ${
            canSubmit ? "bg-amber-600 text-white" : "bg-gray-200 text-gray-400"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export function CostTab() {
  const { beetles, larvae, expenses, addExpense, updateExpense, deleteExpense } =
    useKuwagataStore();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const summary = calcCostSummary(beetles, larvae, expenses);

  // 支出の内訳 (バーリスト用)
  const breakdown: { label: string; amount: number }[] = [
    { label: "生体購入 (成虫)", amount: summary.beetlePurchase },
    { label: "生体購入 (幼虫)", amount: summary.larvaPurchase },
    { label: "ビン・マット代", amount: summary.bottleCost },
    ...EXPENSE_CATEGORIES.map((c) => ({
      label: c,
      amount: summary.expenseByCategory[c] ?? 0,
    })),
  ].filter((b) => b.amount > 0);
  const maxAmount = Math.max(1, ...breakdown.map((b) => b.amount));

  const soldBeetles = beetles
    .filter((b) => b.soldPriceYen != null)
    .sort((a, b) => (b.soldDate ?? "").localeCompare(a.soldDate ?? ""));

  // 個体別コスト上位 (販売価格の参考)
  const costlyLarvae = larvae
    .filter((l) => l.isAlive && larvaCost(l) > 0)
    .sort((a, b) => larvaCost(b) - larvaCost(a))
    .slice(0, 5);

  const sortedExpenses = [...expenses].sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = (form: ExpenseFormState) => {
    const expense: Expense = {
      id: generateId(),
      date: form.date,
      category: form.category,
      amountYen: parseInt(form.amountYen),
      memo: form.memo || undefined,
    };
    addExpense(expense);
    setShowAdd(false);
    showToast("経費を記録しました");
  };

  const handleEdit = (id: string, form: ExpenseFormState) => {
    updateExpense(id, {
      date: form.date,
      category: form.category,
      amountYen: parseInt(form.amountYen),
      memo: form.memo || undefined,
    });
    setEditingId(null);
    showToast("経費を更新しました");
  };

  const balancePositive = summary.balance >= 0;

  return (
    <div className="space-y-5">
      {/* 収支サマリー */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 p-5 text-white shadow-lg">
        <p className="text-[11px] font-bold tracking-wider text-amber-200/70 uppercase">
          収支 (売上 − 支出)
        </p>
        <p
          className="text-3xl font-bold mt-1"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {balancePositive ? "+" : "−"}
          {formatYen(Math.abs(summary.balance)).slice(1)}
          <span className="text-base font-semibold text-amber-100/60 ml-1">円</span>
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-[11px] text-amber-100/50 font-semibold">総支出</p>
            <p className="text-lg font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatYen(summary.totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-amber-100/50 font-semibold">販売による売上</p>
            <p className="text-lg font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatYen(summary.salesTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* 支出の内訳 */}
      {breakdown.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-2 px-0.5">支出の内訳</h2>
          <div className="bg-white rounded-2xl border border-amber-100/60 p-4 space-y-3">
            {breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm text-gray-600">{b.label}</span>
                  <span
                    className="text-sm font-bold text-gray-900"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatYen(b.amount)}
                  </span>
                </div>
                <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 rounded-full"
                    style={{ width: `${Math.max(3, (b.amount / maxAmount) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 個体別コスト */}
      {costlyLarvae.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-1 px-0.5">幼虫の個体別コスト</h2>
          <p className="text-xs text-gray-400 mb-2 px-0.5">
            入手金額 + ビン代の累計。販売価格を決める目安に。
          </p>
          <div className="bg-white rounded-2xl border border-amber-100/60 divide-y divide-gray-50">
            {costlyLarvae.map((l) => (
              <div key={l.id} className="px-4 py-2.5 flex justify-between items-center">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{l.code}</p>
                  <p className="text-xs text-gray-400 truncate">{l.species}</p>
                </div>
                <p
                  className="text-sm font-bold text-amber-700"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatYen(larvaCost(l))}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 販売記録 */}
      <section>
        <h2 className="text-sm font-bold text-gray-800 mb-1 px-0.5">販売記録</h2>
        <p className="text-xs text-gray-400 mb-2 px-0.5">
          成虫の詳細画面から「販売を記録」で追加できます。
        </p>
        {soldBeetles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-amber-100/60 p-4 text-center">
            <p className="text-sm text-gray-400">まだ販売記録はありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-amber-100/60 divide-y divide-gray-50">
            {soldBeetles.map((b) => (
              <div key={b.id} className="px-4 py-2.5 flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {b.code}
                    <span className="text-xs font-normal text-gray-400 ml-1.5">{b.species}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {b.soldDate && formatDateShort(b.soldDate)}
                    {b.soldTo && ` → ${b.soldTo}`}
                  </p>
                </div>
                <p
                  className="text-sm font-bold text-emerald-600 flex-shrink-0"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {formatYen(b.soldPriceYen!)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 消耗品・経費 */}
      <section className="pb-2">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <h2 className="text-sm font-bold text-gray-800">消耗品・経費の記録</h2>
          {!showAdd && (
            <button
              onClick={() => {
                setShowAdd(true);
                setEditingId(null);
              }}
              className="text-xs font-bold text-amber-700 flex items-center gap-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              追加
            </button>
          )}
        </div>

        {showAdd && (
          <div className="mb-3">
            <ExpenseForm
              initial={emptyForm()}
              onSubmit={handleAdd}
              onCancel={() => setShowAdd(false)}
              submitLabel="記録する"
            />
          </div>
        )}

        {sortedExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-amber-100/60 p-4 text-center">
            <p className="text-sm text-gray-400">
              ゼリーやマットの購入費を記録しましょう
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sortedExpenses.map((e) =>
              editingId === e.id ? (
                <ExpenseForm
                  key={e.id}
                  initial={{
                    date: e.date,
                    category: e.category,
                    amountYen: String(e.amountYen),
                    memo: e.memo ?? "",
                  }}
                  onSubmit={(form) => handleEdit(e.id, form)}
                  onCancel={() => setEditingId(null)}
                  submitLabel="更新する"
                />
              ) : (
                <div
                  key={e.id}
                  className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {e.category}
                      {e.memo && (
                        <span className="text-xs font-normal text-gray-400 ml-1.5">{e.memo}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{formatDateShort(e.date)}</p>
                  </div>
                  <p
                    className="text-sm font-bold text-gray-900 flex-shrink-0"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatYen(e.amountYen)}
                  </p>
                  <button
                    onClick={() => {
                      setEditingId(e.id);
                      setShowAdd(false);
                      setConfirmDeleteId(null);
                    }}
                    className="p-1.5 text-gray-300 hover:text-amber-600 flex-shrink-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDeleteId === e.id) {
                        deleteExpense(e.id);
                        setConfirmDeleteId(null);
                        showToast("経費を削除しました");
                      } else {
                        setConfirmDeleteId(e.id);
                      }
                    }}
                    className={`p-1.5 flex-shrink-0 ${
                      confirmDeleteId === e.id ? "text-red-500" : "text-gray-300 hover:text-red-400"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
