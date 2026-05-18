import type {
  Achievement,
  DailyMission,
  EnemyType,
  GameMode,
  GameSettings,
  PowerUpType,
  WeaponType,
} from "./types";

// ─── Canvas ────────────────────────────────────────────────────────────────────
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 800;
export const MOBILE_BREAKPOINT = 768;

// ─── Physics ──────────────────────────────────────────────────────────────────
export const PLAYER_SPEED = 280;
export const PLAYER_BOOST_SPEED = 520;
export const PLAYER_BOOST_DURATION = 600; // ms
export const PLAYER_BOOST_COOLDOWN = 3000; // ms
export const PLAYER_INVINCIBLE_DURATION = 1500; // ms
export const PLAYER_RADIUS = 18;
export const ENERGY_REGEN_RATE = 0.8; // per second
export const SHIELD_REGEN_RATE = 0.3; // per second
export const SHIELD_REGEN_DELAY = 4000; // ms before shield starts regenerating

// ─── Weapons ──────────────────────────────────────────────────────────────────
export interface WeaponStats {
  damage: number;
  fireRate: number; // ms between shots
  bulletSpeed: number;
  bulletRadius: number;
  color: string;
  glowColor: string;
  spread: number; // degrees
  bulletsPerShot: number;
  energyCost: number;
  homing: boolean;
  name: string;
  description: string;
  upgradeCost: number;
}

export const WEAPON_STATS: Record<WeaponType, WeaponStats> = {
  laser: {
    name: "Laser Gun",
    description: "Fast, precise energy beam",
    damage: 20,
    fireRate: 150,
    bulletSpeed: 650,
    bulletRadius: 3,
    color: "#00ffff",
    glowColor: "rgba(0,255,255,0.6)",
    spread: 0,
    bulletsPerShot: 1,
    energyCost: 2,
    homing: false,
    upgradeCost: 500,
  },
  plasma: {
    name: "Plasma Cannon",
    description: "Heavy charged plasma bolts",
    damage: 55,
    fireRate: 500,
    bulletSpeed: 420,
    bulletRadius: 7,
    color: "#aa00ff",
    glowColor: "rgba(170,0,255,0.7)",
    spread: 4,
    bulletsPerShot: 1,
    energyCost: 8,
    homing: false,
    upgradeCost: 1200,
  },
  missile: {
    name: "Missile Launcher",
    description: "Homing missiles with splash damage",
    damage: 80,
    fireRate: 900,
    bulletSpeed: 320,
    bulletRadius: 6,
    color: "#ff6600",
    glowColor: "rgba(255,102,0,0.7)",
    spread: 0,
    bulletsPerShot: 1,
    energyCost: 12,
    homing: true,
    upgradeCost: 2500,
  },
  electric: {
    name: "Electric Beam",
    description: "Chain lightning damages multiple enemies",
    damage: 35,
    fireRate: 300,
    bulletSpeed: 550,
    bulletRadius: 4,
    color: "#ffee00",
    glowColor: "rgba(255,238,0,0.6)",
    spread: 8,
    bulletsPerShot: 3,
    energyCost: 5,
    homing: false,
    upgradeCost: 1800,
  },
  rapidfire: {
    name: "Rapid Fire Gun",
    description: "Extremely fast low-damage bullets",
    damage: 12,
    fireRate: 75,
    bulletSpeed: 700,
    bulletRadius: 2.5,
    color: "#00ff88",
    glowColor: "rgba(0,255,136,0.5)",
    spread: 3,
    bulletsPerShot: 1,
    energyCost: 1,
    homing: false,
    upgradeCost: 3000,
  },
  ultimate: {
    name: "Ultimate Weapon",
    description: "Devastating super weapon - limited shots",
    damage: 500,
    fireRate: 2000,
    bulletSpeed: 800,
    bulletRadius: 14,
    color: "#ffffff",
    glowColor: "rgba(255,255,255,0.9)",
    spread: 0,
    bulletsPerShot: 1,
    energyCost: 50,
    homing: true,
    upgradeCost: 10000,
  },
};

// ─── Enemies ──────────────────────────────────────────────────────────────────
export interface EnemyStats {
  name: string;
  hp: number;
  speed: number;
  radius: number;
  fireRate: number;
  reward: number;
  xpReward: number;
  color: string;
  shieldHp: number;
  shootPattern: "straight" | "spread" | "spiral" | "homing" | "laser_beam";
  bulletDamage: number;
  pointsValue: number;
}

export const ENEMY_STATS: Record<EnemyType, EnemyStats> = {
  scout: {
    name: "Scout",
    hp: 30,
    speed: 160,
    radius: 12,
    fireRate: 2000,
    reward: 10,
    xpReward: 5,
    color: "#ff3366",
    shieldHp: 0,
    shootPattern: "straight",
    bulletDamage: 8,
    pointsValue: 100,
  },
  fighter: {
    name: "Fighter",
    hp: 80,
    speed: 120,
    radius: 16,
    fireRate: 1500,
    reward: 25,
    xpReward: 12,
    color: "#ff6600",
    shieldHp: 0,
    shootPattern: "spread",
    bulletDamage: 12,
    pointsValue: 250,
  },
  bomber: {
    name: "Bomber",
    hp: 150,
    speed: 70,
    radius: 22,
    fireRate: 3000,
    reward: 50,
    xpReward: 25,
    color: "#8800ff",
    shieldHp: 0,
    shootPattern: "spiral",
    bulletDamage: 20,
    pointsValue: 500,
  },
  drone: {
    name: "Drone",
    hp: 20,
    speed: 200,
    radius: 8,
    fireRate: 0,
    reward: 5,
    xpReward: 3,
    color: "#ff0088",
    shieldHp: 0,
    shootPattern: "straight",
    bulletDamage: 0,
    pointsValue: 50,
  },
  miniboss: {
    name: "Mini Boss",
    hp: 500,
    speed: 80,
    radius: 35,
    fireRate: 1200,
    reward: 200,
    xpReward: 100,
    color: "#ff4400",
    shieldHp: 100,
    shootPattern: "spread",
    bulletDamage: 25,
    pointsValue: 2000,
  },
  boss: {
    name: "Galaxy Destroyer",
    hp: 3000,
    speed: 50,
    radius: 60,
    fireRate: 800,
    reward: 1000,
    xpReward: 500,
    color: "#cc00ff",
    shieldHp: 500,
    shootPattern: "homing",
    bulletDamage: 40,
    pointsValue: 10000,
  },
};

// ─── Power-Ups ─────────────────────────────────────────────────────────────────
export interface PowerUpConfig {
  name: string;
  color: string;
  glowColor: string;
  duration: number; // ms (0 = instant)
  spawnWeight: number;
}

export const POWERUP_CONFIG: Record<PowerUpType, PowerUpConfig> = {
  health: {
    name: "Health Pack",
    color: "#ff4466",
    glowColor: "rgba(255,68,102,0.6)",
    duration: 0,
    spawnWeight: 25,
  },
  shield: {
    name: "Shield Boost",
    color: "#00aaff",
    glowColor: "rgba(0,170,255,0.6)",
    duration: 0,
    spawnWeight: 20,
  },
  energy: {
    name: "Energy Cell",
    color: "#00ffaa",
    glowColor: "rgba(0,255,170,0.6)",
    duration: 0,
    spawnWeight: 20,
  },
  double_damage: {
    name: "Double Damage",
    color: "#ff6600",
    glowColor: "rgba(255,102,0,0.6)",
    duration: 8000,
    spawnWeight: 10,
  },
  rapid_fire: {
    name: "Rapid Fire",
    color: "#ffff00",
    glowColor: "rgba(255,255,0,0.6)",
    duration: 6000,
    spawnWeight: 10,
  },
  invincibility: {
    name: "Invincible",
    color: "#ffffff",
    glowColor: "rgba(255,255,255,0.8)",
    duration: 5000,
    spawnWeight: 5,
  },
  coin_magnet: {
    name: "Coin Magnet",
    color: "#ffcc00",
    glowColor: "rgba(255,204,0,0.6)",
    duration: 10000,
    spawnWeight: 7,
  },
  nuke: {
    name: "Nuke",
    color: "#ff0000",
    glowColor: "rgba(255,0,0,0.8)",
    duration: 0,
    spawnWeight: 3,
  },
};

// ─── Particles ────────────────────────────────────────────────────────────────
export const PARTICLE_COUNTS: Record<string, Record<string, number>> = {
  low: {
    explosion_small: 6,
    explosion_large: 12,
    explosion_boss: 20,
    trail: 1,
    thruster: 2,
  },
  medium: {
    explosion_small: 12,
    explosion_large: 25,
    explosion_boss: 40,
    trail: 2,
    thruster: 4,
  },
  high: {
    explosion_small: 20,
    explosion_large: 40,
    explosion_boss: 80,
    trail: 3,
    thruster: 6,
  },
};

// ─── Scoring ──────────────────────────────────────────────────────────────────
export const COMBO_MULTIPLIER_MAX = 8;
export const COMBO_TIMEOUT = 2500; // ms
export const COMBO_THRESHOLDS = [2, 4, 6, 8, 10, 15, 20];

// ─── Wave System ──────────────────────────────────────────────────────────────
export const WAVE_COOLDOWN = 3000; // ms between waves
export const ENEMIES_PER_WAVE_BASE = 5;
export const ENEMIES_PER_WAVE_INCREMENT = 2;
export const BOSS_EVERY_N_WAVES = 5;
export const DIFFICULTY_SCALE_PER_WAVE = 0.08;

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_kill",
    title: "First Blood",
    description: "Destroy your first enemy",
    icon: "⚡",
    reward: 100,
    category: "combat",
    target: 1,
    secret: false,
  },
  {
    id: "kill_100",
    title: "Ace Pilot",
    description: "Destroy 100 enemies",
    icon: "🎯",
    reward: 500,
    category: "combat",
    target: 100,
    secret: false,
  },
  {
    id: "kill_1000",
    title: "Galaxy Destroyer",
    description: "Destroy 1,000 enemies",
    icon: "💀",
    reward: 2000,
    category: "combat",
    target: 1000,
    secret: false,
  },
  {
    id: "survive_10min",
    title: "Survivor",
    description: "Survive for 10 minutes",
    icon: "🛡️",
    reward: 800,
    category: "survival",
    target: 600,
    secret: false,
  },
  {
    id: "score_10k",
    title: "High Scorer",
    description: "Reach 10,000 points",
    icon: "⭐",
    reward: 1000,
    category: "progression",
    target: 10000,
    secret: false,
  },
  {
    id: "score_100k",
    title: "Legend",
    description: "Reach 100,000 points",
    icon: "🌟",
    reward: 5000,
    category: "progression",
    target: 100000,
    secret: false,
  },
  {
    id: "defeat_boss",
    title: "Boss Slayer",
    description: "Defeat your first boss",
    icon: "👑",
    reward: 2000,
    category: "combat",
    target: 1,
    secret: false,
  },
  {
    id: "defeat_10_bosses",
    title: "Boss Hunter",
    description: "Defeat 10 bosses",
    icon: "🏆",
    reward: 8000,
    category: "combat",
    target: 10,
    secret: false,
  },
  {
    id: "collect_100_coins",
    title: "Coin Collector",
    description: "Collect 100 coins",
    icon: "🪙",
    reward: 200,
    category: "collection",
    target: 100,
    secret: false,
  },
  {
    id: "perfect_wave",
    title: "Perfect Wave",
    description: "Complete a wave without taking damage",
    icon: "✨",
    reward: 1500,
    category: "special",
    target: 1,
    secret: false,
  },
  {
    id: "max_combo",
    title: "Combo Master",
    description: "Achieve a 20x combo",
    icon: "🔥",
    reward: 3000,
    category: "special",
    target: 20,
    secret: false,
  },
  {
    id: "unlock_ultimate",
    title: "Ultimate Power",
    description: "Unlock the ultimate weapon",
    icon: "☄️",
    reward: 5000,
    category: "progression",
    target: 1,
    secret: false,
  },
];

// ─── Default Settings ─────────────────────────────────────────────────────────
export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.4,
  sfxVolume: 0.6,
  quality: "high",
  vibration: true,
  showFps: false,
  screenShake: true,
  particleCount: "high",
  autoAim: false,
  language: "en",
};

// ─── Default Daily Missions ────────────────────────────────────────────────────
export function generateDailyMissions(): DailyMission[] {
  const tomorrow = Date.now() + 86400000;
  return [
    {
      id: "d_kills",
      title: "Enemy Purge",
      description: "Destroy 30 enemies",
      target: 30,
      progress: 0,
      reward: 500,
      completed: false,
      expiresAt: tomorrow,
    },
    {
      id: "d_score",
      title: "High Scorer",
      description: "Score 5,000 points",
      target: 5000,
      progress: 0,
      reward: 800,
      completed: false,
      expiresAt: tomorrow,
    },
    {
      id: "d_survive",
      title: "Endurance Test",
      description: "Survive 3 minutes",
      target: 180,
      progress: 0,
      reward: 600,
      completed: false,
      expiresAt: tomorrow,
    },
    {
      id: "d_boss",
      title: "Boss Buster",
      description: "Defeat 1 boss",
      target: 1,
      progress: 0,
      reward: 1500,
      completed: false,
      expiresAt: tomorrow,
    },
  ];
}

// ─── Game Modes ───────────────────────────────────────────────────────────────
export interface GameModeConfig {
  title: string;
  description: string;
  icon: string;
  difficultyMultiplier: number;
  scoreMultiplier: number;
  infiniteWaves: boolean;
  startWave: number;
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  story: {
    title: "Story Mode",
    description: "Experience the full campaign across 20 waves",
    icon: "📖",
    difficultyMultiplier: 1.0,
    scoreMultiplier: 1.0,
    infiniteWaves: false,
    startWave: 1,
  },
  endless: {
    title: "Endless Survival",
    description: "Survive as long as possible. Waves never stop",
    icon: "♾️",
    difficultyMultiplier: 1.2,
    scoreMultiplier: 1.5,
    infiniteWaves: true,
    startWave: 1,
  },
  boss_battle: {
    title: "Boss Battle",
    description: "Face continuous boss encounters",
    icon: "👹",
    difficultyMultiplier: 1.5,
    scoreMultiplier: 2.0,
    infiniteWaves: true,
    startWave: 5,
  },
  hardcore: {
    title: "Hardcore Mode",
    description: "One life, triple damage, maximum intensity",
    icon: "💀",
    difficultyMultiplier: 2.0,
    scoreMultiplier: 3.0,
    infiniteWaves: true,
    startWave: 1,
  },
};

// ─── UI Colors ────────────────────────────────────────────────────────────────
export const COLORS = {
  primary: "#00ffff",
  secondary: "#aa00ff",
  accent: "#00ff88",
  danger: "#ff3366",
  warning: "#ffaa00",
  gold: "#ffd700",
  white: "#ffffff",
  bgDark: "#02040a",
  bgPanel: "rgba(0,20,40,0.85)",
  hpBar: "#ff3366",
  shieldBar: "#00aaff",
  energyBar: "#00ff88",
};
