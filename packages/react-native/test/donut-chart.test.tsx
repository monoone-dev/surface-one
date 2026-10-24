import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SoneDonutChart } from "../src/components/donut-chart";

const SEGMENTS = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 0 },
  { key: "edge", label: "Edge", value: 125 },
];

describe("SoneDonutChart", () => {
  it("is one image named by every part, with the total in the centre", () => {
    const { container } = render(
      <SoneDonutChart segments={SEGMENTS} aria-label="Browsers" />,
    );
    expect(
      screen.getByRole("img", {
        name: "Browsers: Chrome: 275 (46%), Safari: 200 (33%), Edge: 125 (21%)",
      }),
    ).toBeTruthy();
    expect(container.querySelectorAll("path")).toHaveLength(3);
    expect(screen.getByText("600")).toBeTruthy();
    expect(screen.getByText("Total")).toBeTruthy();
    expect(screen.getByText("Firefox")).toBeTruthy();
  });

  it("writes a pressed segment in the centre", () => {
    const { container } = render(
      <SoneDonutChart segments={SEGMENTS} legend={false} label="Visitors" />,
    );
    fireEvent.click(container.querySelectorAll("path")[1]);
    expect(screen.getByText("Safari")).toBeTruthy();
    expect(screen.queryByText("Visitors")).toBeNull();
  });
});
