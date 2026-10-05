import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "sone-kbd",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "data-slot": "kbd" },
  templateUrl: "./kbd.component.html",
  styleUrl: "./kbd.component.scss",
})
export class SoneKbdComponent {}
