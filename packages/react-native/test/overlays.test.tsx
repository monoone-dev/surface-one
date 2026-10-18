import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleIcon,
  SoneCollapsibleTrigger,
} from "../src/components/collapsible";
import {
  SoneConfirm,
  SoneConfirmDescription,
  SoneConfirmTitle,
} from "../src/components/confirm";
import { SoneCopyButton } from "../src/components/copy-button";
import {
  SoneAlertDialog,
  SoneDialog,
  SoneDialogClose,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
} from "../src/components/dialog";
import { SoneDisclosure } from "../src/components/disclosure";
import { SoneElapsedTimer } from "../src/components/elapsed-timer";
import { SoneLoadMore } from "../src/components/load-more";
import {
  SoneSheet,
  SoneSheetHeader,
  SoneSheetTitle,
} from "../src/components/sheet";

afterEach(() => {
  vi.useRealTimers();
});

/** Ends react-native-web's Modal fade (jsdom runs no CSS animations): it becomes active / unmounts. */
function finishAnimations(): void {
  for (const el of Array.from(document.body.querySelectorAll("*")))
    for (const type of ["animationend", "webkitAnimationEnd"])
      fireEvent(el, new Event(type, { bubbles: true }));
}

describe("SoneDialog", () => {
  it("is a modal dialog named by its title with a corner close", () => {
    const onOpenChange = vi.fn();
    const onDismiss = vi.fn();
    render(
      <SoneDialog onOpenChange={onOpenChange} onDismiss={onDismiss}>
        <SoneDialogHeader>
          <SoneDialogTitle>Rename file</SoneDialogTitle>
          <SoneDialogDescription>Pick a new name.</SoneDialogDescription>
        </SoneDialogHeader>
        <SoneDialogFooter />
      </SoneDialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Rename file" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(screen.getByRole("heading", { name: "Rename file" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays closed until opened, and is not dismissible on request", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <SoneDialog
        open={false}
        ariaLabel="Settings"
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.queryByRole("dialog", { name: "Settings" })).toBeNull();
    rerender(
      <SoneDialog
        open
        dismissible={false}
        ariaLabel="Settings"
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.getByRole("dialog", { name: "Settings" })).toBeTruthy();
    // No corner close; Escape (the back button) is ignored.
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    finishAnimations();
    fireEvent.keyUp(document, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("dismisses on Escape / back while dismissible", () => {
    const onDismiss = vi.fn();
    render(<SoneDialog ariaLabel="Settings" onDismiss={onDismiss} />);
    finishAnimations();
    fireEvent.keyUp(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    finishAnimations();
    expect(screen.queryByRole("dialog", { name: "Settings" })).toBeNull();
  });

  it("lets a header close replace the corner one and veto the close", () => {
    const onDismiss = vi.fn();
    render(
      <SoneDialog onDismiss={onDismiss}>
        <SoneDialogHeader>
          <SoneDialogTitle>Share</SoneDialogTitle>
          <SoneDialogClose
            label="Dismiss"
            onPress={(e) => e.preventDefault()}
          />
        </SoneDialogHeader>
      </SoneDialog>,
    );
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("dismisses from the scrim unless scrimCloses is off", () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <SoneDialog
        ariaLabel="Settings"
        scrimCloses={false}
        onDismiss={onDismiss}
      />,
    );
    const scrim = () =>
      screen.getByRole("dialog", { name: "Settings" }).previousElementSibling!;
    fireEvent.click(scrim());
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(<SoneDialog ariaLabel="Settings" onDismiss={onDismiss} />);
    fireEvent.click(scrim());
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("draws an alertdialog with no corner close", () => {
    render(
      <SoneAlertDialog>
        <SoneDialogTitle>Delete project?</SoneDialogTitle>
      </SoneAlertDialog>,
    );
    expect(
      screen.getByRole("alertdialog", { name: "Delete project?" }),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });
});

describe("SoneSheet", () => {
  it("is a named dialog that closes from its corner button", () => {
    const onOpenChange = vi.fn();
    render(
      <SoneSheet
        side="right"
        onOpenChange={onOpenChange}
        closeLabel="Close panel"
      >
        <SoneSheetHeader>
          <SoneSheetTitle>Filters</SoneSheetTitle>
        </SoneSheetHeader>
      </SoneSheet>,
    );
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close panel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("SoneConfirm", () => {
  it("is an alertdialog with Cancel then Confirm", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <SoneConfirm
        variant="destructive"
        onConfirm={onConfirm}
        onCancel={onCancel}
      >
        <SoneConfirmTitle>Delete row?</SoneConfirmTitle>
        <SoneConfirmDescription>This cannot be undone.</SoneConfirmDescription>
      </SoneConfirm>,
    );
    expect(
      screen.getByRole("alertdialog", { name: "Delete row?" }),
    ).toBeTruthy();
    const [cancel, confirm] = screen.getAllByRole("button");
    expect(cancel.textContent).toBe("Cancel");
    expect(confirm.textContent).toBe("Confirm");
    expect(document.activeElement).toBe(confirm);
    fireEvent.click(cancel);
    fireEvent.click(confirm);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("disables both buttons while busy", () => {
    const onConfirm = vi.fn();
    render(
      <SoneConfirm busy onConfirm={onConfirm}>
        <SoneConfirmTitle>Leave?</SoneConfirmTitle>
      </SoneConfirm>,
    );
    const action = screen.getByRole("button", { name: "Working…" });
    expect(action.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(action);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe("SoneCollapsible", () => {
  it("toggles its content and reports aria-expanded", () => {
    const onExpandedChange = vi.fn();
    render(
      <SoneCollapsible onExpandedChange={onExpandedChange}>
        <SoneCollapsibleTrigger>
          <SoneCollapsibleIcon />
          Details
        </SoneCollapsibleTrigger>
        <SoneCollapsibleContent testID="content" />
      </SoneCollapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Details" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(getComputedStyle(screen.getByTestId("content")).display).toBe(
      "none",
    );
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(getComputedStyle(screen.getByTestId("content")).display).not.toBe(
      "none",
    );
  });
});

describe("SoneDisclosure", () => {
  it("shows a region named by its summary", () => {
    render(
      <SoneDisclosure summary="Shipping">Ships in 2 days.</SoneDisclosure>,
    );
    const trigger = screen.getByRole("button", { name: "Shipping" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "Shipping" }).textContent).toBe(
      "Ships in 2 days.",
    );
  });

  it("does not toggle while disabled", () => {
    render(<SoneDisclosure disabled summary="Shipping" />);
    const trigger = screen.getByRole("button", { name: "Shipping" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("SoneCopyButton", () => {
  it("copies through the given function and shows Copied for a moment", async () => {
    vi.useFakeTimers();
    const copy = vi.fn().mockResolvedValue(undefined);
    const onCopied = vi.fn();
    render(<SoneCopyButton value="npm i" copy={copy} onCopied={onCopied} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });
    expect(copy).toHaveBeenCalledWith("npm i");
    expect(onCopied).toHaveBeenCalledWith("npm i");
    expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });

  it("names an icon-only button and reports a refusal", async () => {
    const onCopyError = vi.fn();
    const copy = vi.fn().mockRejectedValue(new Error("no"));
    render(
      <SoneCopyButton
        iconOnly
        value="x"
        copy={copy}
        onCopyError={onCopyError}
      />,
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });
    expect(onCopyError).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Copy" })).toBeTruthy();
  });
});

describe("SoneLoadMore", () => {
  it("shows the count and calls onLoad", () => {
    const onLoad = vi.fn();
    render(<SoneLoadMore remaining={12} onLoad={onLoad} />);
    fireEvent.click(screen.getByRole("button", { name: "Show more (12)" }));
    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("is busy with a spinner, retries after an error, hides when done", () => {
    const onLoad = vi.fn();
    const { rerender } = render(<SoneLoadMore busy onLoad={onLoad} />);
    const button = screen.getByRole("button", { name: "Loading…" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.querySelector("svg")).not.toBeNull();
    fireEvent.click(button);
    expect(onLoad).not.toHaveBeenCalled();
    rerender(<SoneLoadMore error="Network down" onLoad={onLoad} />);
    expect(screen.getByRole("alert").textContent).toBe("Network down");
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    rerender(<SoneLoadMore remaining={0} onLoad={onLoad} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("SoneElapsedTimer", () => {
  it("formats the time and is a named timer while live", () => {
    render(<SoneElapsedTimer seconds={3727} live ariaLabel="Recording time" />);
    const timer = screen.getByRole("timer", { name: "Recording time" });
    expect(timer.textContent).toBe("1:02:07");
  });

  it("ticks once a second while running", () => {
    vi.useFakeTimers();
    render(<SoneElapsedTimer seconds={59} running testID="t" />);
    expect(screen.getByTestId("t").textContent).toBe("0:59");
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByTestId("t").textContent).toBe("1:01");
  });
});
