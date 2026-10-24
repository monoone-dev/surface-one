import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

export interface SoneKbdProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-kbd>` — a keyboard key. */
export function SoneKbd({ children, ...rest }: SoneKbdProps): ReactElement {
  return createElement(
    "sone-kbd",
    { "data-slot": "kbd", ...rest },
    <kbd>{children}</kbd>,
  );
}

/** `<sone-kbd-group>` — keys pressed together (`⌘` `K`). */
export function SoneKbdGroup({
  children,
  ...rest
}: SoneKbdProps): ReactElement {
  return createElement(
    "sone-kbd-group",
    { "data-slot": "kbd-group", ...rest },
    <kbd>{children}</kbd>,
  );
}
