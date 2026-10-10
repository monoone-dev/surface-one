import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Behaviour of the app-pattern components (confirm, search field, collapsible
 * section, filter chips, section heading, load more), driven through their docs
 * demos on the BUILT site (same server as the axe run).
 */
const BASE = "/surface-one";

/** Opens a docs page, waits until it is hydrated and returns the live demo. */
async function open(page: Page, path: string): Promise<Locator> {
  await page.goto(BASE + path);
  await page.waitForLoadState("networkidle");
  // The code tab next to the demo repeats the same strings.
  return page.locator("#panel-preview");
}

test.describe("soneConfirm", () => {
  test("opens on the action, Escape cancels and focus goes back", async ({
    page,
  }) => {
    const demo = await open(page, "/components/confirm");
    const opener = demo.getByRole("button", { name: "Delete note" });
    await opener.click();

    const dialog = demo.getByRole("alertdialog", {
      name: "Delete “Weekly sync”?",
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(
      "It moves to the trash for 30 days.",
    );
    const confirm = dialog.getByRole("button", { name: "Delete" });
    await expect(confirm).toBeFocused();

    // Cancel always comes first, then the action.
    const names = await dialog.getByRole("button").allInnerTexts();
    expect(names.map((n) => n.trim())).toEqual(["Cancel", "Delete"]);
    await expect(confirm).toHaveAttribute("data-variant", "destructive");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("Cancel closes it; Confirm shows the busy state, then runs", async ({
    page,
  }) => {
    const demo = await open(page, "/components/confirm");
    await demo.getByRole("button", { name: "Delete note" }).click();
    const dialog = demo.getByRole("alertdialog", {
      name: "Delete “Weekly sync”?",
    });
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);

    await demo.getByRole("button", { name: "Delete note" }).click();
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toHaveAttribute("aria-busy", "true");
    const busy = dialog.getByRole("button", { name: "Deleting…" });
    await expect(busy).toHaveAttribute("aria-disabled", "true");
    await expect(busy).toBeFocused();
    // Escape is ignored while busy.
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();

    await expect(dialog).toHaveCount(0);
    await expect(demo.getByText("Deleted", { exact: true })).toBeVisible();
  });

  test("the error part describes the dialog and is announced", async ({
    page,
  }) => {
    const demo = await open(page, "/components/confirm");
    const card = demo.getByRole("alertdialog", {
      name: "Remove the lock from “Board”?",
    });
    await expect(card).toHaveAttribute("data-layout", "card");
    await expect(card.getByRole("alert")).toHaveText(
      "Touch ID was cancelled. Try again.",
    );
    await expect(card).toHaveAccessibleDescription(
      "Its notes are decrypted and stay readable without Touch ID. Touch ID was cancelled. Try again.",
    );
    // Rendered on load with autoFocus off: focus is not taken.
    await expect(
      card.getByRole("button", { name: "Remove lock" }),
    ).not.toBeFocused();
  });
});

test.describe("sone-search-field", () => {
  test("submits on Enter, clears with the button and with Escape", async ({
    page,
  }) => {
    const demo = await open(page, "/components/search-field");
    const box = demo.getByRole("searchbox", { name: "Search notes" });
    const clear = demo.getByRole("button", { name: "Clear search" });
    await expect(clear).toHaveCount(0);

    await box.fill("roadmap");
    await box.press("Enter");
    await expect(demo.getByText("Searched for: roadmap")).toBeVisible();

    await clear.click();
    await expect(box).toHaveValue("");
    await expect(box).toBeFocused();
    await expect(clear).toHaveCount(0);

    await box.fill("pricing");
    await box.press("Escape");
    await expect(box).toHaveValue("");
  });
});

test.describe("sone-collapsible-section", () => {
  test("the header button toggles the body and reports its state", async ({
    page,
  }) => {
    const demo = await open(page, "/components/collapsible-section");
    const trigger = demo.getByRole("button", { name: /^Audit trail/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const body = demo.getByText("Every read of a locked note, newest first.");
    await expect(body).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(body).toBeVisible();
    const controls = await trigger.getAttribute("aria-controls");
    await expect(page.locator(`[id="${controls}"]`)).toContainText(
      "Every read of a locked note",
    );
  });
});

test.describe("sone-filter-chips", () => {
  test("one option is pressed; click and arrow keys move it", async ({
    page,
  }) => {
    const demo = await open(page, "/components/filter-chips");
    const group = demo.getByRole("group", { name: "Filter by level" });
    const all = group.getByRole("button", { name: /^All/ });
    const errors = group.getByRole("button", { name: /^Errors/ });
    await expect(all).toHaveAttribute("aria-pressed", "true");
    await expect(errors).toHaveAttribute("aria-pressed", "false");

    await errors.click();
    await expect(errors).toHaveAttribute("aria-pressed", "true");
    await expect(all).toHaveAttribute("aria-pressed", "false");

    await page.keyboard.press("ArrowRight");
    await expect(
      group.getByRole("button", { name: /^Warnings/ }),
    ).toBeFocused();
    await page.keyboard.press("Home");
    await expect(all).toBeFocused();

    const tabs = demo.getByRole("group", { name: "Reminder views" });
    await expect(tabs.getByRole("button", { name: /^Inbox/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

test.describe("sone-section-heading", () => {
  test("renders a real heading at the requested level", async ({ page }) => {
    const demo = await open(page, "/components/section-heading");
    await expect(
      demo.getByRole("heading", { level: 2, name: /^Meetings/ }),
    ).toBeVisible();
    await expect(
      demo.getByRole("heading", { level: 3, name: /^Pinned/ }),
    ).toBeVisible();
  });
});

test.describe("sone-load-more", () => {
  test("loads pages until nothing is left, then hides", async ({ page }) => {
    const demo = await open(page, "/components/load-more");
    await demo.getByRole("button", { name: "Show more (6)" }).click();
    await expect(
      demo.getByRole("button", { name: "Show more (3)" }),
    ).toBeVisible();
    await demo.getByRole("button", { name: "Show more (3)" }).click();
    await expect(demo.getByRole("button", { name: /^Show more/ })).toHaveCount(
      0,
    );
    await expect(demo.getByText("Meeting 9")).toBeVisible();
    await expect(demo.getByRole("alert")).toHaveText(
      "The next page could not be loaded.",
    );
    await expect(demo.getByRole("button", { name: "Try again" })).toBeVisible();
  });
});
