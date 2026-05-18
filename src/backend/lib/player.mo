import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import PlayerTypes "../types/player";
import Common "../types/common";

module {
  public type PlayerStore = Map.Map<Principal, PlayerTypes.PlayerProfileInternal>;
  public type SaveStore = Map.Map<Principal, PlayerTypes.GameSave>;

  public func defaultProfile(username : Text) : PlayerTypes.PlayerProfileInternal {
    {
      var username = username;
      var level = 1;
      var totalCoins = 0;
      var totalXP = 0;
      var lifetimeKills = 0;
    };
  };

  public func defaultSave() : PlayerTypes.GameSave {
    {
      weaponLevels = [1, 1, 1, 1]; // laser, plasma, missile, electric
      unlockedSkins = [0]; // default skin always unlocked
      purchaseHistory = [];
      lastSaved = Time.now();
    };
  };

  public func toPublic(internal : PlayerTypes.PlayerProfileInternal) : PlayerTypes.PlayerProfile {
    {
      username = internal.username;
      level = internal.level;
      totalCoins = internal.totalCoins;
      totalXP = internal.totalXP;
      lifetimeKills = internal.lifetimeKills;
    };
  };

  public func getProfile(store : PlayerStore, caller : Principal) : ?PlayerTypes.PlayerProfile {
    switch (store.get(caller)) {
      case (?internal) { ?toPublic(internal) };
      case null { null };
    };
  };

  public func updateProfile(
    store : PlayerStore,
    caller : Principal,
    username : ?Text,
    levelDelta : ?Nat,
    coinsDelta : ?Int,
    xpDelta : ?Nat,
    killsDelta : ?Nat,
  ) : Bool {
    let profile = switch (store.get(caller)) {
      case (?p) { p };
      case null {
        let newProfile = defaultProfile("");
        store.add(caller, newProfile);
        newProfile;
      };
    };
    switch (username) {
      case (?u) { profile.username := u };
      case null {};
    };
    switch (levelDelta) {
      case (?d) { profile.level := profile.level + d };
      case null {};
    };
    switch (coinsDelta) {
      case (?d) {
        if (d >= 0) {
          profile.totalCoins := profile.totalCoins + d.toNat();
        } else {
          let sub = (-d).toNat();
          if (sub <= profile.totalCoins) {
            profile.totalCoins := profile.totalCoins - sub;
          } else {
            profile.totalCoins := 0;
          };
        };
      };
      case null {};
    };
    switch (xpDelta) {
      case (?d) { profile.totalXP := profile.totalXP + d };
      case null {};
    };
    switch (killsDelta) {
      case (?d) { profile.lifetimeKills := profile.lifetimeKills + d };
      case null {};
    };
    true;
  };

  public func loadGameSave(saveStore : SaveStore, caller : Principal) : PlayerTypes.GameSave {
    switch (saveStore.get(caller)) {
      case (?s) { s };
      case null { defaultSave() };
    };
  };

  public func saveGame(
    saveStore : SaveStore,
    caller : Principal,
    weaponLevels : PlayerTypes.WeaponLevels,
    unlockedSkins : [Common.SkinId],
    purchaseHistory : [PlayerTypes.PurchaseRecord],
  ) : () {
    // Validate weapon levels: exactly 4 slots, each 1-3
    let validLevels = if (weaponLevels.size() == 4) {
      weaponLevels;
    } else {
      [1, 1, 1, 1];
    };
    let save : PlayerTypes.GameSave = {
      weaponLevels = validLevels;
      unlockedSkins = unlockedSkins;
      purchaseHistory = purchaseHistory;
      lastSaved = Time.now();
    };
    saveStore.add(caller, save);
  };
};
