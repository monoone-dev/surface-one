// @vitest-environment node
import { createElement, type ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SONE_COMPONENT_NAMES as VUE_COMPONENTS } from "../../vue/src/component-names";
import * as pkg from "../src/index";

const all = pkg as unknown as Record<string, unknown>;

/** Every exported component: a `Sone*` function (providers and contexts aside). */
const components = Object.keys(all)
  .filter((name) => /^Sone[A-Z]/.test(name))
  .filter((name) => typeof all[name] === "function")
  .filter((name) => !/Provider$/.test(name))
  .sort();

describe("exports", () => {
  it("has a React twin for every @surface-one/vue component", () => {
    const missing = VUE_COMPONENTS.filter((name) => !components.includes(name));
    expect(missing).toEqual([]);
  });
});

describe("server rendering (Next.js SSR / prerender)", () => {
  it("renders every component without touching window or document", () => {
    expect(typeof document).toBe("undefined");
    const required: Record<string, Record<string, unknown>> = {
      SoneCollapsibleSection: { title: "Section" },
      SoneDockItem: { label: "Undo" },
      SoneFilterChips: { options: [{ value: "a", label: "A" }] },
      SoneIcon: { icon: "check" },
      SoneSectionHeading: { title: "Section" },
      SoneSegmented: { options: [{ value: "a", label: "A" }] },
      SoneTable: { rows: [], columns: [] },
    };
    // Parts that only work inside their root (as in Angular) throw a clear error alone.
    const needsParent = new Set<string>();
    for (const name of components) {
      const render = (children?: string): string =>
        renderToString(
          createElement(
            all[name] as ComponentType,
            required[name] ?? {},
            children,
          ),
        );
      try {
        let html: string;
        try {
          html = render("x");
        } catch (error) {
          // Void elements (`<img>`, `<input>`) take no children.
          if (!/self-closing|void element/i.test(String(error))) throw error;
          html = render();
        }
        expect(html, name).toBeTypeOf("string");
      } catch (error) {
        if (
          /must (be used |sit )?inside|needs? a|within/i.test(String(error))
        ) {
          needsParent.add(name);
          continue;
        }
        throw new Error(`${name}: ${String(error)}`);
      }
    }
    // Only parts that need their root are allowed to throw.
    for (const name of needsParent)
      expect(name).not.toMatch(/^Sone(Button|Card|Icon)$/);
  });

  it("renders the same markup the Vue and Angular components do", () => {
    const {
      SoneButton,
      SoneCard,
      SoneCardTitle,
      SoneIcon,
      SoneSwitch,
      SoneTable,
    } = pkg;
    const html = renderToString(
      <>
        <SoneButton variant="outline" size="sm">
          Go
        </SoneButton>
        <SoneButton as="a" href="/x">
          Link
        </SoneButton>
        <SoneCard>
          <SoneCardTitle>Title</SoneCardTitle>
        </SoneCard>
        <SoneIcon icon="check" label="Done" />
        <SoneSwitch checked ariaLabel="On" readOnly />
        <SoneTable
          rows={[{ id: 1, name: "Ada" }]}
          columns={[{ key: "name", header: "Name" }]}
        />
      </>,
    );
    expect(html).toContain(
      '<button data-slot="button" data-variant="outline" data-size="sm" class="btn">Go</button>',
    );
    expect(html).toContain(
      '<a data-slot="button" data-variant="default" data-size="default" href="/x" class="btn">Link</a>',
    );
    expect(html).toContain(
      '<div data-slot="card" data-size="default" class="card"><h3 data-slot="card-title" class="card-title">Title</h3></div>',
    );
    expect(html).toMatch(
      /<sone-icon data-slot="icon" data-icon="check"><span class="nav-icon" role="img" aria-label="Done"><svg/,
    );
    expect(html).toMatch(
      /<sone-switch><input[^>]*class="switch"[^>]*type="checkbox"/,
    );
    expect(html).toMatch(/data-state="checked"/);
    expect(html).toContain("Ada</td>");
  });
});
