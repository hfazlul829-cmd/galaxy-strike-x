import { u as useGameStore, j as jsxRuntimeExports, G as GAME_MODES } from "./index-BeDg1Gbc.js";
import { a as audioEngine } from "./audioEngine-Bbt5mT95.js";
import { m as motion } from "./proxy-BE2cmtP9.js";
function GameModeSelect() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const setCurrentMode = useGameStore((s) => s.setCurrentMode);
  const handleSelect = (mode) => {
    audioEngine.playSFX("ui_click");
    setCurrentMode(mode);
    navigateTo("game");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "mode_select.page",
      className: "relative w-full h-full bg-space-black flex flex-col items-center justify-center px-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute inset-0 opacity-15",
            style: {
              backgroundImage: "url('/assets/generated/hero-space-bg.dim_1920x1080.jpg')",
              backgroundSize: "cover"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-1/3 left-1/3 w-80 h-80 rounded-full",
            style: {
              background: "radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)",
              filter: "blur(60px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: -20 },
              animate: { opacity: 1, y: 0 },
              className: "text-center mb-6",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-3xl text-white text-glow-cyan", children: "SELECT MODE" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-xs text-white/40 mt-1", children: "Choose your battle" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: Object.entries(GAME_MODES).map(([mode, cfg], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.button,
            {
              type: "button",
              "data-ocid": `mode_select.mode_${mode}_button`,
              initial: { opacity: 0, x: -30 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: i * 0.08 },
              onClick: () => handleSelect(mode),
              className: "w-full hud-panel p-4 text-left hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-200 group flex items-center gap-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: cfg.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-white group-hover:text-neon-cyan transition-colors", children: cfg.title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-white/50 mt-0.5 truncate", children: cfg.description })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-xs text-neon-gold", children: [
                    cfg.scoreMultiplier,
                    "× SCORE"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[9px] text-white/30 mt-0.5", children: [
                    cfg.difficultyMultiplier,
                    "× DIFF"
                  ] })
                ] })
              ]
            },
            mode
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.button,
            {
              type: "button",
              "data-ocid": "mode_select.back_button",
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              transition: { delay: 0.4 },
              onClick: () => {
                audioEngine.playSFX("ui_click");
                navigateTo("menu");
              },
              className: "w-full mt-4 py-2.5 font-display text-sm text-white/50 hover:text-neon-cyan transition-colors border border-white/10 hover:border-neon-cyan/30 rounded-lg",
              children: "← BACK"
            }
          )
        ] })
      ]
    }
  );
}
export {
  GameModeSelect as default
};
