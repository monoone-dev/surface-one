import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
} from "@angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  clampPage,
  paginationPageCount,
  paginationRange,
} from "./pagination-range";
import { SonePaginationEllipsisComponent } from "./pagination.directive";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v);

/**
 * `<sone-pagination>` — page buttons drawn from a page count: Previous, the first and
 * last pages, `siblings` pages around the current one with ellipses for the gaps, and
 * Next. Two-way `[(page)]` (1-based); the count is `pageCount`, or `total` items at
 * `pageSize` a page.
 */
@Component({
  selector: "sone-pagination",
  imports: [SoneIconComponent, SonePaginationEllipsisComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./pagination.component.html",
})
export class SonePaginationComponent {
  /** The current page, 1-based. */
  readonly page = model(1);
  /** How many items there are; with `pageSize` it gives the page count. */
  readonly total = input(0, { transform: numberAttribute });
  readonly pageSize = input(10, { transform: numberAttribute });
  /** The page count, when you know it (wins over `total` / `pageSize`). */
  readonly pageCount = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** Pages shown on each side of the current one. */
  readonly siblings = input(1, { transform: numberAttribute });
  /** Pages always shown at each end. */
  readonly boundaries = input(1, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input($localize`:Pagination navigation:Pagination`, {
    alias: "aria-label",
  });
  readonly previousLabel = input($localize`:Previous page button:Previous`);
  readonly nextLabel = input($localize`:Next page button:Next`);

  protected readonly previousAriaLabel = $localize`Go to previous page`;
  protected readonly nextAriaLabel = $localize`Go to next page`;

  readonly count = computed(
    () =>
      this.pageCount() ?? paginationPageCount(this.total(), this.pageSize()),
  );
  readonly current = computed(() => clampPage(this.page(), this.count()));
  protected readonly items = computed(() =>
    paginationRange({
      page: this.current(),
      pageCount: this.count(),
      siblings: this.siblings(),
      boundaries: this.boundaries(),
    }).map((item) =>
      typeof item === "number"
        ? { key: String(item), page: item }
        : { key: item, page: null },
    ),
  );

  /** Moves to `page` (clamped); does nothing while disabled or already there. */
  go(page: number): void {
    const next = clampPage(page, this.count());
    if (this.disabled() || next === this.current()) return;
    this.page.set(next);
  }
}
