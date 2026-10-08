import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-2.5 animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === "success"
              ? "bg-[#1d1a0e] border-[#FBD53D]/40 text-[#f1f4ec]"
              : t.type === "error"
                ? "bg-[#241310] border-[#f2603c]/40 text-[#f1f4ec]"
                : "bg-[#171b14] border-[#2a3122] text-[#f1f4ec]"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#FBD53D] shrink-0 mt-0.5" />
          ) : t.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-[#f2603c] shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-[#5db8f0] shrink-0 mt-0.5" />
          )}

          <p className="flex-1 text-xs font-medium leading-relaxed">{t.message}</p>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-[#6b7362] hover:text-[#f1f4ec] p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
