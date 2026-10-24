import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneCalendarComponent,
  type SoneCalendarValue,
} from "@surface-one/angular/calendar";
import {
  SoneComboboxComponent,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "@surface-one/angular/combobox";
import {
  SoneTableColumnComponent,
  SoneTableComponent,
} from "@surface-one/angular/table";

import { $, $$, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

const FRAMEWORKS: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix", disabled: true },
  { value: "astro", label: "Astro" },
];

@Component({
  imports: [SoneComboboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-combobox
      inputId="fw"
      ariaLabel="Framework"
      [options]="frameworks"
      [(value)]="framework"
      clearable
    />
    <sone-combobox
      inputId="many"
      ariaLabel="Frameworks"
      [options]="frameworks"
      [(value)]="many"
      multiple
    />
  `,
})
class ComboboxHost {
  readonly frameworks = FRAMEWORKS;
  readonly framework = signal<SoneComboboxValue>(null);
  readonly many = signal<SoneComboboxValue>(["next", "astro"]);
}

@Component({
  imports: [SoneCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-calendar
      id="single"
      [(value)]="date"
      [(month)]="month"
      today="2026-06-15"
      ariaLabel="Delivery date"
    />
    <sone-calendar
      id="range"
      mode="range"
      [(value)]="stay"
      month="2026-06"
      today="2026-06-15"
      ariaLabel="Stay"
    />
  `,
})
class CalendarHost {
  readonly date = signal<SoneCalendarValue>("2026-06-12");
  readonly month = signal<string | null>(null);
  readonly stay = signal<SoneCalendarValue>(null);
}

interface Row {
  readonly id: string;
  readonly title: string;
  readonly folder: string;
}

const ROWS: Row[] = [
  { id: "a", title: "Q4 planning", folder: "Product" },
  { id: "b", title: "Hiring debrief", folder: "People" },
];

@Component({
  imports: [SoneTableComponent, SoneTableColumnComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #folderCell let-row let-index="index">
      <span class="folder">{{ index }}:{{ row.folder }}</span>
    </ng-template>
    <sone-table
      id="data"
      [rows]="rows()"
      [trackBy]="byId"
      caption="Notes"
      [isSelected]="isSelected"
      emptyText="No notes."
      [columns]="[
        { key: 'title', header: 'Title' },
        { key: 'folder', header: 'Folder', width: '140px', cell: folderCell },
        { key: 'actions', header: 'Actions', hideHeader: true, alignEnd: true },
      ]"
    />
    <sone-table
      id="children"
      [rows]="rows()"
      [trackBy]="byId"
      [columns]="[{ key: 'folder', header: 'Ignored' }]"
    >
      <sone-table-column key="title" header="Name">
        <ng-template let-row
          ><b>{{ row.title }}</b></ng-template
        >
      </sone-table-column>
    </sone-table>
  `,
})
class TableHost {
  readonly rows = signal<Row[]>(ROWS);
  readonly byId = (row: Row) => row.id;
  readonly isSelected = (row: Row) => row.id === "b";
}

describe("sone-combobox", () => {
  it("is a WAI-ARIA combobox: opens, filters, highlights and picks with the keyboard", async () => {
    const fixture = await render(ComboboxHost);
    const input = $<HTMLInputElement>("#fw");
    expect(input.getAttribute("role")).toBe("combobox");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    input.focus();
    key(input, "ArrowDown");
    await settle(fixture);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    const listbox = $("[role=listbox]");
    expect(input.getAttribute("aria-controls")).toBe(listbox.id);
    expect(
      $$("[role=option]", listbox).map((o) => o.textContent?.trim()),
    ).toEqual(["Next.js", "Nuxt.js", "Remix", "Astro"]);

    input.value = "nu";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await settle(fixture);
    const options = $$("[role=option]");
    expect(options.map((o) => o.textContent?.trim())).toEqual(["Nuxt.js"]);
    key(input, "ArrowDown");
    await settle(fixture);
    expect(input.getAttribute("aria-activedescendant")).toBe(options[0]!.id);
    key(input, "Enter");
    await settle(fixture);
    expect(fixture.componentInstance.framework()).toBe("nuxt");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.value).toBe("Nuxt.js");
  });

  it("refuses a disabled option, clears, and removes chips in multiple mode", async () => {
    const fixture = await render(ComboboxHost);
    const input = $<HTMLInputElement>("#fw");
    input.click();
    await settle(fixture);
    const remix = $$("[role=option]").find((o) =>
      o.textContent?.includes("Remix"),
    )!;
    expect(remix.getAttribute("aria-disabled")).toBe("true");
    remix.click();
    await settle(fixture);
    expect(fixture.componentInstance.framework()).toBeNull();
    $$("[role=option]")
      .find((o) => o.textContent?.includes("Astro"))!
      .click();
    await settle(fixture);
    expect(fixture.componentInstance.framework()).toBe("astro");
    $<HTMLButtonElement>("[data-slot=combobox-clear]").click();
    await settle(fixture);
    expect(fixture.componentInstance.framework()).toBeNull();

    const many = $<HTMLInputElement>("#many");
    const chips = () =>
      $$("[data-slot=combobox-chip]").map((c) => c.textContent?.trim());
    expect(chips()).toEqual(["Next.js", "Astro"]);
    many.focus();
    key(many, "Backspace");
    await settle(fixture);
    expect(fixture.componentInstance.many()).toEqual(["next"]);
    expect(chips()).toEqual(["Next.js"]);
  });
});

describe("sone-calendar", () => {
  it("is a grid with one Tab stop; a click picks the day", async () => {
    const fixture = await render(CalendarHost);
    const cal = $("#single");
    const grid = $("[role=grid]", cal);
    expect(grid.getAttribute("aria-label")).toBe("Delivery date");
    const day = (iso: string) =>
      $<HTMLButtonElement>(`[data-iso="${iso}"]`, cal);
    expect(day("2026-06-12").getAttribute("tabindex")).toBe("0");
    expect(day("2026-06-12").closest("td")!.getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(day("2026-06-15").getAttribute("aria-current")).toBe("date");
    expect($$("[data-slot=calendar-day][tabindex='0']", cal)).toHaveLength(1);

    day("2026-06-20").click();
    await settle(fixture);
    expect(fixture.componentInstance.date()).toBe("2026-06-20");
    expect(day("2026-06-20").getAttribute("tabindex")).toBe("0");
  });

  it("moves with the arrow keys, picks the focused day and pages to the next month", async () => {
    const fixture = await render(CalendarHost);
    const cal = $("#single");
    const start = $<HTMLButtonElement>('[data-iso="2026-06-12"]', cal);
    start.focus();
    key(start, "ArrowRight");
    await settle(fixture);
    expect((document.activeElement as HTMLElement).dataset["iso"]).toBe(
      "2026-06-13",
    );
    key(document.activeElement!, "ArrowDown");
    await settle(fixture);
    expect((document.activeElement as HTMLElement).dataset["iso"]).toBe(
      "2026-06-20",
    );
    // The days are native buttons: Enter / Space click them.
    (document.activeElement as HTMLButtonElement).click();
    await settle(fixture);
    expect(fixture.componentInstance.date()).toBe("2026-06-20");
    key(document.activeElement!, "PageDown");
    await settle(fixture);
    expect(fixture.componentInstance.month()).toBe("2026-07");
    expect((document.activeElement as HTMLElement).dataset["iso"]).toBe(
      "2026-07-20",
    );
  });

  it("closes a range with the second pick", async () => {
    const fixture = await render(CalendarHost);
    const cal = $("#range");
    $<HTMLButtonElement>('[data-iso="2026-06-08"]', cal).click();
    await settle(fixture);
    $<HTMLButtonElement>('[data-iso="2026-06-12"]', cal).click();
    await settle(fixture);
    expect(fixture.componentInstance.stay()).toEqual({
      start: "2026-06-08",
      end: "2026-06-12",
    });
    expect($("[role=grid]", cal).getAttribute("aria-multiselectable")).toBe(
      "true",
    );
  });
});

describe("sone-table", () => {
  it("renders the columns input: headers, templates, text cells and selection", async () => {
    await render(TableHost);
    const table = $("#data");
    expect($("caption", table).textContent?.trim()).toBe("Notes");
    const heads = $$("th", table);
    expect(heads.map((h) => h.getAttribute("scope"))).toEqual([
      "col",
      "col",
      "col",
    ]);
    expect(heads[0]!.textContent?.trim()).toBe("Title");
    expect(heads[1]!.style.width).toBe("140px");
    expect($(".sr-only", heads[2]!).textContent).toBe("Actions");
    expect(heads[2]!.classList.contains("is-end")).toBe(true);

    const rows = $$("tbody tr", table);
    expect(rows).toHaveLength(2);
    const cells = $$("td", rows[0]!);
    expect(cells[0]!.textContent?.trim()).toBe("Q4 planning");
    expect($(".folder", cells[1]!).textContent).toBe("0:Product");
    expect(cells[2]!.textContent?.trim()).toBe("");
    expect(rows[1]!.getAttribute("data-state")).toBe("selected");
    expect(rows[0]!.hasAttribute("data-state")).toBe(false);
  });

  it("children win over the columns input; an empty table shows emptyText", async () => {
    const fixture = await render(TableHost);
    const children = $("#children");
    expect($$("th", children).map((h) => h.textContent?.trim())).toEqual([
      "Name",
    ]);
    expect($("tbody tr td b", children).textContent).toBe("Q4 planning");

    fixture.componentInstance.rows.set([]);
    await settle(fixture);
    const empty = $("#data tbody tr");
    expect(empty.classList.contains("sone-table-empty")).toBe(true);
    expect($("td", empty).getAttribute("colspan")).toBe("3");
    expect(empty.textContent?.trim()).toBe("No notes.");
  });
});
