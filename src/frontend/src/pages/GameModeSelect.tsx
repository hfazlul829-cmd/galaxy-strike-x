import { motion } from "motion/react";
import { audioEngine } from "../game/audioEngine";
import { GAME_MODES } from "../game/constants";
import type { GameMode } from "../game/types";
import { useGameStore } from "../store/gameStore";

export default function GameModeSelect() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const setCurrentMode = useGameStore((s) => s.setCurrentMode);

  const handleSelect = (mode: GameMode) => {
    audioEngine.playSFX("ui_click");
    setCurrentMode(mode);
    navigateTo("game");
  };

  return (
    <div
      data-ocid="mode_select.page"
      className="relative w-full h-full bg-space-black flex flex-col items-center justify-center px-4"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-space-bg.dim_1920x1080.jpg')",
          backgroundSize: "cover",
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="font-display font-bold text-3xl text-white text-glow-cyan">
            SELECT MODE
          </h2>
          <p className="font-mono text-xs text-white/40 mt-1">
            Choose your battle
          </p>
        </motion.div>

        <div className="space-y-3">
          {(
            Object.entries(GAME_MODES) as [
              GameMode,
              (typeof GAME_MODES)[GameMode],
            ][]
          ).map(([mode, cfg], i) => (
            <motion.button
              key={mode}
              type="button"
              data-ocid={`mode_select.mode_${mode}_button`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(mode)}
              className="w-full hud-panel p-4 text-left hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-200 group flex items-center gap-4"
            >
              <span className="text-3xl">{cfg.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-white group-hover:text-neon-cyan transition-colors">
                  {cfg.title}
                </div>
                <div className="font-mono text-xs text-white/50 mt-0.5 truncate">
                  {cfg.description}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xs text-neon-gold">
                  {cfg.scoreMultiplier}× SCORE
                </div>
                <div className="font-mono text-[9px] text-white/30 mt-0.5">
                  {cfg.difficultyMultiplier}× DIFF
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          type="button"
          data-ocid="mode_select.back_button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => {
            audioEngine.playSFX("ui_click");
            navigateTo("menu");
          }}
          className="w-full mt-4 py-2.5 font-display text-sm text-white/50 hover:text-neon-cyan transition-colors border border-white/10 hover:border-neon-cyan/30 rounded-lg"
        >
          ← BACK
        </motion.button>
      </div>
    </div>
  );
}
