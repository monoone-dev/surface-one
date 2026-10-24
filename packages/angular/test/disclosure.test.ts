import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_ACCORDION_PARTS,
  type AccordionValue,
} from "@surface-one/angular/accordion";
import {
  SONE_TOGGLE_PARTS,
  type ToggleGroupValue,
} from "@surface-one/angular/toggle-group";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_ACCORDION_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-accordion [type]="type()" collapsible [(value)]="open">
      <sone-accordion-item value="shipping">
        <sone-accordion-trigger>Shipping</sone-accordion-trigger>
        <sone-accordion-content>Three to five days.</sone-accordion-content>
      </sone-accordion-item>
      <sone-accordion-item value="returns">
        <sone-accordion-trigger>Returns</sone-accordion-trigger>
        <sone-accordion-content>Thirty days.</sone-accordion-content>
      </sone-accordion-item>
      <sone-accordion-item value="billing" disabled>
        <sone-accordion-trigger>Billing</sone-accordion-trigger>
        <sone-accordion-content>Owners only.</sone-accordion-content>
      </sone-accordion-item>
      <sone-accordion-item value="privacy">
        <sone-accordion-trigger>Privacy</sone-accordion-trigger>
        <sone-accordion-content>Never sold.</sone-accordion-content>
      </sone-accordion-item>
    </sone-accordion>
  `,
})
class AccordionHost {
  readonly type = signal<"single" | "multiple">("single");
  readonly open = signal<AccordionValue>("shipping");
}

@Component({
  imports: [...SONE_TOGGLE_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      soneToggleGroup
      id="view"
      type="single"
      [(value)]="view"
      aria-label="View"
    >
      @for (v of views; track v) {
        <button soneToggleGroupItem type="button" [value]="v">{{ v }}</button>
      }
    </div>
    <div
      soneToggleGroup
      id="levels"
      type="multiple"
      [(value)]="levels"
      [disabled]="locked()"
      aria-label="Levels"
    >
      <button soneToggleGroupItem type="button" value="error">Errors</button>
      <button soneToggleGroupItem type="button" value="warn">Warnings</button>
      <button soneToggleGroupItem type="button" value="info" disabled>
        Info
      </button>
    </div>
    <div soneToggleGroup id="free" role="toolbar" aria-label="Format">
      <button
        soneToggleGroupItem
        type="button"
        [pressed]="bold()"
        (click)="bold.set(!bold())"
      >
        Bold
      </button>
      <button soneToggleGroupItem type="button">Italic</button>
    </div>
    <div soneTabsList role="tablist" aria-label="Project">
      @for (t of tabs; track t) {
        <button
          soneTabsTrigger
          role="tab"
          type="button"
          [active]="tab() === t"
          (click)="tab.set(t)"
        >
          {{ t }}
        </button>
      }
    </div>
  `,
})
class ToggleHost {
  readonly views = ["List", "Board", "Calendar"];
  readonly tabs = ["Overview", "Activity", "Settings"];
  readonly view = signal<ToggleGroupValue>("Board");
  readonly levels = signal<ToggleGroupValue>(["error"]);
  readonly locked = signal(false);
  readonly bold = signal(false);
  readonly tab = signal("Overview");
}

const pressed = (root: Element) =>
  $$("[data-slot=toggle-group-item]", root).map((b) =>
    b.getAttribute("aria-pressed"),
  );
const tabindex = (root: Element) =>
  $$("[data-slot=toggle-group-item]", root).map((b) =>
    b.getAttribute("tabindex"),
  );

describe("sone-accordion", () => {
  it("wires trigger and region, opens one at a time and collapses", async () => {
    const fixture = await render(AccordionHost);
    const triggers = $$<HTMLButtonElement>("button.accordion-trigger");
    const regions = $$("[data-slot=accordion-content]");
    expect(triggers[0]!.getAttribute("aria-controls")).toBe(regions[0]!.id);
    expect(regions[0]!.getAttribute("aria-labelledby")).toBe(triggers[0]!.id);
    expect(regions[0]!.getAttribute("role")).toBe("region");
    expect(triggers.map((t) => t.getAttribute("aria-expanded"))).toEqual([
      "true",
      "false",
      "false",
      "false",
    ]);
    expect(regions[1]!.hidden).toBe(true);
    expect(triggers[2]!.disabled).toBe(true);

    triggers[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe("returns");
    expect(regions[0]!.hidden).toBe(true);
    expect(regions[1]!.hidden).toBe(false);

    triggers[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBeNull();
  });

  it("keeps several open when multiple; arrows skip the disabled trigger", async () => {
    const fixture = await render(AccordionHost);
    fixture.componentInstance.type.set("multiple");
    fixture.componentInstance.open.set(["shipping"]);
    await settle(fixture);
    const triggers = $$<HTMLButtonElement>("button.accordion-trigger");
    triggers[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toEqual(["shipping", "returns"]);

    triggers[1]!.focus();
    key(triggers[1]!, "ArrowDown");
    expect(document.activeElement).toBe(triggers[3]);
    key(triggers[3]!, "Home");
    expect(document.activeElement).toBe(triggers[0]);
  });
});

describe("soneToggleGroup selection", () => {
  it("type=single presses by value, is one Tab stop and clears on a second press", async () => {
    const fixture = await render(ToggleHost);
    const group = $("#view");
    expect(group.getAttribute("role")).toBe("group");
    expect(pressed(group)).toEqual(["false", "true", "false"]);
    expect(tabindex(group)).toEqual(["-1", "0", "-1"]);

    const items = $$<HTMLButtonElement>("button", group);
    items[2]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.view()).toBe("Calendar");
    expect(pressed(group)).toEqual(["false", "false", "true"]);
    expect(items[2]!.getAttribute("data-state")).toBe("on");

    items[2]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.view()).toBeNull();

    // Arrows move focus and the focused item becomes the Tab stop.
    items[0]!.focus();
    key(items[0]!, "ArrowRight");
    await settle(fixture);
    expect(document.activeElement).toBe(items[1]);
    expect(tabindex(group)).toEqual(["-1", "0", "-1"]);
  });

  it("type=multiple toggles values; disabled items and a disabled group refuse", async () => {
    const fixture = await render(ToggleHost);
    const group = $("#levels");
    const items = $$<HTMLButtonElement>("button", group);
    expect(items[2]!.disabled).toBe(true);
    items[1]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.levels()).toEqual(["error", "warn"]);
    items[0]!.click();
    await settle(fixture);
    expect(fixture.componentInstance.levels()).toEqual(["warn"]);

    fixture.componentInstance.locked.set(true);
    await settle(fixture);
    expect(items.every((b) => b.disabled)).toBe(true);
  });

  it("without type, items keep their own pressed, the authored role and the Tab order", async () => {
    const fixture = await render(ToggleHost);
    const group = $("#free");
    expect(group.getAttribute("role")).toBe("toolbar");
    expect(pressed(group)).toEqual(["false", "false"]);
    expect(tabindex(group)).toEqual([null, null]);
    $$<HTMLButtonElement>("button", group)[0]!.click();
    await settle(fixture);
    expect(pressed(group)).toEqual(["true", "false"]);
  });
});

describe("soneTabsList", () => {
  it("is one Tab stop with aria-selected on the active tab", async () => {
    const fixture = await render(ToggleHost);
    const tabs = $$<HTMLButtonElement>("[role=tab]");
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    expect(tabs.map((t) => t.getAttribute("tabindex"))).toEqual([
      "0",
      "-1",
      "-1",
    ]);
    tabs[0]!.focus();
    key(tabs[0]!, "End");
    expect(document.activeElement).toBe(tabs[2]);
    tabs[2]!.click();
    await settle(fixture);
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual([
      "false",
      "false",
      "true",
    ]);
  });
});
