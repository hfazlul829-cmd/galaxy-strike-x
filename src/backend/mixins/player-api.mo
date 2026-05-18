import PlayerLib "../lib/player";
import PlayerTypes "../types/player";
import Common "../types/common";

mixin (
  playerStore : PlayerLib.PlayerStore,
  saveStore : PlayerLib.SaveStore,
) {
  /// Get the caller's player profile. Returns null if not yet created.
  public shared query ({ caller }) func getPlayerProfile() : async ?PlayerTypes.PlayerProfile {
    PlayerLib.getProfile(playerStore, caller);
  };

  /// Update the caller's player profile fields. Pass null to leave a field unchanged.
  public shared ({ caller }) func updatePlayerProfile(
    username : ?Text,
    levelDelta : ?Nat,
    coinsDelta : ?Int,
    xpDelta : ?Nat,
    killsDelta : ?Nat,
  ) : async Bool {
    PlayerLib.updateProfile(playerStore, caller, username, levelDelta, coinsDelta, xpDelta, killsDelta);
  };

  /// Persist the caller's game save state.
  public shared ({ caller }) func saveGameState(
    weaponLevels : PlayerTypes.WeaponLevels,
    unlockedSkins : [Common.SkinId],
    purchaseHistory : [PlayerTypes.PurchaseRecord],
  ) : async () {
    PlayerLib.saveGame(saveStore, caller, weaponLevels, unlockedSkins, purchaseHistory);
  };

  /// Load the caller's game save state.
  public shared query ({ caller }) func loadGameState() : async PlayerTypes.GameSave {
    PlayerLib.loadGameSave(saveStore, caller);
  };
};
