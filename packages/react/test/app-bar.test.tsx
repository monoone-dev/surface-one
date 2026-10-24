import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneAppBar } from "../src/components/app-bar";
import { SoneButton } from "../src/components/button";

describe("SoneAppBar", () => {
  it("renders the same header as Angular", () => {
    const out = renderToString(
      <SoneAppBar
        title="Inbox"
        subtitle="12 unread"
        sticky
        showBack
        trailing={<SoneButton>Search</SoneButton>}
      />,
    );
    expect(out).toContain(
      '<sone-app-bar data-slot="app-bar" data-sticky=""><header class="app-bar" data-slot="app-bar-header"><button data-slot="app-bar-back" data-variant="ghost" data-size="icon" type="button" aria-label="Back" class="btn app-bar-back">',
    );
    expect(out).toContain(
      '<div class="app-bar-heading" data-slot="app-bar-heading"><h1 class="app-bar-title" data-slot="app-bar-title">Inbox</h1><p class="app-bar-subtitle" data-slot="app-bar-subtitle">12 unread</p></div><div class="app-bar-trailing"><button',
    );
  });

  it("takes a heading level, a back link, and shows the back button for onBack", () => {
    const link = renderToString(
      <SoneAppBar title="Invoice" level="2" backHref="/inbox" />,
    );
    expect(link).toContain('<h2 class="app-bar-title"');
    expect(link).toMatch(/<a [^>]*href="\/inbox"[^>]*class="btn app-bar-back"/);

    const onBack = vi.fn();
    const { container, rerender } = render(
      <SoneAppBar title="Inbox" onBack={onBack} />,
    );
    fireEvent.click(container.querySelector("button.app-bar-back")!);
    expect(onBack).toHaveBeenCalledOnce();

    rerender(<SoneAppBar title="Inbox" />);
    expect(container.querySelector(".app-bar-back")).toBeNull();
  });
});
