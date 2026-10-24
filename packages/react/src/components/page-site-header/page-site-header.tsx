"use client";

import {
  createElement,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { pageSiteHeaderClosesMenu } from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneSheet } from "../sheet/sheet";

export interface SonePageSiteHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** A text logo, a link to `href`. */
  readonly title?: string | null;
  readonly href?: string;
  /** The logo (the Vue `#logo` slot). */
  readonly logo?: ReactNode;
  /** The site navigation, shown once the header is wide enough. */
  readonly nav?: ReactNode;
  /** Controls at the end: a theme switch, a sign-in button. */
  readonly actions?: ReactNode;
  /** The narrow-screen menu, shown in a sheet by the menu button. */
  readonly menu?: ReactNode;
  /** The menu sheet (controlled), with `onOpenChange`; or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Pins the header to the top of the scrolling page. */
  readonly sticky?: boolean;
  /** Names the menu button and the sheet (default: the "Menu" message). */
  readonly menuLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-page-site-header>` — the header of a site (Nuxt UI Header): a `title` link or
 * your `logo`, the `nav` (shown once the header is wide enough) and `actions`. Below a
 * medium width a menu button opens the `menu` in a sheet (focus trapped, Escape, the
 * scrim or a link close it); `open` / `defaultOpen` / `onOpenChange` hold that sheet.
 * It renders a `<header>`; `sticky` pins it to the top.
 */
export function SonePageSiteHeader({
  title = null,
  href = "/",
  logo,
  nav,
  actions,
  menu,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  sticky = false,
  menuLabel = null,
  ...rest
}: SonePageSiteHeaderProps): ReactElement {
  const messages = useSoneMessages();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const label = menuLabel ?? messages.pageSiteHeaderMenu;
  const hasMenu = menu !== undefined && menu !== null && menu !== false;
  return createElement(
    "sone-page-site-header",
    {
      "data-slot": "page-site-header",
      "data-sticky": sticky ? "" : undefined,
      ...rest,
    },
    <header className="page-site-header" data-slot="page-site-header-bar">
      <div className="page-site-header-logo" data-slot="page-site-header-logo">
        {title ? (
          <a className="page-site-header-title" href={href}>
            {title}
          </a>
        ) : null}
        {logo}
      </div>
      <div className="page-site-header-nav" data-slot="page-site-header-nav">
        {nav}
      </div>
      <div
        className="page-site-header-actions"
        data-slot="page-site-header-actions"
      >
        {actions}
        {hasMenu ? (
          <SoneButton
            variant="ghost"
            size="icon"
            type="button"
            className="page-site-header-toggle"
            data-slot="page-site-header-toggle"
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            <SoneIcon icon="menu" />
          </SoneButton>
        ) : null}
      </div>
    </header>,
    hasMenu && open ? (
      <SoneSheet
        side="right"
        ariaLabel={label}
        onDismiss={() => setOpen(false)}
      >
        <div
          className="page-site-header-menu"
          data-slot="page-site-header-menu"
          onClick={(event: MouseEvent) => {
            if (pageSiteHeaderClosesMenu(event.target)) setOpen(false);
          }}
        >
          {menu}
        </div>
      </SoneSheet>
    ) : null,
  );
}
