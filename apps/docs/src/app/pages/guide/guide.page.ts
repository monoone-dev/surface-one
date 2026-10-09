import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { ProseComponent, slugify } from "../../shared/prose.component";
import { SectionNavComponent } from "../../shared/section-nav.component";

type GuideSlug = keyof ReturnType<I18n["m"]>["guide"]["pages"];

@Component({
  selector: "docs-guide-page",
  imports: [RouterLink, ProseComponent, SectionNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-layout guide-layout">
      <docs-section-nav
        [label]="i18n.m().guide.title"
        [current]="page().title"
      >
        <h2>{{ i18n.m().guide.title }}</h2>
        <ul>
          @for (s of slugs(); track s) {
            <li>
              <a
                [routerLink]="i18n.link('/guide/' + s)"
                [attr.aria-current]="s === slug() ? 'page' : null"
                >{{ pages()[s].title }}</a
              >
            </li>
          }
        </ul>
      </docs-section-nav>

      @if (page(); as p) {
        <article>
          <nav class="breadcrumb" [attr.aria-label]="i18n.m().a11y.breadcrumb">
            <ol>
              <li>
                <a [routerLink]="i18n.link('/guide')">{{
                  i18n.m().guide.title
                }}</a>
              </li>
              <li aria-current="page">{{ p.title }}</li>
            </ol>
          </nav>
          <h1 class="page-title">{{ p.title }}</h1>
          <p class="page-lead">{{ p.description }}</p>

          @if (toc().length > 1) {
            <nav class="toc" [attr.aria-label]="i18n.m().a11y.onThisPage">
              <p class="toc-title">{{ i18n.m().a11y.onThisPage }}</p>
              <ul>
                @for (h of toc(); track h.id) {
                  <li>
                    <a [routerLink]="[]" [fragment]="h.id">{{ h.text }}</a>
                  </li>
                }
              </ul>
            </nav>
          }

          <docs-prose [blocks]="p.blocks" />

          <nav
            class="guide-pager"
            [attr.aria-label]="
              i18n.m().components.page.previous +
              ' / ' +
              i18n.m().components.page.next
            "
          >
            @if (prev(); as pr) {
              <a
                class="link-card"
                rel="prev"
                [routerLink]="i18n.link('/guide/' + pr)"
              >
                <p>←</p>
                <h3>{{ pages()[pr].title }}</h3>
              </a>
            } @else {
              <span></span>
            }
            @if (next(); as nx) {
              <a
                class="link-card next"
                rel="next"
                [routerLink]="i18n.link('/guide/' + nx)"
              >
                <p>→</p>
                <h3>{{ pages()[nx].title }}</h3>
              </a>
            }
          </nav>
        </article>
      }
    </div>
  `,
  styles: `
    .toc {
      margin: 0 0 var(--space-6);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
    }
    .toc-title {
      margin: 0 0 var(--space-1);
      font-weight: var(--font-weight-semibold);
    }
    .toc ul {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1) var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .toc a {
      color: var(--text-secondary);
    }
    .guide-pager {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
      margin-top: var(--space-8);
    }
    .guide-pager p {
      color: var(--text-secondary);
    }
    .next {
      text-align: end;
    }
  `,
})
export default class GuidePage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  readonly slug = input.required<string>();

  protected readonly pages = computed(
    () =>
      this.i18n.m().guide.pages as Record<
        string,
        ReturnType<I18n["m"]>["guide"]["pages"][GuideSlug]
      >,
  );
  protected readonly slugs = computed(() => Object.keys(this.pages()));
  protected readonly page = computed(() => this.pages()[this.slug()]);
  protected readonly toc = computed(() =>
    (this.page()?.blocks ?? []).flatMap((b) =>
      "h2" in b ? [{ id: slugify(b.h2), text: b.h2 }] : [],
    ),
  );
  private readonly index = computed(() => this.slugs().indexOf(this.slug()));
  protected readonly prev = computed(() => this.slugs()[this.index() - 1]);
  protected readonly next = computed(() => this.slugs()[this.index() + 1]);

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      const p = this.page();
      if (!p) return;
      this.seo.set({
        title: `${p.title} — ${m.guide.title}`,
        description: p.description,
        path: `/guide/${this.slug()}`,
        type: "article",
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.guide.title, path: "/guide/introduction" },
          { name: p.title, path: `/guide/${this.slug()}` },
        ],
      });
    });
  }
}
