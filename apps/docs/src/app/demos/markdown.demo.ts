import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneFieldDirective,
  SoneFieldLabelDirective,
} from "@surface-one/angular/input";
import {
  SoneMarkdownComponent,
  SoneMarkdownEditorComponent,
} from "@surface-one/angular/markdown";

const TEMPLATE = `<div class="demo-stack" style="max-width: 680px; width: 100%">
  <div soneField>
    <label soneFieldLabel for="markdown-source">Markdown</label>
    <textarea
      #sourceInput
      id="markdown-source"
      rows="6"
      [value]="note()"
      (input)="note.set(sourceInput.value)"
    ></textarea>
  </div>
  <sone-markdown data-testid="markdown-reference-preview" [source]="note()" />
  <sone-markdown-editor
    ariaLabel="Meeting note"
    placeholder="Write in markdown…"
    [minRows]="5"
    [(value)]="draft"
  />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-markdown-demo",
  imports: [
    SoneFieldDirective,
    SoneFieldLabelDirective,
    SoneMarkdownComponent,
    SoneMarkdownEditorComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MarkdownDemo {
  readonly note = signal(
    [
      "**Planning sync** with Ada Park and Leo Ruiz.",
      "",
      "- Cut the onboarding checklist to *five* steps",
      "- Ship it behind the `short-onboarding` flag",
      "",
      "- [x] Draft the invite copy",
      "- [ ] Legal review by Friday",
      "",
      "[Guide][ref]",
      "",
      '[ref]: https://example.invalid/one "Guide one"',
    ].join("\n"),
  );

  readonly draft = signal(
    "## Follow-ups\n\n1. Leo shares the rollout plan\n2. Ada books the review\n\nSelect text and press **⌘B** to bold it.",
  );
}
