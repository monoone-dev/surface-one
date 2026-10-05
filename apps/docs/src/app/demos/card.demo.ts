import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start">
  <section soneCard style="width: 22rem">
    <header soneCardHeader>
      <h3 soneCardTitle>Storage</h3>
      <p soneCardDescription>Recordings kept on this device.</p>
      <button soneCardAction soneBtn variant="ghost" size="sm" type="button">Reveal</button>
    </header>
    <div soneCardContent>12.4 GB of 20 GB used across 38 recordings.</div>
    <footer soneCardFooter>
      <button soneBtn variant="outline" size="sm" type="button">Free up space</button>
      <button soneBtn variant="ghost" size="sm" type="button">Settings</button>
    </footer>
  </section>

  <section soneCard size="sm" style="width: 18rem">
    <header soneCardHeader>
      <h3 soneCardTitle>Weekly sync</h3>
      <p soneCardDescription>Tuesday 14:00 · 42 min</p>
    </header>
    <div soneCardContent>Ada Park will share the launch checklist on Friday.</div>
    <footer soneCardFooter>
      <button soneBtn size="sm" type="button">Open note</button>
    </footer>
  </section>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-card-demo",
  imports: [...SONE_CARD_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CardDemo {}
