import { expect, test } from "@playwright/test";

import { people } from "./support/people";
import { signIn } from "./support/session";
import { WordPress } from "./support/wordpress";

// A 2×2 PNG, so the cover is a real image WordPress will accept.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGNkYPjPwMDAxMDAwMDAAAAWBgEDqqZ1jwAAAABJRU5ErkJggg==",
  "base64"
);

/**
 * The catalogue (P18, P19) is the one part of the platform a stranger can
 * read. These check both halves of that: it opens signed out, and what an
 * author sets in the builder is what a stranger sees.
 */
test.describe("The public catalogue", () => {
  let wordpress: WordPress;
  let programme: { id: number; title: string };
  const topic = `E2E Topic ${Math.random().toString(36).slice(2, 7)}`;

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
    programme = await wordpress.firstProgramme();
  });

  test.afterAll(async () => {
    await wordpress.updateNode(programme.id, { topics: [], cover: 0 });
  });

  test("someone signed out can browse it and open a programme", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Browse the catalogue" }).click();

    await expect(page).toHaveURL(/\/catalogue$/);
    await expect(page.getByRole("heading", { name: "Courses and webinars" })).toBeVisible();
    // The public header: a way in, and nothing that needs an account.
    await expect(page.getByRole("banner").getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "My Training" })).toHaveCount(0);

    await page.getByRole("link", { name: new RegExp(programme.title) }).click();

    await expect(page).toHaveURL(new RegExp(`/catalogue/${programme.id}$`));
    await expect(page.getByRole("heading", { level: 1, name: programme.title })).toBeVisible();
    // Whatever plan it is in, a stranger is offered a way in.
    await expect(
      page.getByRole("complementary").getByRole("button", { name: "Sign in", exact: true })
    ).toBeVisible();
  });

  test("search narrows the list, and says when nothing matches", async ({ page }) => {
    await page.goto("/catalogue");

    await page.getByLabel("Search the catalogue").fill("zzzz-nothing-is-called-this");
    await expect(page.getByText("Nothing matches.")).toBeVisible();

    await page.getByRole("button", { name: "Clear the filters" }).click();
    await expect(page.getByRole("link", { name: new RegExp(programme.title) })).toBeVisible();
  });

  test("an author's topics and cover are what a stranger sees", async ({ page, browser }) => {
    await signIn(page, people.instructor);
    await page.goto(`/builder/programs/${programme.id}`);

    // Folded away like the credit hours; open it once, and it stays open.
    const listing = page.locator("details", { hasText: "Catalogue:" });
    const open = async () => {
      if ((await listing.getAttribute("open")) === null) {
        await page.getByText(/^Catalogue:/).click();
      }
    };

    await open();
    await page.getByLabel("Topics").fill(topic);
    await page.getByRole("button", { name: "Save topics" }).click();
    await expect(page.getByText(new RegExp(`Catalogue: .*${topic}`))).toBeVisible();

    await open();
    await page.getByLabel("Cover image").setInputFiles({
      name: "e2e-cover.png",
      mimeType: "image/png",
      buffer: PNG,
    });
    await page.getByRole("button", { name: "Upload cover" }).click();
    await expect(page.getByText(/^Catalogue: cover image/)).toBeVisible();

    // A fresh context: nobody signed in.
    const stranger = await browser.newPage();
    await stranger.goto("/catalogue");
    await stranger.getByRole("button", { name: topic }).click();

    const card = stranger.getByRole("link", { name: new RegExp(programme.title) });
    await expect(card).toBeVisible();

    const cover = card.locator("img");
    await expect(cover).toHaveCount(1);
    // Loaded, not just present: protected delivery has to let a stranger have it.
    await expect
      .poll(() => cover.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth))
      .toBeGreaterThan(0);

    await stranger.close();
  });
});
