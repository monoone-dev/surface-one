import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneSearchField,
  SurfaceOneProvider,
  resolveTokens,
} from "@surface-one/react-native";
import { surface } from "@surface-one/react-native/skins";

const t = resolveTokens(surface, "light");

/** A colour as the DOM reports it (hex → rgb()). */
function css(color: string): string {
  const probe = document.createElement("div");
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
}

const inSurface = (node: ReactNode) =>
  render(
    <SurfaceOneProvider skin={surface} colorMode="light">
      {node}
    </SurfaceOneProvider>,
  );

describe("Isles variants", () => {
  it("SoneBadge: info is the blue soft tint, count a centred number", () => {
    inSurface(
      <>
        <SoneBadge variant="info" testID="info">
          Beta
        </SoneBadge>
        <SoneBadge variant="count" testID="count">
          3
        </SoneBadge>
      </>,
    );
    expect(getComputedStyle(screen.getByTestId("info")).backgroundColor).toBe(
      css(t.infoSoft),
    );
    const count = getComputedStyle(screen.getByTestId("count"));
    expect(count.backgroundColor).toBe(css(t.badgeCountBg));
    expect(count.minWidth).toBe(`${t.badgeCountMinW}px`);
  });

  it("SoneAvatar: shape square rounds a share of its size", () => {
    inSurface(
      <SoneAvatar shape="square" testID="a">
        <SoneAvatarFallback>DS</SoneAvatarFallback>
      </SoneAvatar>,
    );
    const radius = parseFloat(
      getComputedStyle(screen.getByTestId("a")).borderTopLeftRadius,
    );
    expect(radius).toBeCloseTo(32 * t.avatarSquareRatio, 1);
  });

  it("SoneButton: accent and soft fills, the pressed fill when active", () => {
    inSurface(
      <>
        <SoneButton variant="accent" testID="accent">
          Send
        </SoneButton>
        <SoneButton variant="soft" size="icon" aria-label="Star" testID="soft">
          *
        </SoneButton>
        <SoneButton
          variant="ghost"
          size="icon"
          active
          aria-label="Pin"
          aria-pressed
          testID="pressed"
        >
          *
        </SoneButton>
      </>,
    );
    const bg = (id: string) =>
      getComputedStyle(screen.getByTestId(id)).backgroundColor;
    expect(bg("accent")).toBe(css(t.btnAccentBg));
    expect(bg("soft")).toBe(css(t.btnSoftBg));
    expect(bg("pressed")).toBe(css(t.btnPressedBg));
  });

  it("SoneSearchField: filled has the grey fill and no border", () => {
    inSurface(<SoneSearchField variant="filled" />);
    const frame = getComputedStyle(screen.getByRole("group"));
    expect(frame.backgroundColor).toBe(css(t.inputFilledBg));
    expect(frame.borderTopColor).toBe("rgba(0, 0, 0, 0)");
  });
});
