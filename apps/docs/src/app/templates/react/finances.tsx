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

import {
  type Period,
  type Flow,
  type SpendId,
  type CategoryId,
  type PeriodData,
  type Transaction,
  type Stat,
  MONTHS,
  range,
  DAYS,
  WEEKS,
  YEAR,
  PAYDAYS,
  BUDGETS,
  TRANSACTIONS,
  EUR_CENTS,
  eur,
  sum,
} from "../data/finances";

// The shared stylesheet (../styles/finances.css + finances.twins.css), prefixed with .tpl-finances.
import { css } from "../styles/scoped/finances.generated";

type ChartTone = NonNullable<SoneBarListItem["tone"]>;

interface Category {
  readonly id: CategoryId;
  readonly label: string;
  readonly tone: ChartTone;
}

interface FlowDatum {
  readonly key: string;
  readonly value: number;
  readonly label: string;
  readonly tick: string;
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
