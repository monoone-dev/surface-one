import { useState } from "react";
import {
  SoneButton,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuShortcut,
  SoneMenuTrigger,
} from "@surface-one/react";

export default function MenuDemo() {
  const [pinned, setPinned] = useState(true);

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "17rem" }}>
      <SoneMenuTrigger as={SoneButton} variant="outline" type="button" menu={
        <SoneMenu aria-label="Note actions" style={{ width: "15rem" }}>
          <SoneMenuGroup>
            <SoneMenuLabel>Note</SoneMenuLabel>
            <SoneMenuItem type="button">Rename <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button">Duplicate</SoneMenuItem>
            <SoneMenuItem type="button" disabled>Export (locked)</SoneMenuItem>
            <SoneMenuCheckboxItem type="button" checked={pinned} onClick={() => setPinned(!pinned)}>Pinned</SoneMenuCheckboxItem>
          </SoneMenuGroup>
          <SoneMenuGroup>
            <SoneMenuItem variant="destructive" type="button">Move to Trash</SoneMenuItem>
          </SoneMenuGroup>
        </SoneMenu>
      }>Note actions</SoneMenuTrigger>
    </div>
  );
}
