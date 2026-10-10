import {
  Directive,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
  numberAttribute,
} from "@angular/core";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";

function moveFocus(
  host: HTMLElement,
  slot: string,
  vertical: boolean,
  e: KeyboardEvent,
): void {
  const prev = vertical ? "ArrowUp" : "ArrowLeft";
  const next = vertical ? "ArrowDown" : "ArrowRight";
  if (e.key !== prev && e.key !== next && e.key !== "Home" && e.key !== "End")
    return;
  const items = Array.from(
    host.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
  ).filter(
    (el) =>
      !(el as HTMLButtonElement).disabled &&
      el.getAttribute("aria-disabled") !== "true",
  );
  const at = items.indexOf(document.activeElement as HTMLElement);
  if (at < 0 || items.length < 2) return;
  const to =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? items.length - 1
        : (at + (e.key === next ? 1 : -1) + items.length) % items.length;
  e.preventDefault();
  items[to].focus();
}

@Directive({
  selector: "[soneToggleGroup]",
  host: {
    class: "toggle-group",
    "data-slot": "toggle-group",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-spacing]": "spacing()",
    "[attr.data-orientation]": "orientation()",
    "[style.--toggle-group-spacing]": "spacing()",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneToggleGroupDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly variant = input<ToggleVariant>("default");
  readonly size = input<ToggleSize>("default");
  readonly spacing = input(0, {
    transform: (v: unknown) => numberAttribute(v, 0),
  });
  readonly orientation = input<ToggleOrientation>("horizontal");

  protected onKeydown(e: KeyboardEvent): void {
    moveFocus(
      this.host.nativeElement,
      "toggle-group-item",
      this.orientation() === "vertical",
      e,
    );
  }
}

@Directive({
  selector: "[soneToggleGroupItem]",
  host: {
    class: "toggle",
    "data-slot": "toggle-group-item",
    "[attr.data-variant]": "variantOut()",
    "[attr.data-size]": "sizeOut()",
    "[attr.data-state]": "pressed() ? 'on' : 'off'",
    "[attr.aria-pressed]": "pressed()",
  },
})
export class SoneToggleGroupItemDirective {
  private readonly group = inject(SoneToggleGroupDirective, { optional: true });
  readonly pressed = input(false, { transform: booleanAttribute });
  protected readonly variantOut = computed(
    () => this.group?.variant() ?? "default",
  );
  protected readonly sizeOut = computed(() => this.group?.size() ?? "default");
}

@Directive({
  selector: "[soneToggle]",
  host: {
    class: "toggle",
    "data-slot": "toggle",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-state]": "pressed() ? 'on' : 'off'",
    "[attr.aria-pressed]": "pressed()",
  },
})
export class SoneToggleDirective {
  readonly variant = input<ToggleVariant>("default");
  readonly size = input<ToggleSize>("default");
  readonly pressed = input(false, { transform: booleanAttribute });
}

export type TabsVariant = "default" | "line";

@Directive({
  selector: "[soneTabsList]",
  host: {
    class: "tabs-list",
    "data-slot": "tabs-list",
    "[attr.data-variant]": "variant()",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-stretch]": "stretch() ? '' : null",
    "[attr.aria-orientation]":
      "isTablist && orientation() === 'vertical' ? 'vertical' : null",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneTabsListDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  /** `aria-orientation` is only valid on a real `role="tablist"`. */
  protected readonly isTablist =
    inject(new HostAttributeToken("role"), { optional: true }) === "tablist";
  readonly variant = input<TabsVariant>("default");
  readonly orientation = input<ToggleOrientation>("horizontal");
  /** Fill the container's width, every trigger an equal share. */
  readonly stretch = input(false, { transform: booleanAttribute });

  protected onKeydown(e: KeyboardEvent): void {
    moveFocus(
      this.host.nativeElement,
      "tabs-trigger",
      this.orientation() === "vertical",
      e,
    );
  }
}

@Directive({
  selector: "[soneTabsTrigger]",
  host: {
    class: "tabs-trigger",
    "data-slot": "tabs-trigger",
    "[attr.data-state]": "active() ? 'active' : 'inactive'",
    "[attr.aria-selected]": "isTab ? active() : null",
    // A tablist is one Tab stop (WAI-ARIA Tabs): the active tab; arrows move between tabs.
    "[attr.tabindex]": "isTab ? (active() ? 0 : -1) : null",
    "[attr.aria-pressed]": "isTab ? null : active()",
    "[attr.data-icon]": "icon() ? '' : null",
  },
})
export class SoneTabsTriggerDirective {
  protected readonly isTab =
    inject(new HostAttributeToken("role"), { optional: true }) === "tab";
  readonly active = input(false, { transform: booleanAttribute });
  readonly icon = input(false, { transform: booleanAttribute });
}

export const SONE_TOGGLE_PARTS = [
  SoneToggleGroupDirective,
  SoneToggleGroupItemDirective,
  SoneToggleDirective,
  SoneTabsListDirective,
  SoneTabsTriggerDirective,
] as const;
