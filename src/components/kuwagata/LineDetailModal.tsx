"use client";

import { useState } from "react";
import { CheckCircle2, Shovel, Trash2, Worm, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { BreedingLine, Larva } from "@/types/kuwagata";
import {
  LINE_STATUS_COLORS,
  LINE_STATUS_LABELS,
} from "@/lib/kuwagataUtils";
import { formatDate, generateId } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface LineDetailModalProps {
  line: BreedingLine;
  onClose: () => void;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

export function LineDetailModal({ line: initial, onClose }: LineDetailModalProps) {
  const { lines, beetles, updateLine, deleteLine, addLarva, getLarvaeByLine } =
    useKuwagataStore();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const line = lines.find((l) => l.id === initial.id) ?? initial;
  const male = line.maleId ? beetles.find((b) => b.id === line.maleId) : undefined;
  const female = line.femaleId ? beetles.find((b) => b.id === line.femaleId) : undefined;
  const lineLarvae = getLarvaeByLine(line.id);

  const today = new Date().toISOString().split("T")[0];
  const [setForm, setSetForm] = useState({ date: today, type: "産卵材 + 発酵マット" });
  const [splitForm, setSplitForm] = useState({
    date: today,
    larvaCount: "",
    eggCount: "",
    autoCreate: true,
  });

  const recordSet = () => {
    updateLine(line.id, {
      status: "laying",
      setDate: setForm.date,
      setType: setForm.type,
    });
    showToast("産卵セット投入を記録しました");
  };

  const recordSplit = () => {
    const larvaCount = splitForm.larvaCount ? parseInt(splitForm.larvaCount) : 0;
    updateLine(line.id, {
      status: "split_done",
      splitDate: splitForm.date,
      larvaCount: larvaCount || undefined,
      eggCount: splitForm.eggCount ? parseInt(splitForm.eggCount) : undefined,
    });
    if (splitForm.autoCreate && larvaCount > 0) {
      const existing = lineLarvae.length;
      for (let i = 0; i < larvaCount; i++) {
        const num = String(existing + i + 1).padStart(2, "0");
        const larva: Larva = {
          id: generateId(),
          code: `${line.name}-${num}`,
          lineId: line.id,
          species: line.species,
          stage: "L1",
          gender: "unknown",
          hatchDate: splitForm.date,
          bottleChanges: [],
          isAlive: true,
          notes: "",
        };
        addLarva(larva);
      }
      showToast(`割り出しを記録し、幼虫${larvaCount}頭を作成しました`);
    } else {
      showToast("割り出しを記録しました");
    }
  };

  const handleDelete = () => {
    deleteLine(line.id);
    showToast(`ライン ${line.name} を削除しました`);
    onClose();
  };

  const timeline: { label: string; date?: string; extra?: string }[] = [
    { label: "ペアリング開始", date: line.pairingDate },
    { label: "産卵セット投入", date: line.setDate, extra: line.setType },
    {
      label: "割り出し",
      date: line.splitDate,
      extra:
        line.larvaCount != null
          ? `幼虫${line.larvaCount}頭${line.eggCount != null ? ` / 卵${line.eggCount}個` : ""}`
          : undefined,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">{line.name}</h2>
            <span
              className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${LINE_STATUS_COLORS[line.status]}`}
            >
              {LINE_STATUS_LABELS[line.status]}
            </span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
          {/* ペア情報 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-blue-50/60 rounded-2xl px-3.5 py-3">
              <p className="text-[10px] font-bold text-blue-500 mb-0.5">♂ 種親オス</p>
              {male ? (
                <>
                  <p className="text-sm font-bold text-gray-800 truncate">{male.code}</p>
                  <p className="text-xs text-gray-400">
                    {male.sizeMm != null ? `${male.sizeMm}mm` : ""} {male.generation ?? ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">未設定</p>
              )}
            </div>
            <div className="bg-pink-50/60 rounded-2xl px-3.5 py-3">
              <p className="text-[10px] font-bold text-pink-500 mb-0.5">♀ 種親メス</p>
              {female ? (
                <>
                  <p className="text-sm font-bold text-gray-800 truncate">{female.code}</p>
                  <p className="text-xs text-gray-400">
                    {female.sizeMm != null ? `${female.sizeMm}mm` : ""} {female.generation ?? ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400">未設定</p>
              )}
            </div>
          </div>

          {/* タイムライン */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">進行状況</h3>
            <div className="space-y-0">
              {timeline.map((t, i) => (
                <div key={t.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        t.date ? "bg-amber-500" : "bg-gray-200"
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <div className={`w-0.5 flex-1 ${t.date ? "bg-amber-200" : "bg-gray-100"}`} />
                    )}
                  </div>
                  <div className="pb-4 min-w-0">
                    <p className={`text-sm font-semibold ${t.date ? "text-gray-800" : "text-gray-300"}`}>
                      {t.label}
                    </p>
                    {t.date && <p className="text-xs text-gray-400">{formatDate(t.date)}</p>}
                    {t.extra && <p className="text-xs text-amber-600 mt-0.5">{t.extra}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ステータス操作 */}
          {line.status === "pairing" && (
            <div className="bg-amber-50/60 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-800">産卵セット投入を記録</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="date"
                  value={setForm.date}
                  onChange={(e) => setSetForm({ ...setForm, date: e.target.value })}
                  className={inputCls}
                />
                <input
                  value={setForm.type}
                  onChange={(e) => setSetForm({ ...setForm, type: e.target.value })}
                  placeholder="セット内容"
                  className={inputCls}
                />
              </div>
              <button
                onClick={recordSet}
                className="w-full py-3 rounded-xl bg-amber-600 text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                セット投入を記録
              </button>
            </div>
          )}

          {(line.status === "laying" || line.status === "waiting_split") && (
            <div className="bg-orange-50/60 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <Shovel className="w-4 h-4 text-orange-500" />
                割り出しを記録
              </h3>
              <input
                type="date"
                value={splitForm.date}
                onChange={(e) => setSplitForm({ ...splitForm, date: e.target.value })}
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">幼虫数</label>
                  <input
                    type="number"
                    min="0"
                    value={splitForm.larvaCount}
                    onChange={(e) => setSplitForm({ ...splitForm, larvaCount: e.target.value })}
                    placeholder="頭数"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">卵の数 (任意)</label>
                  <input
                    type="number"
                    min="0"
                    value={splitForm.eggCount}
                    onChange={(e) => setSplitForm({ ...splitForm, eggCount: e.target.value })}
                    placeholder="個数"
                    className={inputCls}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSplitForm({ ...splitForm, autoCreate: !splitForm.autoCreate })}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                    splitForm.autoCreate
                      ? "bg-amber-600 border-amber-600 text-white"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {splitForm.autoCreate && <CheckCircle2 className="w-3.5 h-3.5" />}
                </span>
                幼虫データを自動作成する ({line.name}-01, 02, ...)
              </button>
              <button
                onClick={recordSplit}
                className="w-full py-3 rounded-xl bg-orange-500 text-white text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                割り出しを記録
              </button>
            </div>
          )}

          {line.status === "split_done" && (
            <button
              onClick={() => {
                updateLine(line.id, { status: "finished" });
                showToast("ラインを終了にしました");
              }}
              className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold active:scale-[0.98] transition-all"
            >
              このラインを終了にする
            </button>
          )}

          {/* このラインの幼虫 */}
          {lineLarvae.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Worm className="w-4 h-4 text-emerald-600" />
                このラインの幼虫 ({lineLarvae.length}頭)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {lineLarvae.map((l) => (
                  <span
                    key={l.id}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      l.isAlive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {l.code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {line.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1.5">メモ</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-3 whitespace-pre-wrap">
                {line.notes}
              </p>
            </div>
          )}

          <button
            onClick={() => (confirmDelete ? handleDelete() : setConfirmDelete(true))}
            className={`w-full py-3 rounded-xl text-sm font-semibold border flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all mb-2 ${
              confirmDelete
                ? "bg-red-500 text-white border-red-500"
                : "border-red-200 text-red-500"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? "本当に削除する (幼虫データは残ります)" : "ラインを削除"}
          </button>
        </div>
      </div>
    </div>
  );
}
