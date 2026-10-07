import React, { useState } from "react";
import { DieFace, faceName } from "../lib/dice";
import { Eye, EyeOff, Lock, Sparkles } from "lucide-react";

export function DieItem({
  face,
  highlighted = false,
  size = "md",
}: {
  face: DieFace;
  highlighted?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const isWild = face === 1;

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-13 h-13 rounded-xl",
    lg: "w-16 h-16 rounded-2xl",
  }[size];

  const pipSize = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  }[size];

  const centerPipSize = {
    sm: "w-2 h-2",
    md: "w-3.5 h-3.5",
    lg: "w-4.5 h-4.5",
  }[size];

  const renderPips = () => {
    switch (face) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full relative z-10">
            <div
              className={`${centerPipSize} rounded-full ${
                isWild ? "pip-gold" : "pip-white"
              }`}
            />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2 relative z-10">
            <div className={`${pipSize} rounded-full pip-white self-start`} />
            <div className={`${pipSize} rounded-full pip-white self-end`} />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2 relative z-10">
            <div className={`${pipSize} rounded-full pip-white self-start`} />
            <div className={`${pipSize} rounded-full pip-white self-center`} />
            <div className={`${pipSize} rounded-full pip-white self-end`} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-2 place-items-center relative z-10">
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2 z-10">
            <div className={`absolute top-2 left-2 ${pipSize} rounded-full pip-white`} />
            <div className={`absolute top-2 right-2 ${pipSize} rounded-full pip-white`} />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${pipSize} rounded-full pip-white`}
            />
            <div className={`absolute bottom-2 left-2 ${pipSize} rounded-full pip-white`} />
            <div className={`absolute bottom-2 right-2 ${pipSize} rounded-full pip-white`} />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 gap-1 w-full h-full p-2 place-items-center relative z-10">
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
            <div className={`${pipSize} rounded-full pip-white`} />
          </div>
        );
    }
  };

  return (
    <div
      title={faceName(face)}
      className={`relative select-none flex items-center justify-center dice-tile ${sizeClasses} ${
        highlighted ? "is-highlighted" : ""
      }`}
    >
      {renderPips()}

      {isWild && (
        <span
          title="Wild Ace"
          className="absolute -top-1 -right-1 bg-amber-400 text-black rounded-full p-0.5 text-[8px] font-black z-20 shadow-[0_0_8px_#f59e0b]"
        >
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}

export function DiceTray({
  dice,
  label = "YOUR SEALED HAND",
  highlightTarget,
}: {
  dice: DieFace[];
  label?: string;
  highlightTarget?: DieFace;
}) {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="w-full p-4 sm:p-5 tactical-panel space-y-3.5">
      {/* Header bar */}
      <div className="flex items-center justify-between w-full text-[11px] font-mono font-bold tracking-wider text-[#9c897d]">
        <span className="flex items-center gap-2 text-[#faf5f0]">
          <span className="status-dot-active" />
          <span>{label}</span>
        </span>

        <div className="flex items-center gap-3">
          <span className="text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> 1s ARE WILD
          </span>

          <button
            type="button"
            onClick={() => setHidden(!hidden)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#17100b] border border-[#331f15] hover:border-orange-500/50 text-[#faf5f0] text-[10px] font-bold transition-all cursor-pointer"
          >
            {hidden ? (
              <>
                <Eye className="w-3 h-3 text-orange-400" />
                <span>PEEK</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 text-[#9c897d]" />
                <span>CONCEAL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dice Container or Sealed Cup State */}
      {hidden ? (
        <div className="flex items-center justify-center gap-3 py-3 w-full">
          {[0, 1, 2, 3, 4].slice(0, Math.max(1, dice.length)).map((_, i) => (
            <div
              key={i}
              className="w-13 h-13 rounded-xl bg-[#17100b] border border-[#2b1a10] flex flex-col items-center justify-center shadow-lg gap-1"
            >
              <Lock className="w-4 h-4 text-orange-400/60" />
              <span className="text-[9px] font-mono text-[#635349]">TEE</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3.5 py-2">
          {dice.map((face, index) => {
            const isMatch = highlightTarget ? face === highlightTarget || face === 1 : false;
            return <DieItem key={index} face={face} highlighted={isMatch} size="md" />;
          })}
        </div>
      )}

      {/* Explainer footer */}
      <div className="text-[11px] font-mono text-[#9c897d] text-center flex items-center justify-center gap-1.5">
        <span className="text-orange-400 font-bold">●</span>
        <span>Cryptographically sealed inside Intel SGX hardware enclave. Opponents cannot read these.</span>
      </div>
    </div>
  );
}
