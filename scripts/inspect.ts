import { BASE_RPC, accountData } from "./lib/chain";
import { Bluff, Phase } from "./lib/bluff";
import idl from "./idl.json";
const Bluff = new Bluff(idl);
const STAKE = 10_000_000n;
const q = Bluff.decodeQueue((await accountData(BASE_RPC, Bluff.queue(STAKE)))!);
console.log(`queue: ${q.count} waiting, awaitingDeal=${q.awaitingDeal}, dealingInto=${q.dealingInto}`);
for (let i = 0n; i < 10n; i++) {
  const d = await accountData(BASE_RPC, Bluff.publicRoom(STAKE, i));
  if (!d) { console.log(`room ${i}: (not built)`); continue; }
  const r = Bluff.decodeRoom(d);
  console.log(`room ${i}: phase=${Phase[r.phase]} seats=${r.seats.length} round=${r.round} dealt=${r.dealt}`);
}
