<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneField,
  SoneFieldLabel,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneKbd,
  SoneMenu,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuRadioItem,
  SoneMenuSeparator,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneProgress,
  SoneSegmented,
  SoneSelect,
  SoneStackedBar,
  SoneToggleGroup,
  SoneToggleGroupItem,
  type SegmentOption,
  type ShellIcon,
  type SoneStackedBarSegment,
} from "@surface-one/vue";

import {
  type StatusId,
  type IssueType,
  type PriorityId,
  type GroupBy,
  type Status,
  type Person,
  type Epic,
  type Comment,
  type Issue,
  type Lane,
  STATUSES,
  PEOPLE,
  ME,
  EPICS,
  POINTS,
  SPRINT,
  task,
  ISSUES,
  statusOf,
  personOf,
  epicOf,
  pointsOf,
  keyNumber,
} from "../data/board";

const TYPES: Record<IssueType, { label: string; icon: ShellIcon }> = {
  story: { label: "Story", icon: "bookmark" },
  task: { label: "Task", icon: "square-check" },
  bug: { label: "Bug", icon: "bug" },
};

const PRIORITIES: Record<PriorityId, { label: string; icon: ShellIcon }> = {
  highest: { label: "Highest", icon: "chevrons-up" },
  high: { label: "High", icon: "arrow-up" },
  medium: { label: "Medium", icon: "equal" },
  low: { label: "Low", icon: "arrow-down" },
  lowest: { label: "Lowest", icon: "chevrons-down" },
};

const sprint = SPRINT;
const statuses = STATUSES;
const people = PEOPLE;
const epics = EPICS;
const points = POINTS;
const me = ME;
const groupOptions: readonly SegmentOption[] = [
  { value: "none", label: "None" },
  { value: "assignee", label: "Assignee" },
  { value: "epic", label: "Epic" },
];
const typeOptions = (Object.keys(TYPES) as IssueType[]).map((value) => ({
  value,
  label: TYPES[value].label,
}));
const priorityOptions = (Object.keys(PRIORITIES) as PriorityId[]).map(
  (value) => ({ value, label: PRIORITIES[value].label }),
);

const root = ref<HTMLElement | null>(null);
const issues = ref<readonly Issue[]>(ISSUES);
const query = ref("");
const assignees = ref<readonly string[]>([]);
const mine = ref(false);
const recent = ref(false);
const bugs = ref(false);
const epic = ref("all");
const groupBy = ref<GroupBy>("none");
const collapsed = ref<readonly string[]>([]);
const selectedId = ref<string | null>(null);
const dragId = ref<string | null>(null);
/** `<lane>:<status>` under the dragged card. */
const dropTarget = ref<string | null>(null);
const creating = ref(false);
const newType = ref("story");
const newSummary = ref("");
const draft = ref("");
const announcement = ref("");

const filtering = computed(
  () =>
    !!query.value.trim() ||
    assignees.value.length > 0 ||
    mine.value ||
    recent.value ||
    bugs.value ||
    epic.value !== "all",
);

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  return issues.value.filter(
    (i) =>
      (!q ||
        i.summary.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q)) &&
      (!assignees.value.length || assignees.value.includes(i.assignee ?? "")) &&
      (!mine.value || i.assignee === ME) &&
      (!recent.value || i.updated <= 1) &&
      (!bugs.value || i.type === "bug") &&
      (epic.value === "all" || (i.epic ?? "none") === epic.value),
  );
});

const columns = computed(() =>
  STATUSES.map((status) => ({
    status,
    count: visible.value.filter((i) => i.status === status.id).length,
    // The limit counts every issue in the column, filtered out or not.
    over:
      status.wip !== null &&
      issues.value.filter((i) => i.status === status.id).length > status.wip,
  })),
);

function lane(
  key: string,
  title: string | null,
  list: readonly Issue[],
  person: Person | null = null,
  epicRef: Epic | null = null,
): Lane {
  return {
    key,
    title,
    person,
    epic: epicRef,
    count: list.length,
    points: pointsOf(list),
    cells: STATUSES.map((status) => ({
      status,
      issues: list.filter((i) => i.status === status.id),
    })),
  };
}

const lanes = computed<readonly Lane[]>(() => {
  const list = visible.value;
  if (groupBy.value === "none") return [lane("all", null, list)];
  if (groupBy.value === "assignee") {
    return [
      ...PEOPLE.map((p) =>
        lane(
          p.id,
          p.id === ME ? `${p.name} (you)` : p.name,
          list.filter((i) => i.assignee === p.id),
          p,
        ),
      ),
      lane(
        "none",
        "Unassigned",
        list.filter((i) => !i.assignee),
      ),
    ].filter((l) => l.count > 0);
  }
  return [
    ...EPICS.map((e) =>
      lane(
        e.id,
        e.name,
        list.filter((i) => i.epic === e.id),
        null,
        e,
      ),
    ),
    lane(
      "none",
      "No epic",
      list.filter((i) => !i.epic),
    ),
  ].filter((l) => l.count > 0);
});

const totalPoints = computed(() => pointsOf(issues.value));
const donePoints = computed(() =>
  pointsOf(issues.value.filter((i) => i.status === "done")),
);
const doneCount = computed(
  () => issues.value.filter((i) => i.status === "done").length,
);
const progressSegments = computed<SoneStackedBarSegment[]>(() => {
  const sum = (status: StatusId) =>
    pointsOf(issues.value.filter((i) => i.status === status));
  return [
    { key: "done", label: "Done", value: sum("done"), tone: "success" },
    {
      key: "review",
      label: "In review",
      value: sum("review"),
      tone: "chart-6",
    },
    {
      key: "progress",
      label: "In progress",
      value: sum("progress"),
      tone: "accent",
    },
  ];
});

const selected = computed(
  () => issues.value.find((i) => i.id === selectedId.value) ?? null,
);

const tone = (e: Epic): string => `var(--${e.tone})`;
const subtasksDone = (i: Issue): number =>
  i.subtasks.filter((t) => t.done).length;
const commentsOf = (i: Issue): readonly Comment[] => [...i.comments].reverse();
const updatedLabel = (i: Issue): string =>
  i.updated === 0
    ? "Today"
    : i.updated === 1
      ? "Yesterday"
      : `${i.updated} days ago`;

/** The column heading, prefixed by the lane name when the board is grouped. */
function cellLabel(l: Lane, status: Status): string {
  const column = `board-col-${status.id}`;
  return l.title === null ? column : `board-lane-name-${l.key} ${column}`;
}

function focus(selector: string): boolean {
  const el = root.value?.querySelector<HTMLElement>(selector);
  el?.focus();
  return !!el;
}

const focusLater = (selector: string): void => {
  void nextTick(() => focus(selector));
};

function say(message: string): void {
  announcement.value = message;
}

function completeSprint(): void {
  const open = issues.value.filter((i) => i.status !== "done").length;
  say(
    `${SPRINT.name} completed: ${doneCount.value} issues done, ${open} moved to the next sprint.`,
  );
}

function toggleAssignee(id: string): void {
  assignees.value = assignees.value.includes(id)
    ? assignees.value.filter((p) => p !== id)
    : [...assignees.value, id];
}

function setGroupBy(value: string): void {
  groupBy.value = value as GroupBy;
  collapsed.value = [];
}

function toggleLane(key: string): void {
  collapsed.value = collapsed.value.includes(key)
    ? collapsed.value.filter((k) => k !== key)
    : [...collapsed.value, key];
}

function clearFilters(): void {
  query.value = "";
  assignees.value = [];
  mine.value = false;
  recent.value = false;
  bugs.value = false;
  epic.value = "all";
}

function open(id: string): void {
  selectedId.value = id;
  draft.value = "";
  focusLater("#board-detail-title");
}

function close(): void {
  const id = selectedId.value;
  selectedId.value = null;
  if (id) focusLater(`#board-open-${id}`);
}

function update(id: string, fn: (issue: Issue) => Issue): void {
  issues.value = issues.value.map((i) => (i.id === id ? fn(i) : i));
}

function patch(id: string, changes: Partial<Issue>): void {
  update(id, (i) => ({ ...i, ...changes, updated: 0 }));
}

// ---- Moving issues: drag and drop, the card menu, the keyboard, the panel.

function moveTo(id: string, status: StatusId): void {
  const issue = issues.value.find((i) => i.id === id);
  if (!issue || issue.status === status) return;
  // A moved card goes to the bottom of its new column.
  issues.value = [
    ...issues.value.filter((i) => i.id !== id),
    { ...issue, status, updated: 0 },
  ];
  const target = statusOf(status);
  const over =
    target.wip !== null &&
    issues.value.filter((i) => i.status === status).length > target.wip;
  say(
    `${id} moved to ${target.label}.` +
      (over ? ` ${target.label} is over its limit of ${target.wip}.` : ""),
  );
}

function assign(id: string, person: string | null, announce = true): void {
  patch(id, { assignee: person });
  if (announce) {
    say(
      person
        ? `${id} assigned to ${personOf(person)?.name}.`
        : `${id} unassigned.`,
    );
  }
}

function toggleFlag(id: string): void {
  const issue = issues.value.find((i) => i.id === id);
  if (!issue) return;
  patch(id, { flagged: !issue.flagged });
  say(issue.flagged ? `Flag removed from ${id}.` : `${id} flagged.`);
}

function remove(id: string): void {
  // Focus moves to the next card in the same list, else to the board.
  const order = lanes.value.flatMap((l) =>
    l.cells.flatMap((c) => c.issues.map((i) => i.id)),
  );
  const at = order.indexOf(id);
  const next = order[at + 1] ?? order[at - 1];
  issues.value = issues.value.filter((i) => i.id !== id);
  if (selectedId.value === id) selectedId.value = null;
  say(`${id} deleted.`);
  void nextTick(
    () => (next && focus(`#board-open-${next}`)) || focus("#board-title"),
  );
}

function onDragStart(event: DragEvent, id: string): void {
  dragId.value = id;
  event.dataTransfer?.setData("text/plain", id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onDragEnd(): void {
  dragId.value = null;
  dropTarget.value = null;
}

function onDragOver(event: DragEvent, laneKey: string, status: StatusId): void {
  if (!dragId.value) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  dropTarget.value = `${laneKey}:${status}`;
}

function onDragLeave(
  event: DragEvent,
  laneKey: string,
  status: StatusId,
): void {
  const into = event.relatedTarget as Node | null;
  if (into && (event.currentTarget as Node).contains(into)) return;
  if (dropTarget.value === `${laneKey}:${status}`) dropTarget.value = null;
}

function onDrop(event: DragEvent, laneKey: string, status: StatusId): void {
  event.preventDefault();
  const id = dragId.value ?? event.dataTransfer?.getData("text/plain");
  onDragEnd();
  if (!id) return;
  // Dropped in another swimlane: the card takes that lane's assignee or epic.
  const value = laneKey === "none" ? null : laneKey;
  if (groupBy.value === "assignee") assign(id, value, false);
  if (groupBy.value === "epic") patch(id, { epic: value });
  moveTo(id, status);
}

/** Shift + ← / → moves the focused card one column; focus follows it. */
function onCardKeydown(event: KeyboardEvent, issue: Issue): void {
  if (!event.shiftKey) return;
  const delta =
    event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (!delta) return;
  event.preventDefault();
  const target =
    STATUSES[STATUSES.findIndex((s) => s.id === issue.status) + delta];
  if (!target) return;
  moveTo(issue.id, target.id);
  focusLater(`#board-open-${issue.id}`);
}

function rename(id: string, summary: string): void {
  const text = summary.trim();
  if (text) patch(id, { summary: text });
}

function setPoints(id: string, value: string): void {
  patch(id, { points: value ? Number(value) : null });
}

function toggleSubtask(id: string, subtask: string): void {
  update(id, (i) => ({
    ...i,
    subtasks: i.subtasks.map((t) =>
      t.id === subtask ? { ...t, done: !t.done } : t,
    ),
  }));
}

function addComment(id: string): void {
  const text = draft.value.trim();
  if (!text) return;
  update(id, (i) => ({
    ...i,
    comments: [
      ...i.comments,
      { id: `c${i.comments.length + 1}`, author: ME, when: "Just now", text },
    ],
  }));
  draft.value = "";
  say("Comment saved.");
}

// ---- Creating an issue inline, at the bottom of To Do.

function startCreate(): void {
  creating.value = true;
  focusLater("#board-new-summary");
}

function cancelCreate(): void {
  creating.value = false;
  newSummary.value = "";
  focusLater("#board-create");
}

function create(): void {
  const summary = newSummary.value.trim();
  if (!summary) return;
  const id = `SO-${Math.max(...issues.value.map((i) => keyNumber(i.id)), 153) + 1}`;
  issues.value = [
    ...issues.value,
    {
      id,
      type: newType.value as IssueType,
      summary,
      status: "todo",
      assignee: null,
      reporter: ME,
      priority: "medium",
      points: null,
      epic: epic.value === "all" || epic.value === "none" ? null : epic.value,
      labels: [],
      flagged: false,
      updated: 0,
      description: "No description yet.",
      subtasks: [],
      comments: [],
    },
  ];
  newSummary.value = "";
  say(`${id} created in To Do.`);
}

// No Vue row menu yet: a ghost icon button opens a SoneMenu, fixed to the viewport
// (teleported to <body>) so the scrolling board never clips it. `id` null is the
// board menu in the header.
const menu = ref<{ id: string | null; top: number; right: number } | null>(
  null,
);
const panel = ref<InstanceType<typeof SoneMenu> | null>(null);
const panelEl = (): HTMLElement | undefined => panel.value?.$el;
const menuIssue = computed(
  () => issues.value.find((i) => i.id === menu.value?.id) ?? null,
);
let menuTrigger: HTMLElement | null = null;

function toggleMenu(id: string | null, event: MouseEvent): void {
  if (menu.value && menu.value.id === id) return closeMenu();
  menuTrigger = event.currentTarget as HTMLElement;
  const rect = menuTrigger.getBoundingClientRect();
  menu.value = {
    id,
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

/** Runs a menu command, then returns focus to the trigger or to `focusAfter`. */
function menuAction(action: () => void, focusAfter?: string): void {
  action();
  closeMenu(!focusAfter);
  if (focusAfter) focusLater(focusAfter);
}

function removeFromMenu(id: string): void {
  closeMenu();
  remove(id);
}

const menuItems = (): HTMLElement[] =>
  Array.from(
    panelEl()?.querySelectorAll<HTMLElement>(
      '[role^="menuitem"]:not(:disabled)',
    ) ?? [],
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

onMounted(() =>
  document.addEventListener("pointerdown", onDocumentPointerdown),
);
onBeforeUnmount(() =>
  document.removeEventListener("pointerdown", onDocumentPointerdown),
);
</script>

<template>
  <div ref="root" class="shell">
    <div class="body">
      <SonePageHeader>
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Projects / Surface One</SonePageHeaderEyebrow>
          <SonePageHeaderTitle>{{ sprint.name }}</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            {{ sprint.goal }}
            <span class="sprint-dates"
              ><SoneIcon icon="clock" />{{ sprint.dates }} ·
              {{ sprint.remaining }} days remaining</span
            >
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            @click="completeSprint"
          >
            Complete sprint
          </SoneButton>
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="menu?.id === null"
            :aria-controls="menu?.id === null ? 'board-menu' : undefined"
            aria-label="Board actions"
            title="Board actions"
            @click="toggleMenu(null, $event)"
          >
            <SoneIcon icon="ellipsis" />
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <div class="toolbar">
        <SoneInputGroup class="search">
          <SoneInputGroupAddon as="span"
            ><SoneIcon icon="search"
          /></SoneInputGroupAddon>
          <SoneInputGroupInput
            v-model="query"
            type="search"
            aria-label="Search issues"
            placeholder="Search this board…"
          />
        </SoneInputGroup>
        <div class="people" role="group" aria-label="Filter by assignee">
          <button
            v-for="p in people"
            :key="p.id"
            type="button"
            class="person-filter"
            :aria-pressed="assignees.includes(p.id)"
            :title="p.name"
            @click="toggleAssignee(p.id)"
          >
            <SoneAvatar size="sm" aria-hidden="true"
              ><SoneAvatarFallback>{{
                p.initials
              }}</SoneAvatarFallback></SoneAvatar
            >
            <span class="sr-only">{{ p.name }}</span>
          </button>
        </div>
        <SoneToggleGroup
          variant="outline"
          size="sm"
          :spacing="1"
          role="group"
          aria-label="Quick filters"
        >
          <SoneToggleGroupItem
            type="button"
            :pressed="mine"
            @click="mine = !mine"
          >
            Only my issues
          </SoneToggleGroupItem>
          <SoneToggleGroupItem
            type="button"
            :pressed="recent"
            @click="recent = !recent"
          >
            Recently updated
          </SoneToggleGroupItem>
          <SoneToggleGroupItem
            type="button"
            :pressed="bugs"
            @click="bugs = !bugs"
          >
            Bugs
          </SoneToggleGroupItem>
        </SoneToggleGroup>
        <SoneSelect
          v-model="epic"
          class="epic-filter"
          size="sm"
          aria-label="Epic"
        >
          <option value="all">All epics</option>
          <option v-for="e in epics" :key="e.id" :value="e.id">
            {{ e.name }}
          </option>
          <option value="none">No epic</option>
        </SoneSelect>
        <span class="group-by">
          <span class="group-label" aria-hidden="true">Group by</span>
          <SoneSegmented
            size="sm"
            aria-label="Group by"
            :options="groupOptions"
            :model-value="groupBy"
            @update:model-value="setGroupBy"
          />
        </span>
        <SoneButton
          v-if="filtering"
          variant="ghost"
          size="sm"
          type="button"
          @click="clearFilters"
        >
          Clear filters
        </SoneButton>
      </div>

      <div class="summary">
        <div class="sprint-progress">
          <p class="progress-text">
            <strong class="num">{{ donePoints }}</strong> of
            <span class="num">{{ totalPoints }}</span> story points done ·
            {{ doneCount }} of {{ issues.length }} issues
          </p>
          <SoneStackedBar
            size="sm"
            aria-label="Sprint progress in story points"
            :segments="progressSegments"
            :max="totalPoints"
          />
        </div>
        <p id="board-hint" class="hint">
          Drag issues between columns, or focus one and press
          <SoneKbd>Shift</SoneKbd> + <SoneKbd>←</SoneKbd> /
          <SoneKbd>→</SoneKbd>.
        </p>
      </div>

      <h3 id="board-title" class="sr-only" tabindex="-1">Board</h3>
      <p class="sr-only" role="status">{{ announcement }}</p>

      <div class="board-scroll">
        <div class="board">
          <div class="board-head">
            <div
              v-for="col in columns"
              :key="col.status.id"
              class="col-head"
              :class="{ 'is-over': col.over }"
            >
              <h4 :id="'board-col-' + col.status.id" class="col-title">
                {{ col.status.label }}
              </h4>
              <SoneBadge
                :variant="col.over ? 'destructive' : 'secondary'"
                class="num"
                >{{ col.count }}<span class="sr-only"> issues</span></SoneBadge
              >
              <template v-if="col.status.wip !== null">
                <span class="wip">Max {{ col.status.wip }}</span>
                <span v-if="col.over" class="sr-only">Over the limit</span>
              </template>
            </div>
          </div>

          <div v-for="l in lanes" :key="l.key" class="lane">
            <h4 v-if="l.title !== null" class="lane-head">
              <button
                type="button"
                class="lane-toggle"
                :aria-expanded="!collapsed.includes(l.key)"
                :aria-controls="'board-lane-' + l.key"
                @click="toggleLane(l.key)"
              >
                <SoneIcon icon="chevron-right" class="lane-caret" />
                <SoneAvatar v-if="l.person" size="sm" aria-hidden="true"
                  ><SoneAvatarFallback>{{
                    l.person.initials
                  }}</SoneAvatarFallback></SoneAvatar
                >
                <span
                  v-else-if="l.epic"
                  class="epic-dot"
                  :style="{ '--tone': tone(l.epic) }"
                  ><SoneIcon icon="zap"
                /></span>
                <span :id="'board-lane-name-' + l.key" class="lane-name">{{
                  l.title
                }}</span>
                <span class="lane-meta"
                  >{{ l.count }} {{ l.count === 1 ? "issue" : "issues" }} ·
                  {{ l.points }} points</span
                >
              </button>
            </h4>
            <div
              v-if="!collapsed.includes(l.key)"
              :id="'board-lane-' + l.key"
              class="cells"
            >
              <ul
                v-for="cell in l.cells"
                :key="cell.status.id"
                class="cell"
                :class="{
                  'is-drop': dropTarget === l.key + ':' + cell.status.id,
                }"
                :aria-labelledby="cellLabel(l, cell.status)"
                @dragover="onDragOver($event, l.key, cell.status.id)"
                @dragleave="onDragLeave($event, l.key, cell.status.id)"
                @drop="onDrop($event, l.key, cell.status.id)"
              >
                <SoneCard
                  v-for="i in cell.issues"
                  :key="i.id"
                  as="li"
                  size="sm"
                  class="issue"
                  draggable="true"
                  :data-status="i.status"
                  :class="{
                    'is-flagged': i.flagged,
                    'is-selected': selectedId === i.id,
                    'is-dragging': dragId === i.id,
                  }"
                  @dragstart="onDragStart($event, i.id)"
                  @dragend="onDragEnd"
                >
                  <div class="issue-head">
                    <button
                      :id="'board-open-' + i.id"
                      type="button"
                      class="issue-open"
                      :aria-describedby="'board-meta-' + i.id"
                      :aria-controls="selected ? 'board-detail' : undefined"
                      aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
                      @click="open(i.id)"
                      @keydown="onCardKeydown($event, i)"
                    >
                      {{ i.summary }}
                    </button>
                    <SoneButton
                      variant="ghost"
                      size="icon-xs"
                      type="button"
                      class="issue-menu"
                      aria-haspopup="menu"
                      :aria-expanded="menu?.id === i.id"
                      :aria-controls="
                        menu?.id === i.id ? 'board-menu' : undefined
                      "
                      :aria-label="'Actions for ' + i.id"
                      :title="'Actions for ' + i.id"
                      @click="toggleMenu(i.id, $event)"
                    >
                      <SoneIcon icon="ellipsis" />
                    </SoneButton>
                  </div>
                  <p v-if="i.epic || i.labels.length" class="issue-tags">
                    <span
                      v-if="epicOf(i.epic)"
                      class="epic-tag"
                      :style="{ '--tone': tone(epicOf(i.epic)!) }"
                      >{{ epicOf(i.epic)!.name }}</span
                    >
                    <SoneBadge
                      v-for="label in i.labels"
                      :key="label"
                      variant="outline"
                      >{{ label }}</SoneBadge
                    >
                  </p>
                  <div :id="'board-meta-' + i.id" class="issue-meta">
                    <span class="type-icon" :data-type="i.type"
                      ><SoneIcon
                        :icon="TYPES[i.type].icon"
                        :label="TYPES[i.type].label"
                    /></span>
                    <span class="issue-key">{{ i.id }}</span>
                    <span v-if="i.flagged" class="flag"
                      ><SoneIcon icon="alert-circle" label="Flagged"
                    /></span>
                    <span v-if="i.subtasks.length" class="meta-count num"
                      ><SoneIcon icon="list-checks" />{{ subtasksDone(i) }}/{{
                        i.subtasks.length
                      }}<span class="sr-only"> subtasks done</span></span
                    >
                    <span v-if="i.comments.length" class="meta-count num"
                      ><SoneIcon icon="message-square" />{{ i.comments.length
                      }}<span class="sr-only">
                        {{
                          i.comments.length === 1 ? "comment" : "comments"
                        }}</span
                      ></span
                    >
                    <span class="meta-end">
                      <SoneBadge
                        v-if="i.points !== null"
                        variant="secondary"
                        class="points num"
                        >{{ i.points
                        }}<span class="sr-only"> story points</span></SoneBadge
                      >
                      <span class="priority" :data-priority="i.priority"
                        ><SoneIcon
                          :icon="PRIORITIES[i.priority].icon"
                          :label="PRIORITIES[i.priority].label + ' priority'"
                      /></span>
                      <template v-if="personOf(i.assignee)">
                        <SoneAvatar
                          size="sm"
                          aria-hidden="true"
                          :title="personOf(i.assignee)!.name"
                          ><SoneAvatarFallback>{{
                            personOf(i.assignee)!.initials
                          }}</SoneAvatarFallback></SoneAvatar
                        >
                        <span class="sr-only"
                          >Assigned to {{ personOf(i.assignee)!.name }}</span
                        >
                      </template>
                      <span v-else class="unassigned" title="Unassigned"
                        ><SoneIcon icon="user" label="Unassigned"
                      /></span>
                    </span>
                  </div>
                </SoneCard>
              </ul>
            </div>
          </div>

          <div class="board-foot">
            <form v-if="creating" class="create-form" @submit.prevent="create">
              <SoneSelect v-model="newType" size="sm" aria-label="Issue type">
                <option
                  v-for="t in typeOptions"
                  :key="t.value"
                  :value="t.value"
                >
                  {{ t.label }}
                </option>
              </SoneSelect>
              <input
                id="board-new-summary"
                v-model="newSummary"
                type="text"
                aria-label="Summary of the new issue"
                placeholder="What needs to be done?"
                autocomplete="off"
                @keydown.esc="cancelCreate"
              />
              <div class="create-actions">
                <SoneButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  @click="cancelCreate"
                >
                  Cancel
                </SoneButton>
                <SoneButton
                  size="sm"
                  type="submit"
                  :disabled="!newSummary.trim()"
                >
                  Create
                </SoneButton>
              </div>
            </form>
            <SoneButton
              v-else
              id="board-create"
              variant="ghost"
              size="sm"
              type="button"
              class="create-btn"
              @click="startCreate"
            >
              <SoneIcon icon="plus" /><span>Create issue</span>
            </SoneButton>
          </div>
        </div>
      </div>
      <p v-if="!visible.length" class="no-results">
        No issues match these filters.
      </p>
    </div>

    <!-- No Vue side panel component yet: the same classes as [soneSidePanel] and its parts. -->
    <div
      v-if="selected"
      id="board-detail"
      class="side-panel details"
      data-slot="side-panel"
      role="region"
      aria-labelledby="board-detail-title"
      @keydown.esc="close"
    >
      <div class="side-panel-header" data-slot="side-panel-header">
        <h3
          id="board-detail-title"
          class="side-panel-title"
          data-slot="side-panel-title"
          tabindex="-1"
        >
          <span class="type-icon" :data-type="selected.type"
            ><SoneIcon
              :icon="TYPES[selected.type].icon"
              :label="TYPES[selected.type].label"
          /></span>
          {{ selected.id }}
        </h3>
        <div class="side-panel-actions" data-slot="side-panel-actions">
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            :aria-pressed="selected.flagged"
            aria-label="Flagged"
            title="Flagged"
            @click="toggleFlag(selected.id)"
          >
            <SoneIcon icon="alert-circle" />
          </SoneButton>
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Close issue details"
            @click="close"
          >
            <SoneIcon icon="close" />
          </SoneButton>
        </div>
      </div>
      <div class="side-panel-content" data-slot="side-panel-content">
        <p v-if="selected.flagged" class="flag-note">
          <SoneIcon icon="alert-circle" /> Flagged as an impediment
        </p>
        <SoneField>
          <SoneFieldLabel for="board-summary">Summary</SoneFieldLabel>
          <textarea
            id="board-summary"
            class="summary-input"
            rows="2"
            :value="selected.summary"
            @change="
              rename(selected.id, ($event.target as HTMLTextAreaElement).value)
            "
            @keydown.enter.prevent="
              ($event.target as HTMLTextAreaElement).blur()
            "
          ></textarea>
        </SoneField>

        <div class="fields">
          <SoneField>
            <SoneFieldLabel for="board-status">Status</SoneFieldLabel>
            <SoneSelect
              size="sm"
              select-id="board-status"
              :model-value="selected.status"
              @selection-change="moveTo(selected.id, $event as StatusId)"
            >
              <option v-for="s in statuses" :key="s.id" :value="s.id">
                {{ s.label }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="board-assignee">Assignee</SoneFieldLabel>
            <SoneSelect
              size="sm"
              select-id="board-assignee"
              :model-value="selected.assignee ?? ''"
              @selection-change="assign(selected.id, $event || null)"
            >
              <option value="">Unassigned</option>
              <option v-for="p in people" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="board-priority">Priority</SoneFieldLabel>
            <SoneSelect
              size="sm"
              select-id="board-priority"
              :model-value="selected.priority"
              @selection-change="
                patch(selected.id, { priority: $event as PriorityId })
              "
            >
              <option
                v-for="p in priorityOptions"
                :key="p.value"
                :value="p.value"
              >
                {{ p.label }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField>
            <SoneFieldLabel for="board-points">Story points</SoneFieldLabel>
            <SoneSelect
              size="sm"
              select-id="board-points"
              :model-value="
                selected.points === null ? '' : '' + selected.points
              "
              @selection-change="setPoints(selected.id, $event)"
            >
              <option value="">None</option>
              <option v-for="n in points" :key="n" :value="'' + n">
                {{ n }}
              </option>
            </SoneSelect>
          </SoneField>
          <SoneField class="wide">
            <SoneFieldLabel for="board-epic">Epic</SoneFieldLabel>
            <SoneSelect
              size="sm"
              select-id="board-epic"
              :model-value="selected.epic ?? ''"
              @selection-change="patch(selected.id, { epic: $event || null })"
            >
              <option value="">No epic</option>
              <option v-for="e in epics" :key="e.id" :value="e.id">
                {{ e.name }}
              </option>
            </SoneSelect>
          </SoneField>
        </div>

        <dl class="props">
          <div>
            <dt>Reporter</dt>
            <dd class="person">
              <template v-if="personOf(selected.reporter)">
                <SoneAvatar size="sm" aria-hidden="true"
                  ><SoneAvatarFallback>{{
                    personOf(selected.reporter)!.initials
                  }}</SoneAvatarFallback></SoneAvatar
                >
                {{ personOf(selected.reporter)!.name }}
              </template>
            </dd>
          </div>
          <div>
            <dt>Labels</dt>
            <dd class="tags">
              <SoneBadge
                v-for="label in selected.labels"
                :key="label"
                variant="outline"
                >{{ label }}</SoneBadge
              >
              <template v-if="!selected.labels.length">None</template>
            </dd>
          </div>
          <div>
            <dt>Sprint</dt>
            <dd>{{ sprint.name }}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{{ updatedLabel(selected) }}</dd>
          </div>
        </dl>

        <h4 class="section-title">Description</h4>
        <p class="text">{{ selected.description }}</p>

        <h4 id="board-subtasks-title" class="section-title">
          Subtasks
          <span v-if="selected.subtasks.length" class="section-count num"
            >{{ subtasksDone(selected) }} of
            {{ selected.subtasks.length }} done</span
          >
        </h4>
        <template v-if="selected.subtasks.length">
          <SoneProgress
            aria-label="Subtasks done"
            :value="subtasksDone(selected)"
            :max="selected.subtasks.length"
          />
          <ul class="subtasks" aria-labelledby="board-subtasks-title">
            <li v-for="t in selected.subtasks" :key="t.id">
              <input
                :id="'board-subtask-' + t.id"
                type="checkbox"
                :checked="t.done"
                @change="toggleSubtask(selected.id, t.id)"
              />
              <label
                :for="'board-subtask-' + t.id"
                :class="{ 'is-done': t.done }"
                >{{ t.title }}</label
              >
            </li>
          </ul>
        </template>
        <p v-else class="text muted">No subtasks yet.</p>

        <h4 class="section-title">Activity</h4>
        <form class="comment-form" @submit.prevent="addComment(selected.id)">
          <SoneField>
            <SoneFieldLabel for="board-comment">Add a comment</SoneFieldLabel>
            <textarea
              id="board-comment"
              v-model="draft"
              rows="2"
              placeholder="Ask a question or post an update…"
            ></textarea>
          </SoneField>
          <SoneButton size="sm" type="submit" :disabled="!draft.trim()">
            Save
          </SoneButton>
        </form>
        <ol
          v-if="selected.comments.length"
          class="comments"
          aria-label="Comments, newest first"
        >
          <li v-for="c in commentsOf(selected)" :key="c.id">
            <SoneAvatar size="sm" aria-hidden="true"
              ><SoneAvatarFallback>{{
                personOf(c.author)?.initials
              }}</SoneAvatarFallback></SoneAvatar
            >
            <span class="comment-body">
              <span class="comment-meta"
                ><strong>{{ personOf(c.author)?.name }}</strong> ·
                {{ c.when }}</span
              >
              <span class="comment-text">{{ c.text }}</span>
            </span>
          </li>
        </ol>
      </div>
    </div>

    <Teleport to="body">
      <SoneMenu
        v-if="menu"
        id="board-menu"
        ref="panel"
        class="row-panel"
        :style="{ top: `${menu.top}px`, right: `${menu.right}px` }"
        :aria-label="
          menuIssue ? 'Actions for ' + menuIssue.id : 'Board actions'
        "
        tabindex="-1"
        @keydown="onMenuKeydown"
      >
        <template v-if="menuIssue">
          <SoneMenuGroup aria-label="Move to">
            <SoneMenuLabel>Move to</SoneMenuLabel>
            <SoneMenuRadioItem
              v-for="s in statuses"
              :key="s.id"
              type="button"
              :checked="menuIssue.status === s.id"
              @click="
                menuAction(
                  () => moveTo(menuIssue!.id, s.id),
                  `#board-open-${menuIssue!.id}`,
                )
              "
            >
              {{ s.label }}
            </SoneMenuRadioItem>
          </SoneMenuGroup>
          <SoneMenuSeparator />
          <SoneMenuItem
            type="button"
            @click="
              menuAction(() => open(menuIssue!.id), '#board-detail-title')
            "
          >
            <SoneIcon icon="eye" /> Open issue
          </SoneMenuItem>
          <SoneMenuItem
            type="button"
            :disabled="menuIssue.assignee === me"
            @click="menuAction(() => assign(menuIssue!.id, me))"
          >
            <SoneIcon icon="user" /> Assign to me
          </SoneMenuItem>
          <SoneMenuItem
            type="button"
            @click="menuAction(() => toggleFlag(menuIssue!.id))"
          >
            <SoneIcon icon="alert-circle" />
            {{ menuIssue.flagged ? "Remove flag" : "Add flag" }}
          </SoneMenuItem>
          <SoneMenuSeparator />
          <SoneMenuItem
            variant="destructive"
            type="button"
            @click="removeFromMenu(menuIssue!.id)"
          >
            <SoneIcon icon="trash" /> Delete
          </SoneMenuItem>
        </template>
        <template v-else>
          <SoneMenuItem
            type="button"
            @click="menuAction(() => say('Sprint details opened.'))"
          >
            <SoneIcon icon="edit" /> Edit sprint
          </SoneMenuItem>
          <SoneMenuItem
            type="button"
            @click="menuAction(() => say('Board settings opened.'))"
          >
            <SoneIcon icon="sliders" /> Board settings
          </SoneMenuItem>
          <SoneMenuItem
            type="button"
            @click="menuAction(() => say('Board link copied.'))"
          >
            <SoneIcon icon="link" /> Copy board link
          </SoneMenuItem>
        </template>
      </SoneMenu>
    </Teleport>
  </div>
</template>

<style scoped src="../styles/board.css"></style>
<style scoped src="../styles/board.twins.css"></style>
