import { ChangeDetectionStrategy, Component, input } from "@angular/core";

/**
 * A docs page's heading: the one `<h1>` and the lead paragraph under it (the global
 * `.page-title` / `.page-lead` styles). The host is `display: contents`, so the two
 * elements lay out exactly as if the page wrote them itself.
 */
@Component({
  selector: "docs-page-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 class="page-title">{{ title() }}</h1>
    @if (lead()) {
      <p class="page-lead">{{ lead() }}</p>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly lead = input("");
}
