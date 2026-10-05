import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneButtonDirective } from "@surface-one/angular/button";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";

@Component({
  selector: "docs-not-found-page",
  imports: [RouterLink, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-narrow not-found">
      <p class="eyebrow">404</p>
      <h1 class="page-title">{{ i18n.m().notFound.title }}</h1>
      <p class="page-lead">{{ i18n.m().notFound.description }}</p>
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
  private readonly seo = inject(Seo);

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.notFound.title,
        description: m.notFound.description,
        path: "/404",
        noindex: true,
      });
    });
  }
}
