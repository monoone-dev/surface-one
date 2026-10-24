// The tag input's rules, with no framework in it: Angular and the Vue and React twins
// (through @surface-one/core) add, refuse and fold tags the same way.

export type TagRejectReason = "duplicate" | "invalid" | "max";

/** What `(rejected)` emits: the refused tag and why. */
export interface SoneTagRejection {
  readonly tag: string;
  readonly reason: TagRejectReason;
}

export interface SoneTagRules {
  /** At most this many tags; further ones are refused with reason `max`. */
  readonly max?: number | null;
  /** Return `false` to refuse a tag (reason `invalid`). */
  readonly validate?: ((tag: string) => boolean) | null;
}

export interface SoneTagsAdded {
  /** The tags after the accepted ones were appended. */
  readonly next: string[];
  /** The tags that were added, in order. */
  readonly accepted: string[];
  /** The tags that were refused, in order, with why. */
  readonly rejected: SoneTagRejection[];
}

/**
 * Adds each typed part (trimmed, empty ones skipped) to `current`. A duplicate is
 * refused case-insensitively, then one `validate` refuses, then one past `max`.
 */
export function addTags(
  current: readonly string[],
  parts: readonly string[],
  rules: SoneTagRules = {},
): SoneTagsAdded {
  const next = [...current];
  const accepted: string[] = [];
  const rejected: SoneTagRejection[] = [];
  const { max = null, validate = null } = rules;
  for (const raw of parts) {
    const tag = raw.trim();
    if (!tag) continue;
    let reason: TagRejectReason | null = null;
    if (next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      reason = "duplicate";
    } else if (validate && !validate(tag)) {
      reason = "invalid";
    } else if (max != null && next.length >= max) {
      reason = "max";
    }
    if (reason) {
      rejected.push({ tag, reason });
    } else {
      next.push(tag);
      accepted.push(tag);
    }
  }
  return { next, accepted, rejected };
}

/**
 * Splits typed text at its commas: the finished parts and the rest still being typed
 * (after the last comma). `null` when there is no comma yet.
 */
export function splitTagDraft(
  text: string,
): { readonly parts: string[]; readonly rest: string } | null {
  if (!text.includes(",")) return null;
  const parts = text.split(",");
  const rest = parts.pop() ?? "";
  return { parts, rest };
}

/** The text left in the field: the refused tags, to be fixed, then what is still being typed. */
export function tagDraftAfter(
  rejected: readonly SoneTagRejection[],
  rest = "",
): string {
  return [...rejected.map((r) => r.tag), rest]
    .filter((p) => p.trim())
    .join(", ");
}

/** How many tags hide behind the "+N more" toggle. */
export function hiddenTagCount(
  count: number,
  maxVisible: number | null | undefined,
): number {
  return maxVisible == null ? 0 : Math.max(count - maxVisible, 0);
}

/** The tags shown as chips: all of them when expanded or unlimited. */
export function visibleTags<T>(
  tags: readonly T[],
  maxVisible: number | null | undefined,
  expanded: boolean,
): readonly T[] {
  return expanded || maxVisible == null
    ? tags
    : tags.slice(0, Math.max(maxVisible, 0));
}
