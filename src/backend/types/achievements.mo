import Common "common";

module {
  /// 10 achievement definitions (IDs 0-9)
  public type Achievement = {
    id : Common.AchievementId;
    name : Text;
    description : Text;
  };

  public type AchievementStatus = {
    achievementId : Common.AchievementId;
    unlocked : Bool;
    unlockedAt : ?Common.Timestamp;
  };
};
