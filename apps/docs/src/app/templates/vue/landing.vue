<script setup lang="ts">
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
} from "@surface-one/vue";

import {
  FEATURES,
  FOOTER_COLUMNS,
  HERO_LINKS,
  NAV,
  PEOPLE,
  PLANS,
  SUMMARY,
} from "../data/landing";
</script>

<template>
  <div class="landing">
    <SonePageSiteHeader title="Northwind Notes" href="#top">
      <template #nav>
        <nav aria-label="Product" class="landing-nav">
          <a v-for="link in NAV" :key="link.href" :href="link.href">{{
            link.label
          }}</a>
        </nav>
      </template>
      <template #actions>
        <div class="landing-actions">
          <SoneButton as="a" variant="ghost" size="sm" href="#signin"
            >Sign in</SoneButton
          >
          <SoneButton as="a" size="sm" href="#signup">Get started</SoneButton>
        </div>
      </template>
      <template #menu>
        <nav aria-label="Product" class="landing-menu">
          <a v-for="link in NAV" :key="link.href" :href="link.href">{{
            link.label
          }}</a>
          <a href="#signin">Sign in</a>
        </nav>
      </template>
    </SonePageSiteHeader>

    <SonePageHero
      headline="New: follow-up reminders"
      title="Every meeting, written down and followed up"
      description="Northwind Notes records, transcribes and summarises your calls, then turns every decision into a reminder for the person who owns it."
      orientation="horizontal"
      :level="2"
      :links="HERO_LINKS"
    >
      <SoneCard class="preview">
        <SoneCardHeader>
          <div class="preview-meta">
            <SoneCardTitle>Weekly product sync</SoneCardTitle>
            <SoneBadge variant="secondary">Summary ready</SoneBadge>
          </div>
          <SoneCardDescription>Today · 32 min</SoneCardDescription>
        </SoneCardHeader>
        <SoneCardContent>
          <ul class="preview-list">
            <li v-for="item in SUMMARY" :key="item">
              <SoneIcon icon="check" />{{ item }}
            </li>
          </ul>
        </SoneCardContent>
        <SoneCardFooter>
          <SoneAvatarGroup
            aria-label="Attendees"
            size="sm"
            :people="PEOPLE"
            :max="4"
          />
        </SoneCardFooter>
      </SoneCard>
    </SonePageHero>

    <SonePageSection
      id="features"
      headline="Features"
      title="Everything a meeting needs"
      description="From the first word to the last follow-up, without leaving the app."
      :features="FEATURES"
    />

    <SonePageSection
      id="pricing"
      headline="Pricing"
      title="Simple plans that grow with you"
      description="Start free. Upgrade when your team does."
    >
      <SonePricingPlans :plans="PLANS" scale />
    </SonePageSection>

    <SonePageFooter
      aria-label="Northwind Notes"
      copyright="© 2026 Northwind Notes"
      :columns="FOOTER_COLUMNS"
    >
      <template #brand>
        <span class="brand">Northwind Notes</span>
        <span>Meeting notes that write themselves.</span>
      </template>
      <template #right>
        <SoneButton
          as="a"
          variant="ghost"
          size="icon-sm"
          href="#newsletter"
          aria-label="Newsletter"
        >
          <SoneIcon icon="mail" />
        </SoneButton>
      </template>
    </SonePageFooter>
  </div>
</template>

<style scoped src="../styles/landing.css"></style>
