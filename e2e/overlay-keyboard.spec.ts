import { expect, test } from "@playwright/test";

/**
 * Keyboard and dismissal paths of the overlay primitives, driven through their
 * docs demos on the BUILT site (same server as the axe run).
 */
const BASE = "/surface-one";

test.describe("soneMenuTrigger", () => {
  test("opens from the keyboard, roves, typeaheads, activates and returns focus", async ({
    page,
  }) => {
    await page.goto(`${BASE}/components/menu`);
    const trigger = page.getByRole("button", { name: "Note actions" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const menu = page.getByRole("menu", { name: "Note actions" });
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menuId = await menu.getAttribute("id");
    await expect(trigger).toHaveAttribute("aria-controls", menuId!);
    // Rendered in a layer on <body>, not next to the trigger.
    expect(
      await menu.evaluate(
        (el) => el.parentElement?.parentElement === document.body,
      ),
    ).toBe(true);

    const items = menu.getByRole("menuitem");
    await expect(items.first()).toBeFocused();
    await expect(items.first()).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("ArrowDown");
    await expect(
      menu.getByRole("menuitem", { name: "Duplicate" }),
    ).toBeFocused();
    // The disabled item is skipped.
    await page.keyboard.press("ArrowDown");
    await expect(
      menu.getByRole("menuitemcheckbox", { name: "Pinned" }),
    ).toBeFocused();
    await page.keyboard.press("End");
    await expect(
      menu.getByRole("menuitem", { name: "Move to Trash" }),
    ).toBeFocused();
    await page.keyboard.press("Home");
    await expect(items.first()).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(
      menu.getByRole("menuitem", { name: "Move to Trash" }),
    ).toBeFocused();
    await page.keyboard.press("d");
    await expect(
      menu.getByRole("menuitem", { name: "Duplicate" }),
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes on a click outside and on Tab", async ({ page }) => {
    await page.goto(`${BASE}/components/menu`);
    const trigger = page.getByRole("button", { name: "Note actions" });
    await trigger.click();
    const menu = page.getByRole("menu", { name: "Note actions" });
    await expect(menu).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(menu).toBeHidden();

    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(menu).toBeHidden();
    await expect(
      page.getByRole("button", { name: "Dimensions" }),
    ).toBeFocused();
  });
});

test.describe("sonePopoverTrigger", () => {
  test("focuses into the panel, Tab order follows the trigger, Escape returns focus", async ({
    page,
  }) => {
    await page.goto(`${BASE}/components/menu`);
    const trigger = page.getByRole("button", { name: "Dimensions" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await trigger.click();
    const panel = page.getByRole("dialog", { name: "Dimensions" });
    await expect(panel).toBeVisible();
    await expect(page.getByLabel("Width")).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByLabel("Width")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();

    // The template's `close` closes it.
    await trigger.click();
    await panel.getByRole("button", { name: "Apply" }).click();
    await expect(panel).toBeHidden();
  });

  test("a popover opened inside a dialog joins the dialog's focus trap", async ({
    page,
  }) => {
    await page.goto(`${BASE}/components/dialog`);
    await page.getByRole("button", { name: "Rename note…" }).click();
    const dialog = page.getByRole("dialog", { name: "Rename note" });
    await expect(dialog).toBeVisible();
    const folder = dialog.getByRole("button", { name: "Product" });
    await folder.click();
    const picker = page.getByRole("dialog", { name: "Choose a folder" });
    await expect(picker).toBeVisible();
    await expect(picker.getByRole("button", { name: "Inbox" })).toBeFocused();

    // Shift+Tab leaves the popover for its trigger; Tab from the trigger re-enters it
    // (the dialog's trap splices the portaled panel in right after its trigger).
    await page.keyboard.press("Shift+Tab");
    await expect(folder).toBeFocused();
    await expect(picker).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(picker.getByRole("button", { name: "Inbox" })).toBeFocused();
    for (const name of ["Product", "Design reviews", "1:1s"]) {
      await page.keyboard.press("Tab");
      await expect(picker.getByRole("button", { name })).toBeFocused();
    }
    // Past its end, Tab continues in the dialog after the trigger; the popover closes.
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await expect(picker).toBeHidden();
    await page.keyboard.press("Shift+Tab");
    await expect(folder).toBeFocused();

    // Escape closes the popover first, then the dialog.
    await page.keyboard.press("Enter");
    await expect(picker).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(picker).toBeHidden();
    await expect(dialog).toBeVisible();
    await expect(folder).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
