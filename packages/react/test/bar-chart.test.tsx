import { act, fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneBarChart, type SoneBarChartDatum } from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const DATA: SoneBarChartDatum[] = [
  { key: "a", value: 2, label: "Mon" },
  { key: "b", value: 0, label: "Tue" },
  { key: "c", value: 4, label: "Wed" },
];

const TEN: SoneBarChartDatum[] = Array.from({ length: 10 }, (_, i) => ({
  key: String(i),
  value: i + 1,
}));

describe("SoneBarChart", () => {
  it("renders the bars, the axis and the hidden data table like Angular", () => {
    const out = html(
      <SoneBarChart
        data={DATA}
        ariaLabel="Meetings"
        tick={(d) => d.label ?? null}
      />,
    );
    expect(out).toContain(
      '<sone-bar-chart data-slot="bar-chart" data-zero="baseline" style="--_color:var(--accent)">',
    );
    expect(out).toContain(
      '<div class="bar-chart-plot" data-slot="bar-chart-plot" style="height:132px">',
    );
    expect(out).toContain(
      '<div class="bar-chart-bars" role="group" aria-label="Meetings">',
    );
    expect(out).toContain(
      '<div class="bar-chart-col" data-slot="bar-chart-bar" role="img" aria-label="Mon: 2" tabindex="-1"><span class="bar-chart-bar" style="height:40%"></span></div>',
    );
    expect(out).toContain(
      'aria-label="Tue: 0" tabindex="-1" data-empty=""><span class="bar-chart-bar bar-chart-bar--zero"></span>',
    );
    expect(out).toContain('aria-label="Wed: 4" tabindex="0"');
    expect(out).toContain(
      '<span class="bar-chart-tick"><span class="bar-chart-tick-text">Mon</span></span>',
    );
    expect(out).toContain(
      '<table class="sr-only"><caption>Meetings</caption><thead><tr><th scope="col">Category</th><th scope="col">Value</th></tr></thead>',
    );
    expect(out).toContain('<tr><th scope="row">Wed</th><td>4</td></tr>');
  });

  it("draws nothing for a zero with zero=gap and has no axis without tick", () => {
    const out = html(<SoneBarChart data={DATA} zero="gap" tone="chart-2" />);
    expect(out).toContain('data-zero="gap"');
    expect(out).toContain(
      'aria-label="Tue: 0" tabindex="-1" data-empty=""></div>',
    );
    expect(out).not.toContain("bar-chart-axis");
    expect(out).not.toContain("<caption>");
  });

  it("uses yMax, the tooltip and the value format", () => {
    const out = html(
      <SoneBarChart
        data={DATA}
        yMax={8}
        tooltip={(d) => `${d.label} · ${d.value} meetings`}
        valueFormat={(n) => `${n}x`}
        categoryHeader="Day"
        valueHeader="Meetings"
      />,
    );
    expect(out).toContain('aria-label="Mon · 2 meetings"');
    expect(out).toContain('style="height:25%"');
    expect(out).toContain("<td>2x</td>");
    expect(out).toContain(
      '<th scope="col">Day</th><th scope="col">Meetings</th>',
    );
  });

  it("moves the roving focus with the arrow keys, shows the tooltip and hides it on Escape", () => {
    const { container } = render(<SoneBarChart data={DATA} />);
    const cols = () => [...container.querySelectorAll(".bar-chart-col")];
    const group = container.querySelector(".bar-chart-bars")!;
    expect(cols()[2].getAttribute("tabindex")).toBe("0");
    act(() => (cols()[2] as HTMLElement).focus());
    const tip = () => container.querySelector(".bar-chart-tooltip");
    expect(tip()?.textContent).toBe("Wed: 4");
    expect(tip()?.getAttribute("data-align")).toBe("center");

    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(cols()[1].getAttribute("tabindex")).toBe("0");
    expect(cols()[2].getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(cols()[1]);
    expect(tip()?.textContent).toBe("Tue: 0");
    expect(cols()[1].getAttribute("data-shown")).toBe("");

    fireEvent.keyDown(group, { key: "Home" });
    expect(document.activeElement).toBe(cols()[0]);

    fireEvent.keyDown(group, { key: "Escape" });
    expect(tip()).toBeNull();

    act(() => (document.activeElement as HTMLElement).blur());
    expect(tip()).toBeNull();
  });

  it("shows the hovered bar's tooltip and hides it when the pointer leaves", () => {
    const { container } = render(<SoneBarChart data={DATA} />);
    fireEvent.pointerEnter(container.querySelector(".bar-chart-col")!);
    const tip = container.querySelector(".bar-chart-tooltip")!;
    expect(tip.textContent).toBe("Mon: 2");
    expect(tip.getAttribute("data-align")).toBe("center");
    expect(tip.getAttribute("style")).toContain("bottom: 40%");
    fireEvent.pointerLeave(container.querySelector(".bar-chart-plot")!);
    expect(container.querySelector(".bar-chart-tooltip")).toBeNull();
  });
});

describe("SoneBarChart tooltip placement", () => {
  it("anchors the tooltip to the start or end edge of the outer bars", () => {
    const { container } = render(<SoneBarChart data={TEN} />);
    const cols = container.querySelectorAll(".bar-chart-col");
    const tip = () => container.querySelector(".bar-chart-tooltip")!;
    fireEvent.pointerEnter(cols[0]);
    expect(tip().getAttribute("data-align")).toBe("start");
    expect(tip().getAttribute("style")).toContain("left: 0%");
    fireEvent.pointerEnter(cols[9]);
    expect(tip().getAttribute("data-align")).toBe("end");
    expect(tip().getAttribute("style")).toContain("left: 100%");
    fireEvent.pointerEnter(cols[4]);
    expect(tip().getAttribute("data-align")).toBe("center");
  });
});
