import { useState } from "react";
import {
  SoneMenu,
  SoneMenubar,
  SoneMenubarTrigger,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuSeparator,
  SoneMenuShortcut,
} from "@surface-one/react";

export default function MenubarDemo() {
  const [bookmarks, setBookmarks] = useState(true);
  const [urls, setUrls] = useState(false);
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", minHeight: "16rem" }}>
      <SoneMenubar aria-label="Editor">
        <SoneMenubarTrigger
          menu={
            <SoneMenu aria-label="File" style={{ width: "14rem" }}>
              <SoneMenuItem type="button">New Tab <SoneMenuShortcut as="kbd">⌘T</SoneMenuShortcut></SoneMenuItem>
              <SoneMenuItem type="button">New Window <SoneMenuShortcut as="kbd">⌘N</SoneMenuShortcut></SoneMenuItem>
              <SoneMenuSeparator />
              <SoneMenuItem type="button">Print… <SoneMenuShortcut as="kbd">⌘P</SoneMenuShortcut></SoneMenuItem>
            </SoneMenu>
          }
        >
          File
        </SoneMenubarTrigger>
        <SoneMenubarTrigger
          menu={
            <SoneMenu aria-label="Edit" style={{ width: "14rem" }}>
              <SoneMenuItem type="button">Undo <SoneMenuShortcut as="kbd">⌘Z</SoneMenuShortcut></SoneMenuItem>
              <SoneMenuItem type="button">Redo <SoneMenuShortcut as="kbd">⇧⌘Z</SoneMenuShortcut></SoneMenuItem>
              <SoneMenuSeparator />
              <SoneMenuItem type="button">Cut</SoneMenuItem>
              <SoneMenuItem type="button">Copy</SoneMenuItem>
              <SoneMenuItem type="button">Paste</SoneMenuItem>
            </SoneMenu>
          }
        >
          Edit
        </SoneMenubarTrigger>
        <SoneMenubarTrigger
          menu={
            <SoneMenu aria-label="View" style={{ width: "14rem" }}>
              <SoneMenuCheckboxItem type="button" checked={bookmarks} onClick={() => setBookmarks(!bookmarks)}>
                Show Bookmarks Bar
              </SoneMenuCheckboxItem>
              <SoneMenuCheckboxItem type="button" checked={urls} onClick={() => setUrls(!urls)}>
                Show Full URLs
              </SoneMenuCheckboxItem>
            </SoneMenu>
          }
        >
          View
        </SoneMenubarTrigger>
      </SoneMenubar>
    </div>
  );
}
