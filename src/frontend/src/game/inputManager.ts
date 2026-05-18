import type { Vec2 } from "./types";

export interface InputState {
  // Keyboard
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  shoot: boolean;
  boost: boolean;
  special: boolean;
  pause: boolean;
  weapon1: boolean;
  weapon2: boolean;
  weapon3: boolean;
  weapon4: boolean;
  // Mouse / touch aim
  aimX: number;
  aimY: number;
  aimActive: boolean;
  // Virtual joystick
  joystickActive: boolean;
  joystickAngle: number;
  joystickMagnitude: number; // 0-1
  // Gamepad
  gamepadConnected: boolean;
}

interface Touch {
  id: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  side: "left" | "right";
}

const JOYSTICK_MAX_DIST = 55;

export class InputManager {
  private state: InputState;
  private canvas: HTMLCanvasElement | null = null;
  private activeTouches = new Map<number, Touch>();
  private gamepadIndex: number | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
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
      gamepadConnected: false,
    };
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.addListeners();
  }

  detach(): void {
    for (const fn of this.listeners) {
      fn();
    }
    this.listeners = [];
    this.canvas = null;
  }

  getState(): Readonly<InputState> {
    this.pollGamepad();
    return this.state;
  }

  // ─── Keyboard ───────────────────────────────────────────────────────────────
  private addListeners(): void {
    const onKeyDown = (e: KeyboardEvent) => this.onKey(e, true);
    const onKeyUp = (e: KeyboardEvent) => this.onKey(e, false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onMouseMove = (e: MouseEvent) => this.onMouseMove(e);
    const onMouseDown = (e: MouseEvent) => this.onMouseButton(e, true);
    const onMouseUp = (e: MouseEvent) => this.onMouseButton(e, false);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("contextmenu", (e) => e.preventDefault());

    const onTouchStart = (e: TouchEvent) => this.onTouchStart(e);
    const onTouchMove = (e: TouchEvent) => this.onTouchMove(e);
    const onTouchEnd = (e: TouchEvent) => this.onTouchEnd(e);
    const canv = this.canvas ?? window;
    canv.addEventListener("touchstart", onTouchStart as EventListener, {
      passive: false,
    });
    canv.addEventListener("touchmove", onTouchMove as EventListener, {
      passive: false,
    });
    canv.addEventListener("touchend", onTouchEnd as EventListener, {
      passive: false,
    });
    canv.addEventListener("touchcancel", onTouchEnd as EventListener, {
      passive: false,
    });

    const onGamepadConnect = (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
      this.state.gamepadConnected = true;
    };
    const onGamepadDisconnect = (e: GamepadEvent) => {
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
        canv.removeEventListener("touchstart", onTouchStart as EventListener);
        canv.removeEventListener("touchmove", onTouchMove as EventListener);
        canv.removeEventListener("touchend", onTouchEnd as EventListener);
        canv.removeEventListener("touchcancel", onTouchEnd as EventListener);
      },
      () => {
        window.removeEventListener("gamepadconnected", onGamepadConnect);
        window.removeEventListener("gamepaddisconnected", onGamepadDisconnect);
      },
    );
  }

  private onKey(e: KeyboardEvent, down: boolean): void {
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
  private onMouseMove(e: MouseEvent): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    this.state.aimX = (e.clientX - rect.left) * scaleX;
    this.state.aimY = (e.clientY - rect.top) * scaleY;
    this.state.aimActive = true;
  }

  private onMouseButton(e: MouseEvent, down: boolean): void {
    if (e.button === 0) this.state.shoot = down;
    if (e.button === 2) this.state.special = down;
  }

  // ─── Touch ──────────────────────────────────────────────────────────────────
  private getTouchCanvas(clientX: number): "left" | "right" {
    if (!this.canvas) return "right";
    const rect = this.canvas.getBoundingClientRect();
    return clientX < rect.left + rect.width / 2 ? "left" : "right";
  }

  private canvasCoords(clientX: number, clientY: number): Vec2 {
    if (!this.canvas) return { x: clientX, y: clientY };
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  private onTouchStart(e: TouchEvent): void {
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
        side,
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

  private onTouchMove(e: TouchEvent): void {
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

  private onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      const existing = this.activeTouches.get(t.identifier);
      if (existing?.side === "right") this.state.shoot = false;
      this.activeTouches.delete(t.identifier);
    }
    this.updateJoystick();
  }

  private updateJoystick(): void {
    let leftTouch: Touch | null = null;
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        leftTouch = touch;
        break;
      }
    }
    if (!leftTouch) {
      this.state.joystickActive = false;
      this.state.joystickMagnitude = 0;
      this.state.left =
        this.state.right =
        this.state.up =
        this.state.down =
          false;
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
    // Map joystick to directional booleans
    this.state.left = dx < -JOYSTICK_MAX_DIST * 0.3;
    this.state.right = dx > JOYSTICK_MAX_DIST * 0.3;
    this.state.up = dy < -JOYSTICK_MAX_DIST * 0.3;
    this.state.down = dy > JOYSTICK_MAX_DIST * 0.3;
  }

  getJoystickCenter(): Vec2 | null {
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        return { x: touch.startX, y: touch.startY };
      }
    }
    return null;
  }

  getJoystickCurrent(): Vec2 | null {
    for (const [, touch] of this.activeTouches) {
      if (touch.side === "left") {
        return { x: touch.currentX, y: touch.currentY };
      }
    }
    return null;
  }

  // ─── Gamepad ─────────────────────────────────────────────────────────────────
  private pollGamepad(): void {
    if (this.gamepadIndex === null) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gamepadIndex];
    if (!gp) return;
    const s = this.state;
    // Left stick
    const lx = gp.axes[0] ?? 0;
    const ly = gp.axes[1] ?? 0;
    const dead = 0.2;
    s.left = lx < -dead;
    s.right = lx > dead;
    s.up = ly < -dead;
    s.down = ly > dead;
    s.shoot = gp.buttons[0]?.pressed ?? false; // A
    s.special = gp.buttons[1]?.pressed ?? false; // B
    s.boost = gp.buttons[5]?.pressed ?? false; // RB
    // Right stick as aim direction
    const rx = gp.axes[2] ?? 0;
    const ry = gp.axes[3] ?? 0;
    if (Math.abs(rx) > dead || Math.abs(ry) > dead) {
      s.aimX = 240 + rx * 200;
      s.aimY = 400 + ry * 200;
      s.aimActive = true;
    }
  }

  resetPauseToggle(): void {
    // Call after consuming pause event
    // The pause is toggled on keydown, not held, so no reset needed for normal flow
  }
}
