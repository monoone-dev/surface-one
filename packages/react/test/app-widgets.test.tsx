import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneSecretField } from "../src/components/secret-field";
import {
  SoneTagInput,
  type SoneTagRejection,
} from "../src/components/tag-input";
import { SoneToaster, type SoneToast } from "../src/components/toaster";
import { SoneMessagesProvider } from "../src/context/messages";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const TOASTS: SoneToast[] = [
  { id: 1, kind: "success", message: "Saved." },
  {
    id: 2,
    kind: "danger",
    message: "Failed.",
    action: { label: "Retry" },
    secondaryAction: { label: "Details" },
  },
];

describe("SoneToaster", () => {
  it("renders the Angular markup on the server, nothing inside while empty", () => {
    expect(html(<SoneToaster toasts={[]} />)).toBe(
      '<sone-toaster data-slot="toaster"></sone-toaster>',
    );
    const out = html(<SoneToaster toasts={TOASTS} />);
    expect(out).toContain(
      '<div class="toast-viewport" aria-live="polite" aria-atomic="false">',
    );
    expect(out).toContain(
      '<div class="toast is-success" data-slot="toast" data-kind="success" role="status">',
    );
    expect(out).toContain('aria-label="Dismiss notification"');
  });

  it("calls onDismiss, onAction and onSecondaryAction with the toast id", () => {
    const seen: string[] = [];
    const { container } = render(
      <SoneToaster
        toasts={TOASTS}
        onDismiss={(id) => seen.push(`dismiss ${id}`)}
        onAction={(id) => seen.push(`action ${id}`)}
        onSecondaryAction={(id) => seen.push(`secondary ${id}`)}
      />,
    );
    const buttons = [
      ...container
        .querySelectorAll('[data-slot="toast"]')[1]!
        .querySelectorAll("button"),
    ];
    expect(buttons.map((b) => b.textContent!.trim())).toEqual([
      "Details",
      "Retry",
      "",
    ]);
    expect(buttons[1]!.className).toBe("btn toast-action");
    for (const b of buttons) fireEvent.click(b);
    expect(seen).toEqual(["secondary 2", "action 2", "dismiss 2"]);
  });
});

describe("SoneSecretField", () => {
  it("shows the status badge, hides it while unknown and translates", () => {
    const out = html(<SoneSecretField hasKey clearable />);
    expect(out).toContain(
      '<sone-secret-field data-slot="secret-field" data-state="set">',
    );
    expect(out).toContain('data-slot="secret-field-status"');
    expect(out).toContain("Key set ✓");
    expect(out).toContain(">Clear<");
    const unknown = html(<SoneSecretField />);
    expect(unknown).toContain('data-state="unknown"');
    expect(unknown).not.toContain("secret-field-status");
    const pl = html(
      <SoneMessagesProvider messages={{ secretUnset: "Nie ustawiono" }}>
        <SoneSecretField hasKey={false} />
      </SoneMessagesProvider>,
    );
    expect(pl).toContain("Nie ustawiono");
  });

  it("saves the draft and empties the field once busy settles without an error", () => {
    const saved: string[] = [];
    function Demo() {
      const [busy, setBusy] = useState(false);
      return (
        <>
          <SoneSecretField
            hasKey={false}
            busy={busy}
            onSave={(v) => {
              saved.push(v);
              setBusy(true);
            }}
          />
          <button type="button" onClick={() => setBusy(false)}>
            settle
          </button>
        </>
      );
    }
    const { container } = render(<Demo />);
    const input = container.querySelector("input")!;
    expect(input.type).toBe("password");
    expect(input.getAttribute("aria-label")).toBe("Status");
    const save = container.querySelector("sone-secret-field button")!;
    expect(save.hasAttribute("disabled")).toBe(true);
    fireEvent.change(input, { target: { value: "sk-123" } });
    expect(save.hasAttribute("disabled")).toBe(false);
    fireEvent.click(save);
    expect(saved).toEqual(["sk-123"]);
    expect(save.textContent).toBe("Saving…");
    expect(input.value).toBe("sk-123");
    fireEvent.click(screen.getByText("settle"));
    expect(input.value).toBe("");
  });

  it("keeps the draft when the save fails and links the error", () => {
    const seen: string[] = [];
    const { container } = render(
      <SoneSecretField
        hasKey={false}
        error="Refused."
        onSave={(v) => seen.push(v)}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "sk-1" } });
    fireEvent.click(container.querySelector("button")!);
    expect(seen).toEqual(["sk-1"]);
    expect(input.value).toBe("sk-1");
    const error = container.querySelector('[data-slot="field-error"]')!;
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
  });
});

describe("SoneTagInput", () => {
  it("renders the Angular markup on the server", () => {
    const out = html(
      <SoneTagInput
        defaultValue={["a", "b", "c"]}
        maxVisible={2}
        suggestions={["x"]}
      />,
    );
    expect(out).toContain(
      '<ul class="tag-input-list" data-slot="tag-input-list" aria-label="Tags">',
    );
    expect(out).toContain(
      '<li data-slot="badge" data-variant="secondary" class="badge tag-input-tag">',
    );
    expect(out).toContain('aria-label="Remove a"');
    expect(out).toContain(
      'aria-expanded="false" class="badge">+1 more</button>',
    );
    expect(out).toContain('aria-label="Add tag"');
    expect(out).toMatch(/list="sone-tag-input-list-[^"]+"/);
  });

  it("adds on Enter and comma, refuses duplicates, invalid and over-max tags", () => {
    const rejected: SoneTagRejection[] = [];
    const added: string[] = [];
    let tags: string[] = [];
    function Demo() {
      const [value, setValue] = useState<string[]>(["design"]);
      tags = value;
      return (
        <SoneTagInput
          value={value}
          onValueChange={setValue}
          max={3}
          validate={(t) => t !== "bad"}
          onRejected={(r) => rejected.push(r)}
          onAdded={(t) => added.push(t)}
        />
      );
    }
    const { container } = render(<Demo />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "q3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(tags).toEqual(["design", "q3"]);
    expect(input.value).toBe("");
    fireEvent.change(input, {
      target: { value: "DESIGN, bad, ops, more, ty" },
    });
    expect(tags).toEqual(["design", "q3", "ops"]);
    expect(added).toEqual(["q3", "ops"]);
    expect(rejected).toEqual([
      { tag: "DESIGN", reason: "duplicate" },
      { tag: "bad", reason: "invalid" },
      { tag: "more", reason: "max" },
    ]);
    expect(input.value).toBe("DESIGN, bad, more,  ty");
    expect(container.querySelector(".sr-only")!.textContent).toBe("Added ops");
  });

  it("removes with the chip button and Backspace, and toggles the overflow", () => {
    const removed: string[] = [];
    const seen: string[][] = [];
    const { container } = render(
      <SoneTagInput
        defaultValue={["a", "b", "c"]}
        maxVisible={1}
        onValueChange={(v) => seen.push(v)}
        onRemoved={(t) => removed.push(t)}
      />,
    );
    const more = container.querySelector('[data-slot="tag-input-more"]')!;
    expect(more.textContent).toBe("+2 more");
    fireEvent.click(more);
    expect(container.querySelectorAll(".tag-input-tag")).toHaveLength(3);
    expect(more.textContent).toBe("Show less");
    fireEvent.click(screen.getByLabelText("Remove b"));
    expect(seen).toEqual([["a", "c"]]);
    const input = container.querySelector("input")!;
    expect(document.activeElement).toBe(input);
    act(() => void fireEvent.keyDown(input, { key: "Backspace" }));
    expect(seen.at(-1)).toEqual(["a"]);
    expect(removed).toEqual(["b", "c"]);
  });

  it("has no remove buttons while disabled", () => {
    const { container } = render(
      <SoneTagInput defaultValue={["a"]} disabled invalid />,
    );
    const host = container.querySelector("sone-tag-input")!;
    expect(container.querySelector("button")).toBeNull();
    expect(host.getAttribute("data-disabled")).toBe("true");
    expect(host.getAttribute("data-invalid")).toBe("true");
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe(
      "true",
    );
  });
});
