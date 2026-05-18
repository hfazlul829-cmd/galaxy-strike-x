import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import PlayerTypes "types/player";
import LeaderboardTypes "types/leaderboard";
import AchievementTypes "types/achievements";
import PlayerApi "mixins/player-api";
import LeaderboardApi "mixins/leaderboard-api";
import AchievementsApi "mixins/achievements-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  // ── Stable state ────────────────────────────────────────────────────────
  let playerStore = Map.empty<Principal, PlayerTypes.PlayerProfileInternal>();
  let saveStore = Map.empty<Principal, PlayerTypes.GameSave>();
  let leaderboardEntries = List.empty<LeaderboardTypes.LeaderboardEntry>();
  let achievementStore = Map.empty<Principal, List.List<AchievementTypes.AchievementStatus>>();

  // ── Mixin composition ────────────────────────────────────────────────────
  include PlayerApi(playerStore, saveStore);
  include LeaderboardApi(leaderboardEntries, playerStore);
  include AchievementsApi(achievementStore);
};
