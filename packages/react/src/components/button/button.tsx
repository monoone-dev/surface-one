import {
  createElement,
  type ElementType,
  type MouseEvent,
  type ReactElement,
} from "react";

import { cx, type PolymorphicProps } from "../../utils/part";

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

export type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

export type ButtonGroupOrientation = "horizontal" | "vertical";

/** A disabled link or label has no native `disabled`: `aria-disabled="true"` swallows its clicks. */
function swallowWhenDisabled(event: MouseEvent<HTMLElement>): void {
  if (event.currentTarget.getAttribute("aria-disabled") === "true") {
    event.preventDefault();
    event.stopPropagation();
  }
}

export interface SoneButtonOwnProps {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

/** `<button soneBtn>` — renders a `<button>`; `as="a"` or `as={Link}` for a link. */
export function SoneButton<E extends ElementType = "button">({
  as,
  variant = "default",
  size = "default",
  className,
  onClickCapture,
  ...rest
}: PolymorphicProps<E, SoneButtonOwnProps>): ReactElement {
  const tag: ElementType = as ?? "button";
  return createElement(tag, {
    "data-slot": "button",
    "data-variant": variant,
    "data-size": size,
    ...rest,
    className: cx("btn", className),
    onClickCapture:
      tag === "button"
        ? onClickCapture
        : (event: MouseEvent<HTMLElement>) => {
            swallowWhenDisabled(event);
            onClickCapture?.(event);
          },
  });
}

export interface SoneButtonGroupOwnProps {
  readonly orientation?: ButtonGroupOrientation;
}

/** `[soneButtonGroup]` */
export function SoneButtonGroup<E extends ElementType = "div">({
  as,
  orientation = "horizontal",
  className,
  ...rest
}: PolymorphicProps<E, SoneButtonGroupOwnProps>): ReactElement {
  return createElement(as ?? "div", {
    role: "group",
    "data-slot": "button-group",
    "data-orientation": orientation,
    ...rest,
    className: cx("btn-group", className),
  });
}
