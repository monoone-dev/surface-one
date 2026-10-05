import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from "@angular/core";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import {
  SONE_TOGGLE_PARTS,
  type ToggleOrientation,
  type ToggleSize,
  type ToggleVariant,
} from "@surface-one/angular/toggle-group";

export interface SegmentOption {
  readonly value: string;
  readonly label: string;
  readonly icon?: ShellIcon;
  readonly iconOnly?: boolean;
  readonly disabled?: boolean;
}

@Component({
  selector: "sone-segmented",
  host: { "data-slot": "segmented" },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneIconComponent, ...SONE_TOGGLE_PARTS],
  templateUrl: "./segmented.component.html",
  styleUrl: "./segmented.component.scss",
})
export class SoneSegmentedComponent {
  readonly options = input.required<readonly SegmentOption[]>();
  readonly ariaLabel = input<string | null>(null);
  readonly size = input<ToggleSize>("default");
  readonly variant = input<ToggleVariant>("outline");
  readonly orientation = input<ToggleOrientation>("horizontal");

  readonly value = model("");

  select(v: string): void {
    this.value.set(v);
  }
}
