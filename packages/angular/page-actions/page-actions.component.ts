import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from "@angular/core";

import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";

@Component({
  selector: "sone-page-actions",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "page-actions",
    "[attr.data-state]": "isOpen() ? 'open' : 'closed'",
  },
  imports: [SoneRowMenuComponent],
  templateUrl: "./page-actions.component.html",
  styleUrl: "./page-actions.component.scss",
})
export class SonePageActionsComponent {
  private readonly menu = viewChild(SoneRowMenuComponent);

  readonly status = input<string | null>(null);
  readonly label = input($localize`More actions`);
  readonly tooltip = input<string | null>(null);
  readonly disabled = input(false);
  readonly showMenu = input(true);
  readonly openChange = output<boolean>();

  readonly isOpen = computed(() => this.menu()?.isOpen() ?? false);

  close(): void {
    this.menu()?.close();
  }

  detachFromDocument(): void {
    this.menu()?.detachFromDocument();
  }
}
