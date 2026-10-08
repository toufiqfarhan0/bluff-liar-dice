import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: React.ReactNode;
  ghost?: boolean;
  danger?: boolean;
  loading?: boolean;
}

export function Button({
  label,
  ghost = false,
  danger = false,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "relative inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-200 select-none cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100";

  let variant = "bg-[#FBD53D] text-[#141004] py-3.5 px-6 text-base tracking-wide shadow-[0_4px_20px_-4px_rgba(251, 213, 61,0.35)] hover:shadow-[0_4px_28px_-2px_rgba(251, 213, 61,0.5)] hover:bg-[#fce06b]";

  if (ghost) {
    variant =
      "bg-[#1f241a] border border-[#2a3122] text-[#f1f4ec] py-3 px-5 text-sm font-bold hover:bg-[#283022] hover:border-[#3f4a33]";
  } else if (danger) {
    variant =
      "bg-[#f2603c] text-white py-3 px-5 text-sm font-bold shadow-[0_4px_16px_-4px_rgba(242,96,60,0.4)] hover:bg-[#ff714e]";
  }

  if (isDisabled) {
    variant =
      "bg-[#171b14] border border-[#23291d] text-[#6b7362] py-3.5 px-6 text-sm font-semibold shadow-none opacity-60";
  }

  return (
    <button
      disabled={isDisabled}
      className={`${base} ${variant} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{label}</span>
        </span>
      ) : (
        label
      )}
    </button>
  );
}
