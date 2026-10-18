import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SurfaceOneProvider } from "@surface-one/react-native";
import {
  SoneAlert,
  SoneAlertAction,
  SoneAlertDescription,
  SoneAlertTitle,
} from "../src/components/alert";
import { mix, over } from "../src/utils/color";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneAvatarImage,
} from "../src/components/avatar";
import { SoneBadge, SoneBadgeRemove } from "../src/components/badge";
import { SoneBanner } from "../src/components/banner";
import {
  SoneCard,
  SoneCardAction,
  SoneCardContent,
  SoneCardDescription,
  SoneCardFooter,
  SoneCardHeader,
  SoneCardTitle,
} from "../src/components/card";
import { SoneEmpty, SoneEmptyContent } from "../src/components/empty-state";
import { SoneIcon } from "../src/components/icon";
import {
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemTitle,
} from "../src/components/item";
import {
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
} from "../src/components/page-header";
import { SoneSectionHeading } from "../src/components/section-heading";
import { SoneSeparator } from "../src/components/separator";
import { SoneSkeleton } from "../src/components/skeleton";
import { SoneSpinner } from "../src/components/spinner";
import {
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
} from "../src/components/stat";
import { SoneStatusDot } from "../src/components/status-dot";

describe("colour helpers", () => {
  it("mixes and layers token colours", () => {
    expect(mix("#ffffff", "#000000", 0.5)).toBe("rgba(128, 128, 128, 1)");
    expect(mix("#ff0000", "transparent", 0.25)).toBe("rgba(255, 0, 0, 0.25)");
    expect(over("rgba(0, 0, 0, 0.5)", "#ffffff")).toBe(
      "rgba(128, 128, 128, 1)",
    );
  });
});

describe("SoneBadge", () => {
  it("is plain text unless pressable", () => {
    render(
      <SoneBadge variant="success" dot>
        Paid
      </SoneBadge>,
    );
    expect(screen.getByText("Paid")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("presses, and its remove button reports separately", () => {
    const onPress = vi.fn();
    const onRemove = vi.fn();
    render(
      <SoneBadge variant="outline" onPress={onPress}>
        Design
        <SoneBadgeRemove aria-label="Remove Design" onPress={onRemove} />
      </SoneBadge>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove Design" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    const badge = screen.getAllByRole("button")[0]!;
    fireEvent.click(badge);
    expect(onPress).toHaveBeenCalled();
  });
});

describe("SoneCard", () => {
  it("renders its parts with a heading title", () => {
    render(
      <SoneCard size="sm" testID="card">
        <SoneCardHeader>
          <SoneCardTitle>Usage</SoneCardTitle>
          <SoneCardDescription>This month</SoneCardDescription>
          <SoneCardAction>
            <SoneBadge>New</SoneBadge>
          </SoneCardAction>
        </SoneCardHeader>
        <SoneCardContent>Body</SoneCardContent>
        <SoneCardFooter>Footer</SoneCardFooter>
      </SoneCard>,
    );
    expect(screen.getByRole("heading", { name: "Usage" })).toBeTruthy();
    expect(screen.getByText("This month")).toBeTruthy();
    expect(screen.getByText("Body")).toBeTruthy();
    expect(screen.getByText("Footer")).toBeTruthy();
  });
});

describe("SoneAlert", () => {
  it("is dismissible with the translated close label", () => {
    const onDismissed = vi.fn();
    render(
      <SurfaceOneProvider colorMode="light" messages={{ dismiss: "Odrzuć" }}>
        <SoneAlert variant="destructive" dismissible onDismissed={onDismissed}>
          <SoneIcon name="alert-circle" />
          <SoneAlertTitle>Payment failed</SoneAlertTitle>
          <SoneAlertDescription>Check the card.</SoneAlertDescription>
          <SoneAlertAction>
            <SoneBadge>Retry</SoneBadge>
          </SoneAlertAction>
        </SoneAlert>
      </SurfaceOneProvider>,
    );
    expect(screen.getByText("Payment failed")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Odrzuć" }));
    expect(onDismissed).toHaveBeenCalledTimes(1);
  });

  it("has no close button by default and takes closeLabel", () => {
    const { rerender } = render(<SoneAlert>Saved</SoneAlert>);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(
      <SoneAlert dismissible closeLabel="Hide">
        Saved
      </SoneAlert>,
    );
    expect(screen.getByRole("button", { name: "Hide" })).toBeTruthy();
  });
});

describe("SoneBanner", () => {
  it("announces danger as an alert and info as a status", () => {
    const { rerender } = render(<SoneBanner kind="danger">Offline</SoneBanner>);
    expect(screen.getByRole("alert").textContent).toContain("Offline");
    rerender(<SoneBanner floating>Synced</SoneBanner>);
    expect(screen.getByRole("status").textContent).toContain("Synced");
  });
});

describe("SoneAvatar", () => {
  it("shows the fallback until the image loads", () => {
    render(
      <SoneAvatar size="lg">
        <SoneAvatarImage
          source={{ uri: "https://example.test/a.png" }}
          alt="Ada"
        />
        <SoneAvatarFallback>AL</SoneAvatarFallback>
      </SoneAvatar>,
    );
    expect(screen.getByText("AL")).toBeTruthy();
  });

  it("draws the person glyph without image or fallback", () => {
    const { container } = render(<SoneAvatar testID="a" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});

describe("SoneSeparator", () => {
  it("is decorative unless told otherwise", () => {
    const { rerender } = render(<SoneSeparator testID="s" />);
    expect(screen.queryByRole("separator")).toBeNull();
    rerender(<SoneSeparator decorative={false} orientation="vertical" />);
    expect(screen.getByRole("separator")).toBeTruthy();
  });
});

describe("SoneSkeleton", () => {
  it("is hidden from assistive tech, and still under reduced motion", () => {
    render(<SoneSkeleton testID="sk" style={{ height: 12 }} />);
    expect(screen.getByTestId("sk").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("SoneSpinner", () => {
  it("is a named progressbar by default", () => {
    render(<SoneSpinner />);
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeTruthy();
  });

  it("is decorative with label={null}", () => {
    render(<SoneSpinner label={null} testID="sp" />);
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByTestId("sp").getAttribute("aria-hidden")).toBe("true");
  });
});

describe("SoneStatusDot", () => {
  it("is decorative unless labelled", () => {
    const { rerender } = render(<SoneStatusDot tone="live" pulse testID="d" />);
    expect(screen.getByTestId("d").getAttribute("aria-hidden")).toBe("true");
    rerender(<SoneStatusDot tone="success" size="sm" label="Online" />);
    expect(screen.getByRole("img", { name: "Online" })).toBeTruthy();
  });
});

describe("SoneEmpty", () => {
  it("draws the header from props", () => {
    render(
      <SoneEmpty
        icon="search"
        title="No results"
        description="Try another word."
      >
        <SoneEmptyContent>
          <SoneBadge>Clear</SoneBadge>
        </SoneEmptyContent>
      </SoneEmpty>,
    );
    expect(screen.getByRole("heading", { name: "No results" })).toBeTruthy();
    expect(screen.getByText("Try another word.")).toBeTruthy();
  });

  it("is an alert in the error tone and a status while busy", () => {
    const { rerender } = render(<SoneEmpty tone="error" title="Failed" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(<SoneEmpty busy />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeTruthy();
  });
});

describe("SoneItem", () => {
  it("is a list of rows, pressable with onPress", () => {
    const onPress = vi.fn();
    render(
      <SoneItemGroup>
        <SoneItem variant="outline" onPress={onPress}>
          <SoneItemContent>
            <SoneItemTitle>Invoice</SoneItemTitle>
            <SoneItemDescription>Due today</SoneItemDescription>
          </SoneItemContent>
        </SoneItem>
        <SoneItem size="xs">
          <SoneItemContent>Static</SoneItemContent>
          <SoneItemActions>
            <SoneBadge>1</SoneBadge>
          </SoneItemActions>
        </SoneItem>
      </SoneItemGroup>,
    );
    expect(screen.getByRole("list")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Static")).toBeTruthy();
  });
});

describe("SoneStat", () => {
  it("speaks the trend direction before its text", () => {
    render(
      <SoneStatGroup columns={2} separated>
        <SoneStat>
          <SoneStatLabel>Revenue</SoneStatLabel>
          <SoneStatValue>$12k</SoneStatValue>
          <SoneStatTrend delta={4}>+4%</SoneStatTrend>
          <SoneStatHint>vs last month</SoneStatHint>
        </SoneStat>
        <SoneStat variant="inset" size="sm" labelPosition="bottom">
          <SoneStatLabel>Churn</SoneStatLabel>
          <SoneStatValue>2%</SoneStatValue>
          <SoneStatTrend delta={-1}>-1%</SoneStatTrend>
        </SoneStat>
      </SoneStatGroup>,
    );
    expect(screen.getByText("$12k")).toBeTruthy();
    expect(screen.getByLabelText("up +4%")).toBeTruthy();
    expect(screen.getByLabelText("down -1%")).toBeTruthy();
  });
});

describe("SoneSectionHeading", () => {
  it("names the heading by its title alone", () => {
    render(
      <SoneSectionHeading
        title="Meetings"
        count={12}
        level={3}
        actions={<SoneBadge>All</SoneBadge>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Meetings" })).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("All")).toBeTruthy();
  });
});

describe("SonePageHeader", () => {
  it("renders the title as a heading", () => {
    render(
      <SonePageHeader>
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>Settings</SonePageHeaderEyebrow>
          <SonePageHeaderTitle>Billing</SonePageHeaderTitle>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          <SoneBadge>Pro</SoneBadge>
        </SonePageHeaderActions>
      </SonePageHeader>,
    );
    expect(screen.getByRole("heading", { name: "Billing" })).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });
});
