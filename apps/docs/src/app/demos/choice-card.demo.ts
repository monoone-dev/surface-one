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
