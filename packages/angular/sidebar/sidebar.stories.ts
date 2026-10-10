import {
  type Meta,
  type StoryObj,
  applicationConfig,
  moduleMetadata,
} from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneTreeRowComponent } from "@surface-one/angular/tree-row";
import { SoneSidebarComponent } from "./sidebar.component";
import { SONE_SIDEBAR_PARTS } from "./sidebar.directives";
import { provideSoneSidebarConfig } from "./sidebar.service";

const storyConfig = (defaultOpen: boolean) =>
  applicationConfig({
    providers: [
      provideSoneSidebarConfig({
        defaultOpen,
        openStorageKey: null,
        widthStorageKey: null,
      }),
    ],
  });

const frame = (sidebar: string, height = 620) => `
  <div soneSidebarWrapper style="display: flex; height: ${height}px; overflow: hidden">
    ${sidebar}
    <main soneSidebarInset style="padding: var(--space-6); color: var(--text-secondary)">
      <p style="margin: 0">
        The content column (SidebarInset). ⌘B / Ctrl+B toggles the sidebar; click the rail on its
        edge to toggle, drag it to resize, ⌥-click it to reset the width.
      </p>
    </main>
  </div>`;

const header = `
  <div soneSidebarHeader>
    <div style="display: flex; justify-content: flex-end">
      <button soneBtn variant="ghost" size="icon-sm" soneSidebarTrigger type="button" aria-label="Toggle sidebar">
        <sone-icon icon="sidebar" />
      </button>
    </div>
  </div>`;

const nav = `
  <section soneSidebarGroup aria-label="Platform">
    <div soneSidebarGroupLabel>Platform</div>
    <ul soneSidebarMenu>
      <li soneSidebarMenuItem>
        <button soneSidebarMenuButton type="button" tooltip="Search"><sone-icon icon="search" /><span>Search</span></button>
      </li>
      <li soneSidebarMenuItem>
        <button soneSidebarMenuButton type="button" isActive tooltip="Ask"><sone-icon icon="ask" /><span>Ask</span></button>
      </li>
      <li soneSidebarMenuItem>
        <button soneSidebarMenuButton type="button" tooltip="Meetings"><sone-icon icon="meetings" /><span>Meetings</span></button>
      </li>
      <li soneSidebarMenuItem>
        <button soneSidebarMenuButton type="button" tooltip="Reminders"><sone-icon icon="reminders" /><span>Reminders</span></button>
        <span soneSidebarMenuBadge>3</span>
      </li>
    </ul>
  </section>`;

const footer = `
  <div soneSidebarFooter>
    <ul soneSidebarMenu>
      <li soneSidebarMenuItem>
        <button soneSidebarMenuButton type="button" tooltip="Settings"><sone-icon icon="settings" /><span>Settings</span></button>
      </li>
    </ul>
  </div>`;

const meta: Meta<SoneSidebarComponent> = {
  title: "Components/Layout/Sidebar",
  component: SoneSidebarComponent,
  tags: ["autodocs"],
  decorators: [
    storyConfig(true),
    moduleMetadata({
      imports: [
        ...SONE_SIDEBAR_PARTS,
        SoneIconComponent,
        SoneButtonDirective,
        SoneTreeRowComponent,
        SoneRowMenuComponent,
      ],
    }),
  ],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "shadcn/ui **Sidebar**, ported from spartan/ui's helm " +
          "(https://spartan.ng/components/sidebar) — same parts, inputs and `data-*` attributes:\n\n" +
          "`[soneSidebarWrapper]` (SidebarProvider: `--sidebar-width`, `--sidebar-width-icon`, ⌘B) · " +
          "`<sone-sidebar side variant collapsible>` (`data-slot=sidebar`, `data-state`, " +
          "`data-collapsible`, `data-variant`, `data-side`) · `soneSidebarHeader` · `soneSidebarContent` · " +
          "`soneSidebarFooter` · `soneSidebarSeparator` · `soneSidebarGroup` · `soneSidebarGroupLabel` · " +
          "`soneSidebarGroupAction` · `soneSidebarGroupContent` · `ul[soneSidebarMenu]` · " +
          "`li[soneSidebarMenuItem]` · `soneSidebarMenuButton` (`size` default/sm/lg, `variant` " +
          "default/outline, `isActive` → `data-active`, `tooltip` — shown only on the icon rail) · " +
          "`soneSidebarMenuAction` (`showOnHover`) · `soneSidebarMenuBadge` · " +
          "`soneSidebarMenuSkeleton` (`showIcon`) · `ul[soneSidebarMenuSub]` · `li[soneSidebarMenuSubItem]` · " +
          "`soneSidebarMenuSubButton` (`size` sm/md, `isActive`) · `soneSidebarTrigger` · " +
          "`soneSidebarRail` (click toggles, drag resizes, ⌥-click resets) · `soneSidebarInset`.\n\n" +
          "State lives in `SoneSidebarService` (open / state / width, persisted). DEVIATION: " +
          "`collapsible` defaults to `none` (a static rail, e.g. Settings), not shadcn's `offcanvas` — " +
          "the service is one app-wide singleton, so a following default would collapse every static " +
          "sidebar with the main one. Pass `icon` or `offcanvas` for the one sidebar that follows it.\n\n" +
          "Metrics are Nova's; the palette and metrics are the theme tokens `--sidebar`, " +
          "`--sidebar-foreground`, `--sidebar-border`, `--sidebar-accent(-foreground)`, " +
          "`--sidebar-content-gap`, `--sidebar-menu-*`, `--sidebar-transition` and the shared " +
          "`--sidebar-row-*` / `--sidebar-section-*` rows. Use the toolbar's Skin × Theme switches to " +
          "compare Minimalist (Nova), Studio (Vega) and Paper (Maia).\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/sidebar](https://spartan.ng/components/sidebar)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/sidebar](https://ui.shadcn.com/docs/components/sidebar)",
      },
    },
  },
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>${nav}</div>
        ${footer}
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};
export default meta;
type Story = StoryObj<SoneSidebarComponent>;

export const Default: Story = {};

export const IconCollapsed: Story = {
  decorators: [storyConfig(false)],
};

export const WithSubMenus: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>
          <nav soneSidebarGroup aria-label="Browse">
            <ul soneSidebarMenu>
              <li soneSidebarMenuItem>
                <button soneSidebarMenuButton type="button" aria-expanded="true" tooltip="Browse">
                  <sone-icon icon="browse" /><span>Browse</span>
                  <sone-icon icon="chevron-right" size="sm" data-sidebar="chevron" />
                </button>
                <ul soneSidebarMenuSub>
                  <li soneSidebarMenuSubItem>
                    <a soneSidebarMenuSubButton href="#" isActive><sone-icon icon="meetings" /><span>Meetings</span></a>
                  </li>
                  <li soneSidebarMenuSubItem>
                    <a soneSidebarMenuSubButton href="#"><sone-icon icon="notes" /><span>Notes</span></a>
                  </li>
                  <li soneSidebarMenuSubItem>
                    <a soneSidebarMenuSubButton href="#">
                      <sone-icon icon="reminders" /><span>Reminders</span><span soneSidebarMenuBadge>3</span>
                    </a>
                  </li>
                  <li soneSidebarMenuSubItem>
                    <a soneSidebarMenuSubButton href="#" size="sm"><sone-icon icon="trash" /><span>Trash (sm)</span></a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
          <hr soneSidebarSeparator />
          <section soneSidebarGroup aria-label="Workspaces">
            <div soneSidebarGroupLabel>Workspaces (tree rows nest like a sub)</div>
            <div soneSidebarGroupContent>
              <sone-tree-row label="Acme" icon="space" emoji="🏢" [expandable]="true" [expanded]="true" />
              <sone-tree-row label="Product" [depth]="1" [count]="12" [expandable]="true" [expanded]="true" [selected]="true" />
              <sone-tree-row label="Roadmap review" icon="meeting" [depth]="2" />
              <sone-tree-row label="Pricing notes" icon="note" [depth]="2" />
              <sone-tree-row label="1:1s" icon="locked" [depth]="1" [count]="4" />
            </div>
          </section>
        </div>
        ${footer}
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Badges: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>
          <section soneSidebarGroup aria-label="Inbox">
            <div soneSidebarGroupLabel>Inbox</div>
            <ul soneSidebarMenu>
              <li soneSidebarMenuItem>
                <button soneSidebarMenuButton type="button" tooltip="Reminders"><sone-icon icon="reminders" /><span>Reminders</span></button>
                <span soneSidebarMenuBadge>3</span>
              </li>
              <li soneSidebarMenuItem>
                <button soneSidebarMenuButton type="button" isActive tooltip="Processing queue"><sone-icon icon="history" /><span>Processing queue</span></button>
                <span soneSidebarMenuBadge>12</span>
              </li>
              <li soneSidebarMenuItem>
                <button soneSidebarMenuButton type="button" tooltip="Trash"><sone-icon icon="trash" /><span>Trash</span></button>
                <span soneSidebarMenuBadge>128</span>
              </li>
            </ul>
          </section>
        </div>
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Actions: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>
          <section soneSidebarGroup aria-label="Workspaces">
            <div soneSidebarGroupLabel>Workspaces</div>
            <button soneSidebarGroupAction type="button" aria-label="Create in Workspaces">
              <sone-icon icon="plus" size="sm" />
            </button>
            <div soneSidebarGroupContent>
              <ul soneSidebarMenu>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton variant="outline" size="sm" type="button" tooltip="New Workspace">
                    <sone-icon icon="plus" /><span>New Workspace (outline, sm)</span>
                  </button>
                </li>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton type="button" tooltip="Acme"><sone-icon icon="spaces" /><span>Acme</span></button>
                  <button soneSidebarMenuAction type="button" aria-label="Actions for Acme">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="4.5" cy="10" r="1.35" /><circle cx="10" cy="10" r="1.35" /><circle cx="15.5" cy="10" r="1.35" /></svg>
                  </button>
                </li>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton type="button" tooltip="Design"><sone-icon icon="spaces" /><span>Design (showOnHover)</span></button>
                  <button soneSidebarMenuAction showOnHover type="button" aria-label="Actions for Design">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="4.5" cy="10" r="1.35" /><circle cx="10" cy="10" r="1.35" /><circle cx="15.5" cy="10" r="1.35" /></svg>
                  </button>
                </li>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton size="sm" type="button" tooltip="Archive"><sone-icon icon="spaces" /><span>Archive (sm)</span></button>
                  <button soneSidebarMenuAction type="button" aria-label="Actions for Archive">
                    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><circle cx="4.5" cy="10" r="1.35" /><circle cx="10" cy="10" r="1.35" /><circle cx="15.5" cy="10" r="1.35" /></svg>
                  </button>
                </li>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton type="button" disabled tooltip="Disabled"><sone-icon icon="locked" /><span>Disabled</span></button>
                </li>
                <li soneSidebarMenuItem>
                  <button soneSidebarMenuButton size="lg" type="button" tooltip="Large button">
                    <sone-icon icon="ivy" /><span>Large (lg) button</span>
                  </button>
                  <span soneSidebarMenuBadge>7</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Skeleton: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>
          <section soneSidebarGroup aria-label="Loading">
            <div soneSidebarGroupLabel>Loading</div>
            <ul soneSidebarMenu>
              <li soneSidebarMenuItem><div soneSidebarMenuSkeleton showIcon></div></li>
              <li soneSidebarMenuItem><div soneSidebarMenuSkeleton showIcon></div></li>
              <li soneSidebarMenuItem><div soneSidebarMenuSkeleton showIcon></div></li>
              <li soneSidebarMenuItem><div soneSidebarMenuSkeleton></div></li>
              <li soneSidebarMenuItem><div soneSidebarMenuSkeleton></div></li>
            </ul>
          </section>
        </div>
      </sone-sidebar>`),
  }),
};

export const Floating: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" variant="floating" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>${nav}</div>
        ${footer}
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Offcanvas: Story = {
  decorators: [storyConfig(false)],
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="offcanvas" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>${nav}</div>
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Inset: Story = {
  render: () => ({
    template: frame(`
      <sone-sidebar collapsible="icon" variant="inset" role="navigation" aria-label="Story navigation">
        ${header}
        <div soneSidebarContent>${nav}</div>
        ${footer}
        <div soneSidebarRail></div>
      </sone-sidebar>`),
  }),
};

export const Right: Story = {
  render: () => ({
    template: `
      <div soneSidebarWrapper style="display: flex; height: 620px; overflow: hidden">
        <main soneSidebarInset style="padding: var(--space-6); color: var(--text-secondary)">
          <p style="margin: 0">The content column sits left of a right-hand sidebar.</p>
        </main>
        <sone-sidebar collapsible="icon" side="right" role="navigation" aria-label="Story navigation">
          ${header}
          <div soneSidebarContent>${nav}</div>
          ${footer}
          <div soneSidebarRail></div>
        </sone-sidebar>
      </div>`,
  }),
};

export const Static: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 620px; overflow: hidden">
        <sone-sidebar role="navigation" aria-label="Story navigation" style="width: var(--shell-sidebar-w)">
          <div soneSidebarContent>${nav}</div>
          ${footer}
        </sone-sidebar>
        <main soneSidebarInset style="padding: var(--space-6); color: var(--text-secondary)">
          <p style="margin: 0">A static sidebar: no data-state, no collapse.</p>
        </main>
      </div>`,
  }),
};

export const DangerGroup: Story = {
  render: () => ({
    template: `
      <div style="display: flex; height: 260px; overflow: hidden">
        <sone-sidebar role="navigation" aria-label="Developer navigation" style="width: var(--shell-sidebar-w)">
          <div soneSidebarContent>
            <nav soneSidebarGroup tone="danger" aria-label="Developer mode">
              <div soneSidebarGroupLabel>Developer mode</div>
              <ul soneSidebarMenu>
                <li soneSidebarMenuItem>
                  <a soneSidebarMenuButton href="#logs" isActive aria-current="page"><sone-icon icon="logs" /><span>Logs</span></a>
                </li>
                <li soneSidebarMenuItem>
                  <a soneSidebarMenuButton href="#flags"><sone-icon icon="settings" /><span>Feature flags</span></a>
                </li>
              </ul>
            </nav>
          </div>
        </sone-sidebar>
      </div>`,
  }),
};

export const HorizontalMenu: Story = {
  render: () => ({
    template: `
      <nav aria-label="Settings sections" style="max-width: 32rem">
        <ul soneSidebarMenu orientation="horizontal">
          <li soneSidebarMenuItem><a soneSidebarMenuButton href="#general" isActive aria-current="page">General</a></li>
          <li soneSidebarMenuItem><a soneSidebarMenuButton href="#recording">Recording</a></li>
          <li soneSidebarMenuItem><a soneSidebarMenuButton href="#privacy">Privacy</a></li>
          <li soneSidebarMenuItem><a soneSidebarMenuButton href="#account">Account</a></li>
        </ul>
      </nav>`,
  }),
};
