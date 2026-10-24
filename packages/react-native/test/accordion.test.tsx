import { fireEvent, render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import {
  SoneAccordion,
  SoneAccordionContent,
  SoneAccordionIcon,
  SoneAccordionItem,
  SoneAccordionTrigger,
} from "../src/components/accordion";

const items = (disabled?: string) => [
  <SoneAccordionItem key="a" value="a">
    <SoneAccordionTrigger>First</SoneAccordionTrigger>
    <SoneAccordionContent>One</SoneAccordionContent>
  </SoneAccordionItem>,
  <SoneAccordionItem key="b" value="b" disabled={disabled === "b"}>
    <SoneAccordionTrigger level={4}>Second</SoneAccordionTrigger>
    <SoneAccordionContent>Two</SoneAccordionContent>
  </SoneAccordionItem>,
  <SoneAccordionItem key="c" value="c">
    <SoneAccordionTrigger
      icon={
        <SoneAccordionIcon>
          <Text>+</Text>
        </SoneAccordionIcon>
      }
    >
      Third
    </SoneAccordionTrigger>
    <SoneAccordionContent>Three</SoneAccordionContent>
  </SoneAccordionItem>,
];

describe("SoneAccordion", () => {
  it("headings hold buttons that show and hide their regions", () => {
    const onValueChange = vi.fn();
    render(
      <SoneAccordion collapsible onValueChange={onValueChange}>
        {items()}
      </SoneAccordion>,
    );
    expect(screen.getAllByRole("heading")).toHaveLength(3);
    expect(screen.getAllByRole("heading")[1]!.getAttribute("aria-level")).toBe(
      "4",
    );
    const first = screen.getByRole("button", { name: "First" });
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();
    fireEvent.click(first);
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    expect(first.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("region", { name: "First" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onValueChange).toHaveBeenLastCalledWith("b");
    expect(first.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "Second" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
  });

  it("multiple keeps several open; a disabled item stays shut", () => {
    const onValueChange = vi.fn();
    render(
      <SoneAccordion
        type="multiple"
        defaultValue={["a"]}
        onValueChange={onValueChange}
      >
        {items("b")}
      </SoneAccordion>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Third" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["a", "c"]);
    const second = screen.getByRole("button", { name: "Second" });
    expect(second.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(second);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(screen.getByText("+")).toBeTruthy();
  });

  it("parts need their item", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<SoneAccordionContent />)).toThrow(
      /needs a SoneAccordionItem/,
    );
  });
});
