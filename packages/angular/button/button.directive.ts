import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";

import { swallowWhenDisabled } from "./button-disabled";

export type ButtonVariant =
  | "default"
  | "accent"
  | "secondary"
  | "soft"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

@Directive({
  selector: "button[soneBtn], a[soneBtn], label[soneBtn]",
  exportAs: "soneBtn",
  host: {
    class: "btn",
    "data-slot": "button",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
  },
})
export class SoneButtonDirective {
  /**
   * `accent`: filled with the accent (the primary call to action where `default` is ink).
   * `soft`: a translucent grey fill (a quiet icon button). A toggle button with
   * `aria-pressed="true"` gets the pressed fill in `ghost`, `outline` (keeping its border)
   * and `soft`.
   */
  readonly variant = input<ButtonVariant>("default");
  readonly size = input<ButtonSize>("default");

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    if (el.tagName === "BUTTON") return;
    const swallow = (event: Event): void => {
      swallowWhenDisabled(el, event);
    };
    el.addEventListener("click", swallow, { capture: true });
    inject(DestroyRef).onDestroy(() =>
      el.removeEventListener("click", swallow, { capture: true }),
    );
  }
}
