import React from "react";
import { DieFace } from "../lib/dice";
import { DieItem } from "./Die";

export { DieItem };

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
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 py-1">
        {dice.map((face, index) => {
          const isMatch = highlightTarget ? face === highlightTarget : false;
          return <DieItem key={index} face={face} highlighted={isMatch} size="md" />;
        })}
      </div>

      <div className="text-[11px] text-[#98a08e] text-center">
        Encrypted inside MagicBlock Private TEE Rollup. Opponents cannot read these.
      </div>
    </div>
  );
}
