import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneTagInput,
  type SoneTagRejection,
} from "@surface-one/react";

const SUGGESTIONS = ["design", "engineering", "hiring", "planning", "sales"];

export default function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(["design", "planning", "q3"]);
  const [error, setError] = useState<string | null>(null);

  const onRejected = (r: SoneTagRejection) =>
    setError(
      r.reason === "duplicate"
        ? `“${r.tag}” is already there.`
        : r.reason === "max"
          ? "Six tags at most."
          : `“${r.tag}” is not a valid tag.`,
    );

  return (
    <div className="demo-stack" style={{ maxWidth: "28rem" }}>
      <SoneField invalid={!!error}>
        <SoneFieldLabel htmlFor="demo-tags">Tags</SoneFieldLabel>
        <SoneTagInput
          value={tags}
          onValueChange={setTags}
          inputId="demo-tags"
          placeholder="Add tag…"
          max={6}
          maxVisible={4}
          suggestions={SUGGESTIONS}
          onRejected={onRejected}
          onAdded={() => setError(null)}
        />
        {error ? (
          <SoneFieldError>{error}</SoneFieldError>
        ) : (
          <SoneFieldDescription>Press Enter or type a comma to add a tag.</SoneFieldDescription>
        )}
      </SoneField>
    </div>
  );
}
