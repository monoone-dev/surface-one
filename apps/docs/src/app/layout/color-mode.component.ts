import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

import { I18n } from "../i18n/i18n.service";
import { MODES, ThemeService, type ColorMode } from "../theme/theme.service";

const ICON: Record<ColorMode, ShellIcon> = {
  system: "display",
  light: "sun",
  dark: "moon",
};

/** System / Light / Dark as a labelled group of toggle buttons (aria-pressed). */
@Component({
  selector: "docs-color-mode",
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="color-mode"
      role="group"
      [attr.aria-label]="i18n.m().a11y.colorMode"
    >
      @for (mode of modes; track mode) {
        <button
          soneBtn
          type="button"
          variant="ghost"
          size="icon-sm"
          [attr.aria-pressed]="theme.mode() === mode"
          [attr.aria-label]="i18n.m().colorMode[mode]"
          [soneTooltip]="i18n.m().colorMode[mode]"
          (click)="theme.setMode(mode)"
        >
          <sone-icon [icon]="icons[mode]" size="sm" />
        </button>
      }
    </div>
  `,
  styles: `
    .color-mode {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border: 1px solid var(--border);
      border-radius: var(--radius-control);
    }
    [aria-pressed="true"] {
      background: var(--surface-hover);
      color: var(--text-primary);
    }
  `,
})
export class ColorModeComponent {
  protected readonly i18n = inject(I18n);
  protected readonly theme = inject(ThemeService);
  protected readonly modes = MODES;
  protected readonly icons = ICON;
}
