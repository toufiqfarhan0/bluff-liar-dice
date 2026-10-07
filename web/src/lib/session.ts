/**
 * Throwaway Session Keys for rounds.
 *
 * Eliminates wallet signature prompts during 15-30s round gameplay.
 */

import { Keypair } from "@solana/web3.js";
import { secureStore } from "./storage";

const key = (room: string) => `herd.session.${room}`;

export async function sessionFor(room: string): Promise<Keypair> {
  const saved = await secureStore.get(key(room));
  if (saved) {
    try {
      return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(saved)));
    } catch {
      // Corrupt or older format
    }
  }

  const fresh = Keypair.generate();
  await secureStore.set(key(room), JSON.stringify(Array.from(fresh.secretKey)));
  return fresh;
}

export async function forgetSession(room: string): Promise<void> {
  await secureStore.del(key(room));
}
