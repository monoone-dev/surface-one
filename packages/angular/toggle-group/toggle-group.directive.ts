import { DOCUMENT } from "@angular/common";
import {
  Directive,
  ElementRef,
  HostAttributeToken,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  numberAttribute,
  signal,
} from "@angular/core";
import { rovingFocusTarget } from "@surface-one/angular/core";

export type ToggleVariant = "default" | "outline" | "dashed";
export type ToggleSize = "sm" | "default" | "lg";
export type ToggleOrientation = "horizontal" | "vertical";
/** `single`: one item pressed at a time (pressing it again clears it); `multiple`: any number. */
export type ToggleGroupType = "single" | "multiple";
/** The group's `value`: the pressed item's value (`single`) or the pressed values (`multiple`). */
export type ToggleGroupValue = string | readonly string[] | null;

const toList = (v: ToggleGroupValue | undefined): readonly string[] =>
  v == null ? [] : typeof v === "string" ? [v] : v;

function moveFocus(
  host: HTMLElement,
  active: Element | null,
  slot: string,
  vertical: boolean,
  e: KeyboardEvent,
): void {
  const items = Array.from(
    host.querySelectorAll<HTMLElement>(`[data-slot="${slot}"]`),
  ).filter(
    (el) =>
      !(el as HTMLButtonElement).disabled &&
      el.getAttribute("aria-disabled") !== "true",
  );
  const at = items.indexOf(active as HTMLElement);
  if (at < 0 || items.length < 2) return;
  rovingFocusTarget(e, items, at, {
    orientation: vertical ? "vertical" : "horizontal",
    paging: false,
  })?.focus();
}

/**
 * `[soneToggleGroup]` — a set of toggle buttons; arrow keys move between them.
 *
 * Without `type`, each item takes its own `pressed`. With `type="single"` or
 * `"multiple"` the group presses the items that carry a `value`, two-way through
 * `[(value)]`, and becomes one Tab stop (roving tabindex: the last focused item, else
 * the first pressed one); items keep `aria-pressed`.
 */
@Directive({
  selector: "[soneToggleGroup]",
  host: {
    class: "toggle-group",
    "data-slot": "toggle-group",
    "[attr.role]": "roleOut()",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-spacing]": "spacing()",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-stretch]": "stretch() ? '' : null",
    "[style.--toggle-group-spacing]": "spacing()",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneToggleGroupDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  readonly variant = input<ToggleVariant>("default");
  readonly size = input<ToggleSize>("default");
  readonly spacing = input(0, {
    transform: (v: unknown) => numberAttribute(v, 0),
  });
  readonly orientation = input<ToggleOrientation>("horizontal");
  /** Fill the container's width on one row, every item an equal share. */
  readonly stretch = input(false, { transform: booleanAttribute });
  /** The group presses its items (`single` / `multiple`); unset, each item's `pressed` decides. */
  readonly type = input<ToggleGroupType | null>(null);
  /** The pressed value (`single`, `null` for none) or values (`multiple`), two-way. */
  readonly value = model<ToggleGroupValue>(null);
  /** Every item disabled. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly authoredRole = inject(new HostAttributeToken("role"), {
    optional: true,
  });
  protected readonly roleOut = computed(
    () => this.authoredRole ?? (this.type() ? "group" : null),
  );

  /** The value of the item that last had focus: the group's Tab stop. */
  private readonly focusedValue = signal<string | null>(null);

  /** The item value that takes `tabindex="0"`, or `null` (every item in the Tab order). */
  readonly tabStop = computed<string | null>(() => {
    if (!this.type()) return null;
    return this.focusedValue() ?? toList(this.value())[0] ?? null;
  });

  isOn(value: string): boolean {
    return toList(this.value()).includes(value);
  }

  toggle(value: string): void {
    if (this.disabled()) return;
    const on = this.isOn(value);
    if (this.type() === "multiple") {
      const list = toList(this.value());
      this.value.set(on ? list.filter((v) => v !== value) : [...list, value]);
    } else {
      this.value.set(on ? null : value);
    }
  }

  focused(value: string | null): void {
    if (value !== null) this.focusedValue.set(value);
  }

  protected onKeydown(e: KeyboardEvent): void {
    moveFocus(
      this.host.nativeElement,
      this.doc.activeElement,
      "toggle-group-item",
      this.orientation() === "vertical",
      e,
    );
  }
}

/** `[soneToggleGroupItem]` — takes its variant, size and (with a `value` in a typed group) pressed state from the group. */
@Directive({
  selector: "[soneToggleGroupItem]",
  host: {
    class: "toggle",
    "data-slot": "toggle-group-item",
    "[attr.data-variant]": "variantOut()",
    "[attr.data-size]": "sizeOut()",
    "[attr.data-state]": "on() ? 'on' : 'off'",
    "[attr.aria-pressed]": "on()",
    "[attr.disabled]": "isDisabled() ? '' : null",
    "[attr.tabindex]": "tabIndex()",
    "(click)": "onClick()",
    "(focus)": "group?.focused(value())",
  },
})
export class SoneToggleGroupItemDirective {
  protected readonly group = inject(SoneToggleGroupDirective, {
    optional: true,
  });
  readonly pressed = input(false, { transform: booleanAttribute });
  /** Its value in a group with `type`: the group presses it. */
  readonly value = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Pressed by the group (a typed group and a `value`), else by `pressed`. */
  protected readonly on = computed(() => {
    const value = this.value();
    return this.group?.type() && value !== null
      ? this.group.isOn(value)
      : this.pressed();
  });
  protected readonly isDisabled = computed(
    () => this.disabled() || !!this.group?.disabled(),
  );
  protected readonly tabIndex = computed(() => {
    const stop = this.group?.tabStop() ?? null;
    if (stop === null) return null;
    return this.value() === stop ? 0 : -1;
  });

  protected onClick(): void {
    const value = this.value();
    if (this.group?.type() && value !== null && !this.isDisabled()) {
      this.group.toggle(value);
    }
  }
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
  private readonly doc = inject(DOCUMENT);
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
      this.doc.activeElement,
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
