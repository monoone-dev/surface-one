import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Text } from "react-native";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneAppBar } from "../src/components/app-bar";
import { SoneAvatarGroup, soneInitials } from "../src/components/avatar-group";
import { SoneAvatar, SoneAvatarFallback } from "../src/components/avatar";
import { SoneDateField } from "../src/components/date-field";
import {
  monthGrid,
  parseIsoDate,
  shiftMonth,
  toIsoDate,
} from "../src/components/date-field/date-utils";
import { SoneImagePicker } from "../src/components/image-picker";
import { SoneTabBar } from "../src/components/tab-bar";
import { SoneToaster, toast } from "../src/components/toast";
import { SONE_DEFAULT_THEME, SoneThemeContext } from "../src/theme/context";

const still = (children: ReactNode) => (
  <SoneThemeContext.Provider
    value={{ ...SONE_DEFAULT_THEME, reduceMotion: true }}
  >
    {children}
  </SoneThemeContext.Provider>
);

describe("SoneToaster", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    act(() => toast.dismiss());
    vi.useRealTimers();
  });

  it("shows a toast from anywhere, announced politely, and dismisses it after its duration", () => {
    const onDismiss = vi.fn();
    render(still(<SoneToaster duration={1000} />));
    act(() => {
      toast.success("Saved", { description: "Trip updated", onDismiss });
    });
    const status = screen.getByRole("status");
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toContain("Saved");
    expect(status.textContent).toContain("Trip updated");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("status")).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("announces errors and warnings assertively", () => {
    render(still(<SoneToaster />));
    act(() => {
      toast.error("Could not save");
    });
    const alert = screen.getByRole("alert");
    expect(alert.getAttribute("aria-live")).toBe("assertive");
  });

  it("closes by its button and runs an action", () => {
    const onPress = vi.fn();
    render(still(<SoneToaster />));
    act(() => {
      toast("Deleted", { action: { label: "Undo", onPress } });
    });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).toBeNull();
    act(() => {
      toast("Again");
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("queues past the limit and keeps a sticky toast (duration 0)", () => {
    render(still(<SoneToaster limit={1} duration={500} />));
    act(() => {
      toast("First");
      toast("Second");
      toast("Sticky", { duration: 0, id: "sticky" });
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByText("First")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("Second")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByText("Sticky")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByText("Sticky")).toBeTruthy();
    act(() => {
      toast.dismiss("sticky");
    });
    expect(screen.queryByText("Sticky")).toBeNull();
  });

  it("replaces a toast that reuses its id", () => {
    render(still(<SoneToaster />));
    act(() => {
      toast("Uploading", { id: "up" });
      toast.success("Uploaded", { id: "up" });
    });
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByText("Uploaded")).toBeTruthy();
  });
});

describe("SoneTabBar", () => {
  const items = [
    { value: "plan", label: "Plan", icon: "map" as const },
    { value: "people", label: "People", icon: "people" as const },
    { value: "gone", label: "Gone", icon: "trash" as const, disabled: true },
  ];

  it("is a tab list: the active tab is selected and named by its label", () => {
    const onValueChange = vi.fn();
    render(
      <SoneTabBar
        items={items}
        value="plan"
        onValueChange={onValueChange}
        ariaLabel="Trip sections"
      />,
    );
    expect(screen.getByRole("tablist", { name: "Trip sections" })).toBeTruthy();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("aria-selected"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    // Only the active tab shows its label, yet every tab is named.
    expect(screen.getByRole("tab", { name: "People" }).textContent).toBe("");
    expect(screen.getByRole("tab", { name: "Plan" }).textContent).toBe("Plan");
    fireEvent.click(screen.getByRole("tab", { name: "People" }));
    expect(onValueChange).toHaveBeenCalledWith("people");
    fireEvent.click(screen.getByRole("tab", { name: "Gone" }));
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("works uncontrolled, and can show every label", () => {
    render(<SoneTabBar items={items} defaultValue="plan" labels="always" />);
    expect(screen.getByRole("tab", { name: "People" }).textContent).toBe(
      "People",
    );
    fireEvent.click(screen.getByRole("tab", { name: "People" }));
    expect(
      screen.getByRole("tab", { name: "People" }).getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("takes an icon from the app's own library", () => {
    render(
      <SoneTabBar
        items={[
          {
            value: "a",
            label: "A",
            renderIcon: ({ active }) => <Text>{active ? "on" : "off"}</Text>,
          },
        ]}
        value="a"
        floating={false}
      />,
    );
    expect(screen.getByText("on")).toBeTruthy();
  });
});

describe("SoneImagePicker", () => {
  it("shows an empty field that picks through the injected function", async () => {
    const onValueChange = vi.fn();
    const pick = vi.fn(async () => "file:///a.jpg");
    render(<SoneImagePicker pick={pick} onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Add image" }));
    await act(async () => undefined);
    expect(pick).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("file:///a.jpg");
    // Uncontrolled: it now shows the image with change and remove buttons.
    expect(screen.getByRole("button", { name: "Change image" })).toBeTruthy();
  });

  it("keeps the value on a cancel, reports a failure, and removes the image", async () => {
    const onValueChange = vi.fn();
    const onPickError = vi.fn();
    const { rerender } = render(
      <SoneImagePicker
        pick={() => undefined}
        onValueChange={onValueChange}
        value="file:///a.jpg"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Change image" }));
    await act(async () => undefined);
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);

    rerender(
      <SoneImagePicker
        pick={() => Promise.reject(new Error("denied"))}
        onPickError={onPickError}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add image" }));
    await act(async () => undefined);
    expect(onPickError).toHaveBeenCalledTimes(1);
  });

  it("does nothing while disabled", () => {
    const pick = vi.fn();
    render(<SoneImagePicker pick={pick} disabled label="Cover" />);
    fireEvent.click(screen.getByRole("button", { name: "Cover" }));
    expect(pick).not.toHaveBeenCalled();
  });
});

describe("SoneAvatarGroup", () => {
  it("derives initials from names and emails", () => {
    expect(soneInitials("Ada Lovelace")).toBe("AL");
    expect(soneInitials("grace brewster murray hopper")).toBe("GH");
    expect(soneInitials("ada@example.com")).toBe("A");
    expect(soneInitials("")).toBe("?");
    expect(soneInitials(null)).toBe("?");
  });

  it("overlaps people and folds the rest into +N", () => {
    render(
      <SoneAvatarGroup
        aria-label="Participants"
        max={2}
        people={[
          { name: "Ada Lovelace" },
          { name: "Grace Hopper" },
          { name: "Alan Turing" },
          { name: "Edsger Dijkstra" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Participants" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Grace Hopper" })).toBeTruthy();
    expect(screen.queryByRole("img", { name: "Alan Turing" })).toBeNull();
    expect(screen.getByRole("img", { name: "+2" })).toBeTruthy();
  });

  it("takes SoneAvatar children and a translated overflow name", () => {
    render(
      <SoneAvatarGroup max={1} overflowLabel={(n) => `${n} more`}>
        <SoneAvatar>
          <SoneAvatarFallback>AL</SoneAvatarFallback>
        </SoneAvatar>
        <SoneAvatar>
          <SoneAvatarFallback>GH</SoneAvatarFallback>
        </SoneAvatar>
      </SoneAvatarGroup>,
    );
    expect(screen.getByText("AL")).toBeTruthy();
    expect(screen.queryByText("GH")).toBeNull();
    expect(screen.getByRole("img", { name: "1 more" })).toBeTruthy();
  });
});

describe("date helpers", () => {
  it("parses, formats and walks months", () => {
    expect(parseIsoDate("2024-02-29")).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("nope")).toBeNull();
    expect(toIsoDate({ year: 2024, month: 3, day: 5 })).toBe("2024-03-05");
    expect(shiftMonth(2024, 12, 1)).toEqual({ year: 2025, month: 1 });
    expect(shiftMonth(2024, 1, -1)).toEqual({ year: 2023, month: 12 });
  });

  it("lays a month out in weeks", () => {
    // February 2024 starts on a Thursday.
    const monday = monthGrid(2024, 2, 1);
    expect(monday[0]).toEqual([null, null, null, 1, 2, 3, 4]);
    expect(monday.flat().filter(Boolean)).toHaveLength(29);
    expect(monthGrid(2024, 2, 0)[0]).toEqual([null, null, null, null, 1, 2, 3]);
    expect(monday.every((r) => r.length === 7)).toBe(true);
  });
});

describe("SoneDateField", () => {
  it("shows the formatted date, or the placeholder", () => {
    const { rerender } = render(
      <SoneDateField
        value="2024-03-05"
        locale="en-US"
        ariaLabel="Start date"
        formatDate={(d) => `on ${d}`}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Start date: on 2024-03-05" }),
    ).toBeTruthy();
    rerender(
      <SoneDateField ariaLabel="Start date" placeholder="Pick a date" />,
    );
    expect(
      screen.getByRole("button", { name: "Start date: Pick a date" }),
    ).toBeTruthy();
  });

  it("picks a day in the built-in calendar sheet", () => {
    const onValueChange = vi.fn();
    render(
      <SoneDateField
        defaultValue="2024-03-05"
        locale="en-US"
        ariaLabel="Start date"
        onValueChange={onValueChange}
        min="2024-03-02"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^Start date/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("March 2024")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /March 1, 2024/ })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: /March 5, 2024/ })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("April 2024")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /April 10, 2024/ }));
    expect(onValueChange).toHaveBeenCalledWith("2024-04-10");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("uses an injected picker instead, and clears", async () => {
    const onValueChange = vi.fn();
    const pick = vi.fn(async () => "2025-01-31");
    render(
      <SoneDateField
        ariaLabel="End date"
        pick={pick}
        clearable
        defaultValue="2024-03-05"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^End date/ }));
    await act(async () => undefined);
    expect(pick).toHaveBeenCalledWith("2024-03-05");
    expect(onValueChange).toHaveBeenCalledWith("2025-01-31");
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear date" }));
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it("does not open while disabled", () => {
    render(<SoneDateField ariaLabel="Start date" disabled />);
    fireEvent.click(screen.getByRole("button", { name: /^Start date/ }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("SoneAppBar", () => {
  it("is a heading with a back button and a trailing slot", () => {
    const onBack = vi.fn();
    render(
      <SoneAppBar
        title="Lisbon"
        subtitle="May 3 – 9"
        onBack={onBack}
        trailing={<Text>me</Text>}
      />,
    );
    expect(screen.getByRole("heading", { name: "Lisbon" })).toBeTruthy();
    expect(screen.getByText("May 3 – 9")).toBeTruthy();
    expect(screen.getByText("me")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("has no back button without onBack", () => {
    render(<SoneAppBar title="Trips" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
