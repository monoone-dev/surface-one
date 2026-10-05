import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneMarkdownComponent,
  SoneMarkdownEditorComponent,
} from "@surface-one/angular/markdown";

const TEMPLATE = `<div class="demo-stack" style="max-width: 680px; width: 100%">
  <sone-markdown [source]="note" />
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
  imports: [SoneMarkdownComponent, SoneMarkdownEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MarkdownDemo {
  readonly note = [
    "**Planning sync** with Ada Park and Leo Ruiz.",
    "",
    "- Cut the onboarding checklist to *five* steps",
    "- Ship it behind the `short-onboarding` flag",
    "",
    "- [x] Draft the invite copy",
    "- [ ] Legal review by Friday",
  ].join("\n");

  readonly draft = signal(
    "## Follow-ups\n\n1. Leo shares the rollout plan\n2. Ada books the review\n\nSelect text and press **⌘B** to bold it.",
  );
}
