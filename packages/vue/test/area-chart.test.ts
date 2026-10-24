import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneAreaChart } from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
];
const SERIES = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

describe("SoneAreaChart", () => {
  it("wraps a line chart with areas down to zero and no dots, like Angular", async () => {
    const out = await ssr(() =>
      h(SoneAreaChart, { data: DATA, series: SERIES, xKey: "month" }),
    );
    expect(out).toContain(
      '<sone-area-chart data-slot="area-chart"><sone-line-chart data-slot="line-chart" data-area>',
    );
    expect(out).toContain(
      '<path class="line-chart-area" d="M0 53.5L50 23.75L100 40.75L100 100L50 100L0 100Z" style="--_color:var(--chart-1);"></path>',
    );
    expect(out).not.toContain('class="line-chart-dot"');
  });

  it("stacks the series", async () => {
    const out = await ssr(() =>
      h(SoneAreaChart, {
        data: DATA,
        series: SERIES,
        xKey: "month",
        stacked: true,
      }),
    );
    expect(out).toContain(
      '<sone-area-chart data-slot="area-chart" data-stacked>',
    );
    expect(out).toMatch(/class="line-chart-area" d="[^"]+L0 69Z"/);
  });
});
