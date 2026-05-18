import { useCallback, useEffect, useRef, useState } from "react";
import { audioEngine } from "../game/audioEngine";
import {
  BOSS_EVERY_N_WAVES,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  COMBO_MULTIPLIER_MAX,
  COMBO_TIMEOUT,
  DIFFICULTY_SCALE_PER_WAVE,
  ENEMIES_PER_WAVE_BASE,
  ENEMIES_PER_WAVE_INCREMENT,
  ENEMY_STATS,
  GAME_MODES,
  PARTICLE_COUNTS,
  PLAYER_BOOST_COOLDOWN,
  PLAYER_BOOST_DURATION,
  PLAYER_BOOST_SPEED,
  PLAYER_INVINCIBLE_DURATION,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  POWERUP_CONFIG,
  WAVE_COOLDOWN,
  WEAPON_STATS,
} from "../game/constants";
import { InputManager } from "../game/inputManager";
import { ParticleSystem } from "../game/particleSystem";
import { Renderer } from "../game/renderer";
import type {
  Bullet,
  Enemy,
  EnemyType,
  GameSession,
  Player,
  PowerUp,
  TextEffect,
} from "../game/types";
import { useGameStore } from "../store/gameStore";

// ─── ID Generator ───────────────────────────────────────────────────────────
let _uid = 0;
const uid = () => `e${++_uid}`;

// ─── Player Factory ──────────────────────────────────────────────────────────
function createPlayer(
  profile: {
    skinIndex: number;
    weapons: Array<{ weapon: string; unlocked: boolean }>;
  } | null,
): Player {
  const unlockedWeapons = profile?.weapons
    .filter((w) => w.unlocked)
    .map((w) => w.weapon as Player["weapon"]) ?? ["laser"];
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT * 0.8,
    vx: 0,
    vy: 0,
    hp: 100,
    maxHp: 100,
    shieldHp: 50,
    maxShieldHp: 50,
    energy: 100,
    maxEnergy: 100,
    radius: PLAYER_RADIUS,
    speed: PLAYER_SPEED,
    weapon: "laser",
    weapons: unlockedWeapons.length > 0 ? unlockedWeapons : ["laser"],
    lastFired: 0,
    isBoosting: false,
    boostCooldown: 0,
    invincible: false,
    invincibleTimer: 0,
    rotation: 0,
    thrusterPhase: 0,
    skinIndex: profile?.skinIndex ?? 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    coins: 0,
    comboCount: 0,
    comboTimer: 0,
    activeEffects: [],
  };
}

// ─── Enemy Factory ──────────────────────────────────────────────────────────
function spawnEnemy(type: EnemyType, wave: number, difficulty: number): Enemy {
  const stats = ENEMY_STATS[type];
  const x = 40 + Math.random() * (CANVAS_WIDTH - 80);
  return {
    id: uid(),
    type,
    x,
    y: -stats.radius - 10,
    vx: (Math.random() - 0.5) * 40,
    vy: 0,
    hp: Math.round(stats.hp * difficulty),
    maxHp: Math.round(stats.hp * difficulty),
    radius: stats.radius,
    speed: stats.speed * (1 + wave * 0.02),
    fireRate: stats.fireRate,
    lastFired: 0,
    reward: stats.reward,
    xpReward: stats.xpReward,
    phase: 0,
    phaseTimer: 0,
    shieldHp: Math.round(
      stats.shieldHp * (difficulty > 1.5 ? difficulty * 0.5 : 1),
    ),
    maxShieldHp: Math.round(
      stats.shieldHp * (difficulty > 1.5 ? difficulty * 0.5 : 1),
    ),
    isEnraged: false,
    shootPattern: stats.shootPattern,
    rotation: 0,
  };
}

// ─── Wave Generator ─────────────────────────────────────────────────────────
function generateWave(wave: number, mode: string, difficulty: number): Enemy[] {
  const enemies: Enemy[] = [];
  const isBossWave = wave % BOSS_EVERY_N_WAVES === 0;

  if (mode === "boss_battle" || isBossWave) {
    enemies.push(spawnEnemy("boss", wave, difficulty));
    if (wave > 5) {
      enemies.push(spawnEnemy("miniboss", wave, difficulty * 0.7));
    }
    return enemies;
  }

  const count = ENEMIES_PER_WAVE_BASE + wave * ENEMIES_PER_WAVE_INCREMENT;
  const types: EnemyType[] =
    wave < 3
      ? ["scout"]
      : wave < 6
        ? ["scout", "fighter"]
        : wave < 10
          ? ["scout", "fighter", "drone"]
          : ["scout", "fighter", "bomber", "drone"];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    enemies.push(spawnEnemy(type, wave, difficulty));
  }

  if (wave >= 5 && wave % 3 === 0) {
    enemies.push(spawnEnemy("miniboss", wave, difficulty * 0.8));
  }

  return enemies;
}

// ─── GameCanvas Component ──────────────────────────────────────────────────
export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<GameSession | null>(null);
  const playerRef = useRef<Player | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const inputRef = useRef<InputManager | null>(null);
  const rafRef = useRef<number>(0);
  const shieldRegenTimerRef = useRef(0);
  const waveAnnouncerRef = useRef({ alpha: 0, timer: 0 });
  const bossWarningRef = useRef({ alpha: 0, timer: 0 });

  const navigateTo = useGameStore((s) => s.navigateTo);
  const currentMode = useGameStore((s) => s.currentMode);
  const settings = useGameStore((s) => s.settings);
  const profile = useGameStore((s) => s.playerProfile);
  const _screen = useGameStore((s) => s.currentScreen);

  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(0);

  // ─── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const modeConfig = GAME_MODES[currentMode];
    const player = createPlayer(profile);
    playerRef.current = player;

    const session: GameSession = {
      mode: currentMode,
      score: 0,
      highScore: 0,
      wave: modeConfig.startWave,
      level: 1,
      coins: 0,
      isRunning: true,
      isPaused: false,
      gameOver: false,
      victory: false,
      startTime: performance.now(),
      elapsed: 0,
      lastTimestamp: performance.now(),
      frameCount: 0,
      fps: 60,
      difficulty: modeConfig.difficultyMultiplier,
      enemies: [],
      bullets: [],
      particles: [],
      powerUps: [],
      textEffects: [],
      waveTimer: 0,
      waveCooldown: WAVE_COOLDOWN,
      bossActive: false,
      currentBossId: null,
      killCount: 0,
      shotsFired: 0,
      shotsHit: 0,
      comboMax: 0,
    };
    sessionRef.current = session;

    const renderer = new Renderer(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    rendererRef.current = renderer;
    const particles = new ParticleSystem();
    particlesRef.current = particles;
    const input = new InputManager();
    input.attach(canvas);
    inputRef.current = input;

    // Spawn first wave immediately
    spawnWave(session, currentMode);
    waveAnnouncerRef.current = { alpha: 1, timer: 2500 };

    audioEngine.playMusic("battle");

    return () => {
      cancelAnimationFrame(rafRef.current);
      input.detach();
      audioEngine.stopMusic();
    };
  }, [currentMode, profile]);

  const spawnWave = useCallback((session: GameSession, mode: string): void => {
    const newEnemies = generateWave(session.wave, mode, session.difficulty);
    const isBossWave = newEnemies.some((e) => e.type === "boss");
    // Stagger entry positions
    for (let i = 0; i < newEnemies.length; i++) {
      newEnemies[i].y = -newEnemies[i].radius - 20 - i * 25;
      newEnemies[i].x = 40 + (i % 7) * ((CANVAS_WIDTH - 80) / 6);
    }
    session.enemies.push(...newEnemies);
    if (isBossWave) {
      session.bossActive = true;
      session.currentBossId =
        newEnemies.find((e) => e.type === "boss")?.id ?? null;
      bossWarningRef.current = { alpha: 1, timer: 2000 };
      audioEngine.playMusic("boss");
    }
  }, []);

  // ─── Game Loop ─────────────────────────────────────────────────────────────
  const gameLoop = useCallback(
    (timestamp: number) => {
      const session = sessionRef.current;
      const player = playerRef.current;
      const renderer = rendererRef.current;
      const particles = particlesRef.current;
      const input = inputRef.current;
      const canvas = canvasRef.current;
      if (!session || !player || !renderer || !particles || !input || !canvas)
        return;
      if (session.gameOver || session.isPaused) return;

      const raw_dt = timestamp - session.lastTimestamp;
      const dt = Math.min(raw_dt, 50); // cap at 50ms (20fps minimum) to avoid death spiral
      session.lastTimestamp = timestamp;
      session.elapsed += dt;
      session.frameCount++;
      if (session.frameCount % 20 === 0) session.fps = 1000 / (raw_dt || 16);

      // ── Input ──────────────────────────────────────────────────────────────────
      const inp = input.getState();

      // Pause via ESC
      if (inp.pause) {
        togglePause();
        return;
      }

      // Weapon select
      if (inp.weapon1 && player.weapons[0]) player.weapon = player.weapons[0];
      if (inp.weapon2 && player.weapons[1]) player.weapon = player.weapons[1];
      if (inp.weapon3 && player.weapons[2]) player.weapon = player.weapons[2];
      if (inp.weapon4 && player.weapons[3]) player.weapon = player.weapons[3];

      // ── Player Movement ────────────────────────────────────────────────────────
      if (player.boostCooldown > 0)
        player.boostCooldown = Math.max(0, player.boostCooldown - dt);
      if (player.invincibleTimer > 0) {
        player.invincibleTimer -= dt;
        if (player.invincibleTimer <= 0) player.invincible = false;
      }

      if (inp.boost && player.boostCooldown === 0 && !player.isBoosting) {
        player.isBoosting = true;
        player.boostCooldown = PLAYER_BOOST_COOLDOWN;
        setTimeout(() => {
          if (playerRef.current) playerRef.current.isBoosting = false;
        }, PLAYER_BOOST_DURATION);
        audioEngine.playSFX("boost_start");
      }

      const speed = player.isBoosting ? PLAYER_BOOST_SPEED : PLAYER_SPEED;
      const dtSec = dt / 1000;

      // Joystick or keyboard movement
      if (inp.joystickActive && inp.joystickMagnitude > 0) {
        player.vx = Math.cos(inp.joystickAngle) * speed * inp.joystickMagnitude;
        player.vy = Math.sin(inp.joystickAngle) * speed * inp.joystickMagnitude;
      } else {
        player.vx = 0;
        player.vy = 0;
        if (inp.left) player.vx -= speed;
        if (inp.right) player.vx += speed;
        if (inp.up) player.vy -= speed;
        if (inp.down) player.vy += speed;
        // Normalize diagonal
        const mag = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (mag > speed) {
          player.vx = (player.vx / mag) * speed;
          player.vy = (player.vy / mag) * speed;
        }
      }

      player.x = Math.max(
        player.radius,
        Math.min(CANVAS_WIDTH - player.radius, player.x + player.vx * dtSec),
      );
      player.y = Math.max(
        player.radius,
        Math.min(CANVAS_HEIGHT - player.radius, player.y + player.vy * dtSec),
      );

      // Aim / rotation toward mouse or aim direction
      if (inp.aimActive) {
        const dx = inp.aimX - player.x;
        const dy = inp.aimY - player.y;
        player.rotation = Math.atan2(dy, dx) + Math.PI / 2;
      } else {
        // Rotate toward movement
        if (player.vx !== 0 || player.vy !== 0) {
          const targetRot = Math.atan2(player.vy, player.vx) + Math.PI / 2;
          const diff =
            ((targetRot - player.rotation + Math.PI * 3) % (Math.PI * 2)) -
            Math.PI;
          player.rotation += diff * 0.15;
        }
      }

      player.thrusterPhase += dtSec * 8;
      particles.emitThruster(
        player.x + Math.sin(player.rotation) * player.radius * 0.6,
        player.y - Math.cos(player.rotation) * player.radius * 0.6,
        player.rotation,
        player.isBoosting,
      );

      // ── Energy & Shield Regen ────────────────────────────────────────────────
      player.energy = Math.min(player.maxEnergy, player.energy + 0.8 * dtSec);
      shieldRegenTimerRef.current = Math.max(
        0,
        shieldRegenTimerRef.current - dt,
      );
      if (shieldRegenTimerRef.current === 0) {
        player.shieldHp = Math.min(
          player.maxShieldHp,
          player.shieldHp + 0.3 * dtSec,
        );
      }

      // Combo decay
      if (player.comboCount > 0) {
        player.comboTimer -= dt;
        if (player.comboTimer <= 0) {
          player.comboCount = 0;
          player.comboTimer = 0;
        }
      }

      // Active effects
      for (let i = player.activeEffects.length - 1; i >= 0; i--) {
        player.activeEffects[i].duration -= dt;
        if (player.activeEffects[i].duration <= 0)
          player.activeEffects.splice(i, 1);
      }

      // ── Shooting ──────────────────────────────────────────────────────────────
      if (inp.shoot) {
        const wstats = WEAPON_STATS[player.weapon];
        const rapidEffect = player.activeEffects.find(
          (e) => e.type === "rapid_fire",
        );
        const effectiveFireRate = rapidEffect
          ? wstats.fireRate * 0.5
          : wstats.fireRate;
        const now = session.elapsed;

        if (
          now - player.lastFired >= effectiveFireRate &&
          player.energy >= wstats.energyCost
        ) {
          player.lastFired = now;
          player.energy -= wstats.energyCost;
          session.shotsFired++;

          for (let s = 0; s < wstats.bulletsPerShot; s++) {
            const spreadRad =
              wstats.spread *
              (Math.PI / 180) *
              (s - (wstats.bulletsPerShot - 1) / 2);
            const baseAngle = player.rotation - Math.PI / 2; // upward by default
            const angle = baseAngle + spreadRad;
            const dmgMultiplier = player.activeEffects.find(
              (e) => e.type === "double_damage",
            )
              ? 2
              : 1;

            session.bullets.push({
              id: uid(),
              x: player.x,
              y: player.y,
              vx: Math.cos(angle) * wstats.bulletSpeed,
              vy: Math.sin(angle) * wstats.bulletSpeed,
              damage: wstats.damage * dmgMultiplier,
              weapon: player.weapon,
              isPlayerBullet: true,
              radius: wstats.bulletRadius,
              lifetime: 0,
              maxLifetime: 2000,
              homing: wstats.homing,
            });
          }
          audioEngine.playSFX(
            `${player.weapon}_fire` as Parameters<
              typeof audioEngine.playSFX
            >[0],
          );
        }
      }

      // ── Update Bullets ───────────────────────────────────────────────────────
      for (let i = session.bullets.length - 1; i >= 0; i--) {
        const b = session.bullets[i];
        b.lifetime += dt;
        // Homing
        if (b.homing && b.isPlayerBullet && session.enemies.length > 0) {
          const nearest = session.enemies.reduce((best, e) => {
            const dx = e.x - b.x;
            const dy = e.y - b.y;
            const d = dx * dx + dy * dy;
            const bd = (best.x - b.x) ** 2 + (best.y - b.y) ** 2;
            return d < bd ? e : best;
          });
          const dx = nearest.x - b.x;
          const dy = nearest.y - b.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          b.vx += (dx / len) * 800 * dtSec;
          b.vy += (dy / len) * 800 * dtSec;
          const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          const wSpd = WEAPON_STATS[b.weapon].bulletSpeed;
          if (spd > wSpd) {
            b.vx = (b.vx / spd) * wSpd;
            b.vy = (b.vy / spd) * wSpd;
          }
        }
        b.x += b.vx * dtSec;
        b.y += b.vy * dtSec;
        const pCount = PARTICLE_COUNTS[settings.particleCount];
        if (b.isPlayerBullet)
          particles.emitBulletTrail(
            b.x,
            b.y,
            WEAPON_STATS[b.weapon].color,
            pCount.trail,
          );

        if (
          b.lifetime >= b.maxLifetime ||
          b.x < -50 ||
          b.x > CANVAS_WIDTH + 50 ||
          b.y < -200 ||
          b.y > CANVAS_HEIGHT + 50
        ) {
          session.bullets.splice(i, 1);
        }
      }

      // ── Update Enemies ────────────────────────────────────────────────────────
      for (let i = session.enemies.length - 1; i >= 0; i--) {
        const e = session.enemies[i];
        e.phaseTimer += dt;
        e.rotation +=
          dtSec * (e.type === "miniboss" ? 1.5 : e.type === "boss" ? 0.8 : 0.3);

        // Movement patterns
        const phaseFreq =
          e.type === "scout" ? 0.002 : e.type === "bomber" ? 0.001 : 0.0015;
        switch (e.type) {
          case "scout":
            e.x +=
              Math.sin(e.phaseTimer * phaseFreq * 3) * e.speed * dtSec * 1.5;
            e.y += e.speed * dtSec;
            break;
          case "fighter":
            e.x += Math.sin(e.phaseTimer * 0.002) * e.speed * dtSec;
            e.y += e.speed * dtSec * 0.7;
            // Circle when low
            if (e.y > CANVAS_HEIGHT * 0.3)
              e.y += Math.cos(e.phaseTimer * 0.001) * 20 * dtSec;
            break;
          case "bomber":
            e.y += e.speed * dtSec * 0.5;
            e.x += Math.sin(e.phaseTimer * 0.001) * e.speed * dtSec * 0.8;
            break;
          case "drone":
            e.x += Math.cos(e.phaseTimer * 0.003) * e.speed * dtSec * 2;
            e.y += e.speed * dtSec * 1.5;
            break;
          case "miniboss": {
            const targetX =
              CANVAS_WIDTH / 2 +
              Math.sin(e.phaseTimer * 0.001) * (CANVAS_WIDTH * 0.35);
            e.x += (targetX - e.x) * 0.02;
            if (e.y < 120) e.y += e.speed * dtSec;
            break;
          }
          case "boss": {
            const btx =
              CANVAS_WIDTH / 2 +
              Math.sin(e.phaseTimer * 0.0008) * (CANVAS_WIDTH * 0.3);
            e.x += (btx - e.x) * 0.012;
            if (e.y < 100) e.y += e.speed * dtSec;
            if (!e.isEnraged && e.hp < e.maxHp * 0.35) {
              e.isEnraged = true;
              e.speed *= 1.5;
              e.fireRate = Math.round(e.fireRate * 0.6);
              addTextEffect(
                "BOSS ENRAGED!",
                CANVAS_WIDTH / 2,
                CANVAS_HEIGHT / 2 - 40,
                COLORS.danger,
                22,
                session,
              );
            }
            break;
          }
        }

        // Keep in bounds horizontally
        e.x = Math.max(e.radius, Math.min(CANVAS_WIDTH - e.radius, e.x));

        // Enemy shooting
        if (e.fireRate > 0 && session.elapsed - e.lastFired >= e.fireRate) {
          e.lastFired = session.elapsed;
          spawnEnemyBullets(e, session);
        }

        // Remove off-screen enemies that didn't get killed
        if (e.y > CANVAS_HEIGHT + e.radius + 20) {
          session.enemies.splice(i, 1);
        }
      }

      // ── Bullet vs Enemy collision ─────────────────────────────────────────────
      for (let bi = session.bullets.length - 1; bi >= 0; bi--) {
        const b = session.bullets[bi];
        if (!b.isPlayerBullet) continue;
        for (let ei = session.enemies.length - 1; ei >= 0; ei--) {
          const e = session.enemies[ei];
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > b.radius + e.radius) continue;

          // Hit
          session.bullets.splice(bi, 1);
          session.shotsHit++;

          if (e.shieldHp > 0) {
            e.shieldHp = Math.max(0, e.shieldHp - b.damage * 0.5);
            particles.emitShieldAbsorb(e.x, e.y, b.x, b.y);
            audioEngine.playSFX("shield_hit");
          } else {
            e.hp -= b.damage;
            particles.emitBulletTrail(
              b.x,
              b.y,
              WEAPON_STATS[b.weapon].color,
              4,
            );
            if (e.hp <= 0) {
              killEnemy(e, session, particles);
              session.enemies.splice(ei, 1);
            }
          }
          break;
        }
      }

      // ── Enemy bullet vs player ────────────────────────────────────────────────
      for (let bi = session.bullets.length - 1; bi >= 0; bi--) {
        const b = session.bullets[bi];
        if (b.isPlayerBullet) continue;
        const dx = b.x - player.x;
        const dy = b.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > b.radius + player.radius) continue;

        session.bullets.splice(bi, 1);
        if (player.invincible) continue;

        if (player.shieldHp > 0) {
          const absorbed = Math.min(player.shieldHp, b.damage);
          player.shieldHp -= absorbed;
          const remaining = b.damage - absorbed;
          if (remaining > 0) player.hp -= remaining;
          particles.emitShieldAbsorb(player.x, player.y, b.x, b.y);
          audioEngine.playSFX("shield_hit");
          shieldRegenTimerRef.current = 4000;
        } else {
          player.hp -= b.damage * (currentMode === "hardcore" ? 2 : 1);
          player.invincible = true;
          player.invincibleTimer = PLAYER_INVINCIBLE_DURATION;
          particles.emitExplosion(
            player.x,
            player.y,
            8,
            [COLORS.danger, "#ffffff"],
            0.6,
          );
          if (settings.screenShake) renderer.triggerShake(5, 200);
          audioEngine.playSFX("explosion_small");
          shieldRegenTimerRef.current = 4000;
        }

        if (player.hp <= 0) {
          triggerGameOver(session, player);
          return;
        }
      }

      // ── Power-up collection ──────────────────────────────────────────────────
      const coinMagnet = player.activeEffects.some(
        (e) => e.type === "coin_magnet",
      );
      for (let i = session.powerUps.length - 1; i >= 0; i--) {
        const pu = session.powerUps[i];
        pu.y += pu.vy;
        pu.lifetime++;
        pu.pulsePhase += 0.06;

        if (coinMagnet) {
          const dx = player.x - pu.x;
          const dy = player.y - pu.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 200) {
            pu.x += (dx / d) * 5;
            pu.y += (dy / d) * 5;
          }
        }

        const dx = pu.x - player.x;
        const dy = pu.y - player.y;
        if (Math.sqrt(dx * dx + dy * dy) < pu.radius + player.radius + 6) {
          applyPowerUp(pu, player, session, particles);
          session.powerUps.splice(i, 1);
        } else if (pu.y > CANVAS_HEIGHT + 30 || pu.lifetime > 600) {
          session.powerUps.splice(i, 1);
        }
      }

      // ── Text Effects ─────────────────────────────────────────────────────────────
      for (let i = session.textEffects.length - 1; i >= 0; i--) {
        const te = session.textEffects[i];
        te.y += te.vy * dtSec;
        te.alpha -= te.alphaDecay * dtSec;
        if (te.alpha <= 0) session.textEffects.splice(i, 1);
      }

      // ── Wave Management ──────────────────────────────────────────────────────
      if (session.enemies.length === 0 && !session.bossActive) {
        session.waveTimer += dt;
        if (session.waveTimer >= session.waveCooldown) {
          session.waveTimer = 0;
          session.wave++;
          session.difficulty += DIFFICULTY_SCALE_PER_WAVE;
          spawnWave(session, currentMode);
          waveAnnouncerRef.current = { alpha: 1, timer: 2500 };
          addTextEffect(
            `WAVE ${session.wave} CLEAR!`,
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
            COLORS.accent,
            20,
            session,
          );
          audioEngine.playSFX("level_up");
        }
      }

      // Clear boss flag if boss is dead
      if (
        session.bossActive &&
        !session.enemies.some((e) => e.type === "boss")
      ) {
        session.bossActive = false;
        session.currentBossId = null;
        audioEngine.playMusic("battle");
      }

      // Check story mode win condition
      if (
        currentMode === "story" &&
        session.wave > 20 &&
        session.enemies.length === 0
      ) {
        session.victory = true;
        triggerVictory(session);
        return;
      }

      // ── Particles ───────────────────────────────────────────────────────────────
      particles.update(dt);
      renderer.updateShake(dt);

      // ── Announcer fade ───────────────────────────────────────────────────────────
      const wa = waveAnnouncerRef.current;
      if (wa.timer > 0) {
        wa.timer -= dt;
        if (wa.timer < 600) wa.alpha = wa.timer / 600;
      }
      const bw = bossWarningRef.current;
      if (bw.timer > 0) {
        bw.timer -= dt;
        if (bw.timer < 600) bw.alpha = bw.timer / 600;
      }

      // ── Render ──────────────────────────────────────────────────────────────────
      renderer.beginFrame();
      renderer.drawBackground(dt);
      renderer.drawParticles(particles.getActive());
      for (const pu of session.powerUps) renderer.drawPowerUp(pu);
      for (const e of session.enemies) renderer.drawEnemy(e);
      for (const b of session.bullets)
        renderer.drawBullet(b.x, b.y, b.weapon, b.radius, b.isPlayerBullet);
      renderer.drawPlayer(player);
      renderer.drawTextEffects(session.textEffects);
      renderer.drawHUD(session, player);
      if (wa.timer > 0) renderer.drawWaveAnnouncement(session.wave, wa.alpha);
      if (bw.timer > 0) renderer.drawBossWarning(bw.alpha);
      renderer.endFrame();

      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [currentMode, settings, spawnWave],
  );

  // ─── Start Loop ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (sessionRef.current && !isPaused && !isGameOver) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop, isPaused, isGameOver]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function addTextEffect(
    text: string,
    x: number,
    y: number,
    color: string,
    size: number,
    session: GameSession,
  ): void {
    session.textEffects.push({
      id: uid(),
      x,
      y,
      vy: -50,
      text,
      color,
      alpha: 1,
      alphaDecay: 0.8,
      fontSize: size,
    });
  }

  function killEnemy(
    e: Enemy,
    session: GameSession,
    particles: ParticleSystem,
  ): void {
    session.killCount++;
    const modeMultiplier = GAME_MODES[currentMode].scoreMultiplier;
    const comboBonus = Math.min(COMBO_MULTIPLIER_MAX, player_comboMultiplier());
    const pts = Math.round(
      ENEMY_STATS[e.type].pointsValue *
        modeMultiplier *
        comboBonus *
        session.difficulty,
    );
    session.score += pts;

    const player = playerRef.current;
    if (player) {
      player.coins += e.reward;
      player.xp += e.xpReward;
      player.comboCount++;
      player.comboTimer = COMBO_TIMEOUT;
      if (player.xp >= player.xpToNextLevel) {
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.5);
        player.maxHp += 10;
        player.hp = Math.min(player.maxHp, player.hp + 25);
        audioEngine.playSFX("level_up");
        addTextEffect("LEVEL UP!", e.x, e.y - 30, COLORS.accent, 18, session);
      }
    }

    addTextEffect(
      `+${pts}`,
      e.x,
      e.y - 10,
      e.type === "boss" ? COLORS.gold : COLORS.primary,
      e.type === "boss" ? 20 : 14,
      session,
    );

    const pCount = PARTICLE_COUNTS[settings.particleCount];
    const colors = [ENEMY_STATS[e.type].color, "#ff8800", "#ffffff"];
    if (e.type === "boss" || e.type === "miniboss") {
      particles.emitBigExplosion(e.x, e.y, pCount.explosion_boss, colors);
      rendererRef.current?.triggerShake(
        e.type === "boss" ? 18 : 10,
        e.type === "boss" ? 600 : 400,
      );
      audioEngine.playSFX(
        e.type === "boss" ? "explosion_boss" : "explosion_large",
      );
    } else {
      particles.emitExplosion(e.x, e.y, pCount.explosion_small, colors);
      audioEngine.playSFX("explosion_small");
    }

    // Power-up drop chance
    const dropChance =
      e.type === "boss"
        ? 1
        : e.type === "miniboss"
          ? 0.7
          : e.type === "drone"
            ? 0.05
            : 0.15;
    if (Math.random() < dropChance) {
      spawnPowerUp(e.x, e.y, session);
    }
  }

  function player_comboMultiplier(): number {
    const count = playerRef.current?.comboCount ?? 0;
    if (count < 2) return 1;
    if (count < 5) return 1.5;
    if (count < 10) return 2;
    if (count < 20) return 3;
    return COMBO_MULTIPLIER_MAX;
  }

  function spawnPowerUp(x: number, y: number, session: GameSession): void {
    const types = Object.keys(POWERUP_CONFIG) as Array<
      keyof typeof POWERUP_CONFIG
    >;
    const weights = types.map((t) => POWERUP_CONFIG[t].spawnWeight);
    const total = weights.reduce((a, b) => a + b, 0);
    let rnd = Math.random() * total;
    let chosen = types[0];
    for (let i = 0; i < types.length; i++) {
      rnd -= weights[i];
      if (rnd <= 0) {
        chosen = types[i];
        break;
      }
    }
    session.powerUps.push({
      id: uid(),
      x,
      y,
      vy: 1.5,
      type: chosen,
      radius: 14,
      lifetime: 0,
      pulsePhase: Math.random() * Math.PI * 2,
    });
  }

  function applyPowerUp(
    pu: PowerUp,
    player: Player,
    session: GameSession,
    particles: ParticleSystem,
  ): void {
    const cfg = POWERUP_CONFIG[pu.type];
    audioEngine.playSFX("powerup_collect");
    particles.emitCoinSparkle(pu.x, pu.y);
    switch (pu.type) {
      case "health":
        player.hp = Math.min(player.maxHp, player.hp + 30);
        break;
      case "shield":
        player.shieldHp = Math.min(player.maxShieldHp, player.shieldHp + 30);
        break;
      case "energy":
        player.energy = Math.min(player.maxEnergy, player.energy + 50);
        break;
      case "nuke":
        for (const e of session.enemies) {
          killEnemy(e, session, particles);
        }
        session.enemies.length = 0;
        particles.emitScreenFlash(CANVAS_WIDTH, CANVAS_HEIGHT, "#ffffff");
        rendererRef.current?.triggerShake(20, 800);
        audioEngine.playSFX("explosion_boss");
        break;
      default:
        if (cfg.duration > 0) {
          const existing = player.activeEffects.findIndex(
            (e) => e.type === pu.type,
          );
          if (existing >= 0)
            player.activeEffects[existing].duration = cfg.duration;
          else
            player.activeEffects.push({
              type: pu.type,
              duration: cfg.duration,
              maxDuration: cfg.duration,
            });
        }
    }
    addTextEffect(
      cfg.name.toUpperCase(),
      pu.x,
      pu.y - 20,
      cfg.color,
      14,
      session,
    );
  }

  function spawnEnemyBullets(e: Enemy, session: GameSession): void {
    const stats = ENEMY_STATS[e.type];
    if (stats.bulletDamage <= 0) return;
    const spd = 220 + session.wave * 4;
    const toPlayerX = (playerRef.current?.x ?? CANVAS_WIDTH / 2) - e.x;
    const toPlayerY = (playerRef.current?.y ?? CANVAS_HEIGHT * 0.8) - e.y;
    const len = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY) || 1;
    const base: Omit<Bullet, "id" | "vx" | "vy" | "homing"> = {
      x: e.x,
      y: e.y,
      damage: stats.bulletDamage * session.difficulty,
      weapon: "laser",
      isPlayerBullet: false,
      radius: 4,
      lifetime: 0,
      maxLifetime: 2500,
    };
    switch (e.shootPattern) {
      case "straight":
        session.bullets.push({
          ...base,
          id: uid(),
          vx: (toPlayerX / len) * spd,
          vy: (toPlayerY / len) * spd,
          homing: false,
        });
        break;
      case "spread":
        for (let i = -1; i <= 1; i++) {
          const ang = Math.atan2(toPlayerY, toPlayerX) + i * 0.35;
          session.bullets.push({
            ...base,
            id: uid(),
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            homing: false,
          });
        }
        break;
      case "spiral":
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + e.phaseTimer * 0.002;
          session.bullets.push({
            ...base,
            id: uid(),
            vx: Math.cos(ang) * spd * 0.6,
            vy: Math.sin(ang) * spd * 0.6,
            homing: false,
          });
        }
        break;
      case "homing":
        session.bullets.push({
          ...base,
          id: uid(),
          vx: (toPlayerX / len) * spd * 0.8,
          vy: (toPlayerY / len) * spd * 0.8,
          homing: true,
        });
        break;
    }
  }

  function togglePause(): void {
    const session = sessionRef.current;
    if (!session) return;
    session.isPaused = !session.isPaused;
    setIsPaused(session.isPaused);
    if (session.isPaused) {
      audioEngine.stopMusic();
      cancelAnimationFrame(rafRef.current);
    } else {
      audioEngine.playMusic(session.bossActive ? "boss" : "battle");
      session.lastTimestamp = performance.now();
    }
  }

  function triggerGameOver(session: GameSession, player: Player): void {
    session.gameOver = true;
    cancelAnimationFrame(rafRef.current);
    particlesRef.current?.emitBigExplosion(player.x, player.y, 50, [
      COLORS.danger,
      "#ff8800",
      "#ffffff",
    ]);
    rendererRef.current?.triggerShake(20, 1000);
    audioEngine.playSFX("player_death");
    audioEngine.stopMusic();
    setTimeout(() => {
      audioEngine.playMusic("gameover");
    }, 500);
    setFinalScore(session.score);
    setFinalWave(session.wave);
    setIsGameOver(true);
    // Update profile
    const gs = useGameStore.getState();
    if (gs.playerProfile) {
      gs.setPlayerProfile({
        ...gs.playerProfile,
        totalScore: gs.playerProfile.totalScore + session.score,
        totalKills: gs.playerProfile.totalKills + session.killCount,
        gamesPlayed: gs.playerProfile.gamesPlayed + 1,
        highScore: Math.max(gs.playerProfile.highScore, session.score),
        totalCoins: gs.playerProfile.totalCoins + player.coins,
        lastPlayed: Date.now(),
      });
    }
  }

  function triggerVictory(session: GameSession): void {
    cancelAnimationFrame(rafRef.current);
    audioEngine.stopMusic();
    audioEngine.playMusic("victory");
    setFinalScore(session.score);
    setFinalWave(session.wave);
    setIsGameOver(true);
  }

  // ─── Canvas sizing (responsive) ──────────────────────────────────────────────
  const [canvasStyle, setCanvasStyle] = useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  useEffect(() => {
    function resize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      const windowAspect = vw / vh;
      let w: number;
      let h: number;
      if (windowAspect > aspectRatio) {
        h = Math.min(vh, CANVAS_HEIGHT * 1.5);
        w = h * aspectRatio;
      } else {
        w = Math.min(vw, CANVAS_WIDTH * 1.5);
        h = w / aspectRatio;
      }
      setCanvasStyle({ width: Math.round(w), height: Math.round(h) });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div data-ocid="game.canvas_target" className="game-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ width: canvasStyle.width, height: canvasStyle.height }}
        className="game-canvas"
        tabIndex={0}
      />

      {/* Pause Overlay */}
      {isPaused && !isGameOver && (
        <div
          data-ocid="game.pause"
          className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="hud-panel p-8 flex flex-col items-center gap-4 w-64 animate-scale-in">
            <div className="font-display font-bold text-2xl text-neon-cyan text-glow-cyan">
              PAUSED
            </div>
            <button
              type="button"
              data-ocid="game.resume_button"
              onClick={togglePause}
              className="w-full py-2.5 font-display text-sm text-neon-cyan border border-neon-cyan/50 rounded-lg hover:bg-neon-cyan/10"
            >
              ► RESUME
            </button>
            <button
              type="button"
              data-ocid="game.menu_button"
              onClick={() => {
                audioEngine.stopMusic();
                navigateTo("menu");
              }}
              className="w-full py-2.5 font-display text-sm text-white/50 border border-white/10 rounded-lg hover:text-neon-cyan hover:border-neon-cyan/30"
            >
              ↩ MAIN MENU
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {isGameOver && (
        <div
          data-ocid="game.game_over"
          className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm"
        >
          <div className="hud-panel p-8 flex flex-col items-center gap-4 w-72 animate-scale-in">
            <div className="font-display font-bold text-3xl text-neon-red text-glow-red">
              GAME OVER
            </div>
            <div className="text-center">
              <div className="font-mono text-xs text-white/40 mb-1">
                FINAL SCORE
              </div>
              <div className="font-display font-bold text-4xl text-white">
                {finalScore.toLocaleString()}
              </div>
              <div className="font-mono text-xs text-white/40 mt-1">
                WAVE {finalWave} • {currentMode.replace("_", " ").toUpperCase()}
              </div>
            </div>
            <button
              type="button"
              data-ocid="game.play_again_button"
              onClick={() => {
                audioEngine.stopMusic();
                navigateTo("game");
              }}
              className="w-full py-2.5 font-display text-sm text-neon-cyan border border-neon-cyan/50 rounded-lg hover:bg-neon-cyan/10"
            >
              ► PLAY AGAIN
            </button>
            <button
              type="button"
              data-ocid="game.leaderboard_button"
              onClick={() => {
                audioEngine.stopMusic();
                navigateTo("leaderboard");
              }}
              className="w-full py-2.5 font-display text-sm text-neon-gold border border-neon-gold/40 rounded-lg hover:bg-neon-gold/10"
            >
              🏆 LEADERBOARD
            </button>
            <button
              type="button"
              data-ocid="game.menu_button_gameover"
              onClick={() => {
                audioEngine.stopMusic();
                navigateTo("menu");
              }}
              className="w-full py-2.5 font-display text-sm text-white/50 border border-white/10 rounded-lg hover:text-neon-cyan"
            >
              ↩ MAIN MENU
            </button>
          </div>
        </div>
      )}

      {/* Pause button (mobile) */}
      {!isPaused && !isGameOver && (
        <button
          type="button"
          data-ocid="game.pause_button"
          onClick={togglePause}
          className="absolute top-3 right-3 w-9 h-9 rounded-lg hud-panel flex items-center justify-center font-mono text-white/50 hover:text-neon-cyan text-xs"
          aria-label="Pause game"
        >
          ⏸
        </button>
      )}
    </div>
  );
}
