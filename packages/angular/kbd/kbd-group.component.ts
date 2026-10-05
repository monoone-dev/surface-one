import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "sone-kbd-group",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "kbd-group" },
  templateUrl: "./kbd-group.component.html",
  styleUrl: "./kbd-group.component.scss",
})
export class SoneKbdGroupComponent {}
