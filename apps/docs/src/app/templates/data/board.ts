// The mock data of the board template, shared by its Angular (board.template.ts), Vue
// (vue/board.vue) and React (react/board.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type StatusId = "todo" | "progress" | "review" | "done";
export type IssueType = "story" | "task" | "bug";
export type PriorityId = "highest" | "high" | "medium" | "low" | "lowest";
export type GroupBy = "none" | "assignee" | "epic";

export interface Status {
  readonly id: StatusId;
  readonly label: string;
  /** Work-in-progress limit: the column turns red above it. */
  readonly wip: number | null;
}

export interface Person {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
}

export interface Epic {
  readonly id: string;
  readonly name: string;
  /** A categorical chart tone: `chart-1` … `chart-8`. */
  readonly tone: string;
}

export interface Subtask {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

export interface Comment {
  readonly id: string;
  readonly author: string;
  readonly when: string;
  readonly text: string;
}

export interface Issue {
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
export interface Lane {
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

export const STATUSES: readonly Status[] = [
  { id: "todo", label: "To Do", wip: null },
  { id: "progress", label: "In Progress", wip: 3 },
  { id: "review", label: "In Review", wip: null },
  { id: "done", label: "Done", wip: null },
];

export const PEOPLE: readonly Person[] = [
  { id: "ms", name: "Mina Sato", initials: "MS" },
  { id: "ap", name: "Ada Park", initials: "AP" },
  { id: "lr", name: "Leo Ruiz", initials: "LR" },
  { id: "tg", name: "Theo Grant", initials: "TG" },
  { id: "nh", name: "Noor Haddad", initials: "NH" },
];

/** The signed-in user: "Only my issues" and "Assign to me". */
export const ME = "ms";

export const EPICS: readonly Epic[] = [
  { id: "checkout", name: "Checkout v2", tone: "chart-1" },
  { id: "mobile", name: "Mobile app", tone: "chart-3" },
  { id: "tokens", name: "Design tokens", tone: "chart-5" },
];

export const POINTS = [1, 2, 3, 5, 8, 13] as const;

/** The sprint, fixed so the screen renders the same on the server and the client. */
export const SPRINT = {
  name: "SO Sprint 14",
  goal: "Ship guest-friendly checkout and the mobile push beta.",
  dates: "Oct 1 – Oct 14",
  remaining: 4,
};

export const task = (id: string, title: string, done = false): Subtask => ({
  id,
  title,
  done,
});

export const ISSUES: readonly Issue[] = [
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

export const statusOf = (id: StatusId): Status =>
  STATUSES.find((s) => s.id === id)!;
export const personOf = (id: string | null): Person | null =>
  PEOPLE.find((p) => p.id === id) ?? null;
export const epicOf = (id: string | null): Epic | null =>
  EPICS.find((e) => e.id === id) ?? null;
export const pointsOf = (issues: readonly Issue[]): number =>
  issues.reduce((sum, i) => sum + (i.points ?? 0), 0);
export const keyNumber = (id: string): number =>
  Number(id.slice(id.indexOf("-") + 1));
