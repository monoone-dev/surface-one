import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
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
import {
  SoneBarListComponent,
  type SoneBarListItem,
} from "@surface-one/angular/bar-list";
import { SoneSwatchDirective } from "@surface-one/angular/chart-legend";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SoneLevelMeterComponent,
  SoneRecordingIndicatorComponent,
} from "@surface-one/angular/recording";
import { SoneSparklineComponent } from "@surface-one/angular/sparkline";
import { SONE_STAT_PARTS } from "@surface-one/angular/stat";
import { SONE_TOGGLE_PARTS } from "@surface-one/angular/toggle-group";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import {
  SoneKbdComponent,
  SoneKbdGroupComponent,
} from "@surface-one/angular/kbd";
import { SoneProgressComponent } from "@surface-one/angular/progress";
import { SoneSegmentedComponent } from "@surface-one/angular/segmented";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

import { CATALOG, SYMBOL_COUNT } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { LOCALES } from "../../i18n/locales";
import { SNIPPETS } from "../../i18n/snippets";
import { Seo } from "../../seo/seo.service";
import { CodeBlockComponent } from "../../shared/code-block.component";
import {
  FrameworkService,
  type Framework,
} from "../../shared/framework.service";
import { SITE, storybookUrl } from "../../site.config";

type HeroTab = Framework | "react";

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
    SoneProgressComponent,
    SoneSegmentedComponent,
    SoneSwitchComponent,
    SoneBarListComponent,
    SoneSwatchDirective,
    SoneIconComponent,
    SoneLevelMeterComponent,
    SoneRecordingIndicatorComponent,
    SoneSparklineComponent,
    SONE_STAT_PARTS,
    SONE_TOGGLE_PARTS,
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
  protected readonly snippets = {
    install: SNIPPETS["install"]!,
    angularStylesLine: SNIPPETS["angularStylesLine"]!,
    installVue: SNIPPETS["installVue"]!,
    nuxtConfig: SNIPPETS["nuxtConfig"]!,
  };
  protected readonly frameworkTabs = [
    { value: "angular" },
    { value: "vue" },
    { value: "react" },
  ] as const;
  private readonly frameworks = inject(FrameworkService);
  private readonly reactPicked = signal(false);
  protected readonly tab = computed<HeroTab>(() =>
    this.reactPicked() ? "react" : this.frameworks.framework(),
  );

  // Hero preview data.
  protected readonly spark = [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 10, 14, 13, 16];
  protected readonly topics: SoneBarListItem[] = [
    { key: "roadmap", label: "Roadmap", value: 9, tone: "chart-1" },
    { key: "hiring", label: "Hiring", value: 6, tone: "chart-2" },
    { key: "launch", label: "Launch", value: 4, tone: "chart-3" },
  ];
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

  protected pick(tab: HeroTab): void {
    this.reactPicked.set(tab === "react");
    if (tab !== "react") this.frameworks.set(tab);
  }

  constructor() {
    afterNextRender(() => this.frameworks.restore());
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.home.title,
        description: m.meta.description,
        path: "/",
        jsonLd: [
          {
            "@type": "SoftwareSourceCode",
            name: SITE.name,
            description: m.meta.description,
            codeRepository: SITE.repository,
            programmingLanguage: ["TypeScript", "CSS"],
            runtimePlatform: ["Angular", "Vue", "Nuxt"],
            keywords: [
              "design system",
              "component library",
              "Angular",
              "Vue",
              "Nuxt",
              "design tokens",
              "accessibility",
            ],
            version: SITE.version,
            hasPart: [
              "@surface-one/angular",
              "@surface-one/vue",
              "@surface-one/tokens",
            ].map((name) => ({ "@type": "SoftwareSourceCode", name })),
          },
        ],
      });
    });
  }
}
