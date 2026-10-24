// The WAI-ARIA menubar, with no framework in it: the Angular `soneMenubar`, the Vue and
// React `SoneMenubar` (through @surface-one/core) share it. Each top-level trigger is a
// menu trigger of the menu family; this moves between them.

/** One top-level menu of a menubar, as its trigger sees it. */
export interface MenubarMenu {
  /** The trigger (`role="menuitem"`). */
  readonly element: HTMLElement;
  isOpen(): boolean;
  /** Opens its menu, focusing the first / last item (or the menu for `null`). */
  open(focus: "first" | "last" | null): void;
  /** Closes its menu without moving focus. */
  close(): void;
}

/** The fields of a key event the menubar reads. */
export interface MenubarKeyEvent {
  readonly key: string;
  preventDefault(): void;
}

export interface Menubar {
  /** Adds a menu; returns the function that removes it. */
  register(menu: MenubarMenu): () => void;
  /** Puts the one Tab stop on the active trigger (the first, until one is focused). */
  sync(): void;
  /** A trigger got focus: it becomes the Tab stop. */
  focused(menu: MenubarMenu): void;
  /** A key on a trigger: ArrowLeft / ArrowRight / Home / End move along the bar. `true` when handled. */
  triggerKeyDown(menu: MenubarMenu, event: MenubarKeyEvent): boolean;
  /**
   * A key in an open menu: ArrowLeft / ArrowRight close it and open the neighbour's
   * (unless the focused item opens or sits in a submenu). `true` when handled.
   */
  panelKeyDown(
    menu: MenubarMenu,
    event: MenubarKeyEvent,
    focused: Element | null,
  ): boolean;
  /** The pointer entered a trigger: while another menu is open, this one takes over. */
  pointerEnter(menu: MenubarMenu): void;
}

const isDisabled = (el: HTMLElement): boolean =>
  el.getAttribute("aria-disabled") === "true" ||
  (el instanceof HTMLButtonElement && el.disabled);

/**
 * A menubar (WAI-ARIA menubar pattern, spartan/ui Menubar): one Tab stop on the bar
 * (roving tabindex), ArrowLeft / ArrowRight (wrapping), Home and End between the
 * triggers, ArrowLeft / ArrowRight inside an open menu move to the neighbouring menu
 * and open it, and once one menu is open hovering another trigger switches to it.
 */
export function createMenubar(): Menubar {
  const menus: MenubarMenu[] = [];
  let active: HTMLElement | null = null;

  const ordered = (): MenubarMenu[] =>
    menus
      .filter((m) => m.element.isConnected && !isDisabled(m.element))
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );

  const sync = (): void => {
    const list = ordered();
    const current = list.find((m) => m.element === active) ?? list[0];
    for (const m of menus)
      m.element.setAttribute("tabindex", m === current ? "0" : "-1");
  };

  const focus = (menu: MenubarMenu): void => {
    active = menu.element;
    sync();
    menu.element.focus();
  };

  const neighbour = (menu: MenubarMenu, step: number): MenubarMenu | null => {
    const list = ordered();
    if (!list.length) return null;
    const i = list.indexOf(menu);
    return list[(Math.max(i, 0) + step + list.length) % list.length] ?? null;
  };

  const move = (menu: MenubarMenu, step: number, openNext: boolean): void => {
    const next = neighbour(menu, step);
    if (!next || next === menu) return;
    if (menu.isOpen()) menu.close();
    focus(next);
    if (openNext) next.open("first");
  };

  return {
    register(menu) {
      menus.push(menu);
      sync();
      return () => {
        const i = menus.indexOf(menu);
        if (i >= 0) menus.splice(i, 1);
        if (active === menu.element) active = null;
        sync();
      };
    },
    sync,
    focused(menu) {
      if (active === menu.element) return;
      active = menu.element;
      sync();
    },
    triggerKeyDown(menu, event) {
      const list = ordered();
      const anyOpen = menus.some((m) => m.isOpen());
      switch (event.key) {
        case "ArrowRight":
        case "ArrowLeft":
          event.preventDefault();
          move(menu, event.key === "ArrowRight" ? 1 : -1, anyOpen);
          return true;
        case "Home":
        case "End": {
          const target = event.key === "Home" ? list[0] : list[list.length - 1];
          if (!target) return false;
          event.preventDefault();
          if (menu.isOpen()) menu.close();
          focus(target);
          return true;
        }
        default:
          return false;
      }
    },
    panelKeyDown(menu, event, focused) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return false;
      const item = focused instanceof Element ? focused : null;
      // A submenu's own keys win: its trigger opens it, its items close it.
      if (
        event.key === "ArrowRight" &&
        item?.getAttribute("aria-haspopup") === "menu"
      )
        return false;
      if (
        event.key === "ArrowLeft" &&
        item?.closest('[data-slot="menu-sub-content"]')
      )
        return false;
      event.preventDefault();
      move(menu, event.key === "ArrowRight" ? 1 : -1, true);
      return true;
    },
    pointerEnter(menu) {
      const open = menus.find((m) => m !== menu && m.isOpen());
      if (!open || menu.isOpen() || isDisabled(menu.element)) return;
      open.close();
      focus(menu);
      menu.open(null);
    },
  };
}
