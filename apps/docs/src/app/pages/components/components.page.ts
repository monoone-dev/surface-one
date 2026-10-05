import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { CATALOG, CATEGORIES, type CatalogEntry } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";

@Component({
  selector: "docs-components-page",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ i18n.m().components.title }}</h1>
      <p class="page-lead">
        {{ i18n.m().components.description }} {{ i18n.m().components.lead }}
      </p>

      <div class="filter needs-js">
        <label class="sr-only" for="component-filter">{{
          i18n.m().components.filterLabel
        }}</label>
        <input
          id="component-filter"
          type="search"
          autocomplete="off"
          [placeholder]="i18n.m().components.filterPlaceholder"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <p class="filter-count" aria-live="polite">
          {{ i18n.format(i18n.m().components.count, { count: total() }) }}
        </p>
      </div>

      @for (group of groups(); track group.category) {
        <section
          class="category"
          [attr.aria-labelledby]="'cat-' + group.category"
        >
          <h2 [id]="'cat-' + group.category">
            {{ i18n.m().components.categories[group.category].name }}
          </h2>
          <p class="category-lead">
            {{ i18n.m().components.categories[group.category].description }}
          </p>
          <ul class="card-grid" role="list">
            @for (e of group.entries; track e.slug) {
              <li>
                <a
                  class="link-card"
                  [routerLink]="i18n.link('/components/' + e.slug)"
                >
                  <h3>{{ e.name }}</h3>
                  <p>{{ describe(e) }}</p>
                </a>
              </li>
            }
          </ul>
        </section>
      } @empty {
        <p>
          {{ i18n.format(i18n.m().components.noResults, { query: query() }) }}
        </p>
      }
    </div>
  `,
  styles: `
    .filter {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-4);
    }
    .filter input {
      width: min(100%, 22rem);
    }
    .filter-count {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .category {
      margin-top: var(--space-8);
    }
    .category h2 {
      margin-bottom: var(--space-1);
      font-size: var(--font-size-xl);
    }
    .category-lead {
      margin: 0 0 var(--space-4);
      color: var(--text-secondary);
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
    }
  `,
})
export default class ComponentsPage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  protected readonly query = signal("");

  protected readonly groups = computed(() => {
    const q = this.query().trim().toLowerCase();
    const match = (e: CatalogEntry) =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.slug.includes(q) ||
      this.describe(e).toLowerCase().includes(q);
    return CATEGORIES.map((category) => ({
      category,
      entries: CATALOG.filter((e) => e.category === category && match(e)),
    })).filter((g) => g.entries.length > 0);
  });

  protected readonly total = computed(() =>
    this.groups().reduce((n, g) => n + g.entries.length, 0),
  );

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.components.title,
        description: m.components.description,
        path: "/components",
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.components.title, path: "/components" },
        ],
      });
    });
  }

  protected describe(e: CatalogEntry): string {
    return (
      (this.i18n.m().components.entries as Record<string, string>)[e.slug] ?? ""
    );
  }
}
