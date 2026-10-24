import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_PAGE_SITE_HEADER_PARTS } from "@surface-one/angular/page-site-header";

import { $, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_PAGE_SITE_HEADER_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-page-site-header
      id="full"
      title="Acme"
      href="/home"
      sticky
      [(open)]="open"
    >
      <nav sonePageSiteHeaderNav aria-label="Main"><a href="/a">A</a></nav>
      <button sonePageSiteHeaderActions type="button">Sign in</button>
      <nav sonePageSiteHeaderMenu aria-label="Main menu">
        <a id="menu-link" href="#a">A</a>
        <span id="menu-text">Text</span>
      </nav>
    </sone-page-site-header>
    <sone-page-site-header id="plain" title="Plain" />
  `,
})
class HeaderHost {
  readonly open = signal(false);
}

describe("sone-page-site-header", () => {
  it("is a header with a title link, the nav and actions", async () => {
    await render(HeaderHost);
    const host = $("#full");
    expect(host.hasAttribute("data-sticky")).toBe(true);
    expect(host.hasAttribute("title")).toBe(false);
    expect($("header.page-site-header", host)).not.toBeNull();
    const title = $<HTMLAnchorElement>(".page-site-header-title", host);
    expect(title.textContent).toBe("Acme");
    expect(title.getAttribute("href")).toBe("/home");
    expect(
      $(".page-site-header-nav nav", host).getAttribute("aria-label"),
    ).toBe("Main");
    expect($(".page-site-header-actions button", host).textContent).toBe(
      "Sign in",
    );
    // No menu content, no menu button.
    expect($(".page-site-header-toggle", $("#plain"))).toBeNull();
  });

  it("opens the menu in a sheet from its button and closes it on a link or Escape", async () => {
    const fixture = await render(HeaderHost);
    const toggle = $<HTMLButtonElement>(".page-site-header-toggle");
    expect(toggle.getAttribute("aria-label")).toBe("Menu");
    expect(toggle.getAttribute("aria-haspopup")).toBe("dialog");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect($('[role="dialog"]')).toBeNull();

    toggle.click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const dialog = $('[role="dialog"]');
    expect(dialog.getAttribute("aria-label")).toBe("Menu");
    expect($("#menu-link", dialog)).not.toBeNull();

    $("#menu-text").click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(true);
    $("#menu-link").click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect($('[role="dialog"]')).toBeNull();

    toggle.click();
    await settle(fixture);
    key($('[role="dialog"]'), "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
