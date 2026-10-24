import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneContextMenuTriggerDirective } from "@surface-one/angular/context-menu";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneContextMenuTriggerDirective, ...SONE_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      id="area"
      tabindex="0"
      [soneContextMenuTrigger]="menu"
      [disabled]="off()"
    >
      Right-click here
    </div>
    <ng-template #menu>
      <div soneMenu aria-label="Actions">
        <button soneMenuItem type="button" (click)="picked.set('copy')">
          Copy
        </button>
        <button soneMenuItem type="button" disabled>Cut</button>
        <button soneMenuItem type="button" (click)="picked.set('paste')">
          Paste
        </button>
      </div>
    </ng-template>
    <button id="outside" type="button">Outside</button>
  `,
})
class ContextHost {
  readonly picked = signal<string | null>(null);
  readonly off = signal(false);
}

function contextmenu(target: Element, x: number, y: number): MouseEvent {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  target.dispatchEvent(event);
  return event;
}

describe("soneContextMenuTrigger", () => {
  it("opens the menu at the pointer on a right click, with no popup attributes on the area", async () => {
    const fixture = await render(ContextHost);
    const area = $("#area");
    expect(area.getAttribute("data-slot")).toBe("context-menu-trigger");
    expect(area.hasAttribute("aria-haspopup")).toBe(false);
    expect(contextmenu(area, 120, 80).defaultPrevented).toBe(true);
    await settle(fixture);
    const positioner = $('[data-slot="overlay-positioner"]');
    expect($('[role="menu"]', positioner)).toBeTruthy();
    expect(positioner.style.left).toBe("120px");
    expect(positioner.style.top).toBe("84px");
    expect(area.getAttribute("data-state")).toBe("open");

    // Arrow keys walk the menu's items, skipping the disabled one; Enter activates.
    key($('[role="menu"]'), "ArrowDown");
    expect(document.activeElement?.textContent?.trim()).toBe("Copy");
    key(document.activeElement!, "ArrowDown");
    expect(document.activeElement?.textContent?.trim()).toBe("Paste");
    key(document.activeElement!, "Enter");
    await settle(fixture);
    expect(fixture.componentInstance.picked()).toBe("paste");
    expect($('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(area);
  });

  it("opens on Shift+F10 on the first item and closes on Escape", async () => {
    const fixture = await render(ContextHost);
    const area = $("#area");
    area.focus();
    expect(key(area, "F10", { shiftKey: true }).defaultPrevented).toBe(true);
    await settle(fixture);
    await settle(fixture);
    expect(document.activeElement?.textContent?.trim()).toBe("Copy");
    // Enter in the area does not open anything (it is not a menu button).
    key(document.activeElement!, "Escape");
    await settle(fixture);
    expect($('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(area);
    key(area, "Enter");
    await settle(fixture);
    expect($('[role="menu"]')).toBeNull();
  });

  it("closes on a click outside and leaves the browser menu alone while disabled", async () => {
    const fixture = await render(ContextHost);
    const area = $("#area");
    contextmenu(area, 10, 10);
    await settle(fixture);
    expect($$('[role="menuitem"]').length).toBe(3);
    $("#outside").dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await settle(fixture);
    expect($('[role="menu"]')).toBeNull();
    fixture.componentInstance.off.set(true);
    await settle(fixture);
    expect(contextmenu(area, 10, 10).defaultPrevented).toBe(false);
  });
});
