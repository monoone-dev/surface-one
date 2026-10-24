import { useState } from "react";
import {
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneRowMenu,
  SoneSidebar,
  SoneTreeRow,
} from "@surface-one/react";

export default function RowMenuDemo() {
  const [pinned, setPinned] = useState(true);
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <h3 style={{ margin: 0 }}>Weekly sync</h3>
        <SoneRowMenu label="Actions for Weekly sync" prominent>
          <SoneMenuGroup>
            <SoneMenuLabel>Note</SoneMenuLabel>
            <SoneMenuItem type="button">Rename</SoneMenuItem>
            <SoneMenuItem type="button">Move to folder…</SoneMenuItem>
            <SoneMenuCheckboxItem type="button" checked={pinned} onClick={() => setPinned(!pinned)}>Pinned</SoneMenuCheckboxItem>
          </SoneMenuGroup>
          <SoneMenuGroup>
            <SoneMenuItem variant="destructive" type="button">Move to trash</SoneMenuItem>
          </SoneMenuGroup>
        </SoneRowMenu>
      </div>

      <SoneSidebar style={{ width: "16rem" }}>
        <SoneTreeRow label="Research" count={6}>
          <SoneRowMenu label="Actions for Research">
            <SoneMenuItem type="button">Rename</SoneMenuItem>
            <SoneMenuItem variant="destructive" type="button">Delete folder</SoneMenuItem>
          </SoneRowMenu>
        </SoneTreeRow>
      </SoneSidebar>
    </div>
  );
}
