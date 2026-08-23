"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Gender, Larva, LarvaStage } from "@/types/kuwagata";
import { SPECIES_OPTIONS, STAGE_LABELS } from "@/lib/kuwagataUtils";
import { generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface AddLarvaModalProps {
  onClose: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400";

export function AddLarvaModal({ onClose }: AddLarvaModalProps) {
  const { lines, addLarva } = useKuwagataStore();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    code: "",
    lineId: "",
    species: "オオクワガタ",
    customSpecies: "",
    stage: "L1" as LarvaStage,
    gender: "unknown" as Gender,
    hatchDate: new Date().toISOString().split("T")[0],
    priceYen: "",
    notes: "",
  });

  const canSubmit = form.code.trim() !== "";

  const handleLineChange = (lineId: string) => {
    const line = lines.find((l) => l.id === lineId);
    setForm({
      ...form,
      lineId,
      species: line ? line.species : form.species,
    });
  };

  const handleSubmit = () => {
    if (!canSubmit || submitting || done) return;
    setSubmitting(true);
    const species =
      form.species === "その他" ? form.customSpecies || "その他" : form.species;
    const larva: Larva = {
      id: generateId(),
      code: form.code.trim(),
      lineId: form.lineId || undefined,
      species,
      stage: form.stage,
      gender: form.gender,
      hatchDate: form.hatchDate || undefined,
      priceYen: form.priceYen ? parseInt(form.priceYen) : undefined,
      bottleChanges: [],
      isAlive: true,
      notes: form.notes,
    };
    addLarva(larva);
    setDone(true);
    showToast(`${larva.code} を登録しました`);
    setTimeout(() => onClose(), 800);
  };

  const stageOptions: LarvaStage[] = ["egg", "L1", "L2", "L3", "pupa"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">幼虫を登録</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">管理番号 *</label>
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="例: 2026-A-13"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">出身ライン</label>
            <select
              value={form.lineId}
              onChange={(e) => handleLineChange(e.target.value)}
              className={inputCls}
            >
              <option value="">なし (単独購入など)</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.species})</option>
              ))}
            </select>
          </div>

          {!form.lineId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value })}
                className={inputCls}
              >
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {form.species === "その他" && (
                <input
                  value={form.customSpecies}
                  onChange={(e) => setForm({ ...form, customSpecies: e.target.value })}
                  placeholder="種類名を入力"
                  className={`mt-2 ${inputCls}`}
                />
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステージ</label>
            <div className="flex gap-1.5">
              {stageOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, stage: s })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                    form.stage === s
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">孵化 / 割出日</label>
              <input
                type="date"
                value={form.hatchDate}
                onChange={(e) => setForm({ ...form, hatchDate: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">雌雄</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })}
                className={inputCls}
              >
                <option value="unknown">不明</option>
                <option value="male">♂ オス</option>
                <option value="female">♀ メス</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入手金額 (円)</label>
            <input
              type="number"
              min="0"
              value={form.priceYen}
              onChange={(e) => setForm({ ...form, priceYen: e.target.value })}
              placeholder="購入幼虫の場合 (収支管理に反映)"
              className={inputCls}
            />
          </div>

          <div className="pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="購入元・特記事項など"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pt-4 border-t border-gray-100 bg-white pb-safe-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || submitting || done}
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base min-h-[52px] ${
              done
                ? "bg-emerald-500 text-white"
                : !canSubmit
                ? "bg-gray-200 text-gray-400"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white"
            }`}
          >
            {done ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                登録しました！
              </>
            ) : submitting ? (
              "登録中..."
            ) : (
              "登録する"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
