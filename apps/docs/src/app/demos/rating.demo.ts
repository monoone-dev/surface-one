import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneRatingComponent } from "@surface-one/angular/rating";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <sone-rating [value]="4.5" readonly size="sm" ariaLabel="Average rating" />
    <span class="text-hint">4.5 · 128 reviews</span>
  </div>
  <div soneField>
    <span soneFieldLabel id="demo-rating-label">Your rating</span>
    <sone-rating [(value)]="score" clearable ariaLabel="Your rating" />
    <p soneFieldDescription>{{ score() ? score() + ' of 5' : 'Not rated yet' }} · choose the same star again to clear.</p>
  </div>
  <div class="demo-row">
    <sone-rating [value]="3" readonly size="sm" />
    <sone-rating [value]="3" readonly />
    <sone-rating [value]="3" readonly size="lg" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-rating-demo",
  imports: [SoneRatingComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RatingDemo {
  readonly score = signal(0);
}
