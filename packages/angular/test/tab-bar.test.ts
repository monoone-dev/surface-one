import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneTabBarComponent,
  type TabBarItem,
} from "@surface-one/angular/tab-bar";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneTabBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-tab-bar
      [items]="items()"
      [(value)]="value"
      [labels]="labels()"
      [floating]="floating()"
    />
  `,
})
class TabBarHost {
  readonly items = signal<TabBarItem[]>([
    { value: "home", label: "Home", icon: "dashboards" },
    { value: "search", label: "Search", icon: "search" },
    { value: "inbox", label: "Inbox", disabled: true },
  ]);
  readonly value = signal<string | null>("home");
  readonly labels = signal<"active" | "always">("active");
  readonly floating = signal(true);
}

describe("sone-tab-bar", () => {
  it("is a named nav of buttons, the active one current with its label shown", async () => {
    const fixture = await render(TabBarHost);
    const host = $("sone-tab-bar");
    expect(host.hasAttribute("data-floating")).toBe(true);
    expect($("nav.tab-bar").getAttribute("aria-label")).toBe("Tab bar");
    const tabs = $$<HTMLButtonElement>(".tab-bar-item");
    expect(tabs.map((t) => t.tagName)).toEqual(["BUTTON", "BUTTON", "BUTTON"]);
    expect(tabs[0]!.getAttribute("aria-current")).toBe("true");
    expect(tabs[1]!.hasAttribute("aria-current")).toBe(false);
    expect(tabs[0]!.querySelector("sone-icon")).not.toBeNull();
    const labels = $$(".tab-bar-label");
    expect(labels.map((l) => l.classList.contains("sr-only"))).toEqual([
      false,
      true,
      true,
    ]);
    expect(tabs[2]!.disabled).toBe(true);

    tabs[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe("search");
    expect(tabs[1]!.getAttribute("aria-current")).toBe("true");

    fixture.componentInstance.labels.set("always");
    fixture.componentInstance.floating.set(false);
    await settle(fixture);
    expect($$(".tab-bar-label.sr-only")).toHaveLength(0);
    expect(host.hasAttribute("data-floating")).toBe(false);
  });

  it("renders link items with aria-current=page", async () => {
    const fixture = await render(TabBarHost);
    fixture.componentInstance.items.set([
      { value: "home", label: "Home", href: "#home" },
      { value: "search", label: "Search", href: "#search" },
    ]);
    await settle(fixture);
    const links = $$<HTMLAnchorElement>("a.tab-bar-item");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "#home",
      "#search",
    ]);
    expect(links[0]!.getAttribute("aria-current")).toBe("page");
    links[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.value()).toBe("search");
    expect(links[1]!.getAttribute("aria-current")).toBe("page");
  });
});
