import React from "react";
import { Ending } from "../lib/bluff";
import { EndingPick } from "./EndingPick";
import { Button } from "./Button";
import { Users } from "lucide-react";

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
    <div className="flex flex-col max-w-md w-full mx-auto space-y-5 animate-in fade-in duration-200">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6d7764] block">
          CREATE GAME
        </span>
        <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#f1f4ec]">
          Your Room
        </h2>
      </div>

      <div className="p-4 bg-[#141910] border border-[#242e1c] rounded-2xl space-y-1.5 shadow-sm">
        <div className="flex items-center gap-2 text-[#FBD53D] text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>Multiplayer with Solo Bot Support</span>
        </div>
        <p className="text-xs text-[#98a08e] leading-relaxed">
          6-player table, {stakeSol} SOL buy-in each. Seat AI bots to test solo or invite friends to play Liar's Dice.
        </p>
      </div>

      <EndingPick value={vote} onChange={onVoteChange} disabled={busy} />

      <div className="space-y-2 pt-1">
        <Button
          label="Open it  →"
          onClick={onCreateRoom}
          disabled={busy}
          className="w-full text-base py-3"
        />
        <Button
          ghost
          label="Back to Lobby"
          onClick={onBack}
          disabled={busy}
          className="w-full py-2 text-xs"
        />
      </div>
    </div>
  );
}
