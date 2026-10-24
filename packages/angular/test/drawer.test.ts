import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_DIALOG_PARTS } from "@surface-one/angular/dialog";
import { SoneDrawerComponent } from "@surface-one/angular/drawer";

import { $, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

/** A slow hand: 200 ms between events, so no release is a flick. */
let clock = 0;

function pointer(
  target: EventTarget,
  type: string,
  init: { clientX?: number; clientY?: number } = {},
): void {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
  });
  Object.defineProperty(event, "pointerId", { value: 1 });
  Object.defineProperty(event, "isPrimary", { value: true });
  Object.defineProperty(event, "timeStamp", { value: (clock += 200) });
  target.dispatchEvent(event);
}

function sized(el: HTMLElement, height: number): void {
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    width: 400,
    height,
  } as DOMRect);
}

@Component({
  imports: [SoneButtonDirective, SoneDrawerComponent, ...SONE_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="opener" type="button" (click)="open.set(true)">
      Open
    </button>
    <sone-drawer
      [(open)]="open"
      [snapPoints]="snapPoints()"
      [(activeSnapPoint)]="snap"
      (dismiss)="dismissed.set(dismissed() + 1)"
    >
      <header soneDrawerHeader>
        <h2 soneDrawerTitle>Move goal</h2>
        <p soneDrawerDescription>Set your daily activity goal.</p>
        <button soneDrawerClose></button>
      </header>
      <footer soneDrawerFooter>
        <button soneBtn id="submit" type="button">Submit</button>
      </footer>
    </sone-drawer>
  `,
})
class DrawerHost {
  readonly open = signal(false);
  readonly dismissed = signal(0);
  readonly snapPoints = signal<readonly number[]>([]);
  readonly snap = signal<number | null>(null);
}

async function opened() {
  const fixture = await render(DrawerHost);
  $("#opener").focus();
  fixture.componentInstance.open.set(true);
  await settle(fixture);
  return fixture;
}

describe("sone-drawer", () => {
  it("is a modal sheet from the bottom with a drag handle and no corner close", async () => {
    await opened();
    const panel = $('[data-slot="drawer-content"]');
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("data-side")).toBe("bottom");
    expect(panel.classList.contains("sheet-content")).toBe(true);
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)
        ?.textContent,
    ).toBe("Move goal");
    expect($('[data-slot="drawer-handle"]').getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect($('[data-slot="drawer-close"]')).toBeNull();
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  it("closes on Escape and gives focus back", async () => {
    const fixture = await opened();
    key($('[data-slot="drawer-content"]'), "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissed()).toBe(1);
    expect(document.activeElement?.id).toBe("opener");
  });

  it("is dismissed by a swipe toward its edge past a quarter of its height", async () => {
    const fixture = await opened();
    const panel = $('[data-slot="drawer-content"]');
    sized(panel, 400);
    const handle = $('[data-slot="drawer-handle"]');
    // A short drag springs back.
    pointer(handle, "pointerdown", { clientY: 100 });
    pointer(handle, "pointermove", { clientY: 150 });
    expect(panel.hasAttribute("data-dragging")).toBe(true);
    expect(panel.style.translate).toBe("0 50px");
    pointer(handle, "pointerup", { clientY: 150 });
    await settle(fixture);
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    expect(panel.style.translate).toBe("");
    expect(fixture.componentInstance.open()).toBe(true);
    // A long one dismisses it.
    pointer(handle, "pointerdown", { clientY: 100 });
    pointer(handle, "pointermove", { clientY: 300 });
    pointer(handle, "pointerup", { clientY: 300 });
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissed()).toBe(1);
  });

  it("does not start a swipe on a button", async () => {
    const fixture = await opened();
    const panel = $('[data-slot="drawer-content"]');
    sized(panel, 400);
    const submit = $("#submit");
    pointer(submit, "pointerdown", { clientY: 100 });
    pointer(submit, "pointermove", { clientY: 300 });
    pointer(submit, "pointerup", { clientY: 300 });
    await settle(fixture);
    expect(panel.hasAttribute("data-dragging")).toBe(false);
    expect(fixture.componentInstance.open()).toBe(true);
  });

  it("rests on snap points, two-way, and the handle cycles them", async () => {
    const fixture = await render(DrawerHost);
    fixture.componentInstance.snapPoints.set([0.5, 1]);
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    const panel = $('[data-slot="drawer-content"]');
    expect(panel.hasAttribute("data-snap-points")).toBe(true);
    sized(panel, 400);
    $('[data-slot="drawer-handle"]').click();
    await settle(fixture);
    expect(fixture.componentInstance.snap()).toBe(1);
    expect(panel.style.translate).toBe("");
    fixture.componentInstance.snap.set(0.5);
    await settle(fixture);
    expect(panel.style.translate).toBe("0 200px");
    // Keyboard focus inside opens it fully.
    $("#submit").focus();
    await settle(fixture);
    expect(fixture.componentInstance.snap()).toBe(1);
  });

  it("closes from a soneDrawerClose button", async () => {
    const fixture = await opened();
    $("[soneDrawerClose]").click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
  });
});
