"use client";

import { useState } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { BreedingRecord } from "@/types/medaka";
import { generateId } from "@/lib/utils";
import { getVarietyColor } from "@/components/ui/MedakaIllustration";
import { VarietyMedakaSVG } from "@/components/ui/MedakaVarietyIllustration";

function BreedingRecordCard({ record }: { record: BreedingRecord }) {
  const { medakas } = useMedakaStore();
  const father = medakas.find((m) => m.id === record.fatherId);
  const mother = medakas.find((m) => m.id === record.motherId);

  const borderColor =
    record.success === true
      ? "border-green-400"
      : record.success === false
      ? "border-red-400"
      : "border-gray-200";

  const successBadge =
    record.success === true ? (
      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">成功</span>
    ) : record.success === false ? (
      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">失敗</span>
    ) : null;

  const hatchRate =
    record.eggCount && record.hatchCount
      ? Math.round((record.hatchCount / record.eggCount) * 100)
      : null;

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${borderColor} border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {father && (
            <div className="flex items-center gap-1">
              <div
                className="w-8 h-6 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: `${getVarietyColor(father.variety)}14` }}
              >
                <VarietyMedakaSVG variety={father.variety} size={32} />
              </div>
              <span className="text-xs font-medium text-blue-600">{father.name}</span>
            </div>
          )}
          {father && mother && <span className="text-gray-400 text-xs">×</span>}
          {mother && (
            <div className="flex items-center gap-1">
              <div
                className="w-8 h-6 rounded-lg overflow-hidden flex items-center justify-center"
                style={{ background: `${getVarietyColor(mother.variety)}14` }}
              >
                <VarietyMedakaSVG variety={mother.variety} size={32} />
              </div>
              <span className="text-xs font-medium text-pink-600">{mother.name}</span>
            </div>
          )}
        </div>
        {successBadge}
      </div>

      <p className="text-xs text-gray-400 mb-2">{record.breedingDate}</p>

      {(record.eggCount != null || record.hatchCount != null) && (
        <div className="flex items-center gap-2 text-sm mb-1">
          {record.eggCount != null && (
            <span className="text-gray-600">卵 {record.eggCount}個</span>
          )}
          {record.eggCount != null && record.hatchCount != null && (
            <ArrowRight className="w-3 h-3 text-gray-400" />
          )}
          {record.hatchCount != null && (
            <span className="text-gray-600">孵化 {record.hatchCount}匹</span>
          )}
          {hatchRate != null && (
            <span className="text-xs text-cyan-600 font-medium ml-1">({hatchRate}%)</span>
          )}
        </div>
      )}

      {record.offspringIds.length > 0 && (
        <p className="text-xs text-gray-500">稚魚登録: {record.offspringIds.length}匹</p>
      )}

      {record.notes && (
        <p className="text-xs text-gray-500 mt-2 border-t border-gray-50 pt-2">{record.notes}</p>
      )}
    </div>
  );
}

function AddBreedingRecordModal({ onClose }: { onClose: () => void }) {
  const { medakas, addBreedingRecord } = useMedakaStore();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    fatherId: "",
    motherId: "",
    breedingDate: today,
    eggCount: "",
    notes: "",
  });

  const males = medakas.filter((m) => m.gender === "male" && m.isAlive);
  const females = medakas.filter((m) => m.gender === "female" && m.isAlive);

  const handleSubmit = () => {
    if (!form.breedingDate) return;
    const record: BreedingRecord = {
      id: generateId(),
      fatherId: form.fatherId,
      motherId: form.motherId,
      breedingDate: form.breedingDate,
      eggCount: form.eggCount ? parseInt(form.eggCount) : undefined,
      offspringIds: [],
      notes: form.notes,
    };
    addBreedingRecord(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">繁殖記録を追加</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">♂ 父親</label>
            <select
              value={form.fatherId}
              onChange={(e) => setForm({ ...form, fatherId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">選択してください</option>
              {males.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.variety})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">♀ 母親</label>
            <select
              value={form.motherId}
              onChange={(e) => setForm({ ...form, motherId: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="">選択してください</option>
              {females.map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.variety})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">交配日 *</label>
            <input
              type="date"
              value={form.breedingDate}
              onChange={(e) => setForm({ ...form, breedingDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">採卵数</label>
            <input
              type="number"
              min="0"
              value={form.eggCount}
              onChange={(e) => setForm({ ...form, eggCount: e.target.value })}
              placeholder="例: 20"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="観察記録など"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            />
          </div>
        </div>

        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100 bg-white">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!form.breedingDate}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-2xl transition-colors"
          >
            記録する
          </button>
        </div>
      </div>
    </div>
  );
}

export function BreedingRecordSection() {
  const { breedingRecords } = useMedakaStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">繁殖記録 ({breedingRecords.length}件)</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          追加
        </button>
      </div>

      {breedingRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-sm text-gray-400">繁殖記録がありません。<br />「追加」から記録を始めましょう。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {breedingRecords.map((record) => (
            <BreedingRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}

      {showAddModal && <AddBreedingRecordModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
