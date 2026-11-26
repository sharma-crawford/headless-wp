import { expect, test } from "@playwright/test";

import { people } from "./support/people";
import { signIn } from "./support/session";
import { WordPress } from "./support/wordpress";

import type { Locator, Page } from "@playwright/test";

/**
 * Opens a colour menu (D3) from its trigger. A click that lands before the page
 * has hydrated does nothing, and on a slow runner that is the usual case, so
 * click again until the menu is there instead of waiting on a closed one.
 */
async function openMenu(trigger: Locator, inMenu: Locator) {
  await expect(async () => {
    if (!(await inMenu.isVisible())) {
      await trigger.click();
    }
    await expect(inMenu).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 20_000 });
}

/**
 * Opens one titled item's colour menu and picks a swatch.
 */
async function choose(page: Page, title: string, swatch: string) {
  const item = page.getByRole("menuitem", { name: swatch, exact: true });
  await openMenu(page.getByRole("button", { name: new RegExp(`^Colour for ${title}:`) }), item);
  await item.click();
}


/**
 * An author colours a programme, everything inside it follows, and one item
 * can be given a colour of its own and then handed back.
 */
test.describe("Colours", () => {
  let wordpress: WordPress;
  let programme: { id: number; title: string };
  let unit: { id: number; title: string };
  let courseModule: { id: number; title: string };

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
    programme = await wordpress.createNode("pcle_program", "E2E Colour Programme");
    unit = await wordpress.createNode("pcle_unit", "E2E Colour Unit", programme.id);
    courseModule = await wordpress.createNode("pcle_module", "E2E Colour Module", unit.id);
  });

  test.afterAll(async () => {
    await wordpress.deleteNode(programme.id, true);
  });

  test("a programme's colour reaches everything inside it", async ({ page }) => {
    await signIn(page, people.instructor);
    await page.goto(`/builder/programs/${programme.id}`);

    await choose(page, programme.title, "Teal strong");

    await expect(
      page.getByRole("button", { name: `Colour for ${programme.title}: Teal strong, its own colour` })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `Colour for ${unit.title}: Teal strong, from the programme` })
    ).toBeVisible();
  });

  test("an item can have its own colour, and give it back", async ({ page }) => {
    await signIn(page, people.instructor);
    await page.goto(`/builder/programs/${programme.id}`);

    await choose(page, unit.title, "Plum soft");

    await expect(
      page.getByRole("button", { name: `Colour for ${unit.title}: Plum soft, its own colour` })
    ).toBeVisible();

    // Units arrive folded; the module inside takes the unit's colour.
    await page.getByRole("button", { name: `Expand ${unit.title}` }).click();
    await expect(
      page.getByRole("button", { name: `Colour for ${courseModule.title}: Plum soft, from the unit` })
    ).toBeVisible();

    const giveBack = page.getByRole("menuitem", { name: "Use the programme's colour" });
    await openMenu(page.getByRole("button", { name: new RegExp(`^Colour for ${unit.title}:`) }), giveBack);
    await giveBack.click();

    await expect(
      page.getByRole("button", { name: `Colour for ${unit.title}: Teal strong, from the programme` })
    ).toBeVisible();
  });
});

/**
 * The Colours screen (P16): the badges' colours are an administrator's, and
 * each state keeps to its own family.
 */
test.describe("Colour settings", () => {
  let wordpress: WordPress;

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
  });

  test.afterAll(async () => {
    await wordpress.setColourSettings({});
  });

  test("an administrator recolours every Draft badge", async ({ page }) => {
    await signIn(page, people.administrator);
    await page.goto("/colours");

    const gold = page.getByRole("menuitem", { name: "Gold soft", exact: true });
    await openMenu(page.getByRole("button", { name: /^Colour for “Draft”:/ }), gold);

    // Draft keeps to warm colours: a green is not offered.
    await expect(page.getByRole("menuitem", { name: "Emerald soft", exact: true })).toBeDisabled();

    await gold.click();

    await expect(page.getByRole("button", { name: "Colour for “Draft”: Gold soft" })).toBeVisible();

    // The colour reaches every screen from the root layout, the builder included.
    await page.goto("/builder");
    const style = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--state-draft-bg").trim()
    );
    expect(style).toBe("oklch(0.935 0.045 95)");
  });

  test("an instructor sees the defaults but cannot change them", async ({ page }) => {
    await signIn(page, people.instructor);
    await page.goto("/colours");

    await expect(page.getByText("Only administrators change these.").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /^Colour for “Draft”:/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Hide colours from participants" })).toBeDisabled();
  });
});

/**
 * A participant's own colours (P7): only they see them, and they can hand a
 * programme back to its own colour.
 */
test.describe("My colours", () => {
  test("a participant recolours their programme, and gives it back", async ({ page }) => {
    await signIn(page, people.participant);
    await page.goto("/account");

    const trigger = page.getByRole("button", { name: /^Colour for / }).first();
    const name = (await trigger.getAttribute("aria-label"))!.replace(/^Colour for (.*): .*$/, "$1");

    const rose = page.getByRole("menuitem", { name: "Rose strong", exact: true });
    await openMenu(trigger, rose);
    await rose.click();

    await expect(
      page.getByRole("button", { name: `Colour for ${name}: Rose strong, your colour` })
    ).toBeVisible();

    // My Training shows it as the card's strip.
    await page.goto("/my-training");
    const card = page.getByRole("link", { name: new RegExp(name) });
    await expect(card.locator('[style*="oklch(0.52 0.15 15)"]').first()).toBeAttached();

    await page.goto("/account");
    await page.getByRole("button", { name: new RegExp(`^Colour for ${name}:`) }).click();
    await page.getByRole("menuitem", { name: "Use the programme's colour" }).click();

    await expect(
      page.getByRole("button", { name: new RegExp(`^Colour for ${name}: (?!Rose strong, your colour)`) })
    ).toBeVisible();
  });
});
