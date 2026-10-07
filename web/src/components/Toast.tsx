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
          className={`pointer-events-auto p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-2.5 animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === "success"
              ? "bg-[#24150e]/95 border-orange-500/50 text-[#faf5f0] shadow-orange-950/40"
              : t.type === "error"
                ? "bg-[#28110b]/95 border-red-500/50 text-[#faf5f0] shadow-red-950/40"
                : "bg-[#140d09]/95 border-[#331f15] text-[#faf5f0]"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          ) : t.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}

          <p className="flex-1 text-xs font-medium leading-relaxed">{t.message}</p>

          <button
            onClick={() => onDismiss(t.id)}
            className="text-[#a69488] hover:text-[#faf5f0] p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
