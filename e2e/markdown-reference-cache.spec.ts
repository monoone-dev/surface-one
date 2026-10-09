import { expect, test as base, type Locator } from "@playwright/test";

interface MarkdownDemo {
  source: Locator;
  preview: Locator;
  assertRetained: () => Promise<void>;
}

const test = base.extend<{ markdown: MarkdownDemo }>({
  markdown: async ({ page }, use) => {
    await page.goto("/surface-one/components/markdown");
    await page.waitForLoadState("networkidle");
    const source = page.getByRole("textbox", { name: "Markdown", exact: true });
    const preview = page.getByTestId("markdown-reference-preview");
    await expect(preview).toBeVisible();
    const host = await preview.elementHandle();
    if (!host) throw new Error("Markdown preview is missing");

    const retention = await host.evaluateHandle((node) => {
      const state = { node, removals: 0 };
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          record.removedNodes.forEach((removed) => {
            if (removed === node || removed.contains(node)) state.removals++;
          });
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
      return { state, observer };
    });
    const assertRetained = async () => {
      expect(
        await preview.evaluate(
          (current, { state }) => ({
            sameNode: current === state.node,
            connected: state.node.isConnected,
            removals: state.removals,
          }),
          retention,
        ),
      ).toEqual({ sameNode: true, connected: true, removals: 0 });
    };

    try {
      await use({ source, preview, assertRetained });
    } finally {
      await retention.evaluate(({ observer }) => observer.disconnect());
      await retention.dispose();
      await host.dispose();
    }
  },
});

const PARAGRAPH = "[Guide][ref]\n\n";
const ONE = "https://example.invalid/one";
const TWO = "https://example.invalid/two";

function guide(href: string, title = "Guide one"): string {
  return `${PARAGRAPH}[ref]: ${href} "${title}"`;
}

test("updates a reference URL while its paragraph stays unchanged", async ({
  markdown,
}) => {
  const link = markdown.preview.getByRole("link", {
    name: "Guide",
    exact: true,
  });
  await markdown.source.fill(guide(ONE));
  await expect(link).toHaveAttribute("href", ONE);
  await expect(link).toHaveText("Guide");
  await markdown.assertRetained();

  await markdown.source.fill(guide(TWO));
  await expect(link).toHaveAttribute("href", TWO);
  await expect(link).toHaveText("Guide");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await markdown.assertRetained();
});

test("updates only a reference title", async ({ markdown }) => {
  const link = markdown.preview.getByRole("link", {
    name: "Guide",
    exact: true,
  });
  await markdown.source.fill(guide(ONE));
  await expect(link).toHaveAttribute("title", "Guide one");
  await markdown.assertRetained();

  await markdown.source.fill(guide(ONE, "Guide two"));
  await expect(link).toHaveAttribute("title", "Guide two");
  await expect(link).toHaveAttribute("href", ONE);
  await expect(link).toHaveText("Guide");
  await markdown.assertRetained();
});

test("removes and re-adds a reference definition", async ({ markdown }) => {
  const link = markdown.preview.getByRole("link", {
    name: "Guide",
    exact: true,
  });
  await markdown.source.fill(guide(ONE));
  await expect(link).toHaveAttribute("href", ONE);
  await markdown.assertRetained();

  await markdown.source.fill(PARAGRAPH);
  await expect(markdown.preview.locator("a")).toHaveCount(0);
  await expect(markdown.preview).toHaveText("[Guide][ref]");
  await markdown.assertRetained();

  await markdown.source.fill(guide(TWO, "Restored guide"));
  await expect(link).toHaveAttribute("href", TWO);
  await expect(link).toHaveAttribute("title", "Restored guide");
  await expect(link).toHaveText("Guide");
  await markdown.assertRetained();
});

test("resolves a reference when its first definition arrives", async ({
  markdown,
}) => {
  await markdown.source.fill(PARAGRAPH);
  await expect(markdown.preview.locator("a")).toHaveCount(0);
  await expect(markdown.preview).toHaveText("[Guide][ref]");
  await markdown.assertRetained();

  await markdown.source.fill(guide(ONE));
  const link = markdown.preview.getByRole("link", {
    name: "Guide",
    exact: true,
  });
  await expect(link).toHaveAttribute("href", ONE);
  await expect(link).toHaveText("Guide");
  await markdown.assertRetained();
});

// Public inline fixture shared with the Markdown Storybook example.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAwCAIAAABVDSmEAAAAhElEQVR42u3QURGAIAAFMHKagAQkIIEJSEACE5iANhqB983tbglWrvZt1UAL9MAdGIEZeAJvYAWKaNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq0aNGiRYsWLVq06BOifz5OPbN3N7I0AAAAAElFTkSuQmCC";
const REMOTE_IMAGE = "https://images.example.invalid/pixel.png";

test("blocks a reference image changed from data to a remote URL", async ({
  markdown,
  page,
}) => {
  const attempts: string[] = [];
  const routed: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://images.example.invalid/")) {
      attempts.push(request.url());
    }
  });
  await page.route("https://images.example.invalid/**", async (route) => {
    routed.push(route.request().url());
    await route.abort("blockedbyclient");
  });

  const imageParagraph = "![Pixel][image]\n\n";
  await markdown.source.fill(`${imageParagraph}[image]: ${PIXEL}`);
  const image = markdown.preview.getByRole("img", {
    name: "Pixel",
    exact: true,
  });
  await expect(image).toHaveAttribute("src", PIXEL);
  await markdown.assertRetained();

  await markdown.source.fill(`${imageParagraph}[image]: ${REMOTE_IMAGE}`);
  await expect(markdown.preview.locator("img")).toHaveCount(0);
  await expect(markdown.preview.locator(".markdown-image-blocked")).toHaveText(
    "Pixel — image not loaded",
  );
  await page.waitForLoadState("networkidle");
  expect(attempts).toEqual([]);
  expect(routed).toEqual([]);
  await markdown.assertRetained();
});
