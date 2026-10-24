import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";

import { swallowWhenDisabled } from "./button-disabled";

export type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";

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
