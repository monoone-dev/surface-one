import { useState } from "react";
import {
  SoneContextMenuTrigger,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuSeparator,
  SoneMenuShortcut,
} from "@surface-one/react";

export default function ContextMenuDemo() {
  const [bookmarks, setBookmarks] = useState(true);
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "20rem" }}>
      <SoneContextMenuTrigger
        tabIndex={0}
        style={{
          display: "grid",
          placeItems: "center",
          width: "18rem",
          height: "9rem",
          border: "var(--border-width-thin) dashed var(--border)",
          borderRadius: "var(--radius-lg)",
          color: "var(--text-secondary)",
          fontSize: "var(--font-size-sm)",
        }}
        menu={
          <SoneMenu aria-label="Page actions" style={{ width: "14rem" }}>
            <SoneMenuItem type="button">Back <SoneMenuShortcut as="kbd">⌘[</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button" disabled>Forward <SoneMenuShortcut as="kbd">⌘]</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button">Reload <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuSeparator />
            <SoneMenuCheckboxItem type="button" checked={bookmarks} onClick={() => setBookmarks(!bookmarks)}>
              Show bookmarks
            </SoneMenuCheckboxItem>
            <SoneMenuSeparator />
            <SoneMenuItem variant="destructive" type="button">Delete page</SoneMenuItem>
          </SoneMenu>
        }
      >
        Right-click or long-press here
      </SoneContextMenuTrigger>
    </div>
  );
}
