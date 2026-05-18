import type { Particle, ParticleType } from "./types";

// Object pool for performance — pre-allocated particles
const POOL_SIZE = 800;
let _idCounter = 0;
const nextId = () => `p${++_idCounter}`;

export class ParticleSystem {
  private active: Particle[] = [];
  private pool: Particle[] = [];

  constructor() {
    // Pre-allocate pool
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push(this.createBlankParticle());
    }
  }

  private createBlankParticle(): Particle {
    return {
      id: nextId(),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 2,
      color: "#fff",
      alpha: 1,
      alphaDecay: 0.02,
      lifetime: 0,
      maxLifetime: 60,
      type: "explosion",
      gravity: 0,
      rotation: 0,
      rotationSpeed: 0,
    };
  }

  private acquire(overrides: Partial<Particle>): Particle {
    const p = this.pool.pop() ?? this.createBlankParticle();
    p.id = nextId();
    Object.assign(p, overrides);
    this.active.push(p);
    return p;
  }

  getActive(): readonly Particle[] {
    return this.active;
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.lifetime += dt;
      const progress = p.lifetime / p.maxLifetime;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.alpha = Math.max(0, 1 - progress);
      p.rotation += p.rotationSpeed * dt;
      // Slow down particles over time
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (p.lifetime >= p.maxLifetime) {
        this.active.splice(i, 1);
        this.pool.push(p);
      }
    }
  }

  // ─── Emitters ─────────────────────────────────────────────────────────────

  emitExplosion(
    x: number,
    y: number,
    count: number,
    colors: string[],
    radius = 1.0,
    speed = 1.0,
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const spd = (80 + Math.random() * 180) * speed;
      const colorIndex = Math.floor(Math.random() * colors.length);
      this.acquire({
        type: "explosion",
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: (3 + Math.random() * 5) * radius,
        color: colors[colorIndex],
        alpha: 1,
        alphaDecay: 0.02,
        lifetime: 0,
        maxLifetime: 400 + Math.random() * 400,
        gravity: 12,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
  }

  emitBigExplosion(
    x: number,
    y: number,
    count: number,
    colors: string[],
  ): void {
    // Core burst
    this.emitExplosion(x, y, count, colors, 1.8, 1.5);
    // Secondary sparks
    for (let i = 0; i < Math.floor(count / 2); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 30 + Math.random() * 80;
      this.acquire({
        type: "debris",
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 1 + Math.random() * 2,
        color: "#ffffff",
        alpha: 0.9,
        alphaDecay: 0.015,
        lifetime: 0,
        maxLifetime: 600 + Math.random() * 600,
        gravity: 6,
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  emitBulletTrail(x: number, y: number, color: string, count = 2): void {
    for (let i = 0; i < count; i++) {
      this.acquire({
        type: "bullet_trail",
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        radius: 1.5 + Math.random() * 1.5,
        color,
        alpha: 0.7,
        alphaDecay: 0.05,
        lifetime: 0,
        maxLifetime: 120 + Math.random() * 80,
        gravity: 0,
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  emitThruster(x: number, y: number, angle: number, isBoosting: boolean): void {
    const count = isBoosting ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const spd = (isBoosting ? 120 : 60) + Math.random() * 40;
      const thrustAngle = angle + Math.PI + spread; // behind player
      const colors = isBoosting
        ? ["#00ffff", "#0088ff", "#ffffff"]
        : ["#00ffff", "#004488"];
      this.acquire({
        type: "thruster",
        x,
        y,
        vx: Math.cos(thrustAngle) * spd,
        vy: Math.sin(thrustAngle) * spd,
        radius: (isBoosting ? 4 : 2.5) + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.8,
        alphaDecay: 0.04,
        lifetime: 0,
        maxLifetime: 150 + Math.random() * 100,
        gravity: 0,
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  emitCoinSparkle(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      this.acquire({
        type: "coin_sparkle",
        x,
        y,
        vx: Math.cos(angle) * (30 + Math.random() * 40),
        vy: Math.sin(angle) * (30 + Math.random() * 40),
        radius: 2 + Math.random() * 2,
        color: "#ffd700",
        alpha: 1,
        alphaDecay: 0.03,
        lifetime: 0,
        maxLifetime: 300 + Math.random() * 200,
        gravity: 15,
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  emitShieldAbsorb(
    x: number,
    y: number,
    impactX: number,
    impactY: number,
  ): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle =
        Math.atan2(impactY - y, impactX - x) + (Math.random() - 0.5) * 1.2;
      this.acquire({
        type: "shield_absorb",
        x: impactX,
        y: impactY,
        vx: -Math.cos(angle) * (40 + Math.random() * 60),
        vy: -Math.sin(angle) * (40 + Math.random() * 60),
        radius: 2 + Math.random() * 3,
        color: "#00aaff",
        alpha: 0.9,
        alphaDecay: 0.04,
        lifetime: 0,
        maxLifetime: 200 + Math.random() * 150,
        gravity: 0,
        rotation: 0,
        rotationSpeed: 0,
      });
    }
  }

  emitScreenFlash(canvasW: number, canvasH: number, color: string): void {
    // Large centered particles for screen-wide flash effect
    this.acquire({
      type: "explosion",
      x: canvasW / 2,
      y: canvasH / 2,
      vx: 0,
      vy: 0,
      radius: Math.max(canvasW, canvasH),
      color,
      alpha: 0.3,
      alphaDecay: 0.08,
      lifetime: 0,
      maxLifetime: 150,
      gravity: 0,
      rotation: 0,
      rotationSpeed: 0,
    });
  }

  clear(): void {
    this.pool.push(...this.active);
    this.active = [];
  }

  get count(): number {
    return this.active.length;
  }
}
