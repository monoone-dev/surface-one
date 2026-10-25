import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

import {
  CATALOG,
  CATEGORIES,
  type CatalogEntry,
  type Category,
} from "../../catalog/catalog";
import { I18n } from "../../i18n/i18n.service";
import { PageHeaderComponent } from "../../shared/page-header.component";
import { SectionNavComponent } from "../../shared/section-nav.component";
import { pageSeo, trail } from "../../seo/page-seo";

@Component({
  selector: "docs-components-page",
  imports: [
    RouterLink,
    PageHeaderComponent,
    SectionNavComponent,
    SoneIconComponent,
    SoneSearchFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-layout catalogue">
      <docs-section-nav
        [label]="i18n.m().components.title"
        [current]="i18n.m().components.title"
      >
        <h2>{{ i18n.m().components.title }}</h2>
        <ul>
          @for (c of categories; track c) {
            <li>
              <a [routerLink]="[]" [fragment]="'cat-' + c" class="cat-link">
                <sone-icon [icon]="icons[c]" size="sm" />
                <span>{{ i18n.m().components.categories[c].name }}</span>
                <span class="cat-count">{{ countIn(c) }}</span>
              </a>
            </li>
          }
        </ul>
      </docs-section-nav>

      <article>
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
              <span class="cat-icon" aria-hidden="true"
                ><sone-icon [icon]="icons[group.category]"
              /></span>
              {{ i18n.m().components.categories[group.category].name }}
            </h2>
            <p class="category-lead">
              {{ i18n.m().components.categories[group.category].description }}
            </p>
            <ul class="tiles" role="list">
              @for (e of group.entries; track e.slug) {
                <li>
                  <a
                    class="tile"
                    [routerLink]="i18n.link('/components/' + e.slug)"
                  >
                    <span class="tile-name">{{ e.name }}</span>
                    <span class="tile-text">{{ describe(e) }}</span>
                    <span class="tile-go" aria-hidden="true"
                      ><sone-icon icon="arrow-right" size="sm"
                    /></span>
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
      </article>
    </div>
  `,
  styles: `
    .cat-link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .cat-link span:first-of-type {
      flex: 1;
    }
    .cat-count {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
      font-variant-numeric: tabular-nums;
    }
    .filter {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-4);
      margin-bottom: var(--space-2);
    }
    .filter sone-search-field {
      width: min(100%, 24rem);
    }
    .filter-count {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .category {
      margin-top: var(--space-10);
      scroll-margin-top: var(--space-16);
    }
    .category h2 {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin: 0 0 var(--space-1);
      font-size: var(--font-size-xl);
      letter-spacing: var(--tracking-heading);
    }
    .cat-icon {
      display: inline-grid;
      place-items: center;
      width: var(--control-h-sm);
      height: var(--control-h-sm);
      border-radius: var(--radius-md);
      background: var(--accent-soft);
      color: var(--accent-text);
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
    /* Tiles: grey in Surface, ringed cards in a flat skin; they lift on hover. */
    .tiles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
      gap: var(--space-2);
    }
    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      height: 100%;
      padding: var(--space-4) var(--space-10) var(--space-4) var(--space-4);
      border: var(--border-width-thin) solid var(--card-sm-ring);
      border-radius: var(--radius-lg);
      background: var(--card-sm-bg);
      color: var(--text-primary);
      text-decoration: none;
      transition:
        background var(--transition),
        box-shadow var(--transition),
        border-color var(--transition);
    }
    .tile:hover {
      border-color: var(--border);
      background: var(--surface-base);
      box-shadow: var(--shadow-md);
    }
    .tile-name {
      font-weight: var(--font-weight-semibold);
    }
    .tile-text {
      display: -webkit-box;
      overflow: hidden;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      line-height: var(--leading-sm);
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
    .tile-go {
      position: absolute;
      display: inline-flex;
      top: var(--space-4);
      right: var(--space-4);
      color: var(--text-muted);
      transition: transform var(--transition-fast);
    }
    .tile:hover .tile-go {
      color: var(--text-primary);
      transform: translateX(var(--space-0_5));
    }
    @media (prefers-reduced-motion: reduce) {
      .tile:hover .tile-go {
        transform: none;
      }
    }
  `,
})
export default class ComponentsPage {
  protected readonly i18n = inject(I18n);
  protected readonly query = signal("");
  protected readonly categories = CATEGORIES;
  /** One glyph per category: the rail, the headings. */
  protected readonly icons: Record<Category, ShellIcon> = {
    layout: "layout-grid",
    element: "square",
    form: "square-check",
    data: "analytics",
    navigation: "map",
    overlay: "layout-template",
    page: "document",
    chat: "message-square",
    editor: "edit",
    media: "audio-lines",
    flow: "workflow",
  };

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

  protected countIn(c: Category): number {
    return CATALOG.filter((e) => e.category === c).length;
  }

  protected describe(e: CatalogEntry): string {
    return (
      (this.i18n.m().components.entries as Record<string, string>)[e.slug] ?? ""
    );
  }
}
