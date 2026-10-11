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
  SonePopover,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
} from "@surface-one/react";

export default function MenuDemo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pinned, setPinned] = useState(true);

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "17rem" }}>
      <div style={{ position: "relative" }} onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}>
        <SoneButton variant="outline" type="button" aria-haspopup="menu"
          aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>Note actions</SoneButton>
        {menuOpen && (
          <SoneMenu role="menu" aria-label="Note actions"
            style={{ position: "absolute", top: "calc(100% + var(--space-1))", left: 0, width: "15rem", zIndex: "var(--z-dropdown)" }}>
            <SoneMenuGroup>
              <SoneMenuLabel>Note</SoneMenuLabel>
              <SoneMenuItem role="menuitem" type="button" onClick={() => setMenuOpen(false)}>Rename <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
              <SoneMenuItem role="menuitem" type="button" disabled>Export (locked)</SoneMenuItem>
              <SoneMenuCheckboxItem type="button" checked={pinned} onClick={() => setPinned(!pinned)}>Pinned</SoneMenuCheckboxItem>
            </SoneMenuGroup>
            <SoneMenuGroup>
              <SoneMenuItem variant="destructive" role="menuitem" type="button" onClick={() => setMenuOpen(false)}>Move to Trash</SoneMenuItem>
            </SoneMenuGroup>
          </SoneMenu>
        )}
      </div>

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
