import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneResizableGroup,
  SoneResizableHandle,
  SoneResizablePanel,
} from "../src/components/resizable";

function Demo({ storage }: { storage?: Storage }) {
  const [sizes, setSizes] = useState<readonly number[]>([]);
  return (
    <>
      <SoneResizableGroup
        sizes={sizes}
        onSizesChange={setSizes}
        autoSaveId={storage ? "mail" : null}
        storage={storage ?? null}
      >
        <SoneResizablePanel id="nav" defaultSize={25} minSize={10} collapsible>
          Nav
        </SoneResizablePanel>
        <SoneResizableHandle withHandle />
        <SoneResizablePanel minSize={20}>Content</SoneResizablePanel>
      </SoneResizableGroup>
      <output>{sizes.join(",")}</output>
    </>
  );
}

function memory(): Storage {
  const items = new Map<string, string>();
  return {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => void items.set(k, v),
  } as Storage;
}

describe("SoneResizableGroup", () => {
  it("renders the panels and the splitter like Angular on the server", () => {
    const out = renderToString(<Demo />);
    expect(out).toContain(
      '<sone-resizable-group class="resizable-group" data-slot="resizable-group" data-direction="horizontal">',
    );
    expect(out).toContain('style="flex:25 1 0px"');
    expect(out).toContain('role="separator"');
    expect(out).toContain('aria-label="Resize panels"');
    expect(out).toContain(
      '<div class="resizable-grip" data-slot="resizable-grip"></div>',
    );
  });

  it("is a window splitter that moves with the keys and saves the sizes", () => {
    const storage = memory();
    const { container } = render(<Demo storage={storage} />);
    const $ = (s: string) => container.querySelector(s) as HTMLElement;
    const handle = $('[data-slot="resizable-handle"]');
    const panels = container.querySelectorAll<HTMLElement>(
      '[data-slot="resizable-panel"]',
    );
    expect(panels[1].style.flex).toBe("75 1 0px");
    expect(handle.getAttribute("aria-valuenow")).toBe("25");
    expect(handle.getAttribute("aria-valuemin")).toBe("10");
    expect(handle.getAttribute("aria-controls")).toBe("nav");
    expect(handle.getAttribute("aria-orientation")).toBe("vertical");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect($("output").textContent).toBe("35,65");
    expect(storage.getItem("sone-resizable:mail")).toBe("[35,65]");
    fireEvent.keyDown(handle, { key: "Enter" });
    expect($("output").textContent).toBe("0,100");
    expect(panels[0].hasAttribute("data-collapsed")).toBe(true);
    fireEvent.keyDown(handle, { key: "Enter" });
    expect($("output").textContent).toBe("35,65");
  });

  it("reads stored sizes back", () => {
    const storage = memory();
    storage.setItem("sone-resizable:mail", "[60,40]");
    const { container } = render(<Demo storage={storage} />);
    expect(container.querySelector("output")?.textContent).toBe("60,40");
  });

  it("follows a pointer drag", () => {
    const { container } = render(<Demo />);
    const group = container.querySelector(
      "sone-resizable-group",
    ) as HTMLElement;
    vi.spyOn(group, "getBoundingClientRect").mockReturnValue({
      width: 400,
      height: 200,
    } as DOMRect);
    const handle = container.querySelector(
      '[data-slot="resizable-handle"]',
    ) as HTMLElement;
    act(() => {
      fireEvent.pointerDown(handle, {
        button: 0,
        isPrimary: true,
        pointerId: 1,
        clientX: 100,
      });
    });
    expect(group.hasAttribute("data-dragging")).toBe(true);
    act(() => {
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 140 });
    });
    expect(container.querySelector("output")?.textContent).toBe("35,65");
    act(() => {
      fireEvent.pointerUp(handle, { pointerId: 1, clientX: 140 });
    });
    expect(group.hasAttribute("data-dragging")).toBe(false);
  });
});
