"use client";

import {
  createElement,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

import {
  comboboxActiveOption,
  comboboxLabelIds,
  comboboxNavigate,
  comboboxOptionId,
  comboboxOptions,
  comboboxSelectedOptions,
  comboboxToggle,
  createComboboxPopup,
  filterComboboxItems,
  isComboboxSelected,
  listNavigationIndex,
  soneCommandFilter,
  type SoneCommandFilter,
  type SoneComboboxItems,
  type SoneComboboxOption,
  type SoneComboboxValue,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "@surface-one/core/react/controllable";
import { cx, flag } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type {
  SoneComboboxGroup,
  SoneComboboxItems,
  SoneComboboxOption,
  SoneComboboxValue,
} from "@surface-one/core";

export interface SoneComboboxProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue" | "onChange" | "placeholder"
> {
  /** The options: `{ value, label, disabled?, keywords? }`, or `{ label, options }` groups. */
  readonly options?: SoneComboboxItems;
  /** Pick several options, shown as chips; the value is then a list. */
  readonly multiple?: boolean;
  /** The picked value (`null` while none) or a list, controlled with `onValueChange`; or `defaultValue`. */
  readonly value?: SoneComboboxValue;
  readonly defaultValue?: SoneComboboxValue;
  readonly onValueChange?: (value: SoneComboboxValue) => void;
  /** The typed text, controlled with `onSearchChange`; it clears when the popup closes. */
  readonly search?: string;
  readonly onSearchChange?: (search: string) => void;
  /** The popup is open, controlled with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Filter the options by the search. Turn off when they come filtered from a server. */
  readonly shouldFilter?: boolean;
  /** A custom match function (default `soneCommandFilter`). */
  readonly filter?: SoneCommandFilter;
  readonly placeholder?: string;
  /** Shown in the popup when no option matches (default: the messages' `comboboxEmpty`). */
  readonly emptyText?: string;
  /** A clear button while something is picked. */
  readonly clearable?: boolean;
  readonly disabled?: boolean;
  readonly invalid?: boolean;
  /** The input's `id`, for a `<label htmlFor>`. */
  readonly inputId?: string;
  readonly name?: string;
  /** Names the input when no `<label>` does. */
  readonly "aria-label"?: string;
  /** Extra ids for the input's `aria-describedby`. */
  readonly "aria-describedby"?: string;
  readonly clearLabel?: string;
}

const NONE: SoneComboboxItems = [];

/**
 * `<sone-combobox>` — a text field that filters a listbox of options as you type
 * (shadcn/ui Combobox, the WAI-ARIA combobox pattern): Up / Down, Home / End, PageUp /
 * PageDown move the highlight (`aria-activedescendant`), Enter picks, Escape closes.
 * `options` holds `{ value, label, disabled, keywords }` or labelled groups; `value` /
 * `onValueChange` is one value or, with `multiple`, a list shown as chips.
 */
export function SoneCombobox({
  options = NONE,
  multiple = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  search: searchProp,
  onSearchChange,
  open: openProp,
  defaultOpen,
  onOpenChange,
  shouldFilter = true,
  filter = soneCommandFilter,
  placeholder = "",
  emptyText,
  clearable = false,
  disabled = false,
  invalid = false,
  inputId,
  name,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  clearLabel,
  className,
  ...rest
}: SoneComboboxProps): ReactElement {
  const messages = useSoneMessages();
  const [value, setValue] = useControllable<SoneComboboxValue>(
    valueProp,
    defaultValue ?? (multiple ? [] : null),
    onValueChange,
  );
  const [search, setSearch] = useControllable<string>(
    searchProp,
    "",
    onSearchChange,
  );
  const [open, setOpen] = useControllable<boolean>(
    openProp,
    defaultOpen ?? false,
    onOpenChange,
  );
  const listId = `sone-combobox-list-${useId()}`;
  const control = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [listLabelledBy, setListLabelledBy] = useState<string | null>(null);
  const [reveal, setReveal] = useState(0);

  const live = useRef({ setOpen });
  useInsertionEffect(() => {
    live.current = { setOpen };
  });
  const [popup] = useState(() =>
    createComboboxPopup({
      anchor: () => control.current,
      positioner: () => positioner.current,
      close: () => live.current.setOpen(false),
    }),
  );

  useEffect(() => {
    setListLabelledBy(comboboxLabelIds(input.current, listId));
  }, [listId]);
  // After the DOM update: the popup is on <body> (or gone).
  useLayoutEffect(() => {
    if (!open) return;
    popup.attached();
    return popup.detached;
  }, [open, popup]);
  useLayoutEffect(() => {
    if (open) popup.attached();
  });
  useLayoutEffect(() => {
    if (reveal) popup.revealActive();
  }, [reveal, popup]);
  // Closed: the field shows the picked label again.
  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open) {
      setEditing(false);
      setActive(null);
      if (search) setSearch("");
    }
    wasOpen.current = open;
  }, [open, search, setSearch]);

  const all = comboboxOptions(options);
  const sections = filterComboboxItems(
    options,
    editing && shouldFilter ? search : "",
    filter,
  );
  const visible = sections.flatMap((s) => s.options);
  const activeOption = comboboxActiveOption(visible, active, value);
  const picked = comboboxSelectedOptions(options, value);
  const hasValue = picked.length > 0;
  const optionId = (option: SoneComboboxOption): string =>
    comboboxOptionId(
      listId,
      all.findIndex((o) => o.value === option.value),
    );

  const choose = (option: SoneComboboxOption): void => {
    if (option.disabled || disabled) return;
    setValue(comboboxToggle(value, option.value, multiple));
    setActive(option.value);
    if (multiple) {
      setSearch("");
      setEditing(false);
    } else setOpen(false);
  };
  const remove = (v: string): void => {
    if (disabled) return;
    setValue(
      Array.isArray(value)
        ? value.filter((x) => x !== v)
        : value === v
          ? null
          : value,
    );
  };
  const clear = (): void => {
    setValue(multiple ? [] : null);
    setSearch("");
    setEditing(false);
    input.current?.focus();
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (event.nativeEvent.isComposing || disabled) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        if (!open) {
          event.preventDefault();
          if (!event.altKey && event.key === "ArrowUp") {
            const enabled = visible.filter((o) => !o.disabled);
            setActive(enabled[enabled.length - 1]?.value ?? null);
          }
          setOpen(true);
          return;
        }
        break;
      case "Enter":
        if (!open || !activeOption) return;
        event.preventDefault();
        choose(activeOption);
        return;
      case "Escape":
        if (!open) return;
        // Before an enclosing dialog's own Escape handler: close the innermost layer first.
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      case "Backspace":
        if (multiple && !search && picked.length) {
          event.preventDefault();
          remove(picked[picked.length - 1]!.value);
        }
        return;
    }
    if (!open) return;
    const next = comboboxNavigate(
      event.key,
      activeOption?.value ?? null,
      visible,
      (key, current, count) =>
        listNavigationIndex(key, current, count, { wrap: true }),
    );
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    setReveal((n) => n + 1);
  };

  const onControlMouseDown = (event: ReactMouseEvent<HTMLDivElement>): void => {
    if (event.target === input.current) return;
    event.preventDefault();
    if (!disabled) input.current?.focus();
  };

  const has = sections.length > 0;
  const popupNode =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={positioner}
            className="overlay-positioner"
            data-slot="overlay-positioner"
          >
            <div
              className="combobox-content"
              data-slot="combobox-content"
              id={listId}
              role={has ? "listbox" : undefined}
              aria-multiselectable={has && multiple ? "true" : undefined}
              aria-labelledby={has ? (listLabelledBy ?? undefined) : undefined}
              aria-label={
                has && !listLabelledBy
                  ? ariaLabel || placeholder || undefined
                  : undefined
              }
              onMouseDown={(e) => e.preventDefault()}
            >
              {has ? (
                sections.map((section, i) => (
                  <div
                    key={section.label ?? `-${i}`}
                    className="combobox-group"
                    data-slot="combobox-group"
                    role={section.label ? "group" : "none"}
                    aria-labelledby={
                      section.label ? `${listId}-group-${i}` : undefined
                    }
                  >
                    {section.label ? (
                      <div
                        className="combobox-label"
                        data-slot="combobox-label"
                        id={`${listId}-group-${i}`}
                      >
                        {section.label}
                      </div>
                    ) : null}
                    {section.options.map((option) => {
                      const selected = isComboboxSelected(value, option.value);
                      return (
                        <div
                          key={option.value}
                          className="combobox-item"
                          data-slot="combobox-item"
                          role="option"
                          id={optionId(option)}
                          aria-selected={selected ? "true" : "false"}
                          aria-disabled={option.disabled ? "true" : undefined}
                          data-highlighted={flag(
                            activeOption?.value === option.value,
                          )}
                          onClick={() => choose(option)}
                          onPointerMove={() => {
                            if (!option.disabled) setActive(option.value);
                          }}
                        >
                          <span className="combobox-item-label">
                            {option.label}
                          </span>
                          {selected ? (
                            <span
                              className="combobox-item-indicator"
                              aria-hidden="true"
                            >
                              <SoneIcon icon="check" />
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div
                  className="combobox-empty"
                  data-slot="combobox-empty"
                  role="status"
                >
                  {emptyText ?? messages.comboboxEmpty}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  const text = editing || multiple ? search : (picked[0]?.label ?? "");
  return createElement(
    "sone-combobox",
    {
      ...rest,
      className: cx("combobox", className),
      "data-slot": "combobox",
      "data-multiple": flag(multiple),
      "data-disabled": flag(disabled),
      "data-invalid": flag(invalid),
    },
    <div
      ref={control}
      className="combobox-control"
      data-slot="combobox-control"
      onMouseDown={onControlMouseDown}
    >
      {multiple
        ? picked.map((option) => (
            <span
              key={option.value}
              className="combobox-chip"
              data-slot="combobox-chip"
            >
              <span className="combobox-chip-label">{option.label}</span>
              {disabled ? null : (
                <button
                  type="button"
                  className="combobox-chip-remove"
                  data-slot="combobox-chip-remove"
                  tabIndex={-1}
                  aria-label={messages.tagRemove(option.label)}
                  onClick={() => remove(option.value)}
                >
                  <SoneIcon icon="close" />
                </button>
              )}
            </span>
          ))
        : null}
      <input
        ref={input}
        type="text"
        className="combobox-input"
        data-slot="combobox-input"
        role="combobox"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open ? "true" : "false"}
        aria-controls={open ? listId : undefined}
        data-state={open ? "open" : "closed"}
        value={text}
        placeholder={multiple && hasValue ? "" : placeholder}
        disabled={disabled}
        id={inputId}
        name={name}
        aria-label={ariaLabel}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={ariaDescribedby}
        aria-activedescendant={
          open && activeOption ? optionId(activeOption) : undefined
        }
        onChange={(event) => {
          setSearch(event.target.value);
          setEditing(true);
          setActive(null);
          setOpen(true);
        }}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onBlur={() => setOpen(false)}
      />
      {clearable && hasValue && !disabled ? (
        <button
          type="button"
          className="combobox-clear"
          data-slot="combobox-clear"
          tabIndex={-1}
          aria-label={clearLabel ?? messages.comboboxClear}
          onClick={clear}
        >
          <SoneIcon icon="close" />
        </button>
      ) : null}
      <button
        type="button"
        className="combobox-trigger"
        data-slot="combobox-trigger"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          input.current?.focus();
          setOpen(!open);
        }}
      >
        <SoneIcon icon="chevron-down" />
      </button>
    </div>,
    popupNode,
  );
}
