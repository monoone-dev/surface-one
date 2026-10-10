import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

import { SONE_DOCK } from "./dock.tokens";

/**
 * One tool of a dock — an icon button named by `label`, which is also its tooltip
 * (with the `shortcut`, if any). `[active]` makes it a toggle (`aria-pressed`):
 * the current drawing tool. Leave it unset for a plain action (zoom, undo).
 */
@Directive({
  selector: "button[soneDockItem]",
  hostDirectives: [
    {
      directive: SoneTooltipDirective,
      inputs: ["soneTooltipDisabled", "soneTooltipAlign"],
    },
  ],
  host: {
    class: "dock-item",
    "data-slot": "dock-item",
    "[attr.type]": "'button'",
    "[attr.aria-label]": "label()",
    "[attr.aria-pressed]": "active() === undefined ? null : !!active()",
    "[attr.aria-keyshortcuts]": "shortcut()",
    "[attr.data-tooltip]": "tooltip()",
    "[attr.data-active]": "active() ? '' : null",
    "[attr.tabindex]": "tabIndex()",
    "[disabled]": "disabled()",
    "(focus)": "dock?.focused(this)",
  },
})
export class SoneDockItemDirective {
  readonly el = inject<ElementRef<HTMLButtonElement>>(ElementRef);
  protected readonly dock = inject(SONE_DOCK, { optional: true });

  /** The accessible name and the tooltip. */
  readonly label = input.required<string>();
  /** A key that picks the tool (`V`, `Shift+R`) — shown in the tooltip, announced as `aria-keyshortcuts`. */
  readonly shortcut = input<string | null>(null);
  /** `true` / `false`: a toggle; unset: a plain button. */
  readonly active = input<boolean | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly tooltip = computed(() => {
    const key = this.shortcut();
    return key ? `${this.label()} (${key})` : this.label();
  });

  readonly tabIndex = computed(() =>
    this.dock ? (this.dock.tabStop() === this ? 0 : -1) : null,
  );
}

/** A labelled run of related tools (`role="group"`). */
@Directive({
  selector: "[soneDockGroup]",
  host: {
    class: "dock-group",
    "data-slot": "dock-group",
    role: "group",
    "[attr.aria-label]": "label()",
  },
})
export class SoneDockGroupDirective {
  readonly label = input<string | null>(null, { alias: "soneDockGroup" });
}

/** A rule between groups of tools, across the dock's direction. */
@Directive({
  selector: "[soneDockSeparator]",
  host: {
    class: "dock-separator",
    "data-slot": "dock-separator",
    role: "separator",
    "[attr.aria-orientation]":
      "dock?.orientation() === 'vertical' ? 'horizontal' : 'vertical'",
  },
})
export class SoneDockSeparatorDirective {
  protected readonly dock = inject(SONE_DOCK, { optional: true });
}
