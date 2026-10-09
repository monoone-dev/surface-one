import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterEveryRender,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";

export interface SoneGraphControlsLabels {
  fit: string;
  fitLabel: string;
  zoomIn: string;
  zoomOut: string;
  list: string;
  listLabel: string;
}

const DEFAULT_LABELS: SoneGraphControlsLabels = {
  fit: $localize`:verb|Button that fits the graph to the view:Fit`,
  fitLabel: $localize`Fit graph to view`,
  zoomIn: $localize`Zoom in`,
  zoomOut: $localize`Zoom out`,
  list: $localize`:Button that shows the graph nodes as a list:List`,
  listLabel: $localize`Show nodes as a list`,
};

/**
 * The overlay toolbar of a graph: an info panel (legend, counts — projected) and
 * Fit / zoom out / zoom readout / zoom in, plus an optional list toggle. One tab
 * stop; arrow keys, Home and End move between the buttons (WAI-ARIA toolbar).
 */
@Component({
  selector: "sone-graph-controls",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective],
  templateUrl: "./graph-controls.component.html",
  styleUrl: "./graph-controls.component.scss",
  host: {
    "data-slot": "graph-controls",
    role: "toolbar",
    "[attr.aria-label]": "label()",
    "(keydown)": "onKeydown($event)",
    "(focusin)": "onFocusIn($event)",
  },
})
export class SoneGraphControlsComponent {
  /** Accessible name of the toolbar. */
  readonly label = input.required<string>();
  /** The zoom readout, in percent of the fitted view. */
  readonly zoomPct = input(100);
  /** `true` / `false` shows the list toggle pressed / not pressed; `null` hides it. */
  readonly list = input<boolean | null>(null);
  readonly labels = input<Partial<SoneGraphControlsLabels>>({});

  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly fit = output<void>();
  readonly listChange = output<boolean>();

  protected readonly text = computed<SoneGraphControlsLabels>(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));

  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private active = 0;

  constructor() {
    afterEveryRender(() => this.syncTabStops());
  }

  protected onKeydown(event: KeyboardEvent): void {
    const buttons = this.buttons();
    const at = buttons.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? (at + 1) % buttons.length
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? (at - 1 + buttons.length) % buttons.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons[next].focus();
  }

  protected onFocusIn(event: FocusEvent): void {
    const at = this.buttons().indexOf(event.target as HTMLButtonElement);
    if (at >= 0) {
      this.active = at;
      this.syncTabStops();
    }
  }

  private buttons(): HTMLButtonElement[] {
    return [
      ...this.host.querySelectorAll<HTMLButtonElement>(
        "[data-slot=graph-controls-actions] button",
      ),
    ];
  }

  private syncTabStops(): void {
    const buttons = this.buttons();
    this.active = Math.min(this.active, buttons.length - 1);
    buttons.forEach((b, i) => (b.tabIndex = i === this.active ? 0 : -1));
  }
}
