import List "mo:core/List";
import Time "mo:core/Time";
import AchievementTypes "../types/achievements";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Common "../types/common";

module {
  /// 10 fixed achievements (IDs 0-9)
  public let TOTAL : Nat = 10;
  public type AchievementStore = Map.Map<Principal, List.List<AchievementTypes.AchievementStatus>>;

  /// Return the catalog of all achievements.
  public func catalog() : [AchievementTypes.Achievement] {
    ([
      { id = 0; name = "First Blood"; description = "Destroy your first enemy" },
      { id = 1; name = "Wave Rider"; description = "Survive to wave 5" },
      { id = 2; name = "Veteran"; description = "Survive to wave 10" },
      { id = 3; name = "Century Strike"; description = "Destroy 100 enemies" },
      { id = 4; name = "Rich Pilot"; description = "Collect 5000 coins" },
      { id = 5; name = "Fashion Forward"; description = "Unlock all spaceship skins" },
      { id = 6; name = "Mini Boss Slayer"; description = "Defeat a mini-boss" },
      { id = 7; name = "Final Conqueror"; description = "Defeat the final boss" },
      { id = 8; name = "High Scorer"; description = "Achieve a score of 50,000 or more" },
      { id = 9; name = "Survivor"; description = "Survive 5 consecutive endless waves" },
    ] : [AchievementTypes.Achievement]);
  };

  /// Get (or initialise) a player's achievement statuses.
  public func getPlayerAchievements(
    store : AchievementStore,
    caller : Principal,
  ) : [AchievementTypes.AchievementStatus] {
    switch (store.get(caller)) {
      case (?statuses) { statuses.toArray() };
      case null {
        // Return default locked statuses for all achievements
        let defaults = List.tabulate<AchievementTypes.AchievementStatus>(TOTAL, func(i) {
          { achievementId = i; unlocked = false; unlockedAt = null };
        });
        defaults.toArray();
      };
    };
  };

  /// Unlock a specific achievement for the caller. Returns false if already unlocked or invalid ID.
  public func unlock(
    store : AchievementStore,
    caller : Principal,
    achievementId : Common.AchievementId,
  ) : Bool {
    if (achievementId >= TOTAL) { return false };
    let statuses = switch (store.get(caller)) {
      case (?s) { s };
      case null {
        // Initialise all achievements as locked
        let init = List.tabulate<AchievementTypes.AchievementStatus>(TOTAL, func(i) {
          { achievementId = i; unlocked = false; unlockedAt = null };
        });
        store.add(caller, init);
        init;
      };
    };
    // Check if already unlocked
    switch (statuses.find(func(s) { s.achievementId == achievementId })) {
      case (?s) {
        if (s.unlocked) { return false };
      };
      case null {};
    };
    // Mark as unlocked
    statuses.mapInPlace(func(s) {
      if (s.achievementId == achievementId) {
        { achievementId = s.achievementId; unlocked = true; unlockedAt = ?Time.now() };
      } else { s };
    });
    true;
  };
};
