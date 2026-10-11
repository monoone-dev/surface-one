"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
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
} from "@surface-one/react";

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

/** The open row menu, fixed to the viewport; `id` null is the board menu. */
interface MenuState {
  readonly id: string | null;
  readonly top: number;
  readonly right: number;
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

const GROUP_OPTIONS: readonly SegmentOption[] = [
  { value: "none", label: "None" },
  { value: "assignee", label: "Assignee" },
  { value: "epic", label: "Epic" },
];
const TYPE_OPTIONS = (Object.keys(TYPES) as IssueType[]).map((value) => ({
  value,
  label: TYPES[value].label,
}));
const PRIORITY_OPTIONS = (Object.keys(PRIORITIES) as PriorityId[]).map(
  (value) => ({ value, label: PRIORITIES[value].label }),
);

const tone = (e: Epic): CSSProperties =>
  ({ "--tone": `var(--${e.tone})` }) as CSSProperties;
const subtasksDone = (i: Issue): number =>
  i.subtasks.filter((t) => t.done).length;
const commentsOf = (i: Issue): readonly Comment[] => [...i.comments].reverse();
const updatedLabel = (i: Issue): string =>
  i.updated === 0
    ? "Today"
    : i.updated === 1
      ? "Yesterday"
      : `${i.updated} days ago`;

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

/** The column heading, prefixed by the lane name when the board is grouped. */
function cellLabel(l: Lane, status: Status): string {
  const column = `board-col-${status.id}`;
  return l.title === null ? column : `board-lane-name-${l.key} ${column}`;
}

function Initials({ person }: { person: Person }) {
  return (
    <SoneAvatar size="sm" aria-hidden="true">
      <SoneAvatarFallback>{person.initials}</SoneAvatarFallback>
    </SoneAvatar>
  );
}

const css = `
.tpl-board.shell {
  position: relative;
  display: flex;
  height: 720px;
  overflow: hidden;
}
.tpl-board .body {
  flex: 1 1 auto;
  min-width: 0;
  overflow-y: auto;
  padding: var(--space-6);
}
.tpl-board .num {
  font-variant-numeric: tabular-nums;
}
.tpl-board .sprint-dates {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: var(--space-2);
  color: var(--text-muted);
  white-space: nowrap;
}
.tpl-board .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-5) 0 var(--space-3);
}
.tpl-board .search {
  flex: 0 1 14rem;
  min-width: 10rem;
}
.tpl-board .people {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0_5);
}
.tpl-board .person-filter {
  display: inline-flex;
  margin: 0;
  padding: 0;
  border: 2px solid var(--surface-base);
  border-radius: var(--radius-pill);
  background: var(--surface-base);
  cursor: pointer;
  transition: transform var(--transition-fast);
}
.tpl-board .person-filter:hover {
  z-index: var(--z-raised);
  transform: translateY(-2px);
}
.tpl-board .person-filter[aria-pressed="true"] {
  z-index: var(--z-raised);
  border-color: var(--accent);
}
.tpl-board .person-filter:focus-visible {
  z-index: calc(var(--z-raised) + 1);
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-board .epic-filter {
  flex: 0 1 10rem;
}
.tpl-board .group-by {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.tpl-board .group-label {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-board .summary {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-2) var(--space-6);
  margin-bottom: var(--space-4);
}
.tpl-board .sprint-progress {
  display: grid;
  flex: 0 1 22rem;
  gap: var(--space-1);
}
.tpl-board .progress-text,
.tpl-board .hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.tpl-board .progress-text strong {
  color: var(--text-primary);
}
.tpl-board .board-scroll {
  overflow-x: auto;
  padding-bottom: var(--space-2);
}
.tpl-board .board {
  --_col: minmax(15rem, 1fr);
  display: grid;
  gap: var(--space-2);
  min-width: calc(4 * 15rem + 3 * var(--space-3));
}
.tpl-board .board-head,
.tpl-board .cells,
.tpl-board .board-foot {
  display: grid;
  grid-template-columns: repeat(4, var(--_col));
  gap: var(--space-3);
}
.tpl-board .col-head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  background: var(--surface-hover);
}
.tpl-board .col-head.is-over {
  background: var(--danger-soft);
}
.tpl-board .col-title {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
}
.tpl-board .wip {
  margin-left: auto;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.tpl-board .is-over .wip {
  color: var(--danger-text);
  font-weight: var(--font-weight-semibold);
}
.tpl-board .lane {
  display: grid;
  gap: var(--space-2);
}
.tpl-board .lane-head {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-sm);
}
.tpl-board .lane-toggle {
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
.tpl-board .lane-toggle:hover {
  background: var(--surface-hover);
}
.tpl-board .lane-toggle:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-board .lane-caret {
  transition: transform var(--transition-fast);
}
.tpl-board .lane-toggle[aria-expanded="true"] .lane-caret {
  transform: rotate(90deg);
}
.tpl-board .lane-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
}
.tpl-board .epic-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--control-h-xs);
  height: var(--control-h-xs);
  border-radius: var(--radius-sm);
  background: color-mix(in srgb, var(--tone) 16%, transparent);
  color: color-mix(in oklab, var(--tone) 70%, var(--text-primary));
}
.tpl-board .cell {
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
.tpl-board .cell.is-drop {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.tpl-board .issue {
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
.tpl-board .issue:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}
.tpl-board .issue:has(.issue-open:focus-visible) {
  box-shadow: var(--focus-ring);
}
.tpl-board .issue.is-selected {
  border-color: var(--accent);
}
.tpl-board .issue.is-flagged {
  border-color: var(--warning);
  /* stylelint-disable declaration-property-unit-disallowed-list -- the flag stripe is 3px so it reads apart from the 2px selection ring */
  box-shadow:
    inset 3px 0 0 var(--warning),
    var(--shadow-sm);
  /* stylelint-enable declaration-property-unit-disallowed-list */
}
.tpl-board .issue.is-dragging {
  opacity: 0.5;
}
.tpl-board .issue-head {
  display: flex;
  align-items: flex-start;
  gap: var(--space-1);
}
.tpl-board .issue-open {
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
.tpl-board .issue-open::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
}
.tpl-board .issue-open:focus-visible {
  outline: none;
}
.tpl-board .issue-menu {
  position: relative;
  z-index: var(--z-raised);
  margin: calc(var(--space-1) * -1) calc(var(--space-1) * -1) 0 0;
}
.tpl-board .issue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin: 0;
}
.tpl-board .epic-tag {
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
.tpl-board .issue-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1) var(--space-2);
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}
.tpl-board .type-icon {
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
.tpl-board .type-icon[data-type="story"] {
  --_type: var(--success-text);
}
.tpl-board .type-icon[data-type="task"] {
  --_type: var(--chart-2);
}
.tpl-board .type-icon[data-type="bug"] {
  --_type: var(--danger-text);
}
.tpl-board .issue-key {
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}
.tpl-board .issue[data-status="done"] .issue-key {
  text-decoration: line-through;
}
.tpl-board .flag {
  display: inline-flex;
  color: var(--warning-text);
}
.tpl-board .meta-count {
  display: inline-flex;
  align-items: center;
  gap: var(--space-0_5);
}
.tpl-board .meta-end {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-left: auto;
}
.tpl-board .points {
  min-width: 1.5rem;
  justify-content: center;
}
.tpl-board .priority {
  display: inline-flex;
}
.tpl-board .priority[data-priority="highest"],
.tpl-board .priority[data-priority="high"] {
  color: var(--danger-text);
}
.tpl-board .priority[data-priority="medium"] {
  color: var(--warning-text);
}
.tpl-board .priority[data-priority="low"],
.tpl-board .priority[data-priority="lowest"] {
  color: var(--chart-2);
}
.tpl-board .unassigned {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: var(--border-width-thin) dashed var(--border-strong);
  border-radius: var(--radius-pill);
  color: var(--text-muted);
}
.tpl-board .create-btn {
  justify-self: start;
}
.tpl-board .create-form {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-2);
  border: var(--border-width-thin) solid var(--border);
  border-radius: var(--radius);
  background: var(--surface-raised);
}
.tpl-board .create-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}
.tpl-board .no-results {
  margin: var(--space-4) 0 0;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
.tpl-board .details {
  flex: none;
  width: 24rem;
}
.tpl-board .details h3 {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.tpl-board .details h3:focus {
  outline: none;
}
.tpl-board .flag-note {
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
.tpl-board .summary-input {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-board .fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}
.tpl-board .fields .wide {
  grid-column: 1 / -1;
}
.tpl-board .props {
  display: grid;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
}
.tpl-board .props div {
  display: grid;
  grid-template-columns: 5.5rem minmax(0, 1fr);
  align-items: center;
  gap: var(--space-2);
}
.tpl-board .props dt {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-board .props dd {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.tpl-board .person,
.tpl-board .tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}
.tpl-board .section-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  margin: var(--space-6) 0 var(--space-3);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}
.tpl-board .section-count {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
}
.tpl-board .text {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-board .muted {
  color: var(--text-muted);
}
.tpl-board .subtasks {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}
.tpl-board .subtasks li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}
.tpl-board .subtasks .is-done {
  color: var(--text-muted);
  text-decoration: line-through;
}
.tpl-board .comment-form {
  display: grid;
  gap: var(--space-3);
}
.tpl-board .comment-form button {
  justify-self: end;
}
.tpl-board .comments {
  display: grid;
  gap: var(--space-4);
  margin: var(--space-4) 0 0;
  padding: 0;
  list-style: none;
}
.tpl-board .comments li {
  display: flex;
  gap: var(--space-3);
}
.tpl-board .comment-body {
  display: grid;
  gap: var(--space-0_5);
  min-width: 0;
}
.tpl-board .comment-meta {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-board .comment-meta strong {
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}
.tpl-board .comment-text {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
@media (prefers-reduced-motion: reduce) {
  .tpl-board .person-filter,
  .tpl-board .lane-caret,
  .tpl-board .cell,
  .tpl-board .issue {
    transition: none;
  }
  .tpl-board .person-filter:hover {
    transform: none;
  }
}
@media (max-width: 900px) {
  .tpl-board .details {
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
  .tpl-board .body {
    padding: var(--space-4);
  }
  .tpl-board .search,
  .tpl-board .epic-filter {
    flex: 1 1 10rem;
  }
  .tpl-board .board {
    --_col: minmax(15rem, 80vw);
  }
  .tpl-board .sprint-dates {
    display: flex;
    margin: var(--space-1) 0 0;
  }
}
.tpl-board-menu.row-panel {
  position: fixed;
  z-index: var(--z-popover);
  max-width: calc(100vw - 2 * var(--space-4));
}
`;

export default function BoardTemplate() {
  const root = useRef<HTMLDivElement | null>(null);
  const [issues, setIssues] = useState<readonly Issue[]>(ISSUES);
  const [query, setQuery] = useState("");
  const [assignees, setAssignees] = useState<readonly string[]>([]);
  const [mine, setMine] = useState(false);
  const [recent, setRecent] = useState(false);
  const [bugs, setBugs] = useState(false);
  const [epic, setEpic] = useState("all");
  const [groupBy, setGroupByState] = useState<GroupBy>("none");
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  /** `<lane>:<status>` under the dragged card. */
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState("story");
  const [newSummary, setNewSummary] = useState("");
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");

  // No React row menu yet: a ghost icon button opens a SoneMenu, fixed to the viewport
  // (portalled to <body>) so the scrolling board never clips it.
  const [menu, setMenu] = useState<MenuState | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);

  // Focus moves once the next render is on screen (Vue's nextTick).
  const afterRender = useRef<(() => void) | null>(null);
  useEffect(() => {
    const run = afterRender.current;
    afterRender.current = null;
    run?.();
  });

  const filtering =
    !!query.trim() ||
    assignees.length > 0 ||
    mine ||
    recent ||
    bugs ||
    epic !== "all";

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues.filter(
      (i) =>
        (!q ||
          i.summary.toLowerCase().includes(q) ||
          i.id.toLowerCase().includes(q)) &&
        (!assignees.length || assignees.includes(i.assignee ?? "")) &&
        (!mine || i.assignee === ME) &&
        (!recent || i.updated <= 1) &&
        (!bugs || i.type === "bug") &&
        (epic === "all" || (i.epic ?? "none") === epic),
    );
  }, [issues, query, assignees, mine, recent, bugs, epic]);

  const columns = STATUSES.map((status) => ({
    status,
    count: visible.filter((i) => i.status === status.id).length,
    // The limit counts every issue in the column, filtered out or not.
    over:
      status.wip !== null &&
      issues.filter((i) => i.status === status.id).length > status.wip,
  }));

  const lanes = useMemo<readonly Lane[]>(() => {
    if (groupBy === "none") return [lane("all", null, visible)];
    if (groupBy === "assignee") {
      return [
        ...PEOPLE.map((p) =>
          lane(
            p.id,
            p.id === ME ? `${p.name} (you)` : p.name,
            visible.filter((i) => i.assignee === p.id),
            p,
          ),
        ),
        lane(
          "none",
          "Unassigned",
          visible.filter((i) => !i.assignee),
        ),
      ].filter((l) => l.count > 0);
    }
    return [
      ...EPICS.map((e) =>
        lane(
          e.id,
          e.name,
          visible.filter((i) => i.epic === e.id),
          null,
          e,
        ),
      ),
      lane(
        "none",
        "No epic",
        visible.filter((i) => !i.epic),
      ),
    ].filter((l) => l.count > 0);
  }, [visible, groupBy]);

  const totalPoints = pointsOf(issues);
  const donePoints = pointsOf(issues.filter((i) => i.status === "done"));
  const doneCount = issues.filter((i) => i.status === "done").length;
  const sumOf = (status: StatusId) =>
    pointsOf(issues.filter((i) => i.status === status));
  const progressSegments: SoneStackedBarSegment[] = [
    { key: "done", label: "Done", value: sumOf("done"), tone: "success" },
    {
      key: "review",
      label: "In review",
      value: sumOf("review"),
      tone: "chart-6",
    },
    {
      key: "progress",
      label: "In progress",
      value: sumOf("progress"),
      tone: "accent",
    },
  ];

  const selected = issues.find((i) => i.id === selectedId) ?? null;
  const menuIssue = issues.find((i) => i.id === menu?.id) ?? null;

  function focus(selector: string): boolean {
    const el = root.current?.querySelector<HTMLElement>(selector);
    el?.focus();
    return !!el;
  }

  const focusLater = (selector: string): void => {
    afterRender.current = () => focus(selector);
  };

  const say = (message: string): void => setAnnouncement(message);

  function completeSprint(): void {
    const open = issues.filter((i) => i.status !== "done").length;
    say(
      `${SPRINT.name} completed: ${doneCount} issues done, ${open} moved to the next sprint.`,
    );
  }

  function toggleAssignee(id: string): void {
    setAssignees((list) =>
      list.includes(id) ? list.filter((p) => p !== id) : [...list, id],
    );
  }

  function setGroupBy(value: string): void {
    setGroupByState(value as GroupBy);
    setCollapsed([]);
  }

  function toggleLane(key: string): void {
    setCollapsed((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  }

  function clearFilters(): void {
    setQuery("");
    setAssignees([]);
    setMine(false);
    setRecent(false);
    setBugs(false);
    setEpic("all");
  }

  function open(id: string): void {
    setSelectedId(id);
    setDraft("");
    focusLater("#board-detail-title");
  }

  function close(): void {
    const id = selectedId;
    setSelectedId(null);
    if (id) focusLater(`#board-open-${id}`);
  }

  function update(id: string, fn: (issue: Issue) => Issue): void {
    setIssues((list) => list.map((i) => (i.id === id ? fn(i) : i)));
  }

  function patch(id: string, changes: Partial<Issue>): void {
    update(id, (i) => ({ ...i, ...changes, updated: 0 }));
  }

  // ---- Moving issues: drag and drop, the card menu, the keyboard, the panel.

  /** `changes` ride along with the move: a drop in another swimlane. */
  function moveTo(
    id: string,
    status: StatusId,
    changes: Partial<Issue> = {},
  ): void {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    if (issue.status === status) {
      if (Object.keys(changes).length) patch(id, changes);
      return;
    }
    // A moved card goes to the bottom of its new column.
    const next = [
      ...issues.filter((i) => i.id !== id),
      { ...issue, ...changes, status, updated: 0 },
    ];
    setIssues(next);
    const target = statusOf(status);
    const over =
      target.wip !== null &&
      next.filter((i) => i.status === status).length > target.wip;
    say(
      `${id} moved to ${target.label}.` +
        (over ? ` ${target.label} is over its limit of ${target.wip}.` : ""),
    );
  }

  function assign(id: string, person: string | null): void {
    patch(id, { assignee: person });
    say(
      person
        ? `${id} assigned to ${personOf(person)?.name}.`
        : `${id} unassigned.`,
    );
  }

  function toggleFlag(id: string): void {
    const issue = issues.find((i) => i.id === id);
    if (!issue) return;
    patch(id, { flagged: !issue.flagged });
    say(issue.flagged ? `Flag removed from ${id}.` : `${id} flagged.`);
  }

  function remove(id: string): void {
    // Focus moves to the next card in the same list, else to the board.
    const order = lanes.flatMap((l) =>
      l.cells.flatMap((c) => c.issues.map((i) => i.id)),
    );
    const at = order.indexOf(id);
    const next = order[at + 1] ?? order[at - 1];
    setIssues((list) => list.filter((i) => i.id !== id));
    if (selectedId === id) setSelectedId(null);
    say(`${id} deleted.`);
    afterRender.current = () =>
      (next && focus(`#board-open-${next}`)) || focus("#board-title");
  }

  function onDragStart(event: DragEvent<HTMLElement>, id: string): void {
    setDragId(id);
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDragEnd(): void {
    setDragId(null);
    setDropTarget(null);
  }

  function onDragOver(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    if (!dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(`${laneKey}:${status}`);
  }

  function onDragLeave(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    const into = event.relatedTarget as Node | null;
    if (into && event.currentTarget.contains(into)) return;
    if (dropTarget === `${laneKey}:${status}`) setDropTarget(null);
  }

  function onDrop(
    event: DragEvent<HTMLElement>,
    laneKey: string,
    status: StatusId,
  ): void {
    event.preventDefault();
    const id = dragId ?? event.dataTransfer.getData("text/plain");
    onDragEnd();
    if (!id) return;
    // Dropped in another swimlane: the card takes that lane's assignee or epic.
    const value = laneKey === "none" ? null : laneKey;
    const changes: Partial<Issue> =
      groupBy === "assignee"
        ? { assignee: value }
        : groupBy === "epic"
          ? { epic: value }
          : {};
    moveTo(id, status, changes);
  }

  /** Shift + ← / → moves the focused card one column; focus follows it. */
  function onCardKeydown(
    event: KeyboardEvent<HTMLButtonElement>,
    issue: Issue,
  ): void {
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
    if (text && text !== selected?.summary) patch(id, { summary: text });
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
    const text = draft.trim();
    if (!text) return;
    update(id, (i) => ({
      ...i,
      comments: [
        ...i.comments,
        { id: `c${i.comments.length + 1}`, author: ME, when: "Just now", text },
      ],
    }));
    setDraft("");
    say("Comment saved.");
  }

  // ---- Creating an issue inline, at the bottom of To Do.

  function startCreate(): void {
    setCreating(true);
    focusLater("#board-new-summary");
  }

  function cancelCreate(): void {
    setCreating(false);
    setNewSummary("");
    focusLater("#board-create");
  }

  function create(): void {
    const summary = newSummary.trim();
    if (!summary) return;
    const id = `SO-${Math.max(...issues.map((i) => keyNumber(i.id)), 153) + 1}`;
    setIssues([
      ...issues,
      {
        id,
        type: newType as IssueType,
        summary,
        status: "todo",
        assignee: null,
        reporter: ME,
        priority: "medium",
        points: null,
        epic: epic === "all" || epic === "none" ? null : epic,
        labels: [],
        flagged: false,
        updated: 0,
        description: "No description yet.",
        subtasks: [],
        comments: [],
      },
    ]);
    setNewSummary("");
    say(`${id} created in To Do.`);
  }

  // ---- The row and board menu.

  const menuItems = (): HTMLElement[] =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>(
        '[role^="menuitem"]:not(:disabled)',
      ) ?? [],
    );

  function toggleMenu(id: string | null, event: MouseEvent<HTMLElement>): void {
    if (menu && menu.id === id) return closeMenu();
    menuTrigger.current = event.currentTarget;
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({
      id,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    // Opened from the keyboard: move focus into the menu.
    if (event.detail === 0) afterRender.current = () => menuItems()[0]?.focus();
  }

  function closeMenu(restoreFocus = false): void {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus();
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

  function onMenuKeydown(event: KeyboardEvent<HTMLDivElement>): void {
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

  // A pointer down outside the open menu and its trigger closes it.
  useEffect(() => {
    if (!menu) return;
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node;
      if (panel.current?.contains(target)) return;
      if (menuTrigger.current?.contains(target)) return;
      setMenu(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menu]);

  return (
    <div ref={root} className="shell tpl-board">
      <style>{css}</style>
      <div className="body">
        <SonePageHeader>
          <SonePageHeaderContent>
            <SonePageHeaderEyebrow>
              Projects / Surface One
            </SonePageHeaderEyebrow>
            <SonePageHeaderTitle>{SPRINT.name}</SonePageHeaderTitle>
            <SonePageHeaderDescription>
              {SPRINT.goal}{" "}
              <span className="sprint-dates">
                <SoneIcon icon="clock" />
                {SPRINT.dates} · {SPRINT.remaining} days remaining
              </span>
            </SonePageHeaderDescription>
          </SonePageHeaderContent>
          <SonePageHeaderActions>
            <SoneButton
              variant="outline"
              size="sm"
              type="button"
              onClick={completeSprint}
            >
              Complete sprint
            </SoneButton>
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu?.id === null}
              aria-controls={menu?.id === null ? "board-menu" : undefined}
              aria-label="Board actions"
              title="Board actions"
              onClick={(e: MouseEvent<HTMLElement>) => toggleMenu(null, e)}
            >
              <SoneIcon icon="ellipsis" />
            </SoneButton>
          </SonePageHeaderActions>
        </SonePageHeader>

        <div className="toolbar">
          <SoneInputGroup className="search">
            <SoneInputGroupAddon as="span">
              <SoneIcon icon="search" />
            </SoneInputGroupAddon>
            <SoneInputGroupInput
              value={query}
              onValueChange={setQuery}
              type="search"
              aria-label="Search issues"
              placeholder="Search this board…"
            />
          </SoneInputGroup>
          <div className="people" role="group" aria-label="Filter by assignee">
            {PEOPLE.map((p) => (
              <button
                key={p.id}
                type="button"
                className="person-filter"
                aria-pressed={assignees.includes(p.id)}
                title={p.name}
                onClick={() => toggleAssignee(p.id)}
              >
                <Initials person={p} />
                <span className="sr-only">{p.name}</span>
              </button>
            ))}
          </div>
          <SoneToggleGroup
            variant="outline"
            size="sm"
            spacing={1}
            role="group"
            aria-label="Quick filters"
          >
            <SoneToggleGroupItem
              type="button"
              pressed={mine}
              onClick={() => setMine(!mine)}
            >
              Only my issues
            </SoneToggleGroupItem>
            <SoneToggleGroupItem
              type="button"
              pressed={recent}
              onClick={() => setRecent(!recent)}
            >
              Recently updated
            </SoneToggleGroupItem>
            <SoneToggleGroupItem
              type="button"
              pressed={bugs}
              onClick={() => setBugs(!bugs)}
            >
              Bugs
            </SoneToggleGroupItem>
          </SoneToggleGroup>
          <SoneSelect
            value={epic}
            onValueChange={setEpic}
            className="epic-filter"
            size="sm"
            aria-label="Epic"
          >
            <option value="all">All epics</option>
            {EPICS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
            <option value="none">No epic</option>
          </SoneSelect>
          <span className="group-by">
            <span className="group-label" aria-hidden="true">
              Group by
            </span>
            <SoneSegmented
              size="sm"
              ariaLabel="Group by"
              options={GROUP_OPTIONS}
              value={groupBy}
              onValueChange={setGroupBy}
            />
          </span>
          {filtering && (
            <SoneButton
              variant="ghost"
              size="sm"
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </SoneButton>
          )}
        </div>

        <div className="summary">
          <div className="sprint-progress">
            <p className="progress-text">
              <strong className="num">{donePoints}</strong> of{" "}
              <span className="num">{totalPoints}</span> story points done ·{" "}
              {doneCount} of {issues.length} issues
            </p>
            <SoneStackedBar
              size="sm"
              aria-label="Sprint progress in story points"
              segments={progressSegments}
              max={totalPoints}
            />
          </div>
          <p id="board-hint" className="hint">
            Drag issues between columns, or focus one and press{" "}
            <SoneKbd>Shift</SoneKbd> + <SoneKbd>←</SoneKbd> /{" "}
            <SoneKbd>→</SoneKbd>.
          </p>
        </div>

        <h3 id="board-title" className="sr-only" tabIndex={-1}>
          Board
        </h3>
        <p className="sr-only" role="status">
          {announcement}
        </p>

        <div className="board-scroll">
          <div className="board">
            <div className="board-head">
              {columns.map((col) => (
                <div
                  key={col.status.id}
                  className={col.over ? "col-head is-over" : "col-head"}
                >
                  <h4 id={`board-col-${col.status.id}`} className="col-title">
                    {col.status.label}
                  </h4>
                  <SoneBadge
                    variant={col.over ? "destructive" : "secondary"}
                    className="num"
                  >
                    {col.count}
                    <span className="sr-only"> issues</span>
                  </SoneBadge>
                  {col.status.wip !== null && (
                    <>
                      <span className="wip">Max {col.status.wip}</span>
                      {col.over && (
                        <span className="sr-only">Over the limit</span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {lanes.map((l) => (
              <div key={l.key} className="lane">
                {l.title !== null && (
                  <h4 className="lane-head">
                    <button
                      type="button"
                      className="lane-toggle"
                      aria-expanded={!collapsed.includes(l.key)}
                      aria-controls={`board-lane-${l.key}`}
                      onClick={() => toggleLane(l.key)}
                    >
                      <SoneIcon icon="chevron-right" className="lane-caret" />
                      {l.person ? (
                        <Initials person={l.person} />
                      ) : l.epic ? (
                        <span className="epic-dot" style={tone(l.epic)}>
                          <SoneIcon icon="zap" />
                        </span>
                      ) : null}
                      <span
                        id={`board-lane-name-${l.key}`}
                        className="lane-name"
                      >
                        {l.title}
                      </span>
                      <span className="lane-meta">
                        {l.count} {l.count === 1 ? "issue" : "issues"} ·{" "}
                        {l.points} points
                      </span>
                    </button>
                  </h4>
                )}
                {!collapsed.includes(l.key) && (
                  <div id={`board-lane-${l.key}`} className="cells">
                    {l.cells.map((cell) => (
                      <ul
                        key={cell.status.id}
                        className={
                          dropTarget === `${l.key}:${cell.status.id}`
                            ? "cell is-drop"
                            : "cell"
                        }
                        aria-labelledby={cellLabel(l, cell.status)}
                        onDragOver={(e) => onDragOver(e, l.key, cell.status.id)}
                        onDragLeave={(e) =>
                          onDragLeave(e, l.key, cell.status.id)
                        }
                        onDrop={(e) => onDrop(e, l.key, cell.status.id)}
                      >
                        {cell.issues.map((i) => (
                          <IssueCard
                            key={i.id}
                            issue={i}
                            selected={selectedId === i.id}
                            dragging={dragId === i.id}
                            detailOpen={!!selected}
                            menuOpen={menu?.id === i.id}
                            onOpen={() => open(i.id)}
                            onKeyDown={(e) => onCardKeydown(e, i)}
                            onMenu={(e) => toggleMenu(i.id, e)}
                            onDragStart={(e) => onDragStart(e, i.id)}
                            onDragEnd={onDragEnd}
                          />
                        ))}
                      </ul>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="board-foot">
              {creating ? (
                <form
                  className="create-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create();
                  }}
                >
                  <SoneSelect
                    value={newType}
                    onValueChange={setNewType}
                    size="sm"
                    aria-label="Issue type"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </SoneSelect>
                  <input
                    id="board-new-summary"
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    type="text"
                    aria-label="Summary of the new issue"
                    placeholder="What needs to be done?"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelCreate();
                    }}
                  />
                  <div className="create-actions">
                    <SoneButton
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={cancelCreate}
                    >
                      Cancel
                    </SoneButton>
                    <SoneButton
                      size="sm"
                      type="submit"
                      disabled={!newSummary.trim()}
                    >
                      Create
                    </SoneButton>
                  </div>
                </form>
              ) : (
                <SoneButton
                  id="board-create"
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="create-btn"
                  onClick={startCreate}
                >
                  <SoneIcon icon="plus" />
                  <span>Create issue</span>
                </SoneButton>
              )}
            </div>
          </div>
        </div>
        {!visible.length && (
          <p className="no-results">No issues match these filters.</p>
        )}
      </div>

      {/* No React side panel component yet: the same classes as [soneSidePanel] and its parts. */}
      {selected && (
        <div
          id="board-detail"
          className="side-panel details"
          data-slot="side-panel"
          role="region"
          aria-labelledby="board-detail-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <div className="side-panel-header" data-slot="side-panel-header">
            <h3
              id="board-detail-title"
              className="side-panel-title"
              data-slot="side-panel-title"
              tabIndex={-1}
            >
              <TypeIcon type={selected.type} />
              {selected.id}
            </h3>
            <div className="side-panel-actions" data-slot="side-panel-actions">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-pressed={selected.flagged}
                aria-label="Flagged"
                title="Flagged"
                onClick={() => toggleFlag(selected.id)}
              >
                <SoneIcon icon="alert-circle" />
              </SoneButton>
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Close issue details"
                onClick={close}
              >
                <SoneIcon icon="close" />
              </SoneButton>
            </div>
          </div>
          <div className="side-panel-content" data-slot="side-panel-content">
            {selected.flagged && (
              <p className="flag-note">
                <SoneIcon icon="alert-circle" /> Flagged as an impediment
              </p>
            )}
            <SoneField>
              <SoneFieldLabel htmlFor="board-summary">Summary</SoneFieldLabel>
              {/* Saved on blur, as a native change event; keyed so another issue resets it. */}
              <textarea
                key={selected.id}
                id="board-summary"
                className="summary-input"
                rows={2}
                defaultValue={selected.summary}
                onBlur={(e) => rename(selected.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  e.currentTarget.blur();
                }}
              />
            </SoneField>

            <div className="fields">
              <SoneField>
                <SoneFieldLabel htmlFor="board-status">Status</SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-status"
                  value={selected.status}
                  onSelectionChange={(v) => moveTo(selected.id, v as StatusId)}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-assignee">
                  Assignee
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-assignee"
                  value={selected.assignee ?? ""}
                  onSelectionChange={(v) => assign(selected.id, v || null)}
                >
                  <option value="">Unassigned</option>
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-priority">
                  Priority
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-priority"
                  value={selected.priority}
                  onSelectionChange={(v) =>
                    patch(selected.id, { priority: v as PriorityId })
                  }
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="board-points">
                  Story points
                </SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-points"
                  value={
                    selected.points === null ? "" : String(selected.points)
                  }
                  onSelectionChange={(v) => setPoints(selected.id, v)}
                >
                  <option value="">None</option>
                  {POINTS.map((n) => (
                    <option key={n} value={String(n)}>
                      {n}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField className="wide">
                <SoneFieldLabel htmlFor="board-epic">Epic</SoneFieldLabel>
                <SoneSelect
                  size="sm"
                  selectId="board-epic"
                  value={selected.epic ?? ""}
                  onSelectionChange={(v) =>
                    patch(selected.id, { epic: v || null })
                  }
                >
                  <option value="">No epic</option>
                  {EPICS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
            </div>

            <dl className="props">
              <div>
                <dt>Reporter</dt>
                <dd className="person">
                  {personOf(selected.reporter) && (
                    <>
                      <Initials person={personOf(selected.reporter)!} />
                      {personOf(selected.reporter)!.name}
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd className="tags">
                  {selected.labels.map((label) => (
                    <SoneBadge key={label} variant="outline">
                      {label}
                    </SoneBadge>
                  ))}
                  {!selected.labels.length && "None"}
                </dd>
              </div>
              <div>
                <dt>Sprint</dt>
                <dd>{SPRINT.name}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{updatedLabel(selected)}</dd>
              </div>
            </dl>

            <h4 className="section-title">Description</h4>
            <p className="text">{selected.description}</p>

            <h4 id="board-subtasks-title" className="section-title">
              Subtasks
              {selected.subtasks.length > 0 && (
                <span className="section-count num">
                  {subtasksDone(selected)} of {selected.subtasks.length} done
                </span>
              )}
            </h4>
            {selected.subtasks.length ? (
              <>
                <SoneProgress
                  aria-label="Subtasks done"
                  value={subtasksDone(selected)}
                  max={selected.subtasks.length}
                />
                <ul className="subtasks" aria-labelledby="board-subtasks-title">
                  {selected.subtasks.map((t) => (
                    <li key={t.id}>
                      <input
                        id={`board-subtask-${t.id}`}
                        type="checkbox"
                        checked={t.done}
                        onChange={() => toggleSubtask(selected.id, t.id)}
                      />
                      <label
                        htmlFor={`board-subtask-${t.id}`}
                        className={t.done ? "is-done" : undefined}
                      >
                        {t.title}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text muted">No subtasks yet.</p>
            )}

            <h4 className="section-title">Activity</h4>
            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                addComment(selected.id);
              }}
            >
              <SoneField>
                <SoneFieldLabel htmlFor="board-comment">
                  Add a comment
                </SoneFieldLabel>
                <textarea
                  id="board-comment"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Ask a question or post an update…"
                />
              </SoneField>
              <SoneButton size="sm" type="submit" disabled={!draft.trim()}>
                Save
              </SoneButton>
            </form>
            {selected.comments.length > 0 && (
              <ol className="comments" aria-label="Comments, newest first">
                {commentsOf(selected).map((c) => (
                  <li key={c.id}>
                    <SoneAvatar size="sm" aria-hidden="true">
                      <SoneAvatarFallback>
                        {personOf(c.author)?.initials}
                      </SoneAvatarFallback>
                    </SoneAvatar>
                    <span className="comment-body">
                      <span className="comment-meta">
                        <strong>{personOf(c.author)?.name}</strong> · {c.when}
                      </span>
                      <span className="comment-text">{c.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Only opened by a click, so `document` is there: never during a server render. */}
      {menu &&
        createPortal(
          <SoneMenu
            id="board-menu"
            ref={panel}
            className="row-panel tpl-board-menu"
            style={{ top: `${menu.top}px`, right: `${menu.right}px` }}
            aria-label={
              menuIssue ? `Actions for ${menuIssue.id}` : "Board actions"
            }
            tabIndex={-1}
            onKeyDown={onMenuKeydown}
          >
            {menuIssue ? (
              <>
                <SoneMenuGroup aria-label="Move to">
                  <SoneMenuLabel>Move to</SoneMenuLabel>
                  {STATUSES.map((s) => (
                    <SoneMenuRadioItem
                      key={s.id}
                      type="button"
                      checked={menuIssue.status === s.id}
                      onClick={() =>
                        menuAction(
                          () => moveTo(menuIssue.id, s.id),
                          `#board-open-${menuIssue.id}`,
                        )
                      }
                    >
                      {s.label}
                    </SoneMenuRadioItem>
                  ))}
                </SoneMenuGroup>
                <SoneMenuSeparator />
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => open(menuIssue.id), "#board-detail-title")
                  }
                >
                  <SoneIcon icon="eye" /> Open issue
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  disabled={menuIssue.assignee === ME}
                  onClick={() => menuAction(() => assign(menuIssue.id, ME))}
                >
                  <SoneIcon icon="user" /> Assign to me
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() => menuAction(() => toggleFlag(menuIssue.id))}
                >
                  <SoneIcon icon="alert-circle" />{" "}
                  {menuIssue.flagged ? "Remove flag" : "Add flag"}
                </SoneMenuItem>
                <SoneMenuSeparator />
                <SoneMenuItem
                  variant="destructive"
                  type="button"
                  onClick={() => removeFromMenu(menuIssue.id)}
                >
                  <SoneIcon icon="trash" /> Delete
                </SoneMenuItem>
              </>
            ) : (
              <>
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => say("Sprint details opened."))
                  }
                >
                  <SoneIcon icon="edit" /> Edit sprint
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() =>
                    menuAction(() => say("Board settings opened."))
                  }
                >
                  <SoneIcon icon="sliders" /> Board settings
                </SoneMenuItem>
                <SoneMenuItem
                  type="button"
                  onClick={() => menuAction(() => say("Board link copied."))}
                >
                  <SoneIcon icon="link" /> Copy board link
                </SoneMenuItem>
              </>
            )}
          </SoneMenu>,
          document.body,
        )}
    </div>
  );
}

function TypeIcon({ type }: { type: IssueType }) {
  return (
    <span className="type-icon" data-type={type}>
      <SoneIcon icon={TYPES[type].icon} label={TYPES[type].label} />
    </span>
  );
}

interface IssueCardProps {
  readonly issue: Issue;
  readonly selected: boolean;
  readonly dragging: boolean;
  /** The details panel is open: the card controls it. */
  readonly detailOpen: boolean;
  readonly menuOpen: boolean;
  readonly onOpen: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  readonly onMenu: (event: MouseEvent<HTMLElement>) => void;
  readonly onDragStart: (event: DragEvent<HTMLElement>) => void;
  readonly onDragEnd: () => void;
}

function IssueCard({
  issue: i,
  selected,
  dragging,
  detailOpen,
  menuOpen,
  onOpen,
  onKeyDown,
  onMenu,
  onDragStart,
  onDragEnd,
}: IssueCardProps) {
  const epic = epicOf(i.epic);
  const assignee = personOf(i.assignee);
  const classes = ["issue"];
  if (i.flagged) classes.push("is-flagged");
  if (selected) classes.push("is-selected");
  if (dragging) classes.push("is-dragging");
  return (
    <SoneCard
      as="li"
      size="sm"
      className={classes.join(" ")}
      draggable
      data-status={i.status}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="issue-head">
        <button
          id={`board-open-${i.id}`}
          type="button"
          className="issue-open"
          aria-describedby={`board-meta-${i.id}`}
          aria-controls={detailOpen ? "board-detail" : undefined}
          aria-keyshortcuts="Shift+ArrowLeft Shift+ArrowRight"
          onClick={onOpen}
          onKeyDown={onKeyDown}
        >
          {i.summary}
        </button>
        <SoneButton
          variant="ghost"
          size="icon-xs"
          type="button"
          className="issue-menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "board-menu" : undefined}
          aria-label={`Actions for ${i.id}`}
          title={`Actions for ${i.id}`}
          onClick={onMenu}
        >
          <SoneIcon icon="ellipsis" />
        </SoneButton>
      </div>
      {(i.epic || i.labels.length > 0) && (
        <p className="issue-tags">
          {epic && (
            <span className="epic-tag" style={tone(epic)}>
              {epic.name}
            </span>
          )}
          {i.labels.map((label) => (
            <SoneBadge key={label} variant="outline">
              {label}
            </SoneBadge>
          ))}
        </p>
      )}
      <div id={`board-meta-${i.id}`} className="issue-meta">
        <TypeIcon type={i.type} />
        <span className="issue-key">{i.id}</span>
        {i.flagged && (
          <span className="flag">
            <SoneIcon icon="alert-circle" label="Flagged" />
          </span>
        )}
        {i.subtasks.length > 0 && (
          <span className="meta-count num">
            <SoneIcon icon="list-checks" />
            {subtasksDone(i)}/{i.subtasks.length}
            <span className="sr-only"> subtasks done</span>
          </span>
        )}
        {i.comments.length > 0 && (
          <span className="meta-count num">
            <SoneIcon icon="message-square" />
            {i.comments.length}
            <span className="sr-only">
              {" "}
              {i.comments.length === 1 ? "comment" : "comments"}
            </span>
          </span>
        )}
        <span className="meta-end">
          {i.points !== null && (
            <SoneBadge variant="secondary" className="points num">
              {i.points}
              <span className="sr-only"> story points</span>
            </SoneBadge>
          )}
          <span className="priority" data-priority={i.priority}>
            <SoneIcon
              icon={PRIORITIES[i.priority].icon}
              label={`${PRIORITIES[i.priority].label} priority`}
            />
          </span>
          {assignee ? (
            <>
              <SoneAvatar size="sm" aria-hidden="true" title={assignee.name}>
                <SoneAvatarFallback>{assignee.initials}</SoneAvatarFallback>
              </SoneAvatar>
              <span className="sr-only">Assigned to {assignee.name}</span>
            </>
          ) : (
            <span className="unassigned" title="Unassigned">
              <SoneIcon icon="user" label="Unassigned" />
            </span>
          )}
        </span>
      </div>
    </SoneCard>
  );
}
