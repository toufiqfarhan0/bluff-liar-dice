import React from "react";
import { ArrowRight, ShieldCheck, Lock, Eye, Dices } from "lucide-react";

export function RulesScreen({
  onGoLobby,
}: {
  onGoLobby: () => void;
}) {
  return (
    <div className="w-full flex-1">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 text-left animate-in fade-in duration-200">
        {/* Title matching FHE Liar's Dice */}
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 font-['Archivo']">
            Rules & privacy
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-['IBM_Plex_Sans']">
            Casual mode. No wagers, no timers, no penalties — just the bluff.
          </p>
        </div>

        {/* Section 1: How a table plays */}
        <div className="panel rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 font-['Archivo'] flex items-center gap-2">
            <span>How a table plays</span>
          </h2>
          <ol className="list-decimal list-inside space-y-2.5 text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans']">
            <li>2 or more players join a table and each gets 5 dice.</li>
            <li>The host starts the game; the contract rolls everyone's dice as encrypted values inside MagicBlock TEE.</li>
            <li>Players take turns making public bids: a quantity and a face, e.g. "six 4s".</li>
            <li>Each new bid must raise the quantity, or match the quantity with a higher face.</li>
            <li>Instead of bidding, the current player can challenge the last bid ("Call Bluff!").</li>
            <li>
              A challenge counts every die across every active player's hand that matches the bid's face — a face of 1 is always wild and counts toward any bid that isn't itself about 1s.
            </li>
            <li>
              If the true count meets or beats the bid, the bid was good and the challenger is penalized. Otherwise the bidder was lying and loses a die.
            </li>
            <li>
              Every hand from that round is revealed so the table can see the proof, then the survivors roll fresh hands for a new round.
            </li>
            <li>Last player standing wins the table.</li>
          </ol>
        </div>

        {/* Section 2: What MagicBlock TEE hides */}
        <div className="panel rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 font-['Archivo'] flex items-center gap-2">
            <span>What MagicBlock TEE hides</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans']">
            Dice are generated and stored as encrypted values by the smart contract inside MagicBlock Private TEE (Intel SGX) enclaves using on-chain verifiable randomness (VRF). No plaintext die value is ever written to storage or emitted in an event while a round is active — not to other players, not to an indexer, and not to the contract's own operator. Only the owning wallet can unseal its own hand off-chain, by signing with an ephemeral session key.
          </p>

          <div className="rounded-lg bg-slate-900 border border-white/5 p-3.5 font-mono text-xs text-orange-400">
            MagicBlock.rollSecretDice(room_pda, player, vrf_seed)
          </div>

          <p className="text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans']">
            When a challenge happens, the contract verifies the count inside the secure enclave, and lifts all cups simultaneously to show the cryptographic proof.
          </p>
        </div>

        {/* Section 3: What stays public */}
        <div className="panel rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 font-['Archivo'] flex items-center gap-2">
            <span>What stays public</span>
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans']">
            <li>Table membership, host, and turn order</li>
            <li>Every bid — its quantity, face, and bidder</li>
            <li>Who challenged whom, and the resulting good/lie verdict</li>
            <li>Who lost a die, and each round's hands once revealed after that round's challenge</li>
          </ul>
        </div>

        {/* Section 4: Known tradeoffs & Actions */}
        <div className="panel rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 font-['Archivo']">
            Known tradeoffs (MVP)
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-['IBM_Plex_Sans']">
            Die faces are derived from verifiable randomness inside the enclave. Throwaway session keys submit bids and calls instantly with zero transaction popups and sub-20ms latency.
          </p>

          <div className="flex flex-wrap gap-3 pt-3">
            <button
              type="button"
              onClick={onGoLobby}
              className="rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer"
            >
              Back to tables
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
