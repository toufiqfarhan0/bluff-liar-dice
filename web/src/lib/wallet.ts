/**
 * Browser Wallet Adapter for Solana Devnet.
 *
 * Supports:
 * 1. Standard Browser Extensions (Phantom, Solflare, Backpack) via Wallet Standard & Injected window.solana
 * 2. Instant Devnet Burner Wallet (generate or import local keypair with 1-click Airdrop)
 */

import "./polyfills";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { getWallets } from "@wallet-standard/app";
import type { Wallet as StandardWallet, WalletAccount as StandardWalletAccount } from "@wallet-standard/base";
import { secureStore } from "./storage";
import { BASE_RPC } from "./chain";

export interface ConnectedWallet {
  publicKey: PublicKey;
  address: string;
  label: string;
  icon?: string;
  isBurner?: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  disconnect: () => Promise<void>;
}

export interface WalletOption {
  id: string;
  name: string;
  icon?: string;
  connect: () => Promise<ConnectedWallet>;
}

const WALLET_SAVED_KEY = "bluff.active_wallet";
const BURNER_KEYPAIR_KEY = "bluff.burner_keypair";

export function explainWalletError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/user rejected|cancelled|cancel/i.test(raw)) {
    return "The wallet approval was dismissed. Please approve the transaction.";
  }
  if (/insufficient (lamports|funds)/i.test(raw)) {
    return "Your wallet doesn't have enough Devnet SOL. Use the Airdrop button to get free test SOL.";
  }
  if (/timeout|timed out/i.test(raw)) {
    return "The wallet did not respond in time. Please try again.";
  }
  if (/not.*(found|installed)|no.*wallet/i.test(raw)) {
    return "No wallet extension detected. You can use the Devnet Test Wallet option to test instantly.";
  }
  return raw;
}

/** Get all available wallet options in the browser */
export function getAvailableWallets(): WalletOption[] {
  const options: WalletOption[] = [];

  // 1. Wallet Standard adapters
  try {
    const standardWallets = getWallets().get();
    for (const w of standardWallets) {
      if ("standard:connect" in w.features && "solana:signTransaction" in w.features) {
        options.push({
          id: w.name,
          name: w.name,
          icon: w.icon,
          connect: async () => connectStandardWallet(w),
        });
      }
    }
  } catch {
    // Wallet standard registry error
  }

  // 2. Direct Window Injected Wallets if not already registered via Wallet Standard
  if (typeof window !== "undefined") {
    const solana = (window as any).solana;
    if (solana && !options.some((o) => o.name.toLowerCase().includes("phantom"))) {
      options.push({
        id: "phantom-injected",
        name: "Phantom",
        icon: "https://phantom.app/favicon.ico",
        connect: async () => connectInjected(solana, "Phantom"),
      });
    }

    const solflare = (window as any).solflare;
    if (solflare && !options.some((o) => o.name.toLowerCase().includes("solflare"))) {
      options.push({
        id: "solflare-injected",
        name: "Solflare",
        icon: "https://solflare.com/favicon.ico",
        connect: async () => connectInjected(solflare, "Solflare"),
      });
    }
  }

  // 3. Built-in Devnet Test / Burner Wallet (Always Available!)
  options.push({
    id: "devnet-burner",
    name: "Devnet Test Wallet (Burner Keypair)",
    connect: async () => getOrCreateBurnerWallet(),
  });

  return options;
}

/** Connect a Wallet Standard extension */
async function connectStandardWallet(wallet: StandardWallet): Promise<ConnectedWallet> {
  const connectFeature = wallet.features["standard:connect"] as any;
  const { accounts } = await connectFeature.connect();
  const account = (accounts as readonly StandardWalletAccount[]).find((a) =>
    a.chains?.some((c) => c.startsWith("solana:")) || true
  );

  if (!account) throw new Error("No Solana account returned by wallet");

  const pubkey = new PublicKey(account.publicKey);
  const signFeature = wallet.features["solana:signTransaction"] as any;

  const connected: ConnectedWallet = {
    publicKey: pubkey,
    address: pubkey.toBase58(),
    label: wallet.name,
    icon: wallet.icon,
    isBurner: false,
    async signTransaction(tx: Transaction) {
      const [result] = await signFeature.signTransaction({
        account,
        chain: "solana:devnet",
        transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }),
      });
      return Transaction.from(result.signedTransaction);
    },
    async disconnect() {
      await secureStore.del(WALLET_SAVED_KEY);
    },
  };

  await secureStore.set(WALLET_SAVED_KEY, JSON.stringify({ type: "standard", name: wallet.name }));
  return connected;
}

/** Connect an injected provider (e.g. window.solana) */
async function connectInjected(provider: any, label: string): Promise<ConnectedWallet> {
  const res = await provider.connect();
  const pubkey = new PublicKey(res.publicKey ?? provider.publicKey);

  const connected: ConnectedWallet = {
    publicKey: pubkey,
    address: pubkey.toBase58(),
    label,
    isBurner: false,
    async signTransaction(tx: Transaction) {
      return provider.signTransaction(tx);
    },
    async disconnect() {
      try {
        await provider.disconnect?.();
      } catch {}
      await secureStore.del(WALLET_SAVED_KEY);
    },
  };

  await secureStore.set(WALLET_SAVED_KEY, JSON.stringify({ type: "injected", label }));
  return connected;
}

/** Get or create local Burner Keypair wallet */
export async function getOrCreateBurnerWallet(importedKey?: Keypair): Promise<ConnectedWallet> {
  let kp: Keypair;

  if (importedKey) {
    kp = importedKey;
    await secureStore.set(BURNER_KEYPAIR_KEY, JSON.stringify(Array.from(kp.secretKey)));
  } else {
    const saved = await secureStore.get(BURNER_KEYPAIR_KEY);
    if (saved) {
      try {
        kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(saved)));
      } catch {
        kp = Keypair.generate();
        await secureStore.set(BURNER_KEYPAIR_KEY, JSON.stringify(Array.from(kp.secretKey)));
      }
    } else {
      kp = Keypair.generate();
      await secureStore.set(BURNER_KEYPAIR_KEY, JSON.stringify(Array.from(kp.secretKey)));
    }
  }

  const pubkey = kp.publicKey;

  const connected: ConnectedWallet = {
    publicKey: pubkey,
    address: pubkey.toBase58(),
    label: "Devnet Test Wallet",
    isBurner: true,
    async signTransaction(tx: Transaction) {
      tx.partialSign(kp);
      return tx;
    },
    async disconnect() {
      await secureStore.del(WALLET_SAVED_KEY);
      await secureStore.del(BURNER_KEYPAIR_KEY);
    },
  };

  await secureStore.set(WALLET_SAVED_KEY, JSON.stringify({ type: "burner" }));
  return connected;
}

/** Reset burner keypair and generate a new one */
export async function createFreshBurnerWallet(): Promise<ConnectedWallet> {
  await secureStore.del(BURNER_KEYPAIR_KEY);
  return getOrCreateBurnerWallet();
}

/** Try to restore previously active wallet (only browser extensions, never auto-connect burner) */
export async function restoreSavedWallet(): Promise<ConnectedWallet | null> {
  const saved = await secureStore.get(WALLET_SAVED_KEY);
  if (!saved) return null;

  try {
    const info = JSON.parse(saved);
    // Do not auto-create or auto-connect devnet test burner wallet on initial visit
    if (info.type === "burner") {
      await secureStore.del(WALLET_SAVED_KEY);
      return null;
    }
    // For browser extensions, check if standard wallet exists
    const available = getAvailableWallets();
    const match = available.find((o) => o.name === info.name || o.name === info.label);
    if (match) {
      return match.connect();
    }
  } catch {
    await secureStore.del(WALLET_SAVED_KEY);
  }

  return null;
}
