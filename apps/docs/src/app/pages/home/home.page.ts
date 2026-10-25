import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
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
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SoneLogoComponent } from "@surface-one/angular/logo";
import { SoneSparklineComponent } from "@surface-one/angular/sparkline";
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

import { SYMBOL_COUNT } from "../../catalog/api";
import { CATALOG } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { LOCALES } from "../../i18n/locales";
import { SNIPPETS } from "../../i18n/snippets";
import { pageSeo } from "../../seo/page-seo";
import { CodeBlockComponent } from "../../shared/code-block.component";
import {
  FrameworkService,
  type Framework,
} from "../../shared/framework.service";
import { SITE, storybookUrl } from "../../site.config";
import { SKINS } from "../../theme/theme.service";

const FEATURES = [
  { key: "tokens", icon: "sliders" },
  { key: "skins", icon: "sun" },
  { key: "a11y", icon: "eye" },
  { key: "signals", icon: "zap" },
  { key: "fonts", icon: "type" },
  { key: "frameworks", icon: "code" },
] as const satisfies readonly {
  key: string;
  icon: ShellIcon;
}[];

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
    SoneLogoComponent,
    SoneSparklineComponent,
    SONE_TOGGLE_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./home.page.html",
  styleUrl: "./home.page.scss",
})
export default class HomePage {
  protected readonly i18n = inject(I18n);
  protected readonly features = FEATURES;
  protected readonly site = SITE;
  protected readonly storybook = storybookUrl();
  protected readonly snippets = {
    install: SNIPPETS["install"]!,
    angularStylesLine: SNIPPETS["angularStylesLine"]!,
    installVue: SNIPPETS["installVue"]!,
    nuxtConfig: SNIPPETS["nuxtConfig"]!,
    installReact: SNIPPETS["installReact"]!,
    reactStyles: SNIPPETS["reactStyles"]!,
  };
  protected readonly frameworkTabs = [
    { value: "angular" },
    { value: "vue" },
    { value: "react" },
  ] as const;
  private readonly frameworks = inject(FrameworkService);
  protected readonly tab = this.frameworks.framework;

  // Hero preview data: a small app on the islands.
  protected readonly navItems: readonly {
    label: string;
    icon: ShellIcon;
    badge?: number;
    active?: boolean;
  }[] = [
    { label: "Home", icon: "layout-grid" },
    { label: "Inbox", icon: "mail", badge: 3 },
    { label: "Agents", icon: "sparkles" },
    { label: "Insights", icon: "analytics", active: true },
    { label: "Meetings", icon: "meetings" },
  ];
  protected readonly projects = [
    { label: "Agent Project", tone: "--chart-1" },
    { label: "Billing migration", tone: "--chart-2" },
    { label: "Onboarding v2", tone: "--chart-3" },
  ];
  protected readonly ranges = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "year", label: "Year" },
  ];
  protected readonly range = signal("30d");
  protected readonly tiles = [
    {
      label: "Runs",
      value: "89k",
      delta: "+12.4%",
      down: false,
      spark: [4, 6, 5, 8, 7, 9, 8, 11, 10, 12],
    },
    {
      label: "Success rate",
      value: "96.2%",
      delta: "+0.8%",
      down: false,
      spark: [7, 8, 8, 9, 8, 9, 9, 10, 9, 10],
    },
    {
      label: "Failed runs",
      value: "3.4k",
      delta: "-6.2%",
      down: true,
      spark: [9, 10, 8, 7, 8, 6, 6, 5, 6, 4],
    },
  ];
  protected readonly topics: SoneBarListItem[] = [
    { key: "roadmap", label: "Roadmap", value: 9, tone: "chart-1" },
    { key: "hiring", label: "Hiring", value: 6, tone: "chart-2" },
    { key: "launch", label: "Launch", value: 4, tone: "chart-3" },
  ];
  protected readonly stats = {
    components: CATALOG.length,
    symbols: SYMBOL_COUNT,
    skins: SKINS.length,
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

  protected pick(tab: Framework): void {
    this.frameworks.set(tab);
  }

  constructor() {
    afterNextRender(() => this.frameworks.restore());
    pageSeo((m) => ({
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
          runtimePlatform: ["Angular", "Vue", "Nuxt", "React", "Next.js"],
          keywords: [
            "design system",
            "component library",
            "Angular",
            "Vue",
            "Nuxt",
            "React",
            "Next.js",
            "design tokens",
            "accessibility",
          ],
          version: SITE.version,
          hasPart: [
            "@surface-one/angular",
            "@surface-one/vue",
            "@surface-one/react",
            "@surface-one/tokens",
          ].map((name) => ({ "@type": "SoftwareSourceCode", name })),
        },
      ],
    }));
  }
}
