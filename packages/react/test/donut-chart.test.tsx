import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneDonutChart } from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const SEGMENTS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 0 },
  { key: "edge", label: "Edge", value: 125 },
];

describe("SoneDonutChart", () => {
  it("renders the ring, the centre, the legend and the hidden table like Angular", () => {
    const out = html(
      <SoneDonutChart segments={SEGMENTS} ariaLabel="Browsers" />,
    );
    expect(out).toContain(
      '<sone-donut-chart data-slot="donut-chart"><div class="donut-chart-figure" data-slot="donut-chart-figure" style="width:200px">',
    );
    expect(out).toContain(
      '<svg class="donut-chart-svg" viewBox="0 0 100 100" role="group" aria-label="Browsers">',
    );
    expect(out).toMatch(
      /<path class="donut-chart-segment" data-slot="donut-chart-segment" role="img" aria-label="Chrome: 275 \(46%\)" tabindex="0" d="M[^"]+" style="--_color:var\(--chart-1\)"><\/path>/,
    );
    expect(out.match(/class="donut-chart-segment"/g)).toHaveLength(3);
    expect(out).toContain(
      '<span class="donut-chart-value">600</span><span class="donut-chart-label">Total</span>',
    );
    expect(out).toContain(
      '<tr><th scope="row">Firefox</th><td>0</td><td>0%</td></tr>',
    );
  });

  it("writes the focused segment in the centre and moves around the ring", () => {
    const { container } = render(
      <SoneDonutChart segments={SEGMENTS} label="Visitors" />,
    );
    const segs = () =>
      container.querySelectorAll<SVGPathElement>(
        '[data-slot="donut-chart-segment"]',
      );
    const text = (sel: string) => container.querySelector(sel)!.textContent;
    expect(text(".donut-chart-label")).toBe("Visitors");
    fireEvent.focus(segs()[0]);
    expect(text(".donut-chart-value")).toBe("275");
    expect(segs()[1].getAttribute("data-dimmed")).toBe("");
    fireEvent.keyDown(segs()[0], { key: "ArrowUp" });
    expect(segs()[2].getAttribute("tabindex")).toBe("0");
    expect(text(".donut-chart-label")).toBe("Edge");
    fireEvent.keyDown(segs()[2], { key: "Escape" });
    expect(text(".donut-chart-value")).toBe("600");
  });
});
