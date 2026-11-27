import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Opens the reader's menu in the Armory header and returns it. What a reader has
 * (My Training, Account, the staff paths, Log out) lives there; the header itself
 * carries only Castle and the menu.
 */
export async function openAccountMenu(page: Page): Promise<Locator> {
  const trigger = page.getByRole("banner").getByRole("button", { name: /account menu/i });
  const menu = page.getByRole("menu");

  // A click before the page has hydrated opens nothing; click again until it is open.
  await expect(async () => {
    if (!(await menu.isVisible())) {
      await trigger.click();
    }
    await expect(menu).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 20_000 });

  return menu;
}
