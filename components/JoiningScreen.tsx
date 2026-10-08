import React from "react";
import { Ending, RoomState } from "../lib/bluff";
import { EndingPick, EndingTally } from "./EndingPick";
import { Seats } from "./Seats";
import { Button } from "./Button";
import { ArrowLeft } from "lucide-react";

export function JoiningScreen({
  preview,
  vote,
  onVoteChange,
  onJoinRoom,
  onBack,
  busy,
  callsign,
  onCallsignChange,
  balance,
}: {
  preview: RoomState;
  vote: Ending;
  onVoteChange: (v: Ending) => void;
  onJoinRoom: () => void;
  onBack: () => void;
  busy: boolean;
  callsign: string;
  onCallsignChange: (name: string) => void;
  balance?: number;
}) {
  const stakeSol = (Number(preview.stake) / 1e9).toFixed(3);
  const potSol = ((Number(preview.stake) * preview.seats.length) / 1e9).toFixed(3);

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-5 animate-in fade-in duration-200">
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
            JOINING GAME
          </span>
          <h2 className="text-2xl font-black tracking-wide text-[#f1f4ec]">
            This Room
          </h2>
        </div>
      </div>

      {/* Room Summary */}
      <div className="p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#f1f4ec] bg-[#1f241a] border border-[#2a3122] px-3 py-1 rounded-full">
            {preview.seats.length} seated
          </span>
          <span className="text-sm font-extrabold text-[#FBD53D]">
            {potSol} SOL pot
          </span>
        </div>
        <p className="text-xs text-[#98a08e]">
          Taking a seat stakes {stakeSol} SOL into the contract vault.
        </p>
      </div>

      {/* Players seated */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
          WHO IS IN
        </span>
        <Seats room={preview} />
      </div>

      {/* Callsign / Player Name */}
      <div className="space-y-1.5 p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl">
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
          className="w-full bg-[#1f241a] border border-[#2a3122] focus:border-[#FBD53D] rounded-xl px-4 py-2.5 text-sm text-[#f1f4ec] placeholder-[#6b7362] outline-none transition-colors"
        />
      </div>

      <EndingTally room={preview} />

      <EndingPick value={vote} onChange={onVoteChange} disabled={busy} />

      {/* Low balance notice banner */}
      {balance !== undefined && balance < 0.02 && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-200 space-y-1">
          <div className="font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span>Notice</span>
          </div>
          <p className="leading-relaxed">
            Taking a seat costs about 0.02 SOL on devnet (stake + session gas). This wallet has <strong className="text-amber-100 font-mono">{balance.toFixed(3)} SOL</strong>. Use the <strong className="text-[#FBD53D] font-bold">+1 SOL</strong> button above.
          </p>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <Button
          label="Take the seat  →"
          onClick={onJoinRoom}
          disabled={busy}
          className="w-full text-base py-3.5"
        />
        <Button
          ghost
          label="Back"
          onClick={onBack}
          disabled={busy}
          className="w-full"
        />
      </div>
    </div>
  );
}
