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
import { Ending, Outcome, Bluff, Phase, type RoomState } from "./lib/bluff";
import { explainChainError } from "./lib/errors";
import { sessionFor } from "./lib/session";
import {
  botMakeDecision,
  botThinkingDelay,
  botsFor,
  type Bot,
} from "./lib/bots";
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
import { Header } from "./components/Header";
import { LobbyScreen } from "./components/LobbyScreen";
import { OpeningScreen } from "./components/OpeningScreen";
import { JoiningScreen } from "./components/JoiningScreen";
import { WaitingScreen } from "./components/WaitingScreen";
import { PlayingScreen } from "./components/PlayingScreen";
import { ShowdownScreen } from "./components/ShowdownScreen";
import { FinishedScreen } from "./components/FinishedScreen";
import { HelpModal, type HelpTab } from "./components/HelpModal";
import { WalletModal } from "./components/WalletModal";
import { broadcastTableEvent, pollTableEvents } from "./lib/relay";
import { ToastContainer, type ToastMessage } from "./components/Toast";
import { recordActivity } from "./lib/activity";
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
  | "lobby"
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
  const [screen, setScreen] = useState<Screen>("lobby");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<HelpTab>("rules");

  const openHelp = (tab: HelpTab = "rules") => {
    setHelpTab(tab);
    setHelpOpen(true);
  };

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

  // Callsign / Player Name state (persisted to localStorage)
  const [callsign, setCallsign] = useState<string>(() => {
    return localStorage.getItem("bluff.callsign") || "Player";
  });
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const myTabId = useRef(Math.random().toString(36).slice(2)).current;
  const lastPolledIdRef = useRef(0);
  const advancingRoundRef = useRef(false);

  const handleCallsignChange = (name: string) => {
    setCallsign(name);
    localStorage.setItem("bluff.callsign", name);
    if (wallet?.address) {
      setPlayerNames((prev) => ({ ...prev, [wallet.address]: name }));
    }
  };

  // Liar's Dice Gameplay States
  const [dicePlayers, setDicePlayers] = useState<PlayerDiceState[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentBid, setCurrentBid] = useState<Bid | null>(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [turnTimeLeft, setTurnTimeLeft] = useState(20);
  const [showdown, setShowdown] = useState<ShowdownResult | null>(null);
  const [showdownCountdown, setShowdownCountdown] = useState(12);
  const [lastActions, setLastActions] = useState<Record<string, string>>({});
  const [activityLog, setActivityLog] = useState<{ id: string; text: string; color?: string }[]>([]);

  const logActivity = useCallback((text: string, color?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setActivityLog((prev) => [{ id, text, color }, ...prev].slice(0, 50));
  }, []);

  const shown = useRef(0);
  const closing = useRef(false);
  const botted = useRef(0);
  const broadcastRef = useRef<BroadcastChannel | null>(null);

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
      if (key === wallet?.address) return callsign || "You";
      if (playerNames[key]) return playerNames[key];
      const bot = bots.find((b) => b.keypair.publicKey.toBase58() === key);
      return bot ? bot.name : shortKey(key);
    },
    [bots, wallet, callsign, playerNames],
  );

  const createDicePlayers = useCallback(
    (roomState: RoomState) => {
      return roomState.seats.map((seat) => {
        const addr = seat.wallet.toBase58();
        const bot = bots.find((b) => b.keypair.publicKey.toBase58() === addr);
        const isHuman = !bot;
        const displayName = bot
          ? bot.name
          : addr === wallet?.address
          ? (callsign || "Player")
          : playerNames[addr] || shortKey(addr);

        return {
          address: addr,
          name: displayName,
          diceCount: INITIAL_DICE_COUNT,
          hand: rollDice(INITIAL_DICE_COUNT),
          isAlive: seat.alive,
          isHuman,
        };
      });
    },
    [bots, wallet, callsign, playerNames],
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

  /* ------------------------------------------------- real-time sync & react to game state */

  const gameStateRef = useRef({
    dicePlayers,
    currentBid,
    turnIndex,
    turnTimeLeft,
    lastActions,
    screen,
    showdown,
  });

  useEffect(() => {
    gameStateRef.current = {
      dicePlayers,
      currentBid,
      turnIndex,
      turnTimeLeft,
      lastActions,
      screen,
      showdown,
    };
  }, [dicePlayers, currentBid, turnIndex, turnTimeLeft, lastActions, screen, showdown]);

  const sendSyncEvent = useCallback(
    (event: any) => {
      const payload = { ...event, _senderId: myTabId };
      broadcastRef.current?.postMessage(payload);
      if (ref) {
        const tableId = `${ref.host.toBase58()}_${ref.roomId}`;
        broadcastTableEvent(tableId, payload).catch(() => {});
      }
    },
    [ref, myTabId],
  );

  const applyIncomingEvent = useCallback(
    (msg: any) => {
      if (!msg || !msg.type) return;
      if (msg._senderId === myTabId) return; // Prevent echoing self

      if (msg.type === "SET_NAME") {
        if (msg.address && msg.name) {
          setPlayerNames((prev) => ({ ...prev, [msg.address]: msg.name }));
          setDicePlayers((prev) =>
            prev.map((p) => (p.address === msg.address ? { ...p, name: msg.name } : p)),
          );
        }
      } else if (msg.type === "GAME_STARTED") {
        if (msg.playerNames) {
          setPlayerNames((prev) => ({ ...prev, ...msg.playerNames }));
        }
        setDicePlayers(msg.players);
        setCurrentRound(1);
        setCurrentBid(null);
        setLastActions({});
        setTurnIndex(msg.turnIndex ?? 0);
        setTurnTimeLeft(20);
        setScreen("playing");
        setActivityLog([{
          id: Math.random().toString(36).slice(2, 9),
          text: `Round 1 — hands rolled for ${msg.players.length} players.`,
        }]);
        addToast("success", "Game started! Round 1 is live!");
      } else if (msg.type === "REQUEST_SYNC") {
        const cur = gameStateRef.current;
        if (cur.dicePlayers.length > 0) {
          sendSyncEvent({
            type: "SYNC_STATE",
            players: cur.dicePlayers,
            round: currentRound,
            currentBid: cur.currentBid,
            turnIndex: cur.turnIndex,
            turnTimeLeft: cur.turnTimeLeft,
            lastActions: cur.lastActions,
            screen: cur.screen,
            showdown: cur.showdown,
            playerNames,
          });
        }
      } else if (msg.type === "SYNC_STATE") {
        if (msg.playerNames) {
          setPlayerNames((prev) => ({ ...prev, ...msg.playerNames }));
        }
        if (msg.round !== undefined) setCurrentRound(msg.round);
        if (msg.players && msg.players.length > 0) {
          setDicePlayers(msg.players);
          if (msg.currentBid !== undefined) setCurrentBid(msg.currentBid);
          if (msg.turnIndex !== undefined) setTurnIndex(msg.turnIndex);
          if (msg.turnTimeLeft !== undefined) setTurnTimeLeft(msg.turnTimeLeft);
          if (msg.lastActions) setLastActions(msg.lastActions);
          if (msg.showdown) setShowdown(msg.showdown);
          if (msg.screen && msg.screen !== "waiting") setScreen(msg.screen);
        }
      } else if (msg.type === "BID") {
        setCurrentBid(msg.bid);
        setLastActions((prev) => ({
          ...prev,
          [msg.bid.bidderAddress]: `Bid ${msg.bid.quantity} ${faceNamePlural(msg.bid.face)}`,
        }));
        setTurnIndex(msg.nextTurnIndex);
        setTurnTimeLeft(20);
        const isMe = msg.bid.bidderAddress === wallet?.address;
        const bidder = isMe ? "You" : msg.bid.bidderName;
        logActivity(`${bidder} bid ${msg.bid.quantity} × face ${msg.bid.face}.`);
      } else if (msg.type === "CALL_BLUFF") {
        setLastActions((prev) => ({
          ...prev,
          [msg.challengerAddress]: "Called BLUFF!",
        }));
        const isMe = msg.challengerAddress === wallet?.address;
        const challenger = isMe ? "You" : msg.challengerName;
        if (currentBid) {
          logActivity(`${challenger} called the bluff on ${currentBid.quantity} × face ${currentBid.face}.`);
        }
        if (msg.showdown) {
          const outcomeLabel = msg.showdown.wasBluff
            ? "Bluff caught — bidder loses."
            : "Bid was good — challenger loses.";
          logActivity(outcomeLabel, "text-[#f2603c]");

          const loserPlayer = dicePlayers.find((p) => p.address === msg.showdown.loserAddress);
          const loserRemaining = Math.max(0, (loserPlayer?.diceCount ?? 1) - 1);
          const loserName = msg.showdown.loserAddress === wallet?.address ? "You" : msg.showdown.loserName;
          const loserText = `${loserName} lost a die — ${loserRemaining} left.`;
          logActivity(loserText, "text-[#f2603c]");
        }
        setShowdown(msg.showdown);
        if (msg.updatedPlayers) {
          setDicePlayers(msg.updatedPlayers);
        } else {
          setDicePlayers((prev) =>
            prev.map((p) => {
              if (p.address === msg.showdown.loserAddress) {
                const nextCount = Math.max(0, p.diceCount - 1);
                return { ...p, diceCount: nextCount, isAlive: nextCount > 0 };
              }
              return p;
            }),
          );
        }
        setShowdownCountdown(12);
        setScreen("reveal");
      } else if (msg.type === "NEXT_ROUND") {
        const nextRound = msg.round ?? (currentRound + 1);
        setCurrentRound(nextRound);
        const nextPlayers = msg.players ?? dicePlayers;
        setDicePlayers(nextPlayers);
        const survivors = nextPlayers.filter((p: any) => p.isAlive && (p.diceCount ?? 0) > 0);
        if (survivors.length <= 1) {
          setScreen("finished");
          return;
        }
        setCurrentBid(null);
        setLastActions({});
        setTurnIndex(0);
        setTurnTimeLeft(20);
        setScreen("playing");
        const roundRollText = `Round ${nextRound} — fresh hands rolled.`;
        logActivity(roundRollText, "text-[#38bdf8]");
        addToast("info", `Round ${nextRound} — fresh hands rolled!`);
      } else if (msg.type === "GAME_OVER") {
        setScreen("finished");
      } else if (msg.type === "TURN_TIMEOUT") {
        setTurnIndex(msg.nextTurnIndex);
        setTurnTimeLeft(20);
      }
    },
    [wallet, myTabId, sendSyncEvent, playerNames],
  );

  useEffect(() => {
    if (!ref) {
      if (broadcastRef.current) {
        broadcastRef.current.close();
        broadcastRef.current = null;
      }
      return;
    }

    const channelName = `bluff_table_${ref.host.toBase58()}_${ref.roomId}`;
    const channel = new BroadcastChannel(channelName);
    broadcastRef.current = channel;

    channel.onmessage = (event) => {
      applyIncomingEvent(event.data);
    };

    const tableId = `${ref.host.toBase58()}_${ref.roomId}`;

    // Announce our callsign / name
    sendSyncEvent({
      type: "SET_NAME",
      address: wallet?.address || "anon",
      name: callsign || "Player",
    });

    // Request sync from existing peers
    sendSyncEvent({ type: "REQUEST_SYNC" });

    // HTTP relay polling for cross-browser synchronization
    const pollInterval = setInterval(async () => {
      try {
        const events = await pollTableEvents(tableId, lastPolledIdRef.current);
        for (const ev of events) {
          lastPolledIdRef.current = Math.max(lastPolledIdRef.current, ev.id);
          applyIncomingEvent(ev.data);
        }
      } catch {}
    }, 350);

    return () => {
      channel.close();
      broadcastRef.current = null;
      clearInterval(pollInterval);
    };
  }, [ref, wallet, callsign, applyIncomingEvent, sendSyncEvent]);

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

    // Never interrupt the reveal showdown or finished victory screen
    if (screen === "reveal" || screen === "finished") return;

    if (room.phase === Phase.Finished || room.phase === Phase.Settled) {
      setScreen("finished");
      return;
    }

    // Check if Liar's Dice has already concluded
    const aliveDicePlayers = dicePlayers.filter((p) => p.isAlive && p.diceCount > 0);
    if (dicePlayers.length > 0 && aliveDicePlayers.length <= 1) {
      setScreen("finished");
      return;
    }

    if (room.phase === Phase.Playing) {
      if (screen === "waiting" || screen === "opening" || screen === "joining") {
        setScreen("playing");
      }
      setDicePlayers((prev) => {
        if (prev.length === 0 && room.seats.length > 0) {
          broadcastRef.current?.postMessage({ type: "REQUEST_SYNC" });
          return createDicePlayers(room);
        }
        return prev;
      });
    }
  }, [room, screen, dicePlayers, createDicePlayers]);

  // Turn countdown timer
  useEffect(() => {
    if (screen !== "playing") return;
    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          const survivors = dicePlayers.filter((p) => p.isAlive);
          if (survivors.length > 0) {
            const nextTurn = (turnIndex + 1) % survivors.length;
            setTurnIndex(nextTurn);
            sendSyncEvent({
              type: "TURN_TIMEOUT",
              nextTurnIndex: nextTurn,
            });
          }
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, dicePlayers, turnIndex, sendSyncEvent]);

  // Showdown auto-advance countdown
  useEffect(() => {
    if (screen !== "reveal") return;
    const interval = setInterval(() => {
      setShowdownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [screen, dicePlayers, currentRound]);

  // Autonomous Bot Turns in Liar's Dice
  useEffect(() => {
    if (screen !== "playing" || dicePlayers.length === 0) return;

    const survivors = dicePlayers.filter((p) => p.isAlive && p.diceCount > 0);
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
    const playerObj = dicePlayers.find((p) => p.address === bidderAddr);
    const canonicalName =
      bidderName ||
      (playerObj
        ? playerObj.name
        : bidderAddr === wallet?.address
        ? (callsign || "You")
        : shortKey(bidderAddr));

    const newBid: Bid = {
      quantity,
      face,
      bidderAddress: bidderAddr,
      bidderName: canonicalName,
    };

    const nextTurn = (turnIndex + 1) % Math.max(1, survivors.length);

    setCurrentBid(newBid);
    setLastActions((prev) => ({
      ...prev,
      [bidderAddr]: `Bid ${quantity} ${faceNamePlural(face)}`,
    }));

    const isMe = bidderAddr === wallet?.address;
    logActivity(`${isMe ? "You" : canonicalName} bid ${quantity} × face ${face}.`);

    // Advance turn
    setTurnIndex(nextTurn);
    setTurnTimeLeft(20);

    // Submit live bid transaction to MagicBlock TEE Rollup
    if (endpoint?.url && endpoint.url !== BASE_RPC && ref) {
      const bidderKeypair = isMe
        ? session
        : bots.find((b) => b.keypair.publicKey.toBase58() === bidderAddr)?.keypair;
      if (bidderKeypair) {
        sendLocal(
          endpoint.url,
          [bidderKeypair],
          [
            bluff.submitAnswer(
              ref.host,
              ref.roomId,
              bidderKeypair.publicKey,
              `bid:${quantity}:${face}`,
            ),
          ],
          endpoint.token,
        )
          .then((txSig) => {
            recordActivity({
              signature: txSig,
              network: "MagicBlock ER",
              label: `${isMe ? "You" : canonicalName} raised bid (${quantity} × face ${face})`,
              status: "confirmed",
              time: Date.now(),
            });
          })
          .catch((err) => {
            console.warn("Rollup bid submission:", err);
          });
      }
    }

    // Sync across tabs & browsers
    sendSyncEvent({
      type: "BID",
      bid: newBid,
      nextTurnIndex: nextTurn,
    });
  };

  const handleCallBluff = (challengerAddr?: string, challengerNm?: string) => {
    if (!currentBid) return;

    const chAddress = challengerAddr || wallet?.address || "you";
    const playerObj = dicePlayers.find((p) => p.address === chAddress);
    const chName =
      challengerNm ||
      (playerObj
        ? playerObj.name
        : chAddress === wallet?.address
        ? (callsign || "You")
        : shortKey(chAddress));

    setLastActions((prev) => ({
      ...prev,
      [chAddress]: "Called BLUFF!",
    }));

    const isMe = chAddress === wallet?.address;
    const challenger = isMe ? "You" : chName;
    logActivity(`${challenger} called the bluff on ${currentBid.quantity} × face ${currentBid.face}.`, "text-[#f2603c]");

    const result = resolveBluff(
      currentBid,
      { address: chAddress, name: chName },
      dicePlayers,
    );

    const outcomeLabel = result.wasBluff
      ? "Bluff caught — bidder loses."
      : "Bid was good — challenger loses.";
    logActivity(outcomeLabel, "text-[#f2603c]");

    const loser = dicePlayers.find((p) => p.address === result.loserAddress);
    const loserRemaining = Math.max(0, (loser?.diceCount ?? 1) - 1);
    const loserName = result.loserAddress === wallet?.address ? "You" : result.loserName;
    const loserActionText = `${loserName} lost a die — ${loserRemaining} left.`;
    logActivity(loserActionText, "text-[#f2603c]");

    setShowdown(result);

    // Subtract 1 die from loser
    const updatedPlayers = dicePlayers.map((p) => {
      if (p.address === result.loserAddress) {
        const nextCount = Math.max(0, p.diceCount - 1);
        return {
          ...p,
          diceCount: nextCount,
          isAlive: nextCount > 0,
        };
      }
      return p;
    });

    setDicePlayers(updatedPlayers);
    setShowdownCountdown(12);
    setScreen("reveal");

    // Submit live bluff challenge transaction to MagicBlock TEE Rollup
    if (endpoint?.url && endpoint.url !== BASE_RPC && ref) {
      const callerKeypair = isMe
        ? session
        : bots.find((b) => b.keypair.publicKey.toBase58() === chAddress)?.keypair;
      if (callerKeypair) {
        sendLocal(
          endpoint.url,
          [callerKeypair],
          [
            bluff.submitAnswer(
              ref.host,
              ref.roomId,
              callerKeypair.publicKey,
              "bluff",
            ),
          ],
          endpoint.token,
        )
          .then((txSig) => {
            recordActivity({
              signature: txSig,
              network: "MagicBlock ER",
              label: `${challenger} challenged bluff in TEE`,
              status: "confirmed",
              time: Date.now(),
            });
          })
          .catch((err) => {
            console.warn("Rollup bluff submission:", err);
          });
      }
    }

    // Sync across tabs & browsers
    sendSyncEvent({
      type: "CALL_BLUFF",
      challengerAddress: chAddress,
      challengerName: chName,
      showdown: result,
      updatedPlayers,
    });
  };

  const handleNextRound = () => {
    if (advancingRoundRef.current) return;
    advancingRoundRef.current = true;
    setTimeout(() => {
      advancingRoundRef.current = false;
    }, 1500);

    const survivors = dicePlayers.filter((p) => p.isAlive && p.diceCount > 0);

    if (survivors.length <= 1) {
      setScreen("finished");
      sendSyncEvent({
        type: "GAME_OVER",
        survivors,
      });
      return;
    }

    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);

    // Re-roll surviving players
    const nextPlayers = dicePlayers.map((p) => ({
      ...p,
      hand: p.isAlive ? rollDice(p.diceCount) : [],
    }));
    setDicePlayers(nextPlayers);

    setCurrentBid(null);
    setLastActions({});
    setTurnIndex(0);
    setTurnTimeLeft(20);
    setScreen("playing");

    const roundText = `Round ${nextRound} — fresh hands rolled.`;
    logActivity(roundText, "text-[#38bdf8]");
    addToast("info", `Round ${nextRound} started — fresh hands rolled!`);

    // Submit round transition to MagicBlock TEE Rollup
    if (endpoint?.url && endpoint.url !== BASE_RPC && ref && session) {
      sendLocal(
        endpoint.url,
        [session],
        [bluff.closeRound(ref.host, ref.roomId, session.publicKey, 1)],
        endpoint.token,
      )
        .then((txSig) => {
          recordActivity({
            signature: txSig,
            network: "MagicBlock ER",
            label: `Round ${currentRound} closed in TEE`,
            status: "confirmed",
            time: Date.now(),
          });
        })
        .catch(() => {});
    }

    // Sync across tabs & browsers
    sendSyncEvent({
      type: "NEXT_ROUND",
      players: nextPlayers,
      round: nextRound,
    });
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
    setCurrentRound(1);
    setActivityLog([]);
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
    setScreen("lobby");
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

      const sig = await sendAsWallet([
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

      recordActivity({
        signature: sig,
        network: "Solana Devnet",
        label: "Initialize Room & Deposit Pot",
        status: "confirmed",
        time: Date.now(),
      });

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

      const sig = await sendAsWallet([
        bluff.joinRoom(host, roomId, wallet.publicKey, mine.publicKey, vote),
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: mine.publicKey,
          lamports: Number(JOIN_FUEL),
        }),
      ]);

      recordActivity({
        signature: sig,
        network: "Solana Devnet",
        label: "Deposit Stake & Take Seat",
        status: "confirmed",
        time: Date.now(),
      });

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

        const botJoinSig = await sendLocal(
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
        recordActivity({
          signature: botJoinSig,
          network: "Solana Devnet",
          label: `${bot.name} took seat`,
          status: "confirmed",
          time: Date.now(),
        });
        await sleep(600);
      }

      setBots(crew);
      await refreshRoom();
      addToast("success", "Bot players seated!");
    });

  const onStart = () =>
    run("Locking room on base layer", async () => {
      if (!room || room.seats.length < 3) {
        addToast("error", "At least 3 players are required to start. Seat bot players to play solo!");
        throw new Error("At least 3 players are required to start.");
      }
      const { host, roomId } = ref!;
      const lockSig = await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.lockRoom(host, roomId, session!.publicKey)],
      );
      recordActivity({
        signature: lockSig,
        network: "Solana Devnet",
        label: "Lock room on Solana Devnet",
        status: "confirmed",
        time: Date.now(),
      });
      await sleep(2500);

      setBusy("Delegating room to MagicBlock TEE validator…");
      const delSig = await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.delegateRoom(host, roomId, session!.publicKey, TEE_VALIDATOR)],
      );
      recordActivity({
        signature: delSig,
        network: "Solana Devnet",
        label: "Delegate room to MagicBlock TEE",
        status: "confirmed",
        time: Date.now(),
      });
      await sleep(4000);

      setBusy("Sealing answers in Private Rollup…");
      const key = bluff.room(host, roomId);
      const status = await delegationOf(key);
      if (!status.fqdn) throw new Error("The room did not reach a rollup yet. Try again.");

      const url = status.fqdn.replace(/\/$/, "");
      const token = await authenticate(url, session!);
      setEndpoint({ url, token });

      const sealSig = await sendLocal(url, [session!], [bluff.sealRoom(host, roomId)], token);
      recordActivity({
        signature: sealSig,
        network: "MagicBlock ER",
        label: "Seal secret dice in Private TEE",
        status: "confirmed",
        time: Date.now(),
      });

      // Refresh room to ensure all seated players are present
      const freshData = await accountData(url, key, token).catch(() => null);
      const activeRoom = freshData ? bluff.decodeRoom(freshData) : room;
      const targetRoom = activeRoom || room;

      if (!targetRoom) throw new Error("Could not load room state.");

      const allPlayers = createDicePlayers(targetRoom);

      setDicePlayers(allPlayers);
      setCurrentRound(1);
      setActivityLog([{
        id: Math.random().toString(36).slice(2, 9),
        text: `Round 1 — hands rolled for ${allPlayers.length} players.`,
      }]);
      setCurrentBid(null);
      setLastActions({});
      setTurnIndex(0);
      setTurnTimeLeft(20);
      setScreen("playing");
      addToast("success", "Game started! Round 1 is live!");

      // Broadcast game start to all other players in the room
      sendSyncEvent({
        type: "GAME_STARTED",
        players: allPlayers,
        turnIndex: 0,
        playerNames,
      });
    });

  const onLeave = () =>
    run("Leaving and refunding stake", async () => {
      const { host, roomId } = ref!;
      const leaveSig = await sendAsWallet([bluff.leaveRoom(host, roomId, wallet!.publicKey)]);
      recordActivity({
        signature: leaveSig,
        network: "Solana Devnet",
        label: "Leave room & Refund stake",
        status: "confirmed",
        time: Date.now(),
      });
      addToast("info", "Left room. Stake returned.");
      onAgain();
    });

  const onSettle = () =>
    run("Settling pot on Solana", async () => {
      const { host, roomId } = ref!;
      if (room!.phase === Phase.Finished) {
        try {
          const finishSig = await sendLocal(
            endpoint.url,
            [session!],
            [bluff.finishRoom(host, roomId, session!.publicKey)],
            endpoint.token,
          );
          recordActivity({
            signature: finishSig,
            network: "MagicBlock ER",
            label: "Undelegate room from MagicBlock TEE",
            status: "confirmed",
            time: Date.now(),
          });
          await sleep(14000);
        } catch {
          // Handed back already
        }
      }
      setEndpoint({ url: BASE_RPC });

      const data = await accountData(BASE_RPC, bluff.room(host, roomId));
      const onBase = bluff.decodeRoom(data!);
      const winners = onBase.seats.filter((x: any) => x.alive).map((x: any) => x.wallet);

      const settleSig = await sendLocal(
        BASE_RPC,
        [session!],
        [bluff.settle(host, roomId, session!.publicKey, winners)],
      );
      recordActivity({
        signature: settleSig,
        network: "Solana Devnet",
        label: "Settle pot & Payout winners",
        status: "confirmed",
        time: Date.now(),
      });
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

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0c0f0b]">
      {/* Top Header */}
      <Header
        wallet={wallet}
        balance={balance}
        onOpenWallet={() => setWalletModalOpen(true)}
        onDisconnect={async () => {
          await wallet?.disconnect();
          setWallet(null);
          setBalance(null);
          onAgain();
        }}
        onOpenHelp={openHelp}
        onOpenFairness={() => openHelp("fairness")}
        onGoHome={onAgain}
        onAirdrop={handleDevnetAirdrop}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col items-center justify-center p-4 sm:py-8 sm:px-6 w-full mx-auto my-auto transition-all ${
          screen === "playing" || screen === "reveal" ? "max-w-6xl" : "max-w-xl"
        }`}
      >
        {/* Error notification bar */}
        {error && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-[#f2603c]/15 border border-[#f2603c]/35 flex flex-col gap-1 text-left animate-in slide-in-from-top-2 duration-200">
            <span className="text-xs font-black uppercase tracking-wider text-[#f2603c]">
              Notice
            </span>
            <span className="text-xs text-[#f1f4ec] leading-relaxed">{error}</span>
          </div>
        )}

        {/* Busy / Progress overlay banner */}
        {busy && (
          <div className="w-full mb-4 p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] flex items-center gap-3 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-[#FBD53D]" />
            <span className="text-xs font-semibold text-[#f1f4ec]">{busy}…</span>
          </div>
        )}

        {/* View Switcher */}
        {screen === "lobby" && (
          <LobbyScreen
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
            onOpenFairness={() => openHelp("fairness")}
            busy={!!busy}
          />
        )}

        {screen === "opening" && (
          <OpeningScreen
            vote={vote}
            onVoteChange={setVote}
            onCreateRoom={onCreate}
            onBack={() => setScreen("lobby")}
            busy={!!busy}
            stake={STAKE}
            callsign={callsign}
            onCallsignChange={handleCallsignChange}
          />
        )}

        {screen === "joining" && preview && (
          <JoiningScreen
            preview={preview}
            vote={vote}
            onVoteChange={setVote}
            onJoinRoom={onJoin}
            onBack={() => setScreen("lobby")}
            busy={!!busy}
            callsign={callsign}
            onCallsignChange={handleCallsignChange}
          />
        )}

        {screen === "waiting" && room && ref && (
          <WaitingScreen
            room={room}
            code={`${ref.host.toBase58()}:${ref.roomId}`}
            pot={pot}
            isHost={wallet?.address === ref.host.toBase58()}
            busy={!!busy}
            unseatedBots={unseatedBots}
            onAddBots={onAddBots}
            onStart={onStart}
            onLeave={onLeave}
            nameOf={nameOf}
            you={wallet?.address}
            onCopyNotice={() => addToast("success", "Room code copied to clipboard!")}
          />
        )}

        {screen === "playing" && room && (
          <PlayingScreen
            room={room}
            roomAddress={ref ? bluff.room(ref.host, ref.roomId).toBase58() : undefined}
            round={currentRound}
            erUrl={endpoint.url}
            isDelegated={endpoint.url !== BASE_RPC}
            pot={pot}
            myHand={
              dicePlayers.find((p) => p.address === wallet?.address)?.hand ||
              dicePlayers.find((p) => p.isHuman)?.hand ||
              []
            }
            currentBid={currentBid}
            turnTimeLeft={turnTimeLeft}
            isMyTurn={
              dicePlayers.filter((p) => p.isAlive)[
                turnIndex % Math.max(1, dicePlayers.filter((p) => p.isAlive).length)
              ]?.address === wallet?.address
            }
            alive={dicePlayers.find((p) => p.address === wallet?.address)?.isAlive ?? true}
            busy={!!busy}
            seats={dicePlayers.map((p) => {
              const survivors = dicePlayers.filter((sp) => sp.isAlive);
              const isCurrentTurn =
                p.isAlive &&
                survivors[turnIndex % Math.max(1, survivors.length)]?.address === p.address;
              const isYou = p.address === wallet?.address;
              return {
                address: p.address,
                name: p.name,
                diceCount: p.diceCount,
                isAlive: p.isAlive,
                isYou: isYou,
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

        {screen === "reveal" && showdown && (
          <ShowdownScreen
            showdown={showdown}
            players={dicePlayers}
            onNextRound={handleNextRound}
            nextRoundCountdown={showdownCountdown}
            you={wallet?.address}
          />
        )}

        {screen === "finished" && room && (
          <FinishedScreen
            room={room}
            dicePlayers={dicePlayers}
            pot={pot}
            you={wallet?.address}
            nameOf={nameOf}
            settled={room.phase === Phase.Settled}
            busy={!!busy}
            onSettle={onSettle}
            onAgain={onAgain}
          />
        )}
      </main>

      {/* Game Guide, Rules & Fairness Modal */}
      <HelpModal
        open={helpOpen}
        initialTab={helpTab}
        onClose={() => setHelpOpen(false)}
      />

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
