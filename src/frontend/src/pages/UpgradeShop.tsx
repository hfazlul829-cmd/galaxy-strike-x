import { motion } from "motion/react";
import { audioEngine } from "../game/audioEngine";
import { WEAPON_STATS } from "../game/constants";
import type { WeaponType } from "../game/types";
import { useGameStore } from "../store/gameStore";

export default function UpgradeShop() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const profile = useGameStore((s) => s.playerProfile);
  const upgradeWeapon = useGameStore((s) => s.upgradeWeapon);
  const coins = profile?.totalCoins ?? 0;
  const weaponUpgrades = profile?.weapons ?? [];

  const handleUpgrade = (weapon: WeaponType) => {
    const cost = WEAPON_STATS[weapon].upgradeCost;
    if (coins < cost) return;
    audioEngine.playSFX("powerup_collect");
    upgradeWeapon(weapon);
  };

  return (
    <div
      data-ocid="shop.page"
      className="relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-8 pb-2 px-4"
        >
          <h2 className="font-display font-bold text-3xl text-white text-glow-cyan">
            ★ UPGRADE SHOP
          </h2>
          <div className="mt-2 inline-flex items-center gap-2 hud-panel px-4 py-1.5 rounded-full">
            <span className="text-neon-gold text-sm">★</span>
            <span className="font-mono text-sm font-bold text-neon-gold">
              {coins.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-white/40">COINS</span>
          </div>
        </motion.div>

        {/* Weapon cards */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {(
            Object.entries(WEAPON_STATS) as [
              WeaponType,
              (typeof WEAPON_STATS)[WeaponType],
            ][]
          ).map(([weapon, stats], i) => {
            const upgrade = weaponUpgrades.find((w) => w.weapon === weapon);
            const level = upgrade?.level ?? 1;
            const unlocked = upgrade?.unlocked ?? weapon === "laser";
            const cost = stats.upgradeCost;
            const canAfford = coins >= cost;

            return (
              <motion.div
                key={weapon}
                data-ocid={`shop.item.${i + 1}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={[
                  "hud-panel p-4",
                  !unlocked ? "opacity-60" : "",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-display font-semibold text-white text-sm">
                        {stats.name}
                      </div>
                      {unlocked && (
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            background: `${stats.color}22`,
                            color: stats.color,
                            border: `1px solid ${stats.color}44`,
                          }}
                        >
                          LVL {level}
                        </span>
                      )}
                      {!unlocked && (
                        <span className="font-mono text-[9px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">
                          LOCKED
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-white/40 mb-2">
                      {stats.description}
                    </div>
                    {/* Stats bars */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] w-12 text-white/30">
                          DMG
                        </span>
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, stats.damage / 5)}%`,
                              background: stats.color,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[9px] text-white/50 w-6 text-right">
                          {upgrade?.damage ?? stats.damage}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] w-12 text-white/30">
                          SPEED
                        </span>
                        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, stats.bulletSpeed / 8)}%`,
                              background: stats.color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      type="button"
                      data-ocid={`shop.upgrade_button.${i + 1}`}
                      onClick={() => handleUpgrade(weapon)}
                      disabled={!canAfford || !unlocked}
                      className={[
                        "px-3 py-2 rounded font-display text-xs font-semibold transition-all duration-200",
                        canAfford && unlocked
                          ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/25"
                          : "bg-white/5 text-white/25 border border-white/10 cursor-not-allowed",
                      ].join(" ")}
                    >
                      {!unlocked ? (
                        "LOCKED"
                      ) : (
                        <div>
                          <div>UPGRADE</div>
                          <div className="font-mono text-[9px] text-neon-gold mt-0.5">
                            {cost.toLocaleString()} ★
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-4">
          <button
            type="button"
            data-ocid="shop.back_button"
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
