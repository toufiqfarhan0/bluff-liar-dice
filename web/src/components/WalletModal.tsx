import React, { useState } from "react";
import {
  ConnectedWallet,
  WalletOption,
  createFreshBurnerWallet,
  getAvailableWallets,
} from "../lib/wallet";
import {
  AlertCircle,
  Check,
  ExternalLink,
  Flame,
  KeyRound,
  Loader2,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { requestDevnetAirdrop } from "../lib/chain";

export function WalletModal({
  open,
  onClose,
  onSelect,
  activeWallet,
  onAirdropSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (wallet: ConnectedWallet) => void;
  activeWallet: ConnectedWallet | null;
  onAirdropSuccess?: () => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [airdropping, setAirdropping] = useState(false);
  const [airdropSig, setAirdropSig] = useState<string | null>(null);

  if (!open) return null;

  const options = getAvailableWallets();
  const extensionWallets = options.filter((o) => o.id !== "devnet-burner");
  const burnerOption = options.find((o) => o.id === "devnet-burner");

  const handleConnect = async (option: WalletOption) => {
    setError(null);
    setLoading(option.id);
    try {
      const connected = await option.connect();
      onSelect(connected);
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Failed to connect");
    } finally {
      setLoading(null);
    }
  };

  const handleFreshBurner = async () => {
    setLoading("fresh-burner");
    try {
      const fresh = await createFreshBurnerWallet();
      onSelect(fresh);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAirdrop = async () => {
    if (!activeWallet) return;
    setAirdropping(true);
    setError(null);
    setAirdropSig(null);
    try {
      const sig = await requestDevnetAirdrop(activeWallet.publicKey, 1);
      setAirdropSig(sig);
      onAirdropSuccess?.();
    } catch (e: any) {
      setError(e.message ?? "Airdrop failed. Devnet faucets can be rate-limited.");
    } finally {
      setAirdropping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0c0805] border border-[#331f15] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#a69488] hover:text-[#faf5f0] hover:bg-[#1f130c] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1.5">
          <Wallet className="w-6 h-6 text-orange-400" />
          <h2 className="text-2xl font-black italic tracking-tight text-[#faf5f0]">
            Choose Wallet
          </h2>
        </div>
        <p className="text-xs text-[#a69488] mb-4">
          Connect your Solana wallet or use the built-in Devnet burner keypair to test.
        </p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium mb-4">
            {error}
          </div>
        )}

        {/* Active wallet info & airdrop */}
        {activeWallet && (
          <div className="mb-5 p-3.5 bg-[#140d09] border border-[#331f15] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#a69488]">
              <span>ACTIVE WALLET</span>
              <span className="text-orange-400 font-bold">CONNECTED ON DEVNET</span>
            </div>
            <div className="font-mono text-xs text-[#faf5f0] truncate bg-[#090604] p-2 rounded-lg border border-[#2d1b12] select-all">
              {activeWallet.address}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <a
                href={`https://explorer.solana.com/address/${activeWallet.address}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>View on Solana Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-[#6e5e54]">Real On-Chain Devnet</span>
            </div>

            <button
              type="button"
              onClick={handleAirdrop}
              disabled={airdropping}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {airdropping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Requesting 1 SOL Devnet Airdrop…</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>Request 1 Devnet SOL (Free Faucet)</span>
                </>
              )}
            </button>

            {airdropSig && (
              <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-xs space-y-1">
                <div className="text-orange-400 font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>1 Devnet SOL Airdropped!</span>
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${airdropSig}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#faf5f0] hover:underline flex items-center gap-1 font-mono truncate"
                >
                  <span>TX: {airdropSig.slice(0, 16)}…</span>
                  <ExternalLink className="w-3 h-3 shrink-0 text-orange-400" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* 1. Installed Browser Extensions Section */}
        {extensionWallets.length > 0 ? (
          <div className="space-y-2 mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
              DETECTED EXTENSIONS
            </span>
            {extensionWallets.map((opt) => {
              const isCurrent = activeWallet?.label === opt.name;
              const isBusy = loading === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleConnect(opt)}
                  disabled={!!loading}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer bg-[#140d09] border-[#331f15] hover:bg-[#1f130c] hover:border-orange-500/40 ${
                    isCurrent ? "ring-1 ring-orange-500" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon ? (
                      <img src={opt.icon} alt={opt.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <Wallet className="w-6 h-6 text-[#a69488]" />
                    )}
                    <div className="text-sm font-bold text-[#faf5f0]">{opt.name}</div>
                  </div>

                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                  ) : isCurrent ? (
                    <Check className="w-4 h-4 text-orange-400" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          /* NO EXTENSIONS DETECTED NOTICE */
          <div className="mb-4 p-3.5 bg-[#140d09] border border-[#331f15] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>No Solana wallet extensions detected</span>
            </div>
            <p className="text-[11.5px] text-[#a69488] leading-relaxed">
              We couldn't detect Phantom, Solflare, or Backpack in this browser.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-[#6e5e54]">
              <span>Need an extension?</span>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Get Phantom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noreferrer"
                className="text-orange-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Get Solflare</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* 2. Devnet Test Wallet (Burner) Section */}
        {burnerOption && (
          <div className="space-y-2 mb-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a69488] block">
              {extensionWallets.length === 0 ? "PLAY INSTANTLY WITHOUT EXTENSIONS" : "OR TEST WITHOUT EXTENSIONS"}
            </span>

            <button
              type="button"
              onClick={() => handleConnect(burnerOption)}
              disabled={!!loading}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer bg-[#22140c]/80 border-orange-500/40 hover:bg-[#2b180e] hover:border-orange-500 ${
                activeWallet?.isBurner ? "ring-1 ring-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.25)]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-orange-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-[#faf5f0] flex items-center gap-1.5">
                    <span>Devnet Test Wallet (Burner Keypair)</span>
                    <span className="text-[9px] bg-gradient-to-r from-orange-500 to-amber-500 text-orange-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                      Fast
                    </span>
                  </div>
                  <div className="text-[11px] text-[#a69488]">
                    Generates a keypair in browser storage with free 1-click SOL
                  </div>
                </div>
              </div>

              {loading === burnerOption.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              ) : activeWallet?.isBurner ? (
                <Check className="w-4 h-4 text-orange-400" />
              ) : null}
            </button>
          </div>
        )}

        {/* Reset burner option if already using burner */}
        {activeWallet?.isBurner && (
          <div className="border-t border-[#331f15] pt-3 text-center">
            <button
              type="button"
              onClick={handleFreshBurner}
              className="inline-flex items-center gap-1.5 text-xs text-[#a69488] hover:text-orange-400 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Generate Fresh Test Keypair</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
