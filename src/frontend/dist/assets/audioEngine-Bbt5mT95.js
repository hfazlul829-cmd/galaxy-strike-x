var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class AudioEngine {
  constructor() {
    __publicField(this, "ctx", null);
    __publicField(this, "musicVolume", 0.4);
    __publicField(this, "sfxVolume", 0.6);
    __publicField(this, "musicGain", null);
    __publicField(this, "musicInterval", null);
    __publicField(this, "currentTheme", null);
    __publicField(this, "enabled", true);
  }
  getCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {
        });
      }
    }
    return this.ctx;
  }
  // ─── Volume Controls ────────────────────────────────────────────────────────
  setMusicVolume(v) {
    this.musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain)
      this.musicGain.gain.setTargetAtTime(
        this.musicVolume,
        this.getCtx().currentTime,
        0.1
      );
  }
  setSFXVolume(v) {
    this.sfxVolume = Math.max(0, Math.min(1, v));
  }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) this.stopMusic();
  }
  // ─── SFX ────────────────────────────────────────────────────────────────────
  playSFX(name) {
    if (!this.enabled || this.sfxVolume === 0) return;
    try {
      const ctx = this.getCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {
      });
      const gain = ctx.createGain();
      gain.gain.value = this.sfxVolume;
      gain.connect(ctx.destination);
      this.synthesizeSFX(ctx, gain, name);
    } catch {
    }
  }
  synthesizeSFX(ctx, out, name) {
    const t = ctx.currentTime;
    switch (name) {
      case "laser_fire":
        this.beepTone(ctx, out, t, 880, 0.04, 0, 0.06, "sawtooth");
        break;
      case "plasma_fire":
        this.beepTone(ctx, out, t, 200, 0.18, 0, 0.25, "square", 80);
        break;
      case "missile_fire":
        this.beepTone(ctx, out, t, 300, 0.15, 0.02, 0.3, "sawtooth", 120);
        break;
      case "electric_fire":
        this.electricBurst(ctx, out, t);
        break;
      case "rapidfire_fire":
        this.beepTone(ctx, out, t, 1200, 0.05, 0, 0.05, "square");
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
        this.explosion(ctx, out, t, 1, 0.8);
        break;
      case "shield_hit":
        this.beepTone(ctx, out, t, 600, 0.12, 0, 0.12, "sine", 500);
        break;
      case "powerup_collect":
        this.powerupSound(ctx, out, t);
        break;
      case "ui_click":
        this.beepTone(ctx, out, t, 1e3, 0.08, 0, 0.06, "sine");
        break;
      case "achievement_unlock":
        this.achievementSound(ctx, out, t);
        break;
      case "level_up":
        this.levelUpSound(ctx, out, t);
        break;
      case "combo_hit":
        this.beepTone(ctx, out, t, 1400, 0.08, 0, 0.05, "triangle");
        break;
      case "player_death":
        this.explosion(ctx, out, t, 1, 1.2);
        break;
      case "boost_start":
        this.beepTone(ctx, out, t, 400, 0.2, 0, 0.2, "sawtooth", 200);
        break;
    }
  }
  beepTone(ctx, out, t, freq, vol, attack, duration, type = "sine", freqSlide = 0) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqSlide)
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(1, freq - freqSlide),
        t + duration
      );
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + attack);
    gain.gain.exponentialRampToValueAtTime(1e-3, t + duration);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  }
  explosion(ctx, out, t, vol, duration) {
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
    gain.gain.exponentialRampToValueAtTime(1e-3, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    source.start(t);
  }
  electricBurst(ctx, out, t) {
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.04;
      this.beepTone(ctx, out, t + delay, 600 + i * 300, 0.1, 0, 0.08, "square");
    }
  }
  ultimateFire(ctx, out, t) {
    this.explosion(ctx, out, t, 0.5, 0.15);
    this.beepTone(ctx, out, t, 80, 0.5, 0.01, 0.6, "sawtooth", -40);
    this.beepTone(ctx, out, t + 0.1, 1200, 0.3, 0, 0.4, "square", 800);
  }
  powerupSound(ctx, out, t) {
    const freqs = [523, 659, 784, 1047];
    freqs.forEach(
      (f, i) => this.beepTone(ctx, out, t + i * 0.05, f, 0.15, 0, 0.1, "sine")
    );
  }
  achievementSound(ctx, out, t) {
    const freqs = [523, 659, 784, 1047, 1319];
    freqs.forEach(
      (f, i) => this.beepTone(ctx, out, t + i * 0.06, f, 0.2, 0, 0.15, "triangle")
    );
  }
  levelUpSound(ctx, out, t) {
    const freqs = [440, 554, 659, 880];
    freqs.forEach(
      (f, i) => this.beepTone(ctx, out, t + i * 0.07, f, 0.25, 0, 0.18, "sine")
    );
  }
  // ─── Music ──────────────────────────────────────────────────────────────────
  playMusic(theme) {
    if (!this.enabled) return;
    if (this.currentTheme === theme) return;
    this.stopMusic();
    this.currentTheme = theme;
    try {
      const ctx = this.getCtx();
      if (ctx.state === "suspended") ctx.resume().catch(() => {
      });
      this.musicGain = ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(ctx.destination);
      this.startMusicLoop(theme);
    } catch {
    }
  }
  startMusicLoop(theme) {
    const patterns = this.getMusicPattern(theme);
    let step = 0;
    const bpm = theme === "boss" ? 160 : theme === "battle" ? 140 : 100;
    const stepDuration = 6e4 / bpm / 4;
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
            1e-3,
            ctx.currentTime + stepDuration * note.duration / 1e3
          );
          osc.connect(env);
          env.connect(this.musicGain);
          osc.start(ctx.currentTime);
          osc.stop(
            ctx.currentTime + stepDuration * note.duration / 1e3 + 0.05
          );
        }
        step++;
      } catch {
      }
    }, stepDuration);
  }
  getMusicPattern(theme) {
    const E4 = 330;
    const A4 = 440;
    const B4 = 494;
    const D5 = 587;
    const E5 = 659;
    const G5 = 784;
    const _ = { freq: 0, duration: 1 };
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
          { freq: D5, duration: 2 }
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
          _
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
          _
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
          _
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
          _
        ];
      default:
        return [];
    }
  }
  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTheme = null;
    if (this.musicGain) {
      try {
        this.musicGain.gain.setTargetAtTime(0, this.getCtx().currentTime, 0.1);
      } catch {
      }
      this.musicGain = null;
    }
  }
  dispose() {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close().catch(() => {
      });
      this.ctx = null;
    }
  }
}
const audioEngine = new AudioEngine();
export {
  audioEngine as a
};
