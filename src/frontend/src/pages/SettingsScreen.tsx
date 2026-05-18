import { motion } from "motion/react";
import { audioEngine } from "../game/audioEngine";
import { useGameStore } from "../store/gameStore";

export default function SettingsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const handleSlider = (key: "musicVolume" | "sfxVolume", value: number) => {
    updateSettings({ [key]: value });
    if (key === "musicVolume") audioEngine.setMusicVolume(value);
    if (key === "sfxVolume") audioEngine.setSFXVolume(value);
  };

  return (
    <div
      data-ocid="settings.page"
      className="relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-6 px-4"
        >
          <h2 className="font-display font-bold text-3xl text-white text-glow-cyan">
            ⚙️ SETTINGS
          </h2>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {/* Audio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hud-panel p-4"
          >
            <div className="font-display font-semibold text-neon-cyan text-sm mb-4">
              AUDIO
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label
                    htmlFor="music-vol"
                    className="font-mono text-xs text-white/60"
                  >
                    MUSIC VOLUME
                  </label>
                  <span className="font-mono text-xs text-neon-cyan">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  id="music-vol"
                  data-ocid="settings.music_volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) =>
                    handleSlider(
                      "musicVolume",
                      Number.parseFloat(e.target.value),
                    )
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label
                    htmlFor="sfx-vol"
                    className="font-mono text-xs text-white/60"
                  >
                    SFX VOLUME
                  </label>
                  <span className="font-mono text-xs text-neon-cyan">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  id="sfx-vol"
                  data-ocid="settings.sfx_volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) =>
                    handleSlider("sfxVolume", Number.parseFloat(e.target.value))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>

          {/* Visuals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="hud-panel p-4"
          >
            <div className="font-display font-semibold text-neon-cyan text-sm mb-4">
              VISUALS
            </div>
            <div className="space-y-3">
              {(
                [
                  {
                    key: "quality" as const,
                    label: "QUALITY",
                    options: ["low", "medium", "high"],
                  },
                  {
                    key: "particleCount" as const,
                    label: "PARTICLES",
                    options: ["low", "medium", "high"],
                  },
                ] as const
              ).map(({ key, label, options }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="font-mono text-xs text-white/60">
                    {label}
                  </span>
                  <div className="flex gap-1">
                    {options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        data-ocid={`settings.${key}_${opt}`}
                        onClick={() => {
                          audioEngine.playSFX("ui_click");
                          updateSettings({ [key]: opt });
                        }}
                        className={[
                          "px-2 py-1 rounded font-mono text-[9px] tracking-widest transition-all duration-150",
                          settings[key] === opt
                            ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/50"
                            : "text-white/30 border border-white/10 hover:text-neon-cyan/50",
                        ].join(" ")}
                      >
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Toggles */}
              {(
                [
                  { key: "screenShake" as const, label: "SCREEN SHAKE" },
                  { key: "showFps" as const, label: "SHOW FPS" },
                  { key: "vibration" as const, label: "VIBRATION" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-mono text-xs text-white/60">
                    {label}
                  </span>
                  <button
                    type="button"
                    data-ocid={`settings.${key}_toggle`}
                    onClick={() => {
                      audioEngine.playSFX("ui_click");
                      updateSettings({ [key]: !settings[key] });
                    }}
                    className={[
                      "w-10 h-5 rounded-full transition-all duration-200 relative",
                      settings[key] ? "bg-neon-cyan/30" : "bg-white/10",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
                        settings[key]
                          ? "left-5 bg-neon-cyan"
                          : "left-0.5 bg-white/40",
                      ].join(" ")}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="p-4">
          <button
            type="button"
            data-ocid="settings.back_button"
            onClick={() => {
              audioEngine.playSFX("ui_click");
              navigateTo("menu");
            }}
            className="w-full py-2.5 font-display text-sm text-white/50 hover:text-neon-cyan transition-colors border border-white/10 hover:border-neon-cyan/30 rounded-lg"
          >
            ← BACK
          </button>
        </div>
      </div>
    </div>
  );
}
