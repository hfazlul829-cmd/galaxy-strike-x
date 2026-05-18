import LeaderboardLib "../lib/leaderboard";
import PlayerLib "../lib/player";
import LeaderboardTypes "../types/leaderboard";

mixin (
  board : LeaderboardLib.Board,
  playerStore : PlayerLib.PlayerStore,
) {
  /// Submit the caller's score for the leaderboard.
  public shared ({ caller }) func submitScore(
    req : LeaderboardTypes.SubmitScoreRequest,
  ) : async () {
    // Resolve username from player profile; fall back to principal text
    let username = switch (playerStore.get(caller)) {
      case (?p) { p.username };
      case null { caller.toText() };
    };
    let updated = LeaderboardLib.submitScore(board, caller, username, req);
    // Sync the shared board list to match the sorted/capped result
    board.clear();
    board.addAll(updated.values());
  };

  /// Get the top-10 leaderboard entries sorted by score descending.
  public shared query func getLeaderboard() : async [LeaderboardTypes.LeaderboardEntry] {
    LeaderboardLib.getTop(board);
  };
};
