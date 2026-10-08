import React from "react";
import { Wordmark } from "./Wordmark";
import { Button } from "./Button";
import { GuardBar } from "./FairnessModal";
import { Dices, Search } from "lucide-react";

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
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Brand Hero */}
      <div className="flex flex-col items-center text-center space-y-2 select-none">
        <Wordmark />
        <p className="text-sm sm:text-base font-semibold text-[#f1f4ec] tracking-tight">
          Bid high. Call bluff. Take the pot.
        </p>

        {/* Landing Artwork */}
        <div className="w-full max-w-[280px] h-[100px] my-2 relative flex items-center justify-center">
          <div className="relative p-6 rounded-3xl bg-[#201d10]/50 border border-[#FBD53D]/30 shadow-[0_0_30px_-5px_rgba(251, 213, 61,0.25)] flex items-center justify-center gap-4">
            <Dices className="w-12 h-12 text-[#FBD53D] animate-bounce" />
            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#FBD53D] block">
                Liar's Dice
              </span>
              <span className="text-xs text-[#98a08e]">
                Secret Enclave Rolls
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#98a08e] max-w-xs leading-relaxed">
          Roll secret dice in Private TEE enclaves. Bid higher, challenge liars, and be the last player standing.
        </p>
      </div>

      {/* Main Play Action */}
      <div className="w-full space-y-3.5">
        <Button
          label="PLAY  →"
          onClick={onOpenRoom}
          disabled={busy}
          className="w-full text-lg py-4"
        />

        {/* Stake & Pot Stats */}
        <div className="grid grid-cols-2 rounded-2xl bg-[#171b14] border border-[#2a3122] overflow-hidden divide-x divide-[#2a3122]">
          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-[#6b7362] uppercase tracking-wider">
              Entry fee
            </span>
            <span className="text-xl font-black text-[#f1f4ec] tracking-tight">
              {stakeSol} ◎
            </span>
          </div>
          <div className="p-3.5 flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold text-[#6b7362] uppercase tracking-wider">
              Est. pot (6 seats)
            </span>
            <span className="text-xl font-black text-[#FBD53D] tracking-tight">
              ~{estPotSol} ◎
            </span>
          </div>
        </div>

        {/* Got a Code Card */}
        <div className="p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
            GOT A ROOM CODE?
          </span>

          <div className="relative">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => onChangeJoinCode(e.target.value)}
              placeholder="Paste room code (e.g. host:12345)"
              className="w-full bg-[#1f241a] border border-[#2a3122] focus:border-[#FBD53D] rounded-xl px-4 py-3 text-sm text-[#f1f4ec] placeholder-[#6b7362] outline-none transition-colors"
            />
          </div>

          <Button
            ghost
            label={
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Look at the room</span>
              </span>
            }
            onClick={onFindRoom}
            disabled={busy || !joinCode.trim()}
            className="w-full py-2.5"
          />
        </div>
      </div>

      {/* Fairness explainer banner */}
      <GuardBar onClick={onOpenFairness} />
    </div>
  );
}
