/// Migration: Habit Tracker → Galaxy Strike X
/// The old actor had: users, userHabits, userCompletions
/// The new actor has: playerStore, saveStore, leaderboardEntries, achievementStore
/// These are completely disjoint — no old data is preserved (intentional full replacement).
import Map "mo:core/Map";
import List "mo:core/List";
import PlayerTypes "types/player";
import LeaderboardTypes "types/leaderboard";
import AchievementTypes "types/achievements";

module {
  // ── Old types (copied from the retired habit-tracker main.mo) ──────────────
  type OldDate = Text;
  type OldHabitId = Text;
  type OldHabit = { id : OldHabitId; name : Text; color : Text; createdAt : OldDate };
  type OldCompletion = { habitId : OldHabitId; date : OldDate; completed : Bool };
  type OldUser = { displayName : Text };

  type OldActor = {
    users : Map.Map<Principal, OldUser>;
    userHabits : Map.Map<Principal, Map.Map<OldHabitId, OldHabit>>;
    userCompletions : Map.Map<Principal, Map.Map<OldHabitId, List.List<OldCompletion>>>;
  };

  // ── New types (matching new main.mo stable fields) ─────────────────────────
  type NewActor = {
    playerStore : Map.Map<Principal, PlayerTypes.PlayerProfileInternal>;
    saveStore : Map.Map<Principal, PlayerTypes.GameSave>;
    leaderboardEntries : List.List<LeaderboardTypes.LeaderboardEntry>;
    achievementStore : Map.Map<Principal, List.List<AchievementTypes.AchievementStatus>>;
  };

  public func run(_old : OldActor) : NewActor {
    // Discard all habit-tracker data; initialise fresh game state.
    {
      playerStore = Map.empty<Principal, PlayerTypes.PlayerProfileInternal>();
      saveStore = Map.empty<Principal, PlayerTypes.GameSave>();
      leaderboardEntries = List.empty<LeaderboardTypes.LeaderboardEntry>();
      achievementStore = Map.empty<Principal, List.List<AchievementTypes.AchievementStatus>>();
    };
  };
};
