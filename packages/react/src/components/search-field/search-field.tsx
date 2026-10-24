"use client";

import {
  createElement,
  useImperativeHandle,
  useMemo,
  useRef,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "@surface-one/core/react/controllable";
import { mergeRefs } from "../../utils/refs";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";

export type SearchFieldSize = "sm" | "default";

/** What `handleRef` exposes (the Vue twin's exposed methods). */
export interface SoneSearchFieldHandle {
  /** Focuses the field. */
  focus(): void;
  /** Empties the field (calling `onValueChange("")`) and focuses it. */
  clear(): void;
}

export interface SoneSearchFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  "value" | "defaultValue" | "size" | "type" | "onSubmit" | "placeholder"
> {
  /** The text (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** Enter was pressed; carries the current text. */
  readonly onSubmit?: (value: string) => void;
  /** Escape was pressed on an empty or non-clearable field. */
  readonly onEscape?: () => void;
  readonly size?: SearchFieldSize;
  /** Default: the "Search" message. */
  readonly placeholder?: string | null;
  /** The field's accessible name (default: the "Search" message; `null` for none). */
  readonly ariaLabel?: string | null;
  readonly inputId?: string | null;
  /** Shows a clear button while the field has text; Escape clears it too. */
  readonly clearable?: boolean;
  /** The clear button's accessible name (default: the "Clear search" message). */
  readonly clearLabel?: string | null;
  /** `focus()` and `clear()`; `ref` itself is the `<input>`. */
  readonly handleRef?: Ref<SoneSearchFieldHandle>;
}

/**
 * `<sone-search-field>` — a search box on the Input Group: a leading search glyph, the
 * field (`role="searchbox"`) and, when `clearable` and not empty, a clear button at the
 * end. `value` / `defaultValue` / `onValueChange`.
 *
 * Enter calls `onSubmit` with the current text. Escape clears a `clearable` field that
 * has text; on an empty (or non-clearable) field it calls `onEscape` — close the panel
 * that holds it there. `handleRef` exposes `focus()` and `clear()`.
 * `className` / `style` style the host; every other prop (`ref` too) goes to the field.
 */
export function SoneSearchField({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onEscape,
  size = "default",
  placeholder,
  ariaLabel,
  inputId,
  clearable = false,
  clearLabel,
  disabled = false,
  handleRef,
  className,
  style,
  ref,
  onChange,
  onKeyDown,
  ...control
}: SoneSearchFieldProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const field = useRef<HTMLInputElement | null>(null);
  const fieldRef = useMemo(() => mergeRefs(field, ref), [ref]);
  const focus = (): void => field.current?.focus();
  /** Sets the value and the field at once, as the Angular twin does (Escape before a render). */
  const commit = (v: string): void => {
    if (field.current && field.current.value !== v) field.current.value = v;
    setValue(v);
  };
  const clear = (): void => {
    commit("");
    focus();
  };
  useImperativeHandle(handleRef, () => ({ focus, clear }));

  const showClear = clearable && value !== "" && !disabled;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    onKeyDown?.(e);
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.(value);
    } else if (e.key === "Escape") {
      if (clearable && value !== "") {
        e.preventDefault();
        e.stopPropagation();
        commit("");
      } else {
        onEscape?.();
      }
    }
  };

  const clearName = clearLabel ?? messages.clearSearch;
  const name =
    ariaLabel === undefined
      ? (control["aria-label"] ?? messages.search)
      : ariaLabel;
  return createElement(
    "sone-search-field",
    { className, style, "data-slot": "search-field", "data-size": size },
    <SoneInputGroup disabled={disabled}>
      <SoneInputGroupAddon as="span">
        <SoneIcon icon="search" />
      </SoneInputGroupAddon>
      <input
        {...control}
        ref={fieldRef}
        data-slot="input-group-control"
        type="text"
        role="searchbox"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck="false"
        value={value}
        placeholder={placeholder ?? messages.search}
        disabled={disabled}
        id={inputId ?? control.id}
        aria-label={name ?? undefined}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onChange?.(e);
          commit(e.target.value);
        }}
        onKeyDown={handleKeyDown}
      />
      {showClear ? (
        <SoneInputGroupAddon as="span" align="inline-end">
          <SoneButton
            variant="ghost"
            size="icon-xs"
            type="button"
            className="search-field-clear"
            aria-label={clearName}
            title={clearName}
            onClick={clear}
          >
            <SoneIcon icon="close" />
          </SoneButton>
        </SoneInputGroupAddon>
      ) : null}
    </SoneInputGroup>,
  );
}
