import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneTabBar, type TabBarItem } from "../src/components/tab-bar";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", href: "/home" },
  { value: "search", label: "Search" },
  { value: "inbox", label: "Inbox", disabled: true },
];

describe("SoneTabBar", () => {
  it("renders the same nav as Angular", () => {
    const out = renderToString(<SoneTabBar items={ITEMS} value="home" />);
    expect(out).toContain(
      '<sone-tab-bar data-slot="tab-bar" data-floating="" data-labels="active"><nav class="tab-bar" data-slot="tab-bar-nav" aria-label="Tab bar"><ul class="tab-bar-list" role="list"><li class="tab-bar-cell"><a class="tab-bar-item" data-slot="tab-bar-item" data-active="" aria-current="page" href="/home"><span class="tab-bar-label">Home</span></a></li>',
    );
    expect(out).toContain(
      '<button class="tab-bar-item" data-slot="tab-bar-item" type="button"><span class="tab-bar-label sr-only">Search</span></button>',
    );
  });

  it("is uncontrolled with defaultValue and reports changes", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <SoneTabBar
        items={ITEMS}
        defaultValue="home"
        onValueChange={onValueChange}
        floating={false}
      />,
    );
    const tabs = container.querySelectorAll(".tab-bar-item");
    fireEvent.click(tabs[1]!);
    expect(onValueChange).toHaveBeenCalledWith("search");
    expect(tabs[1]!.getAttribute("aria-current")).toBe("true");
    fireEvent.click(tabs[2]!);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(
      container.querySelector("sone-tab-bar")!.hasAttribute("data-floating"),
    ).toBe(false);
  });
});
