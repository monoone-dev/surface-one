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
import { SoneAvatarGroupComponent } from "@surface-one/angular/avatar-group";
import { SoneCheckboxDirective } from "@surface-one/angular/checkbox";
import {
  SoneFieldDirective,
  SoneFieldLabelDirective,
} from "@surface-one/angular/input";
import { SoneSliderComponent } from "@surface-one/angular/slider";
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
    SoneAvatarGroupComponent,
    SoneCheckboxDirective,
    SoneFieldDirective,
    SoneFieldLabelDirective,
    SoneSliderComponent,
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

  // Hero montage data.
  protected readonly spark = [3, 5, 4, 7, 6, 9, 8, 11, 9, 12, 10, 14, 13, 16];
  protected readonly notifications = [
    { label: "Mentions", hint: "When someone tags you", on: true },
    { label: "Weekly digest", hint: "Every Monday at 9:00", on: true },
    { label: "Product news", hint: "Once a month", on: false },
  ];
  protected readonly team: readonly {
    name: string;
    email: string;
    initials: string;
    role: string;
    variant: "secondary" | "outline" | "accent";
  }[] = [
    {
      name: "Ada Park",
      email: "ada@northwind.dev",
      initials: "AP",
      role: "Owner",
      variant: "accent",
    },
    {
      name: "Leo Ruiz",
      email: "leo@northwind.dev",
      initials: "LR",
      role: "Editor",
      variant: "secondary",
    },
    {
      name: "Mina Sato",
      email: "mina@northwind.dev",
      initials: "MS",
      role: "Viewer",
      variant: "outline",
    },
  ];

  // Component wall.
  protected readonly volume = signal(40);

  // Templates to start from.
  protected readonly templateLinks: readonly {
    slug:
      "dashboard" | "chat" | "settings" | "messages" | "workspace" | "finances";
    icon: ShellIcon;
  }[] = [
    { slug: "dashboard", icon: "dashboards" },
    { slug: "chat", icon: "message-square" },
    { slug: "workspace", icon: "layout-grid" },
    { slug: "messages", icon: "mail" },
    { slug: "settings", icon: "settings" },
    { slug: "finances", icon: "wallet" },
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
