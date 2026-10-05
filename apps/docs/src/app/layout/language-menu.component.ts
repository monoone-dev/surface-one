import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { I18n } from "../i18n/i18n.service";
import { LOCALES, localizePath } from "../i18n/locales";
import { currentPath } from "../shared/current-path";

/**
 * The language switcher: a disclosure button over a list of real links (one per
 * locale, with `hreflang` and `lang`), so crawlers and no-JS readers can follow
 * them too. Escape and an outside click close it.
 */
@Component({
  selector: "docs-language-menu",
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:click)": "onDocumentClick($event)",
    "(keydown.escape)": "close(true)",
  },
  template: `
    <button
      #trigger
      type="button"
      class="lang-trigger btn"
      data-variant="ghost"
      data-size="sm"
      aria-haspopup="true"
      [attr.aria-expanded]="open()"
      aria-controls="language-list"
      (click)="open.set(!open())"
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6.25" />
        <path
          d="M1.75 8h12.5M8 1.75c1.7 1.8 2.5 3.9 2.5 6.25S9.7 12.45 8 14.25C6.3 12.45 5.5 10.35 5.5 8S6.3 3.55 8 1.75Z"
        />
      </svg>
      <span class="sr-only">{{ i18n.m().a11y.language }}:</span>
      <span>{{ i18n.locale().name }}</span>
    </button>
    <ul
      id="language-list"
      class="lang-list"
      [hidden]="!open()"
      [attr.aria-label]="i18n.m().a11y.language"
    >
      @for (l of locales; track l.code) {
        <li>
          <a
            [routerLink]="hrefFor(l.code)"
            [attr.hreflang]="l.tag"
            [attr.lang]="l.tag"
            [attr.aria-current]="l.code === i18n.code() ? 'true' : null"
            (click)="close(false)"
            >{{ l.name }}</a
          >
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      position: relative;
      display: inline-block;
    }
    .lang-trigger {
      gap: var(--space-1);
    }
    .lang-list {
      position: absolute;
      inset-inline-end: 0;
      top: calc(100% + 6px);
      z-index: var(--z-dropdown);
      min-width: 11rem;
      margin: 0;
      padding: 4px;
      list-style: none;
      background: var(--surface-overlay);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
    }
    .lang-list a {
      display: block;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }
    .lang-list a:hover,
    .lang-list a:focus-visible {
      background: var(--surface-hover);
    }
    .lang-list a[aria-current="true"] {
      font-weight: var(--font-weight-semibold);
    }
    .lang-list a[aria-current="true"]::after {
      content: " ✓";
    }
  `,
})
export class LanguageMenuComponent {
  protected readonly i18n = inject(I18n);
  protected readonly locales = LOCALES;
  protected readonly open = signal(false);
  private readonly path = currentPath();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected hrefFor(code: (typeof LOCALES)[number]["code"]): string {
    return localizePath(this.path(), code);
  }

  protected onDocumentClick(event: Event): void {
    if (
      this.open() &&
      !this.host.nativeElement.contains(event.target as Node)
    ) {
      this.open.set(false);
    }
  }

  protected close(refocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    if (refocus) {
      this.host.nativeElement
        .querySelector<HTMLButtonElement>("button")
        ?.focus();
    }
  }
}
