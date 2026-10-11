"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { createPortal, flushSync } from "react-dom";
import {
  SoneBadge,
  SoneBarList,
  SoneButton,
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardHeader,
  SoneCardTitle,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupInput,
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemTitle,
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
  SoneSparkline,
  SoneStackedBar,
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
  SoneTable,
  cx,
  type BadgeVariant,
  type SegmentOption,
  type ShellIcon,
  type SoneBarListItem,
  type SoneProgressTone,
  type SoneStackedBarSegment,
  type SoneTableColumn,
} from "@surface-one/react";

type ChartTone = NonNullable<SoneBarListItem["tone"]>;
type Period = "month" | "quarter" | "year";
type Flow = "in" | "out";
type SpendId =
  | "housing"
  | "groceries"
  | "dining"
  | "transport"
  | "utilities"
  | "shopping"
  | "subscriptions"
  | "other";
type CategoryId = SpendId | "income";

interface Category {
  readonly id: CategoryId;
  readonly label: string;
  readonly tone: ChartTone;
}

interface PeriodData {
  /** The bar unit, as a table header ("Day"). */
  readonly unit: string;
  readonly span: string;
  readonly compare: string;
  readonly labels: readonly string[];
  readonly ticks: readonly string[];
  readonly tickEvery: number;
  readonly income: readonly number[];
  readonly spending: Readonly<Record<SpendId, number>>;
  /** Change against the previous period: income and spending in %, the savings rate in points. */
  readonly incomeDelta: number;
  readonly spendingDelta: number;
  readonly rateDelta: number;
  /** Budgets are monthly: × 1, 3 or 12. */
  readonly months: number;
  readonly seed: number;
}

interface FlowDatum {
  readonly key: string;
  readonly value: number;
  readonly label: string;
  readonly tick: string;
}

interface Transaction {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly account: string;
  readonly category: CategoryId;
  readonly amount: number;
}

interface Account {
  readonly id: string;
  readonly name: string;
  readonly meta: string;
  readonly icon: ShellIcon;
  readonly balance: number;
  readonly trend: readonly number[];
  readonly tone: ChartTone;
}

interface Budget {
  readonly id: SpendId;
  readonly limit: number;
}

interface Stat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: number;
  readonly tone: "positive" | "negative";
  readonly trend: string;
  readonly hint: string;
}

const CATEGORIES: readonly Category[] = [
  { id: "housing", label: "Housing", tone: "chart-1" },
  { id: "groceries", label: "Groceries", tone: "chart-2" },
  { id: "dining", label: "Dining out", tone: "chart-3" },
  { id: "transport", label: "Transport", tone: "chart-4" },
  { id: "utilities", label: "Utilities", tone: "chart-5" },
  { id: "shopping", label: "Shopping", tone: "chart-6" },
  { id: "subscriptions", label: "Subscriptions", tone: "chart-7" },
  { id: "other", label: "Other", tone: "chart-8" },
  { id: "income", label: "Income", tone: "success" },
];
const SPEND_IDS = CATEGORIES.filter((c) => c.id !== "income").map(
  (c) => c.id as SpendId,
);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Fixed UTC dates: the same labels on the server and in the browser. */
const utc = (y: number, m: number, d: number): Date =>
  new Date(Date.UTC(y, m, d));
const dayLabel = (d: Date): string =>
  `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

const DAYS = range(30).map((i) => dayLabel(utc(2026, 8, 10 + i)));
const WEEKS = range(13).map((i) => dayLabel(utc(2026, 6, 11 + 7 * i)));
const YEAR = range(12).map((i) => utc(2025, 10 + i, 1));

/** The days money came in over the last 30: freelance, salary, interest, an invoice. */
const PAYDAYS: Readonly<Record<number, number>> = {
  4: 640,
  14: 5200,
  20: 21,
  28: 980,
};

const PERIODS: Record<Period, PeriodData> = {
  month: {
    unit: "Day",
    span: "last 30 days",
    compare: "vs. previous 30 days",
    labels: DAYS,
    ticks: DAYS,
    tickEvery: 7,
    income: range(30).map((i) => PAYDAYS[i] ?? 0),
    spending: {
      housing: 1450,
      groceries: 486,
      dining: 312,
      transport: 164,
      utilities: 228,
      shopping: 395,
      subscriptions: 118,
      other: 262,
    },
    incomeDelta: 4.2,
    spendingDelta: -3.1,
    rateDelta: 3.5,
    months: 1,
    seed: 0.4,
  },
  quarter: {
    unit: "Week",
    span: "last 13 weeks",
    compare: "vs. previous quarter",
    labels: WEEKS.map((w) => `Week of ${w}`),
    ticks: WEEKS,
    tickEvery: 4,
    income: [380, 5200, 19, 0, 1200, 0, 5200, 20, 0, 640, 5200, 21, 980],
    spending: {
      housing: 4350,
      groceries: 1296,
      dining: 860,
      transport: 530,
      utilities: 702,
      shopping: 980,
      subscriptions: 354,
      other: 840,
    },
    incomeDelta: 6.8,
    spendingDelta: 2.4,
    rateDelta: -1.2,
    months: 3,
    seed: 1.3,
  },
  year: {
    unit: "Month",
    span: "last 12 months",
    compare: "vs. previous year",
    labels: YEAR.map((d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`),
    ticks: YEAR.map((d) => MONTHS[d.getUTCMonth()]!),
    tickEvery: 2,
    income: [
      6120, 6480, 7950, 6210, 6050, 6390, 6620, 6180, 6940, 6300, 6510, 6841,
    ],
    spending: {
      housing: 17400,
      groceries: 5180,
      dining: 4610,
      transport: 2380,
      utilities: 2890,
      shopping: 4320,
      subscriptions: 1380,
      other: 3620,
    },
    incomeDelta: 9.1,
    spendingDelta: 5.6,
    rateDelta: 2,
    months: 12,
    seed: 2.1,
  },
};

const BUDGETS: readonly Budget[] = [
  { id: "groceries", limit: 450 },
  { id: "dining", limit: 350 },
  { id: "transport", limit: 250 },
  { id: "shopping", limit: 400 },
  { id: "subscriptions", limit: 150 },
];

const ACCOUNTS: readonly Account[] = [
  {
    id: "checking",
    name: "Everyday checking",
    meta: "Northwind Bank ·· 4821",
    icon: "numbers",
    balance: 8940,
    trend: [7.1, 6.4, 8.8, 7.9, 7.2, 9.4, 8.1, 7.6, 9.9, 8.6, 8.2, 8.9],
    tone: "chart-1",
  },
  {
    id: "savings",
    name: "High-yield savings",
    meta: "Northwind Bank ·· 1177",
    icon: "lock",
    balance: 12600,
    trend: [6.2, 6.8, 7.4, 7.9, 8.5, 9.1, 9.6, 10.2, 10.8, 11.4, 12, 12.6],
    tone: "chart-2",
  },
  {
    id: "brokerage",
    name: "Index fund",
    meta: "Harbor Invest",
    icon: "analytics",
    balance: 5210,
    trend: [4.1, 4.3, 4.0, 4.4, 4.6, 4.5, 4.8, 4.7, 5.0, 4.9, 5.1, 5.2],
    tone: "chart-4",
  },
  {
    id: "credit",
    name: "Credit card",
    meta: "Northwind Bank ·· 0093",
    icon: "document",
    balance: -2370,
    trend: [1.8, 2.4, 1.6, 2.1, 2.9, 2.2, 1.9, 2.6, 2.3, 2.8, 2.0, 2.4],
    tone: "chart-6",
  },
];

const TRANSACTIONS: readonly Transaction[] = [
  {
    id: "t1",
    date: "Oct 9",
    description: "Fresh Market",
    account: "Checking",
    category: "groceries",
    amount: -84.32,
  },
  {
    id: "t2",
    date: "Oct 8",
    description: "Client invoice #1042",
    account: "Checking",
    category: "income",
    amount: 980,
  },
  {
    id: "t3",
    date: "Oct 8",
    description: "Metro transit pass",
    account: "Credit card",
    category: "transport",
    amount: -49,
  },
  {
    id: "t4",
    date: "Oct 7",
    description: "Streamly",
    account: "Credit card",
    category: "subscriptions",
    amount: -15.99,
  },
  {
    id: "t5",
    date: "Oct 6",
    description: "Corner Bistro",
    account: "Credit card",
    category: "dining",
    amount: -62.4,
  },
  {
    id: "t6",
    date: "Oct 5",
    description: "City Power & Water",
    account: "Checking",
    category: "utilities",
    amount: -118.75,
  },
  {
    id: "t7",
    date: "Oct 4",
    description: "Hardware Hub",
    account: "Credit card",
    category: "shopping",
    amount: -146.2,
  },
  {
    id: "t8",
    date: "Oct 3",
    description: "Fresh Market",
    account: "Checking",
    category: "groceries",
    amount: -112.08,
  },
  {
    id: "t9",
    date: "Oct 1",
    description: "Rent, Elm Street",
    account: "Checking",
    category: "housing",
    amount: -1450,
  },
  {
    id: "t10",
    date: "Sep 30",
    description: "Interest",
    account: "Savings",
    category: "income",
    amount: 21.14,
  },
  {
    id: "t11",
    date: "Sep 28",
    description: "Noodle House",
    account: "Credit card",
    category: "dining",
    amount: -38.5,
  },
  {
    id: "t12",
    date: "Sep 26",
    description: "Pharmacy",
    account: "Credit card",
    category: "other",
    amount: -27.9,
  },
  {
    id: "t13",
    date: "Sep 24",
    description: "Salary, Northwind Ltd",
    account: "Checking",
    category: "income",
    amount: 5200,
  },
];

const EUR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const EUR_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  signDisplay: "exceptZero",
});
const eur = (n: number): string => EUR.format(n);
const sum = (values: readonly number[]): number =>
  values.reduce((a, b) => a + b, 0);

/** Spreads a period's spending over its bars: a deterministic wave, summing to `total`. */
function spread(total: number, n: number, seed: number): number[] {
  const raw = range(n).map(
    (i) =>
      1 + 0.45 * Math.sin(i * 1.9 + seed) + 0.25 * Math.sin(i * 0.7 + 2 * seed),
  );
  const weight = sum(raw);
  const out = raw.map((r) => Math.round((r / weight) * total));
  out[n - 1]! += total - sum(out);
  return out;
}

const categoryOf = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]!;

const PERIOD_OPTIONS: readonly SegmentOption[] = [
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];
const FLOW_OPTIONS: readonly SegmentOption[] = [
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
];
const TX_FILTERS: readonly SegmentOption[] = [
  { value: "all", label: "All" },
  { value: "in", label: "In" },
  { value: "out", label: "Out" },
];
const BALANCE = eur(sum(ACCOUNTS.map((a) => a.balance)));

const money = (n: number): string => (n < 0 ? `−${eur(-n)}` : eur(n));
const cents = (n: number): string => EUR_CENTS.format(n).replace("-", "−");
const badgeOf = (row: Transaction): BadgeVariant =>
  row.category === "income" ? "success" : "secondary";

// No bar chart component yet: the same markup, data-slot attributes and behaviour as
// <sone-bar-chart> (roving focus, a tooltip, a visually hidden data table).
const NICE_STEPS = [1, 2, 2.5, 5, 10] as const;
function niceCeiling(values: readonly number[], floor = 4): number {
  let max = floor;
  for (const v of values) if (Number.isFinite(v) && v > max) max = v;
  if (max <= 0) return 1;
  const base = 10 ** Math.floor(Math.log10(max));
  const step = NICE_STEPS.find((s) => max / base <= s * (1 + 1e-9)) ?? 10;
  return Number((step * base).toPrecision(12));
}

/** The "more" glyph of the row actions button. */
const DOTS = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);

interface RowMenu {
  readonly row: Transaction;
  readonly top: number;
  readonly right: number;
}

export default function FinancesTemplate() {
  const [period, setPeriod] = useState<Period>("month");
  const [flow, setFlow] = useState<Flow>("out");
  const data = PERIODS[period];

  const income = sum(data.income);
  const spent = sum(SPEND_IDS.map((id) => data.spending[id]));

  const stats = useMemo<readonly Stat[]>(() => {
    const net = income - spent;
    const pct = (n: number): string => `${Math.abs(n).toFixed(1)}%`;
    return [
      {
        id: "balance",
        label: "Balance",
        value: BALANCE,
        delta: net,
        tone: net >= 0 ? "positive" : "negative",
        trend: eur(Math.abs(net)),
        hint: `Net change, ${data.span}`,
      },
      {
        id: "income",
        label: "Income",
        value: eur(income),
        delta: data.incomeDelta,
        tone: data.incomeDelta >= 0 ? "positive" : "negative",
        trend: pct(data.incomeDelta),
        hint: data.compare,
      },
      {
        id: "spending",
        label: "Spending",
        value: eur(spent),
        delta: data.spendingDelta,
        // Spending more is bad news.
        tone: data.spendingDelta > 0 ? "negative" : "positive",
        trend: pct(data.spendingDelta),
        hint: data.compare,
      },
      {
        id: "rate",
        label: "Savings rate",
        value: `${Math.round((net / income) * 100)}%`,
        delta: data.rateDelta,
        tone: data.rateDelta >= 0 ? "positive" : "negative",
        trend: `${Math.abs(data.rateDelta).toFixed(1)} pts`,
        hint: data.compare,
      },
    ];
  }, [data, income, spent]);

  const flowLabel = flow === "in" ? "Money in" : "Money out";
  const chartLabel = `${flowLabel} per ${data.unit.toLowerCase()}, ${data.span}`;

  const series = useMemo<readonly FlowDatum[]>(() => {
    const values =
      flow === "in"
        ? data.income
        : spread(spent, data.labels.length, data.seed);
    return values.map((value, i) => ({
      key: `${period}-${i}`,
      value,
      label: data.labels[i]!,
      tick: data.ticks[i]!,
    }));
  }, [data, flow, period, spent]);

  const flowSummary = useMemo(() => {
    const total = sum(series.map((r) => r.value));
    const peak = series.reduce(
      (a, b) => (b.value > a.value ? b : a),
      series[0]!,
    );
    return {
      total: eur(total),
      average: eur(total / series.length),
      peak: eur(peak.value),
      peakLabel: peak.label,
    };
  }, [series]);

  const chartTone = flow === "in" ? "var(--chart-2)" : "var(--chart-1)";
  const bars = useMemo(() => {
    const top = niceCeiling(series.map((d) => d.value));
    const every = data.tickEvery;
    return series.map((d, i) => ({
      key: d.key,
      label: d.label,
      value: eur(d.value),
      pct: Math.min(Math.max((d.value / top) * 100, 0), 100),
      empty: !(d.value > 0),
      // The newest bar always carries a tick; then every `tickEvery`-th one back.
      tick: (series.length - 1 - i) % every === 0 ? d.tick : null,
      tip: `${d.label} · ${eur(d.value)}`,
    }));
  }, [series, data]);

  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const cols = useRef<(HTMLDivElement | null)[]>([]);

  const n = bars.length;
  const current =
    n === 0
      ? -1
      : active === null
        ? n - 1
        : Math.min(Math.max(active, 0), n - 1);
  const shown = dismissed
    ? null
    : hovered !== null && hovered < n
      ? hovered
      : focusWithin
        ? current
        : null;
  const tip = (() => {
    if (shown === null || shown < 0 || shown >= n) return null;
    const bar = bars[shown]!;
    const mid = (shown + 0.5) / n;
    const align = mid < 0.15 ? "start" : mid > 0.85 ? "end" : "center";
    const at =
      align === "start" ? shown / n : align === "end" ? (shown + 1) / n : mid;
    return { text: bar.tip, pct: bar.empty ? 0 : bar.pct, at: at * 100, align };
  })();

  function onBarEnter(i: number): void {
    setDismissed(false);
    setHovered(i);
  }

  function onBarFocus(i: number): void {
    setActive(i);
    setFocusWithin(true);
  }

  function onBarsBlur(event: FocusEvent<HTMLDivElement>): void {
    const next = event.relatedTarget as Node | null;
    if (!next || !event.currentTarget.contains(next)) {
      setFocusWithin(false);
      setDismissed(false);
    }
  }

  function onBarsKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (n === 0) return;
    if (event.key === "Escape") {
      if (shown !== null) {
        setDismissed(true);
        event.preventDefault();
      }
      return;
    }
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const moves: Record<string, number> = {
      ArrowLeft: current + (rtl ? 1 : -1),
      ArrowRight: current + (rtl ? -1 : 1),
      Home: 0,
      End: n - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const to = Math.min(Math.max(moves[event.key]!, 0), n - 1);
    setDismissed(false);
    setHovered(null);
    setActive(to);
    cols.current[to]?.focus();
  }

  function changePeriod(value: string): void {
    if (value in PERIODS) {
      setPeriod(value as Period);
      setActive(null);
    }
  }

  function changeFlow(value: string): void {
    setFlow(value === "in" ? "in" : "out");
  }

  const segments = useMemo<readonly SoneStackedBarSegment[]>(
    () =>
      SPEND_IDS.map((id) => {
        const c = categoryOf(id);
        return {
          key: id,
          label: c.label,
          value: data.spending[id],
          tone: c.tone,
        };
      }),
    [data],
  );
  const categoryBars = useMemo<readonly SoneBarListItem[]>(
    () =>
      SPEND_IDS.map((id) => {
        const c = categoryOf(id);
        return {
          key: id,
          label: c.label,
          value: data.spending[id],
          tone: c.tone,
        };
      }).sort((a, b) => b.value - a.value),
    [data],
  );

  const budgets = BUDGETS.map((b) => {
    const spentHere = data.spending[b.id];
    const limit = b.limit * data.months;
    const pct = Math.round((spentHere / limit) * 100);
    const tone: SoneProgressTone =
      pct > 100 ? "destructive" : pct >= 85 ? "warning" : "default";
    return {
      id: b.id,
      label: categoryOf(b.id).label,
      spent: eur(spentHere),
      limit: eur(limit),
      pct: Math.min(pct, 100),
      tone,
      status:
        spentHere > limit
          ? `${eur(spentHere - limit)} over · ${pct}%`
          : `${eur(limit - spentHere)} left · ${pct}%`,
    };
  });
  const overBudget = budgets.filter((b) => b.tone === "destructive").length;

  const [txFilter, setTxFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<readonly Transaction[]>(TRANSACTIONS);
  const [archived, setArchived] = useState<readonly Transaction[]>([]);
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((t) => {
      if (txFilter === "in" && t.amount < 0) return false;
      if (txFilter === "out" && t.amount > 0) return false;
      if (!q) return true;
      return [t.description, t.account, categoryOf(t.category).label].some(
        (s) => s.toLowerCase().includes(q),
      );
    });
  }, [rows, txFilter, query]);

  function categorise(id: string, category: CategoryId): void {
    setRows((all) => all.map((t) => (t.id === id ? { ...t, category } : t)));
  }

  function archive(id: string): void {
    const row = rows.find((t) => t.id === id);
    if (!row) return;
    setArchived((all) => [...all, row]);
    setRows((all) => all.filter((t) => t.id !== id));
  }

  function restore(): void {
    const order = TRANSACTIONS.map((t) => t.id);
    setRows((all) =>
      [...all, ...archived].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      ),
    );
    setArchived([]);
  }

  // A ghost icon button opens a SoneMenu, fixed to the viewport (portalled to <body>)
  // so the scrolling table never clips it.
  const [menu, setMenu] = useState<RowMenu | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLElement | null>(null);

  const menuItems = (): HTMLElement[] =>
    Array.from(
      panel.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"], [role="menuitemradio"]',
      ) ?? [],
    );

  function toggleMenu(row: Transaction, event: MouseEvent<HTMLElement>): void {
    if (menu?.row.id === row.id) return closeMenu();
    const trigger = event.currentTarget;
    menuTrigger.current = trigger;
    const rect = trigger.getBoundingClientRect();
    const next = {
      row,
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    };
    // Opened from the keyboard: move focus into the menu.
    if (event.detail !== 0) return setMenu(next);
    flushSync(() => setMenu(next));
    menuItems()[0]?.focus();
  }

  function closeMenu(restoreFocus = false): void {
    setMenu(null);
    if (restoreFocus) menuTrigger.current?.focus();
  }

  function pick(category: CategoryId): void {
    if (menu) categorise(menu.row.id, category);
    closeMenu(true);
  }

  function archiveFromMenu(): void {
    if (menu) archive(menu.row.id);
    closeMenu();
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "Escape" || event.key === "Tab") {
      closeMenu(true);
      return;
    }
    const items = menuItems();
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next: Record<string, number> = {
      ArrowDown: (at + 1) % items.length,
      ArrowUp: (at - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    items[next[event.key]!]?.focus();
  }

  // A click outside the open menu (and its trigger) closes it.
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

  const columns: readonly SoneTableColumn<Transaction>[] = [
    {
      key: "date",
      header: "Date",
      width: "72px",
      cell: (row) => <span className="num muted">{row.date}</span>,
    },
    {
      key: "description",
      header: "Description",
      cell: (row) => (
        <span className="tx-name">
          <span className="tx-title">{row.description}</span>
          <span className="tx-account">{row.account}</span>
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      width: "130px",
      cell: (row) => (
        <SoneBadge variant={badgeOf(row)}>
          {categoryOf(row.category).label}
        </SoneBadge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: "112px",
      alignEnd: true,
      cell: (row) => (
        <span className={cx("num amount", row.amount > 0 && "positive")}>
          {cents(row.amount)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      width: "48px",
      cell: (row) => (
        <SoneButton
          variant="ghost"
          size="icon-xs"
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu?.row.id === row.id}
          aria-controls={menu?.row.id === row.id ? "fin-row-menu" : undefined}
          aria-label={`Actions for ${row.description}`}
          title={`Actions for ${row.description}`}
          onClick={(event: MouseEvent<HTMLElement>) => toggleMenu(row, event)}
        >
          {DOTS}
        </SoneButton>
      ),
    },
  ];

  return (
    <div className="finances tpl-finances">
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Household · EUR</SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">Finances</SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Cash flow, spending and budgets across every account, synced a few
            minutes ago.
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneSegmented
            size="sm"
            ariaLabel="Period"
            options={PERIOD_OPTIONS}
            value={period}
            onValueChange={changePeriod}
          />
          <SoneButton variant="outline" size="sm" type="button">
            <SoneIcon icon="download" />
            <span>Export</span>
          </SoneButton>
          <SoneButton size="sm" type="button">
            <SoneIcon icon="plus" />
            <span>Add transaction</span>
          </SoneButton>
        </SonePageHeaderActions>
      </SonePageHeader>

      <SoneStatGroup className="stats" aria-label="Key figures">
        {stats.map((stat) => (
          <SoneStat key={stat.id}>
            <SoneStatLabel>{stat.label}</SoneStatLabel>
            <SoneStatValue>{stat.value}</SoneStatValue>
            <SoneStatTrend delta={stat.delta} tone={stat.tone}>
              {stat.trend}
            </SoneStatTrend>
            <SoneStatHint>{stat.hint}</SoneStatHint>
          </SoneStat>
        ))}
      </SoneStatGroup>

      <div className="grid">
        <SoneCard
          as="section"
          className="cash"
          aria-labelledby="fin-cash-title"
        >
          <SoneCardHeader>
            <SoneCardTitle id="fin-cash-title">Cash flow</SoneCardTitle>
            <SoneCardDescription>
              Money in and out, {data.span}
            </SoneCardDescription>
            <SoneCardAction>
              <SoneSegmented
                size="sm"
                ariaLabel="Cash flow series"
                options={FLOW_OPTIONS}
                value={flow}
                onValueChange={changeFlow}
              />
            </SoneCardAction>
          </SoneCardHeader>
          <SoneCardContent className="cash-body">
            {/* No bar chart component yet: the same markup and classes as <sone-bar-chart>. */}
            <div
              data-slot="bar-chart"
              data-zero="baseline"
              className="bar-chart"
              style={{ "--_color": chartTone } as CSSProperties}
            >
              <div
                className="bar-chart-plot"
                data-slot="bar-chart-plot"
                style={{ height: "160px" }}
                onPointerLeave={() => setHovered(null)}
              >
                <div
                  className="bar-chart-bars"
                  role="group"
                  aria-label={chartLabel}
                  onKeyDown={onBarsKeyDown}
                  onBlur={onBarsBlur}
                >
                  {bars.map((bar, i) => (
                    <div
                      key={bar.key}
                      ref={(el) => {
                        cols.current[i] = el;
                      }}
                      className="bar-chart-col"
                      data-slot="bar-chart-bar"
                      role="img"
                      aria-label={bar.tip}
                      tabIndex={i === current ? 0 : -1}
                      data-empty={bar.empty ? "" : undefined}
                      data-shown={shown === i ? "" : undefined}
                      onPointerEnter={() => onBarEnter(i)}
                      onFocus={() => onBarFocus(i)}
                    >
                      {bar.empty ? (
                        <span className="bar-chart-bar bar-chart-bar--zero" />
                      ) : (
                        <span
                          className="bar-chart-bar"
                          style={{ height: `${bar.pct}%` }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {tip ? (
                  <div
                    className="bar-chart-tooltip"
                    data-slot="bar-chart-tooltip"
                    aria-hidden="true"
                    data-align={tip.align}
                    style={{ left: `${tip.at}%`, bottom: `${tip.pct}%` }}
                  >
                    {tip.text}
                  </div>
                ) : null}
              </div>
              <div
                className="bar-chart-axis"
                data-slot="bar-chart-axis"
                aria-hidden="true"
              >
                {bars.map((bar) => (
                  <span key={bar.key} className="bar-chart-tick">
                    {bar.tick ? (
                      <span className="bar-chart-tick-text">{bar.tick}</span>
                    ) : null}
                  </span>
                ))}
              </div>
              <table className="sr-only">
                <caption>{chartLabel}</caption>
                <thead>
                  <tr>
                    <th scope="col">{data.unit}</th>
                    <th scope="col">{flowLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {bars.map((bar) => (
                    <tr key={bar.key}>
                      <th scope="row">{bar.label}</th>
                      <td>{bar.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <SoneStatGroup
              layout="inline"
              separated
              aria-label={`${flowLabel} summary`}
            >
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>Total</SoneStatLabel>
                <SoneStatValue>{flowSummary.total}</SoneStatValue>
              </SoneStat>
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>
                  Average per {data.unit.toLowerCase()}
                </SoneStatLabel>
                <SoneStatValue>{flowSummary.average}</SoneStatValue>
              </SoneStat>
              <SoneStat variant="plain" size="sm">
                <SoneStatLabel>Peak</SoneStatLabel>
                <SoneStatValue>{flowSummary.peak}</SoneStatValue>
                <SoneStatHint>{flowSummary.peakLabel}</SoneStatHint>
              </SoneStat>
            </SoneStatGroup>
          </SoneCardContent>
        </SoneCard>

        <SoneCard
          as="section"
          className="spending"
          aria-labelledby="fin-spend-title"
        >
          <SoneCardHeader>
            <SoneCardTitle id="fin-spend-title">
              Spending by category
            </SoneCardTitle>
            <SoneCardDescription>
              {`${eur(spent)} ${data.span}`}
            </SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent className="spending-body">
            <SoneStackedBar
              aria-label="Share of spending by category"
              segments={segments}
              valueLabel={eur}
            />
            <SoneBarList
              items={categoryBars}
              valueFormat={eur}
              aria-label="Spending by category"
            />
          </SoneCardContent>
        </SoneCard>

        <SoneCard
          as="section"
          className="budgets"
          aria-labelledby="fin-budget-title"
        >
          <SoneCardHeader>
            <SoneCardTitle id="fin-budget-title">Budgets</SoneCardTitle>
            <SoneCardDescription>
              {overBudget === 0 ? "All on track" : `${overBudget} over budget`}{" "}
              · {data.span}
            </SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent>
            <ul className="budget-list">
              {budgets.map((b) => (
                <li key={b.id} className="budget">
                  <div className="budget-row">
                    <span className="budget-name">{b.label}</span>
                    <span className="budget-amount num">
                      {b.spent} <span className="muted">of {b.limit}</span>
                    </span>
                  </div>
                  <SoneProgress
                    value={b.pct}
                    tone={b.tone}
                    aria-label={`${b.label} budget`}
                  />
                  <p className="budget-status" data-tone={b.tone}>
                    {b.status}
                  </p>
                </li>
              ))}
            </ul>
          </SoneCardContent>
        </SoneCard>

        <SoneCard
          as="section"
          className="accounts"
          aria-labelledby="fin-acct-title"
        >
          <SoneCardHeader>
            <SoneCardTitle id="fin-acct-title">Accounts</SoneCardTitle>
            <SoneCardDescription>Net worth {BALANCE}</SoneCardDescription>
          </SoneCardHeader>
          <SoneCardContent>
            <SoneItemGroup as="ul" size="sm">
              {ACCOUNTS.map((a) => (
                <SoneItem key={a.id} as="li" size="sm">
                  <SoneItemMedia as="span" variant="icon">
                    <SoneIcon icon={a.icon} />
                  </SoneItemMedia>
                  <SoneItemContent>
                    <SoneItemTitle>{a.name}</SoneItemTitle>
                    <SoneItemDescription>{a.meta}</SoneItemDescription>
                  </SoneItemContent>
                  <SoneItemActions>
                    <SoneSparkline
                      className="acct-trend"
                      type="area"
                      values={a.trend}
                      tone={a.tone}
                    />
                    <span
                      className={cx(
                        "acct-balance num",
                        a.balance < 0 && "negative",
                      )}
                    >
                      {money(a.balance)}
                    </span>
                  </SoneItemActions>
                </SoneItem>
              ))}
            </SoneItemGroup>
          </SoneCardContent>
        </SoneCard>

        <SoneCard as="section" className="tx" aria-labelledby="fin-tx-title">
          <SoneCardHeader>
            <SoneCardTitle id="fin-tx-title">Transactions</SoneCardTitle>
            <SoneCardDescription>
              {visibleRows.length} of {rows.length} transactions
            </SoneCardDescription>
            <SoneCardAction>
              <SoneSegmented
                value={txFilter}
                onValueChange={setTxFilter}
                size="sm"
                ariaLabel="Filter transactions"
                options={TX_FILTERS}
              />
            </SoneCardAction>
          </SoneCardHeader>
          <SoneCardContent className="tx-body">
            <div className="toolbar">
              <SoneInputGroup className="search">
                <SoneInputGroupAddon as="span">
                  <SoneIcon icon="search" />
                </SoneInputGroupAddon>
                <SoneInputGroupInput
                  value={query}
                  onValueChange={setQuery}
                  type="search"
                  autoComplete="off"
                  placeholder="Search transactions"
                  aria-label="Search transactions"
                />
              </SoneInputGroup>
              {archived.length ? (
                <SoneButton
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={restore}
                >
                  <SoneIcon icon="refresh" />
                  <span>Restore {archived.length} archived</span>
                </SoneButton>
              ) : null}
            </div>
            <SoneTable
              rows={visibleRows}
              columns={columns}
              rowKey={(row) => row.id}
              caption="Recent transactions"
              emptyText="No transactions match your search."
            />
          </SoneCardContent>
        </SoneCard>
      </div>

      {/* Portalled out of the root: `tpl-finances` on the menu itself keeps its styles applying. */}
      {menu
        ? createPortal(
            <SoneMenu
              id="fin-row-menu"
              ref={panel}
              className="tpl-finances row-panel"
              style={{ top: `${menu.top}px`, right: `${menu.right}px` }}
              aria-label={`Actions for ${menu.row.description}`}
              tabIndex={-1}
              onKeyDown={onMenuKeyDown}
            >
              <SoneMenuGroup aria-label="Category">
                <SoneMenuLabel>Category</SoneMenuLabel>
                {CATEGORIES.map((c) => (
                  <SoneMenuRadioItem
                    key={c.id}
                    type="button"
                    checked={menu.row.category === c.id}
                    onClick={() => pick(c.id)}
                  >
                    {c.label}
                  </SoneMenuRadioItem>
                ))}
              </SoneMenuGroup>
              <SoneMenuSeparator />
              <SoneMenuItem
                type="button"
                variant="destructive"
                onClick={archiveFromMenu}
              >
                <SoneIcon icon="trash" /> Archive
              </SoneMenuItem>
            </SoneMenu>,
            document.body,
          )
        : null}
    </div>
  );
}

const css = `
.tpl-finances.finances {
  padding: var(--space-6);
}
.tpl-finances .stats {
  margin: var(--space-5) 0;
}
.tpl-finances .grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--space-4);
}
.tpl-finances .tx {
  grid-column: 1 / -1;
}
.tpl-finances .cash-body,
.tpl-finances .spending-body,
.tpl-finances .tx-body {
  display: grid;
  gap: var(--space-5);
}
.tpl-finances .tx-body {
  gap: var(--space-3);
}
.tpl-finances .num {
  font-variant-numeric: tabular-nums;
}
.tpl-finances .muted {
  color: var(--text-muted);
}
.tpl-finances .budget-list {
  display: grid;
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.tpl-finances .budget {
  display: grid;
  gap: var(--space-2);
}
.tpl-finances .budget-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
}
.tpl-finances .budget-name {
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}
.tpl-finances .budget-amount {
  color: var(--text-primary);
  white-space: nowrap;
}
.tpl-finances .budget-status {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-finances .budget-status[data-tone="warning"] {
  color: var(--warning-text);
}
.tpl-finances .budget-status[data-tone="destructive"] {
  color: var(--danger-text);
}
.tpl-finances .acct-trend {
  width: 4.5rem;
  --sone-sparkline-h: var(--space-5);
}
.tpl-finances .acct-balance {
  min-width: 5.5rem;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: end;
}
.tpl-finances .acct-balance.negative {
  color: var(--danger-text);
}
.tpl-finances .toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-finances .search {
  flex: 0 1 18rem;
  min-width: 0;
}
.tpl-finances .tx-name {
  display: grid;
  min-width: 0;
  line-height: var(--leading-tight);
}
.tpl-finances .tx-title {
  overflow: hidden;
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-finances .tx-account {
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-finances .amount {
  color: var(--text-primary);
  white-space: nowrap;
}
.tpl-finances .amount.positive {
  color: var(--success-text);
}
.tpl-finances.row-panel {
  position: fixed;
  z-index: var(--z-overlay);
  max-width: calc(100vw - 2 * var(--space-4));
}

/* <sone-bar-chart>'s component styles. */
.tpl-finances .bar-chart {
  display: block;
  position: relative;
  min-width: 0;
}
.tpl-finances .bar-chart-plot {
  position: relative;
  border-bottom: var(--border-width-thin) solid var(--chart-baseline);
}
.tpl-finances .bar-chart-bars {
  display: flex;
  align-items: stretch;
  gap: var(--space-1);
  height: 100%;
}
.tpl-finances .bar-chart-col {
  display: flex;
  flex: 1 1 0;
  align-items: flex-end;
  min-width: 0;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  outline: none;
  transition: background-color var(--transition-fast);
}
.tpl-finances .bar-chart-col[data-shown] {
  background: var(--chart-grid);
}
.tpl-finances .bar-chart-col:focus-visible {
  box-shadow: var(--focus-ring);
}
.tpl-finances .bar-chart-bar {
  width: 100%;
  min-height: calc(var(--space-1) / 2);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: var(--_color, var(--accent));
  transform-origin: bottom;
  animation: fin-bar-grow var(--motion-enter-dur) var(--ease-spring) both;
}
.tpl-finances .bar-chart-bar--zero {
  height: calc(var(--space-1) * 0.75);
  border-radius: var(--radius-pill);
  background: var(--chart-axis);
  opacity: 0.35;
  animation: none;
}
.tpl-finances .bar-chart-tooltip {
  position: absolute;
  z-index: calc(var(--z-raised) + 1);
  margin-bottom: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border: var(--border-width-thin) solid var(--chart-tooltip-border);
  border-radius: var(--radius-sm);
  background: var(--chart-tooltip-bg);
  box-shadow: var(--shadow-lg);
  color: var(--chart-tooltip-text);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
  line-height: var(--leading-tight);
  white-space: nowrap;
  pointer-events: none;
  transform: translateX(-50%);
  animation: fin-bar-tip var(--transition-fast) both;
}
.tpl-finances .bar-chart-tooltip[data-align="start"] {
  transform: none;
}
.tpl-finances .bar-chart-tooltip[data-align="end"] {
  transform: translateX(-100%);
}
.tpl-finances .bar-chart-axis {
  display: flex;
  gap: var(--space-1);
  margin-top: var(--space-1);
}
.tpl-finances .bar-chart-tick {
  display: flex;
  flex: 1 1 0;
  justify-content: center;
  min-width: 0;
}
.tpl-finances .bar-chart-tick:first-child {
  justify-content: flex-start;
}
.tpl-finances .bar-chart-tick:last-child {
  justify-content: flex-end;
}
.tpl-finances .bar-chart-tick-text {
  color: var(--chart-axis);
  font-family: var(--font-mono);
  font-size: var(--font-size-2xs);
  white-space: nowrap;
}
@keyframes fin-bar-grow {
  from {
    transform: scaleY(0);
  }
}
@keyframes fin-bar-tip {
  from {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .tpl-finances .bar-chart-bar,
  .tpl-finances .bar-chart-tooltip {
    animation: none;
  }
  .tpl-finances .bar-chart-col {
    transition: none;
  }
}

@media (max-width: 900px) {
  .tpl-finances .grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .tpl-finances .cash,
  .tpl-finances .accounts {
    grid-column: 1 / -1;
  }
}
@media (max-width: 600px) {
  .tpl-finances.finances {
    padding: var(--space-4);
  }
  .tpl-finances .grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-finances .acct-trend {
    display: none;
  }
  .tpl-finances .search {
    flex-basis: 100%;
  }
}
`;
