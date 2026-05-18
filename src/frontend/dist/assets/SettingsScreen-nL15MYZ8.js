import { u as useGameStore, j as jsxRuntimeExports } from "./index-BeDg1Gbc.js";
import { a as audioEngine } from "./audioEngine-Bbt5mT95.js";
import { m as motion } from "./proxy-BE2cmtP9.js";
function SettingsScreen() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const handleSlider = (key, value) => {
    updateSettings({ [key]: value });
    if (key === "musicVolume") audioEngine.setMusicVolume(value);
    if (key === "sfxVolume") audioEngine.setSFXVolume(value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-ocid": "settings.page",
      className: "relative w-full h-full bg-space-black flex flex-col items-center overflow-hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md mx-auto flex flex-col h-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: -20 },
            animate: { opacity: 1, y: 0 },
            className: "text-center pt-8 pb-6 px-4",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display font-bold text-3xl text-white text-glow-cyan", children: "⚙️ SETTINGS" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-4 pb-4 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.1 },
              className: "hud-panel p-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-neon-cyan text-sm mb-4", children: "AUDIO" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "label",
                        {
                          htmlFor: "music-vol",
                          className: "font-mono text-xs text-white/60",
                          children: "MUSIC VOLUME"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-neon-cyan", children: [
                        Math.round(settings.musicVolume * 100),
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        id: "music-vol",
                        "data-ocid": "settings.music_volume",
                        type: "range",
                        min: "0",
                        max: "1",
                        step: "0.05",
                        value: settings.musicVolume,
                        onChange: (e) => handleSlider(
                          "musicVolume",
                          Number.parseFloat(e.target.value)
                        ),
                        className: "w-full accent-cyan-400 cursor-pointer"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "label",
                        {
                          htmlFor: "sfx-vol",
                          className: "font-mono text-xs text-white/60",
                          children: "SFX VOLUME"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs text-neon-cyan", children: [
                        Math.round(settings.sfxVolume * 100),
                        "%"
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        id: "sfx-vol",
                        "data-ocid": "settings.sfx_volume",
                        type: "range",
                        min: "0",
                        max: "1",
                        step: "0.05",
                        value: settings.sfxVolume,
                        onChange: (e) => handleSlider("sfxVolume", Number.parseFloat(e.target.value)),
                        className: "w-full accent-cyan-400 cursor-pointer"
                      }
                    )
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { delay: 0.15 },
              className: "hud-panel p-4",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-neon-cyan text-sm mb-4", children: "VISUALS" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  [
                    {
                      key: "quality",
                      label: "QUALITY",
                      options: ["low", "medium", "high"]
                    },
                    {
                      key: "particleCount",
                      label: "PARTICLES",
                      options: ["low", "medium", "high"]
                    }
                  ].map(({ key, label, options }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center justify-between gap-4",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-white/60", children: label }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: options.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            "data-ocid": `settings.${key}_${opt}`,
                            onClick: () => {
                              audioEngine.playSFX("ui_click");
                              updateSettings({ [key]: opt });
                            },
                            className: [
                              "px-2 py-1 rounded font-mono text-[9px] tracking-widest transition-all duration-150",
                              settings[key] === opt ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/50" : "text-white/30 border border-white/10 hover:text-neon-cyan/50"
                            ].join(" "),
                            children: opt.toUpperCase()
                          },
                          opt
                        )) })
                      ]
                    },
                    key
                  )),
                  [
                    { key: "screenShake", label: "SCREEN SHAKE" },
                    { key: "showFps", label: "SHOW FPS" },
                    { key: "vibration", label: "VIBRATION" }
                  ].map(({ key, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-white/60", children: label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        "data-ocid": `settings.${key}_toggle`,
                        onClick: () => {
                          audioEngine.playSFX("ui_click");
                          updateSettings({ [key]: !settings[key] });
                        },
                        className: [
                          "w-10 h-5 rounded-full transition-all duration-200 relative",
                          settings[key] ? "bg-neon-cyan/30" : "bg-white/10"
                        ].join(" "),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "div",
                          {
                            className: [
                              "absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200",
                              settings[key] ? "left-5 bg-neon-cyan" : "left-0.5 bg-white/40"
                            ].join(" ")
                          }
                        )
                      }
                    )
                  ] }, key))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            "data-ocid": "settings.back_button",
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
  SettingsScreen as default
};
