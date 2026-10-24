// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  comboboxActiveOption,
  comboboxNavigate,
  comboboxOptionId,
  comboboxOptions,
  comboboxSelectedOptions,
  comboboxToggle,
  filterComboboxItems,
  isComboboxSelected,
  listNavigationIndex,
  soneCommandFilter,
  type SoneComboboxItems,
} from "../src";

const ITEMS: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "svelte", label: "SvelteKit", keywords: ["kit"] },
  {
    label: "Vue",
    options: [
      { value: "nuxt", label: "Nuxt.js" },
      { value: "vitepress", label: "VitePress", disabled: true },
    ],
  },
  { value: "astro", label: "Astro" },
  { value: "remix", label: "Remix" },
];

const move = (key: string, current: number, count: number) =>
  listNavigationIndex(key, current, count, { wrap: true });

describe("the combobox options", () => {
  it("flatten the groups", () => {
    expect(comboboxOptions(ITEMS).map((o) => o.value)).toEqual([
      "next",
      "svelte",
      "nuxt",
      "vitepress",
      "astro",
      "remix",
    ]);
    expect(comboboxOptionId("list", 2)).toBe("list-option-2");
  });

  it("filter with the command filter, in sections, dropping emptied groups", () => {
    const all = filterComboboxItems(ITEMS, "", soneCommandFilter);
    expect(all.map((s) => [s.label, s.options.length])).toEqual([
      [null, 2],
      ["Vue", 2],
      [null, 2],
    ]);
    const js = filterComboboxItems(ITEMS, "JS", soneCommandFilter);
    expect(js.map((s) => s.options.map((o) => o.value))).toEqual([
      ["next"],
      ["nuxt"],
    ]);
    // Keywords and the value match too; accents are folded.
    expect(
      filterComboboxItems(ITEMS, "kit", soneCommandFilter)[0]!.options[0]!
        .value,
    ).toBe("svelte");
    expect(
      filterComboboxItems(ITEMS, "astró", soneCommandFilter)[0]!.options[0]!
        .value,
    ).toBe("astro");
    expect(filterComboboxItems(ITEMS, "zzz", soneCommandFilter)).toEqual([]);
  });

  it("toggle one value or a list, and find the picked options", () => {
    expect(comboboxToggle(null, "next", false)).toBe("next");
    expect(comboboxToggle("next", "astro", false)).toBe("astro");
    expect(comboboxToggle(["next"], "astro", true)).toEqual(["next", "astro"]);
    expect(comboboxToggle(["next", "astro"], "next", true)).toEqual(["astro"]);
    expect(isComboboxSelected(["next"], "next")).toBe(true);
    expect(isComboboxSelected("next", "astro")).toBe(false);
    expect(
      comboboxSelectedOptions(ITEMS, ["remix", "gone", "nuxt"]).map(
        (o) => o.label,
      ),
    ).toEqual(["Remix", "Nuxt.js"]);
    expect(comboboxSelectedOptions(ITEMS, null)).toEqual([]);
  });

  it("move the highlight over the enabled options, wrapping", () => {
    const visible = comboboxOptions(ITEMS);
    expect(comboboxNavigate("ArrowDown", null, visible, move)).toBe("next");
    expect(comboboxNavigate("ArrowDown", "nuxt", visible, move)).toBe("astro");
    expect(comboboxNavigate("ArrowUp", "astro", visible, move)).toBe("nuxt");
    expect(comboboxNavigate("ArrowDown", "remix", visible, move)).toBe("next");
    expect(comboboxNavigate("End", "next", visible, move)).toBe("remix");
    expect(comboboxNavigate("Home", "remix", visible, move)).toBe("next");
    expect(comboboxNavigate("Enter", "next", visible, move)).toBeNull();
    expect(comboboxNavigate("ArrowDown", null, [], move)).toBeNull();
  });

  it("highlight the active option, else the picked one, else the first enabled", () => {
    const visible = comboboxOptions(ITEMS);
    expect(comboboxActiveOption(visible, "astro", null)!.value).toBe("astro");
    expect(comboboxActiveOption(visible, "vitepress", "nuxt")!.value).toBe(
      "nuxt",
    );
    expect(comboboxActiveOption(visible, null, null)!.value).toBe("next");
    expect(comboboxActiveOption([], null, null)).toBeNull();
  });
});
