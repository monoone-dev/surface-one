import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneDataTableComponent,
  type SoneDataTableColumn,
  type SoneDataTableKey,
  type SoneDataTableSort,
} from "@surface-one/angular/data-table";

import { $, $$, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

interface Payment {
  readonly id: string;
  readonly email: string;
  readonly amount: number;
}

const ROWS: Payment[] = [
  { id: "a", email: "ken@example.com", amount: 316 },
  { id: "b", email: "abe@example.com", amount: 242 },
  { id: "c", email: "monserrat@example.com", amount: 837 },
  { id: "d", email: "silas@example.com", amount: 874 },
  { id: "e", email: "carmella@example.com", amount: 721 },
];

const COLUMNS: SoneDataTableColumn<Payment>[] = [
  { key: "email", header: "Email", sortable: true },
  { key: "amount", header: "Amount", sortable: true, alignEnd: true },
];

@Component({
  imports: [SoneDataTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-data-table
      [rows]="rows()"
      [columns]="columns"
      [rowKey]="byId"
      [pageSize]="2"
      [(sort)]="sort"
      [(page)]="page"
      [(filter)]="filter"
      [(selected)]="selected"
      [(hiddenColumns)]="hidden"
      [loading]="loading()"
      [rowLabel]="label"
      filterable
      selectable
      columnToggle
    />
  `,
})
class DataTableHost {
  readonly rows = signal<Payment[]>(ROWS);
  readonly columns = COLUMNS;
  readonly byId = (p: Payment): string => p.id;
  readonly label = (p: Payment): string => p.email;
  readonly sort = signal<SoneDataTableSort | null>(null);
  readonly page = signal(1);
  readonly filter = signal("");
  readonly selected = signal<readonly SoneDataTableKey[]>([]);
  readonly hidden = signal<readonly string[]>([]);
  readonly loading = signal(false);
}

const bodyText = (): string[] =>
  $$("tbody tr").map((tr) =>
    $$("td", tr)
      .map((td) => td.textContent!.trim())
      .filter(Boolean)
      .join(" | "),
  );

describe("sone-data-table", () => {
  it("sorts from the header: ascending, descending, then unsorted, with aria-sort", async () => {
    const fixture = await render(DataTableHost);
    const host = fixture.componentInstance;
    expect(bodyText()).toEqual([
      "ken@example.com | 316",
      "abe@example.com | 242",
    ]);
    const amount = () =>
      $$<HTMLButtonElement>('[data-slot="data-table-sort"]')[1];
    const amountHead = () => $$("thead th")[2];
    expect(amountHead().hasAttribute("aria-sort")).toBe(false);

    amount().click();
    await settle(fixture);
    expect(host.sort()).toEqual({ key: "amount", direction: "asc" });
    expect(amountHead().getAttribute("aria-sort")).toBe("ascending");
    expect(bodyText()).toEqual([
      "abe@example.com | 242",
      "ken@example.com | 316",
    ]);

    amount().click();
    await settle(fixture);
    expect(amountHead().getAttribute("aria-sort")).toBe("descending");
    expect(bodyText()[0]).toBe("silas@example.com | 874");

    amount().click();
    await settle(fixture);
    expect(host.sort()).toBeNull();
    expect(amountHead().hasAttribute("aria-sort")).toBe(false);
  });

  it("pages through sone-pagination and filters back to page 1", async () => {
    const fixture = await render(DataTableHost);
    const host = fixture.componentInstance;
    expect($$('[data-slot="pagination-link"]')).toHaveLength(3);
    $<HTMLButtonElement>('[data-slot="pagination-next"]').click();
    await settle(fixture);
    expect(host.page()).toBe(2);
    expect(bodyText()[0]).toBe("monserrat@example.com | 837");

    host.filter.set("");
    const input = $<HTMLInputElement>(".data-table-filter input");
    input.value = "SILAS";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(fixture);
    expect(host.filter()).toBe("SILAS");
    expect(host.page()).toBe(1);
    expect(bodyText()).toEqual(["silas@example.com | 874"]);

    input.value = "nobody";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(fixture);
    expect(bodyText()).toEqual(["No results."]);
  });

  it("selects rows and the page with the select-all checkbox (mixed in between)", async () => {
    const fixture = await render(DataTableHost);
    const host = fixture.componentInstance;
    const all = () => $<HTMLInputElement>('thead input[data-slot="checkbox"]');
    const boxes = () =>
      $$<HTMLInputElement>('tbody input[data-slot="checkbox"]');
    expect(all().getAttribute("aria-label")).toBe("Select all");
    expect(boxes()[0].getAttribute("aria-label")).toBe(
      "Select ken@example.com",
    );

    boxes()[0].click();
    await settle(fixture);
    expect(host.selected()).toEqual(["a"]);
    expect(all().indeterminate).toBe(true);
    expect($$("tbody tr")[0].getAttribute("data-state")).toBe("selected");
    expect($('[data-slot="data-table-count"]').textContent!.trim()).toBe(
      "1 of 5 row(s) selected.",
    );

    all().click();
    await settle(fixture);
    expect(host.selected()).toEqual(["a", "b"]);
    expect(all().checked).toBe(true);
    expect(all().indeterminate).toBe(false);

    all().click();
    await settle(fixture);
    expect(host.selected()).toEqual([]);
  });

  it("hides columns from the column menu", async () => {
    const fixture = await render(DataTableHost);
    const host = fixture.componentInstance;
    $<HTMLButtonElement>('[data-slot="data-table-columns"]').click();
    await settle(fixture);
    const items = $$<HTMLButtonElement>('[role="menuitemcheckbox"]');
    expect(items.map((i) => i.textContent!.trim())).toEqual([
      "Email",
      "Amount",
    ]);
    expect(items[1].getAttribute("aria-checked")).toBe("true");
    items[1].click();
    await settle(fixture);
    expect(host.hidden()).toEqual(["amount"]);
    expect($$("thead th")).toHaveLength(2);
  });

  it("is busy while loading", async () => {
    const fixture = await render(DataTableHost);
    const host = fixture.componentInstance;
    host.loading.set(true);
    await settle(fixture);
    expect($('[data-slot="data-table-body"]').getAttribute("aria-busy")).toBe(
      "true",
    );
    expect($('[data-slot="data-table-loading"] [role="status"]')).toBeTruthy();
    host.rows.set([]);
    await settle(fixture);
    expect(bodyText()).toEqual(["Loading"]);
  });
});
