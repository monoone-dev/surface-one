// The avatar group's people and overflow, with no framework in it: the Angular
// `sone-avatar-group`, the Vue and React `SoneAvatarGroup` (through @surface-one/core)
// read it; the React Native one has the same rules.

export interface AvatarGroupPerson {
  readonly key?: string;
  /** Names the avatar and gives its initials. */
  readonly name?: string;
  /** The image URL. */
  readonly src?: string;
}

/** The initials of a name or an email: "Ada Lovelace" → "AL", "ada@x.io" → "A"; "?" when empty. */
export function soneInitials(name: string | null | undefined, max = 2): string {
  const words = (name ?? "")
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, ""))
    .filter(Boolean);
  if (!words.length) return "?";
  const picked =
    words.length === 1 ? [words[0]] : [words[0], words[words.length - 1]];
  return picked
    .slice(0, max)
    .map((w) => Array.from(w)[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}

/**
 * How many of `count` avatars show and how many the "+N" one stands for, when at most
 * `max` show (a negative or fractional `max` is read as its whole, non-negative part).
 */
export function avatarGroupSplit(
  count: number,
  max: number,
): { readonly shown: number; readonly hidden: number } {
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : count;
  const shown = Math.min(count, limit);
  return { shown, hidden: count - shown };
}
