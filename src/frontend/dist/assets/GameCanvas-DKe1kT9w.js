var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { E as ENEMY_STATS, W as WEAPON_STATS, P as POWERUP_CONFIG, C as COLORS, r as reactExports, u as useGameStore, G as GAME_MODES, a as WAVE_COOLDOWN, b as CANVAS_WIDTH, c as CANVAS_HEIGHT, d as PLAYER_BOOST_COOLDOWN, e as PLAYER_BOOST_DURATION, f as PLAYER_BOOST_SPEED, g as PLAYER_SPEED, h as PARTICLE_COUNTS, i as PLAYER_INVINCIBLE_DURATION, D as DIFFICULTY_SCALE_PER_WAVE, k as COMBO_MULTIPLIER_MAX, l as COMBO_TIMEOUT, j as jsxRuntimeExports, m as PLAYER_RADIUS, B as BOSS_EVERY_N_WAVES, n as ENEMIES_PER_WAVE_BASE, o as ENEMIES_PER_WAVE_INCREMENT } from "./index-BeDg1Gbc.js";
import { a as audioEngine } from "./audioEngine-Bbt5mT95.js";
const JOYSTICK_MAX_DIST = 55;
class InputManager {
  constructor() {
    __publicField(this, "state");
    __publicField(this, "canvas", null);
    __publicField(this, "activeTouches", /* @__PURE__ */ new Map());
    __publicField(this, "gamepadIndex", null);
    __publicField(this, "listeners", []);
    this.state = {
      left: false,
      right: false,
      up: false,
      down: false,
      shoot: false,
      boost: false,
      special: false,
      pause: false,
      weapon1: false,
      weapon2: false,
      weapon3: false,
      weapon4: false,
      aimX: 240,
      aimY: 400,
      aimActive: false,
      joystickActive: false,
      joystickAngle: 0,
      joystickMagnitude: 0,
      gamepadConnected: false
    };
  }
  attach(canvas) {
    this.canvas = canvas;
    this.addListeners();
  }
  detach() {
    for (const fn of this.listeners) {
      fn();
    }
    this.listeners = [];
    this.canvas = null;
  }
  getState() {
    this.pollGamepad();
    return this.state;
  }
  // ─── Keyboard ───────────────────────────────────────────────────────────────
  addListeners() {
    const onKeyDown = (e) => this.onKey(e, true);
    const onKeyUp = (e) => this.onKey(e, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    const onMouseMove = (e) => this.onMouseMove(e);
    const onMouseDown = (e) => this.onMouseButton(e, true);
    const onMouseUp = (e) => this.onMouseButton(e, false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", (e) => e.preventDefault());
    const onTouchStart = (e) => this.onTouchStart(e);
    const onTouchMove = (e) => this.onTouchMove(e);
    const onTouchEnd = (e) => this.onTouchEnd(e);
    const canv = this.canvas ?? window;
    canv.addEventListener("touchstart", onTouchStart, {
      passive: false
    });
    canv.addEventListener("touchmove", onTouchMove, {
      passive: false
    });
    canv.addEventListener("touchend", onTouchEnd, {
      passive: false
    });
    canv.addEventListener("touchcancel", onTouchEnd, {
      passive: false
    });
    const onGamepadConnect = (e) => {
      this.gamepadIndex = e.gamepad.index;
      this.state.gamepadConnected = true;
    };
    const onGamepadDisconnect = (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
        this.state.gamepadConnected = false;
      }
    };
    window.addEventListener("gamepadconnected", onGamepadConnect);
    window.addEventListener("gamepaddisconnected", onGamepadDisconnect);
    this.listeners.push(
      () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      },
      () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mousedown", onMouseDown);
        window.removeEventListener("mouseup", onMouseUp);
      },
      () => {
        canv.removeEventListener("touchstart", onTouchStart);
        canv.removeEventListener("touchmove", onTouchMove);
        canv.removeEventListener("touchend", onTouchEnd);
        canv.removeEventListener("touchcancel", onTouchEnd);
      },
      () => {
        window.removeEventListener("gamepadconnected", onGamepadConnect);
        window.removeEventListener("gamepaddisconnected", onGamepadDisconnect);
      }
    );
  }
  onKey(e, down) {
    const s = this.state;
    switch (e.code) {
      case "ArrowLeft":
      case "KeyA":
        s.left = down;
        break;
      case "ArrowRight":
      case "KeyD":
        s.right = down;
        break;
      case "ArrowUp":
      case "KeyW":
        s.up = down;
        break;
      case "ArrowDown":
      case "KeyS":
        s.down = down;
        break;
      case "Space":
        e.preventDefault();
        s.shoot = down;
        break;
      case "ShiftLeft":
      case "ShiftRight":
        s.boost = down;
        break;
      case "KeyX":
      case "KeyQ":
        s.special = down;
        break;
      case "Escape":
        if (down && !s.pause) s.pause = true;
        else if (!down) s.pause = false;
        break;
      case "Digit1":
        s.weapon1 = down;
        break;
      case "Digit2":
        s.weapon2 = down;
        break;
      case "Digit3":
        s.weapon3 = down;
        break;
      case "Digit4":
        s.weapon4 = down;
        break;
    }
  }
  // ─── Mouse ──────────────────────────────────────────────────────────────────
  onMouseMove(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.state.aimX = (e.clientX - rect.left) * scaleX;
    this.state.aimY = (e.clientY - rect.top) * scaleY;
    this.state.aimActive = true;
  }
  onMouseButton(e, down) {
    if (e.button === 0) this.state.shoot = down;
    if (e.button === 2) this.state.special = down;
  }
  // ─── Touch ──────────────────────────────────────────────────────────────────
  getTouchCanvas(clientX) {
    if (!this.canvas) return "right";
    const rect = this.canvas.getBoundingClientRect();
    return clientX < rect.left + rect.width / 2 ? "left" : "right";
  }
  canvasCoords(clientX, clientY) {
    if (!this.canvas) return { x: clientX, y: clientY };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }
  onTouchStart(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const side = this.getTouchCanvas(t.clientX);
      this.activeTouches.set(t.identifier, {
        id: t.identifier,
        startX: t.clientX,
        startY: t.clientY,
        currentX: t.clientX,
        currentY: t.clientY,
        side
      });
      if (side === "right") {
        this.state.shoot = true;
        const coords = this.canvasCoords(t.clientX, t.clientY);
        this.state.aimX = coords.x;
        this.state.aimY = coords.y;
        this.state.aimActive = true;
      }
    }
    this.updateJoystick();
  }
  onTouchMove(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const existing = this.activeTouches.get(t.identifier);
      if (!existing) continue;
      existing.currentX = t.clientX;
      existing.currentY = t.clientY;
      if (existing.side === "right") {
        const coords = this.canvasCoords(t.clientX, t.clientY);
        this.state.aimX = coords.x;
        this.state.aimY = coords.y;
      }
    }
    this.updateJoystick();
  }
  onTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const existing = this.activeTouches.get(t.identifier);
      if ((existing == null ? void 0 : existing.side) === "right") this.state.shoot = false;
      this.activeTouches.delete(t.identifier);
    }
    this.updateJoystick();
  }
  updateJoystick() {
    let leftTouch = null;
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        leftTouch = touch;
        break;
      }
    }
    if (!leftTouch) {
      this.state.joystickActive = false;
      this.state.joystickMagnitude = 0;
      this.state.left = this.state.right = this.state.up = this.state.down = false;
      return;
    }
    const dx = leftTouch.currentX - leftTouch.startX;
    const dy = leftTouch.currentY - leftTouch.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const mag = Math.min(1, dist / JOYSTICK_MAX_DIST);
    const angle = Math.atan2(dy, dx);
    this.state.joystickActive = true;
    this.state.joystickAngle = angle;
    this.state.joystickMagnitude = mag;
    this.state.left = dx < -JOYSTICK_MAX_DIST * 0.3;
    this.state.right = dx > JOYSTICK_MAX_DIST * 0.3;
    this.state.up = dy < -JOYSTICK_MAX_DIST * 0.3;
    this.state.down = dy > JOYSTICK_MAX_DIST * 0.3;
  }
  getJoystickCenter() {
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        return { x: touch.startX, y: touch.startY };
      }
    }
    return null;
  }
  getJoystickCurrent() {
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        return { x: touch.currentX, y: touch.currentY };
      }
    }
    return null;
  }
  // ─── Gamepad ─────────────────────────────────────────────────────────────────
  pollGamepad() {
    var _a, _b, _c;
    if (this.gamepadIndex === null) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return;
    const s = this.state;
    const lx = gp.axes[0] ?? 0;
    const ly = gp.axes[1] ?? 0;
    const dead = 0.2;
    s.left = lx < -dead;
    s.right = lx > dead;
    s.up = ly < -dead;
    s.down = ly > dead;
    s.shoot = ((_a = gp.buttons[0]) == null ? void 0 : _a.pressed) ?? false;
    s.special = ((_b = gp.buttons[1]) == null ? void 0 : _b.pressed) ?? false;
    s.boost = ((_c = gp.buttons[5]) == null ? void 0 : _c.pressed) ?? false;
    const rx = gp.axes[2] ?? 0;
    const ry = gp.axes[3] ?? 0;
    if (Math.abs(rx) > dead || Math.abs(ry) > dead) {
      s.aimX = 240 + rx * 200;
      s.aimY = 400 + ry * 200;
      s.aimActive = true;
    }
  }
  resetPauseToggle() {
  }
}
const POOL_SIZE = 800;
let _idCounter = 0;
const nextId = () => `p${++_idCounter}`;
class ParticleSystem {
  constructor() {
    __publicField(this, "active", []);
    __publicField(this, "pool", []);
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push(this.createBlankParticle());
    }
  }
  createBlankParticle() {
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
      rotationSpeed: 0
    };
  }
  acquire(overrides) {
    const p = this.pool.pop() ?? this.createBlankParticle();
    p.id = nextId();
    Object.assign(p, overrides);
    this.active.push(p);
    return p;
  }
  getActive() {
    return this.active;
  }
  update(dt) {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const p = this.active[i];
      p.lifetime += dt;
      const progress = p.lifetime / p.maxLifetime;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.alpha = Math.max(0, 1 - progress);
      p.rotation += p.rotationSpeed * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (p.lifetime >= p.maxLifetime) {
        this.active.splice(i, 1);
        this.pool.push(p);
      }
    }
  }
  // ─── Emitters ─────────────────────────────────────────────────────────────
  emitExplosion(x, y, count, colors, radius = 1, speed = 1) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2 + Math.random() * 0.5;
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
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  }
  emitBigExplosion(x, y, count, colors) {
    this.emitExplosion(x, y, count, colors, 1.8, 1.5);
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
        rotationSpeed: 0
      });
    }
  }
  emitBulletTrail(x, y, color, count = 2) {
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
        rotationSpeed: 0
      });
    }
  }
  emitThruster(x, y, angle, isBoosting) {
    const count = isBoosting ? 6 : 3;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const spd = (isBoosting ? 120 : 60) + Math.random() * 40;
      const thrustAngle = angle + Math.PI + spread;
      const colors = isBoosting ? ["#00ffff", "#0088ff", "#ffffff"] : ["#00ffff", "#004488"];
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
        rotationSpeed: 0
      });
    }
  }
  emitCoinSparkle(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = i / 8 * Math.PI * 2;
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
        rotationSpeed: 0
      });
    }
  }
  emitShieldAbsorb(x, y, impactX, impactY) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(impactY - y, impactX - x) + (Math.random() - 0.5) * 1.2;
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
        rotationSpeed: 0
      });
    }
  }
  emitScreenFlash(canvasW, canvasH, color) {
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
      rotationSpeed: 0
    });
  }
  clear() {
    this.pool.push(...this.active);
    this.active = [];
  }
  get count() {
    return this.active.length;
  }
}
class Renderer {
  constructor(ctx, width, height) {
    __publicField(this, "ctx");
    __publicField(this, "width");
    __publicField(this, "height");
    __publicField(this, "stars", []);
    __publicField(this, "planets", []);
    __publicField(this, "nebulaCanvas", null);
    __publicField(this, "shakeX", 0);
    __publicField(this, "shakeY", 0);
    __publicField(this, "shakeIntensity", 0);
    __publicField(this, "shakeDuration", 0);
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initStars();
    this.initPlanets();
    this.generateNebula();
  }
  // ─── Initialization ─────────────────────────────────────────────────────────
  initStars() {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.8 + 0.3,
        speed: [0.4, 1, 2.2][Math.floor(Math.random() * 3)],
        brightness: 0.4 + Math.random() * 0.6,
        layer: Math.floor(Math.random() * 3)
      });
    }
  }
  initPlanets() {
    this.planets = [
      {
        x: this.width * 0.8,
        y: -100,
        radius: 55,
        color: "#1a0a3a",
        ringColor: "rgba(120,80,200,0.3)",
        hasRing: true,
        vy: 0.08
      },
      {
        x: this.width * 0.15,
        y: this.height * 0.4,
        radius: 30,
        color: "#0a2a1a",
        ringColor: null,
        hasRing: false,
        vy: 0.05
      }
    ];
  }
  generateNebula() {
    try {
      const nb = new OffscreenCanvas(this.width, this.height);
      const nc = nb.getContext("2d");
      if (!nc) return;
      const grad1 = nc.createRadialGradient(
        this.width * 0.7,
        this.height * 0.3,
        0,
        this.width * 0.7,
        this.height * 0.3,
        220
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
        180
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
  triggerShake(intensity, duration = 300) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }
  updateShake(dt) {
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
  drawBackground(dt) {
    const ctx = this.ctx;
    const bg = ctx.createLinearGradient(0, 0, 0, this.height);
    bg.addColorStop(0, "#02040a");
    bg.addColorStop(0.5, "#04080f");
    bg.addColorStop(1, "#020308");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, this.width, this.height);
    if (this.nebulaCanvas) {
      ctx.drawImage(this.nebulaCanvas, 0, 0);
    }
    for (const planet of this.planets) {
      planet.y += planet.vy * dt;
      if (planet.y > this.height + planet.radius + 50)
        planet.y = -planet.radius - 50;
      this.drawPlanet(planet);
    }
    for (const star of this.stars) {
      star.y += star.speed * dt * 0.06;
      if (star.y > this.height + 2) {
        star.y = -2;
        star.x = Math.random() * this.width;
      }
      const twinkle = 0.6 + Math.sin(Date.now() * 2e-3 + star.x) * 0.4;
      ctx.globalAlpha = star.brightness * twinkle;
      ctx.fillStyle = star.layer === 2 ? "#ffffff" : star.layer === 1 ? "#aaddff" : "#6699cc";
      ctx.beginPath();
      ctx.arc(
        star.x,
        star.y,
        star.radius * (star.layer === 2 ? 1 : 0.7),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  drawPlanet(planet) {
    const ctx = this.ctx;
    ctx.save();
    const glow = ctx.createRadialGradient(
      planet.x,
      planet.y,
      0,
      planet.x,
      planet.y,
      planet.radius * 2
    );
    glow.addColorStop(0, planet.color.replace("0a", "22"));
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius * 2, 0, Math.PI * 2);
    ctx.fill();
    const grad = ctx.createRadialGradient(
      planet.x - planet.radius * 0.3,
      planet.y - planet.radius * 0.3,
      0,
      planet.x,
      planet.y,
      planet.radius
    );
    grad.addColorStop(0, "rgba(255,255,255,0.15)");
    grad.addColorStop(0.5, planet.color);
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();
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
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }
  // ─── Apply Shake Transform ───────────────────────────────────────────────────
  beginFrame() {
    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);
  }
  endFrame() {
    this.ctx.restore();
  }
  // ─── Player ─────────────────────────────────────────────────────────────────
  drawPlayer(player) {
    if (player.invincible && Math.floor(Date.now() / 80) % 2 === 0) return;
    const ctx = this.ctx;
    const { x, y, radius, rotation, skinIndex, shieldHp } = player;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    if (shieldHp > 0) {
      const shieldAlpha = 0.15 + 0.15 * Math.sin(Date.now() * 5e-3);
      const shieldGrad = ctx.createRadialGradient(
        0,
        0,
        radius,
        0,
        0,
        radius + 14
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
    const skinColors = [
      ["#00ffff", "#0055ff"],
      ["#00ff88", "#005522"],
      ["#ff6600", "#660000"],
      ["#ff00ff", "#440044"]
    ];
    const [primaryColor, secondaryColor] = skinColors[skinIndex % skinColors.length];
    const engineGlow = ctx.createRadialGradient(0, 8, 0, 0, 8, 20);
    engineGlow.addColorStop(0, `${primaryColor}88`);
    engineGlow.addColorStop(1, "transparent");
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(0, 8, 20, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillStyle = secondaryColor;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.3);
    ctx.lineTo(-radius * 0.4, radius * 0.5);
    ctx.lineTo(0, radius * 0.1);
    ctx.lineTo(radius * 0.4, radius * 0.5);
    ctx.closePath();
    ctx.fill();
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
  drawEnemy(enemy) {
    const ctx = this.ctx;
    const stats = ENEMY_STATS[enemy.type];
    const { x, y, radius, hp, maxHp, shieldHp, maxShieldHp, rotation } = enemy;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation + Math.PI);
    if (shieldHp > 0) {
      const sAlpha = shieldHp / maxShieldHp * 0.4;
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
          const ang = i / 6 * Math.PI * 2 + rotation * 0.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * radius, Math.sin(ang) * radius);
          ctx.lineTo(
            Math.cos(ang + 0.5) * radius * 0.6,
            Math.sin(ang + 0.5) * radius * 0.6
          );
          ctx.closePath();
          ctx.fill();
        }
        break;
      case "boss":
        ctx.beginPath();
        ctx.moveTo(0, -radius);
        for (let i = 1; i <= 8; i++) {
          const ang = i / 8 * Math.PI * 2 - Math.PI / 2;
          const r = i % 2 === 0 ? radius : radius * 0.65;
          ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#ff0000";
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
        ctx.fill();
        break;
    }
    ctx.shadowBlur = 0;
    if (hp < maxHp && enemy.type !== "drone") {
      const barW = radius * 2.2;
      const barH = 4;
      const barX = -barW / 2;
      const barY = -radius - 10;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(barX, barY, barW, barH);
      const hpFrac = hp / maxHp;
      const hpColor = hpFrac > 0.5 ? "#00ff88" : hpFrac > 0.25 ? "#ffaa00" : "#ff3366";
      ctx.fillStyle = hpColor;
      ctx.fillRect(barX, barY, barW * hpFrac, barH);
    }
    ctx.restore();
  }
  // ─── Bullets ────────────────────────────────────────────────────────────────
  drawBullet(x, y, weapon, radius, _isPlayer) {
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
  drawParticles(particles) {
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
        Math.max(0.1, p.radius * (1 - p.lifetime / p.maxLifetime * 0.5)),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }
  // ─── Power-Ups ───────────────────────────────────────────────────────────────
  drawPowerUp(pu) {
    const ctx = this.ctx;
    const cfg = POWERUP_CONFIG[pu.type];
    const pulse = 0.8 + Math.sin(pu.pulsePhase) * 0.2;
    ctx.save();
    ctx.translate(pu.x, pu.y);
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 18 * pulse;
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
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
  drawTextEffects(effects) {
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
  drawHUD(session, player) {
    const ctx = this.ctx;
    const pad = 14;
    const barH = 7;
    const barW = 100;
    const drawBar = (index, value, max, color, label) => {
      const y = pad + index * (barH + 6);
      const frac = Math.max(0, Math.min(1, value / max));
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(pad, y, barW, barH);
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      const grad = ctx.createLinearGradient(pad, y, pad + barW, y);
      grad.addColorStop(0, color);
      grad.addColorStop(1, `${color}88`);
      ctx.fillStyle = grad;
      ctx.fillRect(pad, y, barW * frac, barH);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(
        `${label} ${Math.round(value)}/${max}`,
        pad + barW + 6,
        y + barH - 1
      );
    };
    drawBar(0, player.hp, player.maxHp, COLORS.danger, "HP");
    drawBar(1, player.shieldHp, player.maxShieldHp, COLORS.shieldBar, "SH");
    drawBar(2, player.energy, player.maxEnergy, COLORS.accent, "EN");
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
      this.height - 16
    );
    ctx.textAlign = "right";
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(
      `${Math.round(session.fps)} FPS`,
      this.width - pad,
      this.height - 8
    );
    if (player.boostCooldown > 0) {
      const boostFrac = 1 - player.boostCooldown / 3e3;
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
  drawWaveAnnouncement(wave, alpha) {
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
  drawBossWarning(alpha) {
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
  resize(w, h) {
    this.width = w;
    this.height = h;
    this.initStars();
    this.initPlanets();
    this.generateNebula();
  }
}
let _uid = 0;
const uid = () => `e${++_uid}`;
function createPlayer(profile) {
  const unlockedWeapons = (profile == null ? void 0 : profile.weapons.filter((w) => w.unlocked).map((w) => w.weapon)) ?? ["laser"];
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
    skinIndex: (profile == null ? void 0 : profile.skinIndex) ?? 0,
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    coins: 0,
    comboCount: 0,
    comboTimer: 0,
    activeEffects: []
  };
}
function spawnEnemy(type, wave, difficulty) {
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
      stats.shieldHp * (difficulty > 1.5 ? difficulty * 0.5 : 1)
    ),
    maxShieldHp: Math.round(
      stats.shieldHp * (difficulty > 1.5 ? difficulty * 0.5 : 1)
    ),
    isEnraged: false,
    shootPattern: stats.shootPattern,
    rotation: 0
  };
}
function generateWave(wave, mode, difficulty) {
  const enemies = [];
  const isBossWave = wave % BOSS_EVERY_N_WAVES === 0;
  if (mode === "boss_battle" || isBossWave) {
    enemies.push(spawnEnemy("boss", wave, difficulty));
    if (wave > 5) {
      enemies.push(spawnEnemy("miniboss", wave, difficulty * 0.7));
    }
    return enemies;
  }
  const count = ENEMIES_PER_WAVE_BASE + wave * ENEMIES_PER_WAVE_INCREMENT;
  const types = wave < 3 ? ["scout"] : wave < 6 ? ["scout", "fighter"] : wave < 10 ? ["scout", "fighter", "drone"] : ["scout", "fighter", "bomber", "drone"];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    enemies.push(spawnEnemy(type, wave, difficulty));
  }
  if (wave >= 5 && wave % 3 === 0) {
    enemies.push(spawnEnemy("miniboss", wave, difficulty * 0.8));
  }
  return enemies;
}
function GameCanvas() {
  const canvasRef = reactExports.useRef(null);
  const sessionRef = reactExports.useRef(null);
  const playerRef = reactExports.useRef(null);
  const rendererRef = reactExports.useRef(null);
  const particlesRef = reactExports.useRef(null);
  const inputRef = reactExports.useRef(null);
  const rafRef = reactExports.useRef(0);
  const shieldRegenTimerRef = reactExports.useRef(0);
  const waveAnnouncerRef = reactExports.useRef({ alpha: 0, timer: 0 });
  const bossWarningRef = reactExports.useRef({ alpha: 0, timer: 0 });
  const navigateTo = useGameStore((s) => s.navigateTo);
  const currentMode = useGameStore((s) => s.currentMode);
  const settings = useGameStore((s) => s.settings);
  const profile = useGameStore((s) => s.playerProfile);
  useGameStore((s) => s.currentScreen);
  const [isPaused, setIsPaused] = reactExports.useState(false);
  const [isGameOver, setIsGameOver] = reactExports.useState(false);
  const [finalScore, setFinalScore] = reactExports.useState(0);
  const [finalWave, setFinalWave] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const modeConfig = GAME_MODES[currentMode];
    const player = createPlayer(profile);
    playerRef.current = player;
    const session = {
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
      comboMax: 0
    };
    sessionRef.current = session;
    const renderer = new Renderer(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
    rendererRef.current = renderer;
    const particles = new ParticleSystem();
    particlesRef.current = particles;
    const input = new InputManager();
    input.attach(canvas);
    inputRef.current = input;
    spawnWave(session, currentMode);
    waveAnnouncerRef.current = { alpha: 1, timer: 2500 };
    audioEngine.playMusic("battle");
    return () => {
      cancelAnimationFrame(rafRef.current);
      input.detach();
      audioEngine.stopMusic();
    };
  }, [currentMode, profile]);
  const spawnWave = reactExports.useCallback((session, mode) => {
    var _a;
    const newEnemies = generateWave(session.wave, mode, session.difficulty);
    const isBossWave = newEnemies.some((e) => e.type === "boss");
    for (let i = 0; i < newEnemies.length; i++) {
      newEnemies[i].y = -newEnemies[i].radius - 20 - i * 25;
      newEnemies[i].x = 40 + i % 7 * ((CANVAS_WIDTH - 80) / 6);
    }
    session.enemies.push(...newEnemies);
    if (isBossWave) {
      session.bossActive = true;
      session.currentBossId = ((_a = newEnemies.find((e) => e.type === "boss")) == null ? void 0 : _a.id) ?? null;
      bossWarningRef.current = { alpha: 1, timer: 2e3 };
      audioEngine.playMusic("boss");
    }
  }, []);
  const gameLoop = reactExports.useCallback(
    (timestamp) => {
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
      const dt = Math.min(raw_dt, 50);
      session.lastTimestamp = timestamp;
      session.elapsed += dt;
      session.frameCount++;
      if (session.frameCount % 20 === 0) session.fps = 1e3 / (raw_dt || 16);
      const inp = input.getState();
      if (inp.pause) {
        togglePause();
        return;
      }
      if (inp.weapon1 && player.weapons[0]) player.weapon = player.weapons[0];
      if (inp.weapon2 && player.weapons[1]) player.weapon = player.weapons[1];
      if (inp.weapon3 && player.weapons[2]) player.weapon = player.weapons[2];
      if (inp.weapon4 && player.weapons[3]) player.weapon = player.weapons[3];
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
      const dtSec = dt / 1e3;
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
        const mag = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (mag > speed) {
          player.vx = player.vx / mag * speed;
          player.vy = player.vy / mag * speed;
        }
      }
      player.x = Math.max(
        player.radius,
        Math.min(CANVAS_WIDTH - player.radius, player.x + player.vx * dtSec)
      );
      player.y = Math.max(
        player.radius,
        Math.min(CANVAS_HEIGHT - player.radius, player.y + player.vy * dtSec)
      );
      if (inp.aimActive) {
        const dx = inp.aimX - player.x;
        const dy = inp.aimY - player.y;
        player.rotation = Math.atan2(dy, dx) + Math.PI / 2;
      } else {
        if (player.vx !== 0 || player.vy !== 0) {
          const targetRot = Math.atan2(player.vy, player.vx) + Math.PI / 2;
          const diff = (targetRot - player.rotation + Math.PI * 3) % (Math.PI * 2) - Math.PI;
          player.rotation += diff * 0.15;
        }
      }
      player.thrusterPhase += dtSec * 8;
      particles.emitThruster(
        player.x + Math.sin(player.rotation) * player.radius * 0.6,
        player.y - Math.cos(player.rotation) * player.radius * 0.6,
        player.rotation,
        player.isBoosting
      );
      player.energy = Math.min(player.maxEnergy, player.energy + 0.8 * dtSec);
      shieldRegenTimerRef.current = Math.max(
        0,
        shieldRegenTimerRef.current - dt
      );
      if (shieldRegenTimerRef.current === 0) {
        player.shieldHp = Math.min(
          player.maxShieldHp,
          player.shieldHp + 0.3 * dtSec
        );
      }
      if (player.comboCount > 0) {
        player.comboTimer -= dt;
        if (player.comboTimer <= 0) {
          player.comboCount = 0;
          player.comboTimer = 0;
        }
      }
      for (let i = player.activeEffects.length - 1; i >= 0; i--) {
        player.activeEffects[i].duration -= dt;
        if (player.activeEffects[i].duration <= 0)
          player.activeEffects.splice(i, 1);
      }
      if (inp.shoot) {
        const wstats = WEAPON_STATS[player.weapon];
        const rapidEffect = player.activeEffects.find(
          (e) => e.type === "rapid_fire"
        );
        const effectiveFireRate = rapidEffect ? wstats.fireRate * 0.5 : wstats.fireRate;
        const now = session.elapsed;
        if (now - player.lastFired >= effectiveFireRate && player.energy >= wstats.energyCost) {
          player.lastFired = now;
          player.energy -= wstats.energyCost;
          session.shotsFired++;
          for (let s = 0; s < wstats.bulletsPerShot; s++) {
            const spreadRad = wstats.spread * (Math.PI / 180) * (s - (wstats.bulletsPerShot - 1) / 2);
            const baseAngle = player.rotation - Math.PI / 2;
            const angle = baseAngle + spreadRad;
            const dmgMultiplier = player.activeEffects.find(
              (e) => e.type === "double_damage"
            ) ? 2 : 1;
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
              maxLifetime: 2e3,
              homing: wstats.homing
            });
          }
          audioEngine.playSFX(
            `${player.weapon}_fire`
          );
        }
      }
      for (let i = session.bullets.length - 1; i >= 0; i--) {
        const b = session.bullets[i];
        b.lifetime += dt;
        if (b.homing && b.isPlayerBullet && session.enemies.length > 0) {
          const nearest = session.enemies.reduce((best, e) => {
            const dx2 = e.x - b.x;
            const dy2 = e.y - b.y;
            const d = dx2 * dx2 + dy2 * dy2;
            const bd = (best.x - b.x) ** 2 + (best.y - b.y) ** 2;
            return d < bd ? e : best;
          });
          const dx = nearest.x - b.x;
          const dy = nearest.y - b.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          b.vx += dx / len * 800 * dtSec;
          b.vy += dy / len * 800 * dtSec;
          const spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          const wSpd = WEAPON_STATS[b.weapon].bulletSpeed;
          if (spd > wSpd) {
            b.vx = b.vx / spd * wSpd;
            b.vy = b.vy / spd * wSpd;
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
            pCount.trail
          );
        if (b.lifetime >= b.maxLifetime || b.x < -50 || b.x > CANVAS_WIDTH + 50 || b.y < -200 || b.y > CANVAS_HEIGHT + 50) {
          session.bullets.splice(i, 1);
        }
      }
      for (let i = session.enemies.length - 1; i >= 0; i--) {
        const e = session.enemies[i];
        e.phaseTimer += dt;
        e.rotation += dtSec * (e.type === "miniboss" ? 1.5 : e.type === "boss" ? 0.8 : 0.3);
        const phaseFreq = e.type === "scout" ? 2e-3 : e.type === "bomber" ? 1e-3 : 15e-4;
        switch (e.type) {
          case "scout":
            e.x += Math.sin(e.phaseTimer * phaseFreq * 3) * e.speed * dtSec * 1.5;
            e.y += e.speed * dtSec;
            break;
          case "fighter":
            e.x += Math.sin(e.phaseTimer * 2e-3) * e.speed * dtSec;
            e.y += e.speed * dtSec * 0.7;
            if (e.y > CANVAS_HEIGHT * 0.3)
              e.y += Math.cos(e.phaseTimer * 1e-3) * 20 * dtSec;
            break;
          case "bomber":
            e.y += e.speed * dtSec * 0.5;
            e.x += Math.sin(e.phaseTimer * 1e-3) * e.speed * dtSec * 0.8;
            break;
          case "drone":
            e.x += Math.cos(e.phaseTimer * 3e-3) * e.speed * dtSec * 2;
            e.y += e.speed * dtSec * 1.5;
            break;
          case "miniboss": {
            const targetX = CANVAS_WIDTH / 2 + Math.sin(e.phaseTimer * 1e-3) * (CANVAS_WIDTH * 0.35);
            e.x += (targetX - e.x) * 0.02;
            if (e.y < 120) e.y += e.speed * dtSec;
            break;
          }
          case "boss": {
            const btx = CANVAS_WIDTH / 2 + Math.sin(e.phaseTimer * 8e-4) * (CANVAS_WIDTH * 0.3);
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
                session
              );
            }
            break;
          }
        }
        e.x = Math.max(e.radius, Math.min(CANVAS_WIDTH - e.radius, e.x));
        if (e.fireRate > 0 && session.elapsed - e.lastFired >= e.fireRate) {
          e.lastFired = session.elapsed;
          spawnEnemyBullets(e, session);
        }
        if (e.y > CANVAS_HEIGHT + e.radius + 20) {
          session.enemies.splice(i, 1);
        }
      }
      for (let bi = session.bullets.length - 1; bi >= 0; bi--) {
        const b = session.bullets[bi];
        if (!b.isPlayerBullet) continue;
        for (let ei = session.enemies.length - 1; ei >= 0; ei--) {
          const e = session.enemies[ei];
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > b.radius + e.radius) continue;
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
              4
            );
            if (e.hp <= 0) {
              killEnemy(e, session, particles);
              session.enemies.splice(ei, 1);
            }
          }
          break;
        }
      }
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
          shieldRegenTimerRef.current = 4e3;
        } else {
          player.hp -= b.damage * (currentMode === "hardcore" ? 2 : 1);
          player.invincible = true;
          player.invincibleTimer = PLAYER_INVINCIBLE_DURATION;
          particles.emitExplosion(
            player.x,
            player.y,
            8,
            [COLORS.danger, "#ffffff"],
            0.6
          );
          if (settings.screenShake) renderer.triggerShake(5, 200);
          audioEngine.playSFX("explosion_small");
          shieldRegenTimerRef.current = 4e3;
        }
        if (player.hp <= 0) {
          triggerGameOver(session, player);
          return;
        }
      }
      const coinMagnet = player.activeEffects.some(
        (e) => e.type === "coin_magnet"
      );
      for (let i = session.powerUps.length - 1; i >= 0; i--) {
        const pu = session.powerUps[i];
        pu.y += pu.vy;
        pu.lifetime++;
        pu.pulsePhase += 0.06;
        if (coinMagnet) {
          const dx2 = player.x - pu.x;
          const dy2 = player.y - pu.y;
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d < 200) {
            pu.x += dx2 / d * 5;
            pu.y += dy2 / d * 5;
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
      for (let i = session.textEffects.length - 1; i >= 0; i--) {
        const te = session.textEffects[i];
        te.y += te.vy * dtSec;
        te.alpha -= te.alphaDecay * dtSec;
        if (te.alpha <= 0) session.textEffects.splice(i, 1);
      }
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
            session
          );
          audioEngine.playSFX("level_up");
        }
      }
      if (session.bossActive && !session.enemies.some((e) => e.type === "boss")) {
        session.bossActive = false;
        session.currentBossId = null;
        audioEngine.playMusic("battle");
      }
      if (currentMode === "story" && session.wave > 20 && session.enemies.length === 0) {
        session.victory = true;
        triggerVictory(session);
        return;
      }
      particles.update(dt);
      renderer.updateShake(dt);
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
    [currentMode, settings, spawnWave]
  );
  reactExports.useEffect(() => {
    if (sessionRef.current && !isPaused && !isGameOver) {
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop, isPaused, isGameOver]);
  function addTextEffect(text, x, y, color, size, session) {
    session.textEffects.push({
      id: uid(),
      x,
      y,
      vy: -50,
      text,
      color,
      alpha: 1,
      alphaDecay: 0.8,
      fontSize: size
    });
  }
  function killEnemy(e, session, particles) {
    var _a;
    session.killCount++;
    const modeMultiplier = GAME_MODES[currentMode].scoreMultiplier;
    const comboBonus = Math.min(COMBO_MULTIPLIER_MAX, player_comboMultiplier());
    const pts = Math.round(
      ENEMY_STATS[e.type].pointsValue * modeMultiplier * comboBonus * session.difficulty
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
      session
    );
    const pCount = PARTICLE_COUNTS[settings.particleCount];
    const colors = [ENEMY_STATS[e.type].color, "#ff8800", "#ffffff"];
    if (e.type === "boss" || e.type === "miniboss") {
      particles.emitBigExplosion(e.x, e.y, pCount.explosion_boss, colors);
      (_a = rendererRef.current) == null ? void 0 : _a.triggerShake(
        e.type === "boss" ? 18 : 10,
        e.type === "boss" ? 600 : 400
      );
      audioEngine.playSFX(
        e.type === "boss" ? "explosion_boss" : "explosion_large"
      );
    } else {
      particles.emitExplosion(e.x, e.y, pCount.explosion_small, colors);
      audioEngine.playSFX("explosion_small");
    }
    const dropChance = e.type === "boss" ? 1 : e.type === "miniboss" ? 0.7 : e.type === "drone" ? 0.05 : 0.15;
    if (Math.random() < dropChance) {
      spawnPowerUp(e.x, e.y, session);
    }
  }
  function player_comboMultiplier() {
    var _a;
    const count = ((_a = playerRef.current) == null ? void 0 : _a.comboCount) ?? 0;
    if (count < 2) return 1;
    if (count < 5) return 1.5;
    if (count < 10) return 2;
    if (count < 20) return 3;
    return COMBO_MULTIPLIER_MAX;
  }
  function spawnPowerUp(x, y, session) {
    const types = Object.keys(POWERUP_CONFIG);
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
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
  function applyPowerUp(pu, player, session, particles) {
    var _a;
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
        (_a = rendererRef.current) == null ? void 0 : _a.triggerShake(20, 800);
        audioEngine.playSFX("explosion_boss");
        break;
      default:
        if (cfg.duration > 0) {
          const existing = player.activeEffects.findIndex(
            (e) => e.type === pu.type
          );
          if (existing >= 0)
            player.activeEffects[existing].duration = cfg.duration;
          else
            player.activeEffects.push({
              type: pu.type,
              duration: cfg.duration,
              maxDuration: cfg.duration
            });
        }
    }
    addTextEffect(
      cfg.name.toUpperCase(),
      pu.x,
      pu.y - 20,
      cfg.color,
      14,
      session
    );
  }
  function spawnEnemyBullets(e, session) {
    var _a, _b;
    const stats = ENEMY_STATS[e.type];
    if (stats.bulletDamage <= 0) return;
    const spd = 220 + session.wave * 4;
    const toPlayerX = (((_a = playerRef.current) == null ? void 0 : _a.x) ?? CANVAS_WIDTH / 2) - e.x;
    const toPlayerY = (((_b = playerRef.current) == null ? void 0 : _b.y) ?? CANVAS_HEIGHT * 0.8) - e.y;
    const len = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY) || 1;
    const base = {
      x: e.x,
      y: e.y,
      damage: stats.bulletDamage * session.difficulty,
      weapon: "laser",
      isPlayerBullet: false,
      radius: 4,
      lifetime: 0,
      maxLifetime: 2500
    };
    switch (e.shootPattern) {
      case "straight":
        session.bullets.push({
          ...base,
          id: uid(),
          vx: toPlayerX / len * spd,
          vy: toPlayerY / len * spd,
          homing: false
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
            homing: false
          });
        }
        break;
      case "spiral":
        for (let i = 0; i < 6; i++) {
          const ang = i / 6 * Math.PI * 2 + e.phaseTimer * 2e-3;
          session.bullets.push({
            ...base,
            id: uid(),
            vx: Math.cos(ang) * spd * 0.6,
            vy: Math.sin(ang) * spd * 0.6,
            homing: false
          });
        }
        break;
      case "homing":
        session.bullets.push({
          ...base,
          id: uid(),
          vx: toPlayerX / len * spd * 0.8,
          vy: toPlayerY / len * spd * 0.8,
          homing: true
        });
        break;
    }
  }
  function togglePause() {
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
  function triggerGameOver(session, player) {
    var _a, _b;
    session.gameOver = true;
    cancelAnimationFrame(rafRef.current);
    (_a = particlesRef.current) == null ? void 0 : _a.emitBigExplosion(player.x, player.y, 50, [
      COLORS.danger,
      "#ff8800",
      "#ffffff"
    ]);
    (_b = rendererRef.current) == null ? void 0 : _b.triggerShake(20, 1e3);
    audioEngine.playSFX("player_death");
    audioEngine.stopMusic();
    setTimeout(() => {
      audioEngine.playMusic("gameover");
    }, 500);
    setFinalScore(session.score);
    setFinalWave(session.wave);
    setIsGameOver(true);
    const gs = useGameStore.getState();
    if (gs.playerProfile) {
      gs.setPlayerProfile({
        ...gs.playerProfile,
        totalScore: gs.playerProfile.totalScore + session.score,
        totalKills: gs.playerProfile.totalKills + session.killCount,
        gamesPlayed: gs.playerProfile.gamesPlayed + 1,
        highScore: Math.max(gs.playerProfile.highScore, session.score),
        totalCoins: gs.playerProfile.totalCoins + player.coins,
        lastPlayed: Date.now()
      });
    }
  }
  function triggerVictory(session) {
    cancelAnimationFrame(rafRef.current);
    audioEngine.stopMusic();
    audioEngine.playMusic("victory");
    setFinalScore(session.score);
    setFinalWave(session.wave);
    setIsGameOver(true);
  }
  const [canvasStyle, setCanvasStyle] = reactExports.useState({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT
  });
  reactExports.useEffect(() => {
    function resize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const aspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
      const windowAspect = vw / vh;
      let w;
      let h;
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "game.canvas_target", className: "game-container", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        style: { width: canvasStyle.width, height: canvasStyle.height },
        className: "game-canvas",
        tabIndex: 0
      }
    ),
    isPaused && !isGameOver && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "game.pause",
        className: "absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel p-8 flex flex-col items-center gap-4 w-64 animate-scale-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-bold text-2xl text-neon-cyan text-glow-cyan", children: "PAUSED" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "game.resume_button",
              onClick: togglePause,
              className: "w-full py-2.5 font-display text-sm text-neon-cyan border border-neon-cyan/50 rounded-lg hover:bg-neon-cyan/10",
              children: "► RESUME"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "game.menu_button",
              onClick: () => {
                audioEngine.stopMusic();
                navigateTo("menu");
              },
              className: "w-full py-2.5 font-display text-sm text-white/50 border border-white/10 rounded-lg hover:text-neon-cyan hover:border-neon-cyan/30",
              children: "↩ MAIN MENU"
            }
          )
        ] })
      }
    ),
    isGameOver && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "game.game_over",
        className: "absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hud-panel p-8 flex flex-col items-center gap-4 w-72 animate-scale-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-bold text-3xl text-neon-red text-glow-red", children: "GAME OVER" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-white/40 mb-1", children: "FINAL SCORE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-bold text-4xl text-white", children: finalScore.toLocaleString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xs text-white/40 mt-1", children: [
              "WAVE ",
              finalWave,
              " • ",
              currentMode.replace("_", " ").toUpperCase()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "game.play_again_button",
              onClick: () => {
                audioEngine.stopMusic();
                navigateTo("game");
              },
              className: "w-full py-2.5 font-display text-sm text-neon-cyan border border-neon-cyan/50 rounded-lg hover:bg-neon-cyan/10",
              children: "► PLAY AGAIN"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "game.leaderboard_button",
              onClick: () => {
                audioEngine.stopMusic();
                navigateTo("leaderboard");
              },
              className: "w-full py-2.5 font-display text-sm text-neon-gold border border-neon-gold/40 rounded-lg hover:bg-neon-gold/10",
              children: "🏆 LEADERBOARD"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              "data-ocid": "game.menu_button_gameover",
              onClick: () => {
                audioEngine.stopMusic();
                navigateTo("menu");
              },
              className: "w-full py-2.5 font-display text-sm text-white/50 border border-white/10 rounded-lg hover:text-neon-cyan",
              children: "↩ MAIN MENU"
            }
          )
        ] })
      }
    ),
    !isPaused && !isGameOver && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": "game.pause_button",
        onClick: togglePause,
        className: "absolute top-3 right-3 w-9 h-9 rounded-lg hud-panel flex items-center justify-center font-mono text-white/50 hover:text-neon-cyan text-xs",
        "aria-label": "Pause game",
        children: "⏸"
      }
    )
  ] });
}
export {
  GameCanvas as default
};
