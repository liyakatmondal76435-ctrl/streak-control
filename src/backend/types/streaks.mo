import Common "common";

module {
  public type UserId = Common.UserId;
  public type Timestamp = Common.Timestamp;

  // A user's current clean streak. `startedAt` is the streak start time in
  // nanoseconds since the epoch; `lastCheckInAt` is the most recent check-in.
  public type Streak = {
    startedAt : Timestamp;
    lastCheckInAt : ?Timestamp;
  };

  // A completed streak saved to history when the user relapses.
  public type StreakLog = {
    id : Nat;
    startedAt : Timestamp;
    endedAt : Timestamp;
    durationSeconds : Nat;
    triggers : [Text];
  };

  // The user's mutable streak state plus history and counters.
  public type StreakState = {
    var current : ?Streak;
    var logs : [StreakLog];
    var nextLogId : Nat;
  };

  // Milestone thresholds in days.
  public let milestones : [Nat] = [1, 3, 7, 14, 30, 90];

  public type Milestone = {
    days : Nat;
    earned : Bool;
  };

  public type StreakSummary = {
    current : ?Streak;
    totalCleanSeconds : Nat;
    longestStreakSeconds : Nat;
    milestones : [Milestone];
    logs : [StreakLog];
    checkedInToday : Bool;
  };
};
