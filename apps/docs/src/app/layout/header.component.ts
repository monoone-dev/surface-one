import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneLogoComponent } from "@surface-one/angular/logo";

import { I18n } from "../i18n/i18n.service";
import { currentPath } from "../shared/current-path";
import { SITE, storybookUrl } from "../site.config";
import { ColorModeComponent } from "./color-mode.component";
import { LanguageMenuComponent } from "./language-menu.component";

export const NAV = [
  { key: "components", path: "/components" },
  { key: "guide", path: "/guide" },
  { key: "theme", path: "/theme" },
  { key: "templates", path: "/templates" },
  { key: "release", path: "/release" },
] as const;

@Component({
  selector: "docs-header",
  imports: [
    RouterLink,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneLogoComponent,
    ColorModeComponent,
    LanguageMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
})
export class HeaderComponent {
  protected readonly i18n = inject(I18n);
  protected readonly nav = NAV;
  protected readonly site = SITE;
  protected readonly storybook = storybookUrl();
  protected readonly menuOpen = signal(false);
  private readonly path = currentPath();

  constructor() {
    // Close the mobile menu after every navigation.
    effect(() => {
      this.path();
      this.menuOpen.set(false);
    });
  }

  protected isActive(path: string): boolean {
    const p = this.path();
    return p === path || p.startsWith(path + "/");
  }
}
