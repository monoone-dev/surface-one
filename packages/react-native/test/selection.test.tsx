import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
} from "../src/components/choice-card";
import { SoneFilterChips } from "../src/components/filter-chips";
import { SoneRating } from "../src/components/rating";
import { SoneSegmented } from "../src/components/segmented";
import { SoneSelect } from "../src/components/select";
import { SoneSlider, snapSliderValue } from "../src/components/slider";
import { SoneStepper } from "../src/components/stepper";
import {
  SoneToggle,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "../src/components/toggle-group";

const pressed = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-pressed");

describe("SoneSlider", () => {
  it("is a named slider with its range and value", () => {
    render(
      <SoneSlider ariaLabel="Volume" defaultValue={40} min={10} max={90} />,
    );
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider.getAttribute("aria-valuemin")).toBe("10");
    expect(slider.getAttribute("aria-valuemax")).toBe("90");
    expect(slider.getAttribute("aria-valuenow")).toBe("40");
  });

  it("follows a controlled value", () => {
    const { rerender } = render(<SoneSlider ariaLabel="V" value={5} />);
    rerender(<SoneSlider ariaLabel="V" value={7} />);
    expect(screen.getByRole("slider").getAttribute("aria-valuenow")).toBe("7");
  });

  it("snaps to the step grid inside the range", () => {
    expect(snapSliderValue(43, 0, 100, 5)).toBe(45);
    expect(snapSliderValue(0.34, 0, 1, 0.1)).toBe(0.3);
    expect(snapSliderValue(-4, 0, 10, 1)).toBe(0);
    expect(snapSliderValue(12, 0, 10, 3)).toBe(9);
  });
});

describe("SoneToggleGroup", () => {
  it("presses one item at a time (single)", () => {
    const onValueChange = vi.fn();
    render(
      <SoneToggleGroup
        aria-label="Align"
        defaultValue="left"
        onValueChange={onValueChange}
      >
        <SoneToggleGroupItem value="left">Left</SoneToggleGroupItem>
        <SoneToggleGroupItem value="right">Right</SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    expect(screen.getByRole("group", { name: "Align" })).toBeTruthy();
    expect(pressed("Left")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Right" }));
    expect(onValueChange).toHaveBeenLastCalledWith("right");
    expect(pressed("Left")).toBe("false");
    expect(pressed("Right")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Right" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("presses several items (multiple)", () => {
    const onValueChange = vi.fn();
    render(
      <SoneToggleGroup
        type="multiple"
        defaultValue={["b"]}
        onValueChange={onValueChange}
      >
        <SoneToggleGroupItem value="b">Bold</SoneToggleGroupItem>
        <SoneToggleGroupItem value="i">Italic</SoneToggleGroupItem>
      </SoneToggleGroup>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["b", "i"]);
    expect(pressed("Bold")).toBe("true");
    expect(pressed("Italic")).toBe("true");
  });

  it("has a standalone toggle", () => {
    const onPress = vi.fn();
    render(
      <SoneToggle pressed onPress={onPress}>
        Mute
      </SoneToggle>,
    );
    expect(pressed("Mute")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe("SoneSegmented", () => {
  it("picks one option and skips disabled ones", () => {
    const onValueChange = vi.fn();
    render(
      <SoneSegmented
        ariaLabel="View"
        defaultValue="day"
        onValueChange={onValueChange}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month", disabled: true },
          { value: "grid", label: "Grid", icon: "layout-grid", iconOnly: true },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "View" })).toBeTruthy();
    expect(pressed("Day")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(pressed("Week")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Grid" })).toBeTruthy();
  });
});

describe("SoneSelect", () => {
  const options = [
    { value: "apple", label: "Apple" },
    { value: "pear", label: "Pear" },
    { value: "plum", label: "Plum", disabled: true },
  ];

  it("opens a list and picks an option", () => {
    const onValueChange = vi.fn();
    const onSelectionChange = vi.fn();
    render(
      <SoneSelect
        ariaLabel="Fruit"
        placeholder="Pick one"
        options={options}
        onValueChange={onValueChange}
        onSelectionChange={onSelectionChange}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Fruit: Pick one" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("radiogroup", { name: "Fruit" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Plum" }));
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("radio", { name: "Pear" }));
    expect(onValueChange).toHaveBeenCalledWith("pear");
    expect(onSelectionChange).toHaveBeenCalledWith("pear");
    expect(
      screen
        .getByRole("button", { name: "Fruit: Pear" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });

  it("does not open while disabled", () => {
    render(
      <SoneSelect
        ariaLabel="Fruit"
        options={options}
        defaultValue="apple"
        disabled
      />,
    );
    const trigger = screen.getByRole("button", { name: "Fruit: Apple" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("SoneRating", () => {
  it("is a radio group of stars", () => {
    const onValueChange = vi.fn();
    render(
      <SoneRating defaultValue={2} clearable onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("radiogroup", { name: "Rating" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(
      screen
        .getByRole("radio", { name: "2 stars" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onValueChange).toHaveBeenLastCalledWith(4);
    fireEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(onValueChange).toHaveBeenLastCalledWith(0);
  });

  it("is one image when read-only", () => {
    render(<SoneRating readonly value={4.5} ariaLabel="Score" />);
    expect(
      screen.getByRole("img", { name: "Score: 4.5 out of 5" }),
    ).toBeTruthy();
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
  });
});

describe("SoneChoiceCard", () => {
  function Plans() {
    const [plan, setPlan] = useState("free");
    return (
      <SoneChoiceGroup aria-label="Plan">
        {["free", "pro"].map((p) => (
          <SoneChoiceCard
            key={p}
            selected={plan === p}
            onPress={() => setPlan(p)}
          >
            <SoneChoiceCardTitle>{p}</SoneChoiceCardTitle>
            <SoneChoiceCardDescription>The {p} plan</SoneChoiceCardDescription>
            <SoneChoiceCardIndicator />
          </SoneChoiceCard>
        ))}
      </SoneChoiceGroup>
    );
  }

  it("is a radio inside a group", () => {
    render(<Plans />);
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeTruthy();
    const [free, pro] = screen.getAllByRole("radio");
    expect(free!.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(pro!);
    expect(pro!.getAttribute("aria-checked")).toBe("true");
    expect(free!.getAttribute("aria-checked")).toBe("false");
  });

  it("is a checkbox or a toggle on its own", () => {
    render(
      <>
        <SoneChoiceCard role="checkbox" selected aria-label="Backups" />
        <SoneChoiceCard aria-label="Alerts" />
      </>,
    );
    expect(
      screen
        .getByRole("checkbox", { name: "Backups" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(pressed("Alerts")).toBe("false");
  });
});

describe("SoneFilterChips", () => {
  const options = [
    { value: "all", label: "All" },
    { value: "error", label: "Errors", count: 3, tone: "danger" as const },
    { value: "off", label: "Off", disabled: true },
  ];

  it.each(["toggle", "tabs"] as const)("picks one filter (%s)", (variant) => {
    const onValueChange = vi.fn();
    render(
      <SoneFilterChips
        variant={variant}
        ariaLabel="Level"
        options={options}
        defaultValue="all"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("group", { name: "Level" })).toBeTruthy();
    expect(pressed("All")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Errors 3" }));
    expect(onValueChange).toHaveBeenCalledWith("error");
    expect(pressed("Errors 3")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Off" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });
});

describe("SoneStepper", () => {
  const steps = [
    { key: "a", label: "Account" },
    { key: "b", label: "Profile" },
    { key: "c", label: "Done" },
  ];

  it("names the group, marks the current step and counts", () => {
    render(<SoneStepper steps={steps} defaultCurrent={1} />);
    expect(screen.getByRole("group", { name: "Progress" })).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: "Profile" })
        .getAttribute("aria-current"),
    ).toBe("step");
    expect(screen.getByText("Step 2 of 3")).toBeTruthy();
  });

  it("moves on a press; linear blocks the steps ahead", () => {
    const onCurrentChange = vi.fn();
    render(
      <SoneStepper
        steps={steps}
        variant="numbered"
        linear
        defaultCurrent={1}
        onCurrentChange={onCurrentChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onCurrentChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Account" }));
    expect(onCurrentChange).toHaveBeenCalledWith(0);
    expect(screen.getByText("Step 1 of 3")).toBeTruthy();
  });

  it("has no buttons when disabled", () => {
    render(<SoneStepper steps={steps} disabled />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
