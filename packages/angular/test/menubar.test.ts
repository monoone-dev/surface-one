import { ChangeDetectionStrategy, Component } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_MENUBAR_PARTS } from "@surface-one/angular/menubar";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_MENUBAR_PARTS, ...SONE_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div soneMenubar aria-label="Editor">
      <button id="file" type="button" [soneMenubarTrigger]="file">File</button>
      <button id="edit" type="button" [soneMenubarTrigger]="edit">Edit</button>
    </div>
    <ng-template #file>
      <div soneMenu aria-label="File">
        <button soneMenuItem type="button">New Tab</button>
        <button soneMenuItem type="button">Print</button>
      </div>
    </ng-template>
    <ng-template #edit>
      <div soneMenu aria-label="Edit">
        <button soneMenuItem type="button">Undo</button>
        <button soneMenuItem type="button">Redo</button>
      </div>
    </ng-template>
  `,
})
class MenubarHost {}

describe("soneMenubar", () => {
  it("is a menubar of menu items with one Tab stop", async () => {
    const fixture = await render(MenubarHost);
    await settle(fixture);
    expect($("[soneMenubar]").getAttribute("role")).toBe("menubar");
    const triggers = $$('[data-slot="menubar-trigger"]');
    expect(triggers.map((t) => t.getAttribute("role"))).toEqual([
      "menuitem",
      "menuitem",
    ]);
    expect(triggers.map((t) => t.getAttribute("aria-haspopup"))).toEqual([
      "menu",
      "menu",
    ]);
    expect(triggers.map((t) => t.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
    ]);
    triggers[0]!.focus();
    key(triggers[0]!, "ArrowRight");
    expect(document.activeElement).toBe(triggers[1]);
    expect(triggers.map((t) => t.getAttribute("tabindex"))).toEqual([
      "-1",
      "0",
    ]);
  });

  it("opens a menu with ArrowDown and moves to the next one with ArrowRight", async () => {
    const fixture = await render(MenubarHost);
    await settle(fixture);
    const file = $("#file");
    file.focus();
    key(file, "ArrowDown");
    await settle(fixture);
    expect(file.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent?.trim()).toBe("New Tab");
    key(document.activeElement!, "ArrowRight");
    await settle(fixture);
    await settle(fixture);
    expect(file.getAttribute("aria-expanded")).toBe("false");
    expect($("#edit").getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent?.trim()).toBe("Undo");
    key(document.activeElement!, "Escape");
    await settle(fixture);
    expect(document.activeElement).toBe($("#edit"));
    expect($('[role="menu"]')).toBeNull();
  });

  it("switches menus on hover once one is open", async () => {
    const fixture = await render(MenubarHost);
    await settle(fixture);
    $("#file").click();
    await settle(fixture);
    expect($('[role="menu"]')?.getAttribute("aria-label")).toBe("File");
    $("#edit").dispatchEvent(new Event("pointerenter"));
    await settle(fixture);
    expect(
      $$('[role="menu"]').map((m) => m.getAttribute("aria-label")),
    ).toEqual(["Edit"]);
  });
});
