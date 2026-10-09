import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import {
  type SoneTagRejection,
  SoneTagInputComponent,
} from "@surface-one/angular/tag-input";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <div soneField [invalid]="!!error()">
    <label soneFieldLabel for="demo-tags">Tags</label>
    <sone-tag-input inputId="demo-tags" [(value)]="tags" placeholder="Add tag…"
      [max]="6" [maxVisible]="4" [suggestions]="suggestions"
      (rejected)="onRejected($event)" (added)="error.set(null)" />
    @if (error(); as e) {
      <p soneFieldError>{{ e }}</p>
    } @else {
      <p soneFieldDescription>Press Enter or type a comma to add a tag.</p>
    }
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tag-input-demo",
  imports: [SoneTagInputComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TagInputDemo {
  readonly tags = signal<readonly string[]>(["design", "planning", "q3"]);
  readonly suggestions = [
    "design",
    "engineering",
    "hiring",
    "planning",
    "sales",
  ];
  readonly error = signal<string | null>(null);

  onRejected(r: SoneTagRejection): void {
    this.error.set(
      r.reason === "duplicate"
        ? `“${r.tag}” is already there.`
        : r.reason === "max"
          ? "Six tags at most."
          : `“${r.tag}” is not a valid tag.`,
    );
  }
}
