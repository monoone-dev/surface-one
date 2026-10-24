// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  textareaAutosizeHeight,
  textareaCount,
  textareaNearLimit,
  textareaRowsHeight,
} from "../src";
import * as textarea from "../src/textarea";

const METRICS = { lineHeight: 20, paddingY: 16, borderY: 2 };

describe("the textarea helpers", () => {
  it("are in the module React Native imports", () => {
    expect(textarea.textareaCount).toBe(textareaCount);
  });

  it("size rows with their padding and border", () => {
    expect(textareaRowsHeight(3, 20, 18)).toBe(78);
    expect(textareaRowsHeight(-1, 20, 18)).toBe(18);
  });

  it("clamp the content height between minRows and maxRows", () => {
    expect(textareaAutosizeHeight(36, METRICS)).toEqual({
      height: 38,
      scroll: false,
    });
    expect(textareaAutosizeHeight(36, METRICS, { minRows: 2 })).toEqual({
      height: 58,
      scroll: false,
    });
    expect(
      textareaAutosizeHeight(200, METRICS, { minRows: 2, maxRows: 4 }),
    ).toEqual({ height: 98, scroll: true });
    // A maxRows below minRows never shrinks under the minimum.
    expect(
      textareaAutosizeHeight(200, METRICS, { minRows: 3, maxRows: 1 }).height,
    ).toBe(78);
  });

  it("count against the maxlength and say when the limit nears", () => {
    expect(textareaCount("hello", null)).toMatchObject({
      text: "5",
      remaining: null,
      state: "default",
      announce: false,
    });
    expect(textareaCount("hello", 200)).toMatchObject({
      text: "5/200",
      remaining: 195,
      state: "default",
      announce: false,
    });
    expect(textareaNearLimit(200)).toBe(20);
    expect(textareaNearLimit(40)).toBe(10);
    expect(textareaCount("x".repeat(185), 200)).toMatchObject({
      state: "near",
      remaining: 15,
      announce: true,
    });
    expect(textareaCount("x".repeat(200), 200)).toMatchObject({
      state: "limit",
      remaining: 0,
    });
    expect(textareaCount(undefined, Number.NaN).text).toBe("0");
  });
});
