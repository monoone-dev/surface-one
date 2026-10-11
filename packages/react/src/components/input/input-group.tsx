"use client";

import {
  createElement,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ElementType,
  type MouseEvent,
} from "react";

import { definePart, type PolymorphicProps } from "../../utils/part";

export type InputGroupAddonAlign =
  "inline-start" | "inline-end" | "block-start" | "block-end";

export interface SoneInputGroupOwnProps {
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  /** Take the free space of a flex row (`flex: 1`, may shrink). */
  readonly fill?: boolean;
}

/** `[soneInputGroup]` — a control with addons (icons, text, buttons) inside one frame. */
export function SoneInputGroup<E extends ElementType = "div">({
  as,
  invalid = false,
  disabled = false,
  fill = false,
  ...rest
}: PolymorphicProps<E, SoneInputGroupOwnProps>) {
  const tag: ElementType = as ?? "div";
  return createElement(tag, {
    // A <form> keeps its implicit form role.
    role: tag === "form" ? undefined : "group",
    "data-slot": "input-group",
    "data-invalid": invalid ? "true" : undefined,
    "data-disabled": disabled ? "true" : undefined,
    "data-fill": fill ? "" : undefined,
    ...rest,
  });
}

function focusControl(e: MouseEvent<HTMLElement>): void {
  const target = e.target as Element | null;
  if (target?.closest("button, a, input, select, textarea, [tabindex]")) return;
  const group = e.currentTarget.closest('[data-slot="input-group"]');
  group
    ?.querySelector<HTMLElement>(
      'input[data-slot="input-group-control"], textarea[data-slot="input-group-control"], ' +
        '[data-slot="input-group-control"] input',
    )
    ?.focus();
}

export interface SoneInputGroupAddonOwnProps {
  readonly align?: InputGroupAddonAlign;
}

/** An addon; a click on its empty area focuses the group's control. */
export function SoneInputGroupAddon<E extends ElementType = "div">({
  as,
  align = "inline-start",
  onClick,
  ...rest
}: PolymorphicProps<E, SoneInputGroupAddonOwnProps>) {
  return createElement(as ?? "div", {
    role: "group",
    "data-slot": "input-group-addon",
    "data-align": align,
    ...rest,
    onClick: (e: MouseEvent<HTMLElement>) => {
      focusControl(e);
      (onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
    },
  });
}

type ControlProps<T extends "input" | "textarea"> = Omit<
  ComponentPropsWithRef<T>,
  "value"
> & {
  /** The text (controlled); `null` shows an empty field. Or `defaultValue`. */
  readonly value?: string | number | null;
  /** Every edit, with the field's new text (the twin of Vue's `update:modelValue`). */
  readonly onValueChange?: (value: string) => void;
};

function control<T extends "input" | "textarea">(tag: T, name: string) {
  const Control = ({
    value,
    onValueChange,
    onChange,
    ...rest
  }: ControlProps<T>) =>
    createElement(tag, {
      "data-slot": "input-group-control",
      ...rest,
      ...(value !== undefined && { value: value ?? "" }),
      onChange: (e: ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
        (onChange as ((e: ChangeEvent) => void) | undefined)?.(e);
        onValueChange?.(e.target.value);
      },
    });
  Control.displayName = name;
  return Control;
}

/** The group's `<input>`: `value` / `defaultValue` / `onValueChange`; every other prop goes to it. */
export const SoneInputGroupInput = control("input", "SoneInputGroupInput");

/** The group's `<textarea>`: `value` / `defaultValue` / `onValueChange`. */
export const SoneInputGroupTextarea = control(
  "textarea",
  "SoneInputGroupTextarea",
);

export const SoneInputGroupText = definePart({
  name: "SoneInputGroupText",
  tag: "span",
  slot: "input-group-text",
});
