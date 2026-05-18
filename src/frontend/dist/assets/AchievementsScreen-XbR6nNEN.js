import { u as useGameStore, j as jsxRuntimeExports, L as ACHIEVEMENTS } from "./index-BeDg1Gbc.js";
import { a as audioEngine } from "./audioEngine-Bbt5mT95.js";
import { m as motion } from "./proxy-BE2cmtP9.js";
function AchievementsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const gameSave = useGameStore((s) => s.gameSave);
  const unlockedIds = new Set((gameSave == null ? void 0 : gameSave.achievements.map((a) => a.id)) ?? []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "achievements.page",
      className: "relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md mx-auto flex flex-col h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            className: "text-center pt-8 pb-4 px-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-3xl text-white text-glow-cyan", children: "ACHIEVEMENTS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-white/40 mt-1", children: [
                unlockedIds.size,
                "/",
                ACHIEVEMENTS.length,
                " UNLOCKED"
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-white/10 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { width: 0 },
            animate: {
              width: `${unlockedIds.size / ACHIEVEMENTS.length * 100}%`
            },
            transition: { duration: 0.8, delay: 0.3 },
            className: "h-full bg-neon-cyan rounded-full"
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-4 space-y-2", children: ACHIEVEMENTS.map((ach, i) => {
          const unlocked = unlockedIds.has(ach.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              "data-ocid": `achievements.item.${i + 1}`,
              initial: { opacity: 0, x: -20 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.04 },
              className: [
                "hud-panel p-3 flex items-center gap-3",
                unlocked ? "border-neon-cyan/30" : "opacity-50"
              ].join(" "),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `text-2xl ${unlocked ? "" : "grayscale opacity-40"}`,
                    children: ach.icon
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `font-display font-semibold text-sm ${unlocked ? "text-neon-cyan" : "text-white/60"}`,
                      children: ach.secret && !unlocked ? "???" : ach.title
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-white/40 truncate", children: ach.secret && !unlocked ? "Secret achievement" : ach.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-neon-gold", children: ach.reward }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-white/30", children: "COINS" })
                ] })
              ]
            },
            ach.id
          );
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "achievements.back_button",
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
  AchievementsScreen as default
};
