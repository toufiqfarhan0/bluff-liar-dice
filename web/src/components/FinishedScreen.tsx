import React, { useEffect } from "react";
import type { RoomState } from "../lib/bluff";
import { Avatar, shortKey } from "./Avatar";
import { Button } from "./Button";
import confetti from "canvas-confetti";
import { Award, CheckCircle2, Crown, Dices, RotateCcw } from "lucide-react";

export function FinishedScreen({
  room,
  pot,
  you,
  nameOf,
  youWon,
  settled,
  busy,
  onSettle,
  onAgain,
}: {
  room: RoomState;
  pot: number;
  you?: string;
  nameOf?: (key: string) => string;
  youWon: boolean;
  settled: boolean;
  busy: boolean;
  onSettle: () => void;
  onAgain: () => void;
}) {
  const survivors = room.seats.filter((seat) => seat.alive);
  const share = survivors.length ? pot / survivors.length : 0;
  const champion = survivors[0];
  const championName = champion
    ? champion.wallet.toBase58() === you
      ? "You"
      : nameOf?.(champion.wallet.toBase58()) ?? shortKey(champion.wallet.toBase58())
    : "Nobody";

  useEffect(() => {
    if (youWon) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#f97316", "#f59e0b", "#fbbf24", "#ffffff"],
      });
    }
  }, [youWon]);

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Victory / Defeat Hero Card */}
      <div
        className={`p-6 rounded-3xl border text-center flex flex-col items-center space-y-3.5 backdrop-blur-md ${
          youWon
            ? "bg-[#24150e]/90 border-orange-500/60 shadow-[0_0_35px_-5px_rgba(249,115,22,0.45)]"
            : "bg-[#140d09]/80 border-[#331f15]"
        }`}
      >
        <div className="p-3 rounded-2xl bg-[#1f130c] border border-orange-500/30 flex items-center justify-center">
          {youWon ? (
            <Crown className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          ) : (
            <Dices className="w-10 h-10 text-orange-400/70" />
          )}
        </div>

        <h2
          className={`text-3xl font-black italic tracking-tight ${
            youWon ? "text-amber-400" : "text-[#faf5f0]"
          }`}
        >
          {youWon ? "BLUFF CHAMPION" : "Eliminated from Table"}
        </h2>

        {champion && (
          <Avatar
            who={champion.wallet.toBase58()}
            name={championName}
            size={72}
            you={champion.wallet.toBase58() === you}
          />
        )}

        <div className="inline-flex px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-orange-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.35)]">
          {survivors.length === 1 ? `${championName} Takes Pot` : `${survivors.length} Survivors Split`}
        </div>

        <p className="text-xs text-[#a69488] max-w-xs leading-relaxed">
          {youWon
            ? `You out-bluffed every opponent at the table! Last player standing with dice.`
            : `${championName} survived with the last remaining dice at the table.`}
        </p>
      </div>

      {/* The Pot & Settlement card */}
      <div className="p-5 bg-[#140d09]/80 border border-[#331f15] rounded-3xl text-center space-y-2 backdrop-blur-md">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
          {settled ? "SETTLED ON SOLANA" : "THE TOTAL POT"}
        </span>

        <div className="text-4xl font-black text-amber-400 tracking-tight drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]">
          ◎ {(pot / 1e9).toFixed(2)}
        </div>

        <p className="text-xs text-[#faf5f0] font-medium">
          {survivors.length === 1
            ? youWon
              ? "All of it is yours."
              : `All of it went to ${championName}.`
            : `Split ${survivors.length} ways — ◎ ${(share / 1e9).toFixed(2)} each.`}
        </p>

        <p className="text-[11px] text-[#6e5e54]">
          {settled ? (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Transferred from Solana vault PDA directly to recipient wallet.</span>
            </span>
          ) : (
            "Held in Solana Vault PDA until claimed by winner's session key."
          )}
        </p>
      </div>

      {/* Last Actions / Words Recap List */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
          TABLE SUMMARY
        </span>
        <div className="space-y-2">
          {room.seats.map((seat, i) => {
            const word = room.lastWords[i];
            if (!word) return null;
            const key = seat.wallet.toBase58();
            const isYou = key === you;
            const name = isYou ? "You" : nameOf?.(key) ?? shortKey(key);

            return (
              <div
                key={key}
                className={`flex items-center justify-between p-3 rounded-xl bg-[#140d09]/80 border border-[#331f15] ${
                  !seat.alive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar who={key} name={name} size={28} out={!seat.alive} you={isYou} />
                  <span className={`text-xs font-bold ${isYou ? "text-orange-400" : "text-[#faf5f0]"}`}>
                    {name}
                  </span>
                </div>
                <span
                  className={`text-xs font-extrabold capitalize ${
                    !seat.alive ? "text-red-400 line-through" : "text-[#faf5f0]"
                  }`}
                >
                  "{word}"
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-2">
        {!settled && youWon && (
          <Button
            label={
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 fill-current" />
                <span>CLAIM ◎ {(share / 1e9).toFixed(2)}  →</span>
              </span>
            }
            onClick={onSettle}
            disabled={busy}
            className="w-full text-base py-4"
          />
        )}

        <Button
          ghost={!settled && youWon}
          label={
            <span className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Play another game</span>
            </span>
          }
          onClick={onAgain}
          disabled={busy}
          className="w-full text-base py-3.5"
        />
      </div>
    </div>
  );
}
