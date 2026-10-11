import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneDock,
  SoneDockGroup,
  SoneDockItem,
  SoneDockSeparator,
} from "../src/components/dock";

function Tools({ select }: { select?: () => void }) {
  return (
    <SoneDock position="left">
      <SoneDockItem
        label="Select"
        shortcut="V"
        active={false}
        onClick={select}
      />
      <SoneDockItem label="Hand" active />
      <SoneDockSeparator />
      <SoneDockItem label="Undo" disabled />
      <SoneDockItem label="Redo" />
    </SoneDock>
  );
}

const items = () => screen.getAllByRole("button");
const tabindexes = () => items().map((b) => b.getAttribute("tabindex"));

describe("SoneDock", () => {
  it("is a toolbar with one Tab stop that the arrow keys move", () => {
    const select = vi.fn();
    render(<Tools select={select} />);
    const dock = document.querySelector("sone-dock")!;
    expect(dock.getAttribute("role")).toBe("toolbar");
    expect(dock.getAttribute("aria-label")).toBe("Tools");
    expect(dock.getAttribute("aria-orientation")).toBe("vertical");
    expect(dock.getAttribute("data-floating")).toBe("");
    expect(
      document
        .querySelector('[data-slot="dock-separator"]')!
        .getAttribute("aria-orientation"),
    ).toBe("horizontal");
    expect(items()[0]!.getAttribute("aria-pressed")).toBe("false");
    expect(items()[0]!.getAttribute("aria-keyshortcuts")).toBe("V");
    expect(items()[0]!.getAttribute("data-tooltip")).toBe("Select (V)");
    expect(items()[0]!.className).toBe("dock-item");
    expect(items()[3]!.getAttribute("aria-pressed")).toBeNull();
    // The active tool holds the Tab stop.
    expect(tabindexes()).toEqual(["-1", "0", "-1", "-1"]);

    act(() => items()[1]!.focus());
    fireEvent.keyDown(items()[1]!, { key: "ArrowDown" });
    // Skips the disabled Undo.
    expect(document.activeElement).toBe(items()[3]);
    expect(tabindexes()).toEqual(["-1", "-1", "-1", "0"]);
    fireEvent.keyDown(items()[3]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(items()[0]);
    fireEvent.keyDown(items()[0]!, { key: "End" });
    expect(document.activeElement).toBe(items()[3]);
    fireEvent.keyDown(items()[3]!, { key: "Home" });
    expect(document.activeElement).toBe(items()[0]);
    fireEvent.keyDown(items()[0]!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(items()[3]);

    fireEvent.click(items()[0]!);
    expect(select).toHaveBeenCalledTimes(1);
  });

  it("follows the active tool and the position", () => {
    function Demo() {
      const [tool, setTool] = useState("a");
      const [top, setTop] = useState(false);
      return (
        <>
          <SoneDock
            position={top ? "top" : "bottom"}
            aria-label="Drawing tools"
          >
            {["a", "b"].map((id) => (
              <SoneDockItem
                key={id}
                label={id}
                active={tool === id}
                onClick={() => setTool(id)}
              />
            ))}
          </SoneDock>
          <input type="checkbox" onChange={() => setTop(true)} />
        </>
      );
    }
    render(<Demo />);
    const dock = document.querySelector("sone-dock")!;
    expect(dock.getAttribute("aria-label")).toBe("Drawing tools");
    expect(dock.getAttribute("aria-orientation")).toBe("horizontal");
    expect(dock.getAttribute("data-position")).toBe("bottom");
    const [a, b] = screen.getAllByRole("button");
    fireEvent.click(b!);
    expect(a!.getAttribute("aria-pressed")).toBe("false");
    expect(b!.getAttribute("aria-pressed")).toBe("true");
    expect(b!.getAttribute("data-active")).toBe("");
    expect([a, b].map((x) => x!.getAttribute("tabindex"))).toEqual(["-1", "0"]);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(dock.getAttribute("data-position")).toBe("top");
  });

  it("shows the label and shortcut as a tooltip, towards the canvas", () => {
    vi.useFakeTimers();
    render(<Tools />);
    fireEvent.mouseEnter(items()[0]!);
    act(() => vi.advanceTimersByTime(1000));
    const bubble = document.querySelector(".sone-tooltip");
    expect(bubble?.textContent).toBe("Select (V)");
    expect(bubble?.getAttribute("data-side")).toBe("right");
    vi.useRealTimers();
  });

  it("renders on the server", () => {
    const html = renderToString(
      <SoneDock>
        <SoneDockGroup label="Shapes">
          <SoneDockItem label="Undo" />
        </SoneDockGroup>
        <SoneDockSeparator />
      </SoneDock>,
    );
    expect(html).toContain(
      '<sone-dock data-slot="dock" role="toolbar" aria-label="Tools"',
    );
    expect(html).toContain('data-position="bottom"');
    expect(html).toContain(
      '<div data-slot="dock-group" role="group" aria-label="Shapes" class="dock-group">',
    );
    expect(html).toContain('class="dock-item"');
    expect(html).toContain('data-slot="dock-item"');
    expect(html).toContain('aria-label="Undo"');
    expect(html).toContain('class="dock-separator"');
    expect(html).toContain('aria-orientation="vertical"');
  });
});
