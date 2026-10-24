import { useState } from "react";
import {
  SoneButton,
  SoneCommand,
  SoneCommandDialog,
  SoneCommandEmpty,
  SoneCommandGroup,
  SoneCommandInput,
  SoneCommandItem,
  SoneCommandList,
  SoneCommandSeparator,
  SoneKbd,
} from "@surface-one/react";

const notes = ["Q4 planning", "Design review — Łódź office", "Weekly sync", "Café roadmap", "Hiring loop"];

export default function CommandDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <div className="demo-stack" style={{ maxWidth: "26rem" }}>
        <SoneCommand style={{ boxShadow: "0 0 0 var(--border-width-thin) var(--border)" }}>
          <SoneCommandInput placeholder="Type a command or search…" aria-label="Search commands" />
          <SoneCommandList aria-label="Commands">
            <SoneCommandEmpty>No results found.</SoneCommandEmpty>
            <SoneCommandGroup heading="Notes">
              {notes.map((note) => (
                <SoneCommandItem key={note} onSelect={setPicked}>
                  {note}
                </SoneCommandItem>
              ))}
            </SoneCommandGroup>
            <SoneCommandSeparator />
            <SoneCommandGroup heading="Actions">
              <SoneCommandItem value="New note" keywords={["create", "add"]} onSelect={setPicked}>
                New note
              </SoneCommandItem>
              <SoneCommandItem value="Start recording" keywords={["record", "meeting"]} onSelect={setPicked}>
                Start recording
              </SoneCommandItem>
              <SoneCommandItem value="Export" disabled>
                Export (locked)
              </SoneCommandItem>
            </SoneCommandGroup>
          </SoneCommandList>
        </SoneCommand>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>Selected: {picked ?? "nothing yet"}</p>
        <div className="demo-row">
          <SoneButton variant="outline" type="button" onClick={() => setPaletteOpen(true)}>
            Open the palette <SoneKbd>⌘K</SoneKbd>
          </SoneButton>
        </div>
      </div>

      {paletteOpen ? (
        <SoneCommandDialog label="Command palette" onDismiss={() => setPaletteOpen(false)}>
          <SoneCommand>
            <SoneCommandInput data-autofocus placeholder="Search notes…" aria-label="Search notes" />
            <SoneCommandList aria-label="Notes">
              <SoneCommandEmpty>No notes match.</SoneCommandEmpty>
              {notes.map((note) => (
                <SoneCommandItem
                  key={note}
                  onSelect={(value) => {
                    setPicked(value);
                    setPaletteOpen(false);
                  }}
                >
                  {note}
                </SoneCommandItem>
              ))}
            </SoneCommandList>
          </SoneCommand>
        </SoneCommandDialog>
      ) : null}
    </>
  );
}
