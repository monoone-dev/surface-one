import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import {
  SoneAvatarGroupComponent,
  type AvatarGroupPerson,
} from "@surface-one/angular/avatar-group";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneAvatarGroupComponent, ...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-avatar-group
      id="people"
      ariaLabel="Project members"
      size="sm"
      [people]="people()"
      [max]="max()"
    />
    <sone-avatar-group id="children" ariaLabel="Reviewers" [max]="2">
      <sone-avatar role="img" aria-label="Ada"
        ><span soneAvatarFallback>A</span></sone-avatar
      >
      <sone-avatar role="img" aria-label="Grace"
        ><span soneAvatarFallback>G</span></sone-avatar
      >
      <sone-avatar role="img" aria-label="Alan"
        ><span soneAvatarFallback>T</span></sone-avatar
      >
    </sone-avatar-group>
  `,
})
class GroupHost {
  readonly people = signal<AvatarGroupPerson[]>([
    { name: "Ada Lovelace", src: "/ada.png" },
    { name: "Grace Hopper" },
    { name: "Alan Turing" },
    {},
  ]);
  readonly max = signal(2);
}

describe("sone-avatar-group", () => {
  it("draws people as named images with initials, then a named +N", async () => {
    const fixture = await render(GroupHost);
    const group = $("#people");
    expect(group.getAttribute("role")).toBe("group");
    expect(group.getAttribute("aria-label")).toBe("Project members");
    expect(group.getAttribute("data-size")).toBe("sm");
    const avatars = $$("sone-avatar", group);
    expect(avatars).toHaveLength(3);
    expect(avatars[0]!.getAttribute("aria-label")).toBe("Ada Lovelace");
    expect(avatars[0]!.getAttribute("role")).toBe("img");
    expect($("img", avatars[0]!).getAttribute("src")).toBe("/ada.png");
    expect($("[soneAvatarFallback]", avatars[1]!).textContent!.trim()).toBe(
      "GH",
    );
    const overflow = avatars[2]!;
    expect(overflow.getAttribute("data-slot")).toBe("avatar-group-overflow");
    expect(overflow.getAttribute("aria-label")).toBe("2 more");
    expect(overflow.textContent!.trim()).toBe("+2");

    fixture.componentInstance.max.set(4);
    await settle(fixture);
    const all = $$("sone-avatar", group);
    expect(all).toHaveLength(4);
    // A person with no name is no image: nothing to name it by.
    expect(all[3]!.hasAttribute("role")).toBe(false);
    expect(all[3]!.textContent!.trim()).toBe("?");
  });

  it("hides projected avatars past max", async () => {
    await render(GroupHost);
    const group = $("#children");
    const avatars = $$("sone-avatar", group);
    expect(avatars.map((a) => a.hasAttribute("hidden"))).toEqual([
      false,
      false,
      true,
      false,
    ]);
    expect(avatars[3]!.getAttribute("aria-label")).toBe("1 more");
  });
});
