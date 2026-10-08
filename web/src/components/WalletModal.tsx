import React, { useState } from "react";
import {
  ConnectedWallet,
  WalletOption,
  createFreshBurnerWallet,
  getAvailableWallets,
  getOrCreateBurnerWallet,
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
        className="relative w-full max-w-md bg-[#0c0f0b] border border-[#2a3122] rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6b7362] hover:text-[#f1f4ec] hover:bg-[#1f241a] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1.5">
          <Wallet className="w-6 h-6 text-[#FBD53D]" />
          <h2 className="text-2xl font-black tracking-wide text-[#f1f4ec]">
            Choose Wallet
          </h2>
        </div>
        <p className="text-xs text-[#98a08e] mb-4">
          Connect your Solana wallet or use the built-in Devnet burner keypair to test.
        </p>

        {error && (
          <div className="p-3 bg-[#f2603c]/10 border border-[#f2603c]/30 rounded-xl text-xs text-[#f2603c] font-medium mb-4">
            {error}
          </div>
        )}

        {/* Active wallet info & airdrop */}
        {activeWallet && (
          <div className="mb-5 p-3.5 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#6b7362]">
              <span>ACTIVE WALLET</span>
              <span className="text-[#FBD53D] font-bold">CONNECTED ON DEVNET</span>
            </div>
            <div className="font-mono text-xs text-[#f1f4ec] truncate bg-[#0c0f0b] p-2 rounded-lg border border-[#2a3122]/60 select-all">
              {activeWallet.address}
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <a
                href={`https://explorer.solana.com/address/${activeWallet.address}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="text-[#FBD53D] hover:underline font-semibold inline-flex items-center gap-1"
              >
                <span>View on Solana Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-[10px] text-[#6b7362]">Real On-Chain Devnet</span>
            </div>

            <button
              type="button"
              onClick={handleAirdrop}
              disabled={airdropping}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FBD53D]/10 border border-[#FBD53D]/30 text-[#FBD53D] text-xs font-bold hover:bg-[#FBD53D]/20 transition-all cursor-pointer disabled:opacity-50"
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
              <div className="p-2.5 bg-[#FBD53D]/10 border border-[#FBD53D]/30 rounded-xl text-xs space-y-1">
                <div className="text-[#FBD53D] font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>1 Devnet SOL Airdropped!</span>
                </div>
                <a
                  href={`https://explorer.solana.com/tx/${airdropSig}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#f1f4ec] hover:underline flex items-center gap-1 font-mono truncate"
                >
                  <span>TX: {airdropSig.slice(0, 16)}…</span>
                  <ExternalLink className="w-3 h-3 shrink-0 text-[#FBD53D]" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* 1. Installed Browser Extensions Section */}
        {extensionWallets.length > 0 ? (
          <div className="space-y-2 mb-4">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
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
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer bg-[#171b14] border-[#2a3122] hover:bg-[#1f241a] hover:border-[#3f4a33] ${
                    isCurrent ? "ring-1 ring-[#FBD53D]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon ? (
                      <img src={opt.icon} alt={opt.name} className="w-6 h-6 rounded-full" />
                    ) : (
                      <Wallet className="w-6 h-6 text-[#98a08e]" />
                    )}
                    <div className="text-sm font-bold text-[#f1f4ec]">{opt.name}</div>
                  </div>

                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#FBD53D]" />
                  ) : isCurrent ? (
                    <Check className="w-4 h-4 text-[#FBD53D]" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          /* NO EXTENSIONS DETECTED NOTICE */
          <div className="mb-4 p-3.5 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#e8a765]">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#e8a765]" />
              <span>No Solana wallet extensions detected</span>
            </div>
            <p className="text-[11.5px] text-[#98a08e] leading-relaxed">
              We couldn't detect Phantom, Solflare, or Backpack in this browser.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] text-[#6b7362]">
              <span>Need an extension?</span>
              <a
                href="https://phantom.app/"
                target="_blank"
                rel="noreferrer"
                className="text-[#FBD53D] hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>Get Phantom</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span>·</span>
              <a
                href="https://solflare.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[#FBD53D] hover:underline inline-flex items-center gap-1 font-semibold"
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
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
              {extensionWallets.length === 0 ? "PLAY INSTANTLY WITHOUT EXTENSIONS" : "OR TEST WITHOUT EXTENSIONS"}
            </span>

            <button
              type="button"
              onClick={() => handleConnect(burnerOption)}
              disabled={!!loading}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer bg-[#201d10]/60 border-[#FBD53D]/40 hover:bg-[#201d10] hover:border-[#FBD53D] ${
                activeWallet?.isBurner ? "ring-1 ring-[#FBD53D]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <KeyRound className="w-6 h-6 text-[#FBD53D] shrink-0" />
                <div>
                  <div className="text-sm font-bold text-[#f1f4ec] flex items-center gap-1.5">
                    <span>Devnet Test Wallet (Burner Keypair)</span>
                    <span className="text-[9px] bg-[#FBD53D] text-[#141004] font-black px-1.5 py-0.2 rounded-full uppercase">
                      Fast
                    </span>
                  </div>
                  <div className="text-[11px] text-[#98a08e]">
                    Generates a keypair in browser storage with free 1-click SOL
                  </div>
                </div>
              </div>

              {loading === burnerOption.id ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FBD53D]" />
              ) : activeWallet?.isBurner ? (
                <Check className="w-4 h-4 text-[#FBD53D]" />
              ) : null}
            </button>
          </div>
        )}

        {/* Reset burner option if already using burner */}
        {activeWallet?.isBurner && (
          <div className="border-t border-[#2a3122] pt-3 text-center">
            <button
              type="button"
              onClick={handleFreshBurner}
              className="inline-flex items-center gap-1.5 text-xs text-[#6b7362] hover:text-[#FBD53D] transition-colors cursor-pointer"
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
