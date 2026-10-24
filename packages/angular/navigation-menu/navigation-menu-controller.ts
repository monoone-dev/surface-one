// The site navigation menu, with no framework in it: the Angular `soneNavigationMenu`,
// the Vue and React `SoneNavigationMenu` (through @surface-one/core) share it. It is
// navigation (links in a `nav`, disclosure triggers), not an ARIA menu.

export interface NavigationMenuOptions {
  /** The open item's value, or `null`. */
  readonly value: () => string | null;
  readonly setValue: (value: string | null) => void;
  /** ms from resting the pointer on a trigger to opening (when no item is open yet). */
  readonly openDelay: () => number;
  /** ms from leaving an item (its trigger and content) to closing. */
  readonly closeDelay: () => number;
  /** Runs `fn` once the framework has rendered the latest value (an opened content). */
  readonly afterRender: (fn: () => void) => void;
}

/** The fields of a key event the navigation menu reads. */
export interface NavigationMenuKeyEvent {
  readonly key: string;
  readonly target: EventTarget | null;
  preventDefault(): void;
  stopPropagation(): void;
}

export interface NavigationMenu {
  /** A trigger's click: toggles its content (a click right after a hover opened it keeps it). */
  triggerClick(item: string): void;
  /** The pointer entered an item (its trigger or open content). */
  itemEnter(item: string, pointerType: string): void;
  /** The pointer left an item. */
  itemLeave(pointerType: string): void;
  /** ArrowDown on a trigger opens its content on the first link. */
  triggerKeyDown(
    item: string,
    event: NavigationMenuKeyEvent,
    content: () => HTMLElement | null,
  ): void;
  /** Escape in a content closes it and focuses its trigger. */
  contentKeyDown(
    event: NavigationMenuKeyEvent,
    trigger: HTMLElement | null,
  ): void;
  /** ArrowLeft / ArrowRight / Home / End move between the top-level triggers and links. */
  listKeyDown(list: HTMLElement, event: NavigationMenuKeyEvent): void;
  /** Focus left the whole menu: close. */
  focusOut(root: HTMLElement, next: EventTarget | null): void;
  /** A pointer went down somewhere: outside the menu, it closes. */
  pointerDown(root: HTMLElement, target: EventTarget | null): void;
  /** A link inside a content was followed: close. */
  linkClick(): void;
  /** Drop pending timers (on destroy). */
  cancel(): void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The trigger or link of each top-level item of a list (not those inside a content). */
export function navigationMenuTopLevel(list: HTMLElement): HTMLElement[] {
  return Array.from(
    list.querySelectorAll<HTMLElement>(
      '[data-slot="navigation-menu-trigger"], [data-slot="navigation-menu-link"]',
    ),
  ).filter(
    (el) =>
      !el.closest('[data-slot="navigation-menu-content"]') &&
      el.closest('[data-slot="navigation-menu-list"]') === list &&
      !(el instanceof HTMLButtonElement && el.disabled),
  );
}

/**
 * A site navigation menu (Radix / shadcn/ui NavigationMenu): one content open at a
 * time; a trigger opens its content on click, on Enter / Space (it is a button) and
 * on ArrowDown, and on hover after `openDelay` (at once while another is open); the
 * content closes `closeDelay` after the pointer leaves its item, on Escape (focus back
 * on the trigger), when focus leaves the menu and when one of its links is followed.
 */
export function createNavigationMenu(
  options: NavigationMenuOptions,
): NavigationMenu {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let hoverOpenedAt = 0;
  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };
  const later = (delay: number, fn: () => void): void => {
    cancel();
    if (delay <= 0) fn();
    else
      timer = setTimeout(() => {
        timer = null;
        fn();
      }, delay);
  };
  const isMouse = (type: string): boolean => type === "mouse" || type === "pen";

  return {
    triggerClick(item) {
      cancel();
      if (options.value() === item) {
        // The hover that opened it is still settling: the click confirms, not toggles.
        if (Date.now() - hoverOpenedAt < 300) return;
        options.setValue(null);
      } else {
        options.setValue(item);
      }
    },
    itemEnter(item, pointerType) {
      if (!isMouse(pointerType)) return;
      const current = options.value();
      if (current === item) {
        cancel();
        return;
      }
      const open = (): void => {
        hoverOpenedAt = Date.now();
        options.setValue(item);
      };
      if (current !== null) {
        cancel();
        open();
      } else later(options.openDelay(), open);
    },
    itemLeave(pointerType) {
      if (!isMouse(pointerType)) return;
      if (options.value() === null) {
        cancel();
        return;
      }
      later(options.closeDelay(), () => options.setValue(null));
    },
    triggerKeyDown(item, event, content) {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      cancel();
      options.setValue(item);
      options.afterRender(() =>
        content()?.querySelector<HTMLElement>(FOCUSABLE)?.focus(),
      );
    },
    contentKeyDown(event, trigger) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      cancel();
      options.setValue(null);
      trigger?.focus();
    },
    listKeyDown(list, event) {
      const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
      if (!keys.includes(event.key)) return;
      const items = navigationMenuTopLevel(list);
      const current = items.indexOf(event.target as HTMLElement);
      if (current < 0) return;
      event.preventDefault();
      const last = items.length - 1;
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? last
            : event.key === "ArrowRight"
              ? current === last
                ? 0
                : current + 1
              : current === 0
                ? last
                : current - 1;
      items[next]?.focus();
    },
    focusOut(root, next) {
      if (next instanceof Node && root.contains(next)) return;
      // `null`: a click on nothing focusable, or the window lost focus — the pointer owns those.
      if (next === null) return;
      cancel();
      if (options.value() !== null) options.setValue(null);
    },
    pointerDown(root, target) {
      if (target instanceof Node && root.contains(target)) return;
      cancel();
      if (options.value() !== null) options.setValue(null);
    },
    linkClick() {
      cancel();
      if (options.value() !== null) options.setValue(null);
    },
    cancel,
  };
}
