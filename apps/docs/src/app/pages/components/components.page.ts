import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

import { CATALOG, CATEGORIES, type CatalogEntry } from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { PageHeaderComponent } from "../../shared/page-header.component";
import { pageSeo, trail } from "../../seo/page-seo";

@Component({
  selector: "docs-components-page",
  imports: [RouterLink, PageHeaderComponent, SoneSearchFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <docs-page-header
        [title]="i18n.m().components.title"
        [lead]="
          i18n.m().components.description + ' ' + i18n.m().components.lead
        "
      />

      <div class="filter needs-js">
        <sone-search-field
          inputId="component-filter"
          clearable
          [ariaLabel]="i18n.m().components.filterLabel"
          [placeholder]="i18n.m().components.filterPlaceholder"
          [clearLabel]="i18n.m().components.filterClear"
          [(value)]="query"
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
    .filter sone-search-field {
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
    pageSeo((m) => ({
      title: m.components.title,
      description: m.components.description,
      path: "/components",
      breadcrumbs: trail(m, { name: m.components.title, path: "/components" }),
    }));
  }

  protected describe(e: CatalogEntry): string {
    return (
      (this.i18n.m().components.entries as Record<string, string>)[e.slug] ?? ""
    );
  }
}
