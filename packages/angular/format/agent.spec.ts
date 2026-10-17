// The agent conversation helpers, run in plain Node (node:test) with `npm run test:angular`.
import assert from "node:assert/strict";
import { test } from "node:test";

process.env.TZ = "Europe/Warsaw";

const {
  agentClock,
  agentElapsed,
  agentGlyph,
  agentHue,
  agentInitials,
  agentIsoTime,
  agentStateIsActive,
  agentStateIsBusy,
  AGENT_STATUS_EN,
} = await import("./agent");

test("a time of day reads like a terminal prints it, from any accepted form", () => {
  const at = new Date(2026, 9, 17, 14, 3, 9);
  assert.equal(agentClock(at), "14:03:09");
  assert.equal(agentClock(at.getTime()), "14:03:09");
  assert.equal(agentClock(at.toISOString()), "14:03:09");
  assert.equal(agentIsoTime(at), at.toISOString());
});

test("no time or a broken one says nothing", () => {
  assert.equal(agentClock(null), "");
  assert.equal(agentClock("not a date"), "");
  assert.equal(agentIsoTime(undefined), null);
});

test("the running time counts whole seconds and never goes back", () => {
  const since = 1_000_000;
  assert.equal(agentElapsed(since, since + 83_900), 83);
  assert.equal(agentElapsed(since, since - 5_000), 0);
  assert.equal(agentElapsed(null, since), null);
  assert.equal(agentElapsed(since, null), null);
});

test("busy is working or thinking; waiting is active but not busy", () => {
  assert.equal(agentStateIsBusy("working"), true);
  assert.equal(agentStateIsBusy("thinking"), true);
  assert.equal(agentStateIsBusy("waiting"), false);
  assert.equal(agentStateIsActive("waiting"), true);
  assert.equal(agentStateIsActive("done"), false);
  assert.equal(agentStateIsActive("idle"), false);
});

test("initials take two letters of one word or the first of two", () => {
  assert.equal(agentInitials("Lead"), "Le");
  assert.equal(agentInitials("code reviewer"), "Cr");
  assert.equal(agentInitials(""), "?");
});

test("a hue is one of the eight chart colours or none", () => {
  assert.equal(agentHue(3), "var(--chart-3)");
  assert.equal(agentHue(0), null);
  assert.equal(agentHue(9), null);
  assert.equal(agentHue(null), null);
});

test("the person gets the prompt glyph, activity the arrow, an empty glyph hides it", () => {
  assert.equal(agentGlyph("user", "message", null), "❯");
  assert.equal(agentGlyph("agent", "activity", null), "›");
  assert.equal(agentGlyph("agent", "message", null), null);
  assert.equal(agentGlyph("agent", "activity", "$"), "$");
  assert.equal(agentGlyph("user", "message", ""), null);
});

test("the status names its speaker when it has one", () => {
  assert.equal(AGENT_STATUS_EN.working("Lead"), "Lead is working");
  assert.equal(AGENT_STATUS_EN.working(null), "Working");
  assert.equal(AGENT_STATUS_EN.waiting("Lead"), "Lead is waiting for you");
});
