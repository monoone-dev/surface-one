import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  SoneAlertDirective,
  SONE_ALERT_PARTS,
} from "@surface-one/angular/alert";
import {
  SoneAvatarComponent,
  SONE_AVATAR_PARTS,
} from "@surface-one/angular/avatar";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import {
  SoneKbdComponent,
  SoneKbdGroupComponent,
} from "@surface-one/angular/kbd";
import { SoneLogoComponent } from "@surface-one/angular/logo";
import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneSegmentedComponent } from "@surface-one/angular/segmented";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

import { CATALOG, SYMBOL_COUNT } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { LOCALES } from "../../i18n/locales";
import { SNIPPETS } from "../../i18n/snippets";
import { Seo } from "../../seo/seo.service";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { SITE, storybookUrl } from "../../site.config";

const FEATURES = [
  "tokens",
  "skins",
  "a11y",
  "signals",
  "fonts",
  "frameworks",
] as const;

@Component({
  selector: "docs-home-page",
  imports: [
    RouterLink,
    CodeBlockComponent,
    SoneAlertDirective,
    SONE_ALERT_PARTS,
    SoneAvatarComponent,
    SONE_AVATAR_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SONE_CARD_PARTS,
    SoneKbdComponent,
    SoneKbdGroupComponent,
    SoneLogoComponent,
    SoneProgressComponent,
    SoneSegmentedComponent,
    SoneSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./home.page.html",
  styleUrl: "./home.page.scss",
})
export default class HomePage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  protected readonly features = FEATURES;
  protected readonly site = SITE;
  protected readonly storybook = storybookUrl();
  protected readonly install = SNIPPETS["install"]!;
  protected readonly stats = {
    components: CATALOG.length,
    symbols: SYMBOL_COUNT,
    skins: 3,
    locales: LOCALES.length,
  };

  // Showcase state.
  protected readonly notify = signal(true);
  protected readonly density = signal("comfortable");
  protected readonly densityOptions = [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.home.title,
        description: m.meta.description,
        path: "/",
        jsonLd: [
          {
            "@type": "SoftwareSourceCode",
            name: "@surface-one/angular",
            description: m.meta.description,
            codeRepository: SITE.repository,
            programmingLanguage: "TypeScript",
            runtimePlatform: "Angular",
            version: SITE.version,
          },
        ],
      });
    });
  }
}
