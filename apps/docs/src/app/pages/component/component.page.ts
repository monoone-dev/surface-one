import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";

import { CATALOG, apiOf, entryBySlug } from "../../catalog/catalog";
import type { LoadedDemo } from "../../demos/registry";
import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { CodeBlockComponent } from "../../shared/code-block.component";
import { SITE, storybookUrl } from "../../site.config";
import { ComponentsNavComponent } from "../components/components-nav.component";

@Component({
  selector: "docs-component-page",
  imports: [
    NgComponentOutlet,
    RouterLink,
    SoneBadgeDirective,
    SoneButtonDirective,
    CodeBlockComponent,
    ComponentsNavComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./component.page.html",
  styleUrl: "./component.page.scss",
})
export default class ComponentPage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  readonly slug = input.required<string>();
  readonly demo = input<LoadedDemo | null>(null);

  protected readonly tab = signal<"preview" | "code">("preview");
  protected readonly entry = computed(() => entryBySlug(this.slug()));
  protected readonly api = computed(() => apiOf(this.slug()));
  protected readonly description = computed(
    () =>
      (this.i18n.m().components.entries as Record<string, string>)[
        this.slug()
      ] ?? "",
  );
  protected readonly symbols = computed(() =>
    (this.api()?.symbols ?? []).filter((s) => s.kind !== "pipe" || s.selector),
  );
  protected readonly importCode = computed(() => {
    const api = this.api();
    if (!api) return "";
    const names = api.symbols.map((s) => s.name);
    return `import {\n${names.map((n) => `  ${n},`).join("\n")}\n} from "${api.import}";`;
  });
  protected readonly storybook = computed(() =>
    storybookUrl(this.api()?.stories[0]?.id),
  );
  protected readonly sourceUrl = computed(
    () => `${SITE.repository}/tree/main/packages/angular/${this.slug()}`,
  );
  protected readonly neighbours = computed(() => {
    const i = CATALOG.findIndex((e) => e.slug === this.slug());
    return { prev: CATALOG[i - 1], next: CATALOG[i + 1] };
  });

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      const entry = this.entry();
      if (!entry) return;
      this.seo.set({
        title: `${entry.name} — ${m.components.categories[entry.category].name}`,
        description: this.description(),
        path: `/components/${entry.slug}`,
        type: "article",
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.components.title, path: "/components" },
          { name: entry.name, path: `/components/${entry.slug}` },
        ],
      });
    });
    effect(() => {
      this.slug();
      this.tab.set("preview");
    });
  }
}
