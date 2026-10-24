import { useState } from "react";
import {
  SoneField,
  SoneFieldLabel,
  SoneMarkdown,
  SoneMarkdownEditor,
} from "@surface-one/react";

const NOTE = [
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
].join("\n");

const DRAFT =
  "## Follow-ups\n\n1. Leo shares the rollout plan\n2. Ada books the review\n\nSelect text and press **⌘B** to bold it.";

export default function MarkdownDemo() {
  const [note, setNote] = useState(NOTE);
  const [draft, setDraft] = useState(DRAFT);
  return (
    <div className="demo-stack" style={{ maxWidth: 680, width: "100%" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="markdown-source">Markdown</SoneFieldLabel>
        <textarea
          id="markdown-source"
          rows={6}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </SoneField>
      <SoneMarkdown data-testid="markdown-reference-preview" source={note} />
      <SoneMarkdownEditor
        ariaLabel="Meeting note"
        placeholder="Write in markdown…"
        minRows={5}
        value={draft}
        onValueChange={setDraft}
      />
    </div>
  );
}
