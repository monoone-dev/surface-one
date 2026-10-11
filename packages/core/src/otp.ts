// The pure half of SoneInputOtp: the code length, what a character may be, the slot
// groups and the cleaning of typed or pasted text. Server-safe.

/** Digits only — the default `pattern`. */
export const SONE_OTP_DIGITS = "^\\d+$";
/** Latin letters and digits. */
export const SONE_OTP_ALPHANUMERIC = "^[a-zA-Z0-9]+$";

const NUMERIC = ["^\\d+$", "^[0-9]+$", "^\\d*$", "^[0-9]*$"];

/** The number of slots: `length` truncated, `6` when it is not a positive number. */
export function otpSize(length: number): number {
  const n = Math.trunc(length);
  return Number.isFinite(n) && n > 0 ? n : 6;
}

/** The pattern as a per-character test (no `g` / `y` flag, so `test` keeps no state). */
export function otpCharTest(pattern: string | RegExp): RegExp {
  const re = typeof pattern === "string" ? new RegExp(pattern) : pattern;
  return new RegExp(re.source, re.flags.replace(/[gy]/g, ""));
}

/** `numeric` for a digits-only pattern (the phone keypad), else `text`. */
export function otpInputMode(test: RegExp): "numeric" | "text" {
  return NUMERIC.includes(test.source) ? "numeric" : "text";
}

/** The slot indexes per group: `groups` when they add up to `size`, else one group. */
export function otpLayout(
  groups: readonly number[] | null | undefined,
  size: number,
): number[][] {
  const g = (groups ?? []).map((x) => Math.trunc(x));
  const ok =
    g.length > 0 && g.every((x) => x > 0) && g.reduce((a, b) => a + b) === size;
  let at = 0;
  return (ok ? g : [size]).map((count) =>
    Array.from({ length: count }, () => at++),
  );
}

/** The characters of `raw` that pass `test`, at most `size` of them. */
export function cleanOtp(raw: string, test: RegExp, size: number): string {
  return Array.from(raw)
    .filter((ch) => test.test(ch))
    .slice(0, size)
    .join("");
}
