import Common "common";

module {
  public type LeaderboardEntry = {
    player : Principal;
    username : Text;
    score : Nat;
    waveReached : Nat;
    gameMode : Common.GameMode;
    timestamp : Common.Timestamp;
  };

  public type SubmitScoreRequest = {
    score : Nat;
    waveReached : Nat;
    gameMode : Common.GameMode;
  };
};
