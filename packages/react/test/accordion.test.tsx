import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneAccordion,
  SoneAccordionContent,
  SoneAccordionIcon,
  SoneAccordionItem,
  SoneAccordionTrigger,
  type AccordionValue,
} from "../src/components/accordion";

const Items = ({ disabled }: { disabled?: string }) => (
  <>
    <SoneAccordionItem value="a">
      <SoneAccordionTrigger>First</SoneAccordionTrigger>
      <SoneAccordionContent>One</SoneAccordionContent>
    </SoneAccordionItem>
    <SoneAccordionItem value="b" disabled={disabled === "b"}>
      <SoneAccordionTrigger level={4}>Second</SoneAccordionTrigger>
      <SoneAccordionContent>Two</SoneAccordionContent>
    </SoneAccordionItem>
    <SoneAccordionItem value="c">
      <SoneAccordionTrigger icon={<SoneAccordionIcon>+</SoneAccordionIcon>}>
        Third
      </SoneAccordionTrigger>
      <SoneAccordionContent>Three</SoneAccordionContent>
    </SoneAccordionItem>
  </>
);

describe("SoneAccordion", () => {
  it("renders the WAI-ARIA accordion markup on the server", () => {
    const html = renderToString(
      <SoneAccordion defaultValue="a">
        <Items />
      </SoneAccordion>,
    );
    expect(html).toMatch(
      /^<div data-slot="accordion" data-orientation="vertical" class="accordion">/,
    );
    expect(html).toContain(
      '<sone-accordion-trigger data-slot="accordion-header" role="heading" aria-level="3" data-state="open" class="accordion-header">',
    );
    expect(html).toContain('aria-level="4"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('role="region"');
  });

  it("single: opens one item at a time and collapsible closes it", () => {
    const onValueChange = vi.fn();
    function App() {
      const [value, setValue] = useState<AccordionValue>(null);
      return (
        <SoneAccordion
          value={value}
          onValueChange={(v) => {
            onValueChange(v);
            setValue(v);
          }}
          collapsible
        >
          <Items />
        </SoneAccordion>
      );
    }
    render(<App />);
    const [first, second] = screen.getAllByRole("button");
    const region = document.getElementById(
      first!.getAttribute("aria-controls")!,
    )!;
    expect(region.getAttribute("aria-labelledby")).toBe(first!.id);
    expect(region.hidden).toBe(true);
    fireEvent.click(first!);
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    expect(first!.getAttribute("aria-expanded")).toBe("true");
    expect(region.hidden).toBe(false);
    expect(screen.getByRole("region", { name: "First" })).toBe(region);
    fireEvent.click(second!);
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(first!.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(second!);
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("single without collapsible keeps the open item open", () => {
    render(
      <SoneAccordion defaultValue="a">
        <Items />
      </SoneAccordion>,
    );
    const first = screen.getAllByRole("button")[0]!;
    fireEvent.click(first);
    expect(first.getAttribute("aria-expanded")).toBe("true");
  });

  it("multiple: keeps several open; a disabled item stays shut", () => {
    const onValueChange = vi.fn();
    render(
      <SoneAccordion type="multiple" onValueChange={onValueChange}>
        <Items disabled="b" />
      </SoneAccordion>,
    );
    const [first, second, third] = screen.getAllByRole("button");
    fireEvent.click(first!);
    fireEvent.click(third!);
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    expect(second).toHaveProperty("disabled", true);
    expect(
      third!.querySelector('[data-slot="accordion-trigger-icon"]')!.textContent,
    ).toBe("+");
  });

  it("moves focus between the triggers with the arrow keys", () => {
    render(
      <SoneAccordion>
        <Items />
      </SoneAccordion>,
    );
    const triggers = screen.getAllByRole("button");
    triggers[0]!.focus();
    fireEvent.keyDown(triggers[0]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[1]);
    fireEvent.keyDown(triggers[1]!, { key: "End" });
    expect(document.activeElement).toBe(triggers[2]);
    fireEvent.keyDown(triggers[2]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(triggers[0]);
  });

  it("parts need their item", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SoneAccordionContent />)).toThrow(
      /needs a SoneAccordionItem/,
    );
  });
});
