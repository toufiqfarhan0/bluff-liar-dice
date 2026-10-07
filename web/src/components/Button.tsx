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
    "relative inline-flex items-center justify-center font-extrabold rounded-xl transition-all duration-200 select-none cursor-pointer active:scale-[0.99] disabled:cursor-not-allowed disabled:active:scale-100 uppercase tracking-wide text-xs sm:text-sm";

  let variant =
    "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-black py-3.5 px-6 shadow-[0_4px_20px_-3px_rgba(249,115,22,0.45)] hover:shadow-[0_4px_28px_-2px_rgba(249,115,22,0.65)] hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 border border-amber-300/40";

  if (ghost) {
    variant =
      "bg-[#130d08] border border-[#2b1a10] text-[#faf5f0] py-3 px-5 hover:bg-[#1f140c] hover:border-orange-500/40";
  } else if (danger) {
    variant =
      "bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-5 shadow-[0_4px_16px_-4px_rgba(220,38,38,0.4)] hover:from-red-500 hover:to-orange-500 border border-red-400/30";
  }

  if (isDisabled) {
    variant =
      "bg-[#110b07] border border-[#22140c] text-[#635349] py-3.5 px-6 shadow-none opacity-50";
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
