import React from "react";
import { Ending } from "../lib/bluff";
import { EndingPick } from "./EndingPick";
import { Button } from "./Button";
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
    <div className="flex flex-col max-w-md w-full mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="p-2 rounded-full text-[#6b7362] hover:text-[#f1f4ec] hover:bg-[#1f241a] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
            CREATE GAME
          </span>
          <h2 className="text-2xl font-black italic tracking-tight text-[#f1f4ec]">
            Your Room
          </h2>
        </div>
      </div>

      <div className="p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2">
        <div className="flex items-center gap-2 text-[#FBD53D] text-xs font-bold">
          <Users className="w-4 h-4" />
          <span>Multiplayer with Solo Bot Support</span>
        </div>
        <p className="text-xs text-[#98a08e] leading-relaxed">
          6-player table, {stakeSol} SOL buy-in each. Seat AI bots to test solo or invite friends to play Liar's Dice.
        </p>
      </div>

      <EndingPick value={vote} onChange={onVoteChange} disabled={busy} />

      <div className="space-y-3 pt-2">
        <Button
          label="Open it  →"
          onClick={onCreateRoom}
          disabled={busy}
          className="w-full text-base py-3.5"
        />
        <Button
          ghost
          label="Back to Lobby"
          onClick={onBack}
          disabled={busy}
          className="w-full"
        />
      </div>
    </div>
  );
}
