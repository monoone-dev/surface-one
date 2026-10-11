import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  model,
} from "@angular/core";
import { SoneSelectComponent } from "@surface-one/angular/select";

import { I18n } from "../i18n/i18n.service";
import { FRAMEWORKS, FrameworkService, isFramework } from "./framework.service";

export type UsageTab = "preview" | "code";
const TABS: readonly UsageTab[] = ["preview", "code"];

/**
 * The bar above a live example: the Preview / Code tabs (the WAI-ARIA tabs pattern —
 * arrow keys wrap around, Home / End jump to the ends, a tab is selected as it gets
 * focus) and the framework picker. Content marked `usageBarStart` sits next to the tabs.
 *
 * The page renders the two panels itself, as `#panel-preview` and `#panel-code` with
 * `role="tabpanel"` and `aria-labelledby="tab-preview"` / `"tab-code"`: the tabs control
 * those ids.
 */
@Component({
  selector: "docs-usage-tabs",
  imports: [SoneSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-start">
      <div
        class="tabs"
        role="tablist"
        [attr.aria-label]="label()"
        (keydown)="onKeydown($event)"
      >
        @for (t of tabs; track t) {
          <button
            type="button"
            role="tab"
            [id]="'tab-' + t"
            [attr.aria-controls]="'panel-' + t"
            [attr.aria-selected]="tab() === t"
            [attr.tabindex]="tab() === t ? 0 : -1"
            (click)="tab.set(t)"
          >
            {{ i18n.m().components.page[t] }}
          </button>
        }
      </div>
      <ng-content select="[usageBarStart]" />
    </div>
    <sone-select
      class="framework-select"
      size="sm"
      selectId="framework"
      [ariaLabel]="i18n.m().components.page.framework"
      [value]="frameworks.framework()"
      (selectionChange)="setFramework($event)"
    >
      @for (f of frameworkOptions; track f.value) {
        <option [value]="f.value">{{ f.label }}</option>
      }
    </sone-select>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2) var(--space-3);
      margin-bottom: var(--space-3);
    }
    .bar-start {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }
    .tabs {
      display: inline-flex;
      gap: var(--space-0_5);
      padding: calc(var(--space-0_5) + var(--space-px));
      border-radius: var(--radius-control);
      background: var(--surface-hover);
    }
    .tabs button {
      padding: var(--space-1) var(--space-3);
      border: 0;
      border-radius: calc(var(--radius-control) - var(--space-0_5));
      background: transparent;
      color: var(--text-secondary);
      font: inherit;
      font-size: var(--font-size-sm);
      cursor: pointer;
    }
    .tabs button[aria-selected="true"] {
      background: var(--surface-raised);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
    .framework-select {
      min-width: 0;
      max-width: 100%;
    }
  `,
})
export class UsageTabsComponent {
  protected readonly i18n = inject(I18n);
  protected readonly frameworks = inject(FrameworkService);

  /** The tab list's accessible name. */
  readonly label = input.required<string>();
  readonly tab = model<UsageTab>("preview");

  protected readonly tabs = TABS;
  protected readonly frameworkOptions = FRAMEWORKS;

  protected onKeydown(event: KeyboardEvent): void {
    const i = TABS.indexOf(this.tab());
    const last = TABS.length - 1;
    const next =
      event.key === "ArrowRight"
        ? i === last
          ? 0
          : i + 1
        : event.key === "ArrowLeft"
          ? i === 0
            ? last
            : i - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next < 0) return;
    event.preventDefault();
    this.tab.set(TABS[next]!);
    const tabs = (
      event.currentTarget as HTMLElement
    ).querySelectorAll<HTMLElement>('[role="tab"]');
    tabs[next]?.focus();
  }

  protected setFramework(value: string): void {
    if (isFramework(value)) this.frameworks.set(value);
  }
}
