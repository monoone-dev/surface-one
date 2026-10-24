import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SonePageSiteHeader } from "../src/components/page-site-header";

describe("SonePageSiteHeader", () => {
  it("renders the same header as Angular", () => {
    const out = renderToString(
      <SonePageSiteHeader
        title="Acme"
        href="/home"
        sticky
        nav={<nav aria-label="Main">A</nav>}
        menu={<nav>Menu</nav>}
      />,
    );
    expect(out).toContain(
      '<sone-page-site-header data-slot="page-site-header" data-sticky=""><header class="page-site-header" data-slot="page-site-header-bar"><div class="page-site-header-logo" data-slot="page-site-header-logo"><a class="page-site-header-title" href="/home">Acme</a></div><div class="page-site-header-nav" data-slot="page-site-header-nav"><nav aria-label="Main">A</nav></div>',
    );
    expect(out).toContain(
      'aria-haspopup="dialog" aria-expanded="false" aria-label="Menu"',
    );
    expect(renderToString(<SonePageSiteHeader title="Plain" />)).not.toContain(
      "page-site-header-toggle",
    );
  });

  it("opens the menu sheet and closes it on a link", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <SonePageSiteHeader
        title="Acme"
        onOpenChange={onOpenChange}
        menu={
          <a id="menu-link" href="#a">
            A
          </a>
        }
      />,
    );
    fireEvent.click(container.querySelector(".page-site-header-toggle")!);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const dialog = document.querySelector('[role="dialog"]')!;
    expect(dialog.getAttribute("aria-label")).toBe("Menu");
    fireEvent.click(document.getElementById("menu-link")!);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
