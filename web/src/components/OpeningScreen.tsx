import React from "react";
import { Ending } from "../lib/bluff";
import { EndingPick } from "./EndingPick";
import { ArrowLeft, Users } from "lucide-react";

export function OpeningScreen({
  vote,
  onVoteChange,
  onCreateRoom,
  onBack,
  busy,
  stake,
}: {
  vote: Ending;
  onVoteChange: (v: Ending) => void;
  onCreateRoom: () => void;
  onBack: () => void;
  busy: boolean;
  stake: bigint;
}) {
  const stakeSol = (Number(stake) / 1e9).toFixed(2);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-6 text-left animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer border border-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Create Table
          </h1>
          <p className="text-xs text-slate-400">
            Configure match rules for your table.
          </p>
        </div>
      </div>

      <div className="panel p-5 space-y-2">
        <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold">
          <Users className="w-4 h-4" />
          <span>6-Seat Table · AI Bot Practice Support</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {stakeSol} SOL buy-in per player. You can seat automated probability bots or share the invite code with friends.
        </p>
      </div>

      <EndingPick value={vote} onChange={onVoteChange} disabled={busy} />

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={onCreateRoom}
          disabled={busy}
          className="w-full rounded-lg bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer disabled:opacity-40"
        >
          Open Table
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={busy}
          className="w-full rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-white/20 transition cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
