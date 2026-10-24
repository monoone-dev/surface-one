import {
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
  effect,
  signal,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { computeFloatingPosition } from "@surface-one/angular/core";
import { SoneOverlayPanel } from "@surface-one/angular/popover";

@Directive({
  selector: "[soneMenu]",
  exportAs: "soneMenu",
  host: {
    class: "menu",
    "data-slot": "menu",
    "[attr.role]": "role()",
  },
})
export class SoneMenuDirective extends SoneOverlayPanel {
  private static readonly byElement = new WeakMap<
    HTMLElement,
    SoneMenuDirective
  >();

  /** The `[soneMenu]` directive on `el`, if any (a trigger finds the menu in a template it rendered). */
  static forElement(el: HTMLElement): SoneMenuDirective | null {
    return SoneMenuDirective.byElement.get(el) ?? null;
  }

  /** `menu` by default; `listbox` (or `null`) when the panel is not a menu. */
  readonly role = input<string | null>("menu");
  private readonly _managed = signal(false);
  /** True while a `soneMenuTrigger` drives this menu's focus (its items leave the Tab order). */
  readonly managed = this._managed.asReadonly();

  constructor() {
    super();
    SoneMenuDirective.byElement.set(this.element, this);
  }

  /** @internal Called by `soneMenuTrigger`. */
  setManaged(on: boolean): void {
    this._managed.set(on);
  }
}

/**
 * Takes a menu item out of the Tab order while a `soneMenuTrigger` manages its
 * menu (arrow keys move focus there), and gives back whatever `tabindex` the item
 * had once it no longer does.
 */
function manageItemTabindex(): void {
  const menu = inject(SoneMenuDirective, { optional: true });
  if (!menu) return;
  const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  let saved: string | null | undefined;
  effect(() => {
    if (menu.managed()) {
      if (saved === undefined) saved = el.getAttribute("tabindex");
      el.setAttribute("tabindex", "-1");
    } else if (saved !== undefined) {
      if (saved === null) el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", saved);
      saved = undefined;
    }
  });
}

export type MenuItemVariant = "default" | "destructive";

@Directive({
  selector: "[soneMenuItem]",
  host: {
    class: "menu-item",
    "data-slot": "menu-item",
    "[attr.role]": "role()",
    "[attr.data-variant]": "variant()",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuItemDirective {
  readonly variant = input<MenuItemVariant>("default");
  readonly inset = input(false, { transform: booleanAttribute });
  /**
   * `menuitem` by default. Pass `option` inside a listbox, or `null` to drop it;
   * for a check / radio item use `soneMenuCheckboxItem` / `soneMenuRadioItem`.
   */
  readonly role = input<string | null>("menuitem");

  constructor() {
    manageItemTabindex();
  }
}

@Directive({
  selector: "[soneMenuLabel]",
  host: {
    class: "menu-label",
    "data-slot": "menu-label",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuLabelDirective {
  readonly inset = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "[soneMenuGroup]",
  host: { class: "menu-group", "data-slot": "menu-group", role: "group" },
})
export class SoneMenuGroupDirective {}

@Directive({
  selector: "[soneMenuSeparator]",
  host: {
    class: "menu-separator",
    "data-slot": "menu-separator",
    role: "separator",
  },
})
export class SoneMenuSeparatorDirective {}

@Directive({
  selector: "[soneMenuShortcut]",
  host: { class: "menu-shortcut", "data-slot": "menu-shortcut" },
})
export class SoneMenuShortcutDirective {}

@Directive({
  selector: "[soneMenuCheckboxItem]",
  host: {
    class: "menu-item menu-item-checkable",
    "data-slot": "menu-checkbox-item",
    role: "menuitemcheckbox",
    "[attr.aria-checked]": "checked() ? 'true' : 'false'",
    "[attr.data-state]": "checked() ? 'checked' : 'unchecked'",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuCheckboxItemDirective {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly inset = input(false, { transform: booleanAttribute });

  constructor() {
    manageItemTabindex();
  }
}

@Directive({
  selector: "[soneMenuSwitchItem]",
  host: {
    class: "menu-item menu-item-switch",
    "data-slot": "menu-switch-item",
    role: "menuitemcheckbox",
    "[attr.aria-checked]": "checked() ? 'true' : 'false'",
    "[attr.data-state]": "checked() ? 'checked' : 'unchecked'",
  },
})
export class SoneMenuSwitchItemDirective {
  readonly checked = input(false, { transform: booleanAttribute });

  constructor() {
    manageItemTabindex();
  }
}

@Directive({
  selector: "[soneMenuRadioItem]",
  host: {
    class: "menu-item menu-item-checkable",
    "data-slot": "menu-radio-item",
    role: "menuitemradio",
    "[attr.aria-checked]": "checked() ? 'true' : 'false'",
    "[attr.data-state]": "checked() ? 'checked' : 'unchecked'",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuRadioItemDirective {
  readonly checked = input(false, { transform: booleanAttribute });
  readonly inset = input(false, { transform: booleanAttribute });

  constructor() {
    manageItemTabindex();
  }
}

@Directive({
  selector: "[soneMenuSubTrigger]",
  host: {
    class: "menu-item menu-sub-trigger",
    "data-slot": "menu-sub-trigger",
    role: "menuitem",
    "aria-haspopup": "menu",
    "[attr.aria-expanded]": "open() ? 'true' : 'false'",
    "[attr.data-state]": "open() ? 'open' : 'closed'",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuSubTriggerDirective {
  readonly open = input(false, { transform: booleanAttribute });
  readonly inset = input(false, { transform: booleanAttribute });

  constructor() {
    manageItemTabindex();
  }
}

const SUB_GAP_PX = 4;
const SUB_MARGIN_PX = 8;

@Directive({
  selector: "[soneMenuSub]",
  host: {
    class: "menu menu-sub",
    "data-slot": "menu-sub-content",
    "[attr.data-anchored]": "anchor() ? '' : null",
  },
})
export class SoneMenuSubDirective {
  readonly anchor = input<HTMLElement | null>(null);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => this.place());
  }

  private place(): void {
    const anchor = this.anchor();
    const el = this.host.nativeElement;
    const view = this.doc.defaultView;
    if (!anchor || !el.isConnected || !view) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const parent = anchor.closest<HTMLElement>('[data-slot="menu"]');
    const edge = parent?.getBoundingClientRect() ?? rect;
    const viewport = { width: view.innerWidth, height: view.innerHeight };
    const width = el.offsetWidth;
    const maxHeight = viewport.height - 2 * SUB_MARGIN_PX;
    if (el.offsetHeight > maxHeight) {
      el.style.maxHeight = `${Math.floor(maxHeight)}px`;
    }
    const size = { width, height: Math.min(el.offsetHeight, maxHeight) };
    // Beside the parent menu, level with the sub-trigger item.
    const beside = {
      top: rect.top,
      bottom: rect.bottom,
      left: edge.left,
      right: edge.right,
    };
    const at = (side: "right" | "left") =>
      computeFloatingPosition(beside, size, viewport, {
        side,
        align: "start",
        offset: SUB_GAP_PX,
        margin: SUB_MARGIN_PX,
        flip: false,
      });
    // To the right when it fits there, else to the left.
    const right = at("right");
    const placed = size.width <= right.maxWidth ? right : at("left");
    el.style.left = `${Math.round(placed.x)}px`;
    el.style.top = `${Math.round(placed.y)}px`;
    el.dataset["placed"] = "";
  }
}

export const SONE_MENU_PARTS = [
  SoneMenuDirective,
  SoneMenuItemDirective,
  SoneMenuCheckboxItemDirective,
  SoneMenuRadioItemDirective,
  SoneMenuSwitchItemDirective,
  SoneMenuLabelDirective,
  SoneMenuGroupDirective,
  SoneMenuSeparatorDirective,
  SoneMenuShortcutDirective,
  SoneMenuSubTriggerDirective,
  SoneMenuSubDirective,
] as const;
