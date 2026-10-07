import React, { useState } from "react";
import { Info, Dices } from "lucide-react";

export function PracticeScreen({
  onStartPractice,
  onGoLobby,
}: {
  onStartPractice: (botCount: number) => void;
  onGoLobby: () => void;
}) {
  const [botCount, setBotCount] = useState(2);

  return (
    <div className="w-full flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center gap-6 text-center animate-in fade-in duration-200">
        {/* Title matching FHE Practice Mode */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-50 font-['Archivo']">
            Practice mode
          </h1>
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[11px] font-semibold text-slate-400"
            title="Practice offline with zero gas"
          >
            i
          </div>
        </div>

        {/* Subtitle matching FHE */}
        <p className="max-w-md text-sm text-slate-400 leading-relaxed font-['IBM_Plex_Sans']">
          No wallet, no chain, no encryption — just the bluffing loop against a couple of bots so you can get a feel for the game. For real privacy-preserving play against other people, use{" "}
          <button
            type="button"
            onClick={onGoLobby}
            className="text-orange-400 hover:underline font-semibold cursor-pointer"
          >
            the on-chain lobby
          </button>{" "}
          instead.
        </p>

        {/* Setup Panel Card matching FHE */}
        <div className="panel w-full max-w-sm rounded-xl p-6 flex flex-col items-center gap-4">
          <label className="text-xs text-slate-400 font-mono">
            Number of bot opponents
          </label>
          <select
            value={botCount}
            onChange={(e) => setBotCount(parseInt(e.target.value))}
            className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50 w-28 text-center cursor-pointer font-mono"
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>

          <button
            type="button"
            onClick={() => onStartPractice(botCount)}
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 w-full cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <Dices className="w-4 h-4" />
            <span>Start practice game</span>
          </button>
        </div>
      </div>
    </div>
  );
}
