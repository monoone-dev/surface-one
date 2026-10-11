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

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import {
  SoneButton,
  SoneIcon,
  SoneSidebar,
  SoneSidebarContent,
  SoneSidebarFooter,
  SoneSidebarGroup,
  SoneSidebarGroupLabel,
  SoneSidebarHeader,
  SoneSidebarInset,
  SoneSidebarMenu,
  SoneSidebarMenuBadge,
  SoneSidebarMenuButton,
  SoneSidebarMenuItem,
  SoneSidebarRail,
  SoneSidebarTrigger,
  SoneSidebarWrapper,
} from "@surface-one/vue";

// A demo-local sidebar state (no persistence), so it never shares state with an app shell.
const config = { defaultOpen: true, openStorageKey: null, widthStorageKey: null };
</script>

<template>
  <SoneSidebarWrapper :config="config" style="display: flex; height: 360px; overflow: hidden;
       border: 1px solid var(--border-subtle); border-radius: var(--radius-md)">
    <SoneSidebar collapsible="icon" role="navigation" aria-label="Workspace">
      <SoneSidebarHeader>
        <SoneSidebarTrigger :as="SoneButton" variant="ghost" size="icon-sm" type="button" aria-label="Toggle sidebar">
          <SoneIcon icon="sidebar" />
        </SoneSidebarTrigger>
      </SoneSidebarHeader>
      <SoneSidebarContent>
        <SoneSidebarGroup as="section" aria-label="Library">
          <SoneSidebarGroupLabel>Library</SoneSidebarGroupLabel>
          <SoneSidebarMenu>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton type="button" tooltip="Search"><SoneIcon icon="search" /><span>Search</span></SoneSidebarMenuButton>
            </SoneSidebarMenuItem>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton type="button" is-active tooltip="Meetings"><SoneIcon icon="meetings" /><span>Meetings</span></SoneSidebarMenuButton>
            </SoneSidebarMenuItem>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton type="button" tooltip="Notes"><SoneIcon icon="notes" /><span>Notes</span></SoneSidebarMenuButton>
            </SoneSidebarMenuItem>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton type="button" tooltip="Reminders"><SoneIcon icon="reminders" /><span>Reminders</span></SoneSidebarMenuButton>
              <SoneSidebarMenuBadge as="span">3</SoneSidebarMenuBadge>
            </SoneSidebarMenuItem>
          </SoneSidebarMenu>
        </SoneSidebarGroup>
        <SoneSidebarGroup as="section" aria-label="Developer">
          <SoneSidebarGroupLabel variant="destructive">Developer</SoneSidebarGroupLabel>
          <SoneSidebarMenu>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton variant="destructive" type="button" is-active tooltip="Logs"><SoneIcon icon="code" /><span>Logs</span></SoneSidebarMenuButton>
            </SoneSidebarMenuItem>
          </SoneSidebarMenu>
        </SoneSidebarGroup>
      </SoneSidebarContent>
      <SoneSidebarFooter>
        <SoneSidebarMenu>
          <SoneSidebarMenuItem>
            <SoneSidebarMenuButton type="button" tooltip="Settings"><SoneIcon icon="settings" /><span>Settings</span></SoneSidebarMenuButton>
          </SoneSidebarMenuItem>
        </SoneSidebarMenu>
      </SoneSidebarFooter>
      <SoneSidebarRail />
    </SoneSidebar>
    <SoneSidebarInset style="padding: var(--space-5); color: var(--text-secondary)">
      <p style="margin: 0">Use the toggle (or drag the rail) to collapse the sidebar to icons.</p>
    </SoneSidebarInset>
  </SoneSidebarWrapper>
</template>
`;

/** The same demo with @surface-one/react (React 19 / Next.js). */
export const reactCode = `import {
  SoneButton,
  SoneIcon,
  SoneSidebar,
  SoneSidebarContent,
  SoneSidebarFooter,
  SoneSidebarGroup,
  SoneSidebarGroupLabel,
  SoneSidebarHeader,
  SoneSidebarInset,
  SoneSidebarMenu,
  SoneSidebarMenuBadge,
  SoneSidebarMenuButton,
  SoneSidebarMenuItem,
  SoneSidebarRail,
  SoneSidebarTrigger,
  SoneSidebarWrapper,
} from "@surface-one/react";

// A demo-local sidebar state (no persistence), so it never shares state with an app shell.
const config = { defaultOpen: true, openStorageKey: null, widthStorageKey: null };

export default function SidebarDemo() {
  return (
    <SoneSidebarWrapper
      config={config}
      style={{
        display: "flex",
        height: 360,
        overflow: "hidden",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <SoneSidebar collapsible="icon" role="navigation" aria-label="Workspace">
        <SoneSidebarHeader>
          <SoneSidebarTrigger as={SoneButton} variant="ghost" size="icon-sm" type="button" aria-label="Toggle sidebar">
            <SoneIcon icon="sidebar" />
          </SoneSidebarTrigger>
        </SoneSidebarHeader>
        <SoneSidebarContent>
          <SoneSidebarGroup as="section" aria-label="Library">
            <SoneSidebarGroupLabel>Library</SoneSidebarGroupLabel>
            <SoneSidebarMenu>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton type="button" tooltip="Search"><SoneIcon icon="search" /><span>Search</span></SoneSidebarMenuButton>
              </SoneSidebarMenuItem>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton type="button" isActive tooltip="Meetings"><SoneIcon icon="meetings" /><span>Meetings</span></SoneSidebarMenuButton>
              </SoneSidebarMenuItem>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton type="button" tooltip="Notes"><SoneIcon icon="notes" /><span>Notes</span></SoneSidebarMenuButton>
              </SoneSidebarMenuItem>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton type="button" tooltip="Reminders"><SoneIcon icon="reminders" /><span>Reminders</span></SoneSidebarMenuButton>
                <SoneSidebarMenuBadge as="span">3</SoneSidebarMenuBadge>
              </SoneSidebarMenuItem>
            </SoneSidebarMenu>
          </SoneSidebarGroup>
          <SoneSidebarGroup as="section" aria-label="Developer">
            <SoneSidebarGroupLabel variant="destructive">Developer</SoneSidebarGroupLabel>
            <SoneSidebarMenu>
              <SoneSidebarMenuItem>
                <SoneSidebarMenuButton variant="destructive" type="button" isActive tooltip="Logs"><SoneIcon icon="code" /><span>Logs</span></SoneSidebarMenuButton>
              </SoneSidebarMenuItem>
            </SoneSidebarMenu>
          </SoneSidebarGroup>
        </SoneSidebarContent>
        <SoneSidebarFooter>
          <SoneSidebarMenu>
            <SoneSidebarMenuItem>
              <SoneSidebarMenuButton type="button" tooltip="Settings"><SoneIcon icon="settings" /><span>Settings</span></SoneSidebarMenuButton>
            </SoneSidebarMenuItem>
          </SoneSidebarMenu>
        </SoneSidebarFooter>
        <SoneSidebarRail />
      </SoneSidebar>
      <SoneSidebarInset style={{ padding: "var(--space-5)", color: "var(--text-secondary)" }}>
        <p style={{ margin: 0 }}>Use the toggle (or drag the rail) to collapse the sidebar to icons.</p>
      </SoneSidebarInset>
    </SoneSidebarWrapper>
  );
}
`;

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
