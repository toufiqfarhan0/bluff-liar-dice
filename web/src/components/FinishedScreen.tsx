import React from "react";
import type { RoomState } from "../lib/bluff";
import { Avatar, shortKey } from "./Avatar";
import { Button } from "./Button";
import { Award, CheckCircle2, RotateCcw, Trophy, Skull } from "lucide-react";

export interface FinishedPlayer {
  address: string;
  name: string;
  diceCount: number;
  isAlive: boolean;
  isHuman: boolean;
}

export function FinishedScreen({
  room,
  dicePlayers,
  pot,
  you,
  nameOf,
  youWon: youWonProp,
  settled,
  busy,
  onSettle,
  onAgain,
}: {
  room: RoomState;
  dicePlayers?: FinishedPlayer[];
  pot: number;
  you?: string;
  nameOf?: (key: string) => string;
  youWon?: boolean;
  settled: boolean;
  busy: boolean;
  onSettle: () => void;
  onAgain: () => void;
}) {
  // Derive survivors accurately from real Liar's Dice player states
  const hasDicePlayers = dicePlayers && dicePlayers.length > 0;
  const aliveFromDice = hasDicePlayers
    ? dicePlayers.filter((p) => p.isAlive && p.diceCount > 0)
    : [];

  const survivors = aliveFromDice.length > 0
    ? aliveFromDice
    : room.seats.filter((seat) => seat.alive).map((seat) => ({
        address: seat.wallet.toBase58(),
        name: seat.wallet.toBase58() === you ? "You" : nameOf?.(seat.wallet.toBase58()) ?? shortKey(seat.wallet.toBase58()),
        diceCount: 1,
        isAlive: true,
        isHuman: seat.wallet.toBase58() === you,
      }));

  const isSoloWinner = survivors.length === 1;
  const champion = survivors[0];
  const isYou = champion ? (champion.address === you || (hasDicePlayers && champion.isHuman)) : false;
  const youWon = youWonProp !== undefined ? youWonProp : isYou;

  const championName = champion
    ? isYou
      ? "You"
      : champion.name || (nameOf?.(champion.address) ?? shortKey(champion.address))
    : "Nobody";

  const share = isSoloWinner ? pot : (survivors.length ? pot / survivors.length : pot);

  const standingsList = hasDicePlayers
    ? [...dicePlayers].sort((a, b) => b.diceCount - a.diceCount)
    : room.seats.map((seat) => {
        const addr = seat.wallet.toBase58();
        const isSeatYou = addr === you;
        return {
          address: addr,
          name: isSeatYou ? "You" : nameOf?.(addr) ?? shortKey(addr),
          diceCount: seat.alive ? 1 : 0,
          isAlive: seat.alive,
          isHuman: isSeatYou,
        };
      });

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Victory / Defeat Hero Card */}
      <div
        className={`p-6 rounded-3xl border text-center flex flex-col items-center space-y-3 ${
          youWon
            ? "bg-[#201d10] border-[#FBD53D]/40 shadow-[0_0_30px_-5px_rgba(251,213,61,0.3)]"
            : "bg-[#171b14] border-[#2a3122]"
        }`}
      >
        <span className="text-5xl select-none">{youWon ? "👑" : "🎲"}</span>

        <h2
          className={`text-3xl font-black tracking-wide ${
            youWon ? "text-[#FBD53D]" : "text-[#f1f4ec]"
          }`}
        >
          {youWon ? "BLUFF CHAMPION" : "Eliminated from Table"}
        </h2>

        {champion && (
          <Avatar
            who={champion.address}
            name={championName}
            size={72}
            you={isYou}
          />
        )}

        <div className="inline-flex px-4 py-1.5 rounded-full bg-[#FBD53D] text-[#141004] text-xs font-black uppercase tracking-wider">
          {isSoloWinner ? `${championName} Takes Entire Pot` : `${survivors.length} Survivors Split`}
        </div>

        <p className="text-xs text-[#98a08e] max-w-xs leading-relaxed">
          {youWon
            ? "You out-bluffed every opponent at the table! Last player standing with dice."
            : `${championName} survived with the last remaining dice at the table.`}
        </p>
      </div>

      {/* The Pot & Settlement card */}
      <div className="p-5 bg-[#171b14] border border-[#2a3122] rounded-3xl text-center space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
          {settled ? "SETTLED ON SOLANA" : "THE TOTAL POT"}
        </span>

        <div className="text-4xl font-black text-[#FBD53D] tracking-wide">
          ◎ {(pot / 1e9).toFixed(2)}
        </div>

        <p className="text-xs text-[#f1f4ec] font-medium">
          {isSoloWinner
            ? youWon
              ? "All of it is yours."
              : `All of it went to ${championName}.`
            : `Split ${survivors.length} ways — ◎ ${(share / 1e9).toFixed(2)} each.`}
        </p>

        <p className="text-[11px] text-[#6b7362]">
          {settled ? (
            <span className="inline-flex items-center gap-1 text-[#5fd39a]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Transferred from Solana vault PDA directly to recipient wallet.</span>
            </span>
          ) : (
            "Held in Solana Vault PDA until claimed by winner's session key."
          )}
        </p>
      </div>

      {/* Final Table Standings */}
      <div className="space-y-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
          FINAL TABLE STANDINGS
        </span>
        <div className="space-y-2">
          {standingsList.map((player) => {
            const isPlayerYou = player.address === you || player.isHuman;
            const isWinner = isSoloWinner && player.address === champion?.address;

            return (
              <div
                key={player.address}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isWinner
                    ? "bg-[#201d10] border-[#FBD53D]/40"
                    : player.isAlive
                    ? "bg-[#171b14] border-[#2a3122]"
                    : "bg-[#171b14]/50 border-[#2a3122]/60 opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar who={player.address} name={player.name} size={28} out={!player.isAlive} you={isPlayerYou} />
                  <div>
                    <span className={`text-xs font-bold block ${isPlayerYou ? "text-[#FBD53D]" : "text-[#f1f4ec]"}`}>
                      {isPlayerYou ? "You" : player.name}
                    </span>
                    <span className="text-[10px] text-[#8b9580]">
                      {player.diceCount > 0 ? `${player.diceCount} dice remaining` : "0 dice"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {isWinner ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#FBD53D] uppercase">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Winner</span>
                    </span>
                  ) : player.isAlive ? (
                    <span className="text-[11px] font-bold text-[#a3e635]">Survivor</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f2603c]">
                      <Skull className="w-3 h-3" />
                      <span>Out</span>
                    </span>
                  )}
                </div>
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
