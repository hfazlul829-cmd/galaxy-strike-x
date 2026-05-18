import AchievementsLib "../lib/achievements";
import AchievementTypes "../types/achievements";
import Common "../types/common";

mixin (achievementStore : AchievementsLib.AchievementStore) {
  /// Unlock a specific achievement (0-9) for the caller.
  public shared ({ caller }) func unlockAchievement(achievementId : Common.AchievementId) : async Bool {
    AchievementsLib.unlock(achievementStore, caller, achievementId);
  };

  /// Get all achievement statuses for the caller.
  public shared query ({ caller }) func getAchievements() : async [AchievementTypes.AchievementStatus] {
    AchievementsLib.getPlayerAchievements(achievementStore, caller);
  };
};
