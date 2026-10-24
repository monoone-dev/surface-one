import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  HostAttributeToken,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  untracked,
} from "@angular/core";
import { soneId } from "@surface-one/angular/core";

import { createNavigationMenu } from "./navigation-menu-controller";

/**
 * `nav[soneNavigationMenu]` — site navigation (shadcn/ui and Radix NavigationMenu,
 * spartan/ui Navigation Menu): a list of links and disclosure triggers, each trigger
 * revealing a content panel of links under it. It is navigation, not an ARIA menu:
 * the triggers are buttons with `aria-expanded` / `aria-controls`, the links are links
 * (`active` sets `aria-current="page"`), and Tab moves through them in order. One
 * content is open at a time — `[(value)]` names it; it opens on click, on ArrowDown
 * (on its first link) and on hover after `openDelay`, and closes `closeDelay` after
 * the pointer leaves, on Escape, on a click outside and when focus leaves the menu.
 * ArrowLeft / ArrowRight, Home and End move between the top-level items. Name it with
 * `aria-label`. The contents stay in the page while closed (`hidden`), so the links
 * are prerendered for search engines.
 */
@Directive({
  selector: "nav[soneNavigationMenu]",
  exportAs: "soneNavigationMenu",
  host: {
    class: "navigation-menu",
    "data-slot": "navigation-menu",
    "(focusout)": "controller.focusOut(element, $event.relatedTarget)",
  },
})
export class SoneNavigationMenuDirective {
  /** The open item's `value`, or `null` — `[(value)]`. */
  readonly value = model<string | null>(null);
  /** ms from resting the pointer on a trigger to opening (when nothing is open yet). */
  readonly openDelay = input(200);
  /** ms from leaving an item to closing. */
  readonly closeDelay = input(150);

  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly doc = inject(DOCUMENT);
  /** @internal The open / close timing and keys. */
  readonly controller = createNavigationMenu({
    value: () => this.value(),
    setValue: (v) => this.value.set(v),
    openDelay: () => this.openDelay(),
    closeDelay: () => this.closeDelay(),
    afterRender: (fn) => afterNextRender(fn, { injector: this.injector }),
  });

  constructor() {
    const onPointerDown = (event: PointerEvent): void =>
      this.controller.pointerDown(this.element, event.target);
    effect((onCleanup) => {
      if (this.value() === null) return;
      untracked(() => {
        this.doc.addEventListener("pointerdown", onPointerDown, true);
        onCleanup(() =>
          this.doc.removeEventListener("pointerdown", onPointerDown, true),
        );
      });
    });
    inject(DestroyRef).onDestroy(() => this.controller.cancel());
  }
}

/** `[soneNavigationMenuList]` — the `<ul>` of top-level items; arrow keys move along it. */
@Directive({
  selector: "[soneNavigationMenuList]",
  host: {
    class: "navigation-menu-list",
    "data-slot": "navigation-menu-list",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneNavigationMenuListDirective {
  private readonly menu = inject(SoneNavigationMenuDirective);
  private readonly element =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected onKeydown(event: KeyboardEvent): void {
    this.menu.controller.listKeyDown(this.element, event);
  }
}

/**
 * `[soneNavigationMenuItem]` — one `<li>`: a link, or a trigger and its content. The
 * pointer resting anywhere on it (trigger or open content) keeps it open.
 */
@Directive({
  selector: "[soneNavigationMenuItem]",
  host: {
    class: "navigation-menu-item",
    "data-slot": "navigation-menu-item",
    "(pointerenter)": "onEnter($event)",
    "(pointerleave)": "menu.controller.itemLeave($event.pointerType)",
  },
})
export class SoneNavigationMenuItemDirective {
  /** What `[(value)]` of the menu says when this item is open (generated when left out). */
  readonly value = input<string | null>(null);
  protected readonly menu = inject(SoneNavigationMenuDirective);
  private readonly id = soneId("sone-navigation-menu");
  /** @internal */
  readonly key = computed(() => this.value() ?? this.id);
  /** @internal */
  readonly contentId = `${this.id}-content`;
  /** @internal */
  readonly open = computed(() => this.menu.value() === this.key());
  /** @internal Set by the trigger. */
  trigger: HTMLElement | null = null;
  /** @internal Set by the content. */
  content: HTMLElement | null = null;

  protected onEnter(event: PointerEvent): void {
    // The content opens from its trigger; entering an item with no trigger only keeps.
    if (!this.trigger) return;
    this.menu.controller.itemEnter(this.key(), event.pointerType);
  }
}

/**
 * `[soneNavigationMenuTrigger]` — the button that reveals its item's content
 * (`aria-expanded`, `aria-controls`), with a chevron drawn by CSS.
 */
@Directive({
  selector: "[soneNavigationMenuTrigger]",
  host: {
    class: "navigation-menu-trigger",
    "data-slot": "navigation-menu-trigger",
    "[attr.type]": "type",
    "[attr.aria-expanded]": "item.open() ? 'true' : 'false'",
    "[attr.aria-controls]": "item.contentId",
    "[attr.data-state]": "item.open() ? 'open' : 'closed'",
    "(click)": "menu.controller.triggerClick(item.key())",
    "(keydown)": "onKeydown($event)",
  },
})
export class SoneNavigationMenuTriggerDirective {
  protected readonly item = inject(SoneNavigationMenuItemDirective);
  protected readonly menu = inject(SoneNavigationMenuDirective);
  protected readonly type =
    inject(new HostAttributeToken("type"), { optional: true }) ?? "button";

  constructor() {
    this.item.trigger =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.menu.controller.triggerKeyDown(
      this.item.key(),
      event,
      () => this.item.content,
    );
  }
}

/**
 * `[soneNavigationMenuContent]` — the panel of links its trigger reveals, under the
 * item. `hidden` while closed (still in the page); Escape closes it and focuses the
 * trigger, and following one of its links closes it.
 */
@Directive({
  selector: "[soneNavigationMenuContent]",
  host: {
    class: "navigation-menu-content",
    "data-slot": "navigation-menu-content",
    "[attr.id]": "item.contentId",
    "[attr.hidden]": "item.open() ? null : ''",
    "[attr.data-state]": "item.open() ? 'open' : 'closed'",
    "(keydown)": "menu.controller.contentKeyDown($event, item.trigger)",
    "(click)": "onClick($event)",
  },
})
export class SoneNavigationMenuContentDirective {
  protected readonly item = inject(SoneNavigationMenuItemDirective);
  protected readonly menu = inject(SoneNavigationMenuDirective);

  constructor() {
    this.item.content =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  }

  protected onClick(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Element && target.closest("a[href]"))
      this.menu.controller.linkClick();
  }
}

/**
 * `[soneNavigationMenuLink]` — a link, at the top level or in a content. `active`
 * marks the current page (`aria-current="page"`, `data-active`).
 */
@Directive({
  selector: "[soneNavigationMenuLink]",
  host: {
    class: "navigation-menu-link",
    "data-slot": "navigation-menu-link",
    "[attr.aria-current]": "active() ? 'page' : null",
    "[attr.data-active]": "active() ? '' : null",
  },
})
export class SoneNavigationMenuLinkDirective {
  readonly active = input(false, { transform: booleanAttribute });
}

export const SONE_NAVIGATION_MENU_PARTS = [
  SoneNavigationMenuDirective,
  SoneNavigationMenuListDirective,
  SoneNavigationMenuItemDirective,
  SoneNavigationMenuTriggerDirective,
  SoneNavigationMenuContentDirective,
  SoneNavigationMenuLinkDirective,
] as const;
