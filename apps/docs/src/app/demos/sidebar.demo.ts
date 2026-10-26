import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneSegmentedComponent } from "@surface-one/angular/segmented";
import {
  SONE_SIDEBAR_PARTS,
  SoneSidebarService,
  provideSoneSidebarConfig,
} from "@surface-one/angular/sidebar";

const TEMPLATE = `<!-- Joined: the sidebar and the page share one surface. Separate: each is an island. -->
<sone-segmented size="sm" ariaLabel="Layout" [options]="layouts" [(value)]="layout" />
<div soneSidebarWrapper style="display: flex; height: 360px; margin-top: var(--space-3); overflow: hidden;
     border: var(--border-width-thin) solid var(--border-subtle); border-radius: var(--radius-md)">
  <sone-sidebar [variant]="layout()" collapsible="icon" role="navigation" aria-label="Workspace">
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
      <section soneSidebarGroup aria-label="Developer">
        <div soneSidebarGroupLabel variant="destructive">Developer</div>
        <ul soneSidebarMenu>
          <li soneSidebarMenuItem>
            <button soneSidebarMenuButton variant="destructive" type="button" isActive tooltip="Logs"><sone-icon icon="code" /><span>Logs</span></button>
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
  imports: [
    ...SONE_SIDEBAR_PARTS,
    SoneButtonDirective,
    SoneIconComponent,
    SoneSegmentedComponent,
  ],
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
export default class SidebarDemo {
  readonly layouts = [
    { value: "sidebar", label: "Joined" },
    { value: "inset", label: "Separate" },
  ];
  readonly layout = signal<"sidebar" | "inset">("sidebar");
}
