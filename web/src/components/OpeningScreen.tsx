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
  callsign,
  onCallsignChange,
}: {
  vote: Ending;
  onVoteChange: (v: Ending) => void;
  onCreateRoom: () => void;
  onBack: () => void;
  busy: boolean;
  stake: bigint;
  callsign: string;
  onCallsignChange: (name: string) => void;
}) {
  const stakeSol = (Number(stake) / 1e9).toFixed(2);

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-3.5 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="p-1.5 rounded-full text-[#6b7362] hover:text-[#f1f4ec] hover:bg-[#1f241a] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
            CREATE GAME
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#f1f4ec]">
            Your Room
          </h2>
        </div>
      </div>

      <div className="p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-1.5">
        <div className="flex items-center gap-2 text-[#FBD53D] text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>Multiplayer with Solo Bot Support</span>
        </div>
        <p className="text-xs text-[#98a08e] leading-relaxed">
          6-player table, {stakeSol} SOL buy-in each. Seat AI bots to test solo or invite friends to play Liar's Dice.
        </p>
      </div>

      {/* Callsign / Player Name */}
      <div className="space-y-1 p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl">
        <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
          YOUR CALLSIGN
        </label>
        <input
          type="text"
          value={callsign}
          onChange={(e) => onCallsignChange(e.target.value)}
          maxLength={16}
          placeholder="Enter player name (e.g. Farhan)"
          disabled={busy}
          className="w-full bg-[#1f241a] border border-[#2a3122] focus:border-[#FBD53D] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#f1f4ec] placeholder-[#6b7362] outline-none transition-colors"
        />
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
