import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { I18n } from "../../i18n/i18n.service";
import { Seo } from "../../seo/seo.service";
import { TEMPLATE_SLUGS } from "../../templates/registry";

@Component({
  selector: "docs-templates-page",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1 class="page-title">{{ i18n.m().templates.title }}</h1>
      <p class="page-lead">
        {{ i18n.m().templates.description }} {{ i18n.m().templates.lead }}
      </p>
      <ul class="template-grid">
        @for (s of slugs; track s) {
          <li>
            <a
              class="link-card template-card"
              [routerLink]="i18n.link('/templates/' + s)"
            >
              <span class="thumb" [attr.data-template]="s" aria-hidden="true">
                <span></span><span></span><span></span>
              </span>
              <h2>{{ i18n.m().templates.items[s].title }}</h2>
              <p>{{ i18n.m().templates.items[s].description }}</p>
            </a>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    .template-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
      gap: var(--space-5);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .template-card h2 {
      margin: var(--space-3) 0 var(--space-1);
      font-size: var(--font-size-lg);
    }
    .template-card p {
      margin: 0;
      color: var(--text-secondary);
    }
    .thumb {
      display: grid;
      grid-template-columns: 1fr 3fr;
      grid-template-rows: 1fr 2fr;
      gap: 6px;
      height: 9rem;
      padding: 8px;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: var(--surface-base);
    }
    .thumb span {
      border-radius: var(--radius-sm);
      background: var(--surface-hover);
    }
    .thumb span:first-child {
      grid-row: 1 / 3;
    }
    .thumb[data-template="chat"] span:nth-child(3),
    .thumb[data-template="notes"] span:nth-child(2) {
      background: var(--accent-soft);
    }
    .thumb[data-template="settings"] {
      grid-template-columns: 1fr;
    }
    .thumb[data-template="settings"] span:first-child {
      grid-row: auto;
    }
    /* Login: one centred card. */
    .thumb[data-template="login"] {
      grid-template-columns: 1fr 1.4fr 1fr;
      grid-template-rows: 1fr;
    }
    .thumb[data-template="login"] span {
      background: transparent;
    }
    .thumb[data-template="login"] span:nth-child(2) {
      background: var(--surface-hover);
    }
    /* Sign up: a tinted promo half and the form. */
    .thumb[data-template="signup"] {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr;
    }
    .thumb[data-template="signup"] span:first-child {
      grid-row: auto;
      background: var(--accent-soft);
    }
    .thumb[data-template="signup"] span:nth-child(3) {
      display: none;
    }
    /* Form: stacked sections. */
    .thumb[data-template="form"] {
      grid-template-columns: 1fr 2fr;
      grid-template-rows: repeat(3, 1fr);
    }
    .thumb[data-template="form"] span:first-child {
      grid-row: 1 / 4;
      background: transparent;
      border-right: 1px dashed var(--border-subtle);
      border-radius: 0;
    }
    .thumb[data-template="form"] span:nth-child(3) {
      grid-column: 2;
      grid-row: 2 / 4;
    }
    /* Messages: a conversation list and the thread. */
    .thumb[data-template="messages"] {
      grid-template-rows: 2fr 1fr;
    }
    .thumb[data-template="messages"] span:nth-child(3) {
      grid-column: 2;
      background: var(--accent-soft);
    }
    /* Two sidebars: navigation, content, details. */
    .thumb[data-template="workspace"] {
      grid-template-columns: 1fr 3fr 1.4fr;
      grid-template-rows: 1fr;
    }
    .thumb[data-template="workspace"] span:first-child {
      grid-row: auto;
    }
    .thumb[data-template="workspace"] span:nth-child(3) {
      background: var(--accent-soft);
    }
    /* Markdown editor: a file list and a split write / preview pane. */
    .thumb[data-template="editor"] {
      grid-template-columns: 1fr 2fr 2fr;
      grid-template-rows: 1fr;
    }
    .thumb[data-template="editor"] span:first-child {
      grid-row: auto;
    }
    .thumb[data-template="editor"] span:nth-child(3) {
      background: var(--accent-soft);
    }
    /* Media: a recording list, the recorder and a wide timeline band. */
    .thumb[data-template="media"] {
      grid-template-rows: 2fr 1fr;
    }
    .thumb[data-template="media"] span:nth-child(3) {
      grid-column: 2;
      background: repeating-linear-gradient(
        90deg,
        var(--accent-soft) 0 6px,
        transparent 6px 9px
      );
    }
    /* Finances: a row of figures over a chart and a table. */
    .thumb[data-template="finances"] {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 2fr;
    }
    .thumb[data-template="finances"] span:first-child {
      grid-row: auto;
      grid-column: 1 / 4;
    }
    .thumb[data-template="finances"] span:nth-child(2) {
      grid-column: 1 / 3;
      background: repeating-linear-gradient(
        90deg,
        var(--accent-soft) 0 8px,
        transparent 8px 12px
      );
    }
    /* CRM: pipeline columns. */
    .thumb[data-template="crm"] {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr;
    }
    .thumb[data-template="crm"] span:first-child {
      grid-row: auto;
    }
    .thumb[data-template="crm"] span:nth-child(2) {
      background: var(--accent-soft);
    }
  `,
})
export default class TemplatesPage {
  protected readonly i18n = inject(I18n);
  private readonly seo = inject(Seo);
  protected readonly slugs = TEMPLATE_SLUGS;

  constructor() {
    effect(() => {
      const m = this.i18n.m();
      this.seo.set({
        title: m.templates.title,
        description: m.templates.description,
        path: "/templates",
        breadcrumbs: [
          { name: m.nav.home, path: "/" },
          { name: m.templates.title, path: "/templates" },
        ],
      });
    });
  }
}
