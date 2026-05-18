import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { audioEngine } from "../game/audioEngine";
import { GAME_MODES } from "../game/constants";
import type { GameMode } from "../game/types";
import { useGameStore } from "../store/gameStore";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  delay: Math.random() * 3,
  dur: 2 + Math.random() * 2,
}));

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse-glow"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.4 + Math.random() * 0.6,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function MainMenu() {
  const navigateTo = useGameStore((s) => s.navigateTo);
  const [_titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    setTitleVisible(true);
    audioEngine.playMusic("menu");
    return () => audioEngine.stopMusic();
  }, []);

  const handleNav = (screen: Parameters<typeof navigateTo>[0]) => {
    audioEngine.playSFX("ui_click");
    navigateTo(screen);
  };

  const menuItems = [
    {
      label: "PLAY",
      icon: "►",
      action: () => handleNav("mode_select"),
      primary: true,
    },
    {
      label: "UPGRADE SHOP",
      icon: "★",
      action: () => handleNav("shop"),
      primary: false,
    },
    {
      label: "LEADERBOARD",
      icon: "🏆",
      action: () => handleNav("leaderboard"),
      primary: false,
    },
    {
      label: "ACHIEVEMENTS",
      icon: "✨",
      action: () => handleNav("achievements"),
      primary: false,
    },
    {
      label: "SETTINGS",
      icon: "⚙️",
      action: () => handleNav("settings"),
      primary: false,
    },
  ];

  return (
    <div
      data-ocid="main_menu.page"
      className="relative w-full h-full bg-space-black flex flex-col items-center justify-center overflow-hidden scanlines"
    >
      <StarField />

      {/* Nebula glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(170,0,255,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,255,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Hero image backdrop */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-space-bg.dim_1920x1080.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 w-full max-w-sm">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="font-mono text-xs tracking-[0.5em] text-neon-cyan/60 mb-2">
            EST. 2094
          </div>
          <h1
            data-ocid="main_menu.title"
            className="font-display font-bold text-5xl text-white leading-none tracking-tight text-glow-cyan"
          >
            GALAXY
            <br />
            <span className="text-neon-cyan">STRIKE X</span>
          </h1>
          <div className="mt-3 font-mono text-xs tracking-widest text-neon-purple/70">
            DEFEND THE GALAXY
          </div>
        </motion.div>

        {/* Menu Items */}
        <motion.div
          className="w-full flex flex-col gap-2 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              type="button"
              data-ocid={`main_menu.${item.label.toLowerCase().replace(/ /g, "_")}_button`}
              onClick={item.action}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              className={[
                "w-full py-3 px-5 rounded-lg font-display font-semibold tracking-widest text-sm",
                "border transition-all duration-200 flex items-center gap-3",
                item.primary
                  ? "bg-neon-cyan/10 border-neon-cyan text-neon-cyan shadow-neon-cyan hover:bg-neon-cyan/20"
                  : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-neon-cyan/40 hover:text-neon-cyan",
              ].join(" ")}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Quick-mode previews */}
        <motion.div
          className="w-full grid grid-cols-2 gap-2 mt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          {(
            Object.entries(GAME_MODES) as [
              GameMode,
              (typeof GAME_MODES)[GameMode],
            ][]
          ).map(([mode, cfg]) => (
            <button
              key={mode}
              type="button"
              data-ocid={`main_menu.mode_${mode}`}
              className="hud-panel p-2 text-left hover:border-neon-cyan/40 transition-colors duration-200 group"
              onClick={() => {
                audioEngine.playSFX("ui_click");
                useGameStore.getState().setCurrentMode(mode);
                navigateTo("game");
              }}
            >
              <div className="text-base mb-0.5">{cfg.icon}</div>
              <div className="font-display font-semibold text-xs text-white/90 group-hover:text-neon-cyan transition-colors truncate">
                {cfg.title}
              </div>
              <div className="font-mono text-[9px] text-white/40 mt-0.5">
                {cfg.scoreMultiplier}× SCORE
              </div>
            </button>
          ))}
        </motion.div>

        {/* Footer */}
        <div className="text-center font-mono text-[10px] text-white/25 mt-2">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            className="text-neon-cyan/50 hover:text-neon-cyan transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
