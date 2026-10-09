import React from "react";
import type { RoomState } from "../lib/bluff";
import { Avatar, shortKey } from "./Avatar";
import { Button } from "./Button";
import { Award, CheckCircle2, ExternalLink, RotateCcw, Trophy, Skull } from "lucide-react";

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
  settleSignature,
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
  settleSignature?: string | null;
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
  const isYouSurvivor = survivors.some((s) => s.address === you || (hasDicePlayers && s.isHuman));
  const isYou = champion ? (champion.address === you || (hasDicePlayers && champion.isHuman)) : false;
  const youWon = youWonProp !== undefined ? youWonProp : (isSoloWinner ? isYou : isYouSurvivor);

  const championName = isSoloWinner
    ? champion
      ? isYou
        ? "You"
        : champion.name || (nameOf?.(champion.address) ?? shortKey(champion.address))
      : "Nobody"
    : survivors.map((s) => (s.address === you || (hasDicePlayers && s.isHuman) ? "You" : s.name)).join(" & ");

  const displayPot =
    pot > 0
      ? pot
      : room?.stake
      ? Number(room.stake) * (room.seats?.length || 4)
      : 40_000_000;
  const share = isSoloWinner ? displayPot : survivors.length ? displayPot / survivors.length : displayPot;

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
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 animate-in fade-in duration-300">
      {/* Side-by-Side 2-Column Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch justify-center">
        {/* Left Column: Hero Card & Pot/Settlement Card */}
        <div className="flex flex-col space-y-5 justify-between">
          {/* Victory / Defeat Hero Card */}
          <div
            className={`p-6 rounded-3xl border text-center flex flex-col items-center justify-center space-y-3.5 flex-1 shadow-md ${
              youWon
                ? "bg-[#201d10] border-[#FBD53D]/40 shadow-[0_0_35px_-5px_rgba(251,213,61,0.25)]"
                : "bg-[#171b14] border-[#2a3122]"
            }`}
          >
            <span className="text-5xl select-none">
              {isSoloWinner ? (youWon ? "👑" : "🎲") : youWon ? "🤝" : "🎲"}
            </span>

            <h2
              className={`text-2xl sm:text-3xl font-black tracking-wide ${
                youWon ? "text-[#FBD53D]" : "text-[#f1f4ec]"
              }`}
            >
              {isSoloWinner
                ? youWon
                  ? "BLUFF CHAMPION"
                  : "Table Elimination"
                : youWon
                ? "CO-CHAMPIONS"
                : "Table Elimination"}
            </h2>

            {/* Solo Champion Avatar */}
            {isSoloWinner && champion && (
              <div className="my-1">
                <Avatar
                  who={champion.address}
                  name={championName}
                  size={72}
                  you={isYou}
                  showName={true}
                />
              </div>
            )}

            {/* Split Pot: Dual Co-Champion Avatars with Clean Gap (No Overlapping) */}
            {!isSoloWinner && (
              <div className="flex items-center justify-center gap-6 my-1">
                {survivors.map((s) => {
                  const isSurvivorYou = s.address === you || (hasDicePlayers && s.isHuman);
                  return (
                    <Avatar
                      key={s.address}
                      who={s.address}
                      name={isSurvivorYou ? "You" : s.name}
                      size={64}
                      you={isSurvivorYou}
                      showName={true}
                    />
                  );
                })}
              </div>
            )}

            <div className="inline-flex px-4 py-1.5 rounded-full bg-[#FBD53D] text-[#141004] text-xs font-black uppercase tracking-wider shadow-sm">
              {isSoloWinner
                ? isYou
                  ? "You Take Entire Pot"
                  : `${championName} Takes Entire Pot`
                : `${survivors.length} Finalists Split Pot 50/50`}
            </div>

            <p className="text-xs text-[#98a08e] max-w-xs leading-relaxed">
              {isSoloWinner
                ? youWon
                  ? "You out-bluffed every opponent at the table! Last player standing with dice."
                  : `${championName} survived with the last remaining dice at the table.`
                : youWon
                ? `Heads-up tiebreak! Pot is split 50/50 between the ${survivors.length} surviving finalists.`
                : `Table reached a tiebreak split between ${survivors.map((s) => s.name).join(" and ")}.`}
            </p>
          </div>

          {/* The Pot & Settlement card with action buttons */}
          <div className="p-5 bg-[#171b14] border border-[#2a3122] rounded-3xl text-center space-y-3 shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
              {settled ? "SETTLED ON SOLANA" : "THE TOTAL POT"}
            </span>

            <div className="text-4xl font-black text-[#FBD53D] tracking-wide">
              ◎ {(displayPot / 1e9).toFixed(2)}
            </div>

            <p className="text-xs text-[#f1f4ec] font-medium">
              {isSoloWinner
                ? youWon
                  ? "All of it is yours."
                  : `All of it went to ${championName}.`
                : `Split ${survivors.length} ways — ◎ ${(share / 1e9).toFixed(2)} each.`}
            </p>

            <div className="text-[11px] text-[#6b7362] flex flex-col items-center gap-1 pt-0.5">
              {settled ? (
                <>
                  <span className="inline-flex items-center gap-1 text-[#5fd39a]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Transferred from Solana vault PDA directly to recipient wallet.</span>
                  </span>
                  {settleSignature && (
                    <a
                      href={`https://explorer.solana.com/tx/${settleSignature}?cluster=devnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBD53D]/10 hover:bg-[#FBD53D]/20 border border-[#FBD53D]/30 text-[#FBD53D] font-mono text-[11px] font-bold transition-all mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Settlement on Solana Explorer ↗</span>
                    </a>
                  )}
                </>
              ) : (
                <span>Held in Solana Vault PDA until claimed by winner's session key.</span>
              )}
            </div>

            {/* Actions directly under the pot */}
            <div className="space-y-2.5 pt-2">
              {!settled && youWon && (
                <Button
                  label={
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4 fill-current" />
                      <span>CLAIM ◎ {(share / 1e9).toFixed(2)} →</span>
                    </span>
                  }
                  onClick={onSettle}
                  disabled={busy}
                  className="w-full text-base py-3.5 shadow-[0_0_25px_rgba(251,213,61,0.25)] hover:shadow-[0_0_35px_rgba(251,213,61,0.4)]"
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
                className="w-full text-sm py-3"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Final Table Standings Box matching height */}
        <div className="flex flex-col p-5 bg-[#171b14] border border-[#2a3122] rounded-3xl space-y-3.5 justify-between shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#242e1c]">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
                FINAL TABLE STANDINGS
              </span>
              <span className="text-[10px] font-mono text-[#8b9580]">
                {standingsList.length} Players
              </span>
            </div>

            <div className="space-y-2.5">
              {standingsList.map((player) => {
                const isPlayerYou = player.address === you || player.isHuman;
                const isWinner = isSoloWinner
                  ? player.address === champion?.address
                  : player.isAlive;

                return (
                  <div
                    key={player.address}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isWinner
                        ? "bg-[#201d10] border-[#FBD53D]/40 shadow-[0_0_18px_-3px_rgba(251,213,61,0.2)]"
                        : player.isAlive
                        ? "bg-[#1a2016] border-[#2a3122]"
                        : "bg-[#141910]/70 border-[#242e1c]/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        who={player.address}
                        name={player.name}
                        size={34}
                        out={!player.isAlive}
                        you={isPlayerYou}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold block ${
                              isPlayerYou ? "text-[#FBD53D]" : "text-[#f1f4ec]"
                            }`}
                          >
                            {isPlayerYou ? "You" : player.name}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-mono font-black text-[#FBD53D] px-1.5 py-0.5 rounded bg-[#FBD53D]/10 border border-[#FBD53D]/20">
                              +◎ {(share / 1e9).toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8b9580]">
                          {player.diceCount > 0
                            ? `${player.diceCount} ${player.diceCount === 1 ? "die" : "dice"} remaining`
                            : "0 dice (Eliminated)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBD53D]/10 border border-[#FBD53D]/30 text-[10px] font-black text-[#FBD53D] uppercase tracking-wider">
                          <Trophy className="w-3.5 h-3.5" />
                          <span>{isSoloWinner ? "Winner" : "Co-Winner (50%)"}</span>
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

          {/* Table Summary Footer in Standings */}
          <div className="pt-3 border-t border-[#242e1c] flex items-center justify-between text-[11px] text-[#6b7362] font-mono">
            <span>Pot: ◎ {(displayPot / 1e9).toFixed(2)} SOL</span>
            <span className="text-[#8b9580]">
              {isSoloWinner ? "Solo Champion" : "50/50 Split Rule"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
