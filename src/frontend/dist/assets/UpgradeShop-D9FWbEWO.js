import { u as useGameStore, j as jsxRuntimeExports, W as WEAPON_STATS } from "./index-BeDg1Gbc.js";
import { a as audioEngine } from "./audioEngine-Bbt5mT95.js";
import { m as motion } from "./proxy-BE2cmtP9.js";
function UpgradeShop() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const profile = useGameStore((s) => s.playerProfile);
  const upgradeWeapon = useGameStore((s) => s.upgradeWeapon);
  const coins = (profile == null ? void 0 : profile.totalCoins) ?? 0;
  const weaponUpgrades = (profile == null ? void 0 : profile.weapons) ?? [];
  const handleUpgrade = (weapon) => {
    const cost = WEAPON_STATS[weapon].upgradeCost;
    if (coins < cost) return;
    audioEngine.playSFX("powerup_collect");
    upgradeWeapon(weapon);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "shop.page",
      className: "relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md mx-auto flex flex-col h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            className: "text-center pt-8 pb-2 px-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-3xl text-white text-glow-cyan", children: "★ UPGRADE SHOP" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 inline-flex items-center gap-2 hud-panel px-4 py-1.5 rounded-full", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-neon-gold text-sm", children: "★" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-bold text-neon-gold", children: coins.toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-white/40", children: "COINS" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 py-4 space-y-3", children: Object.entries(WEAPON_STATS).map(([weapon, stats], i) => {
          const upgrade = weaponUpgrades.find((w) => w.weapon === weapon);
          const level = (upgrade == null ? void 0 : upgrade.level) ?? 1;
          const unlocked = (upgrade == null ? void 0 : upgrade.unlocked) ?? weapon === "laser";
          const cost = stats.upgradeCost;
          const canAfford = coins >= cost;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              "data-ocid": `shop.item.${i + 1}`,
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: i * 0.06 },
              className: [
                "hud-panel p-4",
                !unlocked ? "opacity-60" : ""
              ].join(" "),
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-white text-sm", children: stats.name }),
                    unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: "font-mono text-[9px] px-1.5 py-0.5 rounded",
                        style: {
                          background: `${stats.color}22`,
                          color: stats.color,
                          border: `1px solid ${stats.color}44`
                        },
                        children: [
                          "LVL ",
                          level
                        ]
                      }
                    ),
                    !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded", children: "LOCKED" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-white/40 mb-2", children: stats.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] w-12 text-white/30", children: "DMG" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "h-full rounded-full",
                          style: {
                            width: `${Math.min(100, stats.damage / 5)}%`,
                            background: stats.color
                          }
                        }
                      ) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] text-white/50 w-6 text-right", children: (upgrade == null ? void 0 : upgrade.damage) ?? stats.damage })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[9px] w-12 text-white/30", children: "SPEED" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-1 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "h-full rounded-full",
                          style: {
                            width: `${Math.min(100, stats.bulletSpeed / 8)}%`,
                            background: stats.color
                          }
                        }
                      ) })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    "data-ocid": `shop.upgrade_button.${i + 1}`,
                    onClick: () => handleUpgrade(weapon),
                    disabled: !canAfford || !unlocked,
                    className: [
                      "px-3 py-2 rounded font-display text-xs font-semibold transition-all duration-200",
                      canAfford && unlocked ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/25" : "bg-white/5 text-white/25 border border-white/10 cursor-not-allowed"
                    ].join(" "),
                    children: !unlocked ? "LOCKED" : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "UPGRADE" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[9px] text-neon-gold mt-0.5", children: [
                        cost.toLocaleString(),
                        " ★"
                      ] })
                    ] })
                  }
                ) })
              ] })
            },
            weapon
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "shop.back_button",
            onClick: () => {
              audioEngine.playSFX("ui_click");
              navigateTo("menu");
            },
            className: "w-full py-2.5 font-display text-sm text-white/50 hover:text-neon-cyan transition-colors border border-white/10 hover:border-neon-cyan/30 rounded-lg",
            children: "← BACK"
          }
        ) })
      ] })
    }
  );
}
export {
  UpgradeShop as default
};
