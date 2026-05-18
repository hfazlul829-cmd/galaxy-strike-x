// ─── Enumerations ────────────────────────────────────────────────────────────

export type WeaponType =
  | "laser"
  | "plasma"
  | "missile"
  | "electric"
  | "rapidfire"
  | "ultimate";
export type EnemyType =
  | "scout"
  | "fighter"
  | "bomber"
  | "drone"
  | "miniboss"
  | "boss";
export type GameMode = "story" | "endless" | "boss_battle" | "hardcore";
export type GameScreen =
  | "menu"
  | "mode_select"
  | "game"
  | "pause"
  | "game_over"
  | "shop"
  | "leaderboard"
  | "achievements"
  | "settings";
export type PowerUpType =
  | "health"
  | "shield"
  | "energy"
  | "double_damage"
  | "rapid_fire"
  | "invincibility"
  | "coin_magnet"
  | "nuke";
export type ParticleType =
  | "explosion"
  | "bullet_trail"
  | "thruster"
  | "coin_sparkle"
  | "shield_absorb"
  | "star"
  | "debris";

// ─── Vector / Geometry ───────────────────────────────────────────────────────

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Game Entities ────────────────────────────────────────────────────────────

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  weapon: WeaponType;
  isPlayerBullet: boolean;
  radius: number;
  lifetime: number;
  maxLifetime: number;
  homing: boolean;
  homingTarget?: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  alphaDecay: number;
  lifetime: number;
  maxLifetime: number;
  type: ParticleType;
  gravity: number;
  rotation: number;
  rotationSpeed: number;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  radius: number;
  lifetime: number;
  pulsePhase: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  fireRate: number;
  lastFired: number;
  reward: number;
  xpReward: number;
  phase: number; // movement pattern phase
  phaseTimer: number;
  shieldHp: number;
  maxShieldHp: number;
  isEnraged: boolean;
  shootPattern: "straight" | "spread" | "spiral" | "homing" | "laser_beam";
  rotation: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  shieldHp: number;
  maxShieldHp: number;
  energy: number;
  maxEnergy: number;
  radius: number;
  speed: number;
  weapon: WeaponType;
  weapons: WeaponType[];
  lastFired: number;
  isBoosting: boolean;
  boostCooldown: number;
  invincible: boolean;
  invincibleTimer: number;
  rotation: number;
  thrusterPhase: number;
  skinIndex: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  comboCount: number;
  comboTimer: number;
  activeEffects: ActiveEffect[];
}

export interface ActiveEffect {
  type: PowerUpType;
  duration: number;
  maxDuration: number;
}

export interface TextEffect {
  id: string;
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  alpha: number;
  alphaDecay: number;
  fontSize: number;
}

// ─── Game State ────────────────────────────────────────────────────────────────

export interface GameSession {
  mode: GameMode;
  score: number;
  highScore: number;
  wave: number;
  level: number;
  coins: number;
  isRunning: boolean;
  isPaused: boolean;
  gameOver: boolean;
  victory: boolean;
  startTime: number;
  elapsed: number;
  lastTimestamp: number;
  frameCount: number;
  fps: number;
  difficulty: number; // 1.0 base, increases over time
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  powerUps: PowerUp[];
  textEffects: TextEffect[];
  waveTimer: number;
  waveCooldown: number;
  bossActive: boolean;
  currentBossId: string | null;
  killCount: number;
  shotsFired: number;
  shotsHit: number;
  comboMax: number;
}

// ─── Profile & Persistence ────────────────────────────────────────────────────

export interface WeaponUpgrade {
  weapon: WeaponType;
  level: number;
  damage: number;
  fireRate: number;
  unlocked: boolean;
}

export interface PlayerProfile {
  playerId: string;
  displayName: string;
  skinIndex: number;
  totalScore: number;
  totalCoins: number;
  totalKills: number;
  highScore: number;
  gamesPlayed: number;
  achievements: string[];
  weapons: WeaponUpgrade[];
  playerLevel: number;
  playerXp: number;
  createdAt: number;
  lastPlayed: number;
}

export interface GameSave {
  playerId: string;
  bestScores: Record<GameMode, number>;
  totalCoins: number;
  spentCoins: number;
  weaponUpgrades: WeaponUpgrade[];
  achievements: AchievementRecord[];
  dailyMissions: DailyMission[];
  settings: GameSettings;
  lastSaved: number;
}

export interface AchievementRecord {
  id: string;
  unlockedAt: number;
  progress: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  category: "combat" | "survival" | "collection" | "progression" | "special";
  target: number;
  secret: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  score: number;
  wave: number;
  mode: GameMode;
  timestamp: number;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  quality: "low" | "medium" | "high";
  vibration: boolean;
  showFps: boolean;
  screenShake: boolean;
  particleCount: "low" | "medium" | "high";
  autoAim: boolean;
  language: string;
}

// ─── Store State ───────────────────────────────────────────────────────────────

export interface GameStore {
  currentScreen: GameScreen;
  playerProfile: PlayerProfile | null;
  gameSave: GameSave | null;
  settings: GameSettings;
  currentMode: GameMode;
  leaderboardCache: LeaderboardEntry[];
  isLoading: boolean;
  showFpsCounter: boolean;
  // Actions
  navigateTo: (screen: GameScreen) => void;
  setPlayerProfile: (profile: PlayerProfile) => void;
  setGameSave: (save: GameSave) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setCurrentMode: (mode: GameMode) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setIsLoading: (loading: boolean) => void;
  upgradeWeapon: (weapon: WeaponType) => void;
}
