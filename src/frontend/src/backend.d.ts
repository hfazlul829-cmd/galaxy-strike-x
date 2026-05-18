import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    username: string;
    player: Principal;
    waveReached: bigint;
    score: bigint;
    timestamp: Timestamp;
    gameMode: GameMode;
}
export type Timestamp = bigint;
export interface SubmitScoreRequest {
    waveReached: bigint;
    score: bigint;
    gameMode: GameMode;
}
export interface AchievementStatus {
    achievementId: AchievementId;
    unlockedAt?: Timestamp;
    unlocked: boolean;
}
export interface PurchaseRecord {
    itemId: bigint;
    cost: bigint;
    timestamp: Timestamp;
    itemType: Variant_skin_powerup_weapon;
}
export interface PlayerProfile {
    username: string;
    lifetimeKills: bigint;
    totalXP: bigint;
    totalCoins: bigint;
    level: bigint;
}
export type WeaponLevels = Array<bigint>;
export type SkinId = bigint;
export type AchievementId = bigint;
export interface GameSave {
    weaponLevels: WeaponLevels;
    purchaseHistory: Array<PurchaseRecord>;
    lastSaved: Timestamp;
    unlockedSkins: Array<SkinId>;
}
export enum GameMode {
    endless = "endless",
    hardcore = "hardcore",
    story = "story",
    bossBattle = "bossBattle"
}
export enum Variant_skin_powerup_weapon {
    skin = "skin",
    powerup = "powerup",
    weapon = "weapon"
}
export interface backendInterface {
    getAchievements(): Promise<Array<AchievementStatus>>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getPlayerProfile(): Promise<PlayerProfile | null>;
    loadGameState(): Promise<GameSave>;
    saveGameState(weaponLevels: WeaponLevels, unlockedSkins: Array<SkinId>, purchaseHistory: Array<PurchaseRecord>): Promise<void>;
    submitScore(req: SubmitScoreRequest): Promise<void>;
    unlockAchievement(achievementId: AchievementId): Promise<boolean>;
    updatePlayerProfile(username: string | null, levelDelta: bigint | null, coinsDelta: bigint | null, xpDelta: bigint | null, killsDelta: bigint | null): Promise<boolean>;
}
