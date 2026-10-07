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
}: {
  preview: RoomState;
  vote: Ending;
  onVoteChange: (v: Ending) => void;
  onJoinRoom: () => void;
  onBack: () => void;
  busy: boolean;
}) {
  const stakeSol = (Number(preview.stake) / 1e9).toFixed(3);
  const potSol = ((Number(preview.stake) * preview.seats.length) / 1e9).toFixed(3);

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={busy}
          className="p-2 rounded-full text-[#a69488] hover:text-[#faf5f0] hover:bg-[#1c120c] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
            JOINING GAME
          </span>
          <h2 className="text-2xl font-black italic tracking-tight text-[#faf5f0]">
            This Room
          </h2>
        </div>
      </div>

      {/* Room Summary */}
      <div className="p-4 bg-[#140d09]/80 border border-[#331f15] rounded-2xl space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#faf5f0] bg-[#1c120c] border border-[#331f15] px-3 py-1 rounded-full">
            {preview.seats.length} seated
          </span>
          <span className="text-sm font-extrabold text-amber-400">
            {potSol} SOL pot
          </span>
        </div>
        <p className="text-xs text-[#a69488]">
          Taking a seat stakes {stakeSol} SOL into the contract vault.
        </p>
      </div>

      {/* Players seated */}
      <div className="space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
          WHO IS IN
        </span>
        <Seats room={preview} />
      </div>

      <EndingTally room={preview} />

      <EndingPick value={vote} onChange={onVoteChange} disabled={busy} />

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
