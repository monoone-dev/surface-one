import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneLineChart } from "../src/components/line-chart";

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: null },
];
const SERIES = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile", tone: "chart-4" },
];

describe("SoneLineChart", () => {
  it("draws a path per series and names every x value", () => {
    const { container } = render(
      <SoneLineChart
        data={DATA}
        series={SERIES}
        xKey="month"
        aria-label="Visitors"
      />,
    );
    expect(screen.getByRole("group", { name: "Visitors" })).toBeTruthy();
    const d = [...container.querySelectorAll("path")].map((p) =>
      p.getAttribute("d"),
    );
    expect(d).toEqual(["M0 53.5L50 23.75L100 40.75", "M0 80L50 50"]);
    expect(
      screen.getByRole("img", { name: "Mar: Desktop 237, Mobile –" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(3);
    expect(screen.getByText("Desktop")).toBeTruthy();
    expect(screen.getByText("400")).toBeTruthy();
  });

  it("shows the tooltip of a pressed x value", () => {
    render(<SoneLineChart data={DATA} series={SERIES} xKey="month" />);
    const feb = screen.getByRole("img", {
      name: "Feb: Desktop 305, Mobile 200",
    });
    fireEvent.click(feb);
    expect(feb.getAttribute("aria-selected")).toBe("true");
    expect(screen.getAllByText("305").length).toBeGreaterThan(0);
    fireEvent.click(feb);
    expect(screen.queryAllByText("305")).toHaveLength(0);
  });

  it("fills stacked areas", () => {
    const { container } = render(
      <SoneLineChart
        data={DATA}
        series={SERIES}
        xKey="month"
        area
        stacked
        legend={false}
      />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(4);
    expect(screen.queryByText("Desktop")).toBeNull();
  });
});
