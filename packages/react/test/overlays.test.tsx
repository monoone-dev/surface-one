import { act, fireEvent, render, screen } from "@testing-library/react";
import { StrictMode, createRef, useState, type ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneMessagesProvider } from "../src/context/messages";
import {
  SoneAlertDialog,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogMedia,
  SoneDialogTitle,
} from "../src/components/dialog";
import { SoneSheet, SoneSheetTitle } from "../src/components/sheet";
import {
  SoneConfirm,
  SoneConfirmActions,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
  type SoneConfirmHandle,
} from "../src/components/confirm";
import {
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuSub,
  SoneMenuSubTrigger,
} from "../src/components/menu";
import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleTrigger,
} from "../src/components/collapsible";
import { SoneCollapsibleSection } from "../src/components/collapsible-section";
import { SoneDisclosure } from "../src/components/disclosure";

// jsdom lays nothing out: give every element a box, so the focus trap sees tab stops.
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
});
afterEach(() => vi.restoreAllMocks());

const key = (el: Element, k: string, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(el, { key: k, ...init });

/** Opens a dialog from a button, as an app does. */
function Host({
  children,
  onDismiss,
}: {
  children?: ReactNode;
  onDismiss?: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button id="opener" type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <SoneDialog open={open} onOpenChange={setOpen} onDismiss={onDismiss}>
        <SoneDialogTitle>Title</SoneDialogTitle>
        <SoneDialogDescription>Text</SoneDialogDescription>
        {children ?? <input id="field" data-autofocus />}
      </SoneDialog>
    </>
  );
}

function openHost(node = <Host />) {
  const utils = render(node);
  const opener = document.getElementById("opener")!;
  opener.focus();
  act(() => opener.click());
  const panel = document.querySelector<HTMLElement>('[role="dialog"]')!;
  return { ...utils, opener, panel };
}

describe("SoneDialog", () => {
  it("is portaled, labelled, takes focus, closes on Escape and gives focus back", () => {
    const onDismiss = vi.fn();
    const { opener, panel } = openHost(<Host onDismiss={onDismiss} />);
    const layer = panel.parentElement!;
    expect(layer.tagName).toBe("SONE-DIALOG");
    expect(layer.parentElement).toBe(document.body);
    expect(layer.className).toBe("dialog-overlay");
    expect(layer.getAttribute("data-slot")).toBe("dialog-overlay");
    expect(panel.className).toBe("dialog-content");
    expect(panel.getAttribute("data-slot")).toBe("dialog-content");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("data-size")).toBe("sm");
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)!
        .textContent,
    ).toBe("Title");
    expect(
      document.getElementById(panel.getAttribute("aria-describedby")!)!
        .textContent,
    ).toBe("Text");
    expect(document.activeElement?.id).toBe("field");
    key(document.activeElement!, "Escape");
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("takes the wide 2xl size for a window-sized dialog", () => {
    render(
      <SoneDialog size="2xl">
        <SoneDialogTitle>Settings</SoneDialogTitle>
      </SoneDialog>,
    );
    const panel = screen.getByRole("dialog", { name: "Settings" });
    expect(panel.getAttribute("data-size")).toBe("2xl");
  });

  it("works the same under StrictMode", () => {
    const { opener, panel } = openHost(
      <StrictMode>
        <Host />
      </StrictMode>,
    );
    expect(document.activeElement?.id).toBe("field");
    key(panel, "Escape");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("keeps the element React's autoFocus focused", () => {
    openHost(
      <Host>
        <button type="button">First</button>
        <input id="auto" autoFocus />
      </Host>,
    );
    expect(document.activeElement?.id).toBe("auto");
  });

  it("focuses the panel when nothing asks for focus, and selects data-autofocus=select", () => {
    const { panel } = openHost(<Host>{false}</Host>);
    // The corner close button is the only stop, but focus starts on the panel.
    expect(document.activeElement).toBe(panel);
  });

  it("selects the text of data-autofocus=select", () => {
    openHost(
      <Host>
        <input id="name" defaultValue="Q4 planning" data-autofocus="select" />
      </Host>,
    );
    const input = document.getElementById("name") as HTMLInputElement;
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("Q4 planning".length);
  });

  it("Tab and Shift+Tab cycle inside the panel", () => {
    const { panel } = openHost(
      <Host>
        <input id="a" data-autofocus />
        <button id="b" type="button">
          B
        </button>
      </Host>,
    );
    const close = panel.querySelector<HTMLElement>(".dialog-close")!;
    expect(document.activeElement?.id).toBe("a");
    key(document.activeElement!, "Tab");
    expect(document.activeElement?.id).toBe("b");
    key(document.activeElement!, "Tab");
    expect(document.activeElement).toBe(close);
    key(document.activeElement!, "Tab");
    expect(document.activeElement?.id).toBe("a");
    key(document.activeElement!, "Tab", { shiftKey: true });
    expect(document.activeElement).toBe(close);
  });

  it("answers Tab and Escape on the document when focus fell to <body>", () => {
    const { opener } = openHost();
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    key(document.body, "Tab");
    expect(document.activeElement?.id).toBe("field");
    (document.activeElement as HTMLElement).blur();
    key(document.body, "Escape");
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("pulls focus back in when it moves to the page behind", () => {
    openHost();
    act(() => document.getElementById("opener")!.focus());
    expect(document.activeElement?.id).toBe("field");
  });

  it("a press and release on the scrim dismisses it; a drag from the panel does not", () => {
    const onDismiss = vi.fn();
    const { panel } = openHost(<Host onDismiss={onDismiss} />);
    const layer = panel.parentElement!;
    fireEvent.pointerDown(panel);
    fireEvent.click(layer);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerDown(layer);
    fireEvent.click(layer);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("scrimCloses=false and dismissible=false keep it open", () => {
    const onDismiss = vi.fn();
    render(
      <SoneDialog scrimCloses={false} onDismiss={onDismiss}>
        <SoneDialogTitle>T</SoneDialogTitle>
      </SoneDialog>,
    );
    const layer = document.querySelector("sone-dialog")!;
    fireEvent.pointerDown(layer);
    fireEvent.click(layer);
    expect(onDismiss).not.toHaveBeenCalled();
    key(document.querySelector('[role="dialog"]')!, "Escape");
    expect(onDismiss).toHaveBeenCalledTimes(1);

    const locked = vi.fn();
    render(
      <SoneDialog dismissible={false} onDismiss={locked} ariaLabel="Locked" />,
    );
    const panel = screen.getByRole("dialog", { name: "Locked" });
    expect(panel.querySelector(".dialog-close")).toBeNull();
    key(panel, "Escape");
    expect(locked).not.toHaveBeenCalled();
  });

  it("is open while rendered (defaultOpen), closes itself and reports onOpenChange", () => {
    const onOpenChange = vi.fn();
    render(
      <SoneDialog onOpenChange={onOpenChange} closeLabel="Shut">
        <SoneDialogTitle>T</SoneDialogTitle>
      </SoneDialog>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Shut" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.querySelector("sone-dialog")).toBeNull();
  });

  it("only the topmost overlay answers keys on the document", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <SoneDialog onDismiss={outer} ariaLabel="Outer" />
        <SoneDialog onDismiss={inner} ariaLabel="Inner" />
      </>,
    );
    (document.activeElement as HTMLElement).blur();
    key(document.body, "Escape");
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
    key(document.body, "Escape");
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it("Escape in a nested dialog closes only that one", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <SoneDialog onDismiss={outer} ariaLabel="Outer">
        <SoneDialog onDismiss={inner} ariaLabel="Inner" />
      </SoneDialog>,
    );
    key(screen.getByRole("dialog", { name: "Inner" }), "Escape");
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("names the close button with the provided messages", () => {
    render(
      <SoneMessagesProvider messages={{ close: "Zamknij" }}>
        <SoneDialog />
      </SoneMessagesProvider>,
    );
    expect(
      document.querySelector(".dialog-close")?.getAttribute("aria-label"),
    ).toBe("Zamknij");
  });

  it("drops a title that unmounts from aria-labelledby", () => {
    function Toggle() {
      const [show, setShow] = useState(true);
      return (
        <SoneDialog>
          {show ? <SoneDialogTitle id="t">T</SoneDialogTitle> : null}
          <button type="button" onClick={() => setShow(false)}>
            hide
          </button>
        </SoneDialog>
      );
    }
    render(<Toggle />);
    const panel = screen.getByRole("dialog");
    expect(panel.getAttribute("aria-labelledby")).toBe("t");
    fireEvent.click(screen.getByText("hide"));
    expect(panel.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("renders in place with inline, and media is decorative", () => {
    const { container } = render(
      <SoneDialog inline className="mine" data-testid="d">
        <SoneDialogMedia tone="destructive" />
      </SoneDialog>,
    );
    const host = container.querySelector("sone-dialog")!;
    expect(host.className).toBe("dialog-overlay mine");
    expect(host.getAttribute("data-testid")).toBe("d");
    const media = host.querySelector('[data-slot="dialog-media"]')!;
    expect(media.getAttribute("aria-hidden")).toBe("true");
    expect(media.getAttribute("data-tone")).toBe("destructive");
  });

  it("renders nothing on the server, then mounts the portal on hydration", async () => {
    const tree = (
      <div>
        <p>page</p>
        <SoneDialog>
          <SoneDialogTitle>Hello</SoneDialogTitle>
        </SoneDialog>
      </div>
    );
    const html = renderToString(tree);
    expect(html).not.toContain("sone-dialog");
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.innerHTML = html;
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await act(async () => {
      hydrateRoot(el, tree);
    });
    expect(error).not.toHaveBeenCalled();
    const panel = document.querySelector('[role="dialog"]')!;
    expect(panel.closest("sone-dialog")?.parentElement).toBe(document.body);
    expect(
      document.getElementById(panel.getAttribute("aria-labelledby")!)
        ?.textContent,
    ).toBe("Hello");
  });

  it("server-renders an inline dialog in place", () => {
    const html = renderToString(
      <SoneDialog inline>
        <SoneDialogTitle>Hi</SoneDialogTitle>
      </SoneDialog>,
    );
    expect(html).toMatch(
      /<sone-dialog class="dialog-overlay" data-slot="dialog-overlay">/,
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('data-slot="dialog-title"');
  });
});

describe("SoneAlertDialog", () => {
  it("is an alertdialog without a corner close that the scrim cannot dismiss", () => {
    const onDismiss = vi.fn();
    render(
      <SoneAlertDialog onDismiss={onDismiss}>
        <SoneDialogTitle>Delete?</SoneDialogTitle>
      </SoneAlertDialog>,
    );
    const panel = screen.getByRole("alertdialog", { name: "Delete?" });
    expect(panel.getAttribute("data-slot")).toBe("alert-dialog-content");
    expect(panel.getAttribute("data-size")).toBe("md");
    expect(panel.parentElement!.tagName).toBe("SONE-ALERT-DIALOG");
    expect(panel.parentElement!.getAttribute("data-slot")).toBe(
      "alert-dialog-overlay",
    );
    expect(panel.querySelector(".dialog-close")).toBeNull();
    fireEvent.pointerDown(panel.parentElement!);
    fireEvent.click(panel.parentElement!);
    expect(onDismiss).not.toHaveBeenCalled();
    key(panel, "Escape");
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("SoneSheet", () => {
  it("slides from a side, with the sheet close slot", () => {
    render(
      <SoneSheet side="left" size="lg">
        <SoneSheetTitle>Edit profile</SoneSheetTitle>
      </SoneSheet>,
    );
    const panel = screen.getByRole("dialog", { name: "Edit profile" });
    expect(panel.className).toBe("sheet-content");
    expect(panel.getAttribute("data-side")).toBe("left");
    expect(panel.getAttribute("data-size")).toBe("lg");
    expect(panel.parentElement!.tagName).toBe("SONE-SHEET");
    expect(panel.parentElement!.className).toBe("sheet-overlay");
    expect(
      panel.querySelector(".dialog-close")?.getAttribute("data-slot"),
    ).toBe("sheet-close");
    expect(renderToString(<SoneSheet />)).toBe("");
  });
});

describe("SoneConfirm", () => {
  const confirm = (props: Record<string, unknown> = {}, extra?: ReactNode) =>
    render(
      <SoneConfirm variant="destructive" confirmLabel="Delete" {...props}>
        <SoneConfirmTitle>Delete “Weekly sync”?</SoneConfirmTitle>
        <SoneConfirmDescription>It moves to the trash.</SoneConfirmDescription>
        {extra}
      </SoneConfirm>,
    );
  const root = () => document.querySelector('[data-slot="confirm"]')!;

  it("is an alertdialog named and described by its parts, Cancel then Confirm", () => {
    confirm();
    expect(root().getAttribute("role")).toBe("alertdialog");
    expect(root().classList).toContain("confirm");
    const title = document.querySelector('[data-slot="confirm-title"]')!;
    const desc = document.querySelector('[data-slot="confirm-description"]')!;
    expect(root().getAttribute("aria-labelledby")).toBe(title.id);
    expect(root().getAttribute("aria-describedby")).toBe(desc.id);
    const buttons = screen.getAllByRole("button");
    expect(buttons.map((b) => b.textContent)).toEqual(["Cancel", "Delete"]);
    expect(buttons[0]!.classList).toContain("confirm-cancel");
    expect(buttons[1]!.getAttribute("data-variant")).toBe("destructive");
  });

  it("focuses Confirm on mount unless autoFocus is off", () => {
    const { unmount } = confirm();
    expect(document.activeElement).toBe(
      document.querySelector(".confirm-action"),
    );
    unmount();
    confirm({ autoFocus: false });
    expect(document.activeElement).toBe(document.body);
  });

  it("a ref gets focus()", () => {
    const ref = createRef<SoneConfirmHandle>();
    render(
      <SoneConfirm ref={ref} autoFocus={false}>
        <SoneConfirmTitle>Q?</SoneConfirmTitle>
      </SoneConfirm>,
    );
    act(() => ref.current!.focus());
    expect(document.activeElement).toBe(
      document.querySelector(".confirm-action"),
    );
  });

  it("Escape cancels without bubbling to an enclosing dialog", () => {
    const outer = vi.fn();
    const cancels = vi.fn();
    render(
      <div onKeyDown={outer}>
        <SoneConfirm onCancel={cancels}>
          <SoneConfirmTitle>Leave?</SoneConfirmTitle>
        </SoneConfirm>
      </div>,
    );
    key(root(), "Escape");
    expect(cancels).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();

    const dismiss = vi.fn();
    render(
      <SoneDialog onDismiss={dismiss} ariaLabel="Outer">
        <SoneConfirm>
          <SoneConfirmTitle>Inner?</SoneConfirmTitle>
        </SoneConfirm>
      </SoneDialog>,
    );
    key(screen.getByRole("alertdialog", { name: "Inner?" }), "Escape");
    expect(dismiss).not.toHaveBeenCalled();
  });

  it("while busy: aria-disabled buttons, busy label, no events", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    confirm({ busy: true, busyLabel: "Deleting…", onConfirm, onCancel });
    const [cancel, action] = screen.getAllByRole("button");
    expect(cancel!.getAttribute("aria-disabled")).toBe("true");
    expect(action!.getAttribute("aria-disabled")).toBe("true");
    expect(action!.textContent).toBe("Deleting…");
    expect(action!.querySelector("sone-spinner")).not.toBeNull();
    expect(root().getAttribute("aria-busy")).toBe("true");
    fireEvent.click(cancel!);
    fireEvent.click(action!);
    key(root(), "Escape");
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onConfirm and onCancel from the buttons", () => {
    const events: string[] = [];
    confirm({
      onConfirm: () => events.push("confirm"),
      onCancel: () => events.push("cancel"),
    });
    fireEvent.click(document.querySelector(".confirm-cancel")!);
    fireEvent.click(document.querySelector(".confirm-action")!);
    expect(events).toEqual(["cancel", "confirm"]);
  });

  it("describes by the error too, and puts the actions part at the start of the footer", () => {
    function App({ show }: { show: boolean }) {
      return (
        <SoneConfirm layout="card" size="compact">
          <SoneConfirmTitle as="h3" id="t">
            Remove the lock?
          </SoneConfirmTitle>
          <SoneConfirmDescription id="d">
            Notes are decrypted.
          </SoneConfirmDescription>
          {show ? <SoneConfirmError id="e">Cancelled.</SoneConfirmError> : null}
          <SoneConfirmActions>
            <label>Don't ask again</label>
          </SoneConfirmActions>
        </SoneConfirm>
      );
    }
    const { rerender } = render(<App show />);
    expect(root().getAttribute("aria-labelledby")).toBe("t");
    expect(root().getAttribute("aria-describedby")).toBe("d e");
    expect(document.getElementById("t")!.tagName).toBe("H3");
    expect(document.getElementById("e")!.getAttribute("role")).toBe("alert");
    const footer = document.querySelector('[data-slot="confirm-footer"]')!;
    expect(footer.firstElementChild?.getAttribute("data-slot")).toBe(
      "confirm-actions",
    );
    expect(
      screen.getAllByRole("button").map((b) => b.getAttribute("data-size")),
    ).toEqual(["xs", "xs"]);
    expect(
      document.querySelector(".confirm-cancel")!.getAttribute("data-variant"),
    ).toBe("outline");
    rerender(<App show={false} />);
    expect(root().getAttribute("aria-describedby")).toBe("d");
  });

  it("puts the actions prop in a SoneConfirmActions", () => {
    confirm({ actions: <label>Don't ask again</label> });
    const footer = document.querySelector('[data-slot="confirm-footer"]')!;
    expect(footer.firstElementChild?.getAttribute("data-slot")).toBe(
      "confirm-actions",
    );
  });

  it("links a nested part through registration", () => {
    render(
      <SoneConfirm>
        <div>
          <SoneConfirmTitle id="nested">Q?</SoneConfirmTitle>
        </div>
      </SoneConfirm>,
    );
    expect(root().getAttribute("aria-labelledby")).toBe("nested");
  });

  it("server-renders the ARIA links and keeps them on hydration", async () => {
    const tree = (
      <SoneConfirm autoFocus={false}>
        <SoneConfirmTitle>Delete?</SoneConfirmTitle>
        <SoneConfirmDescription>Gone for good.</SoneConfirmDescription>
        <SoneConfirmError>Failed.</SoneConfirmError>
      </SoneConfirm>
    );
    renderToString(tree);
    const html = renderToString(tree);
    const titleId = /data-slot="confirm-title" id="([^"]+)"/.exec(html)?.[1];
    expect(titleId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${titleId}"`);
    expect(html).toMatch(/aria-describedby="[^" ]+ [^" ]+"/);

    const el = document.createElement("div");
    document.body.appendChild(el);
    el.innerHTML = html;
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await act(async () => {
      hydrateRoot(el, tree);
    });
    expect(error).not.toHaveBeenCalled();
    expect(el.querySelector('[data-slot="confirm-title"]')?.id).toBe(titleId);
    expect(
      el
        .querySelector('[data-slot="confirm"]')
        ?.getAttribute("aria-labelledby"),
    ).toBe(titleId);
    expect(
      el
        .querySelector('[data-slot="confirm"]')
        ?.getAttribute("aria-describedby")
        ?.split(" "),
    ).toHaveLength(2);
  });

  it("translates the built-in labels", () => {
    render(
      <SoneMessagesProvider
        messages={{ confirm: "Potwierdź", cancel: "Anuluj" }}
      >
        <SoneConfirm />
      </SoneMessagesProvider>,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Anuluj",
      "Potwierdź",
    ]);
  });
});

describe("SoneMenu", () => {
  it("is a menu of menu items by default, and the role can be overridden", () => {
    render(
      <SoneMenu>
        <SoneMenuItem>Rename</SoneMenuItem>
        <SoneMenuItem role="option">Pick</SoneMenuItem>
      </SoneMenu>,
    );
    expect(screen.getByRole("menu").className).toBe("menu");
    const items = document.querySelectorAll(".menu-item");
    expect(items[0]!.getAttribute("role")).toBe("menuitem");
    expect(items[1]!.getAttribute("role")).toBe("option");
    render(<SoneMenu role="listbox" />);
    expect(screen.getByRole("listbox").getAttribute("data-slot")).toBe("menu");
  });

  it("checkable items and the sub trigger carry their state", () => {
    render(
      <SoneMenu>
        <SoneMenuCheckboxItem checked inset>
          Pinned
        </SoneMenuCheckboxItem>
        <SoneMenuSubTrigger open>More</SoneMenuSubTrigger>
        <SoneMenuItem variant="destructive">Trash</SoneMenuItem>
      </SoneMenu>,
    );
    const box = screen.getByRole("menuitemcheckbox");
    expect(box.getAttribute("aria-checked")).toBe("true");
    expect(box.getAttribute("data-state")).toBe("checked");
    expect(box.getAttribute("data-inset")).toBe("");
    const sub = screen.getByText("More");
    expect(sub.getAttribute("aria-haspopup")).toBe("menu");
    expect(sub.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("Trash").getAttribute("data-variant")).toBe(
      "destructive",
    );
  });

  it("places a submenu beside its anchor", () => {
    function App() {
      const [anchor, setAnchor] = useState<HTMLElement | null>(null);
      return (
        <SoneMenu>
          <SoneMenuSubTrigger ref={setAnchor}>More</SoneMenuSubTrigger>
          {anchor ? (
            <SoneMenuSub anchor={anchor}>
              <SoneMenuItem>Inner</SoneMenuItem>
            </SoneMenuSub>
          ) : null}
        </SoneMenu>
      );
    }
    render(<App />);
    const sub = document.querySelector<HTMLElement>(
      '[data-slot="menu-sub-content"]',
    )!;
    expect(sub.className).toBe("menu menu-sub");
    expect(sub.getAttribute("data-anchored")).toBe("");
    expect(sub.dataset["placed"]).toBe("");
    expect(sub.style.left).not.toBe("");
  });

  it("server-renders the parts", () => {
    const html = renderToString(
      <SoneMenu>
        <SoneMenuItem>Rename</SoneMenuItem>
      </SoneMenu>,
    );
    expect(html).toMatch(/^<div data-slot="menu" role="menu" class="menu">/);
    expect(html).toContain('role="menuitem"');
  });
});

describe("SoneCollapsible", () => {
  it("works uncontrolled and links the trigger to the content", () => {
    render(
      <SoneCollapsible>
        <SoneCollapsibleTrigger>More</SoneCollapsibleTrigger>
        <SoneCollapsibleContent>Body</SoneCollapsibleContent>
      </SoneCollapsible>,
    );
    const trigger = screen.getByRole("button");
    const content = document.querySelector(
      '[data-slot="collapsible-content"]',
    )!;
    expect(trigger.getAttribute("aria-controls")).toBe(content.id);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(content.hasAttribute("hidden")).toBe(true);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(content.hasAttribute("hidden")).toBe(false);
  });

  it("follows a controlled expanded, uses the content's own id, and honours disabled", () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <SoneCollapsible
        as="section"
        expanded
        onExpandedChange={onExpandedChange}
      >
        <SoneCollapsibleTrigger>More</SoneCollapsibleTrigger>
        <SoneCollapsibleContent as="ul" id="items">
          <li>x</li>
        </SoneCollapsibleContent>
      </SoneCollapsible>,
    );
    const trigger = screen.getByRole("button");
    expect(trigger.getAttribute("aria-controls")).toBe("items");
    expect(document.querySelector("section")!.getAttribute("data-state")).toBe(
      "open",
    );
    fireEvent.click(trigger);
    expect(onExpandedChange).toHaveBeenCalledWith(false);
    // Controlled: still open until the owner says otherwise.
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    rerender(
      <SoneCollapsible disabled>
        <SoneCollapsibleTrigger>More</SoneCollapsibleTrigger>
        <SoneCollapsibleContent>Body</SoneCollapsibleContent>
      </SoneCollapsible>,
    );
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });

  it("content needs its root", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SoneCollapsibleContent />)).toThrow(
      /needs a SoneCollapsible/,
    );
  });
});

describe("SoneCollapsibleSection", () => {
  it("a header button with title, subtitle and count that toggles open", () => {
    function App() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output>{String(open)}</output>
          <SoneCollapsibleSection
            title="Action items"
            subtitle="Last 3 meetings"
            count={3}
            open={open}
            onOpenChange={setOpen}
            actions={
              <button type="button" className="copy">
                Copy
              </button>
            }
          >
            <p>Body</p>
          </SoneCollapsibleSection>
        </>
      );
    }
    render(<App />);
    const host = document.querySelector("sone-collapsible-section")!;
    expect(host.hasAttribute("title")).toBe(false);
    expect(host.getAttribute("data-state")).toBe("closed");
    const trigger = document.querySelector<HTMLElement>(
      "button.collapsible-trigger",
    )!;
    expect(trigger.textContent).toContain("Action items");
    expect(trigger.textContent).toContain("Last 3 meetings");
    expect(
      trigger.querySelector('[data-slot="collapsible-section-count"]')!
        .textContent,
    ).toBe("3");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const body = document.querySelector(
      '[data-slot="collapsible-section-content"]',
    )!;
    expect(trigger.getAttribute("aria-controls")).toBe(body.id);
    expect(body.hasAttribute("hidden")).toBe(true);
    // The actions sit outside the toggle button.
    expect(trigger.querySelector(".copy")).toBeNull();
    expect(document.querySelector(".header > .actions > .copy")).not.toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole("status").textContent).toBe("true");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(host.getAttribute("data-state")).toBe("open");
    expect(body.hasAttribute("hidden")).toBe(false);
  });

  it("keeps aria-controls on hydration", async () => {
    const tree = (
      <SoneCollapsibleSection title="Items" defaultOpen>
        Body
      </SoneCollapsibleSection>
    );
    renderToString(tree);
    const html = renderToString(tree);
    expect(html).toContain("<sone-collapsible-section");
    const el = document.createElement("div");
    document.body.appendChild(el);
    el.innerHTML = html;
    const error = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await act(async () => {
      hydrateRoot(el, tree);
    });
    expect(error).not.toHaveBeenCalled();
    const trigger = el.querySelector("button.collapsible-trigger")!;
    expect(
      document.getElementById(trigger.getAttribute("aria-controls")!),
    ).not.toBeNull();
  });
});

describe("SoneDisclosure", () => {
  it("a summary trigger that shows and hides a labelled region", () => {
    const onOpenChange = vi.fn();
    render(
      <SoneDisclosure summary="Advanced" onOpenChange={onOpenChange}>
        <p>Panel</p>
      </SoneDisclosure>,
    );
    const trigger = screen.getByRole("button", { name: "Advanced" });
    expect(trigger.getAttribute("data-slot")).toBe("accordion-trigger");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const panel = document.getElementById(
      trigger.getAttribute("aria-controls")!,
    )!;
    expect(panel.hidden).toBe(true);
    expect(panel.getAttribute("aria-labelledby")).toBe(trigger.id);
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
    expect(screen.getByRole("region", { name: "Advanced" })).toBe(panel);
  });

  it("panelLabel names the region; disabled does not toggle", () => {
    render(
      <SoneDisclosure
        summary="Sync"
        panelLabel="Sync settings"
        disabled
        defaultOpen
      >
        x
      </SoneDisclosure>,
    );
    const trigger = screen.getByRole("button", { name: "Sync" });
    expect(trigger).toHaveProperty("disabled", true);
    const region = screen.getByRole("region", { name: "Sync settings" });
    expect(region.hasAttribute("aria-labelledby")).toBe(false);
    expect(
      document
        .querySelector('[data-slot="accordion-item"]')!
        .getAttribute("data-disabled"),
    ).toBe("");
  });

  it("server-renders the host and the accordion slots", () => {
    const html = renderToString(<SoneDisclosure summary="S">P</SoneDisclosure>);
    expect(html).toMatch(
      /^<sone-disclosure><div class="disc-wrap" data-slot="accordion-item"/,
    );
    expect(html).toContain('hidden=""');
  });
});
