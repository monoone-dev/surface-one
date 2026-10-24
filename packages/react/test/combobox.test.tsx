import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneCombobox,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "../src/components/combobox";

const OPTIONS: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  {
    label: "Vue",
    options: [
      { value: "nuxt", label: "Nuxt.js" },
      { value: "vitepress", label: "VitePress", disabled: true },
    ],
  },
  { value: "astro", label: "Astro" },
];

const optionTexts = () =>
  screen.queryAllByRole("option").map((o) => o.textContent!.trim());

function activeText(input: HTMLElement) {
  return document
    .getElementById(input.getAttribute("aria-activedescendant") ?? "")
    ?.textContent?.trim();
}

describe("SoneCombobox", () => {
  it("renders a closed combobox input on the server", () => {
    const html = renderToString(
      <SoneCombobox
        options={OPTIONS}
        defaultValue="nuxt"
        aria-label="Framework"
      />,
    );
    expect(html).toContain(
      '<sone-combobox class="combobox" data-slot="combobox">',
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('value="Nuxt.js"');
    expect(html).not.toContain('role="listbox"');
  });

  it("opens on typing, filters, moves the highlight and picks with Enter", () => {
    const onValueChange = vi.fn();
    render(
      <SoneCombobox
        options={OPTIONS}
        aria-label="Framework"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("combobox", { name: "Framework" });
    fireEvent.change(input, { target: { value: "js" } });
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(input.getAttribute("aria-controls")).toBe(
      screen.getByRole("listbox").id,
    );
    expect(optionTexts()).toEqual(["Next.js", "Nuxt.js"]);
    expect(screen.getByRole("group", { name: "Vue" })).toBeTruthy();
    expect(activeText(input)).toBe("Next.js");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(activeText(input)).toBe("Nuxt.js");
    fireEvent.keyDown(input, { key: "Home" });
    expect(activeText(input)).toBe("Next.js");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(activeText(input)).toBe("Nuxt.js");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("nuxt");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect((input as HTMLInputElement).value).toBe("Nuxt.js");
  });

  it("skips disabled options, shows the empty state and closes on Escape", () => {
    render(<SoneCombobox options={OPTIONS} aria-label="Framework" />);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getByRole("listbox", { name: "Framework" })).toBeTruthy();
    expect(activeText(input)).toBe("Astro");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(activeText(input)).toBe("Nuxt.js");
    expect(
      screen
        .getByRole("option", { name: "VitePress" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("No results found.");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("picks several options as chips in multiple mode, Backspace removes the last", () => {
    function Multi() {
      const [value, setValue] = useState<SoneComboboxValue>(["astro"]);
      return (
        <SoneCombobox
          options={OPTIONS}
          multiple
          value={value}
          onValueChange={setValue}
          aria-label="Frameworks"
        />
      );
    }
    const { container } = render(<Multi />);
    const chips = () =>
      [...container.querySelectorAll(".combobox-chip")].map((c) =>
        c.textContent!.trim(),
      );
    expect(chips()).toEqual(["Astro"]);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    expect(
      screen.getByRole("listbox").getAttribute("aria-multiselectable"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "Next.js" }));
    expect(chips()).toEqual(["Astro", "Next.js"]);
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(
      screen
        .getByRole("option", { name: "Next.js" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Remove Astro" }));
    expect(chips()).toEqual(["Next.js"]);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(chips()).toEqual([]);
  });

  it("names its listbox from the field label and clears", () => {
    const onValueChange = vi.fn();
    render(
      <div>
        <label htmlFor="fw">Framework</label>
        <SoneCombobox
          inputId="fw"
          options={OPTIONS}
          clearable
          defaultValue="next"
          onValueChange={onValueChange}
        />
      </div>,
    );
    const input = screen.getByRole("combobox", { name: "Framework" });
    fireEvent.click(input);
    expect(screen.getByRole("listbox", { name: "Framework" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });
});
