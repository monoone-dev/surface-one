import { useState } from "react";
import {
  SoneButton,
  SoneIcon,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SonePageActions,
  SonePageActionsLead,
} from "@surface-one/react";

export default function PageActionsDemo() {
  const [starred, setStarred] = useState(false);
  const [notify, setNotify] = useState(true);
  return (
    <div className="demo-row" style={{ justifyContent: "space-between", width: "100%" }}>
      <span>Product roadmap</span>
      <SonePageActions status="Edited Oct 08" tooltip="More actions">
        <SonePageActionsLead>
          <SoneButton type="button" variant="ghost" size="icon-sm" aria-label="Favourite"
            aria-pressed={starred} onClick={() => setStarred(!starred)}>
            <SoneIcon icon="star" />
          </SoneButton>
        </SonePageActionsLead>
        <SoneMenuGroup>
          <SoneMenuItem type="button"><SoneIcon icon="link" /> Copy link</SoneMenuItem>
          <SoneMenuItem type="button"><SoneIcon icon="copy" /> Duplicate</SoneMenuItem>
          <SoneMenuCheckboxItem type="button" checked={notify} onClick={() => setNotify(!notify)}>
            <SoneIcon icon="bell-ring" /> Notifications
          </SoneMenuCheckboxItem>
        </SoneMenuGroup>
        <SoneMenuGroup>
          <SoneMenuItem type="button" variant="destructive">
            <SoneIcon icon="trash" /> Move to Trash
          </SoneMenuItem>
        </SoneMenuGroup>
      </SonePageActions>
    </div>
  );
}
