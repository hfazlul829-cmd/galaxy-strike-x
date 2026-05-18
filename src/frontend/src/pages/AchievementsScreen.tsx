import { motion } from "motion/react";
import { audioEngine } from "../game/audioEngine";
import { ACHIEVEMENTS } from "../game/constants";
import { useGameStore } from "../store/gameStore";

export default function AchievementsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const gameSave = useGameStore((s) => s.gameSave);
  const unlockedIds = new Set(gameSave?.achievements.map((a) => a.id) ?? []);

  return (
    <div
      data-ocid="achievements.page"
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
            ACHIEVEMENTS
          </h2>
          <p className="font-mono text-xs text-white/40 mt-1">
            {unlockedIds.size}/{ACHIEVEMENTS.length} UNLOCKED
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="px-4 mb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(unlockedIds.size / ACHIEVEMENTS.length) * 100}%`,
              }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-full bg-neon-cyan rounded-full"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {ACHIEVEMENTS.map((ach, i) => {
            const unlocked = unlockedIds.has(ach.id);
            return (
              <motion.div
                key={ach.id}
                data-ocid={`achievements.item.${i + 1}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={[
                  "hud-panel p-3 flex items-center gap-3",
                  unlocked ? "border-neon-cyan/30" : "opacity-50",
                ].join(" ")}
              >
                <div
                  className={`text-2xl ${unlocked ? "" : "grayscale opacity-40"}`}
                >
                  {ach.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-display font-semibold text-sm ${unlocked ? "text-neon-cyan" : "text-white/60"}`}
                  >
                    {ach.secret && !unlocked ? "???" : ach.title}
                  </div>
                  <div className="font-mono text-[10px] text-white/40 truncate">
                    {ach.secret && !unlocked
                      ? "Secret achievement"
                      : ach.description}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-xs text-neon-gold">
                    {ach.reward}
                  </div>
                  <div className="font-mono text-[9px] text-white/30">
                    COINS
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-4">
          <button
            type="button"
            data-ocid="achievements.back_button"
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
