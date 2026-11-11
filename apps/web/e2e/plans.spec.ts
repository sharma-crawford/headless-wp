import { expect, test } from "@playwright/test";

import { people } from "./support/people";
import { signIn, signOut } from "./support/session";
import { WordPress } from "./support/wordpress";

/**
 * Plans, end to end and by hand: an administrator defines a plan, puts a
 * programme in it, and gives someone the plan — who can then open it. No
 * enrolment anywhere, which is the point: the plan alone opens it.
 */
test.describe("Plans", () => {
  let wordpress: WordPress;
  let programme: { id: number; title: string };
  let outsiderId: number;
  const name = `E2E Plan ${Math.random().toString(36).slice(2, 7)}`;
  // High, so it cannot collide with any plan a developer's site already has.
  const rank = 90 + Math.floor(Math.random() * 9);

  const outsider = { username: "demo.outsider", password: people.participant.password };

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
    programme = await wordpress.firstProgramme();
    outsiderId = (await wordpress.userId(await wordpress.emailOf(outsider.username)))!;
  });

  test.afterAll(async () => {
    await wordpress.setPlan(outsiderId, "");
    await wordpress.updateNode(programme.id, { access: { min_rank: 0, sold_alone: false, price: "" } });

    for (const plan of await wordpress.plans()) {
      if (plan.name === name) {
        await wordpress.deletePlan(plan.id);
      }
    }
  });

  test("an administrator defines a plan and it is on the Pricing page", async ({ page }) => {
    await signIn(page, people.administrator);
    await page.goto("/plans");

    const form = page.locator("section", { hasText: "New plan" });
    await form.getByLabel("Name").fill(name);
    await form.getByLabel("Rank").fill(String(rank));
    await form.getByLabel("Price, as shown").fill("$1 a year");
    await form.getByLabel("What it includes, one per line").fill("Everything tested");
    await form.getByRole("button", { name: "Create plan" }).click();

    await expect(page.getByRole("heading", { level: 2, name })).toBeVisible();

    await page.goto("/pricing");
    const card = page.getByRole("article").filter({ hasText: name });
    await expect(card.getByText("$1 a year")).toBeVisible();
    await expect(card.getByText("Everything tested")).toBeVisible();
  });

  test("the plan opens a programme for whoever holds it", async ({ page }) => {
    // Before: refused, and shown the catalogue page instead.
    await signIn(page, outsider);
    await page.goto(`/programs/${programme.id}`);
    await expect(page).toHaveURL(/locked=1$/);

    // An administrator puts the programme in the plan…
    await signOut(page);
    await signIn(page, people.administrator);
    await page.goto(`/builder/programs/${programme.id}?tab=access`);
    await page.getByLabel("Included in").selectOption({ label: `${name} and above` });
    await page.getByRole("button", { name: "Save access" }).click();
    await expect(page.getByText(`Access: in ${name} and above`)).toBeVisible();

    // …and gives it to the outsider on People.
    await page.goto("/people");
    const row = page.getByRole("row").filter({ hasText: outsider.username });
    await row.getByLabel(/^Plan for/).selectOption({ label: name });
    await row.getByRole("button", { name: "Save" }).click();
    await expect(row.getByLabel(/^Plan for/)).toHaveValue(/.+/);

    // After: theirs, with no enrolment.
    await signOut(page);
    await signIn(page, outsider);
    await expect(page.getByRole("link", { name: new RegExp(programme.title) }).first()).toBeVisible();

    await page.goto(`/programs/${programme.id}`);
    await expect(page).toHaveURL(new RegExp(`/programs/${programme.id}$`));
    await expect(page.getByRole("heading", { level: 1, name: programme.title })).toBeVisible();

    await page.goto("/account");
    await expect(page.getByText(`Your plan: ${name}`)).toBeVisible();
  });

  test("an instructor is not offered plans", async ({ page }) => {
    await signIn(page, people.instructor);

    await expect(page.getByRole("banner").getByRole("button", { name: "Plans" })).toHaveCount(0);

    await page.goto(`/builder/programs/${programme.id}`);
    await expect(page.getByRole("link", { name: "Access", exact: true })).toHaveCount(0);

    // Nor by typing the address: the tab is not drawn for them.
    await page.goto(`/builder/programs/${programme.id}?tab=access`);
    await expect(page.getByLabel("Included in")).toHaveCount(0);
  });
});
