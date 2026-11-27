import { expect, test } from "@playwright/test";

/**
 * Forgot your password (P25) and choosing one from an emailed link (P26).
 *
 * A valid link carries a one-time key that only arrives by email, so what a
 * good key does is covered by the plugin's own tests; these check what a
 * person can see and what they are told when the link is no good.
 */
test.describe("Forgot your password", () => {
  test("the sign-in page leads to it, and the answer is the same for any address", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot your password?" }).click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await page.getByLabel("Email address").fill("nobody.at.all@example.test");
    await page.getByRole("button", { name: "Send the link" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText("If that address has an account")).toBeVisible();
  });
});

test.describe("Choosing a password from a link", () => {
  test("a link with nothing in it says so and offers a new one", async ({ page }) => {
    await page.goto("/reset-password");

    await expect(page.getByRole("heading", { name: "This link is not complete" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask for a new link" })).toBeVisible();
  });

  test("a link that is no good is refused in plain words, with a way to ask again", async ({ page }) => {
    await page.goto("/reset-password?login=nobody&key=notarealkey");

    await page.getByLabel("New password", { exact: true }).fill("a-long-enough-password");
    await page.getByLabel("New password again").fill("a-long-enough-password");
    await page.getByRole("button", { name: "Set my password" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "expired or was already used" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ask for a new link" })).toBeVisible();
  });

  test("two passwords that differ are caught before anything is sent", async ({ page }) => {
    await page.goto("/reset-password?login=nobody&key=notarealkey");

    await page.getByLabel("New password", { exact: true }).fill("a-long-enough-password");
    await page.getByLabel("New password again").fill("a-different-long-password");
    await page.getByRole("button", { name: "Set my password" }).click();

    await expect(page.getByRole("alert").filter({ hasText: "not the same" })).toBeVisible();
  });
});
