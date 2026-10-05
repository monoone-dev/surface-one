import { ChangeDetectionStrategy, Component, input } from "@angular/core";

export type ShellIcon =
  | "index-one"
  | "record"
  | "meetings"
  | "notes"
  | "reminders"
  | "tasks"
  | "dashboards"
  | "analytics"
  | "graph"
  | "people"
  | "ivy"
  | "ask"
  | "settings"
  | "search"
  | "spaces"
  | "shared-ivys"
  | "browse"
  | "layout-grid"
  | "sparkles"
  | "history"
  | "plus"
  | "note-add"
  | "folder"
  | "folder-add"
  | "move"
  | "rename"
  | "edit"
  | "eye"
  | "trash"
  | "unlock"
  | "check"
  | "chevron-right"
  | "sidebar"
  | "topbar"
  | "sun"
  | "moon"
  | "display"
  | "document"
  | "drift"
  | "numbers"
  | "pulse"
  | "promises"
  | "lock"
  | "developer"
  | "logs"
  | "link"
  | "close"
  | "copy"
  | "refresh"
  | "bell-plus"
  | "bell-ring"
  | "list-checks"
  | "radio"
  | "layout-template"
  | "download"
  | "printer"
  | "audio-lines"
  | "share"
  | "move-horizontal"
  | "star"
  | "alert-circle";

export type IconSize = "xs" | "sm" | "base" | "lg" | "xl";

@Component({
  selector: "sone-icon",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "icon",
    "[attr.data-icon]": "icon()",
    "[attr.data-size]": "size()",
    "[attr.data-inline]": "inline()",
  },
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
})
export class SoneIconComponent {
  readonly icon = input.required<ShellIcon>();
  readonly size = input<IconSize | null>(null);
  // Only for a MEANINGFUL icon (the only thing saying what it means); omit for a
  // decorative glyph next to a text label — it then stays `aria-hidden`.
  readonly label = input<string | null>(null);
  readonly inline = input<"start" | "end" | null>(null);
}
