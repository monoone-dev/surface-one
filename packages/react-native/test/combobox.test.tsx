import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
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

describe("SoneCombobox", () => {
  it("is a field naming its value that opens a searchable list sheet", () => {
    const onValueChange = vi.fn();
    render(
      <SoneCombobox
        options={OPTIONS}
        defaultValue="astro"
        ariaLabel="Framework"
        onValueChange={onValueChange}
      />,
    );
    const field = screen.getByRole("button", { name: "Framework: Astro" });
    fireEvent.click(field);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: "Astro" }).getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "js" },
    });
    expect(screen.queryByRole("radio", { name: "Astro" })).toBeNull();
    expect(screen.getByRole("group", { name: "Vue" })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: "Nuxt.js" }));
    expect(onValueChange).toHaveBeenCalledWith("nuxt");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Framework: Nuxt.js" }),
    ).toBeTruthy();
  });

  it("shows the empty state and refuses disabled options", () => {
    const onValueChange = vi.fn();
    render(
      <SoneCombobox
        options={OPTIONS}
        ariaLabel="Framework"
        placeholder="Pick one"
        onValueChange={onValueChange}
        defaultOpen
      />,
    );
    const vitepress = screen.getByRole("radio", { name: "VitePress" });
    expect(vitepress.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(vitepress);
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzz" },
    });
    expect(screen.getByText("No results found.")).toBeTruthy();
  });

  it("toggles several options and closes with Done in multiple mode", () => {
    function Multi() {
      const [value, setValue] = useState<SoneComboboxValue>(["next"]);
      return (
        <SoneCombobox
          options={OPTIONS}
          multiple
          value={value}
          onValueChange={setValue}
          ariaLabel="Frameworks"
          clearable
        />
      );
    }
    render(<Multi />);
    fireEvent.click(
      screen.getByRole("button", { name: "Frameworks: Next.js" }),
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Astro" }));
    expect(
      screen
        .getByRole("checkbox", { name: "Astro" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Frameworks: Next.js, Astro" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(screen.getByRole("button", { name: "Frameworks" })).toBeTruthy();
  });
});
