import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "sone-spinner",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "spinner" },
  templateUrl: "./spinner.component.html",
  styleUrl: "./spinner.component.scss",
})
export class SoneSpinnerComponent {
  readonly size = input(16);
  readonly label = input<string | null>($localize`Loading`);
}
