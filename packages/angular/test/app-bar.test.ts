import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_APP_BAR_PARTS } from "@surface-one/angular/app-bar";

import { $, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_APP_BAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-app-bar
      title="Inbox"
      [subtitle]="subtitle()"
      [level]="level()"
      [showBack]="showBack()"
      [backHref]="href()"
      sticky
      (back)="backs.set(backs() + 1)"
    >
      <button soneAppBarTrailing type="button">Search</button>
    </sone-app-bar>
  `,
})
class AppBarHost {
  readonly subtitle = signal<string | null>("12 unread");
  readonly level = signal<unknown>(1);
  readonly showBack = signal(true);
  readonly href = signal<string | null>(null);
  readonly backs = signal(0);
}

describe("sone-app-bar", () => {
  it("is a header with the title as a heading, a subtitle and trailing actions", async () => {
    const fixture = await render(AppBarHost);
    const host = $("sone-app-bar");
    expect(host.getAttribute("data-sticky")).toBe("");
    expect(host.hasAttribute("title")).toBe(false);
    expect($("sone-app-bar > header.app-bar")).not.toBeNull();
    expect($("h1.app-bar-title").textContent).toBe("Inbox");
    expect($(".app-bar-subtitle").textContent).toBe("12 unread");
    expect(
      $('.app-bar-trailing [data-slot="app-bar-trailing"]').textContent,
    ).toBe("Search");

    fixture.componentInstance.level.set("3");
    fixture.componentInstance.subtitle.set(null);
    await settle(fixture);
    expect($("h3.app-bar-title")).not.toBeNull();
    expect($(".app-bar-subtitle")).toBeNull();

    fixture.componentInstance.level.set(9);
    await settle(fixture);
    expect($("h1.app-bar-title")).not.toBeNull();
  });

  it("draws a named back button that emits back, or a back link", async () => {
    const fixture = await render(AppBarHost);
    const back = $<HTMLButtonElement>("button.app-bar-back");
    expect(back.getAttribute("aria-label")).toBe("Back");
    expect(back.type).toBe("button");
    back.click();
    expect(fixture.componentInstance.backs()).toBe(1);

    fixture.componentInstance.href.set("/inbox");
    await settle(fixture);
    expect($("button.app-bar-back")).toBeNull();
    expect($<HTMLAnchorElement>("a.app-bar-back").getAttribute("href")).toBe(
      "/inbox",
    );

    fixture.componentInstance.href.set(null);
    fixture.componentInstance.showBack.set(false);
    await settle(fixture);
    expect($(".app-bar-back")).toBeNull();
  });
});
