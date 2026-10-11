import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneButtonDirective } from "@surface-one/angular/button";

import { I18n } from "../../i18n/i18n.service";
import { PageHeaderComponent } from "../../shared/page-header.component";
import { pageSeo } from "../../seo/page-seo";

@Component({
  selector: "docs-not-found-page",
  imports: [RouterLink, SoneButtonDirective, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-narrow not-found">
      <p class="eyebrow">404</p>
      <docs-page-header
        [title]="i18n.m().notFound.title"
        [lead]="i18n.m().notFound.description"
      />
      <a soneBtn [routerLink]="i18n.link('/')">{{ i18n.m().notFound.back }}</a>
    </div>
  `,
  styles: `
    .not-found {
      padding-block: var(--space-8);
      text-align: center;
    }
    .page-lead {
      margin-inline: auto;
    }
  `,
})
export default class NotFoundPage {
  protected readonly i18n = inject(I18n);

  constructor() {
    pageSeo((m) => ({
      title: m.notFound.title,
      description: m.notFound.description,
      path: "/404",
      noindex: true,
    }));
  }
}
