import React from "react";
import { DieFace, dieSymbol, faceName } from "../lib/dice";
import { Sparkles } from "lucide-react";

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
    sm: "w-8 h-8 rounded-lg text-lg",
    md: "w-11 h-11 rounded-xl text-2xl",
    lg: "w-14 h-14 rounded-2xl text-3xl",
  }[size];

  // Pip positions for true authentic dice visual
  const renderPips = () => {
    switch (face) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className={`w-3.5 h-3.5 rounded-full ${isWild ? "bg-[#FBD53D] shadow-[0_0_8px_#FBD53D]" : "bg-[#f1f4ec]"}`} />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec] self-start" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec] self-end" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec] self-start" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec] self-center" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec] self-end" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-1.5 w-full h-full p-1.5 place-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-1.5">
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#f1f4ec]" />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 gap-1 w-full h-full p-1.5 place-items-center">
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
            <div className="w-2 h-2 rounded-full bg-[#f1f4ec]" />
          </div>
        );
    }
  };

  return (
    <div
      title={faceName(face)}
      className={`relative select-none flex items-center justify-center font-black transition-all duration-300 border ${sizeClasses} ${
        highlighted
          ? "bg-[#302c12] border-[#FBD53D] shadow-[0_0_15px_rgba(251, 213, 61,0.5)] scale-105"
          : isWild
          ? "bg-[#252212] border-[#FBD53D]/60 shadow-[0_0_10px_rgba(251, 213, 61,0.25)]"
          : "bg-[#181d14] border-[#343e2a] hover:border-[#4d5b3d]"
      }`}
    >
      {renderPips()}
      {isWild && (
        <span
          title="Wild Ace"
          className="absolute -top-1.5 -right-1.5 bg-[#FBD53D] text-[#141004] rounded-full p-0.5 text-[8px] font-black"
        >
          <Sparkles className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}

export function DiceTray({
  dice,
  label = "YOUR PRIVATE DICE (ONLY YOU CAN SEE)",
  highlightTarget,
}: {
  dice: DieFace[];
  label?: string;
  highlightTarget?: DieFace;
}) {
  return (
    <div className="w-full p-4 rounded-2xl bg-[#12160e]/90 border border-[#2a3122] backdrop-blur-md shadow-2xl flex flex-col items-center space-y-3">
      <div className="flex items-center justify-between w-full text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
        <span>{label}</span>
        <span className="text-[#FBD53D] flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> 1s are Wild
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-1">
        {dice.map((face, index) => {
          const isMatch = highlightTarget ? face === highlightTarget || face === 1 : false;
          return <DieItem key={index} face={face} highlighted={isMatch} size="md" />;
        })}
      </div>

      <div className="text-[11px] text-[#98a08e] text-center">
        Encrypted inside MagicBlock Private TEE Rollup. Opponents cannot read these.
      </div>
    </div>
  );
}
