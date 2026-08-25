"use client";

import { LucideIcon, Plus } from "lucide-react";

/** セクション見出し (塗りアイコンタイル + 丸ゴシック) */
export function SectionTitle({
  icon: Icon,
  color,
  children,
}: {
  icon: LucideIcon;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: color, color: "#fffdf6" }}
      >
        <Icon className="w-[15px] h-[15px]" strokeWidth={2.4} />
      </span>
      <h2 className="font-maru text-[15px] font-bold" style={{ color: "var(--kuwa-ink)" }}>
        {children}
      </h2>
    </div>
  );
}

/** 空状態: 次の行動を促す一言を添える */
export function EmptyState({
  icon: Icon,
  color,
  title,
  hint,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="kuwa-card px-6 py-10 text-center">
      <span
        className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: color, opacity: 0.16 }}
      >
        <Icon className="w-7 h-7" strokeWidth={1.8} style={{ color, opacity: 1 }} />
      </span>
      <p
        className="font-maru text-sm font-bold"
        style={{ color: "var(--kuwa-ink)", textWrap: "pretty" }}
      >
        {title}
      </p>
      {hint && (
        <p className="text-xs mt-2" style={{ color: "var(--kuwa-ink-soft)", textWrap: "pretty" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** 右下の追加ボタン */
export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="kuwa-fab fixed right-5 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 z-40"
      style={{ bottom: "calc(max(8px, env(safe-area-inset-bottom)) + 76px)" }}
    >
      <Plus className="w-6 h-6" strokeWidth={2.4} />
    </button>
  );
}

/** ボトムシートの外枠 (ヘッダー + スクロール本体 + 固定フッター) */
export function Sheet({
  title,
  badge,
  onClose,
  children,
  footer,
  actions,
}: {
  title: React.ReactNode;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(36,26,17,0.55)" }}>
      <div
        className="kuwa-sheet w-full max-w-md mx-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kuwa-sheet-bar sticky top-0 px-5 py-4 flex items-center justify-between gap-2 flex-shrink-0 rounded-t-[24px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2
              className="font-maru text-lg font-bold truncate"
              style={{ color: "var(--kuwa-ink)" }}
            >
              {title}
            </h2>
            {badge}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {actions}
            <button
              onClick={onClose}
              aria-label="閉じる"
              className="p-2 rounded-full"
              style={{ color: "var(--kuwa-ink-soft)" }}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">{children}</div>

        {footer && <div className="kuwa-sheet-foot flex-shrink-0 px-5 pt-4 pb-safe-lg">{footer}</div>}
      </div>
    </div>
  );
}
