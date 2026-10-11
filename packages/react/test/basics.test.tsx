import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { SoneButton, SoneButtonGroup, SoneCard, SoneCardTitle, SoneIcon } from "../src/index";

describe("SoneButton", () => {
  it("renders the shared markup", () => {
    render(
      <SoneButton variant="outline" size="sm" className="extra" type="button">
        Save
      </SoneButton>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toBe("btn extra");
    expect(button.dataset["slot"]).toBe("button");
    expect(button.dataset["variant"]).toBe("outline");
    expect(button.dataset["size"]).toBe("sm");
  });

  it("swallows clicks on a link marked aria-disabled", () => {
    let clicks = 0;
    render(
      <SoneButton as="a" href="#" aria-disabled="true" onClick={() => clicks++}>
        Go
      </SoneButton>,
    );
    fireEvent.click(screen.getByText("Go"));
    expect(clicks).toBe(0);
  });

  it("forwards the ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<SoneButton ref={ref}>Ref</SoneButton>);
    expect(ref.current?.tagName).toBe("BUTTON");
  });

  it("groups buttons", () => {
    render(<SoneButtonGroup aria-label="Range" />);
    expect(screen.getByRole("group").dataset["orientation"]).toBe("horizontal");
  });
});

describe("parts", () => {
  it("renders a card with its slots and lets `as` change the tag", () => {
    const { container } = render(
      <SoneCard as="section" size="sm" id="c">
        <SoneCardTitle>Title</SoneCardTitle>
      </SoneCard>,
    );
    const card = container.querySelector("section")!;
    expect(card.className).toBe("card");
    expect(card.dataset["size"]).toBe("sm");
    expect(card.id).toBe("c");
    expect(card.querySelector("h3[data-slot=card-title]")?.textContent).toBe("Title");
    expect(card.hasAttribute("size")).toBe(false);
  });

  it("renders an icon in its host element", () => {
    const { container } = render(<SoneIcon icon="check" label="Done" />);
    const host = container.querySelector("sone-icon")!;
    expect(host.getAttribute("data-icon")).toBe("check");
    expect(host.querySelector("[role=img]")?.getAttribute("aria-label")).toBe("Done");
    expect(host.querySelector("svg")).not.toBeNull();
  });
});
