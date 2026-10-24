import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_MENU_PARTS,
  SONE_POPOVER_PARTS,
  SoneMenuTriggerDirective,
  SonePopoverTriggerDirective,
} from "@surface-one/angular/menu";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneButtonDirective, SoneMenuTriggerDirective, ...SONE_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="trigger" type="button" [soneMenuTrigger]="menu">
      Actions
    </button>
    <ng-template #menu>
      <div soneMenu aria-label="Note actions">
        <button soneMenuItem type="button" (click)="picked.set('rename')">
          Rename
        </button>
        <button soneMenuItem type="button" disabled>Export</button>
        <button soneMenuItem type="button" (click)="picked.set('delete')">
          Delete
        </button>
        <button
          soneMenuCheckboxItem
          type="button"
          [checked]="pinned()"
          (click)="pinned.set(!pinned())"
        >
          Pinned
        </button>
      </div>
    </ng-template>
  `,
})
class MenuHost {
  readonly picked = signal<string | null>(null);
  readonly pinned = signal(true);
}

@Component({
  imports: [
    SoneButtonDirective,
    SonePopoverTriggerDirective,
    ...SONE_POPOVER_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="trigger" type="button" [sonePopoverTrigger]="pop">
      Dimensions
    </button>
    <ng-template #pop let-close="close">
      <div sonePopoverContent aria-label="Dimensions">
        <input id="width" aria-label="Width" />
        <button soneBtn id="apply" type="button" (click)="close()">
          Apply
        </button>
      </div>
    </ng-template>
    <button id="outside" type="button">Outside</button>
  `,
})
class PopoverHost {}

describe("soneMenuTrigger", () => {
  it("is a menu button: ArrowDown opens on the first item, arrows skip disabled ones", async () => {
    const fixture = await render(MenuHost);
    const trigger = $<HTMLButtonElement>("#trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    trigger.focus();
    key(trigger, "ArrowDown");
    await settle(fixture);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const menu = $("[data-slot=menu]");
    expect(menu.getAttribute("role")).toBe("menu");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id);
    const items = $$("[role=menuitem], [role=menuitemcheckbox]", menu);
    expect(document.activeElement).toBe(items[0]);
    expect(items[3]!.getAttribute("aria-checked")).toBe("true");

    key(items[0]!, "ArrowDown");
    expect(document.activeElement).toBe(items[2]);
    key(items[2]!, "End");
    expect(document.activeElement).toBe(items[3]);
    key(items[3]!, "Home");
    expect(document.activeElement).toBe(items[0]);
  });

  it("activates an item, closes and returns focus; Escape closes too", async () => {
    const fixture = await render(MenuHost);
    const trigger = $<HTMLButtonElement>("#trigger");
    trigger.focus();
    key(trigger, "Enter");
    await settle(fixture);
    const del = $$("[role=menuitem]").find((b) =>
      b.textContent?.includes("Delete"),
    )!;
    del.focus();
    key(del, "Enter");
    await settle(fixture);
    expect(fixture.componentInstance.picked()).toBe("delete");
    expect($("[data-slot=menu]")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    key(trigger, "ArrowUp");
    await settle(fixture);
    const items = $$("[role=menuitem], [role=menuitemcheckbox]");
    expect(document.activeElement).toBe(items[items.length - 1]);
    key(document.activeElement!, "Escape");
    await settle(fixture);
    expect($("[data-slot=menu]")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });
});

describe("sonePopoverTrigger", () => {
  it("opens a dialog popover on click, closes from inside and on Escape", async () => {
    const fixture = await render(PopoverHost);
    const trigger = $<HTMLButtonElement>("#trigger");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    trigger.focus();
    trigger.click();
    await settle(fixture);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      $("[data-slot=popover-content], [data-slot=popover]"),
    ).not.toBeNull();

    $<HTMLButtonElement>("#apply").click();
    await settle(fixture);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect($("#width")).toBeNull();

    trigger.click();
    await settle(fixture);
    key($("#width"), "Escape");
    await settle(fixture);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on a press outside", async () => {
    const fixture = await render(PopoverHost);
    const trigger = $<HTMLButtonElement>("#trigger");
    trigger.click();
    await settle(fixture);
    expect($("#width")).not.toBeNull();
    $("#outside").dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true }),
    );
    await settle(fixture);
    expect($("#width")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
