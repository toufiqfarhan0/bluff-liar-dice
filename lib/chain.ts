/**
 * Talking to Solana Devnet and to the MagicBlock Ephemeral Rollup from the browser.
 */

import "./polyfills";
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import nacl from "tweetnacl";

export const BASE_RPC = "https://rpc.magicblock.app/devnet";
export const ROUTER_RPC = "https://devnet-router.magicblock.app/";

/** MagicBlock's devnet TEE validator. A plain rollup is fast but readable. */
export const TEE_VALIDATOR = new PublicKey("MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo");

export const connection = new Connection(BASE_RPC, "confirmed");

export async function rpc(url: string, method: string, params: unknown): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = await response.json();
  if (body.error) throw new Error(body.error.message ?? JSON.stringify(body.error));
  return body.result;
}

export interface Delegation {
  isDelegated: boolean;
  fqdn?: string;
}

export async function delegationOf(account: PublicKey): Promise<Delegation> {
  const r = await rpc(ROUTER_RPC, "getDelegationStatus", [account.toBase58()]);
  return { isDelegated: !!r?.isDelegated, fqdn: r?.fqdn };
}

function withToken(url: string, token?: string): string {
  const base = url.replace(/\/$/, "");
  return token ? `${base}/?token=${encodeURIComponent(token)}` : base;
}

/** Raw account data, or null when the endpoint refuses to show it. */
export async function accountData(
  url: string,
  key: PublicKey,
  token?: string,
): Promise<Uint8Array | null> {
  const value = await rpc(withToken(url, token), "getAccountInfo", [
    key.toBase58(),
    { encoding: "base64", commitment: "confirmed" },
  ]);
  if (!value?.value) return null;
  return fromBase64(value.value.data[0]);
}

export async function lamportsOf(url: string, key: PublicKey): Promise<number> {
  const value = await rpc(url, "getAccountInfo", [
    key.toBase58(),
    { encoding: "base64", commitment: "confirmed" },
  ]);
  return value?.value?.lamports ?? 0;
}

/**
 * Prove to the rollup which key is asking.
 * Lets the player read the room while a round is running.
 */
export async function authenticate(fqdn: string, signer: Keypair): Promise<string> {
  const base = fqdn.replace(/\/$/, "");
  const pubkey = signer.publicKey.toBase58();

  const chRes = await fetch(`${base}/auth/challenge?pubkey=${pubkey}`);
  const ch = await chRes.json();
  if (typeof ch.challenge !== "string") throw new Error("the rollup issued no challenge");

  const signature = nacl.sign.detached(new TextEncoder().encode(ch.challenge), signer.secretKey);
  const loginRes = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ pubkey, challenge: ch.challenge, signature: base58(signature) }),
  });
  const login = await loginRes.json();

  const token = login.token ?? login.access_token;
  if (!token) throw new Error("the rollup returned no token");
  return token;
}

export async function latestBlockhash(url: string, token?: string): Promise<string> {
  const r = await rpc(withToken(url, token), "getLatestBlockhash", [{ commitment: "confirmed" }]);
  return r.value.blockhash;
}

/** Submit an already-signed transaction. `url` decides which chain. */
export async function submit(
  url: string,
  signed: Uint8Array,
  token?: string,
): Promise<string> {
  let lastErr: any;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await rpc(withToken(url, token), "sendTransaction", [
        toBase64(signed),
        { encoding: "base64", skipPreflight: true, preflightCommitment: "confirmed" },
      ]);
    } catch (e: any) {
      lastErr = e;
      const msg = e?.message || String(e);
      if (attempt < 3 && /transient|simulation|blockhash|rate|timeout/i.test(msg)) {
        await sleep(1000 * attempt);
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

/**
 * Sign locally and submit using a session keypair.
 */
export async function sendLocal(
  url: string,
  signers: Keypair[],
  instructions: TransactionInstruction[],
  token?: string,
): Promise<string> {
  const tx = new Transaction({
    feePayer: signers[0].publicKey,
    recentBlockhash: await latestBlockhash(url, token),
  });
  instructions.forEach((i) => tx.add(i));
  tx.sign(...signers);
  return submit(url, tx.serialize(), token);
}

/** Request devnet SOL airdrop */
export async function requestDevnetAirdrop(to: PublicKey, sol = 1): Promise<string> {
  const lamports = Math.floor(sol * 1e9);
  // Try MagicBlock RPC first, fallback to standard devnet
  try {
    const sig = await connection.requestAirdrop(to, lamports);
    await connection.confirmTransaction(sig, "confirmed");
    return sig;
  } catch {
    const fallbackConn = new Connection("https://api.devnet.solana.com", "confirmed");
    const sig = await fallbackConn.requestAirdrop(to, lamports);
    await fallbackConn.confirmTransaction(sig, "confirmed");
    return sig;
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ codecs */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) n = n * 256n + BigInt(b);
  let out = "";
  while (n > 0n) {
    out = B58[Number(n % 58n)] + out;
    n /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = "1" + out;
  }
  return out;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

export function toBase64(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? "=" : B64[((b & 15) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? "=" : B64[c & 63];
  }
  return out;
}

export function fromBase64(input: string): Uint8Array {
  const clean = input.replace(/=+$/, "");
  const out = new Uint8Array((clean.length * 3) >> 2);
  let bits = 0;
  let acc = 0;
  let o = 0;
  for (const ch of clean) {
    const v = B64.indexOf(ch);
    if (v < 0) throw new Error("not base64");
    acc = (acc << 6) | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = (acc >> bits) & 0xff;
    }
  }
  return out.subarray(0, o);
}
