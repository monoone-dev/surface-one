"use client";

import { createElement, type HTMLAttributes, type Ref } from "react";

import { useControllable } from "../../utils/controllable";
import { SoneBadge, type BadgeVariant } from "../badge/badge";
import {
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../toggle-group/toggle-group";

export type FilterChipTone =
  "default" | "danger" | "warning" | "success" | "accent";

export interface FilterChipOption<T extends string = string> {
  readonly value: T;
  readonly label: string;
  /** Shown in a badge after the label; leave it out (or `null`) for none. */
  readonly count?: number | null;
  /** Tints the count badge (`danger` for errors, `warning` for warnings). */
  readonly tone?: FilterChipTone;
  readonly disabled?: boolean;
}

export type FilterChipsVariant = "toggle" | "tabs";
export type FilterChipsSize = "sm" | "default";

const TONE_BADGE: Record<FilterChipTone, BadgeVariant> = {
  default: "secondary",
  danger: "destructive",
  warning: "warning",
  success: "success",
  accent: "accent",
};

export interface SoneFilterChipsProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "defaultValue"
> {
  readonly options: readonly FilterChipOption[];
  /** The selected option's value (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string) => void;
  readonly variant?: FilterChipsVariant;
  /** The chip size of `variant="toggle"` (the tabs list has one size). */
  readonly size?: FilterChipsSize;
  /** Names the group ("Filter by level"). */
  readonly ariaLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-filter-chips>` — one-of-many filter buttons rendered from data, with an optional
 * count badge per option. `variant="toggle"` is an outline Toggle Group of separate chips;
 * `variant="tabs"` is a Tabs list. Either way each option is a toggle button
 * (`aria-pressed`) in a labelled `role="group"` — a filter, not a tab panel — with
 * arrow-key, Home and End navigation. `value` / `defaultValue` / `onValueChange`.
 */
export function SoneFilterChips({
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  variant = "toggle",
  size = "sm",
  ariaLabel,
  ...rest
}: SoneFilterChipsProps) {
  const [value, setValue] = useControllable<string | null>(
    valueProp,
    defaultValue,
    onValueChange as ((value: string | null) => void) | undefined,
  );
  const tabs = variant === "tabs";
  const items = options.map((option) => {
    const label = (
      <>
        {option.label}
        {option.count != null ? (
          <SoneBadge
            className="count"
            variant={TONE_BADGE[option.tone ?? "default"]}
          >
            {String(option.count)}
          </SoneBadge>
        ) : null}
      </>
    );
    const common = {
      type: "button" as const,
      disabled: !!option.disabled,
      onClick: () => {
        if (!option.disabled) setValue(option.value);
      },
    };
    return tabs ? (
      <SoneTabsTrigger
        key={option.value}
        {...common}
        active={value === option.value}
      >
        {label}
      </SoneTabsTrigger>
    ) : (
      <SoneToggleGroupItem
        key={option.value}
        {...common}
        pressed={value === option.value}
      >
        {label}
      </SoneToggleGroupItem>
    );
  });
  const group = {
    role: "group",
    className: "list",
    "aria-label": ariaLabel ?? undefined,
  };
  return createElement(
    "sone-filter-chips",
    { "data-slot": "filter-chips", "data-variant": variant, ...rest },
    tabs ? (
      <SoneTabsList {...group}>{items}</SoneTabsList>
    ) : (
      <SoneToggleGroup
        {...group}
        variant="outline"
        spacing={2}
        size={size === "sm" ? "sm" : "default"}
      >
        {items}
      </SoneToggleGroup>
    ),
  );
}
