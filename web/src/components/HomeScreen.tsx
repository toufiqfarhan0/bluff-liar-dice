import React, { useState } from "react";
import { ArrowUpRight, ShieldCheck, Dices, Eye, EyeOff, Hash, LogIn } from "lucide-react";
import { DieFace, rollDice } from "../lib/dice";
import { DieItem } from "./DiceTray";

export function HomeScreen({
  stake,
  botSeats,
  joinCode,
  onChangeJoinCode,
  onFindRoom,
  onOpenRoom,
  onGoRules,
  busy,
}: {
  stake: bigint;
  botSeats: number;
  joinCode: string;
  onChangeJoinCode: (code: string) => void;
  onFindRoom: () => void;
  onOpenRoom: () => void;
  onGoRules: () => void;
  busy: boolean;
}) {
  const [demoDice, setDemoDice] = useState<DieFace[]>([1, 3, 4, 5, 6]);
  const [concealed, setConcealed] = useState(false);

  const stakeSol = (Number(stake) / 1e9).toFixed(2);
  const estPotSol = ((Number(stake) * (botSeats + 1)) / 1e9).toFixed(2);

  const rollNewDemoDice = () => {
    setDemoDice(rollDice(5));
  };

  return (
    <div className="relative w-full flex-1 flex flex-col justify-center">
      <section className="relative min-h-[calc(100dvh-64px)] w-full overflow-hidden flex items-center py-8">
        {/* Background Video (Matching FHE Liar's Dice liars_hero.mp4) */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          src="/video/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Gradient Overlays identical to FHE Liar's Dice */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-[#070a0f] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent pointer-events-none" />

        {/* Two-Column Grid matching FHE Liar's Dice */}
        <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-rows-[auto_1fr] items-center gap-6 px-4 py-4 sm:px-6 lg:grid-cols-2 lg:grid-rows-1 lg:gap-8 lg:py-0">
          {/* Left Column: Brand, Headline, Paragraph, CTAs */}
          <div className="flex flex-col items-start gap-4 text-left lg:gap-6">
            {/* Brand Lockup */}
            <div className="flex items-center gap-3 text-slate-400">
              <span className="flex h-8 items-center rounded-md bg-white px-2.5">
                <span className="font-extrabold text-xs tracking-wider text-slate-900 font-mono">
                  MAGICBLOCK
                </span>
              </span>
              <span className="text-lg font-light text-slate-600">×</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-300 font-mono">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="4"
                    y="4"
                    width="56"
                    height="56"
                    rx="14"
                    fill="#070a0f"
                    stroke="#f97316"
                    strokeWidth="4"
                  />
                  <circle cx="32" cy="32" r="9" fill="#f97316" />
                </svg>
                BLUFF LIAR'S DICE
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-xl text-3xl font-semibold leading-tight text-slate-50 sm:text-5xl lg:text-6xl font-['Archivo']">
              Nobody sees your <span className="glow-text-orange text-orange-400">dice</span>
              <br />
              Everyone sees your <span className="glow-text-warning text-rose-400">lies</span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-md text-base leading-relaxed text-slate-300 font-['IBM_Plex_Sans']">
              Roll five dice sealed onchain, bid against the table, then call a bluff. Only the verdict goes public.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onOpenRoom}
                disabled={busy}
                className="rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <span>Create a table</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={onGoRules}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/25 cursor-pointer bg-slate-900/40 backdrop-blur"
              >
                How privacy works
              </button>
            </div>
          </div>

          {/* Right Column: Live Table Match Action Card */}
          <div className="relative w-full flex items-center justify-center lg:justify-end">
            <div className="panel w-full max-w-md p-6 space-y-5 shadow-2xl bg-[#0b0e14]/85 border-white/10">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-semibold text-slate-300 font-mono tracking-wide uppercase">
                  Live Match Table
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Solana Devnet
                </span>
              </div>

              {/* 3D Acrylic Dice Stage */}
              <div className="relative flex flex-col items-center justify-center py-5 px-3 bg-gradient-to-b from-[#0e131b] to-[#070a0f] rounded-xl border border-white/5 shadow-inner">
                {/* Curved table felt rail arc */}
                <div className="w-[260px] sm:w-[320px] h-[40px] border-t-2 border-orange-400/50 rounded-[50%] shadow-[0_-6px_20px_rgba(249,115,22,0.3)] relative flex items-start justify-center">
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-orange-400/50 text-slate-200 -translate-y-1/2 font-mono">
                    Private TEE Hand
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 -mt-1 min-h-[52px]">
                  {!concealed ? (
                    demoDice.map((val, idx) => (
                      <div key={idx} className="transition-transform duration-200 hover:scale-110">
                        <DieItem face={val} highlighted={val === 1} size="md" />
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 py-2">
                      <EyeOff className="w-4 h-4 text-orange-400" />
                      <span>Encrypted inside SGX Enclave</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    type="button"
                    onClick={rollNewDemoDice}
                    className="text-[11px] font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Roll sample hand</span>
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    type="button"
                    onClick={() => setConcealed(!concealed)}
                    className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {concealed ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3" />}
                    <span>{concealed ? "Reveal" : "Conceal"}</span>
                  </button>
                </div>
              </div>

              {/* Stake & Pot Stats */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400 font-mono">Buy-in per seat</div>
                  <div className="text-lg font-mono font-bold text-slate-100">{stakeSol} SOL</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5">
                  <div className="text-[11px] text-slate-400 font-mono">Winner pot (6 seats)</div>
                  <div className="text-lg font-mono font-bold text-orange-400">~{estPotSol} SOL</div>
                </div>
              </div>

              {/* Primary Create Button */}
              <button
                type="button"
                onClick={onOpenRoom}
                disabled={busy}
                className="w-full rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Dices className="w-4 h-4" />
                <span>Open New Table ({stakeSol} SOL)</span>
              </button>

              {/* Join by Table Code */}
              <div className="space-y-1.5 text-left pt-1">
                <label className="text-[11px] text-slate-400 font-mono block">
                  Have a room code?
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2">
                    <Hash className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => onChangeJoinCode(e.target.value)}
                      placeholder="e.g. host:12345"
                      className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onFindRoom}
                    disabled={busy || !joinCode.trim()}
                    className="rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition cursor-pointer disabled:opacity-40"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
