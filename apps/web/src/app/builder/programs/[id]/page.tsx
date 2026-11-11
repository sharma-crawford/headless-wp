import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@pcle/ui/components/button";
import { Card } from "@pcle/ui/components/card";
import { Input } from "@pcle/ui/components/input";

import { renderAccessError } from "@/components/access-error";
import Breadcrumbs from "@/components/breadcrumbs";
import ActionForm from "@/components/builder/action-form";
import AuthorshipLine from "@/components/builder/authorship-line";
import ColourMenu from "@/components/colours/colour-menu";
import EditableTitle from "@/components/builder/editable-title";
import { NODE_LABELS } from "@/components/builder/node-labels";
import TreeView from "@/components/builder/tree-view";
import PageShell from "@/components/page-shell";
import { FormatBadge, StateBadge } from "@/components/state-badge";
import {
  createNodeAction,
  saveCoverAction,
  saveCreditsAction,
  saveLiveAction,
  saveTopicsAction,
  setFormatAction,
  setStatusAction,
} from "@/app/actions/authoring";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import type { Plan, ProgramAccess, TreeNode, WebinarLive } from "@/lib/types";
import { setProgramAccessAction } from "@/app/actions/plans";
import { getMe, getPlans, getProgramTree } from "@/lib/wordpress";

export default async function BuilderProgramPage({
  params,
}: PageProps<"/builder/programs/[id]">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;

  let tree: TreeNode;

  try {
    tree = await getProgramTree(Number(id));
  } catch (error) {
    return renderAccessError(error, {
      title: "You do not have access to the builder",
      detail:
        "Building courses is limited to instructors and administrators. If you think that should include you, contact your programme administrator.",
    });
  }

  const isDraft = tree.status !== "publish";
  const units = tree.children.filter((child) => child.type === "pcle_unit");
  const isWebinar = tree.format === "webinar";

  /*
   * Which plans open the programme is an administrator's decision, so only
   * an administrator is shown the control. The plugin refuses anyone else
   * regardless.
   */
  let isAdmin = false;
  let plans: Plan[] = [];

  try {
    isAdmin = (await getMe()).is_admin;
    plans = isAdmin ? (await getPlans()).plans : [];
  } catch {
    isAdmin = false;
  }

  return (
    <PageShell code="P10">
      <Breadcrumbs
        trail={[
          { label: "Build", href: "/builder" },
          { label: tree.title },
        ]}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ColourMenu
          nodeId={tree.id}
          title={decodeEntities(tree.title)}
          own={tree.color}
          inherited={null}
          inheritedFrom={null}
        />

        <EditableTitle nodeId={tree.id} title={decodeEntities(tree.title)} />

        <StateBadge state={isDraft ? "draft" : "published"} />

        {isWebinar && (
          <FormatBadge format="webinar" />
        )}

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {/*
            The cohort is the other half of the same programme: who is on it
            and how far they have got. Reached from here rather than from the
            menu, because the question "is anyone actually doing this?" is
            asked while looking at the thing itself.
          */}
          {/*
            What the cohort will meet, rather than what the author sees. An
            author's own passes and completions shape the participant screens
            for them: a quiz they passed while writing it leaves the module it
            gates unlocked. Preview answers as somebody with nothing recorded.
          */}
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/programs/${tree.id}?preview=1`} />}
          >
            Preview as participant
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/reports/${tree.id}`} />}
          >
            Cohort report
          </Button>

          {/*
            A plain link, not <Link>: the answer is a file to save, and
            client-side navigation would try to render it as a page.
          */}
          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/builder/programs/${tree.id}/backup`} download />}
          >
            Download backup
          </Button>

          <ActionForm action={setStatusAction}>
            <input type="hidden" name="id" value={tree.id} />
            <input
              type="hidden"
              name="status"
              value={isDraft ? "publish" : "draft"}
            />
            <Button type="submit" variant="outline">
              {isDraft ? "Publish programme" : "Unpublish programme"}
            </Button>
          </ActionForm>
        </div>
      </div>

      <AuthorshipLine item={tree} />

      {/*
        Hours are entered from the accreditation paperwork, not calculated —
        and the two figures are never added together: an attorney admitted in
        both states reports the same seat time to each bar.
      */}
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
          {tree.credits
            ?.map((credit) =>
              credit.hours > 0
                ? `${credit.label}: ${credit.hours} h`
                : `${credit.label}: not accredited`
            )
            .join(" · ")}
        </summary>

        <ActionForm
          action={saveCreditsAction}
          className="mt-3 flex flex-wrap items-end gap-4"
        >
          <input type="hidden" name="id" value={tree.id} />

          {tree.credits?.map((credit) => (
            <span key={credit.jurisdiction}>
              <label
                htmlFor={`credit-${credit.jurisdiction}`}
                className="block text-xs font-medium text-zinc-600"
              >
                {credit.label}
              </label>
              <Input
                id={`credit-${credit.jurisdiction}`}
                type="number"
                name={`credit_${credit.jurisdiction}`}
                defaultValue={credit.hours > 0 ? credit.hours : ""}
                min="0"
                step="0.25"
                placeholder="—"
                className="mt-1 w-24"
              />
            </span>
          ))}

          <Button type="submit">Save hours</Button>

          <span className="w-full text-xs text-zinc-500">
            Approved hours per jurisdiction, in quarter-hour steps. Leave blank
            where the programme is not accredited. Certificates cannot be
            issued for a programme with no hours.
          </span>
        </ActionForm>
      </details>

      {isAdmin && (
        <ProgrammeAccess programmeId={tree.id} access={tree.access ?? null} plans={plans} />
      )}

      <CatalogueListing
        programmeId={tree.id}
        cover={tree.cover ?? null}
        topics={tree.topics ?? []}
        isDraft={isDraft}
      />

      {/*
        Two submit buttons rather than a select and a save: the choice is the
        action. Becoming a webinar may be refused — a second unit in the way —
        and ActionForm shows the server's reason beside the buttons.
      */}
      <ActionForm
        action={setFormatAction}
        className="mt-4 flex flex-wrap items-center gap-2 text-sm"
      >
        <input type="hidden" name="id" value={tree.id} />
        <span className="text-zinc-500">Format</span>
        <Button
          type="submit"
          name="format"
          value="series"
          size="sm"
          variant={isWebinar ? "outline" : "default"}
          aria-pressed={!isWebinar}
        >
          Series
        </Button>
        <Button
          type="submit"
          name="format"
          value="webinar"
          size="sm"
          variant={isWebinar ? "default" : "outline"}
          aria-pressed={isWebinar}
        >
          Webinar
        </Button>
        <span className="w-full text-xs text-zinc-500">
          A webinar is one video, with an optional quiz. Participants go
          straight to it — there are no units to click through.
        </span>
      </ActionForm>

      {isWebinar ? (
        <Card className="mt-8 p-6">
          {/*
            The unit is still there — progress, certificates and reports all
            count modules inside units — but a webinar's author never needs to
            see it. Drawing the unit's tree shows just the module row, with
            its own editor link and its add menu for a quiz.
          */}
          {units[0] ? (
            <TreeView
              node={units[0]}
              inherited={units[0].color ?? tree.color}
              inheritedFrom={units[0].color ? "unit" : "programme"}
            />
          ) : (
            <p className="text-zinc-600">
              This webinar has no module. Switch to Series and back to
              Webinar to create one.
            </p>
          )}

          <p className="mt-6 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
            Open the module to paste the video address and write the
            description. Add a quiz to it if the webinar needs one.
          </p>
        </Card>
      ) : null}

      {isWebinar ? (
        <LiveSessionForm programmeId={tree.id} live={tree.live ?? null} />
      ) : (
      <Card className="mt-8 p-6">
        {units.length === 0 ? (
          <p className="text-zinc-600">
            Nothing in this programme yet. A unit is a stage of the course —
            add one to start.
          </p>
        ) : (
          <TreeView node={tree} inherited={tree.color} inheritedFrom="programme" />
        )}

        {/*
          The top-level add sits with the tree rather than in a toolbar: a unit
          belongs to this programme, and the whole point of building here is
          that you never pick a parent from a list — it is wherever you clicked.
        */}
        {/*
          One click, named for you. Asking for a title before the thing exists
          was a question with an obvious answer, and it stood between the
          instructor and the only action this page is for.
        */}
        <ActionForm
          action={createNodeAction}
          className="mt-6 border-t border-zinc-100 pt-4"
        >
          <input type="hidden" name="type" value="pcle_unit" />
          <input type="hidden" name="parent_id" value={tree.id} />
          <input type="hidden" name="title" value="New unit" />
          <Button type="submit" variant="outline">
            <PlusIcon className="size-4" />
            Add {NODE_LABELS.pcle_unit.singular.toLowerCase()}
          </Button>
        </ActionForm>
      </Card>
      )}

      <p className="mt-6 text-sm text-zinc-500">
        Click any title to write its body, attach a document or image, or embed
        a video by its address.
      </p>
    </PageShell>
  );
}

/**
 * A webinar's live session: when, how long, and the link to join.
 *
 * Saved on the session hidden inside the webinar, so reminders, attendance
 * and the cohort report all see it. Removing it takes the date away; the
 * session itself is kept if anyone was already marked as attending.
 */
function LiveSessionForm({
  programmeId,
  live,
}: {
  programmeId: number;
  live: WebinarLive | null;
}) {
  // 'Y-m-d H:i:s' -> 'Y-m-d\THH:i' for the input.
  const startsAt = live?.starts_at ? live.starts_at.slice(0, 16).replace(" ", "T") : "";

  return (
    <Card className="mt-6 p-6">
      <h2 className="text-lg font-semibold text-zinc-950">Live session</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {live?.starts_at
          ? "Participants see it under Upcoming on Webinars, and can join from 15 minutes before."
          : "Optional. Give the webinar a date to hold it live; it moves to On demand once it has finished."}
      </p>

      {/*
        Keyed on what is saved, so a save that changes it draws a fresh form.
        The inputs are uncontrolled: without the key, the refresh after a save
        would change their default values in place, which Base UI rejects.
      */}
      <ActionForm
        key={`${live?.starts_at ?? ""}|${live?.duration ?? ""}|${live?.join_url ?? ""}`}
        action={saveLiveAction}
        className="mt-4 grid gap-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-end"
      >
        <input type="hidden" name="id" value={programmeId} />

        <span>
          <label htmlFor="live-starts" className="block text-xs font-medium text-zinc-600">
            Date and time (site timezone)
          </label>
          <Input
            id="live-starts"
            type="datetime-local"
            name="starts_at"
            defaultValue={startsAt}
            className="mt-1"
          />
        </span>

        <span>
          <label htmlFor="live-duration" className="block text-xs font-medium text-zinc-600">
            Length (minutes)
          </label>
          <Input
            id="live-duration"
            type="number"
            name="duration"
            min="5"
            max="600"
            step="5"
            defaultValue={live?.duration ?? 60}
            className="mt-1 w-28"
          />
        </span>

        <span>
          <label htmlFor="live-join" className="block text-xs font-medium text-zinc-600">
            Join link
          </label>
          <Input
            id="live-join"
            type="url"
            name="join_url"
            placeholder="https://zoom.us/j/…"
            defaultValue={live?.join_url ?? ""}
            className="mt-1"
          />
        </span>

        <span className="flex flex-wrap gap-2 sm:col-span-3">
          <Button type="submit" name="intent" value="save">
            {live?.starts_at ? "Save session" : "Schedule session"}
          </Button>
          {live?.starts_at && (
            <Button type="submit" name="intent" value="remove" variant="outline">
              Remove session
            </Button>
          )}
        </span>
      </ActionForm>
    </Card>
  );
}

/**
 * How the programme appears in the public catalogue: its cover and topics.
 *
 * Folded away like the credit hours, because it is set once and rarely
 * revisited. The summary line says what is set without opening it.
 */
function CatalogueListing({
  programmeId,
  cover,
  topics,
  isDraft,
}: {
  programmeId: number;
  cover: string | null;
  topics: string[];
  isDraft: boolean;
}) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
        Catalogue: {cover ? "cover image" : "no cover"} ·{" "}
        {topics.length > 0 ? topics.join(", ") : "no topics"}
        {isDraft && " · not listed while a draft"}
      </summary>

      <div className="mt-3 grid gap-6 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="The programme's cover" className="size-full object-cover" />
            ) : (
              <span className="grid size-full place-items-center px-3 text-center text-xs text-zinc-500">
                Drawn in the programme&apos;s colour until an image is chosen
              </span>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <ActionForm action={saveCoverAction} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="id" value={programmeId} />
            <span className="w-full">
              <label htmlFor="cover-file" className="block text-xs font-medium text-zinc-600">
                Cover image
              </label>
              <input
                id="cover-file"
                type="file"
                name="cover"
                accept="image/jpeg,image/png,image/webp"
                className="mt-1 block w-full text-sm text-zinc-700 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-800 hover:file:bg-zinc-200"
              />
            </span>
            <Button type="submit" name="intent" value="upload" size="sm">
              {cover ? "Replace cover" : "Upload cover"}
            </Button>
            {cover && (
              <Button type="submit" name="intent" value="remove" size="sm" variant="outline">
                Remove
              </Button>
            )}
            <span className="w-full text-xs text-zinc-500">
              Landscape, at least 1200 px wide. Shown to anyone, signed in or
              not, once the programme is published.
            </span>
          </ActionForm>

          {/* Keyed on the saved topics, so a save draws a fresh field. */}
          <ActionForm
            key={topics.join("|")}
            action={saveTopicsAction}
            className="flex flex-wrap items-end gap-2"
          >
            <input type="hidden" name="id" value={programmeId} />
            <span className="min-w-0 flex-1">
              <label htmlFor="topics" className="block text-xs font-medium text-zinc-600">
                Topics
              </label>
              <Input
                id="topics"
                name="topics"
                defaultValue={topics.join(", ")}
                placeholder="Asylum, Detention, Appeals"
                className="mt-1"
              />
            </span>
            <Button type="submit" size="sm">
              Save topics
            </Button>
            <span className="w-full text-xs text-zinc-500">
              Separated by commas. Readers filter the catalogue by these.
            </span>
          </ActionForm>
        </div>
      </div>
    </details>
  );
}

/**
 * Which plans open this programme, and whether it is also sold on its own.
 *
 * Choosing a plan means "this plan and every one above it" — the ranks do
 * the rest. The select lists the plans by name, because nobody proposes a
 * programme for "rank 2" at a meeting.
 */
function ProgrammeAccess({
  programmeId,
  access,
  plans,
}: {
  programmeId: number;
  access: ProgramAccess | null;
  plans: Plan[];
}) {
  const minRank = access?.min_rank ?? 0;
  // The plan whose rank is the minimum, or the cheapest one above it.
  const selected = minRank ? (plans.find((plan) => plan.rank >= minRank)?.rank ?? 0) : 0;

  const summary = [
    access?.plan ? `in ${access.plan.name} and above` : "in no plan",
    access?.sold_alone ? `sold alone${access.price ? ` for ${access.price}` : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
        Access: {summary}
      </summary>

      <ActionForm
        key={`${minRank}|${access?.sold_alone}|${access?.price}`}
        action={setProgramAccessAction}
        className="mt-3 grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end"
      >
        <input type="hidden" name="id" value={programmeId} />

        <span>
          <label htmlFor="access-plan" className="block text-xs font-medium text-zinc-600">
            Included in
          </label>
          <select
            id="access-plan"
            name="min_rank"
            defaultValue={String(selected)}
            className="mt-1 h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
          >
            <option value="0">No plan — enrolment or purchase only</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.rank}>
                {plan.name} and above
              </option>
            ))}
          </select>
        </span>

        <span className="flex flex-wrap items-end gap-3">
          <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" name="sold_alone" defaultChecked={access?.sold_alone} className="size-4" />
            Also sold on its own
          </label>
          <span className="min-w-0 flex-1">
            <label htmlFor="access-price" className="block text-xs font-medium text-zinc-600">
              Price alone
            </label>
            <Input id="access-price" name="price" defaultValue={access?.price} placeholder="$49" className="mt-1" />
          </span>
        </span>

        <span className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" size="sm">
            Save access
          </Button>
          {plans.length === 0 && (
            <span className="text-xs text-zinc-500">
              No plans exist yet. <Link href="/plans" className="underline">Create them on Plans.</Link>
            </span>
          )}
        </span>
      </ActionForm>
    </details>
  );
}
