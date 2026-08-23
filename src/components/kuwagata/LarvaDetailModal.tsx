"use client";

import { useState } from "react";
import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
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
import { STAGE_COLORS, STAGE_LABELS } from "@/lib/kuwagataUtils";
import { formatDate, formatDateShort, generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface LarvaDetailModalProps {
  larva: Larva;
  onClose: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400";

export function LarvaDetailModal({ larva: initial, onClose }: LarvaDetailModalProps) {
  const { larvae, lines, updateLarva, deleteLarva, addBottleChange } = useKuwagataStore();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showChangeForm, setShowChangeForm] = useState(false);

  const larva = larvae.find((l) => l.id === initial.id) ?? initial;
  const line = larva.lineId ? lines.find((l) => l.id === larva.lineId) : undefined;

  const today = new Date().toISOString().split("T")[0];
  const [changeForm, setChangeForm] = useState({
    date: today,
    bottleType: "菌糸ビン",
    bottleSize: "800cc",
    weightG: "",
    memo: "",
  });
  const [emergeForm, setEmergeForm] = useState({ date: today, sizeMm: "" });

  const sortedChanges = [...larva.bottleChanges].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const chartData = sortedChanges
    .filter((c) => c.weightG != null)
    .map((c) => ({ date: formatDateShort(c.date), weight: c.weightG }));

  const submitChange = () => {
    const change: BottleChange = {
      id: generateId(),
      date: changeForm.date,
      bottleType: changeForm.bottleType,
      bottleSize: changeForm.bottleSize || undefined,
      weightG: changeForm.weightG ? parseFloat(changeForm.weightG) : undefined,
      memo: changeForm.memo || undefined,
    };
    addBottleChange(larva.id, change);
    setShowChangeForm(false);
    setChangeForm({ ...changeForm, weightG: "", memo: "" });
    showToast("ビン交換を記録しました");
  };

  const setGender = (gender: Gender) => updateLarva(larva.id, { gender });

  const advanceStage = () => {
    if (larva.stage === "egg") updateLarva(larva.id, { stage: "L1" });
    else if (larva.stage === "L1") updateLarva(larva.id, { stage: "L2" });
    else if (larva.stage === "L2") updateLarva(larva.id, { stage: "L3" });
  };

  const recordPupa = () => {
    updateLarva(larva.id, { stage: "pupa", pupaDate: today });
    showToast("蛹化を記録しました");
  };

  const recordEmerge = () => {
    updateLarva(larva.id, {
      stage: "adult",
      emergedDate: emergeForm.date,
      emergedSizeMm: emergeForm.sizeMm ? parseFloat(emergeForm.sizeMm) : undefined,
    });
    showToast("羽化を記録しました🎉");
  };

  const handleDelete = () => {
    deleteLarva(larva.id);
    showToast(`${larva.code} を削除しました`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{larva.code}</h2>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${STAGE_COLORS[larva.stage]}`}
            >
              {STAGE_LABELS[larva.stage]}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
          {/* 基本情報 */}
          <div className="bg-emerald-50/50 rounded-2xl px-4 py-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">種類</span>
              <span className="font-semibold text-gray-800">{larva.species}</span>
            </div>
            {line && (
              <div className="flex justify-between">
                <span className="text-gray-400">出身ライン</span>
                <span className="font-semibold text-gray-800">{line.name}</span>
              </div>
            )}
            {larva.hatchDate && (
              <div className="flex justify-between">
                <span className="text-gray-400">孵化 / 割出日</span>
                <span className="font-semibold text-gray-800">{formatDate(larva.hatchDate)}</span>
              </div>
            )}
            {larva.pupaDate && (
              <div className="flex justify-between">
                <span className="text-gray-400">蛹化日</span>
                <span className="font-semibold text-gray-800">{formatDate(larva.pupaDate)}</span>
              </div>
            )}
            {larva.emergedDate && (
              <div className="flex justify-between">
                <span className="text-gray-400">羽化日</span>
                <span className="font-semibold text-gray-800">
                  {formatDate(larva.emergedDate)}
                  {larva.emergedSizeMm != null && ` (${larva.emergedSizeMm}mm)`}
                </span>
              </div>
            )}
          </div>

          {/* 雌雄判別 */}
          {larva.stage !== "adult" && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">雌雄判別</h3>
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
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-gray-200 text-gray-600"
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
              <h3 className="text-sm font-bold text-gray-800 mb-2">体重推移</h3>
              <div className="bg-white border border-emerald-100 rounded-2xl p-3">
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit="g" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                      formatter={(v) => [`${v}g`, "体重"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: "#10b981", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ビン交換履歴 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-800">ビン交換履歴</h3>
              {larva.stage !== "adult" && larva.stage !== "pupa" && (
                <button
                  onClick={() => setShowChangeForm(!showChangeForm)}
                  className="text-xs font-bold text-emerald-600 flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  交換を記録
                </button>
              )}
            </div>

            {showChangeForm && (
              <div className="bg-emerald-50/50 rounded-2xl p-3.5 space-y-2.5 mb-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={changeForm.date}
                    onChange={(e) => setChangeForm({ ...changeForm, date: e.target.value })}
                    className={inputCls}
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={changeForm.weightG}
                    onChange={(e) => setChangeForm({ ...changeForm, weightG: e.target.value })}
                    placeholder="体重 (g)"
                    className={inputCls}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={changeForm.bottleType}
                    onChange={(e) => setChangeForm({ ...changeForm, bottleType: e.target.value })}
                    className={inputCls}
                  >
                    {["菌糸ビン", "カワラ菌糸", "発酵マット", "プリンカップ"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={changeForm.bottleSize}
                    onChange={(e) => setChangeForm({ ...changeForm, bottleSize: e.target.value })}
                    className={inputCls}
                  >
                    {["200cc", "500cc", "800cc", "1400cc", "2000cc", "3000cc"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <input
                  value={changeForm.memo}
                  onChange={(e) => setChangeForm({ ...changeForm, memo: e.target.value })}
                  placeholder="メモ (任意)"
                  className={inputCls}
                />
                <button
                  onClick={submitChange}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  記録する
                </button>
              </div>
            )}

            {sortedChanges.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-xl px-3.5 py-3">
                まだ記録がありません
              </p>
            ) : (
              <div className="space-y-1.5">
                {[...sortedChanges].reverse().map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {c.bottleType}
                        {c.bottleSize && <span className="text-gray-400 font-normal"> {c.bottleSize}</span>}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDateShort(c.date)}
                        {c.memo && ` ・ ${c.memo}`}
                      </p>
                    </div>
                    {c.weightG != null && (
                      <p className="text-base font-bold text-emerald-600 flex-shrink-0">
                        {c.weightG}
                        <span className="text-xs text-gray-400 font-semibold">g</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ステージ操作 */}
          {larva.stage !== "adult" && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">ステージ更新</h3>
              {(larva.stage === "egg" || larva.stage === "L1" || larva.stage === "L2") && (
                <button
                  onClick={advanceStage}
                  className="w-full py-3 rounded-xl border border-emerald-200 text-emerald-600 text-sm font-bold active:scale-[0.98] transition-all"
                >
                  {larva.stage === "egg" ? "孵化 (初齢へ)" : larva.stage === "L1" ? "2齢に脱皮" : "3齢に脱皮"}
                </button>
              )}
              {larva.stage === "L3" && (
                <button
                  onClick={recordPupa}
                  className="w-full py-3 rounded-xl border border-amber-200 text-amber-600 text-sm font-bold active:scale-[0.98] transition-all"
                >
                  蛹化を記録
                </button>
              )}
              {larva.stage === "pupa" && (
                <div className="bg-violet-50/60 rounded-2xl p-3.5 space-y-2.5">
                  <p className="text-sm font-bold text-gray-800">羽化を記録</p>
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
                    className="w-full py-2.5 rounded-xl bg-violet-500 text-white text-sm font-bold active:scale-[0.98] transition-all"
                  >
                    🎉 羽化を記録
                  </button>
                </div>
              )}
            </div>
          )}

          {larva.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1.5">メモ</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-3 whitespace-pre-wrap">
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
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 active:scale-[0.98] transition-all"
            >
              {larva.isAlive ? "死亡を記録" : "生存中に戻す"}
            </button>
            <button
              onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all ${
                confirmDelete
                  ? "bg-red-500 text-white border-red-500"
                  : "border-red-200 text-red-500"
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? "本当に削除" : "削除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
