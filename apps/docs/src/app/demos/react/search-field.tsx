import { useState } from "react";
import { SoneSearchField } from "@surface-one/react";

export default function SearchFieldDemo() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem" }}>
      <SoneSearchField
        value={query}
        onValueChange={setQuery}
        clearable
        placeholder="Search notes"
        ariaLabel="Search notes"
        onSubmit={setSubmitted}
      />
      <p role="status" style={{ margin: 0, color: "var(--text-secondary)" }}>
        Searched for: {submitted || "nothing yet"}
      </p>

      <SoneSearchField size="sm" placeholder="Filter" ariaLabel="Filter sources" />

      {/* variant="filled": a grey fill, no border; the glyph and placeholder name it */}
      <SoneSearchField variant="filled" placeholder="Search chats" ariaLabel="Search chats" />
    </div>
  );
}
