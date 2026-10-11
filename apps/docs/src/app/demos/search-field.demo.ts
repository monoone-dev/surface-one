import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <sone-search-field
    [(value)]="query"
    clearable
    placeholder="Search notes"
    ariaLabel="Search notes"
    (submit)="submitted.set($event)"
  />
  <p role="status" style="margin: 0; color: var(--text-secondary)">
    Searched for: {{ submitted() || "nothing yet" }}
  </p>

  <sone-search-field size="sm" placeholder="Filter" ariaLabel="Filter sources" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-search-field-demo",
  imports: [SoneSearchFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SearchFieldDemo {
  readonly query = signal("");
  readonly submitted = signal("");
}
