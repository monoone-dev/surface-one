// @vitest-environment node
// The Vue and React packages hand out the very objects core defines — not copies that
// could drift apart.
import { describe, expect, it } from "vitest";

import * as core from "../src";
import * as vueMessages from "../../vue/src/composables/messages";
import * as vueNames from "../../vue/src/component-names";
import * as reactMessages from "../../react/src/context/messages";

describe("the messages catalogue", () => {
  it("is the same object in the Vue and React packages", () => {
    expect(vueMessages.SONE_DEFAULT_MESSAGES).toBe(core.SONE_DEFAULT_MESSAGES);
    expect(reactMessages.SONE_DEFAULT_MESSAGES).toBe(
      core.SONE_DEFAULT_MESSAGES,
    );
  });

  it("has a string or a formatter for every key", () => {
    const entries = Object.entries(core.SONE_DEFAULT_MESSAGES);
    expect(entries.length).toBeGreaterThanOrEqual(74);
    for (const [key, value] of entries) {
      expect(["string", "function"], key).toContain(typeof value);
    }
  });
});

describe("the component names", () => {
  it("are the list the Vue package (and its Nuxt module) exports", () => {
    expect(vueNames.SONE_COMPONENT_NAMES).toBe(core.SONE_COMPONENT_NAMES);
  });
});
