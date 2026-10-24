import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SonePaginationComponent } from "@surface-one/angular/pagination";

const TEMPLATE = `<div class="demo-stack">
  <sone-pagination [(page)]="page" [total]="240" [pageSize]="20" />
  <p class="text-hint" style="text-align: center">Showing page {{ page() }} of 12</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-pagination-demo",
  imports: [SonePaginationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PaginationDemo {
  readonly page = signal(5);
}
