"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { BottleChange, Gender, Larva } from "@/types/kuwagata";
import { STAGE_COLORS, STAGE_LABELS, formatYen, larvaCost } from "@/lib/kuwagataUtils";
import { formatDate, formatDateShort, generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface LarvaDetailModalProps {
  larva: Larva;
  onClose: () => void;
}

const inputCls =
  "kuwa-input";

interface ChangeFormState {
  date: string;
  bottleType: string;
  bottleSize: string;
  weightG: string;
  costYen: string;
  memo: string;
}

function emptyChangeForm(): ChangeFormState {
  return {
    date: new Date().toISOString().split("T")[0],
    bottleType: "菌糸ビン",
    bottleSize: "800cc",
    weightG: "",
    costYen: "",
    memo: "",
  };
}

function BottleChangeForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: ChangeFormState;
  onSubmit: (form: ChangeFormState) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);
  return (
    <div className="bg-[#d7e0b8]/50 rounded-2xl p-3.5 space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className={inputCls}
        />
        <input
          type="number"
          step="0.1"
          min="0"
          value={form.weightG}
          onChange={(e) => setForm({ ...form, weightG: e.target.value })}
          placeholder="体重 (g)"
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select
          value={form.bottleType}
          onChange={(e) => setForm({ ...form, bottleType: e.target.value })}
          className={inputCls}
        >
          {["菌糸ビン", "カワラ菌糸", "発酵マット", "プリンカップ"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={form.bottleSize}
          onChange={(e) => setForm({ ...form, bottleSize: e.target.value })}
          className={inputCls}
        >
          {["200cc", "500cc", "800cc", "1400cc", "2000cc", "3000cc"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          min="0"
          value={form.costYen}
          onChange={(e) => setForm({ ...form, costYen: e.target.value })}
          placeholder="ビン代 (円)"
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
          className="flex-1 py-2.5 rounded-xl border border-[rgba(107,68,35,0.16)] text-[#77644b] text-sm font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-1"
        >
          <X className="w-4 h-4" />
          やめる
        </button>
        <button
          onClick={() => onSubmit(form)}
          className="flex-1 py-2.5 rounded-xl bg-[#55682f] text-[#fdf6e7] text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

export function LarvaDetailModal({ larva: initial, onClose }: LarvaDetailModalProps) {
  const {
    larvae,
    lines,
    updateLarva,
    deleteLarva,
    addBottleChange,
    updateBottleChange,
    deleteBottleChange,
  } = useKuwagataStore();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [editingChangeId, setEditingChangeId] = useState<string | null>(null);
  const [confirmDeleteChangeId, setConfirmDeleteChangeId] = useState<string | null>(null);

  const larva = larvae.find((l) => l.id === initial.id) ?? initial;
  const line = larva.lineId ? lines.find((l) => l.id === larva.lineId) : undefined;

  const today = new Date().toISOString().split("T")[0];
  const [emergeForm, setEmergeForm] = useState({ date: today, sizeMm: "" });

  const sortedChanges = [...larva.bottleChanges].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const chartData = sortedChanges
    .filter((c) => c.weightG != null)
    .map((c) => ({ date: formatDateShort(c.date), weight: c.weightG }));

  const totalCost = larvaCost(larva);

  const submitAdd = (form: ChangeFormState) => {
    const change: BottleChange = {
      id: generateId(),
      date: form.date,
      bottleType: form.bottleType,
      bottleSize: form.bottleSize || undefined,
      weightG: form.weightG ? parseFloat(form.weightG) : undefined,
      costYen: form.costYen ? parseInt(form.costYen) : undefined,
      memo: form.memo || undefined,
    };
    addBottleChange(larva.id, change);
    setShowChangeForm(false);
    showToast("交換を記録しました！");
  };

  const submitEdit = (changeId: string, form: ChangeFormState) => {
    updateBottleChange(larva.id, changeId, {
      date: form.date,
      bottleType: form.bottleType,
      bottleSize: form.bottleSize || undefined,
      weightG: form.weightG ? parseFloat(form.weightG) : undefined,
      costYen: form.costYen ? parseInt(form.costYen) : undefined,
      memo: form.memo || undefined,
    });
    setEditingChangeId(null);
    showToast("書きかえました");
  };

  const setGender = (gender: Gender) => updateLarva(larva.id, { gender });

  const advanceStage = () => {
    if (larva.stage === "egg") updateLarva(larva.id, { stage: "L1" });
    else if (larva.stage === "L1") updateLarva(larva.id, { stage: "L2" });
    else if (larva.stage === "L2") updateLarva(larva.id, { stage: "L3" });
  };

  const recordPupa = () => {
    updateLarva(larva.id, { stage: "pupa", pupaDate: today });
    showToast("蛹化を記録しました！");
  };

  const recordEmerge = () => {
    updateLarva(larva.id, {
      stage: "adult",
      emergedDate: emergeForm.date,
      emergedSizeMm: emergeForm.sizeMm ? parseFloat(emergeForm.sizeMm) : undefined,
    });
    showToast("羽化おめでとうございます！");
  };

  const handleDelete = () => {
    deleteLarva(larva.id);
    showToast(`${larva.code} を消しました`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(36,26,17,0.55)" }} onClick={onClose}>
      <div
        className="kuwa-sheet w-full max-w-md mx-auto max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kuwa-sheet-bar sticky top-0 px-5 py-4 flex items-center justify-between flex-shrink-0 rounded-t-[24px]">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-bold text-[#31241a] truncate">{larva.code}</h2>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${STAGE_COLORS[larva.stage]}`}
            >
              {STAGE_LABELS[larva.stage]}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#e6dbc6]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
          {/* 基本情報 */}
          <div className="bg-[#d7e0b8]/50 rounded-2xl px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b7a64]">種類</span>
              <span className="font-semibold text-[#31241a]">{larva.species}</span>
            </div>
            {line && (
              <div className="flex justify-between">
                <span className="text-[#8b7a64]">出身ライン</span>
                <span className="font-semibold text-[#31241a]">{line.name}</span>
              </div>
            )}
            {larva.hatchDate && (
              <div className="flex justify-between">
                <span className="text-[#8b7a64]">孵化 / 割出日</span>
                <span className="font-semibold text-[#31241a]">{formatDate(larva.hatchDate)}</span>
              </div>
            )}
            {larva.pupaDate && (
              <div className="flex justify-between">
                <span className="text-[#8b7a64]">蛹化日</span>
                <span className="font-semibold text-[#31241a]">{formatDate(larva.pupaDate)}</span>
              </div>
            )}
            {larva.emergedDate && (
              <div className="flex justify-between">
                <span className="text-[#8b7a64]">羽化日</span>
                <span className="font-semibold text-[#31241a]">
                  {formatDate(larva.emergedDate)}
                  {larva.emergedSizeMm != null && ` (${larva.emergedSizeMm}mm)`}
                </span>
              </div>
            )}
            {larva.priceYen != null && (
              <div className="flex justify-between">
                <span className="text-[#8b7a64]">入手金額</span>
                <span className="font-semibold text-[#31241a]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatYen(larva.priceYen)}
                </span>
              </div>
            )}
            {totalCost > 0 && (
              <div className="flex justify-between pt-1 mt-1 border-t border-[rgba(107,68,35,0.16)]">
                <span className="text-[#77644b] font-semibold">この個体のコスト累計</span>
                <span className="font-bold text-[#8a5410]" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatYen(totalCost)}
                </span>
              </div>
            )}
          </div>

          {/* 雌雄判別 */}
          {larva.stage !== "adult" && (
            <div>
              <h3 className="text-sm font-bold text-[#31241a] mb-2">雌雄判別</h3>
              <div className="flex gap-2">
                {[
                  { value: "male", label: "♂ オス" },
                  { value: "female", label: "♀ メス" },
                  { value: "unknown", label: "不明" },
                ].map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value as Gender)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                      larva.gender === g.value
                        ? "bg-[#55682f] text-[#fdf6e7] border-[#55682f]"
                        : "border-[rgba(107,68,35,0.16)] text-[#77644b]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 体重推移 */}
          {chartData.length >= 2 && (
            <div>
              <h3 className="text-sm font-bold text-[#31241a] mb-2">体重推移</h3>
              <div className="bg-white border border-[rgba(107,68,35,0.16)] rounded-2xl p-3">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,68,35,0.14)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#77644b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#77644b" }} unit="g" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "1px solid rgba(107,68,35,0.16)", background: "#fffdf6", boxShadow: "0 6px 20px rgba(84,58,30,0.14)" }}
                      formatter={(v) => [`${v}g`, "体重"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#55682f"
                      strokeWidth={2.5}
                      dot={{ fill: "#55682f", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ビン交換履歴 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#31241a]">ビン交換履歴</h3>
              {!showChangeForm && (
                <button
                  onClick={() => {
                    setShowChangeForm(true);
                    setEditingChangeId(null);
                  }}
                  className="text-xs font-bold text-[#55682f] flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  交換を記録
                </button>
              )}
            </div>

            {showChangeForm && (
              <div className="mb-3">
                <BottleChangeForm
                  initial={emptyChangeForm()}
                  onSubmit={submitAdd}
                  onCancel={() => setShowChangeForm(false)}
                  submitLabel="記録する"
                />
              </div>
            )}

            {sortedChanges.length === 0 ? (
              <p className="text-sm text-[#8b7a64] bg-[#f1e7d5] rounded-xl px-3.5 py-3">
                まだ記録がありません
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...sortedChanges].reverse().map((c) =>
                  editingChangeId === c.id ? (
                    <BottleChangeForm
                      key={c.id}
                      initial={{
                        date: c.date,
                        bottleType: c.bottleType,
                        bottleSize: c.bottleSize ?? "800cc",
                        weightG: c.weightG != null ? String(c.weightG) : "",
                        costYen: c.costYen != null ? String(c.costYen) : "",
                        memo: c.memo ?? "",
                      }}
                      onSubmit={(form) => submitEdit(c.id, form)}
                      onCancel={() => setEditingChangeId(null)}
                      submitLabel="更新する"
                    />
                  ) : (
                    <div
                      key={c.id}
                      className="bg-white border border-[rgba(107,68,35,0.16)] rounded-xl px-3.5 py-2.5 flex items-center gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#31241a]">
                          {c.bottleType}
                          {c.bottleSize && <span className="text-[#8b7a64] font-normal"> {c.bottleSize}</span>}
                          {c.costYen != null && (
                            <span className="text-xs font-semibold text-[#8a5410] ml-1.5">
                              {formatYen(c.costYen)}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#8b7a64]">
                          {formatDateShort(c.date)}
                          {c.memo && ` ・ ${c.memo}`}
                        </p>
                      </div>
                      {c.weightG != null && (
                        <p className="text-base font-bold text-[#55682f] flex-shrink-0">
                          {c.weightG}
                          <span className="text-xs text-[#8b7a64] font-semibold">g</span>
                        </p>
                      )}
                      <button
                        onClick={() => {
                          setEditingChangeId(c.id);
                          setShowChangeForm(false);
                          setConfirmDeleteChangeId(null);
                        }}
                        className="p-1.5 text-[#b3a189] hover:text-[#55682f] flex-shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirmDeleteChangeId === c.id) {
                            deleteBottleChange(larva.id, c.id);
                            setConfirmDeleteChangeId(null);
                            showToast("消しました");
                          } else {
                            setConfirmDeleteChangeId(c.id);
                          }
                        }}
                        className={`p-1.5 flex-shrink-0 ${
                          confirmDeleteChangeId === c.id
                            ? "text-[#a3502f]"
                            : "text-[#b3a189] hover:text-[#c08a76]"
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                )}
              </div>
            )}
            {confirmDeleteChangeId && (
              <p className="text-xs text-[#a3502f] mt-1.5 px-0.5">
                もう一度ゴミ箱をタップすると削除されます
              </p>
            )}
          </div>

          {/* ステージ操作 */}
          {larva.stage !== "adult" && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-[#31241a]">ステージ更新</h3>
              {(larva.stage === "egg" || larva.stage === "L1" || larva.stage === "L2") && (
                <button
                  onClick={advanceStage}
                  className="w-full py-3 rounded-xl border border-[rgba(85,104,47,0.4)] text-[#55682f] text-sm font-bold active:scale-[0.98] transition-all"
                >
                  {larva.stage === "egg" ? "孵化 (初齢へ)" : larva.stage === "L1" ? "2齢に脱皮" : "3齢に脱皮"}
                </button>
              )}
              {larva.stage === "L3" && (
                <button
                  onClick={recordPupa}
                  className="w-full py-3 rounded-xl border border-[rgba(163,102,15,0.4)] text-[#a3660f] text-sm font-bold active:scale-[0.98] transition-all"
                >
                  蛹化を記録
                </button>
              )}
              {larva.stage === "pupa" && (
                <div className="bg-[#e6cfa8]/60 rounded-2xl p-3.5 space-y-2.5">
                  <p className="text-sm font-bold text-[#31241a]">羽化を記録</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={emergeForm.date}
                      onChange={(e) => setEmergeForm({ ...emergeForm, date: e.target.value })}
                      className={inputCls}
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={emergeForm.sizeMm}
                      onChange={(e) => setEmergeForm({ ...emergeForm, sizeMm: e.target.value })}
                      placeholder="サイズ (mm)"
                      className={inputCls}
                    />
                  </div>
                  <button
                    onClick={recordEmerge}
                    className="w-full py-2.5 rounded-xl bg-[#7a4f1e] text-[#fdf6e7] text-sm font-bold active:scale-[0.98] transition-all"
                  >
                    🎉 羽化を記録
                  </button>
                </div>
              )}
            </div>
          )}

          {larva.notes && (
            <div>
              <h3 className="text-sm font-bold text-[#31241a] mb-1.5">メモ</h3>
              <p className="text-sm text-[#77644b] bg-[#f1e7d5] rounded-xl px-3.5 py-3 whitespace-pre-wrap">
                {larva.notes}
              </p>
            </div>
          )}

          <div className="flex gap-2 pb-2">
            <button
              onClick={() => {
                updateLarva(larva.id, { isAlive: !larva.isAlive });
                showToast(larva.isAlive ? "死亡として記録しました" : "生存中に戻しました");
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-[rgba(107,68,35,0.16)] text-[#77644b] active:scale-[0.98] transition-all"
            >
              {larva.isAlive ? "死亡を記録" : "生存中に戻す"}
            </button>
            <button
              onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
                confirmDelete
                  ? "bg-[#a3502f] text-[#fdf6e7] border-[#a3502f]"
                  : "border-[rgba(163,80,47,0.4)] text-[#a3502f]"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? "ほんとうに消す" : "削除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
