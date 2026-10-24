"use client";

import {
  createElement,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from "react";

import {
  addTags,
  hiddenTagCount,
  splitTagDraft,
  tagDraftAfter,
  visibleTags,
  type SoneTagRejection,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { SoneBadge, SoneBadgeRemove, type BadgeVariant } from "../badge/badge";
import { SoneIcon } from "../icon/icon";

export type { SoneTagRejection, TagRejectReason } from "@surface-one/core";

/** What `handleRef` exposes (the Vue twin's exposed method). */
export interface SoneTagInputHandle {
  /** Focuses the text field. */
  focus(): void;
}

export interface SoneTagInputProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue" | "onBlur" | "placeholder"
> {
  /** The tags (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: readonly string[];
  readonly defaultValue?: readonly string[];
  readonly onValueChange?: (value: string[]) => void;
  readonly placeholder?: string;
  /** The text field's accessible name (default: the "Add tag" message; `null` for none). */
  readonly ariaLabel?: string | null;
  readonly inputId?: string | null;
  /** At most this many tags; further ones are rejected with reason `max`. */
  readonly max?: number | null;
  /** Show this many chips and a "+N more" toggle for the rest. */
  readonly maxVisible?: number | null;
  /** Offered while typing (a native `<datalist>`). */
  readonly suggestions?: readonly string[];
  /** Return `false` to refuse a tag (reason `invalid`). */
  readonly validate?: ((tag: string) => boolean) | null;
  /** The chips' badge variant. */
  readonly variant?: BadgeVariant;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  readonly onAdded?: (tag: string) => void;
  readonly onRemoved?: (tag: string) => void;
  readonly onRejected?: (rejection: SoneTagRejection) => void;
  /** The text field lost focus. */
  readonly onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  /** `focus()`. */
  readonly handleRef?: Ref<SoneTagInputHandle>;
}

const EMPTY: readonly string[] = [];

/**
 * `<sone-tag-input>` — tags as removable chips: `value` / `defaultValue` /
 * `onValueChange` (a `string[]`). Enter or a comma adds the typed tag (a pasted
 * "a, b, c" adds three), Backspace in the empty field removes the last one. Duplicates
 * are refused case-insensitively; refused text stays in the field and `onRejected`
 * says why. `handleRef` exposes `focus()`.
 */
export function SoneTagInput({
  value: valueProp,
  defaultValue = EMPTY,
  onValueChange,
  placeholder = "",
  ariaLabel,
  inputId,
  max = null,
  maxVisible = null,
  suggestions = EMPTY,
  validate = null,
  variant = "secondary",
  disabled = false,
  invalid = false,
  onAdded,
  onRemoved,
  onRejected,
  onBlur,
  handleRef,
  onClick,
  ...rest
}: SoneTagInputProps): ReactElement {
  const m = useSoneMessages();
  const [value, setValue] = useControllable<readonly string[]>(
    valueProp,
    defaultValue,
    onValueChange as ((value: readonly string[]) => void) | undefined,
  );
  const listId = `sone-tag-input-list-${useId()}`;
  const [draft, setDraftState] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const field = useRef<HTMLInputElement | null>(null);
  // The latest tags, for several changes inside one event (before a re-render).
  const current = useRef(value);
  current.current = value;
  const focus = (): void => field.current?.focus();
  useImperativeHandle(handleRef, () => ({ focus }));

  const hidden = hiddenTagCount(value.length, maxVisible);
  const shown = visibleTags(value, maxVisible, expanded);

  const update = (next: string[]): void => {
    current.current = next;
    setValue(next);
  };

  const setDraft = (text: string): void => {
    setDraftState(text);
    if (field.current && field.current.value !== text)
      field.current.value = text;
  };

  /** Adds the parts it accepts and returns the ones it refuses (left in the field). */
  const addAll = (parts: readonly string[]): SoneTagRejection[] => {
    const { next, accepted, rejected } = addTags(current.current, parts, {
      max,
      validate,
    });
    for (const r of rejected) onRejected?.(r);
    if (accepted.length) {
      update(next);
      for (const tag of accepted) onAdded?.(tag);
      setAnnouncement(m.tagsAdded(accepted.join(", ")));
    }
    return rejected;
  };

  const commit = (): void => {
    if (!draft.trim()) return;
    setDraft(tagDraftAfter(addAll(draft.split(","))));
  };

  const remove = (tag: string, refocus = true): void => {
    if (disabled) return;
    const tags = current.current;
    const next = tags.filter((t) => t !== tag);
    if (next.length === tags.length) return;
    update(next);
    onRemoved?.(tag);
    setAnnouncement(m.tagRemoved(tag));
    if (refocus) focus();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const text = e.target.value;
    const split = splitTagDraft(text);
    if (!split) {
      setDraftState(text);
      return;
    }
    setDraft(tagDraftAfter(addAll(split.parts), split.rest));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" || e.key === ",") {
      if (e.key === "," || draft.trim()) e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      remove(value[value.length - 1]!, false);
    }
  };

  const focusFromFrame = (e: MouseEvent<HTMLElement>): void => {
    onClick?.(e);
    const target = e.target as Element | null;
    if (target?.closest("button, a, input, select, textarea")) return;
    if (!disabled) focus();
  };

  const name = ariaLabel === undefined ? m.tagAdd : ariaLabel;
  return createElement(
    "sone-tag-input",
    {
      ...rest,
      "data-slot": "tag-input",
      "data-invalid": invalid ? "true" : undefined,
      "data-disabled": disabled ? "true" : undefined,
      "data-focused": focused ? "" : undefined,
      onClick: focusFromFrame,
    },
    value.length > 0 ? (
      <ul
        className="tag-input-list"
        data-slot="tag-input-list"
        aria-label={m.tagList}
      >
        {shown.map((tag) => (
          <SoneBadge
            key={tag}
            as="li"
            className="tag-input-tag"
            variant={variant}
          >
            <span className="badge-label">{tag}</span>
            {disabled ? null : (
              <SoneBadgeRemove
                aria-label={m.tagRemove(tag)}
                onClick={() => remove(tag)}
              >
                <SoneIcon icon="close" />
              </SoneBadgeRemove>
            )}
          </SoneBadge>
        ))}
        {hidden > 0 ? (
          <li className="tag-input-more">
            <SoneBadge
              as="button"
              variant="outline"
              type="button"
              data-slot="tag-input-more"
              aria-expanded={expanded ? "true" : "false"}
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? m.tagShowLess : m.tagMore(hidden)}
            </SoneBadge>
          </li>
        ) : null}
      </ul>
    ) : null,
    <input
      ref={field}
      type="text"
      className="tag-input-field"
      data-slot="tag-input-input"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck="false"
      enterKeyHint="enter"
      value={draft}
      placeholder={placeholder}
      disabled={disabled}
      id={inputId ?? undefined}
      list={suggestions.length ? listId : undefined}
      aria-label={name ?? undefined}
      aria-invalid={invalid ? "true" : undefined}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
    />,
    suggestions.length ? (
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    ) : null,
    <span className="sr-only" aria-live="polite" aria-atomic="true">
      {announcement}
    </span>,
  );
}
