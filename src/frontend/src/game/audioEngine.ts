// AudioEngine: Web Audio API synthesizer for Galaxy Strike X
// All audio is procedurally generated — no external files required

export type SFXName =
  | "laser_fire"
  | "plasma_fire"
  | "missile_fire"
  | "electric_fire"
  | "rapidfire_fire"
  | "ultimate_fire"
  | "explosion_small"
  | "explosion_large"
  | "explosion_boss"
  | "shield_hit"
  | "powerup_collect"
  | "ui_click"
  | "achievement_unlock"
  | "level_up"
  | "combo_hit"
  | "player_death"
  | "boost_start";

export type MusicTheme = "menu" | "battle" | "boss" | "victory" | "gameover";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicVolume = 0.4;
  private sfxVolume = 0.6;
  private musicGain: GainNode | null = null;
  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private currentTheme: MusicTheme | null = null;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }
    return this.ctx;
  }

  // ─── Volume Controls ────────────────────────────────────────────────────────
  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain)
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume,
        this.getCtx().currentTime,
        0.1,
      );
  }

  setSFXVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.stopMusic();
  }

  // ─── SFX ────────────────────────────────────────────────────────────────────
  playSFX(name: SFXName): void {
    if (!this.enabled || this.sfxVolume === 0) return;
    try {
      const ctx = this.getCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const gain = ctx.createGain();
      gain.gain.value = this.sfxVolume;
      gain.connect(ctx.destination);
      this.synthesizeSFX(ctx, gain, name);
    } catch {
      // silently fail if audio isn't available
    }
  }

  private synthesizeSFX(ctx: AudioContext, out: GainNode, name: SFXName): void {
    const t = ctx.currentTime;
    switch (name) {
      case "laser_fire":
        this.beepTone(ctx, out, t, 880, 0.04, 0.0, 0.06, "sawtooth");
        break;
      case "plasma_fire":
        this.beepTone(ctx, out, t, 200, 0.18, 0.0, 0.25, "square", 80);
        break;
      case "missile_fire":
        this.beepTone(ctx, out, t, 300, 0.15, 0.02, 0.3, "sawtooth", 120);
        break;
      case "electric_fire":
        this.electricBurst(ctx, out, t);
        break;
      case "rapidfire_fire":
        this.beepTone(ctx, out, t, 1200, 0.05, 0.0, 0.05, "square");
        break;
      case "ultimate_fire":
        this.ultimateFire(ctx, out, t);
        break;
      case "explosion_small":
        this.explosion(ctx, out, t, 0.3, 0.15);
        break;
      case "explosion_large":
        this.explosion(ctx, out, t, 0.8, 0.4);
        break;
      case "explosion_boss":
        this.explosion(ctx, out, t, 1.0, 0.8);
        break;
      case "shield_hit":
        this.beepTone(ctx, out, t, 600, 0.12, 0.0, 0.12, "sine", 500);
        break;
      case "powerup_collect":
        this.powerupSound(ctx, out, t);
        break;
      case "ui_click":
        this.beepTone(ctx, out, t, 1000, 0.08, 0.0, 0.06, "sine");
        break;
      case "achievement_unlock":
        this.achievementSound(ctx, out, t);
        break;
      case "level_up":
        this.levelUpSound(ctx, out, t);
        break;
      case "combo_hit":
        this.beepTone(ctx, out, t, 1400, 0.08, 0.0, 0.05, "triangle");
        break;
      case "player_death":
        this.explosion(ctx, out, t, 1.0, 1.2);
        break;
      case "boost_start":
        this.beepTone(ctx, out, t, 400, 0.2, 0.0, 0.2, "sawtooth", 200);
        break;
    }
  }

  private beepTone(
    ctx: AudioContext,
    out: GainNode,
    t: number,
    freq: number,
    vol: number,
    attack: number,
    duration: number,
    type: OscillatorType = "sine",
    freqSlide = 0,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqSlide)
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, freq - freqSlide),
        t + duration,
      );
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }

  private explosion(
    ctx: AudioContext,
    out: GainNode,
    t: number,
    vol: number,
    duration: number,
  ): void {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 1.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    source.start(t);
  }

  private electricBurst(ctx: AudioContext, out: GainNode, t: number): void {
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.04;
      this.beepTone(ctx, out, t + delay, 600 + i * 300, 0.1, 0, 0.08, "square");
    }
  }

  private ultimateFire(ctx: AudioContext, out: GainNode, t: number): void {
    this.explosion(ctx, out, t, 0.5, 0.15);
    this.beepTone(ctx, out, t, 80, 0.5, 0.01, 0.6, "sawtooth", -40);
    this.beepTone(ctx, out, t + 0.1, 1200, 0.3, 0, 0.4, "square", 800);
  }

  private powerupSound(ctx: AudioContext, out: GainNode, t: number): void {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) =>
      this.beepTone(ctx, out, t + i * 0.05, f, 0.15, 0, 0.1, "sine"),
    );
  }

  private achievementSound(ctx: AudioContext, out: GainNode, t: number): void {
    const freqs = [523, 659, 784, 1047, 1319];
    freqs.forEach((f, i) =>
      this.beepTone(ctx, out, t + i * 0.06, f, 0.2, 0, 0.15, "triangle"),
    );
  }

  private levelUpSound(ctx: AudioContext, out: GainNode, t: number): void {
    const freqs = [440, 554, 659, 880];
    freqs.forEach((f, i) =>
      this.beepTone(ctx, out, t + i * 0.07, f, 0.25, 0, 0.18, "sine"),
    );
  }

  // ─── Music ──────────────────────────────────────────────────────────────────
  playMusic(theme: MusicTheme): void {
    if (!this.enabled) return;
    if (this.currentTheme === theme) return;
    this.stopMusic();
    this.currentTheme = theme;
    try {
      const ctx = this.getCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(ctx.destination);
      this.startMusicLoop(theme);
    } catch {
      // silently fail
    }
  }

  private startMusicLoop(theme: MusicTheme): void {
    const patterns = this.getMusicPattern(theme);
    let step = 0;
    const bpm = theme === "boss" ? 160 : theme === "battle" ? 140 : 100;
    const stepDuration = 60000 / bpm / 4; // 16th notes

    this.musicInterval = setInterval(() => {
      if (!this.musicGain || !this.enabled) return;
      try {
        const ctx = this.getCtx();
        const note = patterns[step % patterns.length];
        if (note && note.freq > 0) {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = note.type ?? "square";
          osc.frequency.value = note.freq;
          env.gain.setValueAtTime(0, ctx.currentTime);
          env.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
          env.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + (stepDuration * note.duration) / 1000,
          );
          osc.connect(env);
          env.connect(this.musicGain!);
          osc.start(ctx.currentTime);
          osc.stop(
            ctx.currentTime + (stepDuration * note.duration) / 1000 + 0.05,
          );
        }
        step++;
      } catch {
        // silently fail
      }
    }, stepDuration);
  }

  private getMusicPattern(
    theme: MusicTheme,
  ): Array<{ freq: number; duration: number; type?: OscillatorType }> {
    const E4 = 330;
    const A4 = 440;
    const B4 = 494;
    const D5 = 587;
    const E5 = 659;
    const G5 = 784;
    const _ = { freq: 0, duration: 1 }; // rest
    switch (theme) {
      case "battle":
        return [
          { freq: E4, duration: 1 },
          { freq: E4, duration: 1 },
          _,
          { freq: E4, duration: 2, type: "sawtooth" },
          { freq: D5, duration: 1 },
          { freq: D5, duration: 1 },
          _,
          { freq: B4, duration: 2, type: "sawtooth" },
          { freq: A4, duration: 1 },
          _,
          { freq: A4, duration: 1 },
          { freq: E5, duration: 2 },
          _,
          { freq: G5, duration: 1 },
          { freq: E5, duration: 1 },
          { freq: D5, duration: 2 },
        ];
      case "boss":
        return [
          { freq: 110, duration: 2, type: "sawtooth" },
          _,
          { freq: 110, duration: 1, type: "sawtooth" },
          _,
          { freq: 147, duration: 2, type: "sawtooth" },
          _,
          { freq: 130, duration: 1, type: "sawtooth" },
          _,
          { freq: 98, duration: 4, type: "sawtooth" },
          _,
          _,
          _,
          { freq: 110, duration: 1, type: "sawtooth" },
          { freq: 123, duration: 1, type: "sawtooth" },
          { freq: 130, duration: 2, type: "sawtooth" },
          _,
        ];
      case "menu":
        return [
          { freq: E4, duration: 2, type: "sine" },
          _,
          { freq: A4, duration: 2, type: "sine" },
          _,
          { freq: B4, duration: 2, type: "sine" },
          _,
          { freq: E5, duration: 2, type: "sine" },
          _,
          { freq: D5, duration: 2, type: "sine" },
          _,
          { freq: B4, duration: 2, type: "sine" },
          _,
          { freq: A4, duration: 4, type: "sine" },
          _,
          _,
          _,
        ];
      case "victory":
        return [
          { freq: E5, duration: 1 },
          { freq: E5, duration: 1 },
          { freq: E5, duration: 2 },
          _,
          { freq: D5, duration: 1 },
          { freq: E5, duration: 1 },
          { freq: G5, duration: 2 },
          _,
          { freq: A4, duration: 4 },
          _,
          _,
          _,
        ];
      case "gameover":
        return [
          { freq: B4, duration: 2, type: "sawtooth" },
          _,
          { freq: A4, duration: 2, type: "sawtooth" },
          _,
          { freq: 330, duration: 2, type: "sawtooth" },
          _,
          { freq: 280, duration: 4, type: "sawtooth" },
          _,
        ];
      default:
        return [];
    }
  }

  stopMusic(): void {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTheme = null;
    if (this.musicGain) {
      try {
        this.musicGain.gain.setTargetAtTime(0, this.getCtx().currentTime, 0.1);
      } catch {
        // ignore
      }
      this.musicGain = null;
    }
  }

  dispose(): void {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
