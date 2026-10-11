<script setup lang="ts">
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
       border: var(--border-width-thin) solid var(--border-subtle); border-radius: var(--radius-md)">
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
