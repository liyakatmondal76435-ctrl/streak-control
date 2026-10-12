import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

describe("streak canister", () => {
  it("answers an empty-state read instead of trapping", async () => {
    const summary = await actor.getStreakSummary();
    expect(summary.current).toEqual([]);
    expect(summary.logs).toEqual([]);
    expect(summary.checkedInToday).toBe(false);
    expect(summary.totalCleanSeconds).toBe(0n);
  });

  it("starts a streak and reports it as current", async () => {
    const started = await actor.startStreak();
    expect(started.current).toHaveLength(1);
    expect(started.current[0]?.startedAt).toBeGreaterThan(0n);

    const read = await actor.getStreakSummary();
    expect(read.current).toHaveLength(1);
  });

  it("marks today's check-in and reflects it on the next read", async () => {
    const checked = await actor.checkInToday();
    expect(checked.checkedInToday).toBe(true);

    const read = await actor.getStreakSummary();
    expect(read.checkedInToday).toBe(true);
  });

  it("saves the running streak to history on relapse and starts fresh", async () => {
    const before = await actor.getStreakSummary();
    expect(before.current).toHaveLength(1);

    const after = await actor.relapse(["stress", "late night"]);
    expect(after.logs).toHaveLength(1);
    expect(after.logs[0]?.triggers).toEqual(["stress", "late night"]);
    expect(after.current).toHaveLength(1);
    expect(after.checkedInToday).toBe(false);

    const read = await actor.getStreakSummary();
    expect(read.logs).toHaveLength(1);
  });

  it("awards milestones based on the longest streak reached", async () => {
    const summary = await actor.getStreakSummary();
    const earned = summary.milestones.filter((m) => m.earned);
    // A streak that just started has not reached the 1-day milestone.
    expect(earned).toEqual([]);
    expect(summary.milestones.map((m) => m.days)).toEqual([
      1n,
      3n,
      7n,
      14n,
      30n,
      90n,
    ]);
  });
});

describe("caller isolation", () => {
  it("keeps each caller's streak data separate", async () => {
    const alice = createIdentity("alice");
    const bob = createIdentity("bob");

    const aliceActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    aliceActor.setIdentity(alice);
    await aliceActor.startStreak();
    await aliceActor.checkInToday();

    const bobActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
    bobActor.setIdentity(bob);

    const bobSummary = await bobActor.getStreakSummary();
    expect(bobSummary.current).toEqual([]);
    expect(bobSummary.checkedInToday).toBe(false);

    const aliceSummary = await aliceActor.getStreakSummary();
    expect(aliceSummary.current).toHaveLength(1);
    expect(aliceSummary.checkedInToday).toBe(true);
  });
});
