import { useState } from "react";
import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuShortcut,
  SoneMenuTrigger,
  SonePopover,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
} from "@surface-one/react";

export default function MenuDemo() {
  const [popoverOpen, setPopoverOpen] = useState(false);
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

      <div style={{ position: "relative" }} onKeyDown={(e) => e.key === "Escape" && setPopoverOpen(false)}>
        <SoneButton variant="outline" type="button" aria-haspopup="dialog"
          aria-expanded={popoverOpen} onClick={() => setPopoverOpen(!popoverOpen)}>Dimensions</SoneButton>
        {popoverOpen && (
          <SonePopover role="dialog" aria-labelledby="dimensions-title"
            style={{ position: "absolute", top: "calc(100% + var(--space-1))", left: 0, zIndex: "var(--z-popover)" }}>
            <SonePopoverHeader>
              <SonePopoverTitle id="dimensions-title">Dimensions</SonePopoverTitle>
              <SonePopoverDescription>Set the size of the layer.</SonePopoverDescription>
            </SonePopoverHeader>
            <SoneField>
              <SoneFieldLabel htmlFor="dimensions-width">Width</SoneFieldLabel>
              <input id="dimensions-width" type="text" defaultValue="100%" />
            </SoneField>
            <SoneButton size="sm" type="button" onClick={() => setPopoverOpen(false)}>Apply</SoneButton>
          </SonePopover>
        )}
      </div>
    </div>
  );
}
