import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";

const TEMPLATE = `<div sonePageHeader>
  <div sonePageHeaderContent>
    <p sonePageHeaderEyebrow>Workspace</p>
    <h3 sonePageHeaderTitle>Product planning</h3>
    <p sonePageHeaderDescription>
      Notes, decisions and follow-ups from the weekly planning meeting.
    </p>
  </div>
  <div sonePageHeaderActions>
    <button soneBtn type="button" variant="outline">Share</button>
    <button soneBtn type="button">New note</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-header-demo",
  imports: [...SONE_PAGE_HEADER_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageHeaderDemo {}
