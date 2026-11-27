import { expect, test } from "@playwright/test";

import { people } from "./support/people";
import { signIn } from "./support/session";

/**
 * The Castle (P24) is the entrance and holds no content of its own. Three doors,
 * each a place with one purpose, and one Library: the page the header's Library
 * link and the courtyard's Library door both open.
 */
test.describe("The Castle", () => {
  test("the courtyard has the doors, and the Library door opens the Library", async ({ page }) => {
    await page.goto("/castle");

    // Three rooms and the reader's own door: signed out, it asks them to sign in.
    const doors = page.getByLabel("Castle entrances");
    await expect(doors.getByRole("link")).toHaveCount(4);
    await expect(doors.getByRole("link", { name: /My Training/ })).toHaveAttribute("href", "/login");
    await expect(doors.getByText("Sign in to see your training")).toBeVisible();

    await doors.getByRole("link", { name: /Library/ }).click();
    await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();

    // The header does not repeat the doors: it carries Castle and the reader's menu.
    await expect(page.getByRole("banner").getByRole("link", { name: "Library" })).toHaveCount(0);
    await expect(page.getByRole("banner").getByRole("link", { name: "Castle" })).toBeVisible();
  });

  test("an old address for the library still opens the Library", async ({ page }) => {
    for (const hash of ["library", "program-5", "study-contracts"]) {
      await page.goto(`/castle#${hash}`);
      await expect(page.getByRole("heading", { name: "Library", level: 1 })).toBeVisible();
    }
  });

  test("the Library lists the courses that are still code beside the rest, and Immigration 101 is free", async ({ page }) => {
    await page.goto("/castle#list");

    // One search for all of it, and a Live soon filter.
    await expect(page.getByLabel("Search the Library")).toBeVisible();
    await expect(page.getByRole("button", { name: "Live soon" })).toBeVisible();

    // A law-school card goes straight to its room, with no page in between.
    const contracts = page.getByRole("link", { name: /Contracts/ }).first();
    await expect(contracts).toHaveAttribute("href", "/study/contracts");

    const free = page.getByRole("link", { name: /Immigration 101/ }).first();
    await expect(free).toContainText("Free");
    await expect(free).toHaveAttribute("href", /advocate-101/);
  });

  test("the Council Chamber says who each resource is for; the Training Hall is practice only", async ({ page }) => {
    await page.goto("/castle#council");
    await expect(page.getByRole("heading", { name: "Rights & Resources", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "For families", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "For families and practitioners" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "For practitioners", exact: true })).toBeVisible();
    // Immigration 101 is a course: pointed to from here, not listed as a resource.
    await expect(page.getByRole("link", { name: /Start with Immigration 101/ })).toBeVisible();

    await page.goto("/castle#training");
    await expect(page.getByRole("heading", { name: "Courtroom Practice", level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Roll the Dice/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Simulator/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Virtual Tour/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open My Training →" })).toHaveCount(0);
  });

  test("each label says the place, what it is for, and one action", async ({ page }) => {
    await page.goto("/castle");
    const doors = page.getByLabel("Castle entrances");

    await expect(doors.getByRole("link", { name: /^Library Learn: every course/ })).toBeVisible();
    await expect(doors.getByRole("link", { name: /Council Chamber Consult: rights and resources/ })).toBeVisible();
    await expect(doors.getByRole("link", { name: /Training Hall Practice: court tour, Dice, Simulator/ })).toBeVisible();
  });
});

test.describe("The Castle, signed in", () => {
  test("My Training is the reader's own door, and says what is next", async ({ page }) => {
    await signIn(page, people.participant);
    await page.goto("/castle");

    const mine = page.getByLabel("Castle entrances").getByRole("link", { name: /My Training/ });
    await expect(mine).toHaveAttribute("href", "/my-training");
    await expect(mine).not.toContainText("Sign in");
  });
});
