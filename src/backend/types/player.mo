import Common "common";

module {
  /// Public-facing player profile (shared-safe, no var fields)
  public type PlayerProfile = {
    username : Text;
    level : Nat;
    totalCoins : Nat;
    totalXP : Nat;
    lifetimeKills : Nat;
  };

  /// Internal mutable player profile
  public type PlayerProfileInternal = {
    var username : Text;
    var level : Nat;
    var totalCoins : Nat;
    var totalXP : Nat;
    var lifetimeKills : Nat;
  };

  /// Weapon upgrade levels (index 0-3 = laser, plasma, missile, electric)
  public type WeaponLevels = [Nat]; // always length 4, values 1-3

  /// Public-facing game save state
  public type GameSave = {
    weaponLevels : WeaponLevels; // [laser, plasma, missile, electric]
    unlockedSkins : [Common.SkinId];
    purchaseHistory : [PurchaseRecord];
    lastSaved : Common.Timestamp;
  };

  public type PurchaseRecord = {
    itemId : Nat;
    itemType : { #weapon; #skin; #powerup };
    cost : Nat;
    timestamp : Common.Timestamp;
  };
};
