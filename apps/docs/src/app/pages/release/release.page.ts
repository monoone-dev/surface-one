import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";

import { I18n } from "../../i18n/i18n.service";
import { inlineMarkup } from "../../i18n/inline";
import { Seo } from "../../seo/seo.service";

/** Versions newest first; the copy for each lives in the locale messages. */
export const RELEASES = [{ version: "0.1.0", date: "2026-10-05" }] as const;

@Component({
  selector: "docs-release-page",
  imports: [SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-narrow">
      <h1 class="page-title">{{ i18n.m().release.title }}</h1>
      <p class="page-lead">{{ i18n.m().release.lead }}</p>
      <ol class="releases">
        @for (r of releases(); track r.version; let first = $first) {
          <li class="release">
            <h2 [id]="'v' + r.version">
              v{{ r.version }}
              @if (first) {
                <span soneBadge variant="success">{{
                  i18n.m().release.latest
                }}</span>
              }
            </h2>
            <p class="release-meta">
              <time [attr.datetime]="r.date">{{ r.dateLabel }}</time> ·
              {{ r.title }}
            </p>
            <ul class="prose">
              @for (n of r.notes; track $index) {
                <li [innerHTML]="n"></li>
              }
            </ul>
          </li>
        }
      </ol>
    </div>
  `,
  styles: `
    .releases {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .release {
      padding: var(--space-6) 0;
      border-top: 1px solid var(--border);
    }
    .release h2 {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin: 0 0 var(--space-1);
      font-size: var(--font-size-xl);
    }
    .release-meta {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
  `,
})
export default class ReleasePage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);

  protected readonly releases = computed(() => {
    const m = this.i18n.m();
    const code = this.i18n.code();
    const fmt = new Intl.DateTimeFormat(this.i18n.locale().tag, {
      dateStyle: "long",
      timeZone: "UTC",
    });
    return RELEASES.map((r) => {
      const copy = (
        m.release.entries as Record<
          string,
          { title: string; notes: readonly string[] }
        >
      )[r.version];
      return {
        ...r,
        dateLabel: fmt.format(new Date(r.date + "T00:00:00Z")),
        title: copy?.title ?? "",
        notes: (copy?.notes ?? []).map((n) => inlineMarkup(n, code)),
      };
    });
  });

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.release.title,
        description: m.release.description,
        path: "/release",
      });
    });
  }
}
