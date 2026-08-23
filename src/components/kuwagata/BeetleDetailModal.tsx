"use client";

import { useState } from "react";
import { Heart, Skull, Trash2, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Beetle } from "@/types/kuwagata";
import { formatDate, getGenderColor, getGenderLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface BeetleDetailModalProps {
  beetle: Beetle;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

export function BeetleDetailModal({ beetle: initial, onClose }: BeetleDetailModalProps) {
  const { beetles, lines, updateBeetle, deleteBeetle, toggleFavorite } = useKuwagataStore();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ストアの最新状態を参照 (お気に入り等の即時反映のため)
  const beetle = beetles.find((b) => b.id === initial.id) ?? initial;

  const relatedLines = lines.filter(
    (l) => l.maleId === beetle.id || l.femaleId === beetle.id
  );

  const handleDelete = () => {
    deleteBeetle(beetle.id);
    showToast(`${beetle.code} を削除しました`);
    onClose();
  };

  const handleToggleAlive = () => {
    updateBeetle(beetle.id, { isAlive: !beetle.isAlive });
    showToast(beetle.isAlive ? "飼育終了として記録しました" : "生存中に戻しました");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">🪲</span>
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {beetle.code}
              {beetle.name && <span className="text-sm text-gray-400 ml-1.5">「{beetle.name}」</span>}
            </h2>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => toggleFavorite(beetle.id)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Heart
                className={`w-5 h-5 ${
                  beetle.isFavorite ? "text-rose-500 fill-rose-500" : "text-gray-300"
                }`}
              />
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-5">
          <div className="bg-amber-50/60 rounded-2xl px-4 py-1">
            <InfoRow label="種類" value={beetle.species} />
            <InfoRow label="産地・血統" value={beetle.locality} />
            <InfoRow label="累代" value={beetle.generation} />
            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <span className="text-sm text-gray-400">性別</span>
              <span className={`text-sm font-bold ${getGenderColor(beetle.gender)}`}>
                {getGenderLabel(beetle.gender)}
              </span>
            </div>
            <InfoRow label="体長" value={beetle.sizeMm != null ? `${beetle.sizeMm} mm` : undefined} />
            <InfoRow label="羽化日" value={beetle.emergedDate ? formatDate(beetle.emergedDate) : undefined} />
            <InfoRow label="入手日" value={formatDate(beetle.acquiredDate)} />
            <InfoRow label="状態" value={beetle.isAlive ? (beetle.matured ? "生存中 (後食済み)" : "生存中") : "飼育終了"} />
          </div>

          {relatedLines.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-2">種親として使用中のライン</h3>
              <div className="space-y-1.5">
                {relatedLines.map((l) => (
                  <div key={l.id} className="bg-white border border-amber-100/60 rounded-xl px-3.5 py-2.5 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-800">{l.name}</span>
                    <span className="text-xs text-gray-400">{l.species}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {beetle.notes && (
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-1.5">メモ</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3.5 py-3 whitespace-pre-wrap">
                {beetle.notes}
              </p>
            </div>
          )}

          <div className="flex gap-2 pb-2">
            <button
              onClick={handleToggleAlive}
              className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <Skull className="w-4 h-4" />
              {beetle.isAlive ? "飼育終了にする" : "生存中に戻す"}
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
              {confirmDelete ? "本当に削除する" : "削除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
