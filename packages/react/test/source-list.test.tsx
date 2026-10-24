import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SoneSourceList,
  type SoneSourceListHandle,
} from "../src/components/source-list";

interface Source {
  id: string;
  title: string;
}

const SOURCES: Source[] = ["A", "B", "C", "D", "E"].map((t) => ({
  id: t.toLowerCase(),
  title: t,
}));
const byId = (s: Source): string => s.id;
const item = (s: Source) => <span>{s.title}</span>;

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

describe("SoneSourceList", () => {
  it("renders rows as a list with a label, a count and the Show all toggle", () => {
    expect(
      html(
        <SoneSourceList
          items={SOURCES}
          trackBy={byId}
          renderItem={item}
          label="Sources"
          icon={<i>*</i>}
          showCount
          limit={2}
          size="sm"
        />,
      ),
    ).toBe(
      '<sone-source-list data-slot="source-list" data-variant="row" data-size="sm" data-columns="1">' +
        '<div class="source-list" data-slot="source-list-body">' +
        '<div class="source-list-head" data-slot="source-list-header"><i>*</i>' +
        '<span class="source-list-label" data-slot="source-list-label">Sources</span>' +
        '<span data-slot="badge" data-variant="secondary" class="badge">5</span></div>' +
        '<ul class="source-list-items" data-slot="source-list-items" role="list">' +
        '<li class="source-list-item" data-slot="source-list-item"><span>A</span></li>' +
        '<li class="source-list-item" data-slot="source-list-item"><span>B</span></li></ul>' +
        '<button data-slot="button" data-variant="link" data-size="xs" type="button" aria-expanded="false" class="btn source-list-toggle">Show all (5)</button>' +
        "</div></sone-source-list>",
    );
  });

  it("renders chips without list items and toggles +N more / Show less", () => {
    const handle = createRef<SoneSourceListHandle>();
    const { container } = render(
      <SoneSourceList
        items={SOURCES}
        trackBy={byId}
        renderItem={item}
        variant="chip"
        limit={3}
        ariaLabel="Answer sources"
        handleRef={handle}
      />,
    );
    const body = container.querySelector('[data-slot="source-list-body"]')!;
    expect(body.getAttribute("aria-label")).toBe("Answer sources");
    expect(container.querySelector("ul")).toBeNull();
    const chips = () =>
      container.querySelectorAll('[data-slot="source-list-items"] > span');
    expect(chips()).toHaveLength(3);
    const toggle = container.querySelector("button")!;
    expect(toggle.hasAttribute("aria-expanded")).toBe(false);
    expect(toggle.textContent).toBe("+2 more");
    fireEvent.click(toggle);
    expect(chips()).toHaveLength(5);
    expect(container.querySelector("button")!.textContent).toBe("Show less");
    expect(handle.current!.expanded).toBe(true);
    act(() => handle.current!.toggle());
    expect(chips()).toHaveLength(3);
  });

  it("shows no toggle within the limit, and a list for chips when asked", () => {
    const { container } = render(
      <SoneSourceList
        items={SOURCES.slice(0, 2)}
        trackBy={byId}
        renderItem={item}
        variant="chip"
        list
        columns={2}
        limit={3}
      />,
    );
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.firstElementChild!.getAttribute("data-columns")).toBe("2");
  });
});
