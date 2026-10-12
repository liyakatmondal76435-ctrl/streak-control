import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import IntValue "mo:caffeineai-oql/IntValue";
import NatValue "mo:caffeineai-oql/NatValue";
import StreaksApi "mixins/streaks-api";
import ApiDocMixin "mixins/api-doc";
import Types "types/streaks";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let states : Map.Map<Types.UserId, Types.StreakState>;

  include StreaksApi(accessControlState, states);

  include ApiDocMixin();

  // Sample owner for the OQL schema; the value is ignored.
  transient let anyP = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      OQL.Entity.manual<(Principal, Types.StreakState)>(
        "streakState",
        func () = states.entries(),
        "StreakState",
        "owner",
      )
        .sample((anyP, { var current = null : ?Types.Streak; var logs = [] : [Types.StreakLog]; var nextLogId = 0 }))
        .payload("owner", func((p, _)) = p)
        .payload("currentStartedAt", func((_, s)) = switch (s.current) {
          case (?c) { c.startedAt };
          case null { 0 };
        })
        .payload("nextLogId", func((_, s)) = s.nextLogId)
        .payload("logCount", func((_, s)) = s.logs.size())
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
    ];
  });
};
