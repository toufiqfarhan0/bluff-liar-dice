import React, { useEffect, useState, useSyncExternalStore } from "react";
import { Activity as ActivityIcon, ChevronDown, ExternalLink } from "lucide-react";
import { Connection, PublicKey } from "@solana/web3.js";
import { BASE_RPC } from "../lib/chain";
import {
  activitySnapshot,
  subscribeActivity,
  recordActivity,
  logLabel,
  activityLink,
  short,
  type Activity,
  type Network,
} from "../lib/activity";

const PROGRAM_ID = "DtPSuiwYsauE5PwRWZfYpu2ZeCxZ7iunSZhXvHFWWfx7";

function getActivityLabelColor(row: Activity): string {
  if (row.color) return row.color;
  if (row.status === "failed") return "text-[#f2603c]";

  const lower = row.label.toLowerCase();
  if (
    lower.includes("lost a die") ||
    lower.includes("bluff") ||
    lower.includes("bidder loses") ||
    lower.includes("challenger loses")
  ) {
    return "text-[#f2603c]";
  }

  if (lower.includes("fresh hands rolled") || lower.includes("round started")) {
    return "text-[#38bdf8]";
  }

  if (row.status === "confirmed") {
    return "text-[#5fd39a]";
  }
  return "text-[#FBD53D]";
}

export function NetworkActivity({
  roomAddress,
  round = 1,
  erUrl = "https://devnet-as.magicblock.app",
  isDelegated = false,
}: {
  roomAddress?: string;
  round?: number;
  erUrl?: string;
  isDelegated?: boolean;
}) {
  const rows = useSyncExternalStore(subscribeActivity, activitySnapshot);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [owner, setOwner] = useState<string>("");

  // Live on-chain & ER transaction stream via onLogs (identical to UltraPong)
  useEffect(() => {
    if (!open || !roomAddress) return;
    let closed = false;
    const listeners: { conn: Connection; id: number }[] = [];
    const baseConn = new Connection(BASE_RPC, "confirmed");
    const erConn = new Connection(erUrl, "confirmed");

    const watch = (
      network: Network,
      address: string,
      conn: Connection,
    ) => {
      try {
        const key = new PublicKey(address);
        const id = conn.onLogs(
          key,
          (result, context) => {
            if (closed) return;
            recordActivity({
              network,
              signature: result.signature,
              label: logLabel(result.logs),
              status: result.err ? "failed" : "confirmed",
              detail: result.err ? JSON.stringify(result.err) : undefined,
              time: Date.now(),
              slot: context.slot,
            });
          },
          "confirmed",
        );
        listeners.push({ conn, id });
      } catch {
        // Fallback
      }
    };

    watch("Solana Devnet", roomAddress, baseConn);
    if (isDelegated) {
      watch("MagicBlock ER", roomAddress, erConn);
    }

    return () => {
      closed = true;
      listeners.forEach(({ conn, id }) => {
        try {
          conn.removeOnLogsListener(id);
        } catch {}
      });
    };
  }, [open, roomAddress, erUrl, isDelegated]);

  useEffect(() => {
    if (!roomAddress) return;
    // Inspect room account owner on Solana Devnet
    let active = true;
    const fetchOwner = async () => {
      try {
        const res = await fetch(BASE_RPC, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "getAccountInfo",
            params: [roomAddress, { encoding: "base64" }],
          }),
        });
        const json = await res.json();
        if (active && json.result?.value) {
          setOwner(json.result.value.owner);
        }
      } catch {
        // Fallback
      }
    };

    fetchOwner();
    const interval = setInterval(fetchOwner, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [roomAddress]);

  const filteredRows = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "Solana Devnet") return r.network === "Solana Devnet";
    if (filter === "MagicBlock ER") return r.network === "MagicBlock ER";
    return true;
  });

  return (
    <details
      className="group w-full rounded-3xl border border-[#26311e] bg-[#0e130c]/90 backdrop-blur-md overflow-hidden shadow-2xl transition-all"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="flex items-center gap-3 px-5 py-4 text-xs font-bold text-[#b4c3aa] hover:text-[#f1f4ec] cursor-pointer select-none list-none transition-colors border-b border-transparent group-open:border-[#222c1b]">
        <ActivityIcon className="w-4 h-4 text-[#5db8f0] shrink-0" />
        <span className="tracking-wide">Live table activity</span>
        <span className="ml-auto font-mono text-[9px] font-black text-[#5fd39a] bg-[#1a2e1d] px-2.5 py-0.5 rounded-full border border-[#5fd39a]/30 uppercase tracking-widest">
          {roomAddress ? "LIVE" : "HOW IT WORKS"}
        </span>
        <ChevronDown className="w-4 h-4 text-[#75846b] transition-transform duration-200 group-open:rotate-180 shrink-0" />
      </summary>

      <div className="p-5 sm:p-6 space-y-4 text-xs text-[#98a08e]">
        <div className="space-y-2 leading-relaxed">
          <p>
            <strong className="text-[#f1f4ec]">Solana holds the pot.</strong> Entry deposits and final settlement happen on Devnet.
          </p>
          <p>
            <strong className="text-[#f1f4ec]">MagicBlock runs the match.</strong> The game account moves to its Ephemeral Rollup (Private TEE), where encrypted dice rolls, signed bids, and player challenges update in sub-second state. Your browser verifies proofs and interacts securely with the table.
          </p>
          <p>
            <strong className="text-[#f1f4ec]">The result comes back to Solana.</strong> Once showdown ends and a champion remains, the pot is committed and paid out from the Solana Vault PDA. Session keys sign game moves; they cannot withdraw your wallet's stake.
          </p>
        </div>

        {/* Facts Banner */}
        <div className="flex flex-wrap items-center gap-4 py-2 border-y border-[#1f2818] font-mono text-[11px] text-[#86967c]">
          <span>
            Authoritative round <strong className="text-[#FBD53D] font-bold">{round}</strong>
          </span>
          <span>•</span>
          <span>
            Base account{" "}
            <strong
              className={`font-bold ${
                owner === PROGRAM_ID
                  ? "text-[#5fd39a]"
                  : isDelegated
                  ? "text-[#5db8f0]"
                  : "text-[#86967c]"
              }`}
            >
              {owner ? (owner === PROGRAM_ID ? "On Solana" : isDelegated ? "Delegated to TEE" : "On Solana") : "Checking…"}
            </strong>
          </span>
        </div>

        {/* Endpoints & Addresses */}
        <div className="grid gap-2 p-3.5 bg-[#080b06] border border-[#1b2314] rounded-2xl font-mono text-[10px]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-[#647359] sm:w-28 shrink-0">Solana RPC</span>
            <code className="text-[#a4b59b] truncate">{BASE_RPC}</code>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <span className="text-[#647359] sm:w-28 shrink-0">ER RPC</span>
            <code className="text-[#a4b59b] truncate">{erUrl}</code>
          </div>
          {roomAddress && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-[#647359] sm:w-28 shrink-0">Room account</span>
              <code className="text-[#FBD53D] truncate">{roomAddress}</code>
            </div>
          )}
          {owner && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <span className="text-[#647359] sm:w-28 shrink-0">Base owner</span>
              <code className="text-[#a4b59b] truncate">{owner}</code>
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-semibold text-[#8b9880]">
            <span>Show</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#141b10] border border-[#27331f] rounded-xl px-3 py-1.5 text-xs text-[#f1f4ec] focus:outline-none focus:border-[#FBD53D] cursor-pointer"
            >
              <option value="all">All transactions</option>
              <option value="Solana Devnet">Solana only</option>
              <option value="MagicBlock ER">MagicBlock only</option>
            </select>
          </label>
          <span className="text-[11px] text-[#6b7362] font-mono">
            {filteredRows.length} observed
          </span>
        </div>

        {/* Transaction Rows */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredRows.map((row) => {
            const link = activityLink(row);
            const content = (
              <>
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`font-bold text-xs tracking-wide ${getActivityLabelColor(row)}`}
                  >
                    {row.label}
                  </span>
                  <span className="text-[10px] text-[#6b7960] font-mono">
                    {row.network} · {row.status}
                    {row.slot ? ` · slot ${row.slot}` : ""}
                  </span>
                  {row.detail && (
                    <span className="text-[10px] text-[#f2603c] font-mono">{row.detail}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#7d8e72] group-hover/row:text-[#f1f4ec] shrink-0 ml-3">
                  {link ? (
                    <>
                      <code>{short(row.signature, 5)}</code>
                      <ExternalLink className="w-3 h-3 text-[#5d6b53] group-hover/row:text-[#FBD53D]" />
                    </>
                  ) : (
                    <span className="text-[10px] bg-[#231b38] text-[#b9a9ff] font-bold px-2.5 py-1 rounded-full border border-[#b9a9ff]/30 uppercase tracking-wider">
                      Private TEE
                    </span>
                  )}
                </div>
              </>
            );

            return link ? (
              <a
                key={row.network + row.signature}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-2xl border border-[#1d2617] bg-[#11170d] hover:bg-[#172012] hover:border-[#324027] transition-all group/row"
              >
                {content}
              </a>
            ) : (
              <div
                key={row.network + row.signature}
                title="Executed inside MagicBlock hardware-isolated TEE enclave. Kept confidential from public mempool until settlement."
                className="flex items-center justify-between p-3 rounded-2xl border border-[#1d2617] bg-[#11170d] transition-all group/row cursor-default"
              >
                {content}
              </div>
            );
          })}

          {!filteredRows.length && (
            <p className="text-center py-6 text-[#6b7362] text-xs">
              Create or join a room to see real transaction signatures here. Keep this panel open to watch everyone's encrypted bids and showdown proofs.
            </p>
          )}
        </div>
      </div>
    </details>
  );
}
