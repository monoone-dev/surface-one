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

type StatusId = "todo" | "progress" | "review" | "done";
type IssueType = "story" | "task" | "bug";
type PriorityId = "highest" | "high" | "medium" | "low" | "lowest";
type GroupBy = "none" | "assignee" | "epic";

interface Status {
  readonly id: StatusId;
  readonly label: string;
  /** Work-in-progress limit: the column turns red above it. */
  readonly wip: number | null;
}

interface Person {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

interface Epic {
  readonly id: string;
  readonly name: string;
  /** A categorical chart tone: `chart-1` … `chart-8`. */
  readonly tone: string;
}

interface Subtask {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

interface Comment {
  readonly id: string;
  readonly author: string;
  readonly when: string;
  readonly text: string;
}

interface Issue {
  /** The issue key, e.g. `SO-141`. */
  readonly id: string;
  readonly type: IssueType;
  readonly summary: string;
  readonly status: StatusId;
  readonly assignee: string | null;
  readonly reporter: string;
  readonly priority: PriorityId;
  readonly points: number | null;
  readonly epic: string | null;
  readonly labels: readonly string[];
  readonly flagged: boolean;
  /** Days since the last change: 0 is today. */
  readonly updated: number;
  readonly description: string;
  readonly subtasks: readonly Subtask[];
  readonly comments: readonly Comment[];
}

/** A drop target or a lane: everything in one row of the board. */
interface Lane {
  readonly key: string;
  readonly title: string | null;
  readonly person: Person | null;
  readonly epic: Epic | null;
  readonly count: number;
  readonly points: number;
  readonly cells: readonly {
    readonly status: Status;
    readonly issues: readonly Issue[];
  }[];
}

const STATUSES: readonly Status[] = [
  { id: "todo", label: "To Do", wip: null },
  { id: "progress", label: "In Progress", wip: 3 },
  { id: "review", label: "In Review", wip: null },
  { id: "done", label: "Done", wip: null },
];

const PEOPLE: readonly Person[] = [
  { id: "ms", name: "Mina Sato", initials: "MS" },
  { id: "ap", name: "Ada Park", initials: "AP" },
  { id: "lr", name: "Leo Ruiz", initials: "LR" },
  { id: "tg", name: "Theo Grant", initials: "TG" },
  { id: "nh", name: "Noor Haddad", initials: "NH" },
];

/** The signed-in user: "Only my issues" and "Assign to me". */
const ME = "ms";

const EPICS: readonly Epic[] = [
  { id: "checkout", name: "Checkout v2", tone: "chart-1" },
  { id: "mobile", name: "Mobile app", tone: "chart-3" },
  { id: "tokens", name: "Design tokens", tone: "chart-5" },
];

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

const POINTS = [1, 2, 3, 5, 8, 13] as const;

/** The sprint, fixed so the screen renders the same on the server and the client. */
const SPRINT = {
  name: "SO Sprint 14",
  goal: "Ship guest-friendly checkout and the mobile push beta.",
  dates: "Oct 1 – Oct 14",
  remaining: 4,
};

const task = (id: string, title: string, done = false): Subtask => ({
  id,
  title,
  done,
});

const ISSUES: readonly Issue[] = [
  {
    id: "SO-148",
    type: "story",
    summary: "Save cart items for later",
    status: "todo",
    assignee: "ap",
    reporter: "ms",
    priority: "high",
    points: 5,
    epic: "checkout",
    labels: ["frontend"],
    flagged: false,
    updated: 1,
    description:
      "Shoppers can move an item out of the cart into a saved list and bring it back later, signed in or not.",
    subtasks: [
      task("t1", "Saved list API"),
      task("t2", "Move between cart and list"),
      task("t3", "Empty state"),
    ],
    comments: [
      {
        id: "c1",
        author: "ms",
        when: "Oct 9",
        text: "Guests keep the list in local storage until they sign in.",
      },
    ],
  },
  {
    id: "SO-149",
    type: "task",
    summary: "Add Apple Pay to the payment step",
    status: "todo",
    assignee: null,
    reporter: "lr",
    priority: "medium",
    points: 3,
    epic: "checkout",
    labels: ["payments"],
    flagged: false,
    updated: 3,
    description:
      "Offer Apple Pay above the card form on Safari and iOS, behind the payments feature flag.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-150",
    type: "bug",
    summary: "Date picker closes on the first tap on iOS",
    status: "todo",
    assignee: "tg",
    reporter: "nh",
    priority: "high",
    points: 2,
    epic: "mobile",
    labels: ["ios"],
    flagged: true,
    updated: 0,
    description:
      "On iOS 18 the delivery date picker opens and closes again on the same tap. Blocks the release candidate.",
    subtasks: [task("t1", "Reproduce on a device", true), task("t2", "Fix")],
    comments: [
      {
        id: "c1",
        author: "tg",
        when: "Oct 10",
        text: "Flagged: the release candidate waits on this one.",
      },
    ],
  },
  {
    id: "SO-151",
    type: "story",
    summary: "Dark mode for the onboarding screens",
    status: "todo",
    assignee: "ms",
    reporter: "ap",
    priority: "medium",
    points: 3,
    epic: "mobile",
    labels: ["design"],
    flagged: false,
    updated: 4,
    description: "The three onboarding screens follow the system colour mode.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-152",
    type: "task",
    summary: "Document the spacing scale",
    status: "todo",
    assignee: "nh",
    reporter: "nh",
    priority: "low",
    points: 1,
    epic: "tokens",
    labels: ["docs"],
    flagged: false,
    updated: 5,
    description:
      "One page with every spacing token, its value and when to use it.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-153",
    type: "story",
    summary: "Offline banner when the connection drops",
    status: "todo",
    assignee: "lr",
    reporter: "ms",
    priority: "lowest",
    points: null,
    epic: null,
    labels: [],
    flagged: false,
    updated: 6,
    description:
      "A banner at the top of every screen while the app is offline.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-141",
    type: "story",
    summary: "One-page checkout with address autocomplete",
    status: "progress",
    assignee: "ms",
    reporter: "ap",
    priority: "highest",
    points: 8,
    epic: "checkout",
    labels: ["frontend", "payments"],
    flagged: false,
    updated: 0,
    description:
      "Shipping, delivery and payment on one page. The address field suggests matches after three characters.",
    subtasks: [
      task("t1", "Address autocomplete", true),
      task("t2", "Delivery options", true),
      task("t3", "Payment step"),
      task("t4", "Order review"),
    ],
    comments: [
      {
        id: "c1",
        author: "ap",
        when: "Oct 7",
        text: "Designs are final in the checkout file, page 3.",
      },
      {
        id: "c2",
        author: "lr",
        when: "Oct 8",
        text: "The payments API now returns the delivery fee.",
      },
      {
        id: "c3",
        author: "ms",
        when: "Oct 10",
        text: "Autocomplete is in. Starting on the payment step.",
      },
    ],
  },
  {
    id: "SO-143",
    type: "bug",
    summary: "Promo code field accepts expired codes",
    status: "progress",
    assignee: "lr",
    reporter: "tg",
    priority: "high",
    points: 3,
    epic: "checkout",
    labels: ["payments"],
    flagged: true,
    updated: 1,
    description:
      "AUTUMN25 expired on Sep 30 but still takes 25% off. The check runs on the client only.",
    subtasks: [task("t1", "Validate on the server")],
    comments: [
      {
        id: "c1",
        author: "lr",
        when: "Oct 9",
        text: "Waiting on the pricing service team for the expiry field.",
      },
    ],
  },
  {
    id: "SO-144",
    type: "task",
    summary: "Migrate the colour tokens to OKLCH",
    status: "progress",
    assignee: "nh",
    reporter: "ms",
    priority: "medium",
    points: 5,
    epic: "tokens",
    labels: ["tokens"],
    flagged: false,
    updated: 2,
    description:
      "Every colour token in OKLCH, with sRGB fallbacks for older browsers.",
    subtasks: [task("t1", "Neutral ramps", true), task("t2", "Accent ramps")],
    comments: [],
  },
  {
    id: "SO-145",
    type: "story",
    summary: "Push notifications for order updates",
    status: "progress",
    assignee: "tg",
    reporter: "ap",
    priority: "medium",
    points: 5,
    epic: "mobile",
    labels: ["ios", "android"],
    flagged: false,
    updated: 1,
    description:
      "Notify the shopper when the order ships, is out for delivery and arrives.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-138",
    type: "story",
    summary: "Order summary in the checkout sidebar",
    status: "review",
    assignee: "ap",
    reporter: "ms",
    priority: "medium",
    points: 3,
    epic: "checkout",
    labels: ["frontend"],
    flagged: false,
    updated: 0,
    description:
      "Items, discounts and the total stay visible beside every step.",
    subtasks: [],
    comments: [
      {
        id: "c1",
        author: "ms",
        when: "Oct 10",
        text: "Looks good. One nit on the discount row.",
      },
    ],
  },
  {
    id: "SO-139",
    type: "bug",
    summary: "Focus ring missing on the segmented control",
    status: "review",
    assignee: "ms",
    reporter: "nh",
    priority: "high",
    points: 1,
    epic: "tokens",
    labels: ["a11y"],
    flagged: false,
    updated: 2,
    description:
      "Keyboard users lose track of the focused segment in dark mode.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-140",
    type: "task",
    summary: "Biometric sign-in on Android",
    status: "review",
    assignee: "lr",
    reporter: "tg",
    priority: "medium",
    points: 5,
    epic: "mobile",
    labels: ["android"],
    flagged: false,
    updated: 3,
    description: "Fingerprint and face unlock through the BiometricPrompt API.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-131",
    type: "story",
    summary: "Guest checkout",
    status: "done",
    assignee: "ap",
    reporter: "ms",
    priority: "high",
    points: 8,
    epic: "checkout",
    labels: ["frontend"],
    flagged: false,
    updated: 6,
    description: "Buy without an account; offer one after the order is placed.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-132",
    type: "task",
    summary: "Set up the token build pipeline",
    status: "done",
    assignee: "nh",
    reporter: "nh",
    priority: "medium",
    points: 3,
    epic: "tokens",
    labels: ["tokens"],
    flagged: false,
    updated: 8,
    description:
      "Build the CSS and the JSON exports from one source on every merge.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-134",
    type: "bug",
    summary: "Crash when rotating the product gallery",
    status: "done",
    assignee: "tg",
    reporter: "lr",
    priority: "highest",
    points: 2,
    epic: "mobile",
    labels: ["android"],
    flagged: false,
    updated: 5,
    description:
      "Rotating the device while the gallery animates crashed the app.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-135",
    type: "story",
    summary: "Type scale for headings",
    status: "done",
    assignee: "ms",
    reporter: "ap",
    priority: "low",
    points: 2,
    epic: "tokens",
    labels: ["design"],
    flagged: false,
    updated: 7,
    description: "Six heading sizes on a 1.25 ratio.",
    subtasks: [],
    comments: [],
  },
  {
    id: "SO-136",
    type: "task",
    summary: "Track the checkout funnel events",
    status: "done",
    assignee: "lr",
    reporter: "ap",
    priority: "low",
    points: 1,
    epic: "checkout",
    labels: ["analytics"],
    flagged: false,
    updated: 4,
    description: "One event per step, with the cart value and the step time.",
    subtasks: [],
    comments: [],
  },
];

const statusOf = (id: StatusId): Status => STATUSES.find((s) => s.id === id)!;
const personOf = (id: string | null): Person | null =>
  PEOPLE.find((p) => p.id === id) ?? null;
const epicOf = (id: string | null): Epic | null =>
  EPICS.find((e) => e.id === id) ?? null;
const pointsOf = (issues: readonly Issue[]): number =>
  issues.reduce((sum, i) => sum + (i.points ?? 0), 0);
const keyNumber = (id: string): number => Number(id.slice(id.indexOf("-") + 1));

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

<style scoped>
.shell {
  position: relative;
  display: flex;
  height: 720px;
  overflow: hidden;
}
.body {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
.num {
  font-variant-numeric: tabular-nums;
}
.sprint-dates {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: var(--space-2);
  color: var(--text-muted);
  white-space: nowrap;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-5) 0 var(--space-3);
}
.search {
  flex: 0 1 14rem;
  min-width: 10rem;
}
.people {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0_5);
}
.person-filter {
  display: inline-flex;
  margin: 0;
  padding: 0;
  border: 2px solid var(--surface-base);
  border-radius: var(--radius-pill);
  background: var(--surface-base);
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.person-filter:hover {
  z-index: var(--z-raised);
  transform: translateY(-2px);
}
.person-filter[aria-pressed="true"] {
  z-index: var(--z-raised);
  border-color: var(--accent);
}
.person-filter:focus-visible {
  z-index: calc(var(--z-raised) + 1);
  outline: none;
  box-shadow: var(--focus-ring);
}
.epic-filter {
  flex: 0 1 10rem;
}
.group-by {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.group-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.summary {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-2) var(--space-6);
  margin-bottom: var(--space-4);
}
.sprint-progress {
  display: grid;
  flex: 0 1 22rem;
  gap: var(--space-1);
}
.progress-text,
.hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.progress-text strong {
  color: var(--text-primary);
}
.board-scroll {
  overflow-x: auto;
  padding-bottom: var(--space-2);
}
.board {
  --_col: minmax(15rem, 1fr);
  display: grid;
  gap: var(--space-2);
  min-width: calc(4 * 15rem + 3 * var(--space-3));
}
.board-head,
.cells,
.board-foot {
  display: grid;
  grid-template-columns: repeat(4, var(--_col));
  gap: var(--space-3);
}
.col-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  background: var(--surface-hover);
}
.col-head.is-over {
  background: var(--danger-soft);
}
.col-title {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}
.wip {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.is-over .wip {
  color: var(--danger-text);
  font-weight: var(--font-weight-semibold);
}
.lane {
  display: grid;
  gap: var(--space-2);
}
.lane-head {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-sm);
}
.lane-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  padding: var(--space-1) var(--space-2);
  border: 0;
  border-radius: var(--radius-control);
  background: none;
  color: var(--text-primary);
  font: inherit;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}
.lane-toggle:hover {
  background: var(--surface-hover);
}
.lane-toggle:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.lane-caret {
  transition: transform var(--transition-fast);
}
.lane-toggle[aria-expanded="true"] .lane-caret {
  transform: rotate(90deg);
}
.lane-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
}
.epic-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-h-xs);
  height: var(--control-h-xs);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  color: color-mix(in oklab, var(--tone) 70%, var(--text-primary));
}
.cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 0;
  min-height: 4.5rem;
  margin: 0;
  padding: var(--space-2);
  border: var(--border-width-thin) dashed transparent;
  border-radius: var(--radius);
  background: var(--surface-hover);
  list-style: none;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}
.cell.is-drop {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.issue {
  position: relative;
  gap: var(--space-2);
  border: var(--border-width-thin) solid var(--border);
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
}
.issue:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
.issue:has(.issue-open:focus-visible) {
  box-shadow: var(--focus-ring);
}
.issue.is-selected {
  border-color: var(--accent);
}
.issue.is-flagged {
  border-color: var(--warning);
  /* stylelint-disable declaration-property-unit-disallowed-list -- the flag stripe is 3px so it reads apart from the 2px selection ring */
  box-shadow:
    inset 3px 0 0 var(--warning),
    var(--shadow-sm);
  /* stylelint-enable declaration-property-unit-disallowed-list */
}
.issue.is-dragging {
  opacity: 0.5;
}
.issue-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
}
.issue-open {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--text-primary);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--leading-snug);
  text-align: start;
  cursor: pointer;
  overflow-wrap: anywhere;
}
/* The whole card opens the issue; the menu sits above the stretched target. */
.issue-open::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.issue-open:focus-visible {
  outline: none;
}
.issue-menu {
  position: relative;
  z-index: var(--z-raised);
  margin: calc(var(--space-1) * -1) calc(var(--space-1) * -1) 0 0;
}
.issue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: 0;
}
.epic-tag {
  display: inline-flex;
  align-items: center;
  height: var(--badge-h);
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  color: color-mix(in oklab, var(--tone) 55%, var(--text-primary));
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}
.issue-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-h-xs);
  height: var(--control-h-xs);
  flex: none;
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--_type) 16%, transparent);
  color: var(--_type);
}
.type-icon[data-type="story"] {
  --_type: var(--success-text);
}
.type-icon[data-type="task"] {
  --_type: var(--chart-2);
}
.type-icon[data-type="bug"] {
  --_type: var(--danger-text);
}
.issue-key {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}
.issue[data-status="done"] .issue-key {
  text-decoration: line-through;
}
.flag {
  display: inline-flex;
  color: var(--warning-text);
}
.meta-count {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0_5);
}
.meta-end {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.points {
  min-width: 1.5rem;
  justify-content: center;
}
.priority {
  display: inline-flex;
}
.priority[data-priority="highest"],
.priority[data-priority="high"] {
  color: var(--danger-text);
}
.priority[data-priority="medium"] {
  color: var(--warning-text);
}
.priority[data-priority="low"],
.priority[data-priority="lowest"] {
  color: var(--chart-2);
}
.unassigned {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: var(--border-width-thin) dashed var(--border-strong);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
}
.create-btn {
  justify-self: start;
}
.create-form {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-2);
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-raised);
}
.create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
.no-results {
  margin: var(--space-4) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
.details {
  flex: none;
  width: 24rem;
}
.details h3 {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.details h3:focus {
  outline: none;
}
.flag-note {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0 0 var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  background: var(--warning-soft);
  color: var(--warning-text);
  font-size: var(--font-size-sm);
}
.summary-input {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.fields .wide {
  grid-column: 1 / -1;
}
.props {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
}
.props div {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: center;
  gap: var(--space-2);
}
.props dt {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.props dd {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.person,
.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.section-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin: var(--space-6) 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.section-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
}
.text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.muted {
  color: var(--text-muted);
}
.subtasks {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}
.subtasks li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.subtasks .is-done {
  color: var(--text-muted);
  text-decoration: line-through;
}
.comment-form {
  display: grid;
  gap: var(--space-3);
}
.comment-form button {
  justify-self: end;
}
.comments {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}
.comments li {
  display: flex;
  gap: var(--space-3);
}
.comment-body {
  display: grid;
  gap: var(--space-0_5);
  min-width: 0;
}
.comment-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.comment-meta strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}
.comment-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
@media (prefers-reduced-motion: reduce) {
  .person-filter,
  .lane-caret,
  .cell,
  .issue {
    transition: none;
  }
  .person-filter:hover {
    transform: none;
  }
}
@media (max-width: 900px) {
  .details {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: var(--z-drawer);
    width: min(100%, 24rem);
    box-shadow: var(--menu-shadow);
  }
}
@media (max-width: 640px) {
  .body {
    padding: var(--space-4);
  }
  .search,
  .epic-filter {
    flex: 1 1 10rem;
  }
  .board {
    --_col: minmax(15rem, 80vw);
  }
  .sprint-dates {
    display: flex;
    margin: var(--space-1) 0 0;
  }
}
.row-panel {
  position: fixed;
  z-index: var(--z-popover);
  max-width: calc(100vw - 2 * var(--space-4));
}
</style>
