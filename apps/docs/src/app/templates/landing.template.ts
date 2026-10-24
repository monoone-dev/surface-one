import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneAvatarGroupComponent } from "@surface-one/angular/avatar-group";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_PAGE_FOOTER_PARTS } from "@surface-one/angular/page-footer";
import { SONE_PAGE_HERO_PARTS } from "@surface-one/angular/page-hero";
import { SONE_PAGE_SECTION_PARTS } from "@surface-one/angular/page-section";
import { SONE_PAGE_SITE_HEADER_PARTS } from "@surface-one/angular/page-site-header";
import { SONE_PRICING_PLAN_PARTS } from "@surface-one/angular/pricing-plan";

import {
  FEATURES,
  FOOTER_COLUMNS,
  HERO_LINKS,
  NAV,
  PEOPLE,
  PLANS,
  SUMMARY,
} from "./data/landing";

@Component({
  selector: "docs-landing-template",
  imports: [
    ...SONE_CARD_PARTS,
    ...SONE_PAGE_FOOTER_PARTS,
    ...SONE_PAGE_HERO_PARTS,
    ...SONE_PAGE_SECTION_PARTS,
    ...SONE_PAGE_SITE_HEADER_PARTS,
    ...SONE_PRICING_PLAN_PARTS,
    SoneAvatarGroupComponent,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="landing">
      <sone-page-site-header title="Northwind Notes" href="#top">
        <nav sonePageSiteHeaderNav aria-label="Product" class="landing-nav">
          @for (link of nav; track link.href) {
            <a [href]="link.href">{{ link.label }}</a>
          }
        </nav>
        <div sonePageSiteHeaderActions class="landing-actions">
          <a soneBtn variant="ghost" size="sm" href="#signin">Sign in</a>
          <a soneBtn size="sm" href="#signup">Get started</a>
        </div>
        <nav sonePageSiteHeaderMenu aria-label="Product" class="landing-menu">
          @for (link of nav; track link.href) {
            <a [href]="link.href">{{ link.label }}</a>
          }
          <a href="#signin">Sign in</a>
        </nav>
      </sone-page-site-header>

      <sone-page-hero
        headline="New: follow-up reminders"
        title="Every meeting, written down and followed up"
        description="Northwind Notes records, transcribes and summarises your calls, then turns every decision into a reminder for the person who owns it."
        orientation="horizontal"
        [level]="2"
        [links]="heroLinks"
      >
        <div soneCard class="preview">
          <div soneCardHeader>
            <div class="preview-meta">
              <h3 soneCardTitle>Weekly product sync</h3>
              <span soneBadge variant="secondary">Summary ready</span>
            </div>
            <p soneCardDescription>Today · 32 min</p>
          </div>
          <div soneCardContent>
            <ul class="preview-list">
              @for (item of summary; track item) {
                <li><sone-icon icon="check" />{{ item }}</li>
              }
            </ul>
          </div>
          <div soneCardFooter>
            <sone-avatar-group
              ariaLabel="Attendees"
              size="sm"
              [people]="people"
              [max]="4"
            />
          </div>
        </div>
      </sone-page-hero>

      <sone-page-section
        id="features"
        headline="Features"
        title="Everything a meeting needs"
        description="From the first word to the last follow-up, without leaving the app."
        [features]="features"
      />

      <sone-page-section
        id="pricing"
        headline="Pricing"
        title="Simple plans that grow with you"
        description="Start free. Upgrade when your team does."
      >
        <sone-pricing-plans [plans]="plans" scale />
      </sone-page-section>

      <sone-page-footer
        ariaLabel="Northwind Notes"
        copyright="© 2026 Northwind Notes"
        [columns]="footerColumns"
      >
        <div sonePageFooterBrand>
          <span class="brand">Northwind Notes</span>
          <span>Meeting notes that write themselves.</span>
        </div>
        <a
          sonePageFooterRight
          soneBtn
          variant="ghost"
          size="icon-sm"
          href="#newsletter"
          aria-label="Newsletter"
        >
          <sone-icon icon="mail" />
        </a>
      </sone-page-footer>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  styleUrl: "./styles/landing.css",
})
export default class Template {
  protected readonly nav = NAV;
  protected readonly heroLinks = HERO_LINKS;
  protected readonly people = PEOPLE;
  protected readonly summary = SUMMARY;
  protected readonly features = FEATURES;
  protected readonly plans = PLANS;
  protected readonly footerColumns = FOOTER_COLUMNS;
}
