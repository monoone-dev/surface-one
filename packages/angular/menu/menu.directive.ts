import {
  Directive,
  ElementRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";

@Directive({
  selector: "[soneMenu]",
  host: { class: "menu", "data-slot": "menu" },
})
export class SoneMenuDirective {}

export type MenuItemVariant = "default" | "destructive";

@Directive({
  selector: "[soneMenuItem]",
  host: {
    class: "menu-item",
    "data-slot": "menu-item",
    "[attr.data-variant]": "variant()",
    "[attr.data-inset]": "inset() ? '' : null",
  },
})
export class SoneMenuItemDirective {
  readonly variant = input<MenuItemVariant>("default");
  readonly inset = input(false, { transform: booleanAttribute });
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

  constructor() {
    afterNextRender(() => this.place());
  }

  private place(): void {
    const anchor = this.anchor();
    const el = this.host.nativeElement;
    if (!anchor || !el.isConnected) {
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const parent = anchor.closest<HTMLElement>('[data-slot="menu"]');
    const edge = parent?.getBoundingClientRect() ?? rect;
    const width = el.offsetWidth;
    const right = edge.right + SUB_GAP_PX;
    const left =
      right + width <= window.innerWidth - SUB_MARGIN_PX
        ? right
        : Math.max(SUB_MARGIN_PX, edge.left - width - SUB_GAP_PX);
    const maxHeight = window.innerHeight - 2 * SUB_MARGIN_PX;
    if (el.offsetHeight > maxHeight) {
      el.style.maxHeight = `${Math.floor(maxHeight)}px`;
    }
    const height = Math.min(el.offsetHeight, maxHeight);
    const top = Math.max(
      SUB_MARGIN_PX,
      Math.min(rect.top, window.innerHeight - SUB_MARGIN_PX - height),
    );
    el.style.left = `${Math.round(left)}px`;
    el.style.top = `${Math.round(top)}px`;
    el.dataset["placed"] = "";
  }
}

export const SONE_MENU_PARTS = [
  SoneMenuDirective,
  SoneMenuItemDirective,
  SoneMenuCheckboxItemDirective,
  SoneMenuRadioItemDirective,
  SoneMenuLabelDirective,
  SoneMenuGroupDirective,
  SoneMenuSeparatorDirective,
  SoneMenuShortcutDirective,
  SoneMenuSubTriggerDirective,
  SoneMenuSubDirective,
] as const;

@Directive({
  selector: "[sonePopover]",
  host: { class: "popover", "data-slot": "popover" },
})
export class SonePopoverDirective {}

@Directive({
  selector: "[sonePopoverHeader]",
  host: { class: "popover-header", "data-slot": "popover-header" },
})
export class SonePopoverHeaderDirective {}

@Directive({
  selector: "[sonePopoverTitle]",
  host: { class: "popover-title", "data-slot": "popover-title" },
})
export class SonePopoverTitleDirective {}

@Directive({
  selector: "[sonePopoverDescription]",
  host: { class: "popover-description", "data-slot": "popover-description" },
})
export class SonePopoverDescriptionDirective {}

export const SONE_POPOVER_PARTS = [
  SonePopoverDirective,
  SonePopoverHeaderDirective,
  SonePopoverTitleDirective,
  SonePopoverDescriptionDirective,
] as const;
