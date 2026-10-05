import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { SoneLogoComponent } from "@surface-one/angular/logo";

import { I18n } from "../i18n/i18n.service";
import { SITE, storybookUrl } from "../site.config";

@Component({
  selector: "docs-footer",
  imports: [RouterLink, SoneLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-brand">
          <sone-logo size="sm" kind="mark" />
          <div>
            <p class="footer-name">{{ site.name }}</p>
            <p class="footer-muted">{{ i18n.m().meta.tagline }}</p>
            <p class="footer-muted">
              {{ i18n.m().footer.madeBy }} {{ i18n.m().footer.license }}
            </p>
          </div>
        </div>
        <nav [attr.aria-label]="i18n.m().footer.resources">
          <h2 class="footer-heading">{{ i18n.m().footer.resources }}</h2>
          <ul>
            <li>
              <a [routerLink]="i18n.link('/guide/installation')">{{
                i18n.m().guide.pages.installation.title
              }}</a>
            </li>
            <li>
              <a [routerLink]="i18n.link('/components')">{{
                i18n.m().nav.components
              }}</a>
            </li>
            <li>
              <a [routerLink]="i18n.link('/theme')">{{ i18n.m().nav.theme }}</a>
            </li>
            <li>
              <a [routerLink]="i18n.link('/templates')">{{
                i18n.m().nav.templates
              }}</a>
            </li>
            <li>
              <a [href]="storybook">{{ i18n.m().nav.storybook }}</a>
            </li>
          </ul>
        </nav>
        <nav [attr.aria-label]="i18n.m().footer.project">
          <h2 class="footer-heading">{{ i18n.m().footer.project }}</h2>
          <ul>
            <li>
              <a [routerLink]="i18n.link('/release')">{{
                i18n.m().footer.changelog
              }}</a>
            </li>
            <li>
              <a [routerLink]="i18n.link('/guide/contributing')">{{
                i18n.m().footer.contributing
              }}</a>
            </li>
            <li>
              <a [href]="site.repository" target="_blank" rel="noopener"
                >{{ i18n.m().nav.github
                }}<span class="sr-only">
                  {{ i18n.m().a11y.externalLink }}</span
                ></a
              >
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  `,
  styles: `
    .site-footer {
      margin-top: var(--space-16, 4rem);
      border-top: 1px solid var(--border);
    }
    .site-footer-inner {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: var(--space-8);
      max-width: var(--docs-max, 90rem);
      margin: 0 auto;
      padding: var(--space-10, 2.5rem) var(--space-4);
    }
    .footer-brand {
      display: flex;
      gap: var(--space-3);
    }
    .footer-name {
      margin: 0;
      font-weight: var(--font-weight-semibold);
    }
    .footer-muted {
      margin: 0;
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
    .footer-heading {
      margin: 0 0 var(--space-2);
      font-size: var(--font-size-sm);
    }
    ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--font-size-sm);
    }
    a {
      color: var(--text-secondary);
    }
    a:hover {
      color: var(--text-primary);
    }
    @media (max-width: 720px) {
      .site-footer-inner {
        grid-template-columns: 1fr 1fr;
      }
      .footer-brand {
        grid-column: 1 / -1;
      }
    }
  `,
})
export class FooterComponent {
  protected readonly i18n = inject(I18n);
  protected readonly site = SITE;
  protected readonly storybook = storybookUrl();
}
