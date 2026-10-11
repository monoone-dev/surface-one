import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneMessagesProvider } from "../src/context/messages";
import { SoneBarList } from "../src/components/bar-list";
import { SoneChartLegend, SoneSwatch } from "../src/components/chart-legend";
import { SoneMeter } from "../src/components/meter";
import { SoneProgress } from "../src/components/progress";
import { SoneSparkline } from "../src/components/sparkline";
import { SoneStackedBar } from "../src/components/stacked-bar";
import {
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
} from "../src/components/stat";
import { SoneStepper } from "../src/components/stepper";
import { SoneTable, type SoneTableColumn } from "../src/components/table";

const body = (path: string): string =>
  readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")
    .split("\n")
    .slice(2)
    .join("\n");

describe("chart maths", () => {
  it("keeps the React copy identical to packages/angular/chart-utils/scale.ts", () => {
    expect(body("../src/utils/scale.ts")).toBe(
      body("../../angular/chart-utils/scale.ts"),
    );
  });
});

describe("SoneProgress", () => {
  it("drives the fill by a transform variable, not its width", () => {
    render(<SoneProgress value={40} aria-label="Load" />);
    const bar = screen.getByRole("progressbar", { name: "Load" });
    const style = bar.querySelector(".fill")!.getAttribute("style") ?? "";
    expect(style).toContain("--_progress-pct: 40");
    expect(style).not.toContain("width");
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuetext")).toBe("40%");
    expect(bar.dataset["state"]).toBe("loading");
  });

  it("clamps into 0..max and reports completion", () => {
    render(<SoneProgress value={250} max={200} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.querySelector(".fill")!.getAttribute("style")).toContain(
      "--_progress-pct: 100",
    );
    expect(bar.dataset["state"]).toBe("complete");
  });

  it("is indeterminate without a value and carries no aria-valuenow", () => {
    render(<SoneProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar.querySelector(".fill--indeterminate")).not.toBeNull();
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.dataset["state"]).toBe("indeterminate");
  });
});

describe("SoneMeter", () => {
  it("draws pips and speaks a sentence", () => {
    const { container } = render(
      <SoneMeter label="Accuracy" value={3} max={4} detail="Good" />,
    );
    const host = container.querySelector("sone-meter")!;
    expect(host.getAttribute("role")).toBe("img");
    expect(host.getAttribute("aria-label")).toBe("Accuracy: 3 of 4. Good");
    const pips = host.querySelectorAll("[data-slot=meter-indicator]");
    expect(pips).toHaveLength(4);
    expect([...pips].map((p) => p.getAttribute("data-state"))).toEqual([
      "on",
      "on",
      "on",
      "off",
    ]);
    expect(pips[0]!.className).toBe("meter-pip is-on");
    expect(pips[3]!.className).toBe("meter-pip");
  });

  it("caps the pips at 10 and translates the count", () => {
    const { container } = render(
      <SoneMessagesProvider messages={{ meterCount: (f, m) => `${f} z ${m}` }}>
        <SoneMeter value={20} max={50} />
      </SoneMessagesProvider>,
    );
    const host = container.querySelector("sone-meter")!;
    expect(host.querySelectorAll(".meter-pip")).toHaveLength(10);
    expect(host.getAttribute("aria-label")).toBe("10 z 10");
    expect(host.querySelector(".meter-label")).toBeNull();
  });
});

const ITEMS = [
  { key: "a", label: "Alpha", value: 30 },
  { key: "b", label: "Beta", value: 10, tone: "success" as const },
  { key: "c", label: "Gamma", value: 0, valueLabel: "none", title: "Gamma!" },
];

describe("SoneBarList", () => {
  it("renders a labelled list scaled to the largest value", () => {
    const { container } = render(
      <SoneBarList items={ITEMS} aria-label="By model" />,
    );
    expect(container.querySelector("ul")!.getAttribute("aria-label")).toBe(
      "By model",
    );
    const rows = [...container.querySelectorAll("li")];
    expect(rows.map((r) => r.getAttribute("style"))).toEqual([
      "--_color: var(--accent);",
      "--_color: var(--success);",
      "--_color: var(--accent);",
    ]);
    expect(
      rows.map((r) => r.querySelector(".bar-list-value")!.textContent),
    ).toEqual(["30", "10", "none"]);
    const fills = container.querySelectorAll(".bar-list-fill");
    // A zero row draws no fill at all, not a minimum-width sliver.
    expect(fills).toHaveLength(2);
    expect(fills[0]!.getAttribute("style")).toContain("width: 100%");
    expect(fills[1]!.getAttribute("style")).toContain("width: 33.3");
    expect(
      rows[2]!.querySelector(".bar-list-label")!.getAttribute("title"),
    ).toBe("Gamma!");
    expect(
      container.querySelector(".bar-list-track")!.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("scales to the total or a fixed max and formats values", () => {
    const total = render(
      <SoneBarList items={ITEMS} scale="total" valueFormat={(n) => `${n} t`} />,
    );
    expect(
      total.container.querySelector(".bar-list-fill")!.getAttribute("style"),
    ).toContain("width: 75%");
    expect(total.container.querySelector(".bar-list-value")!.textContent).toBe(
      "30 t",
    );
    const fixed = render(<SoneBarList items={ITEMS} max={60} />);
    expect(
      fixed.container.querySelector(".bar-list-fill")!.getAttribute("style"),
    ).toContain("width: 50%");
  });

  it("renders renderLabel in place of the text", () => {
    const { container } = render(
      <SoneBarList
        items={ITEMS}
        renderLabel={(item) => (
          <b className="custom">{item.label.toUpperCase()}</b>
        )}
      />,
    );
    expect(
      [...container.querySelectorAll(".custom")].map((b) => b.textContent),
    ).toEqual(["ALPHA", "BETA", "GAMMA"]);
  });
});

describe("SoneSparkline", () => {
  it("is decorative by default and draws one stretched svg with one path", () => {
    const { container } = render(<SoneSparkline values={[0, 2, 4]} />);
    const host = container.querySelector("sone-sparkline")!;
    expect(host.getAttribute("aria-hidden")).toBe("true");
    expect(host.hasAttribute("role")).toBe(false);
    expect(host.getAttribute("style")).toBe("--_color: var(--accent);");
    expect(
      container.querySelector("svg")!.getAttribute("preserveAspectRatio"),
    ).toBe("none");
    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    // max defaults to niceCeiling(values, 4) = 5, so 4 sits at 80 %.
    expect(paths[0]!.getAttribute("d")).toBe("M0 100L50 60L100 20");
    expect(paths[0]!.getAttribute("vector-effect")).toBe("non-scaling-stroke");
    expect(container.innerHTML).not.toMatch(/<defs|\sid=/);
  });

  it("draws an area under the line, bars as one path and heat as cells", () => {
    const area = render(<SoneSparkline values={[1, 3]} type="area" />);
    expect(
      [...area.container.querySelectorAll("path")].map((p) =>
        p.getAttribute("class"),
      ),
    ).toEqual(["sparkline-area", "sparkline-line"]);
    const bar = render(<SoneSparkline values={[1, 3]} type="bar" />);
    expect(bar.container.querySelectorAll("path")).toHaveLength(1);
    const heat = render(
      <SoneSparkline values={[0, 1, 5]} type="heat" max={5} />,
    );
    expect(
      [...heat.container.querySelectorAll("rect")].map((r) =>
        r.getAttribute("data-level"),
      ),
    ).toEqual(["0", "1", "5"]);
  });

  it("becomes a named image when not decorative", () => {
    render(<SoneSparkline values={[1, 4, 2]} decorative={false} />);
    const host = screen.getByRole("img");
    expect(host.hasAttribute("aria-hidden")).toBe(false);
    expect(host.getAttribute("aria-label")).toBe("3 values, peak 4, total 7");
    const own = render(
      <SoneSparkline values={[1]} decorative={false} summary="Busy week" />,
    );
    expect(
      own.container.querySelector("sone-sparkline")!.getAttribute("aria-label"),
    ).toBe("Busy week");
    const pl = render(
      <SoneMessagesProvider
        messages={{
          sparklineSummary: (n, peak, total) =>
            `${n} wartości, szczyt ${peak}, razem ${total}`,
        }}
      >
        <SoneSparkline values={[1, 4]} decorative={false} />
      </SoneMessagesProvider>,
    );
    expect(
      pl.container.querySelector("sone-sparkline")!.getAttribute("aria-label"),
    ).toBe("2 wartości, szczyt 4, razem 5");
  });
});

describe("SoneStat", () => {
  it("renders a dl with dt before dd and the group's columns", () => {
    const { container } = render(
      <SoneStatGroup columns={3} separated>
        <SoneStat variant="inset" labelPosition="bottom">
          <SoneStatLabel>Meetings</SoneStatLabel>
          <SoneStatValue>128</SoneStatValue>
        </SoneStat>
      </SoneStatGroup>,
    );
    const dl = container.querySelector("dl")!;
    expect(dl.dataset["slot"]).toBe("stat-group");
    expect(dl.dataset["columns"]).toBe("3");
    expect(dl.dataset["separated"]).toBe("");
    expect(dl.getAttribute("style")).toContain("--stat-columns: 3");
    const stat = container.querySelector<HTMLElement>('[data-slot="stat"]')!;
    expect(stat.dataset["variant"]).toBe("inset");
    expect(stat.dataset["labelPosition"]).toBe("bottom");
    expect(stat.children[0]!.tagName).toBe("DT");
    expect(stat.children[1]!.tagName).toBe("DD");
  });

  it("keeps the group's columns when a style is passed", () => {
    const { container } = render(
      <SoneStatGroup columns={2} style={{ maxWidth: "10rem" }} />,
    );
    const style = container.querySelector("dl")!.getAttribute("style")!;
    expect(style).toContain("--stat-columns: 2");
    expect(style).toContain("max-width: 10rem");
  });

  it("aligns to the centre only when asked", () => {
    const { container } = render(
      <>
        <SoneStat align="center" />
        <SoneStat />
      </>,
    );
    const [a, b] = container.querySelectorAll<HTMLElement>("[data-slot=stat]");
    expect(a!.dataset["align"]).toBe("center");
    expect(b!.hasAttribute("data-align")).toBe(false);
    expect(b!.dataset["variant"]).toBe("card");
    expect(b!.dataset["size"]).toBe("md");
  });

  it("speaks the trend's direction and colours it by sign", () => {
    const up = render(<SoneStatTrend delta={0.12}>12%</SoneStatTrend>);
    const dd = up.container.querySelector("dd")!;
    expect(dd.dataset["tone"]).toBe("positive");
    expect(dd.dataset["direction"]).toBe("up");
    expect(dd.querySelector(".sr-only")!.textContent).toBe("up ");
    expect(dd.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true");
    expect(dd.textContent).toContain("12%");

    const down = render(<SoneStatTrend delta={-3} tone="neutral" />);
    const ddDown = down.container.querySelector("dd")!;
    expect(ddDown.dataset["tone"]).toBe("neutral");
    expect(ddDown.dataset["direction"]).toBe("down");

    const none = render(<SoneStatTrend delta={null} />);
    const ddNone = none.container.querySelector("dd")!;
    expect(ddNone.querySelector("svg")).toBeNull();
    expect(ddNone.dataset["tone"]).toBe("neutral");
  });
});

describe("SoneChartLegend", () => {
  const items = [
    { key: "a", label: "Alpha", tone: "graph-note", value: 1234.5 },
    { key: "b", label: "Beta", value: "4 GB" },
  ];

  it("renders swatches, labels and formatted values", () => {
    const { container } = render(<SoneChartLegend items={items} locale="de" />);
    const swatches = container.querySelectorAll('[data-slot="chart-swatch"]');
    expect(swatches[0]!.getAttribute("style")).toContain(
      "--swatch-color: var(--graph-note)",
    );
    // A missing tone falls back to the series' position.
    expect(swatches[1]!.getAttribute("style")).toContain("var(--chart-2)");
    expect(swatches[0]!.getAttribute("aria-hidden")).toBe("true");
    expect(container.textContent).toContain("1.234,5");
    expect(container.querySelector("button")).toBeNull();
  });

  it("toggles a series with aria-pressed and onHiddenChange (controlled)", () => {
    const onHiddenChange = vi.fn();
    const onToggle = vi.fn();
    function Legend() {
      const [hidden, setHidden] = useState<readonly string[]>(["b"]);
      return (
        <SoneChartLegend
          items={items}
          toggleable
          hidden={hidden}
          onHiddenChange={(next) => {
            onHiddenChange(next);
            setHidden(next);
          }}
          onToggle={onToggle}
        />
      );
    }
    render(<Legend />);
    const [a, b] = screen.getAllByRole("button");
    expect(a!.getAttribute("aria-pressed")).toBe("true");
    expect(b!.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(a!);
    expect(onHiddenChange).toHaveBeenCalledWith(["b", "a"]);
    expect(onToggle).toHaveBeenCalledWith("a");
    expect(a!.getAttribute("aria-pressed")).toBe("false");
  });

  it("keeps its own hidden keys when uncontrolled", () => {
    render(<SoneChartLegend items={items} toggleable defaultHidden={[]} />);
    const [a] = screen.getAllByRole("button");
    fireEvent.click(a!);
    expect(a!.getAttribute("aria-pressed")).toBe("false");
    expect(a!.closest("li")!.hasAttribute("data-hidden")).toBe(true);
    fireEvent.click(a!);
    expect(a!.getAttribute("aria-pressed")).toBe("true");
  });

  it("passes any CSS colour through a swatch", () => {
    const { container } = render(
      <SoneSwatch tone="color-mix(in oklch, red 50%, blue)" shape="line" />,
    );
    const swatch = container.querySelector("span")!;
    expect(swatch.dataset["shape"]).toBe("line");
    expect(swatch.getAttribute("style")).toContain(
      "color-mix(in oklch, red 50%, blue)",
    );
  });
});

describe("SoneStackedBar", () => {
  const segments = [
    { key: "a", label: "Playback", value: 40 },
    { key: "b", label: "Masters", value: 20, tone: "chart-5" },
    { key: "c", label: "Empty", value: 0 },
  ];
  const track = (c: HTMLElement) =>
    c.querySelector('[data-slot="stacked-bar-track"]')!;

  it("lays the parts out by cumulative end and leaves the rest as track", () => {
    const { container } = render(
      <SoneStackedBar segments={segments} max={100} aria-label="Storage" />,
    );
    const parts = container.querySelectorAll(
      '[data-slot="stacked-bar-segment"]',
    );
    expect(parts).toHaveLength(2);
    expect(parts[0]!.getAttribute("style")).toContain("--_end: 40");
    expect(parts[1]!.getAttribute("style")).toContain("--_end: 60");
    expect(parts[1]!.getAttribute("style")).toContain("var(--chart-5)");
    expect(parts[0]!.classList.contains("has-gap")).toBe(true);
    expect(parts[1]!.classList.contains("has-gap")).toBe(false);
    expect(track(container).getAttribute("aria-label")).toBe(
      "Storage: Playback 40 (40%), Masters 20 (20%); 60 of 100",
    );
    // The name goes to the summary, not the host.
    expect(
      container.querySelector("sone-stacked-bar")!.hasAttribute("aria-label"),
    ).toBe(false);
  });

  it("fills the bar without max and shows a legend", () => {
    const { container } = render(
      <SoneStackedBar
        segments={segments}
        showLegend
        valueLabel={(v) => `${v} GB`}
      />,
    );
    expect(track(container).getAttribute("aria-label")).toBe(
      "Playback 40 GB (67%), Masters 20 GB (33%); 60 GB in total",
    );
    expect(
      container.querySelectorAll('[data-slot="chart-legend-item"]'),
    ).toHaveLength(3);
    expect(container.querySelector("sone-chart-legend")!.className).toBe(
      "legend",
    );
  });

  it("says when there is nothing to show", () => {
    const { container } = render(<SoneStackedBar aria-label="Storage" />);
    expect(track(container).getAttribute("aria-label")).toBe(
      "Storage: No data",
    );
  });
});

interface Person {
  id: number;
  name: string;
  age: number | null;
}

describe("SoneTable", () => {
  const people: Person[] = [
    { id: 1, name: "Ada", age: 36 },
    { id: 2, name: "Alan", age: null },
  ];
  const columns: SoneTableColumn<Person>[] = [
    { key: "name", header: "Name", width: "10rem" },
    { key: "age", header: "Age", alignEnd: true },
    {
      key: "actions",
      header: "Actions",
      hideHeader: true,
      cell: (row, index) => (
        <button type="button">{`Edit ${row.name} #${index}`}</button>
      ),
    },
  ];

  it("renders headers, cells, render props and the selected row", () => {
    const { container } = render(
      <SoneTable
        rows={people}
        columns={columns}
        rowKey={(p) => p.id}
        rowClass={(p) => (p.age === null ? "is-muted" : undefined)}
        isSelected={(p) => p.id === 1}
        caption="People"
      />,
    );
    const host = container.querySelector("sone-table")!;
    expect(host.getAttribute("data-slot")).toBe("table-container");
    expect(container.querySelector("caption")!.textContent).toBe("People");
    const heads = container.querySelectorAll("th");
    expect(heads[0]!.getAttribute("style")).toBe("width: 10rem;");
    expect(heads[1]!.className).toBe("is-end");
    expect(heads[2]!.querySelector(".sr-only")!.textContent).toBe("Actions");
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0]!.getAttribute("data-state")).toBe("selected");
    expect(rows[1]!.hasAttribute("data-state")).toBe(false);
    expect(rows[1]!.className).toBe("is-muted");
    const cells = rows[1]!.querySelectorAll("td");
    expect(cells[0]!.textContent).toBe("Alan");
    expect(cells[1]!.textContent).toBe("");
    expect(cells[1]!.className).toBe("is-end");
    expect(screen.getByRole("button", { name: "Edit Alan #1" })).toBeTruthy();
  });

  it("shows the empty text across every column", () => {
    const { container } = render(
      <SoneTable rows={[]} columns={columns} emptyText="Nothing here" />,
    );
    const td = container.querySelector("tr.sone-table-empty td")!;
    expect(td.getAttribute("colspan")).toBe("3");
    expect(td.textContent).toBe("Nothing here");
    const none = render(<SoneTable rows={[]} columns={columns} />);
    expect(none.container.querySelectorAll("tbody tr")).toHaveLength(0);
  });
});

const STEPS = [
  { key: "a", label: "Account" },
  { key: "b", label: "Verify" },
  { key: "c", label: "Recovery" },
];

describe("SoneStepper", () => {
  it("marks the current step, counts and reports the clicked index", () => {
    function Stepper() {
      const [at, setAt] = useState(1);
      return (
        <>
          <SoneStepper
            steps={STEPS}
            current={at}
            variant="numbered"
            onCurrentChange={setAt}
          />
          <output>{at}</output>
        </>
      );
    }
    const { container } = render(<Stepper />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.getAttribute("aria-current"))).toEqual([
      null,
      "step",
      null,
    ]);
    expect(container.querySelector(".stepper-count")!.textContent).toBe(
      "Step 2 of 3",
    );
    expect(screen.getByRole("group").getAttribute("aria-label")).toBe(
      "Progress",
    );
    // A completed numbered step shows a check, the others their number.
    expect(buttons[0]!.querySelector(".stepper-indicator svg")).not.toBeNull();
    expect(buttons[2]!.querySelector(".stepper-indicator")!.textContent).toBe(
      "3",
    );
    expect(container.querySelectorAll(".stepper-separator")).toHaveLength(2);
    fireEvent.click(buttons[2]!);
    expect(container.querySelector("output")!.textContent).toBe("2");
    expect(buttons[2]!.getAttribute("aria-current")).toBe("step");
  });

  it("keeps a linear stepper from jumping ahead", () => {
    const onStepClick = vi.fn();
    render(<SoneStepper steps={STEPS} linear onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole("button") as HTMLButtonElement[];
    expect(buttons.map((b) => b.disabled)).toEqual([false, true, true]);
    fireEvent.click(buttons[1]!);
    expect(onStepClick).not.toHaveBeenCalled();
  });

  it("moves on its own when uncontrolled and reports the click", () => {
    const onStepClick = vi.fn();
    const { container } = render(
      <SoneStepper steps={STEPS} onStepClick={onStepClick} aria-label={null} />,
    );
    expect(
      container.querySelector("sone-stepper")!.hasAttribute("aria-label"),
    ).toBe(false);
    // Dots hide the text visually.
    expect(container.querySelector(".stepper-text.sr-only")).not.toBeNull();
    act(() => {
      fireEvent.click(screen.getAllByRole("button")[1]!);
    });
    expect(onStepClick).toHaveBeenCalledWith({ index: 1, step: STEPS[1] });
    expect(container.querySelector(".stepper-count")!.textContent).toBe(
      "Step 2 of 3",
    );
  });

  it("renders no buttons when disabled and translates the count", () => {
    const { container } = render(
      <SoneMessagesProvider
        messages={{ stepCount: (c, t) => `Krok ${c} z ${t}` }}
      >
        <SoneStepper steps={STEPS} current={0} disabled />
      </SoneMessagesProvider>,
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.querySelector(".stepper-count")!.textContent).toBe(
      "Krok 1 z 3",
    );
    expect(
      container.querySelector("sone-stepper")!.hasAttribute("data-interactive"),
    ).toBe(false);
  });
});

describe("server render", () => {
  it("renders the dataviz twins' markup", () => {
    const html = renderToString(
      <>
        <SoneProgress value={40} aria-label="Load" />
        <SoneMeter label="Speed" value={2} />
        <SoneSparkline values={[1, 2]} />
        <SoneBarList items={ITEMS} />
        <SoneChartLegend items={[{ key: "a", label: "A" }]} />
        <SoneStackedBar segments={[{ key: "a", label: "A", value: 1 }]} />
        <SoneStatGroup>
          <SoneStat>
            <SoneStatLabel>L</SoneStatLabel>
            <SoneStatValue>1</SoneStatValue>
            <SoneStatHint>H</SoneStatHint>
          </SoneStat>
        </SoneStatGroup>
        <SoneTable
          rows={[{ id: 1, name: "Ada" }]}
          columns={[{ key: "name", header: "Name" }]}
        />
        <SoneStepper steps={STEPS} />
      </>,
    );
    expect(html).toMatch(
      /<sone-progress role="progressbar" data-slot="progress" data-state="loading"/,
    );
    expect(html).toContain(
      '<div class="fill" style="--_progress-pct:40"></div>',
    );
    expect(html).toMatch(
      /<sone-meter role="img" data-slot="meter" aria-label="Speed: 2 of 4">/,
    );
    expect(html).toMatch(
      /<sone-sparkline data-slot="sparkline" data-type="line" aria-hidden="true" style="--_color:var\(--accent\)"><svg class="sparkline-svg"/,
    );
    expect(html).toContain(
      '<sone-bar-list data-slot="bar-list" data-scale="max"><ul class="bar-list">',
    );
    expect(html).toContain(
      '<sone-chart-legend data-slot="chart-legend" data-orientation="row">',
    );
    expect(html).toContain(
      '<sone-stacked-bar data-slot="stacked-bar" data-size="md">',
    );
    expect(html).toContain('<dl data-slot="stat-group" data-layout="grid">');
    expect(html).toContain('<dt data-slot="stat-label">L</dt>');
    expect(html).toContain('<td data-slot="table-cell">Ada</td>');
    expect(html).toMatch(
      /<sone-stepper role="group" data-slot="stepper" data-variant="dots" data-orientation="horizontal" data-interactive="" aria-label="Progress">/,
    );
  });
});
