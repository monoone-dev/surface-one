import { useState } from "react";
import {
  SoneButton,
  SoneFloatingBar,
  SoneStatusOrb,
  type FloatingBarState,
} from "@surface-one/react";

const STATES: FloatingBarState[] = ["idle", "live", "processing"];

export default function FloatingBarDemo() {
  const [state, setState] = useState<FloatingBarState>("idle");
  const [visible, setVisible] = useState(true);
  return (
    <div className="demo-stack" style={{ maxWidth: 420, width: "100%" }}>
      {visible ? (
        <div style={{ height: "3rem" }}>
          <SoneFloatingBar state={state} onClosed={() => setVisible(false)}>
            <SoneStatusOrb state={state === "idle" ? "ready" : state} />
            <span>
              {state === "live" ? "Recording · 02:14" : state === "processing" ? "Writing the note…" : "Ready · ⌘⇧R"}
            </span>
          </SoneFloatingBar>
        </div>
      ) : (
        <SoneButton variant="outline" type="button" onClick={() => setVisible(true)}>
          Show the bar
        </SoneButton>
      )}
      <div className="demo-row">
        {STATES.map((s) => (
          <SoneButton
            key={s}
            size="sm"
            variant={state === s ? "default" : "outline"}
            type="button"
            onClick={() => setState(s)}
          >
            {s}
          </SoneButton>
        ))}
      </div>
    </div>
  );
}
