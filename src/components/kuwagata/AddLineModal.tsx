"use client";

import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { BreedingLine } from "@/types/kuwagata";
import { SPECIES_OPTIONS } from "@/lib/kuwagataUtils";
import { generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface AddLineModalProps {
  onClose: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

export function AddLineModal({ onClose }: AddLineModalProps) {
  const { beetles, addLine } = useKuwagataStore();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "オオクワガタ",
    customSpecies: "",
    maleId: "",
    femaleId: "",
    pairingDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const males = beetles.filter((b) => b.gender === "male" && b.isAlive);
  const females = beetles.filter((b) => b.gender === "female" && b.isAlive);

  const canSubmit = form.name.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit || submitting || done) return;
    setSubmitting(true);
    const species =
      form.species === "その他" ? form.customSpecies || "その他" : form.species;
    const line: BreedingLine = {
      id: generateId(),
      name: form.name.trim(),
      species,
      maleId: form.maleId || undefined,
      femaleId: form.femaleId || undefined,
      pairingDate: form.pairingDate || undefined,
      status: "pairing",
      notes: form.notes,
    };
    addLine(line);
    setDone(true);
    showToast(`ライン ${line.name} を作成しました`);
    setTimeout(() => onClose(), 800);
  };

  const beetleLabel = (id: string) => {
    const b = beetles.find((x) => x.id === id);
    return b ? `${b.code}${b.sizeMm ? ` (${b.sizeMm}mm)` : ""}` : "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">ブリードラインを作成</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ライン名 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例: 2026-A"
              className={inputCls}
            />
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">♂ 種親オス</label>
              <select
                value={form.maleId}
                onChange={(e) => setForm({ ...form, maleId: e.target.value })}
                className={inputCls}
              >
                <option value="">未選択</option>
                {males.map((b) => (
                  <option key={b.id} value={b.id}>{beetleLabel(b.id)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">♀ 種親メス</label>
              <select
                value={form.femaleId}
                onChange={(e) => setForm({ ...form, femaleId: e.target.value })}
                className={inputCls}
              >
                <option value="">未選択</option>
                {females.map((b) => (
                  <option key={b.id} value={b.id}>{beetleLabel(b.id)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ペアリング開始日</label>
            <input
              type="date"
              value={form.pairingDate}
              onChange={(e) => setForm({ ...form, pairingDate: e.target.value })}
              className={inputCls}
            />
          </div>

          <div className="pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="狙い・組み合わせの意図など"
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
                : "bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white"
            }`}
          >
            {done ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                作成しました！
              </>
            ) : submitting ? (
              "作成中..."
            ) : (
              "作成する"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
