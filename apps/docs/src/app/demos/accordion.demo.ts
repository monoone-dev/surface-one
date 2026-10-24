import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SONE_ACCORDION_PARTS,
  type AccordionValue,
} from "@surface-one/angular/accordion";

const TEMPLATE = `<sone-accordion collapsible [(value)]="open" style="max-width: 32rem">
  <sone-accordion-item value="shipping">
    <sone-accordion-trigger>What are your shipping options?</sone-accordion-trigger>
    <sone-accordion-content>
      Standard delivery takes 3–5 working days; express arrives the next day.
    </sone-accordion-content>
  </sone-accordion-item>
  <sone-accordion-item value="returns">
    <sone-accordion-trigger>What is your return policy?</sone-accordion-trigger>
    <sone-accordion-content>
      Return any unused item within 30 days for a full refund.
    </sone-accordion-content>
  </sone-accordion-item>
  <sone-accordion-item value="billing" disabled>
    <sone-accordion-trigger>Can I change my billing plan?</sone-accordion-trigger>
    <sone-accordion-content>Only workspace owners can change the plan.</sone-accordion-content>
  </sone-accordion-item>
</sone-accordion>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-accordion-demo",
  imports: [...SONE_ACCORDION_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AccordionDemo {
  readonly open = signal<AccordionValue>("shipping");
}
