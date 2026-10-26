import { ChangeDetectionStrategy, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { describe, expect, it } from "vitest";

import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

@Component({
  imports: [
    SONE_AVATAR_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SONE_INPUT_GROUP_PARTS,
    SoneSearchFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span soneBadge variant="info" id="info">Beta</span>
    <span soneBadge variant="count" id="count">12</span>
    <sone-avatar shape="square" id="square"
      ><span soneAvatarFallback>DS</span></sone-avatar
    >
    <sone-avatar id="circle"><span soneAvatarFallback>AP</span></sone-avatar>
    <button soneBtn variant="accent" type="button" id="accent">Send</button>
    <button
      soneBtn
      variant="soft"
      size="icon"
      type="button"
      aria-label="Star"
      aria-pressed="true"
      id="soft"
    >
      *
    </button>
    <div soneInputGroup variant="filled" id="group">
      <input soneInputGroupInput aria-label="Search" />
    </div>
    <div soneInputGroup id="plain">
      <input soneInputGroupInput aria-label="Name" />
    </div>
    <sone-search-field variant="filled" id="search" />
  `,
})
class Host {}

describe("Isles variants", () => {
  it("renders the new variant attributes the shared stylesheets read", async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (s: string) => el.querySelector(s)!;
    expect(q("#info").getAttribute("data-variant")).toBe("info");
    expect(q("#count").getAttribute("data-variant")).toBe("count");
    expect(q("#square").getAttribute("data-shape")).toBe("square");
    expect(q("#circle").hasAttribute("data-shape")).toBe(false);
    expect(q("#accent").getAttribute("data-variant")).toBe("accent");
    expect(q("#soft").getAttribute("data-variant")).toBe("soft");
    expect(q("#soft").getAttribute("aria-pressed")).toBe("true");
    expect(q("#group").getAttribute("data-variant")).toBe("filled");
    expect(q("#plain").hasAttribute("data-variant")).toBe(false);
    expect(
      q('#search [data-slot="input-group"]').getAttribute("data-variant"),
    ).toBe("filled");
    expect(q('#search [role="searchbox"]')).toBeTruthy();
  });
});
