import React from "react";
import { Avatar } from "./Avatar";

export function RingTable({
  seats,
  you,
  nameOf,
  size = 280,
  children,
}: {
  seats: { key: string; alive: boolean }[];
  you?: string;
  nameOf?: (key: string) => string;
  size?: number;
  children?: React.ReactNode;
}) {
  const face = 46;
  const radius = size / 2 - face / 2 - 10;

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Decorative table ring glow */}
      <div
        className="absolute rounded-full border border-[#422514] bg-[#140d09]/70 shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(249,115,22,0.12)]"
        style={{ width: size - 30, height: size - 30 }}
      />

      {/* Center content (pot / status) */}
      <div className="absolute z-10 flex flex-col items-center justify-center text-center">
        {children}
      </div>

      {/* Seated players around the perimeter */}
      {seats.map((seat, i) => {
        const angle = (i / Math.max(1, seats.length)) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * radius - face / 2;
        const y = size / 2 + Math.sin(angle) * radius - face / 2;
        const name = seat.key === you ? "you" : nameOf?.(seat.key);

        return (
          <div
            key={seat.key}
            className="absolute z-20 flex flex-col items-center transition-all duration-300"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              width: `${face}px`,
            }}
          >
            <Avatar
              who={seat.key}
              name={name}
              size={face}
              out={!seat.alive}
              you={seat.key === you}
            />
            <span
              className={`text-[10px] font-semibold truncate max-w-[56px] text-center mt-1 ${
                !seat.alive
                  ? "text-[#6e5e54] line-through"
                  : seat.key === you
                    ? "text-orange-400 font-bold"
                    : "text-[#a69488]"
              }`}
            >
              {seat.key === you ? "You" : name ?? ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
