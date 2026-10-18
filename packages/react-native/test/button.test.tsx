import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  SoneButton,
  SoneButtonGroup,
  SoneIcon,
  SurfaceOneProvider,
  resolveTokens,
} from "@surface-one/react-native";
import { studio } from "@surface-one/react-native/skins";

describe("SoneButton", () => {
  it("is a named button that reports presses", () => {
    const onPress = vi.fn();
    render(<SoneButton onPress={onPress}>Save</SoneButton>);
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not press while disabled", () => {
    const onPress = vi.fn();
    render(
      <SoneButton disabled onPress={onPress}>
        Save
      </SoneButton>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("takes its colours from the skin", () => {
    const studioLight = resolveTokens(studio, "light");
    render(
      <SurfaceOneProvider skin={studio} colorMode="light">
        <SoneButton testID="b">
          <SoneIcon name="plus" />
          Add
        </SoneButton>
      </SurfaceOneProvider>,
    );
    const style = getComputedStyle(screen.getByTestId("b"));
    expect(style.height).toBe(`${studioLight.controlHMd}px`);
    expect(screen.getByText("Add")).toBeTruthy();
  });

  it("groups buttons", () => {
    render(
      <SoneButtonGroup aria-label="Zoom">
        <SoneButton variant="outline">-</SoneButton>
        <SoneButton variant="outline">+</SoneButton>
      </SoneButtonGroup>,
    );
    expect(screen.getByRole("group", { name: "Zoom" })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
