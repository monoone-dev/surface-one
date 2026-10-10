import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Keyboard and dismissal paths of the overlay primitives, driven through their
 * docs demos on the BUILT site (same server as the axe run).
 */
const BASE = "/surface-one";

/** Opens a docs page and waits until it is hydrated (keys typed earlier are lost). */
async function open(page: Page, path: string): Promise<void> {
  await page.goto(BASE + path);
  await page.waitForLoadState("networkidle");
}

test.describe("soneMenuTrigger", () => {
  test("opens from the keyboard, roves, typeaheads, activates and returns focus", async ({
    page,
  }) => {
    await open(page, "/components/menu");
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
    await open(page, "/components/menu");
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
    await open(page, "/components/menu");
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
    await open(page, "/components/dialog");
    await page.getByRole("button", { name: "Rename note…" }).click();
    const dialog = page.getByRole("dialog", { name: "Rename note" });
    await expect(dialog).toBeVisible();
    // The dialog's own initial focus still lands (its teleport runs first).
    await expect(dialog.getByLabel("Name")).toBeFocused();
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

test.describe("sone-command", () => {
  test("combobox + listbox with aria-activedescendant, filtering and selection", async ({
    page,
  }) => {
    await open(page, "/components/command");
    const input = page.getByRole("combobox", { name: "Search commands" });
    const list = page.getByRole("listbox", { name: "Commands" });
    await expect(input).toHaveAttribute(
      "aria-controls",
      (await list.getAttribute("id"))!,
    );
    const options = list.getByRole("option");
    const expectActive = async (option: typeof options) =>
      expect(input).toHaveAttribute(
        "aria-activedescendant",
        (await option.getAttribute("id"))!,
      );
    // The first option is highlighted from the start.
    await expectActive(options.first());
    await expect(options.first()).toHaveAttribute("aria-selected", "true");

    await input.focus();
    await page.keyboard.press("ArrowDown");
    await expectActive(options.nth(1));
    await page.keyboard.press("End");
    // The disabled "Export" option is skipped.
    await expect(
      list.getByRole("option", { name: "Start recording" }),
    ).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("PageDown");
    await expect(
      list.getByRole("option", { name: "Start recording" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(input).toBeFocused();

    // Case- and accent-insensitive, keywords match too.
    await input.fill("LODZ");
    await expect(list.getByRole("option")).toHaveCount(1);
    await expect(
      list.getByRole("option", { name: "Design review — Łódź office" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(list.getByRole("group", { name: "Actions" })).toBeHidden();
    await input.fill("create");
    await expect(list.getByRole("option")).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page.getByText("Selected: New note")).toBeVisible();

    await input.fill("zzz");
    await expect(list.getByRole("option")).toHaveCount(0);
    await expect(
      page.getByText("No results found.", { exact: true }),
    ).toBeVisible();
  });

  test("the command dialog opens focused on its input and closes on Escape", async ({
    page,
  }) => {
    await open(page, "/components/command");
    const opener = page.getByRole("button", { name: /Open the palette/ });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Command palette" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("combobox", { name: "Search notes" });
    await expect(input).toBeFocused();
    await input.fill("cafe");
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden();
    await expect(page.getByText("Selected: Café roadmap")).toBeVisible();
    await opener.click();
    await expect(input).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });
});

test.describe("soneTree", () => {
  test("APG tree keys over sone-tree-row with a roving tabindex", async ({
    page,
  }) => {
    await open(page, "/components/tree");
    const tree = page.getByRole("tree", { name: "Workspace" });
    const item = (name: string) => tree.getByRole("treeitem", { name });
    await expect(item("Product")).toHaveAttribute("aria-level", "1");
    await expect(item("Product")).toHaveAttribute("aria-expanded", "true");
    await expect(item("Design")).toHaveAttribute("aria-expanded", "false");
    await expect(item("Roadmap review")).toHaveAttribute("aria-level", "2");
    await expect(item("Roadmap review")).not.toHaveAttribute("aria-expanded");
    // One Tab stop: the selected row.
    await expect(tree.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(item("Roadmap review")).toHaveAttribute("tabindex", "0");
    await expect(item("Roadmap review")).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await item("Roadmap review").focus();
    await page.keyboard.press("ArrowUp");
    await expect(item("Design")).toBeFocused();
    await expect(item("Design")).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("ArrowRight");
    await expect(item("Design")).toHaveAttribute("aria-expanded", "true");
    await expect(item("Specs review")).toHaveAttribute("aria-level", "3");
    await page.keyboard.press("ArrowRight");
    await expect(item("Specs review")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(item("Design")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(item("Design")).toHaveAttribute("aria-expanded", "false");
    await expect(item("Specs review")).toHaveCount(0);
    await page.keyboard.press("ArrowLeft");
    await expect(item("Product")).toBeFocused();
    await page.keyboard.press("End");
    await expect(item("1:1s")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item("Product")).toBeFocused();
    await page.keyboard.press("r");
    await expect(item("Roadmap review")).toBeFocused();
    await page.keyboard.press("r");
    await expect(item("Research")).toBeFocused();
    // `*` expands every sibling on the focused row's level (Product, Research).
    await page.keyboard.press("*");
    await expect(item("Research")).toHaveAttribute("aria-expanded", "true");
    await expect(item("Product")).toHaveAttribute("aria-expanded", "true");
    await expect(item("Design")).toHaveAttribute("aria-expanded", "false");
    await page.keyboard.press("ArrowDown");
    await expect(item("Interviews")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Opened: interviews")).toBeVisible();
    await expect(item("Interviews")).toHaveAttribute("aria-selected", "true");

    // The row's own buttons are not Tab stops: Tab leaves the tree.
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => !!document.activeElement?.closest('[role="tree"]'),
      ),
    ).toBe(false);
  });
});

test.describe("soneTree key replay", () => {
  test("a key pressed before the expand renders walks the new rows", async ({
    page,
  }) => {
    await open(page, "/components/tree");
    const tree = page.getByRole("tree", { name: "Workspace" });
    const item = (name: string) => tree.getByRole("treeitem", { name });
    await item("Design").focus();
    await expect(item("Design")).toHaveAttribute("aria-expanded", "false");
    // → then ↓ in the same task: no render in between, so ↓ would land on the
    // stale "Roadmap review" unless the tree holds it until "Specs review" exists.
    await page.evaluate(() => {
      const row = document.activeElement!;
      for (const key of ["ArrowRight", "ArrowDown"]) {
        row.dispatchEvent(
          new KeyboardEvent("keydown", {
            key,
            bubbles: true,
            cancelable: true,
          }),
        );
      }
    });
    await expect(item("Specs review")).toBeFocused();
    // A key on a leaf changes nothing and must not leave the tree holding keys.
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await expect(item("Token audit")).toBeFocused();
  });
});

test.describe("open overlays pass axe", () => {
  async function violations(page: Page) {
    // Entry animations fade the panel in; contrast is measured once they end.
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((a) => a.finished)),
    );
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    return violations.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`,
    );
  }

  test("an open menu and popover", async ({ page }) => {
    await open(page, "/components/menu");
    await page.getByRole("button", { name: "Note actions" }).click();
    await expect(
      page.getByRole("menu", { name: "Note actions" }),
    ).toBeVisible();
    expect(await violations(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Dimensions" }).click();
    await expect(
      page.getByRole("dialog", { name: "Dimensions" }),
    ).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });

  test("a filtered command and the command dialog", async ({ page }) => {
    await open(page, "/components/command");
    await page.getByRole("combobox", { name: "Search commands" }).fill("zzz");
    expect(await violations(page)).toEqual([]);
    await page.getByRole("button", { name: /Open the palette/ }).click();
    await expect(
      page.getByRole("dialog", { name: "Command palette" }),
    ).toBeVisible();
    expect(await violations(page)).toEqual([]);
  });
});
