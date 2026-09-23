import assert from "node:assert/strict";
import test from "node:test";
import { channelVersion, distTag, prereleaseHash, stableCore } from "./version.mjs";

const date = "20260923";
const hash = "abcdef0123456789dead";

test("first latest release is 0.0.1", () => {
  assert.equal(channelVersion("latest", { current: "0.0.0", bump: "minor" }), "0.0.1");
});

test("latest patch increments the stable core", () => {
  assert.equal(channelVersion("latest", { current: "0.0.1", bump: "patch" }), "0.0.2");
  assert.equal(stableCore("0.0.2-rc-abcdef0123-20260923"), "0.0.2");
});

test("rc and beta default to the next patch", () => {
  assert.equal(
    channelVersion("rc", { current: "0.0.1", hash, date }),
    "0.0.2-rc-456789dead-20260923",
  );
  assert.equal(
    channelVersion("beta", { current: "0.0.1", hash, date, base: "0.1.0" }),
    "0.1.0-beta-456789dead-20260923",
  );
});

test("experimental version and dist-tag", () => {
  const version = channelVersion("experimental", { current: "0.0.1", hash, date });
  assert.equal(version, "0.0.0-experimental-456789dead-20260923");
  assert.equal(distTag("experimental", version), "experimental-456789dead-20260923");
});

test("an all-digit hash suffix is prefixed", () => {
  assert.equal(prereleaseHash("zzzz0123456789"), "h0123456789");
});
