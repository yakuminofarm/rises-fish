"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const ICONS = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    error:   <AlertCircle  className="w-4 h-4 text-red-400 flex-shrink-0" />,
    info:    <Info         className="w-4 h-4 text-cyan-400 flex-shrink-0" />,
  };

  const BG = {
    success: "bg-gray-900",
    error:   "bg-red-900",
    info:    "bg-gray-900",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* トースト表示エリア — ボトムナビの上 */}
      <div className="fixed bottom-24 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4 max-w-md mx-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${BG[toast.type]} text-white text-sm font-medium px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl w-full animate-slide-up`}
            style={{ backdropFilter: "blur(8px)" }}
          >
            {ICONS[toast.type]}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
