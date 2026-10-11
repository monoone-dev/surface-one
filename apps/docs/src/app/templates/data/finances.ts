// The mock data of the finances template, shared by its Angular (finances.template.ts), Vue
// (vue/finances.vue) and React (react/finances.tsx) screens. Framework-free on purpose:
// scripts/build-template-sources.mjs inlines it into the source each "Code" tab shows.

export type Period = "month" | "quarter" | "year";
export type Flow = "in" | "out";
export type SpendId =
  | "housing"
  | "groceries"
  | "dining"
  | "transport"
  | "utilities"
  | "shopping"
  | "subscriptions"
  | "other";
export type CategoryId = SpendId | "income";

export interface PeriodData {
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

export interface Transaction {
  readonly id: string;
  readonly date: string;
  readonly description: string;
  readonly account: string;
  readonly category: CategoryId;
  readonly amount: number;
}

export interface Budget {
  readonly id: SpendId;
  readonly limit: number;
}

export interface Stat {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: number;
  readonly tone: "positive" | "negative";
  readonly trend: string;
  readonly hint: string;
}

export const MONTHS = [
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
export const utc = (y: number, m: number, d: number): Date =>
  new Date(Date.UTC(y, m, d));
export const dayLabel = (d: Date): string =>
  `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
export const range = (n: number): number[] =>
  Array.from({ length: n }, (_, i) => i);

export const DAYS = range(30).map((i) => dayLabel(utc(2026, 8, 10 + i)));
export const WEEKS = range(13).map((i) => dayLabel(utc(2026, 6, 11 + 7 * i)));
export const YEAR = range(12).map((i) => utc(2025, 10 + i, 1));

/** The days money came in over the last 30: freelance, salary, interest, an invoice. */
export const PAYDAYS: Readonly<Record<number, number>> = {
  4: 640,
  14: 5200,
  20: 21,
  28: 980,
};

export const BUDGETS: readonly Budget[] = [
  { id: "groceries", limit: 450 },
  { id: "dining", limit: 350 },
  { id: "transport", limit: 250 },
  { id: "shopping", limit: 400 },
  { id: "subscriptions", limit: 150 },
];

export const TRANSACTIONS: readonly Transaction[] = [
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

export const EUR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
export const EUR_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  signDisplay: "exceptZero",
});
export const eur = (n: number): string => EUR.format(n);
export const sum = (values: readonly number[]): number =>
  values.reduce((a, b) => a + b, 0);
