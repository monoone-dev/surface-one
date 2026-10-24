import { useState } from "react";
import {
  SoneButton,
  SoneSidePanel,
  SoneSidePanelActions,
  SoneSidePanelClose,
  SoneSidePanelContent,
  SoneSidePanelHeader,
  SoneSidePanelTitle,
} from "@surface-one/react";

export default function SidePanelDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="demo-row" style={{ alignItems: "stretch", width: "100%", minHeight: 280 }}>
      <div className="demo-stack" style={{ flex: 1 }}>
        <p>Weekly sync — the note stays in place while the panel docks beside it.</p>
        {!open ? (
          <SoneButton variant="outline" type="button" onClick={() => setOpen(true)}>
            Open details
          </SoneButton>
        ) : null}
      </div>
      {open ? (
        <SoneSidePanel aria-labelledby="side-panel-demo-title">
          <SoneSidePanelHeader>
            <SoneSidePanelTitle id="side-panel-demo-title">Details</SoneSidePanelTitle>
            <SoneSidePanelActions>
              <SoneSidePanelClose label="Close details" onClosed={() => setOpen(false)} />
            </SoneSidePanelActions>
          </SoneSidePanelHeader>
          <SoneSidePanelContent>
            <p>Created 9 October · 3 participants · 42 minutes.</p>
          </SoneSidePanelContent>
        </SoneSidePanel>
      ) : null}
    </div>
  );
}
