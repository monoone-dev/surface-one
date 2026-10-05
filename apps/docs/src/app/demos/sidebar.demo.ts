import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_SIDEBAR_PARTS,
  SoneSidebarService,
  provideSoneSidebarConfig,
} from "@surface-one/angular/sidebar";

const TEMPLATE = `<div soneSidebarWrapper style="display: flex; height: 360px; overflow: hidden;
     border: 1px solid var(--border-subtle); border-radius: var(--radius-md)">
  <sone-sidebar collapsible="icon" role="navigation" aria-label="Workspace">
    <div soneSidebarHeader>
      <button soneBtn soneSidebarTrigger variant="ghost" size="icon-sm" type="button" aria-label="Toggle sidebar">
        <sone-icon icon="sidebar" />
      </button>
    </div>
    <div soneSidebarContent>
      <section soneSidebarGroup aria-label="Library">
        <div soneSidebarGroupLabel>Library</div>
        <ul soneSidebarMenu>
          <li soneSidebarMenuItem>
            <button soneSidebarMenuButton type="button" tooltip="Search"><sone-icon icon="search" /><span>Search</span></button>
          </li>
          <li soneSidebarMenuItem>
            <button soneSidebarMenuButton type="button" isActive tooltip="Meetings"><sone-icon icon="meetings" /><span>Meetings</span></button>
          </li>
          <li soneSidebarMenuItem>
            <button soneSidebarMenuButton type="button" tooltip="Notes"><sone-icon icon="notes" /><span>Notes</span></button>
          </li>
          <li soneSidebarMenuItem>
            <button soneSidebarMenuButton type="button" tooltip="Reminders"><sone-icon icon="reminders" /><span>Reminders</span></button>
            <span soneSidebarMenuBadge>3</span>
          </li>
        </ul>
      </section>
    </div>
    <div soneSidebarFooter>
      <ul soneSidebarMenu>
        <li soneSidebarMenuItem>
          <button soneSidebarMenuButton type="button" tooltip="Settings"><sone-icon icon="settings" /><span>Settings</span></button>
        </li>
      </ul>
    </div>
    <div soneSidebarRail></div>
  </sone-sidebar>
  <div soneSidebarInset style="padding: var(--space-5); color: var(--text-secondary)">
    <p style="margin: 0">Use the toggle (or drag the rail) to collapse the sidebar to icons.</p>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-sidebar-demo",
  imports: [...SONE_SIDEBAR_PARTS, SoneButtonDirective, SoneIconComponent],
  // A demo-local sidebar state (no persistence), so it never shares state with an app shell.
  providers: [
    SoneSidebarService,
    provideSoneSidebarConfig({
      defaultOpen: true,
      openStorageKey: null,
      widthStorageKey: null,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SidebarDemo {}
