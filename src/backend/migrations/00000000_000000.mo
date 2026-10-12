import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  public type OldActor = {};

  public type Streak = {
    startedAt : Int;
    lastCheckInAt : ?Int;
  };

  public type StreakLog = {
    id : Nat;
    startedAt : Int;
    endedAt : Int;
    durationSeconds : Nat;
    triggers : [Text];
  };

  public type StreakState = {
    var current : ?Streak;
    var logs : [StreakLog];
    var nextLogId : Nat;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    states : Map.Map<Principal, StreakState>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      states = Map.empty();
    };
  };
};
