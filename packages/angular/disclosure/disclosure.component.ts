import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
} from "@angular/core";
import { soneId } from "@surface-one/angular/core";

@Component({
  selector: "sone-disclosure",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./disclosure.component.html",
  styleUrl: "./disclosure.component.scss",
})
export class SoneDisclosureComponent {
  readonly open = model(false);

  readonly disabled = input(false, { transform: booleanAttribute });

  readonly panelLabel = input<string | null>(null);

  readonly state = computed(() => (this.open() ? "open" : "closed"));

  private readonly uid = soneId("sone-disclosure");
  readonly panelId = `${this.uid}-panel`;
  readonly triggerId = `${this.uid}-trigger`;

  toggle(): void {
    if (this.disabled()) return;
    this.open.update((v) => !v);
  }
}
