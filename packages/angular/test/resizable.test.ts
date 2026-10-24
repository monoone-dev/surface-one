import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_RESIZABLE_PARTS,
  type ResizableStorage,
} from "@surface-one/angular/resizable";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

class MemoryStorage implements ResizableStorage {
  readonly items = new Map<string, string>();
  getItem(k: string): string | null {
    return this.items.get(k) ?? null;
  }
  setItem(k: string, v: string): void {
    this.items.set(k, v);
  }
}

@Component({
  imports: [...SONE_RESIZABLE_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-resizable-group
      [(sizes)]="sizes"
      autoSaveId="mail"
      [storage]="storage"
      style="width: 400px; height: 200px"
    >
      <sone-resizable-panel id="nav" defaultSize="25" minSize="10" collapsible
        >Nav</sone-resizable-panel
      >
      <sone-resizable-handle withHandle />
      <sone-resizable-panel minSize="20">Content</sone-resizable-panel>
    </sone-resizable-group>
  `,
})
class ResizableHost {
  readonly sizes = signal<readonly number[]>([]);
  readonly storage = new MemoryStorage();
}

describe("sone-resizable-group", () => {
  it("lays out the panels from their defaults", async () => {
    await render(ResizableHost);
    const panels = $$('[data-slot="resizable-panel"]');
    expect(panels[0].style.flex).toBe("25 1 0px");
    expect(panels[1].style.flex).toBe("75 1 0px");
    expect(
      $('[data-slot="resizable-group"]').getAttribute("data-direction"),
    ).toBe("horizontal");
    expect($('[data-slot="resizable-grip"]')).toBeTruthy();
  });

  it("is a window splitter: value, limits, orientation and the panel it controls", async () => {
    await render(ResizableHost);
    const handle = $('[data-slot="resizable-handle"]');
    expect(handle.getAttribute("role")).toBe("separator");
    expect(handle.tabIndex).toBe(0);
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    expect(handle.getAttribute("aria-valuenow")).toBe("25");
    expect(handle.getAttribute("aria-valuemin")).toBe("10");
    expect(handle.getAttribute("aria-valuemax")).toBe("100");
    expect(handle.getAttribute("aria-controls")).toBe("nav");
    expect(handle.getAttribute("aria-label")).toBe("Resize panels");
  });

  it("moves with the keys, binds the sizes and saves them", async () => {
    const fixture = await render(ResizableHost);
    const handle = $('[data-slot="resizable-handle"]');
    expect(key(handle, "ArrowRight").defaultPrevented).toBe(true);
    await settle(fixture);
    expect(fixture.componentInstance.sizes()).toEqual([35, 65]);
    expect(handle.getAttribute("aria-valuenow")).toBe("35");
    expect(
      fixture.componentInstance.storage.getItem("sone-resizable:mail"),
    ).toBe("[35,65]");
    key(handle, "End");
    await settle(fixture);
    expect(fixture.componentInstance.sizes()).toEqual([80, 20]);
    key(handle, "Home");
    await settle(fixture);
    expect(fixture.componentInstance.sizes()).toEqual([10, 90]);
    key(handle, "Enter");
    await settle(fixture);
    expect(fixture.componentInstance.sizes()).toEqual([0, 100]);
    expect(
      $('[data-slot="resizable-panel"]').hasAttribute("data-collapsed"),
    ).toBe(true);
    key(handle, "Enter");
    await settle(fixture);
    expect(fixture.componentInstance.sizes()).toEqual([10, 90]);
    expect(key(handle, "ArrowDown").defaultPrevented).toBe(false);
  });
});
