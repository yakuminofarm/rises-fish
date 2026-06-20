"use client";

import { useState } from "react";
import { X, Camera, CheckCircle2 } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { Medaka, MedakaVariety, Gender } from "@/types/medaka";
import { generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const VARIETIES: (MedakaVariety | "その他")[] = [
  "幹之", "楊貴妃", "三色", "黒メダカ", "白メダカ", "青メダカ",
  "みゆき", "オロチ", "紅帝", "煌", "サファイア", "夜桜", "その他",
];

interface AddMedakaModalProps {
  onClose: () => void;
}

export function AddMedakaModal({ onClose }: AddMedakaModalProps) {
  const { addMedaka, medakas } = useMedakaStore();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    variety: "幹之" as string,
    customVariety: "",
    gender: "unknown" as Gender,
    birthDate: "",
    acquiredDate: new Date().toISOString().split("T")[0],
    fatherId: "",
    motherId: "",
    notes: "",
    generation: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.name || !form.acquiredDate || submitting || done) return;
    setSubmitting(true);
    const variety = form.variety === "その他" ? form.customVariety || "その他" : form.variety;
    const newMedaka: Medaka = {
      id: generateId(),
      name: form.name,
      variety,
      gender: form.gender,
      birthDate: form.birthDate || undefined,
      acquiredDate: form.acquiredDate,
      parentIds: {
        father: form.fatherId || undefined,
        mother: form.motherId || undefined,
      },
      photos: photoPreview
        ? [{ id: generateId(), url: photoPreview, takenAt: new Date().toISOString() }]
        : [],
      traits: [],
      notes: form.notes,
      isAlive: true,
      generation: form.generation ? parseInt(form.generation) : undefined,
    };
    addMedaka(newMedaka);
    setDone(true);
    showToast(`${form.name} を登録しました`);
    setTimeout(() => onClose(), 800);
  };

  const males = medakas.filter((m) => m.gender === "male" && m.isAlive);
  const females = medakas.filter((m) => m.gender === "female" && m.isAlive);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col">
        {/* sticky header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">メダカを登録</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* scrollable form body - NO submit button here */}
        <div className="overflow-y-auto flex-1 px-4 pt-4 space-y-4">
          {/* 写真 */}
          <div className="flex justify-center">
            <label className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">写真を追加</span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前 *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例: 幹之1号"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">品種</label>
            <select
              value={form.variety}
              onChange={(e) => setForm({ ...form, variety: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              {VARIETIES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
            {form.variety === "その他" && (
              <input
                value={form.customVariety}
                onChange={(e) => setForm({ ...form, customVariety: e.target.value })}
                placeholder="品種名を入力"
                className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <div className="flex gap-2">
              {[
                { value: "male", label: "♂ オス" },
                { value: "female", label: "♀ メス" },
                { value: "unknown", label: "不明" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setForm({ ...form, gender: g.value as Gender })}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-colors min-h-[44px] ${
                    form.gender === g.value
                      ? "bg-cyan-500 text-white border-cyan-500"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">入手日 *</label>
              <input
                type="date"
                value={form.acquiredDate}
                onChange={(e) => setForm({ ...form, acquiredDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">世代 (F1, F2...)</label>
            <input
              type="number"
              min="1"
              value={form.generation}
              onChange={(e) => setForm({ ...form, generation: e.target.value })}
              placeholder="例: 1"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          {medakas.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">♂ 父親</label>
                <select
                  value={form.fatherId}
                  onChange={(e) => setForm({ ...form, fatherId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">なし</option>
                  {males.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">♀ 母親</label>
                <select
                  value={form.motherId}
                  onChange={(e) => setForm({ ...form, motherId: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">なし</option>
                  {females.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <div className="pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="特徴・観察記録など"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            />
          </div>
        </div>

        {/* fixed footer with submit button */}
        <div className="flex-shrink-0 px-4 pt-4 border-t border-gray-100 bg-white pb-safe-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.name || !form.acquiredDate || submitting || done}
            className={`w-full font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-base min-h-[52px] ${
              done
                ? "bg-emerald-500 text-white"
                : !form.name || !form.acquiredDate
                ? "bg-gray-200 text-gray-400"
                : "bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-white"
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
