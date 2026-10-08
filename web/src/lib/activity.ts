export type Network = "Solana Devnet" | "MagicBlock ER";

export type ActivityStatus = "submitted" | "confirmed" | "failed";

export interface Activity {
  signature: string;
  network: Network;
  label: string;
  status: ActivityStatus;
  time: number;
  slot?: number;
  detail?: string;
  color?: string;
}

let rows: Activity[] = [];
const subscribers = new Set<() => void>();
let queued = false;

export function recordActivity(row: Activity) {
  const existing = rows.find(
    (r) => r.signature === row.signature && r.network === row.network,
  );

  // A late submission acknowledgement must not downgrade an RPC confirmation
  if (existing && existing.status !== "submitted" && row.status === "submitted") {
    return;
  }

  rows = [
    { ...existing, ...row, time: existing?.time ?? row.time },
    ...rows.filter(
      (r) => r.signature !== row.signature || r.network !== row.network,
    ),
  ].slice(0, 200);

  if (!queued) {
    queued = true;
    setTimeout(() => {
      queued = false;
      subscribers.forEach((fn) => fn());
    }, 100);
  }
}

export const activitySnapshot = () => rows;

export function subscribeActivity(fn: () => void) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

export function activityLink(row: Activity): string | null {
  if (row.network === "Solana Devnet") {
    return "https://explorer.solana.com/tx/" + row.signature + "?cluster=devnet";
  }
  // MagicBlock Private TEE transactions run inside hardware enclaves and are
  // intentionally confidential (not indexed by public L1 explorer until settlement).
  return null;
}

export function short(sig: string, chars = 4) {
  if (!sig || sig.length <= chars * 2) return sig;
  return `${sig.slice(0, chars)}...${sig.slice(-chars)}`;
}

export const actionLabel = (name: string) =>
  ({
    create_room: "Initialize room & Deposit pot",
    open_room: "Deposit pot & Initialize room",
    take_seat: "Deposit stake & Take seat",
    join_room: "Deposit stake & Take seat",
    lock_room: "Lock room on Solana Devnet",
    delegate_room: "Delegate room to MagicBlock TEE",
    seal_room: "Seal secret dice in Private TEE",
    submit_answer: "Commit secret dice roll",
    finish_room: "Undelegate room from MagicBlock TEE",
    settle: "Settle pot & Payout winners",
    settle_pot: "Settle pot & Payout winners",
    leave_room: "Leave room & Refund stake",
  }[name] ?? name);

export function logLabel(logs: string[]): string {
  const name = logs
    .find((l) => l.includes("Instruction: "))
    ?.split("Instruction: ")[1];
  return name
    ? actionLabel(
        name.replace(/[A-Z]/g, (v, i) => (i ? "_" : "") + v.toLowerCase()),
      )
    : "Network transaction";
}
