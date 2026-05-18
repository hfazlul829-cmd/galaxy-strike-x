import Time "mo:core/Time";

module {
  public type Timestamp = Int; // Time.now() in nanoseconds
  public type GameMode = { #story; #endless; #bossBattle; #hardcore };
  public type AchievementId = Nat;
  public type SkinId = Nat;
  public type WeaponSlot = Nat; // 0-3 for 4 weapon slots
};
