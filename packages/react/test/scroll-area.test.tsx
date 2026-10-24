import { render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneScrollArea } from "../src/components/scroll-area";

describe("SoneScrollArea", () => {
  it("renders the scroll area like Angular on the server", () => {
    expect(
      renderToString(
        <SoneScrollArea fade aria-label="Tags">
          x
        </SoneScrollArea>,
      ),
    ).toBe(
      '<div aria-label="Tags" class="scroll-area" data-slot="scroll-area" data-orientation="vertical" data-fade="">x</div>',
    );
  });

  it("is a named region and a keyboard stop while it overflows", () => {
    const { container, rerender } = render(
      <SoneScrollArea orientation="horizontal" aria-label="Tags">
        x
      </SoneScrollArea>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("region");
    expect(el.hasAttribute("tabindex")).toBe(false);
    Object.defineProperty(el, "scrollWidth", { value: 300 });
    Object.defineProperty(el, "clientWidth", { value: 100 });
    rerender(
      <SoneScrollArea orientation="vertical" aria-label="Tags">
        x
      </SoneScrollArea>,
    );
    expect(el.getAttribute("data-orientation")).toBe("vertical");
    // Vertical: the extra width does not count.
    expect(el.hasAttribute("tabindex")).toBe(false);
    rerender(
      <SoneScrollArea orientation="both" aria-label="Tags">
        x
      </SoneScrollArea>,
    );
    expect(el.getAttribute("tabindex")).toBe("0");
  });
});
