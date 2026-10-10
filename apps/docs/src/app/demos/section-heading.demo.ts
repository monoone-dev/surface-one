import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_SECTION_HEADING_PARTS } from "@surface-one/angular/section-heading";

const TEMPLATE = `<div class="demo-stack" style="max-width: 36rem">
  <sone-section-heading title="Meetings" [count]="24">
    <button soneSectionHeadingActions soneBtn variant="outline" size="sm" type="button">
      New meeting
    </button>
  </sone-section-heading>
  <sone-section-heading title="Pinned" [level]="3" [count]="3" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-section-heading-demo",
  imports: [SoneButtonDirective, ...SONE_SECTION_HEADING_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SectionHeadingDemo {}
