import {
  SoneAvatarGroup,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
  SoneIcon,
  SonePageFooter,
  SonePageHero,
  SonePageSection,
  SonePageSiteHeader,
  SonePricingPlans,
} from "@surface-one/react";

import {
  FEATURES,
  FOOTER_COLUMNS,
  HERO_LINKS,
  NAV,
  PEOPLE,
  PLANS,
  SUMMARY,
} from "../data/landing";

// The shared stylesheet (../styles/landing.css), prefixed with .tpl-landing.
import { css } from "../styles/scoped/landing.generated";

export default function LandingTemplate() {
  return (
    <div className="landing tpl-landing">
      <style>{css}</style>
      <SonePageSiteHeader
        title="Northwind Notes"
        href="#top"
        nav={
          <nav aria-label="Product" className="landing-nav">
            {NAV.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        }
        actions={
          <div className="landing-actions">
            <SoneButton as="a" variant="ghost" size="sm" href="#signin">
              Sign in
            </SoneButton>
            <SoneButton as="a" size="sm" href="#signup">
              Get started
            </SoneButton>
          </div>
        }
        menu={
          <nav aria-label="Product" className="landing-menu">
            {NAV.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#signin">Sign in</a>
          </nav>
        }
      />

      <SonePageHero
        headline="New: follow-up reminders"
        title="Every meeting, written down and followed up"
        description="Northwind Notes records, transcribes and summarises your calls, then turns every decision into a reminder for the person who owns it."
        orientation="horizontal"
        level={2}
        links={HERO_LINKS}
      >
        <SoneCard className="preview">
          <SoneCardHeader>
            <div className="preview-meta">
              <SoneCardTitle>Weekly product sync</SoneCardTitle>
              <SoneBadge variant="secondary">Summary ready</SoneBadge>
            </div>
            <SoneCardDescription>Today · 32 min</SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent>
            <ul className="preview-list">
              {SUMMARY.map((item) => (
                <li key={item}>
                  <SoneIcon icon="check" />
                  {item}
                </li>
              ))}
            </ul>
          </SoneCardContent>
          <SoneCardFooter>
            <SoneAvatarGroup
              ariaLabel="Attendees"
              size="sm"
              people={PEOPLE}
              max={4}
            />
          </SoneCardFooter>
        </SoneCard>
      </SonePageHero>

      <SonePageSection
        id="features"
        headline="Features"
        title="Everything a meeting needs"
        description="From the first word to the last follow-up, without leaving the app."
        features={FEATURES}
      />

      <SonePageSection
        id="pricing"
        headline="Pricing"
        title="Simple plans that grow with you"
        description="Start free. Upgrade when your team does."
      >
        <SonePricingPlans plans={PLANS} scale />
      </SonePageSection>

      <SonePageFooter
        ariaLabel="Northwind Notes"
        copyright="© 2026 Northwind Notes"
        columns={FOOTER_COLUMNS}
        brand={
          <>
            <span className="brand">Northwind Notes</span>
            <span>Meeting notes that write themselves.</span>
          </>
        }
        right={
          <SoneButton
            as="a"
            variant="ghost"
            size="icon-sm"
            href="#newsletter"
            aria-label="Newsletter"
          >
            <SoneIcon icon="mail" />
          </SoneButton>
        }
      />
    </div>
  );
}
