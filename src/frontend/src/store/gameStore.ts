import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SETTINGS, WEAPON_STATS } from "../game/constants";
import type {
  GameMode,
  GameSave,
  GameScreen,
  GameSettings,
  GameStore,
  LeaderboardEntry,
  PlayerProfile,
  WeaponType,
  WeaponUpgrade,
} from "../game/types";

const DEFAULT_PROFILE: PlayerProfile = {
  playerId: "",
  displayName: "Pilot",
  skinIndex: 0,
  totalScore: 0,
  totalCoins: 0,
  totalKills: 0,
  highScore: 0,
  gamesPlayed: 0,
  achievements: [],
  weapons: Object.keys(WEAPON_STATS).map((w) => ({
    weapon: w as WeaponType,
    level: 1,
    damage: WEAPON_STATS[w as WeaponType].damage,
    fireRate: WEAPON_STATS[w as WeaponType].fireRate,
    unlocked: w === "laser",
  })),
  playerLevel: 1,
  playerXp: 0,
  createdAt: Date.now(),
  lastPlayed: Date.now(),
};

const DEFAULT_SAVE: GameSave = {
  playerId: "",
  bestScores: { story: 0, endless: 0, boss_battle: 0, hardcore: 0 },
  totalCoins: 0,
  spentCoins: 0,
  weaponUpgrades: DEFAULT_PROFILE.weapons,
  achievements: [],
  dailyMissions: [],
  settings: DEFAULT_SETTINGS,
  lastSaved: Date.now(),
};

interface State extends GameStore {
  // Internal
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      currentScreen: "menu" as GameScreen,
      playerProfile: DEFAULT_PROFILE,
      gameSave: DEFAULT_SAVE,
      settings: DEFAULT_SETTINGS,
      currentMode: "endless" as GameMode,
      leaderboardCache: [] as LeaderboardEntry[],
      isLoading: false,
      showFpsCounter: false,
      _hasHydrated: false,

      // ── Actions ────────────────────────────────────────────────────────────
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      navigateTo: (screen: GameScreen) => set({ currentScreen: screen }),

      setPlayerProfile: (profile: PlayerProfile) =>
        set({ playerProfile: profile }),

      setGameSave: (save: GameSave) => set({ gameSave: save }),

      updateSettings: (partial: Partial<GameSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
          gameSave: state.gameSave
            ? { ...state.gameSave, settings: { ...state.settings, ...partial } }
            : state.gameSave,
        })),

      setCurrentMode: (mode: GameMode) => set({ currentMode: mode }),

      setLeaderboard: (entries: LeaderboardEntry[]) =>
        set({ leaderboardCache: entries }),

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      upgradeWeapon: (weapon: WeaponType) => {
        const state = get();
        const profile = state.playerProfile;
        if (!profile) return;
        const wUpgrades = profile.weapons.map((w) => {
          if (w.weapon !== weapon) return w;
          const newLevel = w.level + 1;
          const costKey = weapon;
          const _baseCost = WEAPON_STATS[costKey].upgradeCost;
          return {
            ...w,
            level: newLevel,
            damage: Math.round(w.damage * 1.25),
            fireRate: Math.round(w.fireRate * 0.9),
            unlocked: true,
          } satisfies WeaponUpgrade;
        });
        const updated: PlayerProfile = {
          ...profile,
          weapons: wUpgrades,
          totalCoins: profile.totalCoins - WEAPON_STATS[weapon].upgradeCost,
        };
        set({ playerProfile: updated });
      },
    }),
    {
      name: "galaxy-strike-x-save",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
