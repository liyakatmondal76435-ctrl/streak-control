import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/streaks";

mixin (
  accessControlState : AccessControl.AccessControlState,
  states : Map.Map<Types.UserId, Types.StreakState>,
) {
  // Returns the caller's state, creating an empty one on first use.
  func getOrCreateState(caller : Types.UserId) : Types.StreakState {
    switch (states.get(caller)) {
      case (?state) { state };
      case null {
        let state : Types.StreakState = {
          var current = null;
          var logs = [];
          var nextLogId = 0;
        };
        states.add(caller, state);
        state;
      };
    };
  };

  // Builds the caller's summary from their state and the current time.
  func buildSummary(state : Types.StreakState, now : Types.Timestamp) : Types.StreakSummary {
    let currentSeconds = switch (state.current) {
      case (?streak) {
        if (now > streak.startedAt) {
          ((now - streak.startedAt) / 1_000_000_000).toNat();
        } else {
          0;
        };
      };
      case null { 0 };
    };

    let totalCleanSeconds = state.logs.foldLeft(
      currentSeconds,
      func(acc, log) { acc + log.durationSeconds },
    );

    let longestStreakSeconds = state.logs.foldLeft(
      currentSeconds,
      func(acc, log) {
        if (log.durationSeconds > acc) { log.durationSeconds } else { acc };
      },
    );

    let longestDays = longestStreakSeconds / 86_400;
    let milestones = Types.milestones.map(
      func(days) { { days; earned = longestDays >= days } },
    );

    let checkedInToday = switch (state.current) {
      case (?streak) {
        switch (streak.lastCheckInAt) {
          case (?last) { last / 86_400 == now / 86_400 };
          case null { false };
        };
      };
      case null { false };
    };

    {
      current = state.current;
      totalCleanSeconds;
      longestStreakSeconds;
      milestones;
      logs = state.logs;
      checkedInToday;
    };
  };

  // Returns the caller's current streak, history, milestones and check-in
  // status. Creates an empty state for a first-time caller.
  public shared ({ caller }) func getStreakSummary() : async Types.StreakSummary {
    let state = getOrCreateState(caller);
    buildSummary(state, Time.now());
  };

  // Starts a fresh clean streak for the caller if none is running.
  public shared ({ caller }) func startStreak() : async Types.StreakSummary {
    let state = getOrCreateState(caller);
    let now = Time.now();
    switch (state.current) {
      case (?_) {};
      case null {
        state.current := ?{ startedAt = now; lastCheckInAt = null };
      };
    };
    buildSummary(state, now);
  };

  // Marks today's check-in for the caller's running streak.
  public shared ({ caller }) func checkInToday() : async Types.StreakSummary {
    let state = getOrCreateState(caller);
    let now = Time.now();
    let streak = switch (state.current) {
      case (?streak) { streak };
      case null { { startedAt = now; lastCheckInAt = null } };
    };
    state.current := ?{ streak with lastCheckInAt = ?now };
    buildSummary(state, now);
  };

  // Saves the running streak to history with the given trigger tags and
  // immediately starts a fresh streak.
  public shared ({ caller }) func relapse(triggers : [Text]) : async Types.StreakSummary {
    let state = getOrCreateState(caller);
    let now = Time.now();
    let startedAt = switch (state.current) {
      case (?streak) { streak.startedAt };
      case null { now };
    };
    let durationSeconds = if (now > startedAt) {
      ((now - startedAt) / 1_000_000_000).toNat();
    } else {
      0;
    };
    let log : Types.StreakLog = {
      id = state.nextLogId;
      startedAt;
      endedAt = now;
      durationSeconds;
      triggers;
    };
    state.logs := state.logs.concat([log]);
    state.nextLogId := state.nextLogId + 1;
    state.current := ?{ startedAt = now; lastCheckInAt = null };
    buildSummary(state, now);
  };
};
