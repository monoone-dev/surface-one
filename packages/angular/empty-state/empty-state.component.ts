import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "sone-empty-state",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "empty-state", "data-slot": "empty" },
  templateUrl: "./empty-state.component.html",
  styleUrl: "./empty-state.component.scss",
})
export class SoneEmptyStateComponent {}
