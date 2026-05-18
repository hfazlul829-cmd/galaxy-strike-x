import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import LeaderboardTypes "../types/leaderboard";

module {
  public let MAX_ENTRIES : Nat = 10;
  public type Board = List.List<LeaderboardTypes.LeaderboardEntry>;

  /// Submit a score and keep the leaderboard sorted desc, capped at MAX_ENTRIES.
  public func submitScore(
    board : Board,
    player : Principal,
    username : Text,
    req : LeaderboardTypes.SubmitScoreRequest,
  ) : Board {
    let newEntry : LeaderboardTypes.LeaderboardEntry = {
      player = player;
      username = username;
      score = req.score;
      waveReached = req.waveReached;
      gameMode = req.gameMode;
      timestamp = Time.now();
    };
    // Remove any existing entry for this player in the same game mode
    let filtered = board.filter(func(e) {
      not (Principal.equal(e.player, player) and e.gameMode == req.gameMode)
    });
    filtered.add(newEntry);
    // Sort descending by score
    filtered.sortInPlace(func(a, b) {
      if (a.score > b.score) { #less }
      else if (a.score < b.score) { #greater }
      else { #equal };
    });
    // Cap to MAX_ENTRIES
    filtered.truncate(MAX_ENTRIES);
    filtered;
  };

  public func getTop(board : Board) : [LeaderboardTypes.LeaderboardEntry] {
    board.toArray();
  };
};
