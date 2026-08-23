"use client";

import { useState } from "react";
import { CheckCircle2, HandCoins, Heart, Skull, Trash2, X } from "lucide-react";
import { useKuwagataStore } from "@/store/kuwagataStore";
import { Beetle } from "@/types/kuwagata";
import { SpeciesAvatar } from "@/components/kuwagata/KuwagataSVG";
import { formatYen } from "@/lib/kuwagataUtils";
import { formatDate, getGenderColor, getGenderLabel } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-400";

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
  const [showSellForm, setShowSellForm] = useState(false);
  const [sellForm, setSellForm] = useState({
    date: new Date().toISOString().split("T")[0],
    price: "",
    to: "",
  });

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
          <div className="flex items-center gap-2.5 min-w-0">
            <SpeciesAvatar species={beetle.species} />
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
            <InfoRow label="入手金額" value={beetle.priceYen != null ? formatYen(beetle.priceYen) : undefined} />
            <InfoRow
              label="状態"
              value={
                beetle.soldPriceYen != null
                  ? "販売済み"
                  : beetle.isAlive
                  ? beetle.matured
                    ? "生存中 (後食済み)"
                    : "生存中"
                  : "飼育終了"
              }
            />
          </div>

          {/* 販売記録 */}
          {beetle.soldPriceYen != null ? (
            <div className="bg-emerald-50/70 rounded-2xl px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <HandCoins className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-800">販売記録</h3>
              </div>
              <p className="text-lg font-bold text-emerald-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatYen(beetle.soldPriceYen)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {beetle.soldDate && formatDate(beetle.soldDate)}
                {beetle.soldTo && ` / 販売先: ${beetle.soldTo}`}
              </p>
              <button
                onClick={() => {
                  updateBeetle(beetle.id, { soldDate: undefined, soldPriceYen: undefined, soldTo: undefined });
                  showToast("販売記録を取り消しました");
                }}
                className="mt-2 text-xs font-semibold text-gray-400 underline"
              >
                販売記録を取り消す
              </button>
            </div>
          ) : showSellForm ? (
            <div className="bg-emerald-50/70 rounded-2xl p-3.5 space-y-2.5">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <HandCoins className="w-4 h-4 text-emerald-600" />
                販売を記録
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={sellForm.date}
                  onChange={(e) => setSellForm({ ...sellForm, date: e.target.value })}
                  className={inputCls}
                />
                <input
                  type="number"
                  min="0"
                  value={sellForm.price}
                  onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })}
                  placeholder="販売額 (円)"
                  className={inputCls}
                />
              </div>
              <input
                value={sellForm.to}
                onChange={(e) => setSellForm({ ...sellForm, to: e.target.value })}
                placeholder="販売先 (店舗・知人など、任意)"
                className={inputCls}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSellForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-semibold active:scale-[0.98] transition-all"
                >
                  キャンセル
                </button>
                <button
                  onClick={() => {
                    if (!sellForm.price) return;
                    updateBeetle(beetle.id, {
                      soldDate: sellForm.date,
                      soldPriceYen: parseInt(sellForm.price),
                      soldTo: sellForm.to || undefined,
                    });
                    setShowSellForm(false);
                    showToast("販売を記録しました");
                  }}
                  disabled={!sellForm.price}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1 active:scale-[0.98] transition-all ${
                    sellForm.price ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  記録する
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSellForm(true)}
              className="w-full py-3 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-bold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
            >
              <HandCoins className="w-4 h-4" />
              販売を記録する
            </button>
          )}

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
