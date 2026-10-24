import { act, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneNavigationMenu,
  SoneNavigationMenuContent,
  SoneNavigationMenuItem,
  SoneNavigationMenuLink,
  SoneNavigationMenuList,
  SoneNavigationMenuTrigger,
} from "../src/components/navigation-menu";

const Nav = ({
  onValueChange,
}: {
  onValueChange?: (v: string | null) => void;
}) => (
  <SoneNavigationMenu aria-label="Main" onValueChange={onValueChange}>
    <SoneNavigationMenuList>
      <SoneNavigationMenuItem value="start">
        <SoneNavigationMenuTrigger id="start">
          Getting started
        </SoneNavigationMenuTrigger>
        <SoneNavigationMenuContent>
          <SoneNavigationMenuLink href="#intro">
            Introduction
          </SoneNavigationMenuLink>
          <SoneNavigationMenuLink href="#install">
            Installation
          </SoneNavigationMenuLink>
        </SoneNavigationMenuContent>
      </SoneNavigationMenuItem>
      <SoneNavigationMenuItem>
        <SoneNavigationMenuLink href="#docs" id="docs" active>
          Docs
        </SoneNavigationMenuLink>
      </SoneNavigationMenuItem>
    </SoneNavigationMenuList>
  </SoneNavigationMenu>
);

describe("SoneNavigationMenu", () => {
  it("renders the same navigation as Angular, contents in the page but hidden", () => {
    const out = renderToString(<Nav />);
    expect(out).toContain(
      '<nav aria-label="Main" class="navigation-menu" data-slot="navigation-menu"><ul class="navigation-menu-list" data-slot="navigation-menu-list"><li class="navigation-menu-item" data-slot="navigation-menu-item">',
    );
    expect(out).toMatch(
      /<button type="button" id="start" class="navigation-menu-trigger" data-slot="navigation-menu-trigger" aria-expanded="false" aria-controls="([^"]+)" data-state="closed">Getting started<\/button><div class="navigation-menu-content" data-slot="navigation-menu-content" id="\1" hidden="" data-state="closed">/,
    );
    expect(out).toContain('aria-current="page"');
  });

  it("opens on click and ArrowDown, closes on Escape and when a link is followed", async () => {
    const onValueChange = vi.fn();
    const { container } = render(<Nav onValueChange={onValueChange} />);
    const trigger = container.querySelector<HTMLElement>("#start")!;
    fireEvent.click(trigger);
    expect(onValueChange).toHaveBeenLastCalledWith("start");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    act(() =>
      container.querySelector<HTMLElement>('a[href="#intro"]')!.click(),
    );
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await act(() => new Promise((r) => setTimeout(r, 5)));
    expect(document.activeElement?.textContent).toBe("Introduction");
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    expect(document.activeElement).toBe(container.querySelector("#docs"));
  });
});
