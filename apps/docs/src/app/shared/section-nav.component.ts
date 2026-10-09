import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { SoneIconComponent } from "@surface-one/angular/icon";

let nextId = 0;

/**
 * The left rail of a docs section. On a wide screen it is the sticky sidebar; at 960px and
 * below it collapses into a dropdown whose button names the current page, and closes again
 * after every navigation or on Escape.
 */
@Component({
  selector: "docs-section-nav",
  imports: [SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "section-nav",
    "[attr.data-open]": "open() ? 'true' : 'false'",
    "(keydown.escape)": "close(true)",
  },
  template: `
    <button
      #toggle
      type="button"
      class="section-nav-toggle"
      [attr.aria-expanded]="open()"
      [attr.aria-controls]="bodyId"
      (click)="open.set(!open())"
    >
      <span class="section-nav-toggle-text">
        <span class="section-nav-toggle-eyebrow">{{ label() }}</span>
        <span class="section-nav-toggle-current">{{
          current() || label()
        }}</span>
      </span>
      <sone-icon icon="chevron-right" class="section-nav-chevron" />
    </button>
    <nav [id]="bodyId" class="section-nav-body" [attr.aria-label]="label()">
      <ng-content />
    </nav>
  `,
})
export class SectionNavComponent {
  readonly label = input.required<string>();
  readonly current = input<string>("");

  protected readonly open = signal(false);
  protected readonly bodyId = `section-nav-${nextId++}`;
  private readonly toggle = viewChild<ElementRef<HTMLButtonElement>>("toggle");

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.open.set(false));
  }

  protected close(refocus: boolean): void {
    if (!this.open()) return;
    this.open.set(false);
    if (refocus) this.toggle()?.nativeElement.focus();
  }
}
