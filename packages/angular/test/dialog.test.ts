import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_DIALOG_PARTS,
  SoneAlertDialogComponent,
  SoneDialogComponent,
} from "@surface-one/angular/dialog";
import { SoneSheetComponent } from "@surface-one/angular/sheet";

import { $, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [SoneButtonDirective, SoneDialogComponent, ...SONE_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="opener" type="button" (click)="open.set(true)">
      Rename
    </button>
    @if (open()) {
      <sone-dialog (dismiss)="dismissed.set(dismissed() + 1); open.set(false)">
        <header soneDialogHeader>
          <h2 soneDialogTitle>Rename note</h2>
          <p soneDialogDescription>The new name shows everywhere.</p>
        </header>
        <input id="name" aria-label="Name" data-autofocus />
        <button soneBtn id="save" type="button">Save</button>
      </sone-dialog>
    }
  `,
})
class MountedDialogHost {
  readonly open = signal(false);
  readonly dismissed = signal(0);
}

@Component({
  imports: [SoneButtonDirective, SoneDialogComponent, ...SONE_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="opener" type="button" (click)="open.set(true)">
      Details
    </button>
    <sone-dialog [(open)]="open" (dismiss)="dismissed.set(dismissed() + 1)">
      <h2 soneDialogTitle>Note details</h2>
      <button soneBtn id="done" type="button" (click)="open.set(false)">
        Done
      </button>
    </sone-dialog>
  `,
})
class BoundDialogHost {
  readonly open = signal(false);
  readonly dismissed = signal(0);
}

@Component({
  imports: [
    SoneButtonDirective,
    SoneAlertDialogComponent,
    ...SONE_DIALOG_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-alert-dialog
      [(open)]="open"
      (dismiss)="dismissed.set(dismissed() + 1)"
    >
      <h2 soneDialogTitle>Delete note?</h2>
      <button soneBtn type="button">Cancel</button>
    </sone-alert-dialog>
  `,
})
class AlertHost {
  readonly open = signal(true);
  readonly dismissed = signal(0);
}

@Component({
  imports: [SoneButtonDirective, SoneSheetComponent, ...SONE_DIALOG_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button soneBtn id="opener" type="button" (click)="open.set(true)">
      Filters
    </button>
    <sone-sheet side="left" [(open)]="open">
      <h2 soneDialogTitle>Filters</h2>
      <button soneBtn id="apply" type="button">Apply</button>
    </sone-sheet>
  `,
})
class BoundSheetHost {
  readonly open = signal(false);
}

describe("sone-dialog (mounted means open)", () => {
  it("names the panel, moves focus in, traps Tab and dismisses on Escape", async () => {
    const fixture = await render(MountedDialogHost);
    const opener = $<HTMLButtonElement>("#opener");
    opener.focus();
    opener.click();
    await settle(fixture);

    const overlay = $("[data-slot=dialog-overlay]");
    expect(overlay.parentElement).toBe(document.body);
    const panel = $("[data-slot=dialog-content]");
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    const title = $("[data-slot=dialog-title]");
    expect(panel.getAttribute("aria-labelledby")).toBe(title.id);
    expect(panel.getAttribute("aria-describedby")).toBe(
      $("[data-slot=dialog-description]").id,
    );
    expect(document.activeElement).toBe($("#name"));

    // Tab from the last stop (the corner close) wraps to the first.
    const close = $("button.dialog-close");
    close.focus();
    key(close, "Tab");
    expect(document.activeElement).toBe($("#name"));
    key($("#name"), "Tab", { shiftKey: true });
    expect(document.activeElement).toBe(close);

    key(panel, "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.dismissed()).toBe(1);
    expect($("[data-slot=dialog-overlay]")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("closes on a scrim click only when the press started on the scrim", async () => {
    const fixture = await render(MountedDialogHost);
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    const overlay = $("[data-slot=dialog-overlay]");
    const panel = $("[data-slot=dialog-content]");

    panel.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(fixture.componentInstance.dismissed()).toBe(0);

    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(fixture.componentInstance.dismissed()).toBe(1);
  });
});

describe("sone-dialog [(open)]", () => {
  it("stays mounted, hidden while closed, and toggles with the model", async () => {
    const fixture = await render(BoundDialogHost);
    const overlay = $("[data-slot=dialog-overlay]");
    expect(overlay.hasAttribute("hidden")).toBe(true);
    expect($("[data-slot=dialog-content]")).toBeNull();

    const opener = $<HTMLButtonElement>("#opener");
    opener.focus();
    opener.click();
    await settle(fixture);
    expect(overlay.hasAttribute("hidden")).toBe(false);
    const panel = $("[data-slot=dialog-content]");
    expect(panel.getAttribute("aria-labelledby")).toBe(
      $("[data-slot=dialog-title]").id,
    );
    expect(document.activeElement).toBe(panel);

    $<HTMLButtonElement>("#done").click();
    await settle(fixture);
    expect(overlay.hasAttribute("hidden")).toBe(true);
    expect($("[data-slot=dialog-content]")).toBeNull();
    expect(document.activeElement).toBe(opener);
    // Closing through the model is not a dismissal.
    expect(fixture.componentInstance.dismissed()).toBe(0);
  });

  it("a dismissal emits dismiss and writes open back to false", async () => {
    const fixture = await render(BoundDialogHost);
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    key($("[data-slot=dialog-content]"), "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.dismissed()).toBe(1);
    expect(fixture.componentInstance.open()).toBe(false);
    expect($("[data-slot=dialog-overlay]").hasAttribute("hidden")).toBe(true);

    // And it opens again.
    fixture.componentInstance.open.set(true);
    await settle(fixture);
    expect($("[data-slot=dialog-content]")).not.toBeNull();
    $<HTMLButtonElement>("button.dialog-close").click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissed()).toBe(2);
  });
});

describe("sone-alert-dialog", () => {
  it("is an alertdialog with no corner close that ignores the scrim", async () => {
    const fixture = await render(AlertHost);
    await settle(fixture);
    const panel = $("[data-slot=alert-dialog-content]");
    expect(panel.getAttribute("role")).toBe("alertdialog");
    expect($("button.dialog-close")).toBeNull();
    const overlay = $("[data-slot=alert-dialog-overlay]");
    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    overlay.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(fixture.componentInstance.open()).toBe(true);
    key(panel, "Escape");
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.dismissed()).toBe(1);
  });
});

describe("sone-sheet [(open)]", () => {
  it("opens on its side, closes from the corner button and returns focus", async () => {
    const fixture = await render(BoundSheetHost);
    expect($("[data-slot=sheet-overlay]").hasAttribute("hidden")).toBe(true);
    const opener = $<HTMLButtonElement>("#opener");
    opener.focus();
    opener.click();
    await settle(fixture);
    const panel = $("[data-slot=sheet-content]");
    expect(panel.getAttribute("data-side")).toBe("left");
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(document.activeElement).toBe(panel);
    $<HTMLButtonElement>("[data-slot=sheet-close]").click();
    await settle(fixture);
    expect(fixture.componentInstance.open()).toBe(false);
    expect($("[data-slot=sheet-content]")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});
