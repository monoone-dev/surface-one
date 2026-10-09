import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_CHOICE_CARD_PARTS } from "@surface-one/angular/choice-card";

const TEMPLATE = `<div class="demo-stack" style="max-width: 36rem">
  <div soneChoiceGroup aria-label="Plan"
    style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--space-2)">
    <button soneChoiceCard type="button" [selected]="plan() === 'free'" (click)="plan.set('free')">
      <span soneChoiceCardTitle>Free</span>
      <span soneChoiceCardDescription>Up to 3 projects.</span>
      <span soneChoiceCardIndicator></span>
    </button>
    <button soneChoiceCard type="button" [selected]="plan() === 'team'" (click)="plan.set('team')">
      <span soneChoiceCardTitle>Team</span>
      <span soneChoiceCardDescription>Unlimited projects and shared spaces.</span>
      <span soneChoiceCardIndicator></span>
    </button>
    <button soneChoiceCard type="button" disabled>
      <span soneChoiceCardTitle>Enterprise</span>
      <span soneChoiceCardDescription>Contact sales to enable.</span>
      <span soneChoiceCardIndicator></span>
    </button>
  </div>
  <button soneChoiceCard type="button" orientation="horizontal" [selected]="reminders()"
    (click)="reminders.set(!reminders())">
    <span style="display: grid; gap: var(--choice-card-gap)">
      <span soneChoiceCardTitle>Email reminders</span>
      <span soneChoiceCardDescription>A standalone card toggles on click.</span>
    </span>
    <span soneChoiceCardIndicator></span>
  </button>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
} from "@surface-one/vue";

const plan = ref("team");
const reminders = ref(false);
</script>

<template>
  <div class="demo-stack" style="max-width: 36rem">
    <SoneChoiceGroup
      aria-label="Plan"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--space-2)"
    >
      <SoneChoiceCard type="button" :selected="plan === 'free'" @click="plan = 'free'">
        <SoneChoiceCardTitle>Free</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Up to 3 projects.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
      <SoneChoiceCard type="button" :selected="plan === 'team'" @click="plan = 'team'">
        <SoneChoiceCardTitle>Team</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Unlimited projects and shared spaces.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
      <SoneChoiceCard type="button" disabled>
        <SoneChoiceCardTitle>Enterprise</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Contact sales to enable.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
    </SoneChoiceGroup>
    <SoneChoiceCard type="button" orientation="horizontal" :selected="reminders" @click="reminders = !reminders">
      <span style="display: grid; gap: var(--choice-card-gap)">
        <SoneChoiceCardTitle>Email reminders</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>A standalone card toggles on click.</SoneChoiceCardDescription>
      </span>
      <SoneChoiceCardIndicator />
    </SoneChoiceCard>
  </div>
</template>
`;

@Component({
  selector: "docs-choice-card-demo",
  imports: [...SONE_CHOICE_CARD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ChoiceCardDemo {
  readonly plan = signal("team");
  readonly reminders = signal(false);
}
