import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneMark,
  SoneRail,
  SoneRailButton,
  SoneRailGroup,
  SoneTabStrip,
  type TabStripTab,
} from "../src/index";

const TABS: TabStripTab[] = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta", status: "busy", note: "4 min" },
  { id: "c", label: "Gamma" },
];

describe("SoneRail", () => {
  it("renders the same nav and buttons as Angular", () => {
    const out = renderToString(
      <SoneRail ariaLabel="App">
        <SoneRailGroup>
          <SoneRailButton icon="search" label="Search" current />
          <SoneRailButton icon="bell" label="Inbox" badge="busy" />
        </SoneRailGroup>
      </SoneRail>,
    );
    expect(out).toContain(
      '<sone-rail data-slot="rail"><nav class="rail" data-slot="rail-nav" aria-label="App"><div class="rail-group" data-slot="rail-group"><sone-rail-button data-slot="rail-button"><button type="button" class="rail-button" data-slot="rail-button-trigger" aria-label="Search" title="Search" aria-current="page">',
    );
    expect(out).toContain(
      '<span class="rail-badge" data-slot="rail-badge" data-badge="busy" aria-hidden="true"></span>',
    );
    expect(renderToString(<SoneRail />)).toContain('aria-label="Main"');
  });
});

describe("SoneTabStrip", () => {
  it("renders a tablist whose tabs point at their panels", () => {
    const out = renderToString(
      <SoneTabStrip
        tabs={TABS}
        active="b"
        closable
        addable
        panelIdPrefix="doc"
      />,
    );
    expect(out).toContain(
      '<div class="tab-strip-tabs" data-slot="tab-strip-list" role="tablist" aria-label="Tabs">',
    );
    expect(out).toContain(
      'id="doc-tab-b" aria-selected="true" aria-controls="doc-b" tabindex="0"',
    );
    expect(out).toContain('<span class="sr-only">, running</span>');
    expect(out).toContain('aria-label="Close Beta"');
    expect(out).toContain('aria-label="New tab"');
  });

  it("moves with the arrows, Home and End, and closes with Delete or ⌘W", () => {
    const onActiveChange = vi.fn();
    const onClose = vi.fn();
    const onAdd = vi.fn();
    const { container } = render(
      <SoneTabStrip
        tabs={TABS}
        defaultActive="a"
        onActiveChange={onActiveChange}
        closable
        addable
        onClose={onClose}
        onAdd={onAdd}
      />,
    );
    const tab = (i: number) => container.querySelectorAll('[role="tab"]')[i]!;
    fireEvent.keyDown(tab(0), { key: "ArrowLeft" });
    expect(onActiveChange).toHaveBeenLastCalledWith("c");
    expect(document.activeElement).toBe(tab(2));
    expect(tab(2).getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(tab(2), { key: "Home" });
    expect(onActiveChange).toHaveBeenLastCalledWith("a");
    fireEvent.keyDown(tab(0), { key: "End" });
    fireEvent.keyDown(tab(2), { key: "ArrowRight" });
    expect(onActiveChange).toHaveBeenLastCalledWith("a");
    fireEvent.keyDown(tab(1), { key: "Delete" });
    fireEvent.keyDown(tab(2), { key: "w", ctrlKey: true });
    expect(onClose.mock.calls).toEqual([["b"], ["c"]]);
    fireEvent.click(container.querySelector(".tab-strip-add")!);
    expect(onAdd).toHaveBeenCalledOnce();
  });
});

describe("SoneMark", () => {
  it("is a decorative gradient tile, or an image with a label", () => {
    expect(renderToString(<SoneMark icon="code" tone="iris" />)).toContain(
      '<sone-mark data-slot="mark" data-tone="iris" data-size="md" aria-hidden="true">',
    );
    const out = renderToString(<SoneMark size={36} label="GitHub" />);
    expect(out).toContain('role="img" aria-label="GitHub"');
    expect(out).toContain("--mark-size:36px");
  });
});
