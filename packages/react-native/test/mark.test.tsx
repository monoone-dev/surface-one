import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SurfaceOneProvider } from "@surface-one/react-native";
import { surface } from "@surface-one/react-native/skins";
import { SoneMark } from "../src/components/mark";

describe("SoneMark", () => {
  it("is decorative by default and an image with a label", () => {
    const { container } = render(
      <SurfaceOneProvider skin={surface} colorMode="light">
        <SoneMark testID="plain" tone="iris" />
        <SoneMark label="GitHub" icon="code" size="lg" />
      </SurfaceOneProvider>,
    );
    expect(screen.getByTestId("plain").getAttribute("aria-hidden")).toBe(
      "true",
    );
    const img = screen.getByRole("img", { name: "GitHub" });
    expect(img).toBeTruthy();
    const stops = container.querySelectorAll("stop");
    expect(stops[0]?.getAttribute("stop-color")).toBe("#6a7cf0");
    expect(stops[1]?.getAttribute("stop-color")).toBe("#3443b8");
  });

  it("takes a preset or a size in dp", () => {
    render(
      <SurfaceOneProvider skin={surface} colorMode="light">
        <SoneMark testID="sm" size="sm" />
        <SoneMark testID="px" size={36} />
      </SurfaceOneProvider>,
    );
    expect(getComputedStyle(screen.getByTestId("sm")).width).toBe("20px");
    expect(getComputedStyle(screen.getByTestId("px")).width).toBe("36px");
  });
});
