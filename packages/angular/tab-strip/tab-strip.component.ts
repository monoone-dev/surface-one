import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  booleanAttribute,
  inject,
  input,
  model,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  tabStripKeyAction,
  tabStripPanelId,
  tabStripTabId,
  tabStripTabIndex,
  type TabStripStatus,
  type TabStripTab,
} from "./tab-strip-items";

/** Content after the tabs, pushed to the end of the strip (a search, an account). */
@Directive({
  selector: "[soneTabStripTrailing]",
  host: { class: "tab-strip-trailing", "data-slot": "tab-strip-trailing" },
})
export class SoneTabStripTrailingDirective {}

/**
 * `<sone-tab-strip>` — document tabs for a desktop window (the WAI-ARIA Tabs pattern):
 * a `tablist` of `tabs`, the selected one `[(active)]`, each with an optional status dot
 * (`busy` pulses) and a short note. `closable` gives every tab a close button — a sibling
 * of the tab, so the tab stays one control — and `addable` a "New tab" button.
 * ←/→, Home and End move between tabs; Delete or ⌘W closes the focused one. Each tab
 * points at its panel: `id="<panelIdPrefix>-<tab id>"`, labelled by
 * `<panelIdPrefix>-tab-<tab id>`.
 */
@Component({
  selector: "sone-tab-strip",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./tab-strip.component.html",
  styleUrl: "./tab-strip.component.scss",
  host: { "data-slot": "tab-strip" },
})
export class SoneTabStripComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly tabs = input<readonly TabStripTab[]>([]);
  /** The selected tab's id — `[(active)]`. */
  readonly active = model<string | null>(null);
  /** Names the tab list. */
  readonly ariaLabel = input<string>($localize`:A tab strip's tab list:Tabs`);
  /** Gives every tab a close button (and Delete / ⌘W). */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Shows the "New tab" button after the tabs. */
  readonly addable = input(false, { transform: booleanAttribute });
  /** The id prefix the panels use, so each tab can point at its panel. */
  readonly panelIdPrefix = input("tab-panel");

  /** A tab's close button or Delete / ⌘W on it: the parent removes it and picks the new active tab. */
  readonly close = output<string>();
  /** The "New tab" button. */
  readonly add = output<void>();

  protected readonly addLabel = $localize`:A tab strip's new tab button:New tab`;
  protected readonly tabId = tabStripTabId;
  protected readonly panelId = tabStripPanelId;

  protected tabIndex(index: number): 0 | -1 {
    return tabStripTabIndex(this.tabs(), this.active(), index);
  }

  protected closeLabel(label: string): string {
    return $localize`:A tab strip's close button:Close ${label}:label:`;
  }

  protected statusText(status: TabStripStatus): string {
    switch (status) {
      case "busy":
        return $localize`:Spoken after a busy tab's label:, running`;
      case "done":
        return $localize`:Spoken after a finished tab's label:, finished`;
      case "waiting":
        return $localize`:Spoken after a tab waiting for the user:, waiting for you`;
      case "error":
        return $localize`:Spoken after a failed tab's label:, needs attention`;
    }
  }

  protected select(id: string): void {
    this.active.set(id);
  }

  protected onKeydown(event: KeyboardEvent, index: number): void {
    const action = tabStripKeyAction(
      event,
      this.tabs(),
      index,
      this.closable(),
    );
    if (!action) return;
    event.preventDefault();
    if (action.kind === "move") {
      this.active.set(action.id);
      this.focus(action.id);
    } else {
      this.close.emit(action.id);
      // The parent drops the tab; the focus follows to its neighbour once it re-renders.
      if (action.next) {
        const next = action.next;
        requestAnimationFrame(() => this.focus(next));
      }
    }
  }

  private focus(id: string): void {
    const el = this.host.nativeElement.querySelector<HTMLElement>(
      `#${CSS.escape(tabStripTabId(this.panelIdPrefix(), id))}`,
    );
    el?.focus();
  }
}
