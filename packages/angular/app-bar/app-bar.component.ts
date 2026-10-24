import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  booleanAttribute,
  input,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { toHeadingLevel, type HeadingLevel } from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

/**
 * `<sone-app-bar>` — the top bar of a screen (the web twin of the React Native
 * `SoneAppBar`): an optional back button, the title as a real heading (`level`, default
 * 1) with a subtitle under it, and `[soneAppBarTrailing]` actions at the end. It renders
 * a `<header>`, so it is the page's banner when it sits outside `main`. `sticky` pins it
 * to the top of the scrolling page; its top padding clears the notch
 * (`env(safe-area-inset-top)`).
 *
 * `showBack` draws a back button that emits `(back)`; `backHref` makes it a link.
 */
@Component({
  selector: "sone-app-bar",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-bar.component.html",
  styleUrl: "./app-bar.component.scss",
  host: {
    "data-slot": "app-bar",
    "[attr.data-sticky]": "sticky() ? '' : null",
    // `title` is an input here, not the native tooltip attribute.
    "[attr.title]": "null",
  },
})
export class SoneAppBarComponent {
  readonly title = input.required<string>();
  /** A line under the title. */
  readonly subtitle = input<string | null>(null);
  /** The title's heading level, 1–6. */
  readonly level = input<HeadingLevel, unknown>(1, {
    transform: (v: unknown) => toHeadingLevel(v, 1),
  });
  /** Shows the back button, which emits `(back)`. */
  readonly showBack = input(false, { transform: booleanAttribute });
  /** Makes the back button a link to this URL (it shows without `showBack`). */
  readonly backHref = input<string | null>(null);
  /** The back button's accessible name. */
  readonly backLabel = input($localize`:Goes back to the previous screen:Back`);
  /** Pins the bar to the top of the scrolling page. */
  readonly sticky = input(false, { transform: booleanAttribute });

  /** The back button was pressed (not emitted for a `backHref` link). */
  readonly back = output<void>();
}

/** `[soneAppBarTrailing]` — what sits at the end of the bar: icon buttons, an avatar … */
@Directive({
  selector: "[soneAppBarTrailing]",
  host: { "data-slot": "app-bar-trailing" },
})
export class SoneAppBarTrailingDirective {}

export const SONE_APP_BAR_PARTS = [
  SoneAppBarComponent,
  SoneAppBarTrailingDirective,
] as const;
