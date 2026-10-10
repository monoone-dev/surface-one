<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
  SoneIcon,
  SoneLogo,
  SoneMenu,
  SoneMenuItem,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSegmented,
  SoneTable,
  vSoneTooltip,
  type BadgeVariant,
  type SegmentOption,
  type ShellIcon,
  type SoneTableColumn,
} from "@surface-one/vue";

type ProjectStatus = "on-track" | "at-risk" | "planning" | "blocked" | "done";

interface Project {
  readonly id: string;
  readonly name: string;
  readonly team: string;
  readonly owner: string;
  readonly status: ProjectStatus;
  readonly due: string;
  readonly progress: number;
}

interface Stat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly trend: BadgeVariant;
  readonly hint: string;
}

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly badge?: number;
}

const STATUS: Record<ProjectStatus, { label: string; variant: BadgeVariant }> =
  {
    "on-track": { label: "On track", variant: "success" },
    "at-risk": { label: "At risk", variant: "warning" },
    planning: { label: "Planning", variant: "secondary" },
    blocked: { label: "Blocked", variant: "destructive" },
    done: { label: "Done", variant: "outline" },
  };

const PROJECTS: readonly Project[] = [
  {
    id: "p1",
    name: "Harbor launch",
    team: "Product",
    owner: "Ada Park",
    status: "on-track",
    due: "Oct 18",
    progress: 72,
  },
  {
    id: "p2",
    name: "Billing migration",
    team: "Platform",
    owner: "Leo Ruiz",
    status: "at-risk",
    due: "Oct 24",
    progress: 41,
  },
  {
    id: "p3",
    name: "Onboarding checklist v2",
    team: "Growth",
    owner: "Mina Sato",
    status: "planning",
    due: "Nov 02",
    progress: 12,
  },
  {
    id: "p4",
    name: "Search relevance study",
    team: "Research",
    owner: "Theo Grant",
    status: "blocked",
    due: "Oct 30",
    progress: 35,
  },
  {
    id: "p5",
    name: "Partner portal refresh",
    team: "Design",
    owner: "Iris Novak",
    status: "on-track",
    due: "Nov 08",
    progress: 58,
  },
  {
    id: "p6",
    name: "Quarterly security review",
    team: "Platform",
    owner: "Sam Okafor",
    status: "done",
    due: "Sep 29",
    progress: 100,
  },
];

const nav: readonly NavItem[] = [
  { id: "overview", label: "Overview", icon: "dashboards" },
  { id: "projects", label: "Projects", icon: "folder" },
  { id: "meetings", label: "Meetings", icon: "meetings" },
  { id: "reminders", label: "Reminders", icon: "reminders", badge: 4 },
  { id: "people", label: "People", icon: "people" },
];
const teams = ["Product", "Platform", "Growth", "Design"] as const;
const stats: readonly Stat[] = [
  {
    id: "active",
    label: "Active projects",
    value: "12",
    delta: "+2",
    trend: "success",
    hint: "vs. last quarter",
  },
  {
    id: "risk",
    label: "At risk",
    value: "3",
    delta: "+1",
    trend: "warning",
    hint: "Needs an owner check-in",
  },
  {
    id: "velocity",
    label: "Tasks closed",
    value: "184",
    delta: "+12%",
    trend: "success",
    hint: "Last 30 days",
  },
  {
    id: "budget",
    label: "Budget used",
    value: "64%",
    delta: "−4%",
    trend: "secondary",
    hint: "Of the Q4 allocation",
  },
];
const filters: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "attention", label: "Needs attention" },
];
const columns: readonly SoneTableColumn[] = [
  { key: "name", header: "Project" },
  { key: "owner", header: "Owner", width: "150px" },
  { key: "status", header: "Status", width: "120px" },
  { key: "progress", header: "Progress", width: "90px", alignEnd: true },
  { key: "due", header: "Due", width: "80px", alignEnd: true },
  { key: "actions", header: "Actions", hideHeader: true, width: "48px" },
];

// A template-local sidebar state (no persistence), open by default.
const sidebarOpen = ref(true);
const sidebarState = computed(() =>
  sidebarOpen.value ? "expanded" : "collapsed",
);
const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value;
};

const activeNav = ref("overview");
const activeLabel = computed(
  () => nav.find((n) => n.id === activeNav.value)?.label ?? "",
);
const filter = ref("all");
const projects = ref<readonly Project[]>(PROJECTS);
const visibleProjects = computed(() => {
  const rows = projects.value;
  switch (filter.value) {
    case "active":
      return rows.filter((p) => p.status !== "done");
    case "attention":
      return rows.filter(
        (p) => p.status === "at-risk" || p.status === "blocked",
      );
    default:
      return rows;
  }
});

const byId = (row: Project): string => row.id;

function archive(id: string): void {
  projects.value = projects.value.filter((p) => p.id !== id);
}

// No Vue row menu yet: a ghost icon button opens a SoneMenu, fixed to the viewport
// (teleported to <body>) so the scrolling table never clips it.
const menu = ref<{ row: Project; top: number; right: number } | null>(null);
const panel = ref<InstanceType<typeof SoneMenu> | null>(null);
const panelEl = (): HTMLElement | undefined => panel.value?.$el;
let menuTrigger: HTMLElement | null = null;

function toggleMenu(row: Project, event: MouseEvent): void {
  if (menu.value?.row.id === row.id) return closeMenu();
  menuTrigger = event.currentTarget as HTMLElement;
  const rect = menuTrigger.getBoundingClientRect();
  menu.value = {
    row,
    top: rect.bottom + 4,
    right: window.innerWidth - rect.right,
  };
  // Opened from the keyboard: move focus into the menu.
  if (event.detail === 0) void nextTick(() => menuItems()[0]?.focus());
}

function closeMenu(restoreFocus = false): void {
  menu.value = null;
  if (restoreFocus) menuTrigger?.focus();
}

const menuItems = (): HTMLElement[] =>
  Array.from(
    panelEl()?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
  );

function onMenuKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" || event.key === "Tab") {
    closeMenu(true);
    return;
  }
  const items = menuItems();
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next: Record<string, number> = {
    ArrowDown: (current + 1) % items.length,
    ArrowUp: (current - 1 + items.length) % items.length,
    Home: 0,
    End: items.length - 1,
  };
  if (!(event.key in next)) return;
  event.preventDefault();
  items[next[event.key]!]?.focus();
}

function onDocumentPointerdown(event: PointerEvent): void {
  const target = event.target as Node;
  if (!menu.value || panelEl()?.contains(target)) return;
  if (menuTrigger?.contains(target)) return;
  closeMenu();
}

// ⌘B / Ctrl+B toggles the sidebar, as in <sone-sidebar-wrapper>.
function onDocumentKeydown(event: KeyboardEvent): void {
  if (event.defaultPrevented || !(event.metaKey || event.ctrlKey)) return;
  if (event.altKey || event.shiftKey || event.key.toLowerCase() !== "b") return;
  const el = event.target as HTMLElement | null;
  if (el?.closest("input, textarea, select, [contenteditable]")) return;
  event.preventDefault();
  toggleSidebar();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerdown);
  document.addEventListener("keydown", onDocumentKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerdown);
  document.removeEventListener("keydown", onDocumentKeydown);
});
</script>

<template>
  <!-- No Vue sidebar component yet: the same markup and classes as <sone-sidebar>. -->
  <div data-slot="sidebar-wrapper" :data-state="sidebarState" class="shell">
    <div
      data-slot="sidebar"
      :data-state="sidebarState"
      :data-collapsible="sidebarOpen ? '' : 'icon'"
      data-variant="sidebar"
      data-side="left"
      role="navigation"
      aria-label="Workspace"
    >
      <div data-slot="sidebar-container" data-side="left">
        <div data-slot="sidebar-inner" data-sidebar="sidebar">
          <div data-slot="sidebar-header" data-sidebar="header">
            <div class="brand">
              <SoneLogo size="sm" />
              <span class="brand-name">Northwind Studio</span>
            </div>
          </div>
          <div data-slot="sidebar-content" data-sidebar="content">
            <div data-slot="sidebar-group" data-sidebar="group">
              <div data-slot="sidebar-group-label" data-sidebar="group-label">
                Workspace
              </div>
              <ul data-slot="sidebar-menu" data-sidebar="menu">
                <li
                  v-for="item in nav"
                  :key="item.id"
                  data-slot="sidebar-menu-item"
                  data-sidebar="menu-item"
                >
                  <!-- The tooltip only shows while the sidebar is collapsed to icons. -->
                  <button
                    v-sone-tooltip:right="{
                      text: item.label,
                      disabled: sidebarOpen,
                    }"
                    data-slot="sidebar-menu-button"
                    data-sidebar="menu-button"
                    data-size="default"
                    data-variant="default"
                    :data-active="activeNav === item.id ? 'true' : undefined"
                    :aria-current="activeNav === item.id ? 'page' : undefined"
                    type="button"
                    @click="activeNav = item.id"
                  >
                    <SoneIcon :icon="item.icon" /><span>{{ item.label }}</span>
                  </button>
                  <span
                    v-if="item.badge"
                    data-slot="sidebar-menu-badge"
                    data-sidebar="menu-badge"
                    >{{ item.badge }}</span
                  >
                </li>
              </ul>
            </div>
            <hr data-slot="sidebar-separator" data-sidebar="separator" />
            <div data-slot="sidebar-group" data-sidebar="group">
              <div data-slot="sidebar-group-label" data-sidebar="group-label">
                Teams
              </div>
              <ul data-slot="sidebar-menu" data-sidebar="menu">
                <li
                  v-for="team in teams"
                  :key="team"
                  data-slot="sidebar-menu-item"
                  data-sidebar="menu-item"
                >
                  <button
                    v-sone-tooltip:right="{ text: team, disabled: sidebarOpen }"
                    data-slot="sidebar-menu-button"
                    data-sidebar="menu-button"
                    data-size="sm"
                    data-variant="default"
                    type="button"
                  >
                    <SoneIcon icon="spaces" /><span>{{ team }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div data-slot="sidebar-footer" data-sidebar="footer">
            <ul data-slot="sidebar-menu" data-sidebar="menu">
              <li data-slot="sidebar-menu-item" data-sidebar="menu-item">
                <button
                  v-sone-tooltip:right="{
                    text: 'Ada Park',
                    disabled: sidebarOpen,
                  }"
                  data-slot="sidebar-menu-button"
                  data-sidebar="menu-button"
                  data-size="lg"
                  data-variant="default"
                  type="button"
                >
                  <SoneAvatar size="sm" aria-hidden="true"
                    ><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar
                  >
                  <span class="user">
                    <span class="user-name">Ada Park</span>
                    <span class="user-role">Product lead</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
          <!-- The rail toggles on click (the Angular one also drags to resize). -->
          <div
            data-slot="sidebar-rail"
            data-sidebar="rail"
            role="button"
            tabindex="-1"
            aria-label="Toggle sidebar"
            :title="sidebarOpen ? 'Click to collapse' : 'Click to expand'"
            @click="toggleSidebar"
          ></div>
        </div>
      </div>
    </div>

    <div data-slot="sidebar-inset" class="inset">
      <div class="topbar">
        <SoneButton
          data-sidebar="trigger"
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="Toggle sidebar"
          :aria-expanded="sidebarOpen"
          @click="toggleSidebar"
        >
          <SoneIcon icon="sidebar" />
        </SoneButton>
        <span class="crumbs"
          >Workspace <span aria-hidden="true">/</span> {{ activeLabel }}</span
        >
      </div>

      <div class="body">
        <SonePageHeader as="div">
          <SonePageHeaderContent>
            <SonePageHeaderEyebrow>Q4 portfolio</SonePageHeaderEyebrow>
            <SonePageHeaderTitle as="h2">Overview</SonePageHeaderTitle>
            <SonePageHeaderDescription>
              Delivery health across every active project, updated a few minutes
              ago.
            </SonePageHeaderDescription>
          </SonePageHeaderContent>
          <SonePageHeaderActions>
            <SoneButton variant="outline" size="sm" type="button">
              <SoneIcon icon="download" /><span>Export</span>
            </SoneButton>
            <SoneButton size="sm" type="button">
              <SoneIcon icon="plus" /><span>New project</span>
            </SoneButton>
          </SonePageHeaderActions>
        </SonePageHeader>

        <ul class="stats" aria-label="Key metrics">
          <SoneCard
            v-for="stat in stats"
            :key="stat.id"
            as="li"
            size="sm"
            class="stat"
          >
            <SoneCardHeader>
              <SoneCardTitle class="stat-label">{{ stat.label }}</SoneCardTitle>
              <SoneCardAction as="span"
                ><SoneBadge :variant="stat.trend">{{
                  stat.delta
                }}</SoneBadge></SoneCardAction
              >
            </SoneCardHeader>
            <SoneCardContent>
              <p class="stat-value">{{ stat.value }}</p>
              <p class="stat-hint">{{ stat.hint }}</p>
            </SoneCardContent>
          </SoneCard>
        </ul>

        <SoneCard class="projects">
          <SoneCardHeader>
            <SoneCardTitle id="dash-projects-title">Projects</SoneCardTitle>
            <SoneCardDescription>
              {{ visibleProjects.length }} of {{ projects.length }} projects
            </SoneCardDescription>
            <SoneCardAction>
              <SoneSegmented
                v-model="filter"
                size="sm"
                aria-label="Filter projects"
                :options="filters"
              />
            </SoneCardAction>
          </SoneCardHeader>
          <SoneCardContent>
            <SoneTable
              :rows="visibleProjects"
              :columns="columns"
              :row-key="byId"
              caption="Projects due this quarter"
              empty-text="No projects match this filter."
            >
              <template #cell-name="{ row }">
                <span class="project">
                  <span class="project-name">{{ (row as Project).name }}</span>
                  <span class="project-team">{{ (row as Project).team }}</span>
                </span>
              </template>
              <template #cell-status="{ row }">
                <SoneBadge :variant="STATUS[(row as Project).status].variant">{{
                  STATUS[(row as Project).status].label
                }}</SoneBadge>
              </template>
              <template #cell-progress="{ row }">
                <span class="num">{{ (row as Project).progress }}%</span>
              </template>
              <template #cell-due="{ row }">
                <span class="num">{{ (row as Project).due }}</span>
              </template>
              <template #cell-actions="{ row }">
                <SoneButton
                  variant="ghost"
                  size="icon-xs"
                  type="button"
                  aria-haspopup="menu"
                  :aria-expanded="menu?.row.id === (row as Project).id"
                  :aria-controls="
                    menu?.row.id === (row as Project).id
                      ? 'dash-row-menu'
                      : undefined
                  "
                  :aria-label="'Actions for ' + (row as Project).name"
                  :title="'Actions for ' + (row as Project).name"
                  @click="toggleMenu(row as Project, $event)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </SoneButton>
              </template>
            </SoneTable>
          </SoneCardContent>
        </SoneCard>
      </div>
    </div>

    <Teleport to="body">
      <SoneMenu
        v-if="menu"
        id="dash-row-menu"
        ref="panel"
        class="row-panel"
        :style="{ top: `${menu.top}px`, right: `${menu.right}px` }"
        :aria-label="'Actions for ' + menu.row.name"
        tabindex="-1"
        @keydown="onMenuKeydown"
      >
        <SoneMenuItem type="button" @click="closeMenu(true)">
          <SoneIcon icon="eye" /> Open
        </SoneMenuItem>
        <SoneMenuItem type="button" @click="closeMenu(true)">
          <SoneIcon icon="copy" /> Duplicate
        </SoneMenuItem>
        <SoneMenuItem
          type="button"
          variant="destructive"
          @click="
            archive(menu.row.id);
            closeMenu();
          "
        >
          <SoneIcon icon="trash" /> Archive
        </SoneMenuItem>
      </SoneMenu>
    </Teleport>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  height: 640px;
  overflow: hidden;
}
.brand {
  /* A menu row: the logo's centre sits on the menu icons' column, so it stays
     aligned when the sidebar collapses to icons. */
  display: flex;
  align-items: center;
  gap: var(--sidebar-label-gap);
  min-width: 0;
  height: var(--sidebar-row-h);
  padding-left: calc(
    var(--sidebar-row-pad-x) + var(--sidebar-icon-size) / 2 - var(--space-3)
  );
}
.brand-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user {
  display: grid;
  min-width: 0;
  line-height: var(--leading-tight);
}
.user-name {
  font-weight: var(--font-weight-medium);
}
.user-role {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.inset {
  min-height: 0;
}
.topbar {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.crumbs {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: var(--space-4);
  margin: 0 0 var(--space-5);
  padding: 0;
  list-style: none;
}
.stat-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.stat-value {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
  line-height: var(--leading-tight);
}
.stat-hint {
  margin: var(--space-1) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.project {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}
.project-name {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
.project-team {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.num {
  font-variant-numeric: tabular-nums;
}
.row-panel {
  position: fixed;
  z-index: var(--z-overlay);
  max-width: calc(100vw - 2 * var(--space-4));
}
@media (max-width: 720px) {
  [data-slot="sidebar"] {
    display: none;
  }
  .topbar [data-sidebar="trigger"] {
    display: none;
  }
  .body {
    padding: var(--space-4);
  }
}
</style>
