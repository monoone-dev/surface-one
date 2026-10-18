import { Platform, type PressableProps } from "react-native";

type A11y = Pick<
  PressableProps,
  "role" | "accessibilityRole" | "aria-checked" | "aria-selected"
>;

/**
 * A two-state button. React Native has no `aria-pressed`: on iOS and Android it is a
 * checked / unchecked `togglebutton` ("on" / "off"); react-native-web forwards
 * `aria-pressed`, so the web keeps the twins' `button[aria-pressed]`.
 */
export function pressedProps(on: boolean): A11y {
  return Platform.OS === "web"
    ? ({ role: "button", "aria-pressed": on } as A11y)
    : { accessibilityRole: "togglebutton", "aria-checked": on };
}

/** The current item of a sequence: `aria-current="step"` on the web, selected natively. */
export function currentProps(on: boolean): A11y {
  return Platform.OS === "web"
    ? ({ "aria-current": on ? "step" : undefined } as A11y)
    : { "aria-selected": on };
}
