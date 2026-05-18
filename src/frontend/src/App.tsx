import { Suspense, lazy } from "react";
import { useGameStore } from "./store/gameStore";

// Lazy-load all screens to keep initial bundle lean
const MainMenu = lazy(() => import("./pages/MainMenu"));
const GameCanvas = lazy(() => import("./pages/GameCanvas"));
const GameModeSelect = lazy(() => import("./pages/GameModeSelect"));
const UpgradeShop = lazy(() => import("./pages/UpgradeShop"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const AchievementsScreen = lazy(() => import("./pages/AchievementsScreen"));
const SettingsScreen = lazy(() => import("./pages/SettingsScreen"));

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-space-black flex items-center justify-center">
      <div className="text-center animate-scale-in">
        <div className="text-4xl font-display font-bold text-neon-cyan text-glow-cyan mb-4">
          GALAXY STRIKE X
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div
            className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
            style={{ animationDelay: "200ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const screen = useGameStore((s) => s.currentScreen);

  return (
    <div
      data-ocid="app.root"
      className="w-full h-full bg-space-black font-body"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <Suspense fallback={<LoadingScreen />}>
        {screen === "menu" && <MainMenu />}
        {screen === "mode_select" && <GameModeSelect />}
        {screen === "game" && <GameCanvas />}
        {screen === "pause" && <GameCanvas />}{" "}
        {/* GameCanvas handles pause overlay */}
        {screen === "game_over" && <GameCanvas />}{" "}
        {/* GameCanvas handles game-over overlay */}
        {screen === "shop" && <UpgradeShop />}
        {screen === "leaderboard" && <Leaderboard />}
        {screen === "achievements" && <AchievementsScreen />}
        {screen === "settings" && <SettingsScreen />}
      </Suspense>
    </div>
  );
}
