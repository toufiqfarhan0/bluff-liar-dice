import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  BASE_RPC,
  TEE_VALIDATOR,
  accountData,
  authenticate,
  delegationOf,
  lamportsOf,
  latestBlockhash,
  requestDevnetAirdrop,
  sendLocal,
  sleep,
  submit,
} from "./lib/chain";
import { Ending, Bluff, Phase, type RoomState } from "./lib/bluff";
import { explainChainError } from "./lib/errors";
import { sessionFor } from "./lib/session";
import { botMakeDecision, botThinkingDelay, botsFor, type Bot } from "./lib/bots";
import {
  Bid,
  DieFace,
  INITIAL_DICE_COUNT,
  PlayerDiceState,
  ShowdownResult,
  faceNamePlural,
  resolveBluff,
  rollDice,
} from "./lib/dice";
import { shortKey } from "./components/Avatar";
import { Header, NavTab } from "./components/Header";
import { HomeScreen } from "./components/HomeScreen";
import { RulesScreen } from "./components/RulesScreen";
import { OpeningScreen } from "./components/OpeningScreen";
import { JoiningScreen } from "./components/JoiningScreen";
import { WaitingScreen } from "./components/WaitingScreen";
import { PlayingScreen } from "./components/PlayingScreen";
import { ShowdownScreen } from "./components/ShowdownScreen";
import { FinishedScreen } from "./components/FinishedScreen";
import { FairnessModal } from "./components/FairnessModal";
import { WalletModal } from "./components/WalletModal";
import { ToastContainer, type ToastMessage } from "./components/Toast";
import {
  ConnectedWallet,
  explainWalletError,
  restoreSavedWallet,
} from "./lib/wallet";
import idl from "./lib/idl.json";
import { Loader2 } from "lucide-react";

const bluff = new Bluff(idl);

const STAKE = 10_000_000n; // 0.01 SOL
const ROUND_SECONDS = 30;
const SESSION_FUEL = 40_000_000n; // 0.04 SOL
const BOT_FUEL = 12_000_000n; // 0.012 SOL
const JOIN_FUEL = 5_000_000n; // 0.005 SOL
const BOT_SEATS = 5;

const HOST_COST = (bots: number) =>
  STAKE + SESSION_FUEL + BOT_FUEL * BigInt(bots) + 25_000_000n;

type Screen =
  | "home"
  | "rules"
  | "opening"
  | "joining"
  | "waiting"
  | "playing"
  | "reveal"
  | "finished";

interface RoomRef {
  host: PublicKey;
  roomId: bigint;
}

export default function App() {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [practiceRound, setPracticeRound] = useState(1);
  const [fairness, setFairness] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const [vote, setVote] = useState<Ending>(Ending.Split);
  const [preview, setPreview] = useState<RoomState | null>(null);
  const [pending, setPending] = useState<{ host: PublicKey; roomId: bigint } | null>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ref, setRef] = useState<RoomRef | null>(null);
  const [session, setSession] = useState<Keypair | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [endpoint, setEndpoint] = useState<{ url: string; token?: string }>({ url: BASE_RPC });
  const [pot, setPot] = useState(0);

  const [bots, setBots] = useState<Bot[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [answer, setAnswer] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Liar's Dice Gameplay States
  const [dicePlayers, setDicePlayers] = useState<PlayerDiceState[]>([]);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(20);
  const [showdown, setShowdown] = useState<ShowdownResult | null>(null);
  const [showdownCountdown, setShowdownCountdown] = useState(8);
  const [lastActions, setLastActions] = useState<Record<string, string>>({});

  const shown = useRef(0);
  const closing = useRef(false);
  const botted = useRef(0);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore previously saved wallet on reload if one was selected
  useEffect(() => {
    (async () => {
      try {
        const saved = await restoreSavedWallet();
        if (saved) {
          setWallet(saved);
        }
      } catch {
        // Fallback
      }
    })();
  }, []);

  // Update devnet balance
  const refreshBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const lamports = await lamportsOf(BASE_RPC, wallet.publicKey);
      setBalance(lamports / 1e9);
    } catch {}
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;
    refreshBalance();
    const id = setInterval(refreshBalance, 3000);
    return () => clearInterval(id);
  }, [wallet, refreshBalance]);

  const nameOf = useCallback(
    (key: string) => {
      if (key === wallet?.address) return "You";
      const bot = bots.find((b) => b.keypair.publicKey.toBase58() === key);
      return bot ? bot.name : shortKey(key);
    },
    [bots, wallet],
  );

  /* ------------------------------------------------------------- room polling */

  const refreshRoom = useCallback(async () => {
    if (!ref) return;
    try {
      const key = bluff.room(ref.host, ref.roomId);
      const data = await accountData(endpoint.url, key, endpoint.token);
      if (!data) return;
      const next = bluff.decodeRoom(data);
      setRoom(next);
      setPot(await lamportsOf(BASE_RPC, bluff.vault(key)));
    } catch {}
  }, [ref, endpoint]);

  useEffect(() => {
    if (!ref) return;
    refreshRoom();
    const id = setInterval(refreshRoom, 1200);
    return () => clearInterval(id);
  }, [ref, refreshRoom]);

  /* ------------------------------------------------- react to game state */

  useEffect(() => {
    if (!room) return;

    if (room.phase === Phase.Open) {
      setScreen("waiting");
      return;
    }

    const resolved = room.lastRound > 0 && room.lastRound !== shown.current;
    if (resolved) {
      shown.current = room.lastRound;
      setScreen("reveal");
      return;
    }

    if (screen === "reveal") return;
    if (room.phase === Phase.Finished || room.phase === Phase.Settled) {
      setScreen("finished");
    } else {
      setScreen("playing");
    }
  }, [room, screen]);

  // Turn countdown timer
  useEffect(() => {
    if (screen !== "playing") return;
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          const survivors = dicePlayers.filter((p) => p.isAlive);
          if (survivors.length > 0) {
            setTurnIndex((t) => (t + 1) % survivors.length);
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, dicePlayers]);

  // Showdown auto-advance countdown
  useEffect(() => {
    if (screen !== "reveal") return;
    const interval = setInterval(() => {
      setShowdownCountdown((prev) => {
        if (prev <= 1) {
          handleNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, dicePlayers]);

  // Autonomous Bot Turns in Liar's Dice
  useEffect(() => {
    if (screen !== "playing" || dicePlayers.length === 0) return;

    const survivors = dicePlayers.filter((p) => p.isAlive);
    if (survivors.length <= 1) {
      setScreen("finished");
      return;
    }

    const currentTurnPlayer = survivors[turnIndex % survivors.length];
    if (!currentTurnPlayer || currentTurnPlayer.isHuman) return; // Wait for human input

    const bot = bots.find((b) => b.keypair.publicKey.toBase58() === currentTurnPlayer.address);
    if (!bot) return;

    const totalDiceOnTable = survivors.reduce((sum, p) => sum + p.diceCount, 0);
    const delay = botThinkingDelay(bot.persona);

    const timer = setTimeout(() => {
      const decision = botMakeDecision(bot, currentTurnPlayer.hand, currentBid, totalDiceOnTable);

      if (decision.action === "bluff" && currentBid) {
        handleCallBluff(currentTurnPlayer.address, currentTurnPlayer.name);
      } else if (decision.bid) {
        handlePlaceBid(
          decision.bid.quantity,
          decision.bid.face,
          currentTurnPlayer.address,
          currentTurnPlayer.name,
        );
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [screen, turnIndex, currentBid, dicePlayers, bots]);

  const handlePlaceBid = (
    quantity: number,
    face: DieFace,
    bidderAddress?: string,
    bidderName?: string,
  ) => {
    const survivors = dicePlayers.filter((p) => p.isAlive);
    const bidderAddr = bidderAddress || wallet?.address || "you";
    const bidderNm = bidderName || "You";

    const newBid: Bid = {
      quantity,
      face,
      bidderAddress: bidderAddr,
      bidderName: bidderNm,
    };

    setCurrentBid(newBid);
    setLastActions((prev) => ({
      ...prev,
      [bidderAddr]: `Bid ${quantity} ${faceNamePlural(face)}`,
    }));

    addToast("info", `${bidderNm} bid ${quantity} ${faceNamePlural(face)}`);

    // Advance turn
    setTurnIndex((prev) => (prev + 1) % Math.max(1, survivors.length));
    setTurnTimeLeft(20);
  };

  const handleCallBluff = (challengerAddr?: string, challengerNm?: string) => {
    if (!currentBid) return;

    const chAddress = challengerAddr || wallet?.address || "you";
    const chName = challengerNm || "You";

    setLastActions((prev) => ({
      ...prev,
      [chAddress]: "Called BLUFF!",
    }));

    addToast("error", `${chName} called BLUFF! Showdown!`);

    const result = resolveBluff(
      currentBid,
      { address: chAddress, name: chName },
      dicePlayers,
    );

    setShowdown(result);

    // Subtract 1 die from loser
    setDicePlayers((prev) =>
      prev.map((p) => {
        if (p.address === result.loserAddress) {
          const nextCount = Math.max(0, p.diceCount - 1);
          return {
            ...p,
            diceCount: nextCount,
            isAlive: nextCount > 0,
          };
        }
        return p;
      }),
    );

    setShowdownCountdown(8);
    setScreen("reveal");
  };

  const handleNextRound = () => {
    const survivors = dicePlayers.filter((p) => p.isAlive);

    if (survivors.length <= 1) {
      setScreen("finished");
      return;
    }

    if (isPracticeMode) {
      setPracticeRound((r) => r + 1);
    }

    // Re-roll surviving players
    setDicePlayers((prev) =>
      prev.map((p) => ({
        ...p,
        hand: p.isAlive ? rollDice(p.diceCount) : [],
      })),
    );

    setCurrentBid(null);
    setLastActions({});
    setTurnIndex(0);
    setTurnTimeLeft(20);
    setScreen("playing");
  };

  /* ------------------------------------------------------------- actions */

  const onAgain = () => {
    setRef(null);
    setRoom(null);
    setSession(null);
    setPreview(null);
    setPending(null);
    setBots([]);
    setDicePlayers([]);
    setCurrentBid(null);
    setTurnIndex(0);
    setShowdown(null);
    setLastActions({});
    botted.current = 0;
    shown.current = 0;
    closing.current = false;
    setJoinCode("");
    setError(null);
    setEndpoint({ url: BASE_RPC });
    setIsPracticeMode(false);
    setPracticeRound(1);
    setScreen("home");
  };

  const onStartPractice = async (botCount: number) => {
    setIsPracticeMode(true);
    setPracticeRound(1);
    const crew = await botsFor(`practice-${Date.now()}`, botCount);
    setBots(crew);

    const allPlayers: PlayerDiceState[] = [
      {
        address: wallet?.address || "you",
        name: "You",
        diceCount: INITIAL_DICE_COUNT,
        hand: rollDice(INITIAL_DICE_COUNT),
        isAlive: true,
        isHuman: true,
      },
      ...crew.map((bot) => ({
        address: bot.keypair.publicKey.toBase58(),
        name: bot.name,
        diceCount: INITIAL_DICE_COUNT,
        hand: rollDice(INITIAL_DICE_COUNT),
        isAlive: true,
        isHuman: false,
      })),
    ];

    setDicePlayers(allPlayers);
    setCurrentBid(null);
    setLastActions({});
    setTurnIndex(0);
    setTurnTimeLeft(20);
    setScreen("playing");
    addToast("info", "Practice match started against bots!");
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(label);
    try {
      await fn();
    } catch (e: any) {
      const msg = explainChainError(e) ?? explainWalletError(e);
      setError(msg);
      addToast("error", msg);
    } finally {
      setBusy(null);
    }
  };

  const sendAsWallet = async (instructions: any[]) => {
    if (!wallet) throw new Error("Connect a wallet first");
    const tx = new (await import("@solana/web3.js")).Transaction({
      feePayer: wallet.publicKey,
      recentBlockhash: await latestBlockhash(BASE_RPC),
    });
    instructions.forEach((i) => tx.add(i));
    const signed = await wallet.signTransaction(tx);
    return submit(BASE_RPC, signed.serialize({ requireAllSignatures: false }));
  };

  const handleDevnetAirdrop = async () => {
    if (!wallet) return;
    setAirdropping(true);
    try {
      await requestDevnetAirdrop(wallet.publicKey, 1);
      addToast("success", "Airdropped 1 Devnet SOL successfully!");
      await refreshBalance();
    } catch (e: any) {
      addToast("error", e.message ?? "Airdrop failed. Devnet faucets can be rate-limited.");
    } finally {
      setAirdropping(false);
    }
  };

  const onCreate = () =>
    run("Opening room on Solana Devnet", async () => {
      if (!wallet) {
        setWalletModalOpen(true);
        return;
      }

      const host = wallet.publicKey;
      const have = BigInt(await lamportsOf(BASE_RPC, host));
      const need = HOST_COST(BOT_SEATS);

      if (have < need) {
        throw new Error(
          `Opening a game costs about ${(Number(need) / 1e9).toFixed(2)} SOL on devnet (stake + bots + rent). ` +
            `This wallet has ${(Number(have) / 1e9).toFixed(3)} SOL. Use the +1 SOL button above.`,
        );
      }

      const roomId = BigInt(Date.now() % 1_000_000);
      const key = bluff.room(host, roomId);
      const mine = await sessionFor(key.toBase58());
      const crew = await botsFor(key.toBase58(), BOT_SEATS);

      setSession(mine);
      setBots(crew);

      await sendAsWallet([
        bluff.createRoom(host, roomId, STAKE, ROUND_SECONDS, mine.publicKey),
        bluff.joinRoom(host, roomId, host, mine.publicKey, vote),
        SystemProgram.transfer({
          fromPubkey: host,
          toPubkey: mine.publicKey,
          lamports: Number(SESSION_FUEL),
        }),
        ...crew.map((bot) =>
          SystemProgram.transfer({
            fromPubkey: host,
            toPubkey: bot.keypair.publicKey,
            lamports: Number(BOT_FUEL),
          }),
        ),
      ]);

      setRef({ host, roomId });
      setScreen("waiting");
      addToast("success", "Room opened! Share code or seat bots to begin.");
    });

  const onFind = () =>
    run("Finding room on Devnet", async () => {
      const [hostText, idText] = joinCode.trim().split(":");
      if (!hostText || !idText) throw new Error("Invalid room code format. Expected host:roomId");

      const host = new PublicKey(hostText);
      const roomId = BigInt(idText);

      const data = await accountData(BASE_RPC, bluff.room(host, roomId));
      if (!data) throw new Error("No room found with that code.");

      const found = bluff.decodeRoom(data);
      if (found.phase !== Phase.Open) throw new Error("That room has already started.");

      setPreview(found);
      setPending({ host, roomId });
      setVote(Ending.Split);
      setScreen("joining");
    });

  const onJoin = () =>
    run("Taking a seat in room", async () => {
      if (!wallet) {
        setWalletModalOpen(true);
        return;
      }
      const { host, roomId } = pending!;
      const key = bluff.room(host, roomId);
      const mine = await sessionFor(key.toBase58());
      setSession(mine);

      await sendAsWallet([
        bluff.joinRoom(host, roomId, wallet.publicKey, mine.publicKey, vote),
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: mine.publicKey,
          lamports: Number(JOIN_FUEL),
        }),
      ]);

      setRef({ host, roomId });
      setScreen("waiting");
      addToast("success", "You took a seat! Waiting for host to start.");
    });

  const onAddBots = (count: number) =>
    run(`Seating ${count} bot players`, async () => {
      const { host, roomId } = ref!;
      const key = bluff.room(host, roomId);
      const crew = await botsFor(key.toBase58(), count);

      for (const bot of crew) {
        const taken = room?.seats.some(
          (seat) => seat.wallet.toBase58() === bot.keypair.publicKey.toBase58(),
        );
        if (taken) continue;

        await sendLocal(
          BASE_RPC,
          [bot.keypair],
          [
            bluff.joinRoom(
              host,
              roomId,
              bot.keypair.publicKey,
              bot.keypair.publicKey,
              vote,
            ),
          ],
        );
        await sleep(600);
      }

      setBots(crew);
      await refreshRoom();
      addToast("success", "Bot players seated!");
    });

  const onStart = () =>
    run("Locking room on base layer", async () => {
      const { host, roomId } = ref!;
      await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.lockRoom(host, roomId, session!.publicKey)],
      );
      await sleep(2500);

      setBusy("Delegating room to MagicBlock TEE validator…");
      await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.delegateRoom(host, roomId, session!.publicKey, TEE_VALIDATOR)],
      );
      await sleep(4000);

      setBusy("Sealing answers in Private Rollup…");
      const key = bluff.room(host, roomId);
      const status = await delegationOf(key);
      if (!status.fqdn) throw new Error("The room did not reach a rollup yet. Try again.");

      const url = status.fqdn.replace(/\/$/, "");
      const token = await authenticate(url, session!);
      setEndpoint({ url, token });

      await sendLocal(url, [session!], [bluff.sealRoom(host, roomId)], token);

      // Initialize secret dice for human player and all bots
      const seatedBots = bots.filter((b) =>
        room?.seats.some(
          (s) => s.wallet.toBase58() === b.keypair.publicKey.toBase58(),
        ) || true,
      );

      const allPlayers: PlayerDiceState[] = [
        {
          address: host.toBase58(),
          name: "You",
          diceCount: INITIAL_DICE_COUNT,
          hand: rollDice(INITIAL_DICE_COUNT),
          isAlive: true,
          isHuman: true,
        },
        ...seatedBots.map((bot) => ({
          address: bot.keypair.publicKey.toBase58(),
          name: bot.name,
          diceCount: INITIAL_DICE_COUNT,
          hand: rollDice(INITIAL_DICE_COUNT),
          isAlive: true,
          isHuman: false,
        })),
      ];

      setDicePlayers(allPlayers);
      setCurrentBid(null);
      setLastActions({});
      setTurnIndex(0);
      setTurnTimeLeft(20);
      setScreen("playing");
      addToast("success", "Game started! Round 1 is live!");
    });

  const onLeave = () =>
    run("Leaving and refunding stake", async () => {
      const { host, roomId } = ref!;
      await sendAsWallet([bluff.leaveRoom(host, roomId, wallet!.publicKey)]);
      addToast("info", "Left room. Stake returned.");
      onAgain();
    });

  const onSettle = () =>
    run("Settling pot on Solana", async () => {
      const { host, roomId } = ref!;
      if (room!.phase === Phase.Finished) {
        try {
          await sendLocal(
            endpoint.url,
            [session!],
            [bluff.finishRoom(host, roomId, session!.publicKey)],
            endpoint.token,
          );
          await sleep(14000);
        } catch {
          // Handed back already
        }
      }
      setEndpoint({ url: BASE_RPC });

      const data = await accountData(BASE_RPC, bluff.room(host, roomId));
      const onBase = bluff.decodeRoom(data!);
      const winners = onBase.seats.filter((x: any) => x.alive).map((x: any) => x.wallet);

      await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.settle(host, roomId, session!.publicKey, winners)],
      );
      await refreshRoom();
      await refreshBalance();
      addToast("success", "Pot successfully paid out on Solana!");
    });

  const mySeat = room?.seats.find(
    (x) => x.session.toBase58() === session?.publicKey.toBase58(),
  );

  const unseatedBots = bots.filter(
    (bot) =>
      !room?.seats.some(
        (seat) => seat.wallet.toBase58() === bot.keypair.publicKey.toBase58(),
      ),
  ).length;

  const activeTab: NavTab = screen === "rules" ? "rules" : "home";

  const handleTabSelect = (tab: NavTab) => {
    if (tab === "home") {
      onAgain();
      setScreen("home");
    } else if (tab === "rules") {
      setScreen("rules");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#05070d] text-slate-100 relative overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200">
      {/* Top Header */}
      <Header
        wallet={wallet}
        balance={balance}
        activeTab={activeTab}
        onSelectTab={handleTabSelect}
        onOpenWallet={() => setWalletModalOpen(true)}
        onDisconnect={async () => {
          await wallet?.disconnect();
          setWallet(null);
          setBalance(null);
          onAgain();
        }}
        onAirdrop={handleDevnetAirdrop}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 flex flex-col">
        {/* Error notification bar */}
        {error && (
          <div className="w-full max-w-xl mx-auto my-3 px-4">
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/35 flex flex-col gap-1 text-left animate-in slide-in-from-top-2 duration-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                Notice
              </span>
              <span className="text-xs text-slate-100 leading-relaxed">{error}</span>
            </div>
          </div>
        )}

        {/* Busy / Progress overlay banner */}
        {busy && (
          <div className="w-full max-w-xl mx-auto my-3 px-4">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 flex items-center gap-3 animate-pulse shadow-xl backdrop-blur-md">
              <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
              <span className="text-xs font-semibold text-slate-100">{busy}…</span>
            </div>
          </div>
        )}

        {/* Home Screen (Hero matching FHE Liar's Dice with integrated table actions) */}
        {screen === "home" && (
          <HomeScreen
            stake={STAKE}
            botSeats={BOT_SEATS}
            joinCode={joinCode}
            onChangeJoinCode={setJoinCode}
            onFindRoom={onFind}
            onOpenRoom={() => {
              if (!wallet) {
                setWalletModalOpen(true);
                return;
              }
              setVote(Ending.Split);
              setScreen("opening");
            }}
            onGoRules={() => setScreen("rules")}
            busy={!!busy}
          />
        )}

        {/* Rules & Privacy Screen */}
        {screen === "rules" && (
          <RulesScreen
            onGoLobby={() => setScreen("home")}
          />
        )}

        {/* Room Setup Screens */}
        {screen === "opening" && (
          <div className="max-w-md w-full mx-auto py-8 px-4">
            <OpeningScreen
              vote={vote}
              onVoteChange={setVote}
              onCreateRoom={onCreate}
              onBack={() => setScreen("home")}
              busy={!!busy}
              stake={STAKE}
            />
          </div>
        )}

        {screen === "joining" && preview && (
          <div className="max-w-md w-full mx-auto py-8 px-4">
            <JoiningScreen
              preview={preview}
              vote={vote}
              onVoteChange={setVote}
              onJoinRoom={onJoin}
              onBack={() => setScreen("home")}
              busy={!!busy}
            />
          </div>
        )}

        {screen === "waiting" && room && ref && (
          <div className="max-w-md w-full mx-auto py-8 px-4">
            <WaitingScreen
              room={room}
              code={`${ref.host.toBase58()}:${ref.roomId}`}
              pot={pot}
              isHost={wallet?.address === ref.host.toBase58()}
              busy={!!busy}
              unseatedBots={unseatedBots}
              onAddBots={() => onAddBots(BOT_SEATS)}
              onStart={onStart}
              onLeave={onLeave}
              nameOf={nameOf}
              you={wallet?.address}
              onCopyNotice={() => addToast("success", "Room code copied to clipboard!")}
            />
          </div>
        )}

        {/* Active Game Table (Both On-Chain and Practice!) */}
        {screen === "playing" && (
          <PlayingScreen
            room={room}
            pot={pot}
            isPractice={isPracticeMode}
            roundNumber={isPracticeMode ? practiceRound : (room?.round ?? 1)}
            myHand={dicePlayers.find((p) => p.isHuman)?.hand || []}
            currentBid={currentBid}
            turnTimeLeft={turnTimeLeft}
            isMyTurn={
              dicePlayers.filter((p) => p.isAlive)[
                turnIndex % Math.max(1, dicePlayers.filter((p) => p.isAlive).length)
              ]?.isHuman ?? false
            }
            alive={dicePlayers.find((p) => p.isHuman)?.isAlive ?? true}
            busy={!!busy}
            seats={dicePlayers.map((p) => {
              const survivors = dicePlayers.filter((sp) => sp.isAlive);
              const isCurrentTurn =
                p.isAlive &&
                survivors[turnIndex % Math.max(1, survivors.length)]?.address === p.address;
              return {
                address: p.address,
                name: p.name,
                diceCount: p.diceCount,
                isAlive: p.isAlive,
                isYou: p.isHuman,
                isCurrentTurn,
                lastAction: lastActions[p.address],
              };
            })}
            totalDiceOnTable={dicePlayers
              .filter((p) => p.isAlive)
              .reduce((sum, p) => sum + p.diceCount, 0)}
            onBid={(quantity, face) => handlePlaceBid(quantity, face)}
            onCallBluff={() => handleCallBluff()}
            onLeave={onAgain}
          />
        )}

        {/* Showdown Reveal */}
        {screen === "reveal" && showdown && (
          <ShowdownScreen
            showdown={showdown}
            players={dicePlayers}
            onNextRound={handleNextRound}
            nextRoundCountdown={showdownCountdown}
          />
        )}

        {/* Game Finished */}
        {screen === "finished" && (
          <div className="max-w-md w-full mx-auto py-8 px-4">
            <FinishedScreen
              room={room || ({ id: 1n, round: 1, host: PublicKey.default, lastRound: 1, phase: Phase.Finished, seats: [], lastWords: [] } as any)}
              pot={pot}
              you={wallet?.address}
              nameOf={nameOf}
              youWon={dicePlayers.find((p) => p.isHuman)?.isAlive ?? false}
              settled={room?.phase === Phase.Settled}
              busy={!!busy}
              onSettle={onSettle}
              onAgain={onAgain}
            />
          </div>
        )}
      </main>


      {/* Fairness Explainer Modal */}
      <FairnessModal open={fairness} onClose={() => setFairness(false)} />

      {/* Wallet Selector & Airdrop Modal */}
      <WalletModal
        open={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        onSelect={(w) => {
          setWallet(w);
          addToast("success", `Connected to ${w.label}`);
        }}
        activeWallet={wallet}
        onAirdropSuccess={() => {
          addToast("success", "Airdropped 1 Devnet SOL!");
          refreshBalance();
        }}
      />

      {/* Floating Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
