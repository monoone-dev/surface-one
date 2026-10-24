import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneDataTableComponent,
  type SoneDataTableColumn,
  type SoneDataTableKey,
} from "@surface-one/angular/data-table";

interface Payment {
  readonly id: string;
  readonly status: string;
  readonly email: string;
  readonly amount: number;
  readonly total: string;
}

const TEMPLATE = `<sone-data-table
  [rows]="payments"
  [columns]="columns"
  [rowKey]="byId"
  [rowLabel]="byEmail"
  [pageSize]="5"
  [(selected)]="selected"
  filterable
  selectable
  columnToggle
/>`;

export const code = TEMPLATE;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const payment = (
  id: string,
  status: string,
  email: string,
  amount: number,
): Payment => ({ id, status, email, amount, total: usd.format(amount) });

@Component({
  selector: "docs-data-table-demo",
  imports: [SoneDataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DataTableDemo {
  readonly payments: Payment[] = [
    payment("m5gr84i9", "Success", "ken99@example.com", 316),
    payment("3u1reuv4", "Success", "abe45@example.com", 242),
    payment("derv1ws0", "Processing", "monserrat44@example.com", 837),
    payment("5kma53ae", "Success", "silas22@example.com", 874),
    payment("bhqecj4p", "Failed", "carmella@example.com", 721),
    payment("p0r8x1kq", "Pending", "lena.k@example.com", 129),
    payment("w2n7c6ty", "Success", "omar@example.com", 560),
    payment("z9h3b5vd", "Processing", "ines@example.com", 95),
  ];

  readonly columns: SoneDataTableColumn<Payment>[] = [
    { key: "status", header: "Status", sortable: true },
    { key: "email", header: "Email", sortable: true },
    {
      key: "total",
      header: "Amount",
      sortable: true,
      alignEnd: true,
      width: "8rem",
      value: (p) => p.amount,
    },
  ];

  readonly selected = signal<readonly SoneDataTableKey[]>([]);
  readonly byId = (p: Payment): string => p.id;
  readonly byEmail = (p: Payment): string => p.email;
}
