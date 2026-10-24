"use client";

import {
  createElement,
  useLayoutEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactElement,
} from "react";

import { autosizeTextarea, textareaCount } from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { useSoneMessages } from "../../context/messages";
import { mergeRefs } from "../../utils/refs";

export interface SoneTextareaProps extends Omit<
  ComponentPropsWithRef<"textarea">,
  "value" | "defaultValue" | "children"
> {
  /** The text (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Grow and shrink with the content (the native resize handle goes away). */
  readonly autosize?: boolean;
  /** The fewest rows an autosizing textarea shows. */
  readonly minRows?: number | null;
  /** The most rows it grows to; it scrolls past them. */
  readonly maxRows?: number | null;
  /** A failed check: `aria-invalid` and the destructive border and ring. */
  readonly invalid?: boolean;
  /** Show the character counter after the textarea (against `maxLength`). */
  readonly showCount?: boolean;
}

/**
 * `<SoneTextarea>` — the React twin of `textarea[soneTextarea]`: the native `<textarea>`
 * (`value` / `defaultValue` / `onValueChange`) in the skin's `--textarea-*` look, with
 * `autosize` between `minRows` and `maxRows`, `invalid` and `maxLength`. `showCount`
 * adds the `sone-textarea-count` after it: `12/200`, tinted as the limit nears, with a
 * polite live region that says how many characters are left once few are. Every other
 * prop (`ref` too) goes to the textarea.
 */
export function SoneTextarea({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  autosize = false,
  minRows = null,
  maxRows = null,
  invalid = false,
  showCount = false,
  maxLength,
  onChange,
  ref,
  ...props
}: SoneTextareaProps): ReactElement {
  // A textarea's text is its value, never children.
  const { children: _children, ...rest } = props as typeof props & {
    children?: unknown;
  };
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const el = useRef<HTMLTextAreaElement | null>(null);
  const setRef = useMemo(() => mergeRefs(el, ref), [ref]);

  useLayoutEffect(() => {
    const node = el.current;
    if (!node) return;
    if (!autosize) {
      node.style.height = "";
      node.style.overflowY = "";
      return;
    }
    autosizeTextarea(node, { minRows, maxRows });
  }, [autosize, minRows, maxRows, value]);

  const textarea = (
    <textarea
      {...rest}
      ref={setRef}
      data-slot="textarea"
      data-autosize={autosize ? "" : undefined}
      value={value}
      maxLength={maxLength}
      aria-invalid={invalid ? "true" : rest["aria-invalid"]}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
        setValue(e.target.value);
      }}
    />
  );
  if (!showCount) return textarea;
  const c = textareaCount(value, maxLength);
  const announcement =
    c.announce && c.remaining !== null
      ? messages.textareaRemaining(c.remaining)
      : "";
  return (
    <>
      {textarea}
      {createElement(
        "sone-textarea-count",
        {
          className: "textarea-count",
          "data-slot": "textarea-count",
          "data-state": c.state,
        },
        <span aria-hidden="true">{c.text}</span>,
        <span className="sr-only" aria-live="polite">
          {announcement}
        </span>,
      )}
    </>
  );
}
