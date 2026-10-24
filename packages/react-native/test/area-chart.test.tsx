import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneAreaChart } from "../src/components/area-chart";

const DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
];
const SERIES = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

describe("SoneAreaChart", () => {
  it("draws a line and an area per series, without dots", () => {
    const { container } = render(
      <SoneAreaChart data={DATA} series={SERIES} xKey="month" stacked />,
    );
    expect(container.querySelectorAll("path")).toHaveLength(4);
    expect(container.querySelector("path")!.getAttribute("d")).toBe(
      "M0 69L100 49.17L100 100L0 100Z",
    );
    expect(
      screen.getByRole("img", { name: "Feb: Desktop 305, Mobile 200" }),
    ).toBeTruthy();
  });
});
