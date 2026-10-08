import React from "react";
import { Wordmark } from "./Wordmark";
import { Button } from "./Button";
import { GuardBar } from "./FairnessModal";
import { Search } from "lucide-react";

export function LobbyScreen({
  stake,
  botSeats,
  joinCode,
  onChangeJoinCode,
  onFindRoom,
  onOpenRoom,
  onOpenFairness,
  busy,
}: {
  stake: bigint;
  botSeats: number;
  joinCode: string;
  onChangeJoinCode: (code: string) => void;
  onFindRoom: () => void;
  onOpenRoom: () => void;
  onOpenFairness: () => void;
  busy: boolean;
}) {
  const stakeSol = (Number(stake) / 1e9).toFixed(2);
  const estPotSol = ((Number(stake) * (botSeats + 1)) / 1e9).toFixed(2);

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-3.5 animate-in fade-in duration-300">
      {/* Brand Hero */}
      <div className="flex flex-col items-center text-center space-y-1 select-none">
        <Wordmark />
        <p className="text-xs sm:text-sm font-semibold text-[#f1f4ec] tracking-normal">
          Bid high. Call bluff. Take the pot.
        </p>

        <p className="text-xs sm:text-sm text-[#98a08e] max-w-xs leading-relaxed pt-1">
          Roll secret dice in Private TEE enclaves. Bid higher, challenge liars, and be the last player standing.
        </p>
      </div>

      {/* Main Play Action */}
      <div className="w-full space-y-2.5">
        <Button
          label="PLAY  →"
          onClick={onOpenRoom}
          disabled={busy}
          className="w-full text-base py-3"
        />

        {/* Stake & Pot Stats */}
        <div className="grid grid-cols-2 rounded-2xl bg-[#171b14] border border-[#2a3122] overflow-hidden divide-x divide-[#2a3122]">
          <div className="p-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-[#6b7362] uppercase tracking-wider">
              Entry fee
            </span>
            <span className="text-lg font-black text-[#f1f4ec] tracking-wide">
              {stakeSol} ◎
            </span>
          </div>
          <div className="p-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] font-semibold text-[#6b7362] uppercase tracking-wider">
              Est. pot (6 seats)
            </span>
            <span className="text-lg font-black text-[#FBD53D] tracking-wide">
              ~{estPotSol} ◎
            </span>
          </div>
        </div>

        {/* Got a Code Card */}
        <div className="p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
            GOT A ROOM CODE?
          </span>

          <div className="relative">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => onChangeJoinCode(e.target.value)}
              placeholder="Paste room code or invite link..."
              className="w-full bg-[#1f241a] border border-[#2a3122] focus:border-[#FBD53D] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#f1f4ec] placeholder-[#6b7362] outline-none transition-colors"
            />
          </div>

          <Button
            ghost
            label={
              <span className="flex items-center justify-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Look at the room</span>
              </span>
            }
            onClick={onFindRoom}
            disabled={busy || !joinCode.trim()}
            className="w-full py-2 text-xs"
          />
        </div>
      </div>

      {/* Fairness explainer banner */}
      <GuardBar onClick={onOpenFairness} />
    </div>
  );
}
