import { expect, test } from "@playwright/test";

import { people } from "./support/people";
import { signIn } from "./support/session";
import { WordPress } from "./support/wordpress";

/**
 * A webinar is one video. The author says so with one click, and the
 * participant lands on the video with nothing to navigate through.
 */
test.describe("Webinars", () => {
  let wordpress: WordPress;
  let programme: { id: number; title: string };
  let participantEmail: string;

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
    programme = await wordpress.createNode("pcle_program", "E2E Webinar");
    participantEmail = await wordpress.emailOf(people.participant.username);
  });

  test.afterAll(async () => {
    await wordpress.remove(programme.id, participantEmail);
    await wordpress.deleteNode(programme.id, true);
  });

  test("an author turns a programme into a webinar", async ({ page }) => {
    await signIn(page, people.instructor);
    await page.goto(`/builder/programs/${programme.id}`);

    await page.getByRole("button", { name: "Webinar", exact: true }).click();

    await expect(
      page.getByRole("button", { name: "Webinar", exact: true })
    ).toHaveAttribute("aria-pressed", "true");

    // The one module, named after the programme; no unit to add.
    const tree = await wordpress.tree(programme.id);
    const unit = tree.children?.[0];
    expect(unit?.type).toBe("pcle_unit");
    expect(unit?.children?.[0]?.type).toBe("pcle_module");

    await expect(page.getByRole("button", { name: "Add unit" })).toHaveCount(0);
  });

  test("a participant lands straight on the video", async ({ page }) => {
    const tree = await wordpress.tree(programme.id);
    const courseModule = tree.children![0].children![0];

    await wordpress.updateNode(courseModule.id, { body: "The recording." });

    // Only the programme: its author cannot see the unit to publish it, so
    // publishing the webinar has to be enough.
    await wordpress.updateNode(programme.id, { status: "publish" });

    await wordpress.enrol(programme.id, participantEmail);

    await signIn(page, people.participant);
    await page.goto("/my-training");

    const card = page.getByRole("link", { name: /E2E Webinar/ });
    await expect(card.getByText("Webinar", { exact: true })).toBeVisible();

    await card.click();

    await expect(page).toHaveURL(new RegExp(`/modules/${courseModule.id}$`));
    await expect(page.getByText("The recording.")).toBeVisible();

    // Back to My Training in one step: there is no unit or programme screen
    // to return to.
    const trail = page.getByRole("navigation", { name: /breadcrumb/i });
    await expect(trail.getByRole("link")).toHaveCount(1);
  });
});

/**
 * The webinars hub (P17): an author schedules a webinar live, and its
 * participants find it under Upcoming with a calendar file to keep.
 */
test.describe("The webinars hub", () => {
  let wordpress: WordPress;
  let programme: { id: number; title: string };
  let participantEmail: string;

  // Three days out, written as a datetime-local value. Whatever the site's
  // timezone, three days is still in the future.
  const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  test.beforeAll(async () => {
    wordpress = await WordPress.asAdministrator();
    programme = await wordpress.createNode("pcle_program", "E2E Live Webinar");
    await wordpress.updateNode(programme.id, { format: "webinar" });
    await wordpress.updateNode(programme.id, { status: "publish" });
    participantEmail = await wordpress.emailOf(people.participant.username);
    await wordpress.enrol(programme.id, participantEmail);
  });

  test.afterAll(async () => {
    await wordpress.remove(programme.id, participantEmail);
    await wordpress.deleteNode(programme.id, true);
  });

  test("an author schedules a webinar's live session", async ({ page }) => {
    await signIn(page, people.instructor);
    await page.goto(`/builder/programs/${programme.id}`);

    await page.getByLabel("Date and time (site timezone)").fill(inThreeDays);
    await page.getByLabel("Length (minutes)").fill("90");
    await page.getByLabel("Join link").fill("https://zoom.example/j/e2e");
    await page.getByRole("button", { name: "Schedule session" }).click();

    await expect(page.getByRole("button", { name: "Remove session" })).toBeVisible();
  });

  test("its participant finds it under Upcoming, with a calendar file", async ({
    page,
  }) => {
    await signIn(page, people.participant);
    await page.getByRole("banner").getByRole("button", { name: "Webinars" }).click();

    await expect(page).toHaveURL(/\/webinars$/);

    const upcoming = page.getByRole("region", { name: "Upcoming live sessions" });
    const card = upcoming.getByRole("article").filter({ hasText: programme.title });
    await expect(card).toBeVisible();
    await expect(card.getByText("Live webinar", { exact: true })).toBeVisible();
    await expect(card.getByText(/90 min/)).toBeVisible();
    // Three days out, the room is not open yet.
    await expect(card.getByText("Join opens 15 min before")).toBeVisible();

    const href = await card.getByRole("link", { name: "Add to calendar" }).getAttribute("href");
    const ics = await page.request.get(href!);
    expect(ics.headers()["content-type"]).toContain("text/calendar");
    const body = await ics.text();
    expect(body).toContain(`SUMMARY:${programme.title}`);
    expect(body).toContain("https://zoom.example/j/e2e");
  });

  test("someone not enrolled is not offered it", async ({ page }) => {
    await wordpress.remove(programme.id, participantEmail);

    await signIn(page, people.participant);
    await page.goto("/webinars");

    await expect(page.getByRole("heading", { name: "Webinars", level: 1 })).toBeVisible();
    await expect(page.getByText(programme.title)).toHaveCount(0);

    await wordpress.enrol(programme.id, participantEmail);
  });
});
