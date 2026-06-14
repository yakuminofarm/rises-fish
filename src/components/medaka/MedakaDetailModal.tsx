"use client";

import { useState } from "react";
import { X, Camera, Trash2, Plus, Fish } from "lucide-react";
import { useMedakaStore } from "@/store/medakaStore";
import { Medaka, MedakaTrait } from "@/types/medaka";
import { formatDate, getGenderLabel, getGenderColor, generateId } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface MedakaDetailModalProps {
  medaka: Medaka;
  onClose: () => void;
}

export function MedakaDetailModal({ medaka, onClose }: MedakaDetailModalProps) {
  const { updateMedaka, deleteMedaka, addPhoto, addTrait, getChildren, getMedaka } = useMedakaStore();
  const [activeTab, setActiveTab] = useState<"info" | "traits" | "lineage">("info");
  const [addingTrait, setAddingTrait] = useState(false);
  const [traitForm, setTraitForm] = useState({ name: "", value: "", unit: "" });

  const children = getChildren(medaka.id);
  const father = medaka.parentIds?.father ? getMedaka(medaka.parentIds.father) : undefined;
  const mother = medaka.parentIds?.mother ? getMedaka(medaka.parentIds.mother) : undefined;

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      addPhoto(medaka.id, {
        id: generateId(),
        url: ev.target?.result as string,
        takenAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAddTrait = () => {
    if (!traitForm.name || !traitForm.value) return;
    addTrait(medaka.id, {
      name: traitForm.name,
      value: isNaN(Number(traitForm.value)) ? traitForm.value : Number(traitForm.value),
      unit: traitForm.unit || undefined,
      recordedAt: new Date().toISOString().split("T")[0],
    });
    setTraitForm({ name: "", value: "", unit: "" });
    setAddingTrait(false);
  };

  const handleDelete = () => {
    if (confirm(`${medaka.name}を削除しますか？`)) {
      deleteMedaka(medaka.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl max-h-[92vh] flex flex-col">
        {/* ヘッダー */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{medaka.name}</h2>
            <p className="text-sm text-gray-500">{medaka.variety}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-50 text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-100 flex-shrink-0">
          {[
            { id: "info", label: "基本情報" },
            { id: "traits", label: "特性記録" },
            { id: "lineage", label: "血統" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {activeTab === "info" && (
            <div className="space-y-4">
              {/* 写真ギャラリー */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {medaka.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.url}
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />
                ))}
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 flex-shrink-0">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">追加</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoAdd} />
                </label>
              </div>

              {/* 基本情報 */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">性別</span>
                  <span className={`text-sm font-medium ${getGenderColor(medaka.gender)}`}>
                    {getGenderLabel(medaka.gender)}
                  </span>
                </div>
                {medaka.generation && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">世代</span>
                    <Badge variant="info">F{medaka.generation}</Badge>
                  </div>
                )}
                {medaka.birthDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">生年月日</span>
                    <span className="text-sm font-medium">{formatDate(medaka.birthDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">入手日</span>
                  <span className="text-sm font-medium">{formatDate(medaka.acquiredDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">状態</span>
                  <button
                    onClick={() => updateMedaka(medaka.id, { isAlive: !medaka.isAlive })}
                    className={`text-sm font-medium px-3 py-1 rounded-full ${
                      medaka.isAlive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {medaka.isAlive ? "生存中" : "★ 死亡"}
                  </button>
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
                <textarea
                  value={medaka.notes}
                  onChange={(e) => updateMedaka(medaka.id, { notes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === "traits" && (
            <div className="space-y-3">
              {medaka.traits.length === 0 && !addingTrait && (
                <div className="text-center py-8 text-gray-400">
                  <Fish className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">特性記録がありません</p>
                </div>
              )}
              {medaka.traits.map((trait, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{trait.name}</p>
                    <p className="text-xs text-gray-400">{trait.recordedAt}</p>
                  </div>
                  <span className="text-lg font-bold text-cyan-600">
                    {trait.value}{trait.unit && <span className="text-sm text-gray-400 ml-1">{trait.unit}</span>}
                  </span>
                </div>
              ))}
              {addingTrait && (
                <div className="bg-cyan-50 rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={traitForm.name}
                      onChange={(e) => setTraitForm({ ...traitForm, name: e.target.value })}
                      placeholder="項目名 (体長など)"
                      className="flex-1 border border-cyan-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                    />
                    <input
                      value={traitForm.value}
                      onChange={(e) => setTraitForm({ ...traitForm, value: e.target.value })}
                      placeholder="値"
                      className="w-20 border border-cyan-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                    />
                    <input
                      value={traitForm.unit}
                      onChange={(e) => setTraitForm({ ...traitForm, unit: e.target.value })}
                      placeholder="単位"
                      className="w-16 border border-cyan-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddTrait}
                      className="flex-1 bg-cyan-500 text-white text-sm py-1.5 rounded-lg"
                    >
                      追加
                    </button>
                    <button
                      onClick={() => setAddingTrait(false)}
                      className="flex-1 text-gray-500 text-sm py-1.5 rounded-lg border border-gray-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={() => setAddingTrait(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-cyan-400 hover:text-cyan-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">特性を記録</span>
              </button>
            </div>
          )}

          {activeTab === "lineage" && (
            <div className="space-y-4">
              {/* 親 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">親</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-400 mb-1">♂ 父親</p>
                    <p className="text-sm font-medium text-gray-800">
                      {father ? father.name : "不明"}
                    </p>
                    {father && <p className="text-xs text-gray-400">{father.variety}</p>}
                  </div>
                  <div className="bg-pink-50 rounded-xl p-3">
                    <p className="text-xs text-pink-400 mb-1">♀ 母親</p>
                    <p className="text-sm font-medium text-gray-800">
                      {mother ? mother.name : "不明"}
                    </p>
                    {mother && <p className="text-xs text-gray-400">{mother.variety}</p>}
                  </div>
                </div>
              </div>

              {/* 子供 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  子供 ({children.length}匹)
                </h3>
                {children.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">まだ子供の記録がありません</p>
                ) : (
                  <div className="space-y-2">
                    {children.map((child) => (
                      <div key={child.id} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{child.name}</p>
                          <p className="text-xs text-gray-400">{child.variety}</p>
                        </div>
                        <span className={`text-sm ${getGenderColor(child.gender)}`}>
                          {child.gender === "male" ? "♂" : child.gender === "female" ? "♀" : "?"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
