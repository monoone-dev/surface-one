import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";

let nextSecretFieldId = 0;

@Component({
  selector: "sone-secret-field",
  imports: [
    SoneBadgeDirective,
    SoneButtonDirective,
    SONE_FIELD_PARTS,
    SONE_INPUT_GROUP_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secret-field.component.html",
  styleUrl: "./secret-field.component.scss",
  host: {
    "data-slot": "secret-field",
    "[attr.data-state]": "state()",
  },
})
export class SoneSecretFieldComponent {
  readonly hasKey = input<boolean | null>(null);

  readonly busy = input(false);

  readonly error = input<string | null>(null);

  readonly label = input($localize`Status`);

  readonly placeholder = input("");

  readonly ariaLabel = input<string | null>(null);

  readonly help = input<string | null>(null);

  readonly setLabel = input($localize`Key set ✓`);
  readonly unsetLabel = input($localize`Not set`);

  readonly saveLabel = input($localize`Save key`);

  readonly autocomplete = input("off");

  readonly clearable = input(false, { transform: booleanAttribute });

  /** The parent must not log or store this outside the Keychain. */
  readonly save = output<string>();

  readonly clear = output<void>();

  readonly inputId = `sone-secret-field-${nextSecretFieldId++}`;

  readonly draft = signal("");

  readonly canSave = computed(
    () => !this.busy() && this.draft().trim().length > 0,
  );

  readonly state = computed(() => {
    const has = this.hasKey();
    return has === null ? "unknown" : has ? "set" : "unset";
  });

  private readonly pending = signal(false);

  /** STATE-based, not edge-based: an IPC that resolves inside one CD pass flips
   *  `busy` true → false before anything reads it, which an edge detector would miss. */
  private readonly _clearAfterSave = effect(() => {
    if (!this.pending() || this.busy()) return;
    this.pending.set(false);
    if (!this.error()) this.draft.set("");
  });

  onInput(e: Event): void {
    this.draft.set((e.target as HTMLInputElement).value);
  }

  submit(): void {
    if (!this.canSave()) return;
    this.pending.set(true);
    this.save.emit(this.draft());
  }

  onClear(): void {
    this.clear.emit();
  }
}
