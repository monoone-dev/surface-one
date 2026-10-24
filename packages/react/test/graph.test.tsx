import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneGraph,
  SoneGraphCard,
  SoneGraphControls,
  SoneGraphLegend,
  runGraphLayout,
  type SoneGraphData,
  type SoneGraphHandle,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const DATA: SoneGraphData = {
  nodes: [
    { id: "ada", label: "Ada", tone: "person" },
    { id: "kick", label: "Kickoff", tone: "meeting", shape: "square" },
    { id: "spec", label: "Spec" },
    { id: "ada", label: "Duplicate" },
  ],
  edges: [
    { source: "ada", target: "kick", weight: 2 },
    { source: "kick", target: "spec" },
    { source: "ada", target: "nobody" },
  ],
};

const flush = () => act(async () => {});

describe("SoneGraph", () => {
  it("renders the frame, the named canvas and the controls on the server, pending its layout", () => {
    const out = html(
      <SoneGraph data={DATA}>
        <SoneGraphLegend>People · Meetings</SoneGraphLegend>
      </SoneGraph>,
    );
    expect(out).toMatch(
      /^<sone-graph data-slot="graph" data-state="pending" data-layout="force"><div class="g-frame" data-slot="graph-frame">/,
    );
    expect(out).toMatch(
      /<canvas data-slot="graph-canvas" tabindex="0" class="g-canvas" role="application" aria-roledescription="network diagram" aria-label="Graph of 3 nodes · 2 links" aria-describedby="sone-graph-[^"]+-hint" style="cursor:grab"><\/canvas>/,
    );
    expect(out).toContain(
      '<sone-graph-controls data-slot="graph-controls" role="toolbar" aria-label="Graph controls"><div class="gc-panel gc-info" data-slot="graph-controls-info"><span data-slot="graph-legend">People · Meetings</span><span data-slot="graph-summary">3 nodes · 2 links</span></div>',
    );
    expect(out).toMatch(
      /aria-label="Show nodes as a list" aria-pressed="false"/,
    );
    expect(out).toMatch(/aria-label="Fit graph to view"[^>]*>Fit<\/button>/);
    expect(out).toContain(
      '<span class="gc-zoom" aria-hidden="true">100%</span>',
    );
    const hint = /aria-describedby="([^"]+)"/.exec(out)?.[1];
    expect(out).toContain(`<span class="sr-only" id="${hint}">Arrow keys move`);
    expect(out).toContain('<span class="sr-only" aria-live="polite"></span>');
    expect(out).not.toContain("g-list");
  });

  it("names an empty graph and hides the list toggle and the summary on request", () => {
    const out = html(<SoneGraph listToggle={false} summary="" />);
    expect(out).toContain('data-state="empty"');
    expect(out).toContain('aria-label="Graph — empty."');
    expect(out).not.toContain("aria-pressed");
    expect(out).not.toContain("graph-summary");
  });

  it("lays out once mounted, then picks, announces, pins a card and opens with the keyboard", async () => {
    const onSelectedChange = vi.fn();
    const onNodeOpen = vi.fn();
    const { container } = render(
      <SoneGraph
        data={DATA}
        layout="layers"
        onSelectedChange={onSelectedChange}
        onNodeOpen={onNodeOpen}
      />,
    );
    await flush();
    const host = container.querySelector("sone-graph")!;
    expect(host.getAttribute("data-state")).toBe("ready");
    expect(host.getAttribute("data-layout")).toBe("layers");

    const canvas = container.querySelector("canvas")!;
    fireEvent.keyDown(canvas, { key: "Enter" });
    const picked = onSelectedChange.mock.calls[0][0] as string;
    expect(["ada", "kick", "spec"]).toContain(picked);
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live.textContent).toMatch(/^(Ada|Kickoff|Spec) — \d links?\.$/);
    const card = container.querySelector(
      'sone-graph-card[data-state="pinned"]',
    )!;
    expect(card).not.toBeNull();
    expect(
      card.querySelector('[data-slot="graph-card-meta"]')?.textContent,
    ).toMatch(/links?$/);

    fireEvent.keyDown(canvas, { key: "Enter" });
    expect(onNodeOpen).toHaveBeenLastCalledWith(picked);
    fireEvent.click(card.querySelector("button")!);
    expect(onNodeOpen).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(canvas, { key: "Escape" });
    expect(onSelectedChange).toHaveBeenLastCalledWith(null);
    expect(live.textContent).toBe("Selection cleared.");
    expect(container.querySelector("sone-graph-card")).toBeNull();
  });

  it("shows the node list, selects from it and opens the selected node", () => {
    const onShowListChange = vi.fn();
    const onSelectedChange = vi.fn();
    const onNodeOpen = vi.fn();
    const { container } = render(
      <SoneGraph
        data={DATA}
        describe={(_n, info) => `${info.degree}°`}
        onShowListChange={onShowListChange}
        onSelectedChange={onSelectedChange}
        onNodeOpen={onNodeOpen}
      />,
    );
    fireEvent.click(
      container.querySelector('[aria-label="Show nodes as a list"]')!,
    );
    expect(onShowListChange).toHaveBeenCalledWith(true);
    const list = container.querySelector('ul[data-slot="graph-list"]')!;
    expect(list.getAttribute("aria-label")).toBe("Show nodes as a list");
    const nodes = [...list.querySelectorAll(".g-list-node")];
    expect(
      nodes.map((b) => b.querySelector(".g-list-label")?.textContent),
    ).toEqual(["Ada", "Kickoff", "Spec"]);
    expect(nodes[1].querySelector(".g-list-meta")?.textContent).toBe("2°");
    expect(nodes[1].querySelector(".g-swatch")?.className).toBe(
      "g-swatch is-square",
    );
    expect(
      nodes[1].querySelector(".g-swatch")?.getAttribute("style"),
    ).toContain("var(--graph-meeting)");

    fireEvent.click(nodes[1]);
    expect(onSelectedChange).toHaveBeenCalledWith("kick");
    expect(nodes[1].getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(
      "Kickoff — 2°.",
    );
    const open = container.querySelector(".g-list-item .g-list-node + button")!;
    expect(open.textContent).toBe("Open");
    fireEvent.click(open);
    expect(onNodeOpen).toHaveBeenCalledWith("kick");
    fireEvent.click(nodes[1]);
    expect(onSelectedChange).toHaveBeenLastCalledWith(null);
  });

  it("drops a layout that resolves after a newer request, and falls back when a strategy fails", async () => {
    const failing = vi.fn(() => Promise.reject(new Error("worker down")));
    const { container, rerender } = render(
      <SoneGraph data={DATA} layoutStrategy={failing} />,
    );
    const state = () =>
      container.querySelector("sone-graph")!.getAttribute("data-state");
    await flush();
    expect(failing).toHaveBeenCalledOnce();
    expect(state()).toBe("ready");

    // A result for an outdated request is dropped: it would leave the graph pending.
    let late: () => void = () => {};
    const slow = vi.fn((req: Parameters<typeof runGraphLayout>[0]) =>
      slow.mock.calls.length === 1
        ? new Promise<ReturnType<typeof runGraphLayout>>((resolve) => {
            late = () => resolve(runGraphLayout(req));
          })
        : runGraphLayout(req),
    );
    rerender(<SoneGraph data={DATA} layoutStrategy={slow} layout="clusters" />);
    expect(state()).toBe("pending");
    rerender(<SoneGraph data={DATA} layoutStrategy={slow} layout="layers" />);
    expect(state()).toBe("ready");
    late();
    await flush();
    expect(state()).toBe("ready");
  });

  it("renders the card body with renderCard and exposes zoomBy and fit", async () => {
    const ref = createRef<SoneGraphHandle>();
    const { container } = render(
      <SoneGraph
        ref={ref}
        data={DATA}
        selected="spec"
        renderCard={({ node, description, pinned }) => (
          <b>{`${node.label}: ${description} (${pinned})`}</b>
        )}
      />,
    );
    await flush();
    const card = container.querySelector("sone-graph-card")!;
    expect(card.querySelector("b")?.textContent).toBe("Spec: 1 link (true)");
    expect(card.querySelector(".gcard-title")).toBeNull();
    expect(card.querySelector("button")?.textContent).toBe("Open");
    expect(() => {
      ref.current?.zoomBy(1.25);
      ref.current?.fit();
    }).not.toThrow();
  });
});

describe("SoneGraphCard", () => {
  const anchor = (y: number) => ({
    key: "a",
    hovered: true,
    x: 40,
    y,
    r: 6,
    width: 600,
    height: 400,
  });

  it("floats above the node, kept inside the frame, or below it near the top edge", () => {
    const { container, rerender } = render(
      <SoneGraphCard heading="Ada" meta="2 links" anchor={anchor(200)} />,
    );
    const card = () => container.querySelector("sone-graph-card")!;
    expect(card().getAttribute("data-state")).toBe("floating");
    expect(card().getAttribute("style")).toBe("left: 132px; top: 184px;");
    expect(card().getAttribute("class")).toBeNull();
    expect(card().getAttribute("data-node-x")).toBe("40");
    expect(card().querySelector("button")).toBeNull();

    rerender(<SoneGraphCard heading="Ada" anchor={anchor(50)} />);
    expect(card().getAttribute("class")).toBe("is-below");
    expect(card().getAttribute("style")).toBe("left: 132px; top: 66px;");
    expect(card().querySelector(".gcard-meta")).toBeNull();
  });

  it("docks when pinned and offers the open action", () => {
    const onOpen = vi.fn();
    const { container } = render(
      <SoneGraphCard
        heading="Ada"
        meta="2 links"
        tone="var(--graph-person)"
        square
        pinned
        openLabel="Open"
        anchor={anchor(200)}
        onOpen={onOpen}
      />,
    );
    const card = container.querySelector("sone-graph-card")!;
    expect(card.getAttribute("data-state")).toBe("pinned");
    expect(card.getAttribute("style")).toBeNull();
    expect(card.querySelector(".gcard-swatch")?.className).toBe(
      "gcard-swatch is-square",
    );
    fireEvent.click(card.querySelector("button")!);
    expect(onOpen).toHaveBeenCalledOnce();
  });
});

describe("SoneGraphControls", () => {
  it("is one tab stop whose arrow keys move between the buttons", () => {
    const on = {
      onListChange: vi.fn(),
      onFit: vi.fn(),
      onZoomOut: vi.fn(),
      onZoomIn: vi.fn(),
    };
    const { container } = render(
      <SoneGraphControls label="Graph controls" list zoomPct={125} {...on} />,
    );
    const buttons = () => [
      ...container.querySelectorAll<HTMLButtonElement>(
        "[data-slot=graph-controls-actions] button",
      ),
    ];
    expect(buttons().map((b) => b.tabIndex)).toEqual([0, -1, -1, -1]);
    expect(buttons()[0].getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelector(".gc-zoom")?.textContent).toBe("125%");

    act(() => buttons()[0].focus());
    fireEvent.keyDown(buttons()[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons()[1]);
    expect(buttons().map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1]);
    fireEvent.keyDown(buttons()[1], { key: "End" });
    expect(document.activeElement).toBe(buttons()[3]);

    buttons().forEach((b) => fireEvent.click(b));
    expect(on.onListChange).toHaveBeenCalledWith(false);
    expect(on.onFit).toHaveBeenCalledOnce();
    expect(on.onZoomOut).toHaveBeenCalledOnce();
    expect(on.onZoomIn).toHaveBeenCalledOnce();
  });
});
