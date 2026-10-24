import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_OTP_ALPHANUMERIC,
  agentHueStyle,
  cleanOtp,
  columnCount,
  inDocumentOrder,
  moveGroupFocus,
  nonNegative,
  otpCharTest,
  otpInputMode,
  otpLayout,
  otpSize,
  swallowWhenDisabled,
  toSectionHeadingLevel,
} from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the one-time code helpers", () => {
  it("size, test and clean a code", () => {
    expect(otpSize(4.7)).toBe(4);
    expect(otpSize(0)).toBe(6);
    expect(otpSize(Number.NaN)).toBe(6);
    const digits = otpCharTest("^\\d+$");
    expect(cleanOtp("1a2 3-45678", digits, 6)).toBe("123456");
    expect(otpInputMode(digits)).toBe("numeric");
    const any = otpCharTest(new RegExp(SONE_OTP_ALPHANUMERIC, "gy"));
    expect(any.flags).toBe("");
    expect(otpInputMode(any)).toBe("text");
    expect(cleanOtp("ab-12", any, 6)).toBe("ab12");
  });

  it("groups the slots only when the groups add up to the length", () => {
    expect(otpLayout([3, 3], 6)).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
    expect(otpLayout([2, 2], 6)).toEqual([[0, 1, 2, 3, 4, 5]]);
    expect(otpLayout(null, 3)).toEqual([[0, 1, 2]]);
  });
});

describe("moveGroupFocus", () => {
  it("moves between the enabled items and wraps", () => {
    document.body.innerHTML = `<div id="g">
      <button data-slot="item" id="a"></button>
      <button data-slot="item" disabled></button>
      <button data-slot="item" id="b"></button>
      <button data-slot="item" id="c" aria-disabled="true"></button></div>`;
    const host = document.getElementById("g")!;
    const press = (key: string) => {
      let prevented = false;
      moveGroupFocus(host, "item", false, {
        key,
        preventDefault: () => (prevented = true),
      });
      return prevented;
    };
    document.getElementById("a")!.focus();
    expect(press("ArrowRight")).toBe(true);
    expect(document.activeElement?.id).toBe("b");
    press("ArrowRight");
    expect(document.activeElement?.id).toBe("a");
    press("End");
    expect(document.activeElement?.id).toBe("b");
    expect(press("ArrowDown")).toBe(false);
  });
});

describe("inDocumentOrder", () => {
  it("sorts by element position and leaves unmounted items in place", () => {
    document.body.innerHTML = `<i id="x"></i><i id="y"></i>`;
    const x = { el: document.getElementById("x") };
    const y = { el: document.getElementById("y") };
    expect(inDocumentOrder([y, x], (i) => i.el)).toEqual([x, y]);
    const none = { el: null };
    expect(inDocumentOrder([none, y], (i) => i.el)).toEqual([none, y]);
  });
});

describe("the number guards", () => {
  it("clean segment values and column counts", () => {
    expect(nonNegative(-3)).toBe(0);
    expect(nonNegative(Number.POSITIVE_INFINITY)).toBe(0);
    expect(nonNegative(2.5)).toBe(2.5);
    expect(columnCount(3.9)).toBe(3);
    expect(columnCount(0)).toBeUndefined();
    expect(columnCount(null)).toBeUndefined();
  });
});

describe("the shared twin helpers", () => {
  it("reads a section heading level as Angular's numberAttribute does", async () => {
    const { numberAttribute } = await import("@angular/core");
    const inputs: unknown[] = [
      2,
      3,
      4,
      5,
      3.0,
      "3",
      " 4 ",
      "4px",
      "0x3",
      "",
      null,
      undefined,
      true,
      [3],
      { valueOf: () => 3 },
      Number.NaN,
    ];
    for (const value of inputs) {
      const n = numberAttribute(value, 2);
      expect(toSectionHeadingLevel(value), String(value)).toBe(
        n === 3 || n === 4 ? n : 2,
      );
    }
  });

  it("swallows a click only while the element is aria-disabled", () => {
    const el = document.createElement("a");
    const calls: string[] = [];
    const event = {
      preventDefault: () => calls.push("prevent"),
      stopPropagation: () => calls.push("stop"),
    };
    expect(swallowWhenDisabled(el, event)).toBe(false);
    el.setAttribute("aria-disabled", "true");
    expect(swallowWhenDisabled(el, event)).toBe(true);
    expect(calls).toEqual(["prevent", "stop"]);
  });

  it("gives the agent hue style only for a hue from 1 to 8", () => {
    expect(agentHueStyle(3)).toEqual({ "--agent-hue": "var(--chart-3)" });
    expect(agentHueStyle(9)).toBeUndefined();
    expect(agentHueStyle(null)).toBeUndefined();
  });
});
