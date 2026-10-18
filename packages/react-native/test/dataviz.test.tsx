import { fireEvent, render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import { SoneBarList } from "../src/components/bar-list";
import { SoneChartLegend, SoneSwatch } from "../src/components/chart-legend";
import { SoneMeter } from "../src/components/meter";
import { SoneProgress } from "../src/components/progress";
import { SoneSparkline } from "../src/components/sparkline";
import { SoneStackedBar } from "../src/components/stacked-bar";
import { SONE_DEFAULT_THEME, SoneThemeContext } from "../src/theme/context";

const t = SONE_DEFAULT_THEME.tokens;

describe("SoneProgress", () => {
  it("is a determinate progressbar with a spoken percentage", () => {
    render(<SoneProgress value={30} max={60} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("60");
    expect(bar.getAttribute("aria-valuenow")).toBe("30");
    expect(bar.getAttribute("aria-valuetext")).toBe("50%");
  });

  it("carries no current value while indeterminate", () => {
    render(<SoneProgress size="md" tone="warning" />);
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.hasAttribute("aria-valuetext")).toBe(false);
    expect(getComputedStyle(bar).height).toBe(`${t.progressHMd}px`);
  });

  it("holds a still, full fill under reduced motion", () => {
    render(
      <SoneThemeContext.Provider
        value={{ ...SONE_DEFAULT_THEME, reduceMotion: true }}
      >
        <SoneProgress />
      </SoneThemeContext.Provider>,
    );
    const fill = screen.getByRole("progressbar").firstElementChild!;
    expect(getComputedStyle(fill).width).toBe("100%");
    expect(getComputedStyle(fill).opacity).toBe("0.5");
  });

  it("clamps the value and takes a custom label", () => {
    render(<SoneProgress value={250} valueLabel={(v, m) => `${v} / ${m}`} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("100 / 100");
  });
});

describe("SoneMeter", () => {
  it("speaks one sentence and draws its pips", () => {
    render(<SoneMeter label="Accuracy" value={3} max={4} detail="High" />);
    expect(
      screen.getByRole("img", { name: "Accuracy: 3 of 4. High" }),
    ).toBeTruthy();
  });

  it("clamps to ten pips", () => {
    render(<SoneMeter value={40} max={40} />);
    expect(screen.getByRole("img", { name: "10 of 10" })).toBeTruthy();
  });
});

describe("SoneSparkline", () => {
  it("is decorative by default", () => {
    render(<SoneSparkline testID="s" values={[1, 3, 2]} />);
    expect(screen.getByTestId("s").getAttribute("aria-hidden")).toBe("true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("is a named image with the summary message", () => {
    render(<SoneSparkline values={[1, 5, 4]} type="area" decorative={false} />);
    const img = screen.getByRole("img", {
      name: "3 values, peak 5, total 10",
    });
    expect(img.querySelectorAll("path")).toHaveLength(2);
  });

  it("draws heat cells from the sequential ramp", () => {
    render(
      <SoneSparkline
        values={[0, 2, 4]}
        type="heat"
        decorative={false}
        summary="Activity"
      />,
    );
    const cells = screen
      .getByRole("img", { name: "Activity" })
      .querySelectorAll("rect");
    expect(cells).toHaveLength(3);
  });
});

describe("SoneBarList", () => {
  const items = [
    { key: "a", label: "Alpha", value: 40 },
    { key: "b", label: "Beta", value: 10, valueLabel: "ten" },
  ];

  it("is a named list with a label and value per row", () => {
    render(<SoneBarList aria-label="Sources" items={items} />);
    const list = screen.getByRole("list", { name: "Sources" });
    expect(list.querySelectorAll('[role="listitem"]')).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("40")).toBeTruthy();
    expect(screen.getByText("ten")).toBeTruthy();
  });

  it("renders a custom label", () => {
    render(
      <SoneBarList
        items={items}
        renderLabel={(item) => <Text>{`#${item.label}`}</Text>}
      />,
    );
    expect(screen.getByText("#Beta")).toBeTruthy();
  });
});

describe("SoneStackedBar", () => {
  const segments = [
    { key: "a", label: "Done", value: 3 },
    { key: "b", label: "Open", value: 1 },
  ];

  it("summarises the parts", () => {
    render(<SoneStackedBar aria-label="Tasks" segments={segments} />);
    expect(
      screen.getByRole("img", {
        name: "Tasks: Done 3 (75%), Open 1 (25%); 4 in total",
      }),
    ).toBeTruthy();
  });

  it("reads against a max and adds a legend", () => {
    render(<SoneStackedBar segments={segments} max={8} showLegend />);
    expect(
      screen.getByRole("img", {
        name: "Done 3 (38%), Open 1 (13%); 4 of 8",
      }),
    ).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("says so when empty", () => {
    render(<SoneStackedBar segments={[]} />);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBeTruthy();
  });
});

describe("SoneChartLegend", () => {
  const items = [
    { key: "a", label: "Visits", value: 1200 },
    { key: "b", label: "Sales", tone: "success", value: "12" },
  ];

  it("lists swatch, label and formatted value", () => {
    render(<SoneChartLegend aria-label="Series" items={items} />);
    expect(screen.getByRole("list", { name: "Series" })).toBeTruthy();
    expect(screen.getByText("1,200")).toBeTruthy();
    expect(screen.getByText("Sales")).toBeTruthy();
  });

  it("toggles series (uncontrolled)", () => {
    const onHiddenChange = vi.fn();
    const onToggle = vi.fn();
    render(
      <SoneChartLegend
        items={items}
        toggleable
        onHiddenChange={onHiddenChange}
        onToggle={onToggle}
      />,
    );
    const [visits] = screen.getAllByRole("button");
    expect(visits.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(visits);
    expect(onToggle).toHaveBeenCalledWith("a");
    expect(onHiddenChange).toHaveBeenCalledWith(["a"]);
    expect(screen.getAllByRole("button")[0].getAttribute("aria-pressed")).toBe(
      "false",
    );
  });

  it("colours a swatch from the tone token", () => {
    render(<SoneSwatch testID="sw" tone="chart-3" />);
    const sw = screen.getByTestId("sw");
    expect(sw.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(sw).backgroundColor).toBeTruthy();
  });
});
