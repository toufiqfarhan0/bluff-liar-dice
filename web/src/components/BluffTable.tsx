import React from "react";
import { Bid, DieFace, faceNamePlural } from "../lib/dice";
import { Avatar, shortKey } from "./Avatar";
import { Clock, Dices, Flame } from "lucide-react";
import { DieIcon } from "./Die";

export interface SeatInfo {
  address: string;
  name: string;
  diceCount: number;
  isAlive: boolean;
  isYou: boolean;
  isCurrentTurn: boolean;
  lastAction?: string;
}

export function BluffTable({
  seats,
  currentBid,
  turnTimeLeft,
  totalDiceOnTable,
  size: sizeProp,
  yourAddress,
}: {
  seats: SeatInfo[];
  currentBid: Bid | null;
  turnTimeLeft: number;
  totalDiceOnTable: number;
  size?: number;
  yourAddress?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Scaled proportionally for 100% browser zoom so all 4 seats remain fully in-frame
  const [size, setSize] = React.useState<number>(() => {
    if (sizeProp) return sizeProp;
    if (typeof window === "undefined") return 490;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (winW >= 1024) {
      return winH < 820 ? 470 : 495;
    }
    if (winW >= 768) return 460;
    return Math.min(410, Math.max(300, winW - 32));
  });

  React.useEffect(() => {
    if (sizeProp) {
      setSize(sizeProp);
      return;
    }
    const updateSize = () => {
      if (typeof window === "undefined") return;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      if (winW >= 1024) {
        setSize(winH < 820 ? 470 : 495);
      } else if (winW >= 768) {
        setSize(460);
      } else {
        setSize(Math.min(410, Math.max(300, winW - 32)));
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [sizeProp]);

  const isLarge = size >= 440;
  const isMedium = size >= 360;
  const avatarSize = isLarge ? 50 : isMedium ? 44 : 36;
  const avatarBox = isLarge ? 72 : isMedium ? 60 : 48;
  const radius = Math.round(size * 0.35);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex items-center justify-center select-none my-1 transition-all duration-300"
      style={{ width: size, height: size, maxWidth: "100%" }}
    >
      {/* Outer Felt Surface */}
      <div
        className="absolute rounded-full border-2 border-[#2e3b23] bg-gradient-to-b from-[#151e11] via-[#0d140a] to-[#070c05] shadow-[inset_0_0_70px_rgba(0,0,0,0.85),0_12px_40px_rgba(0,0,0,0.7)] transition-all duration-200"
        style={{ width: size - 16, height: size - 16 }}
      />

      {/* Decorative Poker Felt Ring */}
      <div
        className="absolute rounded-full border border-[#232f1b]/70 pointer-events-none transition-all duration-200"
        style={{ width: Math.max(100, size - 80), height: Math.max(100, size - 80) }}
      />

      {/* Center Table Info (The Current High Bid) */}
      <div
        className={`absolute z-10 flex flex-col items-center justify-center text-center p-2.5 ${
          isLarge ? "max-w-[220px]" : "max-w-[160px]"
        }`}
      >
        {currentBid ? (
          <div className="space-y-1 animate-in zoom-in-95 duration-200">
            <span
              className={`${
                isLarge ? "text-[10px]" : "text-[9px]"
              } font-extrabold uppercase tracking-widest text-[#6b7362] block`}
            >
              CURRENT BID
            </span>

            <div className="flex items-center justify-center gap-2.5 py-0.5">
              <span
                className={`${
                  isLarge ? "text-5xl" : "text-3xl"
                } font-black text-[#f1f4ec] font-mono tabular-nums`}
              >
                {currentBid.quantity}
              </span>
              <div
                className={`${
                  isLarge ? "w-11 h-11" : "w-8 h-8"
                } shrink-0 flex items-center justify-center drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]`}
              >
                <DieIcon face={currentBid.face} className="w-full h-full" />
              </div>
            </div>

            <span
              className={`${
                isLarge ? "text-sm" : "text-[11px]"
              } font-bold text-[#FBD53D] block truncate`}
            >
              {currentBid.quantity} {faceNamePlural(currentBid.face)}
            </span>

            <span
              className={`${
                isLarge ? "text-xs" : "text-[10px]"
              } text-[#98a08e] block truncate`}
            >
              by <strong className="text-[#f1f4ec]">{yourAddress && currentBid.bidderAddress === yourAddress ? "You" : currentBid.bidderName}</strong>
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Dices
              className={`${
                isLarge ? "w-10 h-10" : "w-7 h-7"
              } text-[#6b7362] mx-auto animate-pulse`}
            />
            <span
              className={`${
                isLarge ? "text-sm" : "text-xs"
              } font-black uppercase tracking-wider text-[#98a08e] block`}
            >
              WAITING FOR BID
            </span>
            <span
              className={`${
                isLarge ? "text-xs" : "text-[10px]"
              } text-[#6b7362] block`}
            >
              First player opens
            </span>
          </div>
        )}

        {/* Turn clock and total table dice */}
        <div
          className={`flex items-center gap-2 mt-1.5 pt-1.5 border-t border-[#232a1b] ${
            isLarge ? "text-xs" : "text-[10px]"
          } text-[#6b7362]`}
        >
          <span className="flex items-center gap-1.5 font-mono text-[#98a08e]">
            <Clock className={`${isLarge ? "w-3.5 h-3.5" : "w-3 h-3"} text-[#FBD53D]`} />
            {turnTimeLeft}s
          </span>
          <span>·</span>
          <span>{totalDiceOnTable} dice</span>
        </div>
      </div>

      {/* Seated Players around the Felt */}
      {seats.map((seat, i) => {
        const angle = (i / Math.max(1, seats.length)) * Math.PI * 2 - Math.PI / 2;
        const cx = size / 2 + Math.cos(angle) * radius;
        const cy = size / 2 + Math.sin(angle) * radius;

        return (
          <div
            key={seat.address}
            className="absolute z-20 flex flex-col items-center transition-all duration-300 pointer-events-auto"
            style={{
              left: `${cx}px`,
              top: `${cy}px`,
              transform: "translate(-50%, -50%)",
              width: `${avatarBox}px`,
            }}
          >
            {/* Avatar & Turn Glow */}
            <div className="relative">
              <div
                className={`rounded-full transition-all duration-300 ${
                  seat.isCurrentTurn
                    ? "ring-2 ring-[#FBD53D] shadow-[0_0_20px_#FBD53D]"
                    : ""
                }`}
              >
                <Avatar
                  who={seat.address}
                  name={seat.name}
                  size={avatarSize}
                  out={!seat.isAlive}
                  you={seat.isYou}
                />
              </div>

              {/* Dice Count Badge */}
              {seat.isAlive && (
                <div
                  title={`${seat.diceCount} dice remaining`}
                  className={`absolute -bottom-1 -right-1 bg-[#12160e] border border-[#FBD53D]/60 text-[#FBD53D] rounded-full ${
                    isLarge ? "w-6 h-6 text-xs font-black" : "w-5 h-5 text-[10px] font-black"
                  } flex items-center justify-center font-black shadow-lg`}
                >
                  {seat.diceCount}
                </div>
              )}
            </div>

            {/* Name */}
            <span
              className={`${
                isLarge ? "text-xs max-w-[76px]" : "text-[10px] max-w-[58px]"
              } font-bold truncate text-center mt-1 ${
                !seat.isAlive
                  ? "text-[#6b7362] line-through"
                  : seat.isYou
                  ? "text-[#FBD53D]"
                  : "text-[#f1f4ec]"
              }`}
            >
              {seat.isYou ? "You" : seat.name}
            </span>

            {/* Last Action Bubble */}
            {seat.lastAction && seat.isAlive && (
              <span
                className={`${
                  isLarge ? "text-[10px] px-2 py-0.5" : "text-[9px] px-1.5 py-0.2"
                } bg-[#1b2214] border border-[#2f3a22] text-[#FBD53D] font-semibold rounded-full whitespace-nowrap mt-0.5 shadow-sm`}
              >
                {seat.lastAction}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
