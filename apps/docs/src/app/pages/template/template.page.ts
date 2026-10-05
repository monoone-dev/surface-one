import { NgComponentOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  type Type,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneButtonDirective } from "@surface-one/angular/button";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { SITE } from "../../site.config";
import { TEMPLATE_SLUGS, type TemplateSlug } from "../../templates/registry";

@Component({
  selector: "docs-template-page",
  imports: [NgComponentOutlet, RouterLink, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      @if (copy(); as c) {
        <nav class="breadcrumb" [attr.aria-label]="i18n.m().a11y.breadcrumb">
          <ol>
            <li>
              <a [routerLink]="i18n.link('/templates')">{{
                i18n.m().templates.title
              }}</a>
            </li>
            <li aria-current="page">{{ c.title }}</li>
          </ol>
        </nav>
        <h1 class="page-title">{{ c.title }}</h1>
        <p class="page-lead">{{ c.description }}</p>
        <div class="template-actions">
          <a
            soneBtn
            variant="outline"
            size="sm"
            [routerLink]="i18n.link('/templates')"
            >← {{ i18n.m().templates.back }}</a
          >
          <a
            soneBtn
            variant="ghost"
            size="sm"
            [href]="source()"
            target="_blank"
            rel="noopener"
          >
            {{ i18n.m().components.page.viewSource
            }}<span class="sr-only"> {{ i18n.m().a11y.externalLink }}</span>
          </a>
        </div>
        @if (screen(); as s) {
          <section
            class="template-frame"
            [attr.aria-label]="i18n.m().a11y.preview + ': ' + c.title"
          >
            <ng-container *ngComponentOutlet="s" />
          </section>
        }
      }
    </div>
  `,
  styles: `
    .template-actions {
      display: flex;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }
    .template-frame {
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface-base);
      box-shadow: var(--shadow-md);
    }
  `,
})
export default class TemplatePage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  readonly slug = input.required<string>();
  readonly screen = input<Type<unknown> | null>(null);

  protected readonly copy = computed(() =>
    (TEMPLATE_SLUGS as readonly string[]).includes(this.slug())
      ? this.i18n.m().templates.items[this.slug() as TemplateSlug]
      : null,
  );
  protected readonly source = computed(
    () =>
      `${SITE.repository}/blob/main/apps/docs/src/app/templates/${this.slug()}.template.ts`,
  );

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      const c = this.copy();
      if (!c) return;
      this.seo.set({
        title: `${c.title} — ${m.templates.title}`,
        description: c.description,
        path: `/templates/${this.slug()}`,
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.templates.title, path: "/templates" },
          { name: c.title, path: `/templates/${this.slug()}` },
        ],
      });
    });
  }
}
