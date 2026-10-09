import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import {
  SoneBadgeDirective,
  type BadgeVariant,
} from "@surface-one/angular/badge";
import {
  SoneBarChartComponent,
  type SoneBarChartDatum,
} from "@surface-one/angular/bar-chart";
import {
  SONE_BAR_LIST_PARTS,
  type SoneBarListItem,
} from "@surface-one/angular/bar-list";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { type SoneChartTone } from "@surface-one/angular/chart-utils";
import { SoneIconComponent, type ShellIcon } from "@surface-one/angular/icon";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";
import {
  SoneProgressComponent,
  type SoneProgressTone,
} from "@surface-one/angular/progress";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSparklineComponent } from "@surface-one/angular/sparkline";
import {
  SoneStackedBarComponent,
  type SoneStackedBarSegment,
} from "@surface-one/angular/stacked-bar";
import { SONE_STAT_PARTS } from "@surface-one/angular/stat";
import {
  SoneTableColumnComponent,
  SoneTableComponent,
} from "@surface-one/angular/table";

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
  readonly tone: SoneChartTone;
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

interface FlowDatum extends SoneBarChartDatum {
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
  readonly tone: SoneChartTone;
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
    ticks: YEAR.map((d) => MONTHS[d.getUTCMonth()]),
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
  out[n - 1] += total - sum(out);
  return out;
}

const categoryOf = (id: CategoryId): Category =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];

@Component({
  selector: "docs-finances-template",
  imports: [
    ...SONE_PAGE_HEADER_PARTS,
    ...SONE_CARD_PARTS,
    ...SONE_STAT_PARTS,
    ...SONE_BAR_LIST_PARTS,
    ...SONE_ITEM_PARTS,
    ...SONE_INPUT_GROUP_PARTS,
    ...SONE_MENU_PARTS,
    SoneBadgeDirective,
    SoneBarChartComponent,
    SoneButtonDirective,
    SoneIconComponent,
    SoneProgressComponent,
    SoneRowMenuComponent,
    SoneSegmentedComponent,
    SoneSparklineComponent,
    SoneStackedBarComponent,
    SoneTableComponent,
    SoneTableColumnComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div sonePageHeader>
      <div sonePageHeaderContent>
        <p sonePageHeaderEyebrow>Household · EUR</p>
        <h2 sonePageHeaderTitle>Finances</h2>
        <p sonePageHeaderDescription>
          Cash flow, spending and budgets across every account, synced a few
          minutes ago.
        </p>
      </div>
      <div sonePageHeaderActions>
        <sone-segmented
          size="sm"
          ariaLabel="Period"
          [options]="periods"
          [value]="period()"
          (valueChange)="setPeriod($event)"
        />
        <button soneBtn variant="outline" size="sm" type="button">
          <sone-icon icon="download" /><span>Export</span>
        </button>
        <button soneBtn size="sm" type="button">
          <sone-icon icon="plus" /><span>Add transaction</span>
        </button>
      </div>
    </div>

    <dl soneStatGroup class="stats" aria-label="Key figures">
      @for (stat of stats(); track stat.id) {
        <div soneStat>
          <dt soneStatLabel>{{ stat.label }}</dt>
          <dd soneStatValue>{{ stat.value }}</dd>
          <dd soneStatTrend [delta]="stat.delta" [tone]="stat.tone">
            {{ stat.trend }}
          </dd>
          <dd soneStatHint>{{ stat.hint }}</dd>
        </div>
      }
    </dl>

    <div class="grid">
      <section soneCard class="cash" aria-labelledby="fin-cash-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="fin-cash-title">Cash flow</h3>
          <p soneCardDescription>Money in and out, {{ data().span }}</p>
          <div soneCardAction>
            <sone-segmented
              size="sm"
              ariaLabel="Cash flow series"
              [options]="flows"
              [value]="flow()"
              (valueChange)="setFlow($event)"
            />
          </div>
        </div>
        <div soneCardContent class="cash-body">
          <sone-bar-chart
            [data]="series()"
            [tick]="tick"
            [tooltip]="tooltip"
            [valueFormat]="eur"
            [tone]="flow() === 'in' ? 'chart-2' : 'chart-1'"
            [height]="160"
            [ariaLabel]="chartLabel()"
            [categoryHeader]="data().unit"
            [valueHeader]="flowLabel()"
          />
          <dl
            soneStatGroup
            layout="inline"
            separated
            [attr.aria-label]="flowLabel() + ' summary'"
          >
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Total</dt>
              <dd soneStatValue>{{ flowSummary().total }}</dd>
            </div>
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Average per {{ data().unit.toLowerCase() }}</dt>
              <dd soneStatValue>{{ flowSummary().average }}</dd>
            </div>
            <div soneStat variant="plain" size="sm">
              <dt soneStatLabel>Peak</dt>
              <dd soneStatValue>{{ flowSummary().peak }}</dd>
              <dd soneStatHint>{{ flowSummary().peakLabel }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section soneCard class="spending" aria-labelledby="fin-spend-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="fin-spend-title">Spending by category</h3>
          <p soneCardDescription>{{ spendingTotal() }} {{ data().span }}</p>
        </div>
        <div soneCardContent class="spending-body">
          <sone-stacked-bar
            ariaLabel="Share of spending by category"
            [segments]="segments()"
            [valueLabel]="eur"
          />
          <sone-bar-list
            [items]="categoryBars()"
            [valueFormat]="eur"
            ariaLabel="Spending by category"
          />
        </div>
      </section>

      <section soneCard class="budgets" aria-labelledby="fin-budget-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="fin-budget-title">Budgets</h3>
          <p soneCardDescription>
            {{
              overBudget() === 0
                ? "All on track"
                : overBudget() + " over budget"
            }}
            · {{ data().span }}
          </p>
        </div>
        <div soneCardContent>
          <ul class="budget-list">
            @for (b of budgets(); track b.id) {
              <li class="budget">
                <div class="budget-row">
                  <span class="budget-name">{{ b.label }}</span>
                  <span class="budget-amount num"
                    >{{ b.spent }}
                    <span class="muted">of {{ b.limit }}</span></span
                  >
                </div>
                <sone-progress
                  [value]="b.pct"
                  [tone]="b.tone"
                  [ariaLabel]="b.label + ' budget'"
                />
                <p class="budget-status" [attr.data-tone]="b.tone">
                  {{ b.status }}
                </p>
              </li>
            }
          </ul>
        </div>
      </section>

      <section soneCard class="accounts" aria-labelledby="fin-acct-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="fin-acct-title">Accounts</h3>
          <p soneCardDescription>Net worth {{ balance }}</p>
        </div>
        <div soneCardContent>
          <ul soneItemGroup size="sm">
            @for (a of accounts; track a.id) {
              <li soneItem size="sm">
                <span soneItemMedia variant="icon"
                  ><sone-icon [icon]="a.icon"
                /></span>
                <div soneItemContent>
                  <p soneItemTitle>{{ a.name }}</p>
                  <p soneItemDescription>{{ a.meta }}</p>
                </div>
                <div soneItemActions>
                  <sone-sparkline
                    class="acct-trend"
                    type="area"
                    [values]="a.trend"
                    [tone]="a.tone"
                  />
                  <span
                    class="acct-balance num"
                    [class.negative]="a.balance < 0"
                    >{{ money(a.balance) }}</span
                  >
                </div>
              </li>
            }
          </ul>
        </div>
      </section>

      <section soneCard class="tx" aria-labelledby="fin-tx-title">
        <div soneCardHeader>
          <h3 soneCardTitle id="fin-tx-title">Transactions</h3>
          <p soneCardDescription>
            {{ visibleRows().length }} of {{ rows().length }} transactions
          </p>
          <div soneCardAction>
            <sone-segmented
              size="sm"
              ariaLabel="Filter transactions"
              [options]="txFilters"
              [(value)]="txFilter"
            />
          </div>
        </div>
        <div soneCardContent class="tx-body">
          <div class="toolbar">
            <div soneInputGroup class="search">
              <span soneInputGroupAddon><sone-icon icon="search" /></span>
              <input
                soneInputGroupInput
                type="search"
                autocomplete="off"
                placeholder="Search transactions"
                aria-label="Search transactions"
                [value]="query()"
                (input)="query.set($any($event.target).value)"
              />
            </div>
            @if (archived().length) {
              <button
                soneBtn
                variant="ghost"
                size="sm"
                type="button"
                (click)="restore()"
              >
                <sone-icon icon="refresh" /><span
                  >Restore {{ archived().length }} archived</span
                >
              </button>
            }
          </div>
          <sone-table
            [rows]="visibleRows()"
            [trackBy]="trackById"
            caption="Recent transactions"
            emptyText="No transactions match your search."
          >
            <sone-table-column key="date" header="Date" width="72px">
              <ng-template let-row
                ><span class="num muted">{{ row.date }}</span></ng-template
              >
            </sone-table-column>
            <sone-table-column key="description" header="Description">
              <ng-template let-row>
                <span class="tx-name">
                  <span class="tx-title">{{ row.description }}</span>
                  <span class="tx-account">{{ row.account }}</span>
                </span>
              </ng-template>
            </sone-table-column>
            <sone-table-column key="category" header="Category" width="130px">
              <ng-template let-row>
                <span soneBadge [variant]="badgeOf(row)">{{
                  labelOf(row.category)
                }}</span>
              </ng-template>
            </sone-table-column>
            <sone-table-column
              key="amount"
              header="Amount"
              width="112px"
              [alignEnd]="true"
            >
              <ng-template let-row
                ><span class="num amount" [class.positive]="row.amount > 0">{{
                  cents(row.amount)
                }}</span></ng-template
              >
            </sone-table-column>
            <sone-table-column
              key="actions"
              header="Actions"
              [hideHeader]="true"
              width="48px"
            >
              <ng-template let-row>
                <sone-row-menu [label]="'Actions for ' + row.description">
                  <div soneMenuGroup aria-label="Category">
                    <p soneMenuLabel>Category</p>
                    @for (c of categories; track c.id) {
                      <button
                        soneMenuRadioItem
                        type="button"
                        [checked]="row.category === c.id"
                        (click)="categorise(row.id, c.id)"
                      >
                        {{ c.label }}
                      </button>
                    }
                  </div>
                  <div soneMenuSeparator></div>
                  <button
                    soneMenuItem
                    type="button"
                    variant="destructive"
                    (click)="archive(row.id)"
                  >
                    <sone-icon icon="trash" /> Archive
                  </button>
                </sone-row-menu>
              </ng-template>
            </sone-table-column>
          </sone-table>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding: var(--space-6);
    }
    .stats {
      margin: var(--space-5) 0;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
      gap: var(--space-4);
    }
    .tx {
      grid-column: 1 / -1;
    }
    .cash-body,
    .spending-body,
    .tx-body {
      display: grid;
      gap: var(--space-5);
    }
    .tx-body {
      gap: var(--space-3);
    }
    .num {
      font-variant-numeric: tabular-nums;
    }
    .muted {
      color: var(--text-muted);
    }
    .budget-list {
      display: grid;
      gap: var(--space-4);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .budget {
      display: grid;
      gap: var(--space-2);
    }
    .budget-row {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-3);
      font-size: var(--font-size-sm);
    }
    .budget-name {
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
    }
    .budget-amount {
      color: var(--text-primary);
      white-space: nowrap;
    }
    .budget-status {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .budget-status[data-tone="warning"] {
      color: var(--warning-text);
    }
    .budget-status[data-tone="destructive"] {
      color: var(--danger-text);
    }
    .acct-trend {
      width: 4.5rem;
      --sone-sparkline-h: var(--space-5);
    }
    .acct-balance {
      min-width: 5.5rem;
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-align: end;
    }
    .acct-balance.negative {
      color: var(--danger-text);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }
    .search {
      flex: 0 1 18rem;
      min-width: 0;
    }
    .tx-name {
      display: grid;
      min-width: 0;
      line-height: var(--leading-tight);
    }
    .tx-title {
      overflow: hidden;
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tx-account {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .amount {
      color: var(--text-primary);
      white-space: nowrap;
    }
    .amount.positive {
      color: var(--success-text);
    }
    @media (max-width: 900px) {
      .grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      }
      .cash,
      .accounts {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 600px) {
      :host {
        padding: var(--space-4);
      }
      .grid {
        grid-template-columns: minmax(0, 1fr);
      }
      .acct-trend {
        display: none;
      }
      .search {
        flex-basis: 100%;
      }
    }
  `,
})
export default class Template {
  protected readonly periods: readonly SegmentOption[] = [
    { value: "month", label: "Month" },
    { value: "quarter", label: "Quarter" },
    { value: "year", label: "Year" },
  ];
  protected readonly flows: readonly SegmentOption[] = [
    { value: "in", label: "Money in" },
    { value: "out", label: "Money out" },
  ];
  protected readonly txFilters: readonly SegmentOption[] = [
    { value: "all", label: "All" },
    { value: "in", label: "In" },
    { value: "out", label: "Out" },
  ];
  protected readonly categories = CATEGORIES;
  protected readonly accounts = ACCOUNTS;
  protected readonly balance = eur(sum(ACCOUNTS.map((a) => a.balance)));
  protected readonly eur = eur;

  protected readonly period = signal<Period>("month");
  protected readonly flow = signal<Flow>("out");
  protected readonly data = computed(() => PERIODS[this.period()]);

  private readonly income = computed(() => sum(this.data().income));
  private readonly spent = computed(() =>
    sum(SPEND_IDS.map((id) => this.data().spending[id])),
  );

  protected readonly stats = computed<readonly Stat[]>(() => {
    const d = this.data();
    const income = this.income();
    const spent = this.spent();
    const net = income - spent;
    const pct = (n: number): string => `${Math.abs(n).toFixed(1)}%`;
    return [
      {
        id: "balance",
        label: "Balance",
        value: this.balance,
        delta: net,
        tone: net >= 0 ? "positive" : "negative",
        trend: eur(Math.abs(net)),
        hint: `Net change, ${d.span}`,
      },
      {
        id: "income",
        label: "Income",
        value: eur(income),
        delta: d.incomeDelta,
        tone: d.incomeDelta >= 0 ? "positive" : "negative",
        trend: pct(d.incomeDelta),
        hint: d.compare,
      },
      {
        id: "spending",
        label: "Spending",
        value: eur(spent),
        delta: d.spendingDelta,
        // Spending more is bad news.
        tone: d.spendingDelta > 0 ? "negative" : "positive",
        trend: pct(d.spendingDelta),
        hint: d.compare,
      },
      {
        id: "rate",
        label: "Savings rate",
        value: `${Math.round(((income - spent) / income) * 100)}%`,
        delta: d.rateDelta,
        tone: d.rateDelta >= 0 ? "positive" : "negative",
        trend: `${Math.abs(d.rateDelta).toFixed(1)} pts`,
        hint: d.compare,
      },
    ];
  });

  protected readonly flowLabel = computed(() =>
    this.flow() === "in" ? "Money in" : "Money out",
  );
  protected readonly chartLabel = computed(
    () =>
      `${this.flowLabel()} per ${this.data().unit.toLowerCase()}, ${this.data().span}`,
  );

  protected readonly series = computed<readonly FlowDatum[]>(() => {
    const d = this.data();
    const values =
      this.flow() === "in"
        ? d.income
        : spread(this.spent(), d.labels.length, d.seed);
    return values.map((value, i) => ({
      key: `${this.period()}-${i}`,
      value,
      label: d.labels[i],
      tick: d.ticks[i],
    }));
  });

  protected readonly flowSummary = computed(() => {
    const rows = this.series();
    const total = sum(rows.map((r) => r.value));
    const peak = rows.reduce((a, b) => (b.value > a.value ? b : a), rows[0]);
    return {
      total: eur(total),
      average: eur(total / rows.length),
      peak: eur(peak.value),
      peakLabel: peak.label ?? "",
    };
  });

  /** The newest bar always carries a tick; then every `tickEvery`-th one back. */
  protected readonly tick = (d: FlowDatum, i: number): string | null =>
    (this.series().length - 1 - i) % this.data().tickEvery === 0
      ? d.tick
      : null;
  protected readonly tooltip = (d: FlowDatum): string =>
    `${d.label} · ${eur(d.value)}`;

  protected readonly spendingTotal = computed(() => eur(this.spent()));
  protected readonly segments = computed<readonly SoneStackedBarSegment[]>(() =>
    SPEND_IDS.map((id) => {
      const c = categoryOf(id);
      return {
        key: id,
        label: c.label,
        value: this.data().spending[id],
        tone: c.tone,
      };
    }),
  );
  protected readonly categoryBars = computed<readonly SoneBarListItem[]>(() =>
    SPEND_IDS.map((id) => {
      const c = categoryOf(id);
      return {
        key: id,
        label: c.label,
        value: this.data().spending[id],
        tone: c.tone,
      };
    }).sort((a, b) => b.value - a.value),
  );

  protected readonly budgets = computed(() => {
    const d = this.data();
    return BUDGETS.map((b) => {
      const spent = d.spending[b.id];
      const limit = b.limit * d.months;
      const pct = Math.round((spent / limit) * 100);
      const tone: SoneProgressTone =
        pct > 100 ? "destructive" : pct >= 85 ? "warning" : "default";
      return {
        id: b.id,
        label: categoryOf(b.id).label,
        spent: eur(spent),
        limit: eur(limit),
        pct: Math.min(pct, 100),
        tone,
        status:
          spent > limit
            ? `${eur(spent - limit)} over · ${pct}%`
            : `${eur(limit - spent)} left · ${pct}%`,
      };
    });
  });
  protected readonly overBudget = computed(
    () => this.budgets().filter((b) => b.tone === "destructive").length,
  );

  protected readonly txFilter = signal("all");
  protected readonly query = signal("");
  protected readonly rows = signal<readonly Transaction[]>(TRANSACTIONS);
  protected readonly archived = signal<readonly Transaction[]>([]);
  protected readonly visibleRows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const flow = this.txFilter();
    return this.rows().filter((t) => {
      if (flow === "in" && t.amount < 0) return false;
      if (flow === "out" && t.amount > 0) return false;
      if (!q) return true;
      return [t.description, t.account, categoryOf(t.category).label].some(
        (s) => s.toLowerCase().includes(q),
      );
    });
  });

  protected readonly trackById = (row: Transaction): string => row.id;

  protected setPeriod(value: string): void {
    if (value in PERIODS) this.period.set(value as Period);
  }

  protected setFlow(value: string): void {
    this.flow.set(value === "in" ? "in" : "out");
  }

  protected money(n: number): string {
    return n < 0 ? `−${eur(-n)}` : eur(n);
  }

  protected cents(n: number): string {
    return EUR_CENTS.format(n).replace("-", "−");
  }

  protected labelOf(id: CategoryId): string {
    return categoryOf(id).label;
  }

  protected badgeOf(row: Transaction): BadgeVariant {
    return row.category === "income" ? "success" : "secondary";
  }

  protected categorise(id: string, category: CategoryId): void {
    this.rows.update((rows) =>
      rows.map((t) => (t.id === id ? { ...t, category } : t)),
    );
  }

  protected archive(id: string): void {
    const row = this.rows().find((t) => t.id === id);
    if (!row) return;
    this.archived.update((rows) => [...rows, row]);
    this.rows.update((rows) => rows.filter((t) => t.id !== id));
  }

  protected restore(): void {
    const order = TRANSACTIONS.map((t) => t.id);
    this.rows.update((rows) =>
      [...rows, ...this.archived()].sort(
        (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
      ),
    );
    this.archived.set([]);
  }
}
