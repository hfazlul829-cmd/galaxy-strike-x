import type { backendInterface } from "../backend";
import {
  GameMode,
  Variant_skin_powerup_weapon,
} from "../backend";

export const mockBackend: backendInterface = {
  getAchievements: async () => [
    { achievementId: BigInt(1), unlocked: true, unlockedAt: BigInt(Date.now()) },
    { achievementId: BigInt(2), unlocked: false },
    { achievementId: BigInt(3), unlocked: true, unlockedAt: BigInt(Date.now() - 86400000) },
  ],

  getLeaderboard: async () => [
    {
      username: "StarFighter",
      player: { __principal__: "aaaaa-aa" } as any,
      waveReached: BigInt(42),
      score: BigInt(125000),
      timestamp: BigInt(Date.now()),
      gameMode: GameMode.endless,
    },
    {
      username: "NovaPilot",
      player: { __principal__: "bbbbb-bb" } as any,
      waveReached: BigInt(38),
      score: BigInt(98500),
      timestamp: BigInt(Date.now() - 3600000),
      gameMode: GameMode.story,
    },
    {
      username: "VoidHunter",
      player: { __principal__: "ccccc-cc" } as any,
      waveReached: BigInt(35),
      score: BigInt(87200),
      timestamp: BigInt(Date.now() - 7200000),
      gameMode: GameMode.hardcore,
    },
  ],

  getPlayerProfile: async () => ({
    username: "GalaxyStrikeX",
    lifetimeKills: BigInt(1337),
    totalXP: BigInt(45000),
    totalCoins: BigInt(2500),
    level: BigInt(12),
  }),

  loadGameState: async () => ({
    weaponLevels: [BigInt(3), BigInt(2), BigInt(1), BigInt(2), BigInt(1), BigInt(0)],
    purchaseHistory: [
      {
        itemId: BigInt(1),
        cost: BigInt(500),
        timestamp: BigInt(Date.now() - 86400000),
        itemType: Variant_skin_powerup_weapon.weapon,
      },
    ],
    lastSaved: BigInt(Date.now()),
    unlockedSkins: [BigInt(0), BigInt(1)],
  }),

  saveGameState: async () => undefined,

  submitScore: async () => undefined,

  unlockAchievement: async () => true,

  updatePlayerProfile: async () => true,
};
