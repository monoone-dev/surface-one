import { expect, test, type Page } from "@playwright/test";

/** Layout regressions, checked on the docs demos of the BUILT site. */
const BASE = "/surface-one";

async function open(page: Page, path: string): Promise<void> {
  await page.goto(BASE + path);
  await page.waitForLoadState("networkidle");
}

test.describe("sone-icon", () => {
  test("an unsized icon keeps its size in a flex row", async ({ page }) => {
    await open(page, "/components/icon");
    // The labelled lock sits unsized in a span inside a centred flex row.
    const glyph = page.getByRole("img", { name: "Locked" }).locator("svg");
    const box = await glyph.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);
  });
});

test.describe("sone-empty-state composed", () => {
  test("draws the locked header and keeps projected actions", async ({
    page,
  }) => {
    await open(page, "/components/empty-state");
    const locked = page.locator('sone-empty-state[data-tone="locked"]');
    await expect(locked).toHaveCount(1);
    await expect(locked).not.toHaveAttribute("title");
    await expect(locked.locator(".empty-title")).toHaveText(
      "This folder is locked",
    );
    const icon = locked.locator('sone-icon[data-icon="lock"] svg');
    const box = await icon.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    await expect(locked.getByRole("button", { name: "Unlock" })).toBeVisible();
    // Slot-only usage is unchanged: no role, no generated header.
    const slotted = page.locator('sone-empty-state[data-tone="default"]');
    await expect(slotted).not.toHaveAttribute("role");
    await expect(slotted.locator("> .empty-header")).toHaveCount(1);
  });
});
