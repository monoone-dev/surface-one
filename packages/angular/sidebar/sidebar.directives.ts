import {
  Directive,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";

import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import {
  SoneTooltipDirective,
  type TooltipSide,
} from "@surface-one/angular/tooltip";
import { SoneSidebarComponent } from "./sidebar.component";
export { SoneSidebarComponent };
import { SoneSidebarService } from "./sidebar.service";

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * ⌘B/Ctrl+B also toggles Bold in `sone-markdown-editor`, which calls
 * `preventDefault()` on the textarea before this document-level listener runs,
 * so it stands down there and never fires inside any editable field.
 */
@Directive({
  selector: "[soneSidebarWrapper], sone-sidebar-wrapper",
  host: {
    "data-slot": "sidebar-wrapper",
    "[style.--sidebar-width]": "widthCss()",
    "[style.--sidebar-width-icon]": "sidebarWidthIcon()",
    "[attr.data-state]": "sidebar.state()",
    "[attr.data-resizing]": "sidebar.resizing() ? '' : null",
    "(document:keydown)": "onKeydown($event)",
  },
})
export class SoneSidebarWrapperDirective {
  protected readonly sidebar = inject(SoneSidebarService);

  readonly sidebarWidth = input<string | null>(null);
  readonly sidebarWidthIcon = input<string | null>(null);

  protected readonly widthCss = computed(
    () => this.sidebarWidth() ?? this.sidebar.widthCss(),
  );

  protected onKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented || event.isComposing) return;
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
      return;
    }
    if (event.key.toLowerCase() !== this.sidebar.keyboardShortcut) return;
    if (isEditable(event.target)) return;
    event.preventDefault();
    this.sidebar.toggleSidebar();
  }
}

@Directive({
  selector: "[soneSidebarHeader], sone-sidebar-header",
  host: { "data-slot": "sidebar-header", "data-sidebar": "header" },
})
export class SoneSidebarHeaderDirective {}

@Directive({
  selector: "[soneSidebarContent], sone-sidebar-content",
  host: { "data-slot": "sidebar-content", "data-sidebar": "content" },
})
export class SoneSidebarContentDirective {}

@Directive({
  selector: "[soneSidebarFooter], sone-sidebar-footer",
  host: { "data-slot": "sidebar-footer", "data-sidebar": "footer" },
})
export class SoneSidebarFooterDirective {}

@Directive({
  selector: "[soneSidebarSeparator], sone-sidebar-separator",
  hostDirectives: [SoneSeparatorDirective],
  host: { "data-slot": "sidebar-separator", "data-sidebar": "separator" },
})
export class SoneSidebarSeparatorDirective {}

export type SoneSidebarGroupTone = "default" | "danger";

@Directive({
  selector: "[soneSidebarGroup], sone-sidebar-group",
  host: {
    "data-slot": "sidebar-group",
    "data-sidebar": "group",
    "[attr.data-tone]": "tone() === 'default' ? null : tone()",
  },
})
export class SoneSidebarGroupDirective {
  /** `danger` tints the group's label and rows red (a developer or destructive section). */
  readonly tone = input<SoneSidebarGroupTone>("default");
}

@Directive({
  selector: "[soneSidebarGroupLabel]",
  host: { "data-slot": "sidebar-group-label", "data-sidebar": "group-label" },
})
export class SoneSidebarGroupLabelDirective {}

@Directive({
  selector: "button[soneSidebarGroupAction]",
  host: {
    "data-slot": "sidebar-group-action",
    "data-sidebar": "group-action",
  },
})
export class SoneSidebarGroupActionDirective {}

@Directive({
  selector: "[soneSidebarGroupContent]",
  host: {
    "data-slot": "sidebar-group-content",
    "data-sidebar": "group-content",
  },
})
export class SoneSidebarGroupContentDirective {}

export type SoneSidebarMenuOrientation = "vertical" | "horizontal";

@Directive({
  selector: "ul[soneSidebarMenu]",
  host: {
    "data-slot": "sidebar-menu",
    "data-sidebar": "menu",
    "[attr.data-orientation]":
      "orientation() === 'horizontal' ? 'horizontal' : null",
  },
})
export class SoneSidebarMenuDirective {
  /** `horizontal` lays the rows out as a wrapping row of content-width buttons (a narrow-screen nav). */
  readonly orientation = input<SoneSidebarMenuOrientation>("vertical");
}

@Directive({
  selector: "li[soneSidebarMenuItem]",
  host: { "data-slot": "sidebar-menu-item", "data-sidebar": "menu-item" },
})
export class SoneSidebarMenuItemDirective {}

@Directive({ selector: "[soneSidebarMenuTooltip]" })
export class SoneSidebarMenuTooltipDirective extends SoneTooltipDirective {
  private readonly owner = inject(SoneSidebarComponent, { optional: true });

  /* eslint-disable @angular-eslint/no-input-rename */
  override readonly side = input<TooltipSide | null>("right", {
    alias: "soneTooltipSide",
  });
  /* eslint-enable @angular-eslint/no-input-rename */

  protected override schedule(): void {
    if (!this.owner?.iconCollapsed()) {
      this.hide();
      return;
    }
    super.schedule();
  }
}

export type SoneSidebarMenuButtonSize = "default" | "sm" | "lg";
export type SoneSidebarMenuButtonVariant = "default" | "outline";

@Directive({
  selector: "button[soneSidebarMenuButton], a[soneSidebarMenuButton]",
  hostDirectives: [
    {
      directive: SoneSidebarMenuTooltipDirective,
      inputs: ["soneTooltip: tooltip"],
    },
  ],
  host: {
    "data-slot": "sidebar-menu-button",
    "data-sidebar": "menu-button",
    "[attr.data-size]": "size()",
    "[attr.data-variant]": "variant()",
    "[attr.data-active]": "isActive() ? 'true' : null",
  },
})
export class SoneSidebarMenuButtonDirective {
  readonly size = input<SoneSidebarMenuButtonSize>("default");
  readonly variant = input<SoneSidebarMenuButtonVariant>("default");
  readonly isActive = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "button[soneSidebarMenuAction]",
  host: {
    "data-slot": "sidebar-menu-action",
    "data-sidebar": "menu-action",
    "[attr.data-show-on-hover]": "showOnHover() ? '' : null",
  },
})
export class SoneSidebarMenuActionDirective {
  readonly showOnHover = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "[soneSidebarMenuBadge], sone-sidebar-menu-badge",
  host: { "data-slot": "sidebar-menu-badge", "data-sidebar": "menu-badge" },
})
export class SoneSidebarMenuBadgeDirective {}

@Directive({
  selector: "[soneSidebarMenuSkeleton]",
  host: {
    "data-slot": "sidebar-menu-skeleton",
    "data-sidebar": "menu-skeleton",
    "aria-hidden": "true",
    "[attr.data-show-icon]": "showIcon() ? '' : null",
    "[style.--skeleton-width]": "width",
  },
})
export class SoneSidebarMenuSkeletonDirective {
  readonly showIcon = input(false, { transform: booleanAttribute });
  protected readonly width = `${Math.floor(Math.random() * 40) + 50}%`;
}

@Directive({
  selector: "ul[soneSidebarMenuSub]",
  host: { "data-slot": "sidebar-menu-sub", "data-sidebar": "menu-sub" },
})
export class SoneSidebarMenuSubDirective {}

@Directive({
  selector: "li[soneSidebarMenuSubItem]",
  host: {
    "data-slot": "sidebar-menu-sub-item",
    "data-sidebar": "menu-sub-item",
  },
})
export class SoneSidebarMenuSubItemDirective {}

export type SoneSidebarMenuSubButtonSize = "sm" | "md";

@Directive({
  selector: "a[soneSidebarMenuSubButton], button[soneSidebarMenuSubButton]",
  host: {
    "data-slot": "sidebar-menu-sub-button",
    "data-sidebar": "menu-sub-button",
    "[attr.data-size]": "size()",
    "[attr.data-active]": "isActive() ? 'true' : null",
  },
})
export class SoneSidebarMenuSubButtonDirective {
  readonly size = input<SoneSidebarMenuSubButtonSize>("md");
  readonly isActive = input(false, { transform: booleanAttribute });
}

@Directive({
  selector: "button[soneSidebarTrigger]",
  host: {
    "data-sidebar": "trigger",
    "[attr.aria-expanded]": "sidebar.open()",
    "(click)": "sidebar.toggleSidebar()",
  },
})
export class SoneSidebarTriggerDirective {
  protected readonly sidebar = inject(SoneSidebarService);
}

const RAIL_KEY_STEP_PX = 16;
const RAIL_KEY_STEP_SHIFT_MULTIPLIER = 4;
const RAIL_DRAG_THRESHOLD_PX = 3;

// The rail is both shadcn's click-to-toggle strip and IndexOne's resize handle,
// told apart by whether the pointer moved: a click with no drag toggles, a
// drag resizes and swallows the click that ends it.
@Directive({
  selector: "[soneSidebarRail]",
  host: {
    "data-slot": "sidebar-rail",
    "data-sidebar": "rail",
    "[attr.role]": "expanded() ? 'separator' : 'button'",
    "[attr.tabindex]": "expanded() ? 0 : -1",
    "[attr.aria-orientation]": "expanded() ? 'vertical' : null",
    "[attr.aria-valuenow]": "expanded() ? sidebar.width() : null",
    "[attr.aria-valuemin]": "expanded() ? sidebar.minWidth : null",
    "[attr.aria-valuemax]": "expanded() ? sidebar.maxWidth : null",
    "[attr.aria-label]": "expanded() ? resizeLabel() : toggleLabel()",
    "[attr.title]": "expanded() ? expandedHint() : collapsedHint()",
    "(pointerdown)": "onPointerDown($event)",
    "(pointermove)": "onPointerMove($event)",
    "(pointerup)": "onPointerEnd($event)",
    "(pointercancel)": "onPointerEnd($event)",
    "(lostpointercapture)": "onPointerEnd($event)",
    "(click)": "onClick($event)",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneSidebarRailDirective {
  protected readonly sidebar = inject(SoneSidebarService);

  readonly resizeLabel = input($localize`Resize sidebar`);
  readonly toggleLabel = input($localize`Toggle sidebar`);
  readonly expandedHint = input(
    $localize`Click to collapse · drag to resize · ⌥-click to reset width`,
  );
  readonly collapsedHint = input($localize`Click to expand`);

  protected readonly expanded = this.sidebar.open;

  private press: {
    pointerId: number;
    startX: number;
    startWidth: number;
    dragging: boolean;
  } | null = null;
  private swallowClick = false;

  protected onPointerDown(event: PointerEvent): void {
    this.swallowClick = false;
    if (!this.expanded() || event.button !== 0) return;
    event.preventDefault();
    (event.currentTarget as Element).setPointerCapture?.(event.pointerId);
    this.press = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: this.sidebar.width(),
      dragging: false,
    };
  }

  protected onPointerMove(event: PointerEvent): void {
    const press = this.press;
    if (!press || press.pointerId !== event.pointerId) return;
    const dx = event.clientX - press.startX;
    if (!press.dragging) {
      if (Math.abs(dx) < RAIL_DRAG_THRESHOLD_PX) return;
      press.dragging = true;
      this.sidebar.setResizing(true);
    }
    this.sidebar.setWidth(press.startWidth + dx);
  }

  protected onPointerEnd(event: PointerEvent): void {
    const press = this.press;
    if (!press || press.pointerId !== event.pointerId) return;
    this.press = null;
    if (press.dragging) {
      this.swallowClick = true;
      this.sidebar.setResizing(false);
    }
  }

  protected onClick(event: MouseEvent): void {
    if (this.swallowClick) {
      this.swallowClick = false;
      return;
    }
    if (event.altKey && this.expanded()) {
      this.sidebar.resetWidth();
      return;
    }
    this.sidebar.toggleSidebar();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.expanded()) return;
    const step =
      RAIL_KEY_STEP_PX * (event.shiftKey ? RAIL_KEY_STEP_SHIFT_MULTIPLIER : 1);
    const width = this.sidebar.width();
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = width - step;
        break;
      case "ArrowRight":
        next = width + step;
        break;
      case "Home":
        next = this.sidebar.minWidth;
        break;
      case "End":
        next = this.sidebar.maxWidth;
        break;
      case "Enter":
        event.preventDefault();
        this.sidebar.resetWidth();
        return;
      default:
        return;
    }
    event.preventDefault();
    this.sidebar.setWidth(next);
  }
}

@Directive({
  selector: "[soneSidebarInset]",
  host: { "data-slot": "sidebar-inset" },
})
export class SoneSidebarInsetDirective {}

export const SONE_SIDEBAR_PARTS = [
  SoneSidebarComponent,
  SoneSidebarWrapperDirective,
  SoneSidebarHeaderDirective,
  SoneSidebarContentDirective,
  SoneSidebarFooterDirective,
  SoneSidebarSeparatorDirective,
  SoneSidebarGroupDirective,
  SoneSidebarGroupLabelDirective,
  SoneSidebarGroupActionDirective,
  SoneSidebarGroupContentDirective,
  SoneSidebarMenuDirective,
  SoneSidebarMenuItemDirective,
  SoneSidebarMenuButtonDirective,
  SoneSidebarMenuActionDirective,
  SoneSidebarMenuBadgeDirective,
  SoneSidebarMenuSkeletonDirective,
  SoneSidebarMenuSubDirective,
  SoneSidebarMenuSubItemDirective,
  SoneSidebarMenuSubButtonDirective,
  SoneSidebarTriggerDirective,
  SoneSidebarRailDirective,
  SoneSidebarInsetDirective,
] as const;
