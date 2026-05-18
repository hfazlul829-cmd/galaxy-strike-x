import { motion } from "motion/react";
import { useState } from "react";
import { audioEngine } from "../game/audioEngine";
import type { GameMode } from "../game/types";
import { useLeaderboard } from "../hooks/useBackend";
import { useGameStore } from "../store/gameStore";

const MODES: GameMode[] = ["endless", "story", "boss_battle", "hardcore"];
const MODE_LABELS: Record<GameMode, string> = {
  endless: "ENDLESS",
  story: "STORY",
  boss_battle: "BOSS BATTLE",
  hardcore: "HARDCORE",
};

export default function Leaderboard() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const [activeMode, setActiveMode] = useState<GameMode>("endless");
  const { data: entries = [], isLoading } = useLeaderboard(activeMode);

  const filtered = entries.filter((e) => e.mode === activeMode);

  return (
    <div
      data-ocid="leaderboard.page"
      className="relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-4 px-4"
        >
          <h2 className="font-display font-bold text-3xl text-white text-glow-cyan">
            🏆 LEADERBOARD
          </h2>
          <p className="font-mono text-xs text-white/40 mt-1">
            TOP PILOTS GALAXY-WIDE
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              data-ocid={`leaderboard.tab_${m}`}
              onClick={() => {
                audioEngine.playSFX("ui_click");
                setActiveMode(m);
              }}
              className={[
                "px-3 py-1.5 rounded font-mono text-[10px] tracking-widest whitespace-nowrap transition-all duration-200",
                activeMode === m
                  ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/50"
                  : "text-white/40 border border-white/10 hover:text-neon-cyan/60",
              ].join(" ")}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div
              data-ocid="leaderboard.loading_state"
              className="text-center py-12 text-white/40 font-mono text-sm"
            >
              Loading...
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header row */}
              <div className="grid grid-cols-[40px_1fr_80px_50px] gap-2 px-3 pb-1">
                <div className="font-mono text-[9px] text-white/30">#</div>
                <div className="font-mono text-[9px] text-white/30">PILOT</div>
                <div className="font-mono text-[9px] text-white/30 text-right">
                  SCORE
                </div>
                <div className="font-mono text-[9px] text-white/30 text-right">
                  WAVE
                </div>
              </div>
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.playerId}
                  data-ocid={`leaderboard.item.${i + 1}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={[
                    "hud-panel p-3 grid grid-cols-[40px_1fr_80px_50px] items-center gap-2",
                    i < 3 ? "border-neon-gold/30" : "",
                  ].join(" ")}
                >
                  <div className="font-display font-bold text-base">
                    {i === 0 ? (
                      "🥇"
                    ) : i === 1 ? (
                      "🥈"
                    ) : i === 2 ? (
                      "🥉"
                    ) : (
                      <span className="font-mono text-xs text-white/40">
                        {entry.rank}
                      </span>
                    )}
                  </div>
                  <div className="font-display font-medium text-sm text-white truncate">
                    {entry.displayName}
                  </div>
                  <div className="font-mono text-xs text-neon-cyan text-right">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="font-mono text-xs text-white/50 text-right">
                    {entry.wave}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4">
          <button
            type="button"
            data-ocid="leaderboard.back_button"
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
