<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneField,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneIcon,
  SoneLogo,
  SoneProgress,
  SoneSelect,
  type BadgeVariant,
  type ShellIcon,
  vSoneTooltip,
} from "@surface-one/vue";

import { type Task, type Comment, BRIEF } from "../data/workspace";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly badge?: number;
}

const STATUSES: Record<string, { label: string; variant: BadgeVariant }> = {
  todo: { label: "To do", variant: "outline" },
  progress: { label: "In progress", variant: "secondary" },
  review: { label: "In review", variant: "warning" },
  done: { label: "Done", variant: "success" },
};

const nav: readonly NavItem[] = [
  { id: "inbox", label: "Inbox", icon: "bell-ring", badge: 3 },
  { id: "tasks", label: "My tasks", icon: "list-checks" },
  { id: "meetings", label: "Meetings", icon: "meetings" },
  { id: "notes", label: "Notes", icon: "notes" },
];
const projects = [
  "Harbor launch",
  "Billing migration",
  "Onboarding v2",
] as const;
const statusOptions = Object.entries(STATUSES).map(([value, s]) => ({
  value,
  label: s.label,
}));

// Template-local sidebar state (no persistence), like the Angular sidebar service.
// The menu tooltips show only while the sidebar is collapsed to icons.
const navOpen = ref(true);
const navState = computed(() => (navOpen.value ? "expanded" : "collapsed"));

const details = ref(true);
const status = ref("progress");
const priority = ref("high");
const draft = ref("");
const tasks = ref<readonly Task[]>([
  { id: "map", label: "Map legacy_eur prices to cents", done: true },
  { id: "backfill", label: "Backfill affected subscriptions", done: false },
  { id: "dry-run", label: "Re-run the migration dry run", done: false },
]);
const comments = ref<readonly Comment[]>([
  {
    id: "c1",
    author: "Leo Ruiz",
    initials: "LR",
    time: "09:24",
    text: "Mapping is done in the PR. Backfill script is next.",
  },
  {
    id: "c2",
    author: "Ada Park",
    initials: "AP",
    time: "10:02",
    text: "Thanks! Please ping me once the dry run is green.",
  },
]);

const statusInfo = computed(() => STATUSES[status.value]!);
const doneCount = computed(() => tasks.value.filter((t) => t.done).length);

// DOMPurify needs a DOM, which server rendering does not have: the brief renders
// only after mount, so the server and the hydrating client both start empty.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const briefHtml = computed(() =>
  mounted.value
    ? DOMPurify.sanitize(
        marked.parse(BRIEF, { async: false, gfm: true, breaks: true }),
      )
    : "",
);

function toggle(id: string): void {
  tasks.value = tasks.value.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t,
  );
}

function comment(): void {
  const text = draft.value.trim();
  if (!text) return;
  comments.value = [
    ...comments.value,
    {
      id: `c${comments.value.length + 1}`,
      author: "You",
      initials: "YO",
      time: "now",
      text,
    },
  ];
  draft.value = "";
}
</script>

<template>
  <div data-slot="sidebar-wrapper" :data-state="navState" class="shell">
    <!-- No Vue sidebar component yet: the same markup and classes as [soneSidebarWrapper] / <sone-sidebar>. -->
    <!-- Left sidebar: navigation, collapses to icons -->
    <nav
      data-slot="sidebar"
      :data-state="navState"
      :data-collapsible="navOpen ? '' : 'icon'"
      data-variant="inset"
      data-side="left"
      aria-label="Workspace"
      class="nav"
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
                  <button
                    data-slot="sidebar-menu-button"
                    data-sidebar="menu-button"
                    data-size="default"
                    data-variant="default"
                    type="button"
                    :data-active="item.id === 'tasks' ? 'true' : undefined"
                    :aria-current="item.id === 'tasks' ? 'page' : undefined"
                    v-sone-tooltip:right="{
                      text: item.label,
                      disabled: navOpen,
                    }"
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
            <hr
              data-slot="sidebar-separator"
              data-sidebar="separator"
              data-orientation="horizontal"
              class="separator"
              role="none"
            />
            <div data-slot="sidebar-group" data-sidebar="group">
              <div data-slot="sidebar-group-label" data-sidebar="group-label">
                Projects
              </div>
              <ul data-slot="sidebar-menu" data-sidebar="menu">
                <li
                  v-for="p in projects"
                  :key="p"
                  data-slot="sidebar-menu-item"
                  data-sidebar="menu-item"
                >
                  <button
                    data-slot="sidebar-menu-button"
                    data-sidebar="menu-button"
                    data-size="sm"
                    data-variant="default"
                    type="button"
                    :data-active="
                      p === 'Billing migration' ? 'true' : undefined
                    "
                    v-sone-tooltip:right="{ text: p, disabled: navOpen }"
                  >
                    <SoneIcon icon="folder" /><span>{{ p }}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div data-slot="sidebar-footer" data-sidebar="footer">
            <ul data-slot="sidebar-menu" data-sidebar="menu">
              <li data-slot="sidebar-menu-item" data-sidebar="menu-item">
                <button
                  data-slot="sidebar-menu-button"
                  data-sidebar="menu-button"
                  data-size="default"
                  data-variant="default"
                  type="button"
                  v-sone-tooltip:right="{ text: 'Settings', disabled: navOpen }"
                >
                  <SoneIcon icon="settings" /><span>Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <!-- The rail toggles the sidebar on click (the Angular rail also resizes it by dragging). -->
      <div
        data-slot="sidebar-rail"
        data-sidebar="rail"
        role="button"
        tabindex="-1"
        aria-label="Toggle sidebar"
        :title="navOpen ? 'Click to collapse' : 'Click to expand'"
        @click="navOpen = !navOpen"
      ></div>
    </nav>

    <div data-slot="sidebar-inset" class="inset">
      <div class="topbar">
        <SoneButton
          variant="ghost"
          size="icon-sm"
          type="button"
          data-sidebar="trigger"
          aria-label="Toggle navigation"
          :aria-expanded="navOpen"
          @click="navOpen = !navOpen"
        >
          <SoneIcon icon="sidebar" />
        </SoneButton>
        <span class="crumbs"
          >Billing migration <span aria-hidden="true">/</span> NW-142</span
        >
        <span class="spacer"></span>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="Show details"
          aria-controls="ws-details"
          :aria-expanded="details"
          @click="details = !details"
        >
          <SoneIcon icon="sidebar" class="flip" />
        </SoneButton>
      </div>

      <div class="main">
        <!-- Centre: the task itself -->
        <article class="content" aria-labelledby="ws-title">
          <p class="eyebrow">
            NW-142 ·
            <SoneBadge :variant="statusInfo.variant">{{
              statusInfo.label
            }}</SoneBadge>
          </p>
          <h2 id="ws-title">Fix the EUR price mapping before the freeze</h2>
          <!-- No Vue markdown component yet: the same markup and classes as <sone-markdown>. -->
          <div
            class="markdown"
            data-slot="markdown"
            data-size="sm"
            v-html="briefHtml"
          ></div>

          <h3 class="sub">
            Checklist
            <span class="sub-meta">{{ doneCount }} of {{ tasks.length }}</span>
          </h3>
          <SoneProgress
            size="sm"
            aria-label="Checklist progress"
            :value="doneCount"
            :max="tasks.length"
          />
          <ul class="tasks">
            <li v-for="t in tasks" :key="t.id">
              <SoneField orientation="horizontal">
                <input
                  :id="'ws-task-' + t.id"
                  type="checkbox"
                  :checked="t.done"
                  @change="toggle(t.id)"
                />
                <SoneFieldLabel
                  :for="'ws-task-' + t.id"
                  :class="{ done: t.done }"
                  >{{ t.label }}</SoneFieldLabel
                >
              </SoneField>
            </li>
          </ul>

          <h3 class="sub">Activity</h3>
          <!-- No Vue message component yet: the same data-slot attributes as [soneMessage*]. -->
          <div data-slot="message-group" class="activity">
            <div
              v-for="c in comments"
              :key="c.id"
              data-slot="message"
              data-align="start"
            >
              <SoneAvatar
                data-slot="message-avatar"
                size="sm"
                aria-hidden="true"
              >
                <SoneAvatarFallback>{{ c.initials }}</SoneAvatarFallback>
              </SoneAvatar>
              <div data-slot="message-content">
                <div data-slot="message-header">
                  {{ c.author }} · {{ c.time }}
                </div>
                <p class="comment">{{ c.text }}</p>
              </div>
            </div>
          </div>
          <form class="reply" @submit.prevent="comment">
            <label class="sr-only" for="ws-comment">Add a comment</label>
            <textarea
              id="ws-comment"
              v-model="draft"
              rows="2"
              placeholder="Add a comment…"
            ></textarea>
            <SoneButton size="sm" type="submit" :disabled="!draft.trim()"
              >Comment</SoneButton
            >
          </form>
        </article>
      </div>
    </div>
    <!-- Right sidebar: properties of the task -->
    <!-- No Vue side panel component yet: the same classes as [soneSidePanel] and its parts. -->
    <div
      v-if="details"
      id="ws-details"
      class="side-panel details"
      data-slot="side-panel"
      role="region"
      aria-labelledby="ws-details-title"
    >
      <div class="side-panel-header" data-slot="side-panel-header">
        <h3
          id="ws-details-title"
          class="side-panel-title"
          data-slot="side-panel-title"
        >
          Details
        </h3>
        <div class="side-panel-actions" data-slot="side-panel-actions">
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Hide details"
            @click="details = false"
          >
            <SoneIcon icon="close" />
          </SoneButton>
        </div>
      </div>
      <div class="side-panel-content" data-slot="side-panel-content">
        <SoneFieldGroup>
          <SoneField>
            <SoneFieldLabel for="ws-status">Status</SoneFieldLabel>
            <SoneSelect v-model="status" size="sm" select-id="ws-status">
              <option
                v-for="s in statusOptions"
                :key="s.value"
                :value="s.value"
              >
                {{ s.label }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="ws-priority">Priority</SoneFieldLabel>
            <SoneSelect v-model="priority" size="sm" select-id="ws-priority">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </SoneSelect>
          </SoneField>
        </SoneFieldGroup>
        <dl class="props">
          <div>
            <dt>Assignee</dt>
            <dd class="person">
              <SoneAvatar size="sm" aria-hidden="true"
                ><SoneAvatarFallback>LR</SoneAvatarFallback></SoneAvatar
              >
              Leo Ruiz
            </dd>
          </div>
          <div>
            <dt>Reviewer</dt>
            <dd class="person">
              <SoneAvatar size="sm" aria-hidden="true"
                ><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar
              >
              Ada Park
            </dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>Oct 14</dd>
          </div>
          <div>
            <dt>Estimate</dt>
            <dd>3 points</dd>
          </div>
          <div>
            <dt>Labels</dt>
            <dd class="labels">
              <SoneBadge variant="outline">billing</SoneBadge>
              <SoneBadge variant="outline">migration</SoneBadge>
              <SoneBadge variant="destructive">blocker</SoneBadge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<style scoped src="../styles/workspace.css"></style>
