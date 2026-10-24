import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_NAVIGATION_MENU_PARTS } from "@surface-one/angular/navigation-menu";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_NAVIGATION_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav soneNavigationMenu aria-label="Main" [(value)]="value">
      <ul soneNavigationMenuList>
        <li soneNavigationMenuItem value="start">
          <button id="start" soneNavigationMenuTrigger>Getting started</button>
          <div soneNavigationMenuContent>
            <a soneNavigationMenuLink href="#intro">Introduction</a>
            <a soneNavigationMenuLink href="#install">Installation</a>
          </div>
        </li>
        <li soneNavigationMenuItem>
          <a id="docs" soneNavigationMenuLink href="#docs" active>Docs</a>
        </li>
      </ul>
    </nav>
    <button id="outside" type="button">Outside</button>
  `,
})
class NavHost {
  readonly value = signal<string | null>(null);
}

describe("soneNavigationMenu", () => {
  it("is navigation with disclosure triggers and links whose contents stay in the page", async () => {
    const fixture = await render(NavHost);
    const nav = $("nav");
    expect(nav.getAttribute("data-slot")).toBe("navigation-menu");
    expect(nav.hasAttribute("role")).toBe(false);
    const trigger = $<HTMLButtonElement>("#start");
    expect(trigger.type).toBe("button");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const content = $('[data-slot="navigation-menu-content"]');
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(content.hidden).toBe(true);
    expect($$("a[href]", content)).toHaveLength(2);
    expect($("#docs").getAttribute("aria-current")).toBe("page");

    trigger.click();
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe("start");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(content.hidden).toBe(false);
  });

  it("opens on ArrowDown on the first link and closes on Escape back on the trigger", async () => {
    const fixture = await render(NavHost);
    const trigger = $("#start");
    trigger.focus();
    key(trigger, "ArrowDown");
    await settle(fixture);
    await settle(fixture);
    expect(document.activeElement?.textContent).toBe("Introduction");
    key(document.activeElement!, "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    key(trigger, "ArrowRight");
    expect(document.activeElement).toBe($("#docs"));
  });

  it("closes on a click outside and when a link is followed", async () => {
    const fixture = await render(NavHost);
    fixture.componentInstance.value.set("start");
    await settle(fixture);
    $("#outside").dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBeNull();
    fixture.componentInstance.value.set("start");
    await settle(fixture);
    $<HTMLAnchorElement>('a[href="#intro"]').click();
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBeNull();
  });
});
