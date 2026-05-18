// Galaxy Strike X — Backend hooks
// Backend is optional: game works fully offline if canister unavailable.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GameSave, LeaderboardEntry, PlayerProfile } from "../game/types";
import { useGameStore } from "../store/gameStore";

// Attempt to import backend — if it fails or is empty, all hooks gracefully degrade
let actor: {
  getProfile?: () => Promise<PlayerProfile>;
  saveGame?: (s: unknown) => Promise<void>;
  getLeaderboard?: () => Promise<LeaderboardEntry[]>;
} | null = null;

async function initActor() {
  try {
    const mod = await import("../backend").catch(() => null);
    if (mod?.createActor) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actor = (
        mod.createActor as unknown as (
          id: string,
          opts: unknown,
        ) => typeof actor
      )("aaaaa-aa", {});
    }
  } catch {
    // Backend not available — offline mode
    actor = null;
  }
}
initActor();

// ─── Player Profile ───────────────────────────────────────────────────────────
export function usePlayerProfile() {
  const setPlayerProfile = useGameStore((s) => s.setPlayerProfile);

  return useQuery<PlayerProfile | null>({
    queryKey: ["player_profile"],
    queryFn: async () => {
      try {
        if (!actor?.getProfile) return null;
        const profile = await actor.getProfile();
        if (profile) setPlayerProfile(profile);
        return profile;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

// ─── Game Save ────────────────────────────────────────────────────────────────
export function useGameSave() {
  return useQuery<GameSave | null>({
    queryKey: ["game_save"],
    queryFn: async () => {
      try {
        return null; // Backend interface currently empty — use localStorage via zustand persist
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

// ─── Save Progress ────────────────────────────────────────────────────────────
export function useSaveProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (save: GameSave) => {
      try {
        if (!actor?.saveGame) return;
        await actor.saveGame(save);
      } catch {
        // Silently fail — data is persisted locally via zustand persist middleware
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["game_save"] });
    },
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export function useLeaderboard(mode?: string) {
  const setLeaderboard = useGameStore((s) => s.setLeaderboard);

  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard", mode],
    queryFn: async () => {
      try {
        if (!actor?.getLeaderboard) return getMockLeaderboard();
        const entries = await actor.getLeaderboard();
        setLeaderboard(entries);
        return entries;
      } catch {
        return getMockLeaderboard();
      }
    },
    staleTime: 120_000,
    retry: false,
  });
}

// ─── Achievements ──────────────────────────────────────────────────────────────
export function useAchievements() {
  const gameSave = useGameStore((s) => s.gameSave);
  return {
    data: gameSave?.achievements ?? [],
    isLoading: false,
  };
}

// ─── Mock Leaderboard Data ────────────────────────────────────────────────────
function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      rank: 1,
      playerId: "ace001",
      displayName: "StarAce",
      score: 2_850_000,
      wave: 42,
      mode: "endless",
      timestamp: Date.now() - 3600000,
    },
    {
      rank: 2,
      playerId: "neo002",
      displayName: "NeoViper",
      score: 2_340_100,
      wave: 38,
      mode: "endless",
      timestamp: Date.now() - 7200000,
    },
    {
      rank: 3,
      playerId: "blaze003",
      displayName: "Blaze_X",
      score: 1_920_500,
      wave: 35,
      mode: "hardcore",
      timestamp: Date.now() - 14400000,
    },
    {
      rank: 4,
      playerId: "nova004",
      displayName: "NovaStrike",
      score: 1_650_200,
      wave: 31,
      mode: "endless",
      timestamp: Date.now() - 28800000,
    },
    {
      rank: 5,
      playerId: "storm005",
      displayName: "StormRider",
      score: 1_420_000,
      wave: 28,
      mode: "boss_battle",
      timestamp: Date.now() - 43200000,
    },
    {
      rank: 6,
      playerId: "dark006",
      displayName: "DarkPulse",
      score: 1_180_750,
      wave: 24,
      mode: "story",
      timestamp: Date.now() - 86400000,
    },
    {
      rank: 7,
      playerId: "cry007",
      displayName: "CryoStar",
      score: 980_300,
      wave: 20,
      mode: "endless",
      timestamp: Date.now() - 172800000,
    },
    {
      rank: 8,
      playerId: "void008",
      displayName: "VoidHunter",
      score: 820_100,
      wave: 18,
      mode: "hardcore",
      timestamp: Date.now() - 259200000,
    },
    {
      rank: 9,
      playerId: "sol009",
      displayName: "SolarFlare",
      score: 650_500,
      wave: 15,
      mode: "story",
      timestamp: Date.now() - 345600000,
    },
    {
      rank: 10,
      playerId: "pul010",
      displayName: "PulsarKnight",
      score: 510_000,
      wave: 13,
      mode: "endless",
      timestamp: Date.now() - 432000000,
    },
  ];
}
