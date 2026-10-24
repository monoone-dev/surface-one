import type { Meta, StoryObj } from "@storybook/angular";

import {
  SoneDataTableComponent,
  type SoneDataTableColumn,
} from "./data-table.component";

interface Payment {
  readonly id: string;
  readonly status: "pending" | "processing" | "success" | "failed";
  readonly email: string;
  readonly amount: number;
}

const PAYMENTS: Payment[] = [
  {
    id: "m5gr84i9",
    status: "success",
    email: "ken99@example.com",
    amount: 316,
  },
  {
    id: "3u1reuv4",
    status: "success",
    email: "abe45@example.com",
    amount: 242,
  },
  {
    id: "derv1ws0",
    status: "processing",
    email: "monserrat44@example.com",
    amount: 837,
  },
  {
    id: "5kma53ae",
    status: "success",
    email: "silas22@example.com",
    amount: 874,
  },
  {
    id: "bhqecj4p",
    status: "failed",
    email: "carmella@example.com",
    amount: 721,
  },
  {
    id: "p0r8x1kq",
    status: "pending",
    email: "lena.k@example.com",
    amount: 129,
  },
  { id: "w2n7c6ty", status: "success", email: "omar@example.com", amount: 560 },
  {
    id: "z9h3b5vd",
    status: "processing",
    email: "ines@example.com",
    amount: 95,
  },
];

const COLUMNS: SoneDataTableColumn<Payment>[] = [
  { key: "status", header: "Status", sortable: true },
  { key: "email", header: "Email", sortable: true },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    alignEnd: true,
    width: "8rem",
  },
];

const meta: Meta<SoneDataTableComponent<Payment>> = {
  title: "Components/Data display/Data table",
  component: SoneDataTableComponent,
  tags: ["autodocs"],
  args: {
    rows: PAYMENTS,
    columns: COLUMNS,
    rowKey: (p: Payment) => p.id,
    pageSize: 5,
  },
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-data-table>` — the shadcn/ui Data Table, built on `<sone-table>` (its `columns` " +
          "input) instead of TanStack Table. Columns are data: `{ key, header, sortable, compare, value, " +
          "filterable, hideable, width, alignEnd, cell }`.\n\n" +
          "- **Sorting** — a `sortable` column's header is a ghost button that cycles ascending → " +
          "descending → unsorted; the sorted header carries `aria-sort`. `compare` replaces the default " +
          "comparator (numbers, dates, then text with a numeric collation; empty values last).\n" +
          "- **Filter** — `filterable` adds a search field over the table; it matches any " +
          "`filterable` column (case- and accent-insensitive) and goes back to page 1.\n" +
          "- **Pagination** — `pageSize` rows a page (0 = all) through `<sone-pagination>`.\n" +
          "- **Selection** — `selectable` adds a checkbox column with a select-all (mixed when some " +
          "rows of the page are checked); `[(selected)]` holds the row keys (`rowKey`).\n" +
          "- **Columns** — `columnToggle` adds a menu of checkbox items; `[(hiddenColumns)]`.\n" +
          "- **Loading** — `loading` marks the table `aria-busy` and shows a spinner.\n\n" +
          "Sort, filter, page, selection and hidden columns are all two-way models.\n\n" +
          "**Reference**\n\n" +
          "- spartan/ui — [https://spartan.ng/components/data-table](https://spartan.ng/components/data-table)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/data-table](https://ui.shadcn.com/docs/components/data-table)",
      },
    },
  },
};
export default meta;

type Story = StoryObj<SoneDataTableComponent<Payment>>;

export const Basic: Story = {};

export const Full: Story = {
  args: {
    filterable: true,
    selectable: true,
    columnToggle: true,
    rowLabel: (p: Payment) => p.email,
  },
};

export const Sorted: Story = {
  args: { sort: { key: "amount", direction: "desc" } },
};

export const Empty: Story = {
  args: { rows: [], filterable: true },
};

export const Loading: Story = {
  args: { loading: true },
};
