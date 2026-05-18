import { COLORS, ENEMY_STATS, POWERUP_CONFIG, WEAPON_STATS } from "./constants";
import type {
  Enemy,
  GameSession,
  Particle,
  Player,
  PowerUp,
  TextEffect,
  WeaponType,
} from "./types";

interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  brightness: number;
  layer: number; // 0-2 for parallax depth
}

interface Planet {
  x: number;
  y: number;
  radius: number;
  color: string;
  ringColor: string | null;
  hasRing: boolean;
  vy: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private stars: Star[] = [];
  private planets: Planet[] = [];
  private nebulaCanvas: OffscreenCanvas | null = null;
  private shakeX = 0;
  private shakeY = 0;
  private shakeIntensity = 0;
  private shakeDuration = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initStars();
    this.initPlanets();
    this.generateNebula();
  }

  // ─── Initialization ─────────────────────────────────────────────────────────
  private initStars(): void {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.8 + 0.3,
        speed: [0.4, 1.0, 2.2][Math.floor(Math.random() * 3)],
        brightness: 0.4 + Math.random() * 0.6,
        layer: Math.floor(Math.random() * 3),
      });
    }
  }

  private initPlanets(): void {
    this.planets = [
      {
        x: this.width * 0.8,
        y: -100,
        radius: 55,
        color: "#1a0a3a",
        ringColor: "rgba(120,80,200,0.3)",
        hasRing: true,
        vy: 0.08,
      },
      {
        x: this.width * 0.15,
        y: this.height * 0.4,
        radius: 30,
        color: "#0a2a1a",
        ringColor: null,
        hasRing: false,
        vy: 0.05,
      },
    ];
  }

  private generateNebula(): void {
    try {
      const nb = new OffscreenCanvas(this.width, this.height);
      const nc = nb.getContext("2d");
      if (!nc) return;
      // Nebula gradients
      const grad1 = nc.createRadialGradient(
        this.width * 0.7,
        this.height * 0.3,
        0,
        this.width * 0.7,
        this.height * 0.3,
        220,
      );
      grad1.addColorStop(0, "rgba(80,0,160,0.18)");
      grad1.addColorStop(1, "transparent");
      nc.fillStyle = grad1;
      nc.fillRect(0, 0, this.width, this.height);

      const grad2 = nc.createRadialGradient(
        this.width * 0.2,
        this.height * 0.7,
        0,
        this.width * 0.2,
        this.height * 0.7,
        180,
      );
      grad2.addColorStop(0, "rgba(0,80,160,0.14)");
      grad2.addColorStop(1, "transparent");
      nc.fillStyle = grad2;
      nc.fillRect(0, 0, this.width, this.height);

      this.nebulaCanvas = nb;
    } catch {
      this.nebulaCanvas = null;
    }
  }

  // ─── Screen Shake ───────────────────────────────────────────────────────────
  triggerShake(intensity: number, duration = 300): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  updateShake(dt: number): void {
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const decay = Math.max(0, this.shakeDuration) / 300;
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * decay * 2;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * decay * 2;
      if (this.shakeDuration <= 0) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  // ─── Background ─────────────────────────────────────────────────────────────
  drawBackground(dt: number): void {
    const ctx = this.ctx;
    // Deep space gradient
    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, "#02040a");
    bg.addColorStop(0.5, "#04080f");
    bg.addColorStop(1, "#020308");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);

    // Nebula
    if (this.nebulaCanvas) {
      ctx.drawImage(this.nebulaCanvas, 0, 0);
    }

    // Planets
    for (const planet of this.planets) {
      planet.y += planet.vy * dt;
      if (planet.y > this.height + planet.radius + 50)
        planet.y = -planet.radius - 50;
      this.drawPlanet(planet);
    }

    // Parallax stars
    for (const star of this.stars) {
      star.y += star.speed * dt * 0.06;
      if (star.y > this.height + 2) {
        star.y = -2;
        star.x = Math.random() * this.width;
      }
      const twinkle = 0.6 + Math.sin(Date.now() * 0.002 + star.x) * 0.4;
      ctx.globalAlpha = star.brightness * twinkle;
      ctx.fillStyle =
        star.layer === 2 ? "#ffffff" : star.layer === 1 ? "#aaddff" : "#6699cc";
      ctx.beginPath();
      ctx.arc(
        star.x,
        star.y,
        star.radius * (star.layer === 2 ? 1 : 0.7),
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  private drawPlanet(planet: Planet): void {
    const ctx = this.ctx;
    ctx.save();
    // Planet glow
    const glow = ctx.createRadialGradient(
      planet.x,
      planet.y,
      0,
      planet.x,
      planet.y,
      planet.radius * 2,
    );
    glow.addColorStop(0, planet.color.replace("0a", "22"));
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    // Planet body
    const grad = ctx.createRadialGradient(
      planet.x - planet.radius * 0.3,
      planet.y - planet.radius * 0.3,
      0,
      planet.x,
      planet.y,
      planet.radius,
    );
    grad.addColorStop(0, "rgba(255,255,255,0.15)");
    grad.addColorStop(0.5, planet.color);
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();
    // Ring
    if (planet.hasRing && planet.ringColor) {
      ctx.strokeStyle = planet.ringColor;
      ctx.lineWidth = planet.radius * 0.35;
      ctx.beginPath();
      ctx.ellipse(
        planet.x,
        planet.y,
        planet.radius * 1.8,
        planet.radius * 0.4,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Apply Shake Transform ───────────────────────────────────────────────────
  beginFrame(): void {
    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);
  }

  endFrame(): void {
    this.ctx.restore();
  }

  // ─── Player ─────────────────────────────────────────────────────────────────
  drawPlayer(player: Player): void {
    if (player.invincible && Math.floor(Date.now() / 80) % 2 === 0) return; // blink when invincible
    const ctx = this.ctx;
    const { x, y, radius, rotation, skinIndex, shieldHp } = player;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Shield aura
    if (shieldHp > 0) {
      const shieldAlpha = 0.15 + 0.15 * Math.sin(Date.now() * 0.005);
      const shieldGrad = ctx.createRadialGradient(
        0,
        0,
        radius,
        0,
        0,
        radius + 14,
      );
      shieldGrad.addColorStop(0, `rgba(0,170,255,${shieldAlpha * 2})`);
      shieldGrad.addColorStop(1, "transparent");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(0,170,255,${shieldAlpha + 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 12, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Engine glow
    const skinColors = [
      ["#00ffff", "#0055ff"],
      ["#00ff88", "#005522"],
      ["#ff6600", "#660000"],
      ["#ff00ff", "#440044"],
    ];
    const [primaryColor, secondaryColor] =
      skinColors[skinIndex % skinColors.length];
    const engineGlow = ctx.createRadialGradient(0, 8, 0, 0, 8, 20);
    engineGlow.addColorStop(0, `${primaryColor}88`);
    engineGlow.addColorStop(1, "transparent");
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(0, 8, 20, 0, Math.PI * 2);
    ctx.fill();

    // Main ship body
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 12;
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -radius);
    ctx.lineTo(-radius * 0.7, radius * 0.6);
    ctx.lineTo(0, radius * 0.3);
    ctx.lineTo(radius * 0.7, radius * 0.6);
    ctx.closePath();
    ctx.fill();

    // Wing details
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.3);
    ctx.lineTo(-radius * 0.4, radius * 0.5);
    ctx.lineTo(0, radius * 0.1);
    ctx.lineTo(radius * 0.4, radius * 0.5);
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "rgba(200,240,255,0.85)";
    ctx.beginPath();
    ctx.arc(0, -radius * 0.3, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ─── Enemies ────────────────────────────────────────────────────────────────
  drawEnemy(enemy: Enemy): void {
    const ctx = this.ctx;
    const stats = ENEMY_STATS[enemy.type];
    const { x, y, radius, hp, maxHp, shieldHp, maxShieldHp, rotation } = enemy;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation + Math.PI); // Enemies face down

    // Shield aura
    if (shieldHp > 0) {
      const sAlpha = (shieldHp / maxShieldHp) * 0.4;
      ctx.strokeStyle = `rgba(0,170,255,${sAlpha + 0.2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.shadowColor = stats.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = stats.color;

    switch (enemy.type) {
      case "scout":
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(-radius * 0.7, radius * 0.6);
        ctx.lineTo(0, radius * 0.3);
        ctx.lineTo(radius * 0.7, radius * 0.6);
        ctx.closePath();
        ctx.fill();
        break;
      case "fighter":
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        ctx.lineTo(-radius, radius * 0.5);
        ctx.lineTo(-radius * 0.4, radius * 0.3);
        ctx.lineTo(0, radius);
        ctx.lineTo(radius * 0.4, radius * 0.3);
        ctx.lineTo(radius, radius * 0.5);
        ctx.closePath();
        ctx.fill();
        break;
      case "bomber":
        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(0, -radius * 0.1, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "drone":
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "miniboss":
        for (let i = 0; i < 6; i++) {
          const ang = (i / 6) * Math.PI * 2 + rotation * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
          ctx.lineTo(
            Math.cos(ang + 0.5) * radius * 0.6,
            Math.sin(ang + 0.5) * radius * 0.6,
          );
          ctx.closePath();
          ctx.fill();
        }
        break;
      case "boss":
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        for (let i = 1; i <= 8; i++) {
          const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? radius : radius * 0.65;
          ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fill();
        // Boss eye
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.shadowBlur = 0;

    // Health bar above enemy
    if (hp < maxHp && enemy.type !== "drone") {
      const barW = radius * 2.2;
      const barH = 4;
      const barX = -barW / 2;
      const barY = -radius - 10;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(barX, barY, barW, barH);
      const hpFrac = hp / maxHp;
      const hpColor =
        hpFrac > 0.5 ? "#00ff88" : hpFrac > 0.25 ? "#ffaa00" : "#ff3366";
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * hpFrac, barH);
    }

    ctx.restore();
  }

  // ─── Bullets ────────────────────────────────────────────────────────────────
  drawBullet(
    x: number,
    y: number,
    weapon: WeaponType,
    radius: number,
    _isPlayer: boolean,
  ): void {
    const ctx = this.ctx;
    const stats = WEAPON_STATS[weapon];
    ctx.save();
    ctx.shadowColor = stats.glowColor;
    ctx.shadowBlur = 12;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, stats.color);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ─── Particles ───────────────────────────────────────────────────────────────
  drawParticles(particles: readonly Particle[]): void {
    const ctx = this.ctx;
    for (const p of particles) {
      if (p.alpha <= 0) continue;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      if (p.type === "explosion" || p.type === "debris") {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 2;
      }
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        Math.max(0.1, p.radius * (1 - (p.lifetime / p.maxLifetime) * 0.5)),
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ─── Power-Ups ───────────────────────────────────────────────────────────────
  drawPowerUp(pu: PowerUp): void {
    const ctx = this.ctx;
    const cfg = POWERUP_CONFIG[pu.type];
    const pulse = 0.8 + Math.sin(pu.pulsePhase) * 0.2;
    ctx.save();
    ctx.translate(pu.x, pu.y);
    // Glow
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 18 * pulse;
    // Outer ring
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    // Inner fill
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = `${cfg.color}33`;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // ─── Text Effects ────────────────────────────────────────────────────────────
  drawTextEffects(effects: TextEffect[]): void {
    const ctx = this.ctx;
    for (const te of effects) {
      ctx.save();
      ctx.globalAlpha = te.alpha;
      ctx.font = `bold ${te.fontSize}px 'Space Grotesk', sans-serif`;
      ctx.fillStyle = te.color;
      ctx.textAlign = "center";
      ctx.shadowColor = te.color;
      ctx.shadowBlur = 8;
      ctx.fillText(te.text, te.x, te.y);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ─── HUD ────────────────────────────────────────────────────────────────────
  drawHUD(session: GameSession, player: Player): void {
    const ctx = this.ctx;
    const pad = 14;
    const barH = 7;
    const barW = 100;

    // ── Status Bars (top-left) ──────────────────────────────────────────────
    const drawBar = (
      index: number,
      value: number,
      max: number,
      color: string,
      label: string,
    ): void => {
      const y = pad + index * (barH + 6);
      const frac = Math.max(0, Math.min(1, value / max));
      // Background
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(pad, y, barW, barH);
      // Fill
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      const grad = ctx.createLinearGradient(pad, y, pad + barW, y);
      grad.addColorStop(0, color);
      grad.addColorStop(1, `${color}88`);
      ctx.fillStyle = grad;
      ctx.fillRect(pad, y, barW * frac, barH);
      ctx.shadowBlur = 0;
      // Label
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        `${label} ${Math.round(value)}/${max}`,
        pad + barW + 6,
        y + barH - 1,
      );
    };

    drawBar(0, player.hp, player.maxHp, COLORS.danger, "HP");
    drawBar(1, player.shieldHp, player.maxShieldHp, COLORS.shieldBar, "SH");
    drawBar(2, player.energy, player.maxEnergy, COLORS.accent, "EN");

    // ── Score (top-center) ─────────────────────────────────────────────────
    const scoreText = session.score.toLocaleString();
    ctx.font = "bold 20px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = COLORS.primary;
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(scoreText, this.width / 2, 26);
    ctx.shadowBlur = 0;
    ctx.font = "10px 'Space Grotesk', sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`WAVE ${session.wave}`, this.width / 2, 40);

    // ── Wave counter / combo (top-right) ───────────────────────────────────
    if (player.comboCount >= 2) {
      ctx.textAlign = "right";
      const comboAlpha = Math.min(1, player.comboTimer / 500);
      ctx.globalAlpha = comboAlpha;
      ctx.font = `bold ${14 + player.comboCount}px 'Space Grotesk', sans-serif`;
      ctx.shadowColor = COLORS.warning;
      ctx.shadowBlur = 12;
      ctx.fillStyle = COLORS.warning;
      ctx.fillText(`${player.comboCount}× COMBO`, this.width - pad, 28);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ── Weapon indicator (bottom-left) ──────────────────────────────────────
    const wstats = WEAPON_STATS[player.weapon];
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(pad, this.height - 44, 120, 32, 8);
    ctx.fill();
    ctx.font = "bold 11px 'Space Grotesk', sans-serif";
    ctx.textAlign = "left";
    ctx.shadowColor = wstats.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = wstats.color;
    ctx.fillText(wstats.name.toUpperCase(), pad + 8, this.height - 28);
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillText(
      `[1-${player.weapons.length}] SELECT`,
      pad + 8,
      this.height - 16,
    );

    // ── FPS (bottom-right, small) ────────────────────────────────────────────
    ctx.textAlign = "right";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(
      `${Math.round(session.fps)} FPS`,
      this.width - pad,
      this.height - 8,
    );

    // ── Boost indicator ──────────────────────────────────────────────────────
    if (player.boostCooldown > 0) {
      const boostFrac = 1 - player.boostCooldown / 3000;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect(this.width / 2 - 40, this.height - 28, 80, 16, 6);
      ctx.fill();
      ctx.fillStyle = `${COLORS.primary}88`;
      ctx.fillRect(this.width / 2 - 38, this.height - 26, 76 * boostFrac, 12);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("BOOST", this.width / 2, this.height - 17);
    }
  }

  // ─── Wave Announcement ───────────────────────────────────────────────────────
  drawWaveAnnouncement(wave: number, alpha: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 42px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = COLORS.primary;
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`WAVE ${wave}`, this.width / 2, this.height / 2 - 20);
    ctx.font = "16px 'Space Grotesk', sans-serif";
    ctx.fillStyle = COLORS.primary;
    ctx.fillText("INCOMING!", this.width / 2, this.height / 2 + 16);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawBossWarning(alpha: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = alpha * (0.7 + Math.sin(Date.now() * 0.01) * 0.3);
    ctx.font = "bold 36px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = COLORS.danger;
    ctx.shadowBlur = 40;
    ctx.fillStyle = COLORS.danger;
    ctx.fillText("⚠ BOSS INCOMING ⚠", this.width / 2, this.height / 2);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.initStars();
    this.initPlanets();
    this.generateNebula();
  }
}
