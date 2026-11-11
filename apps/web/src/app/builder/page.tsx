import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";

import { renderAccessError } from "@/components/access-error";
import ActionForm from "@/components/builder/action-form";
import {
  createProgramAction,
  restoreProgramAction,
} from "@/app/actions/authoring";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import StudioBrowser from "@/components/studio/studio-browser";
import StudioCard from "@/components/studio/studio-card";
import { isAuthenticated } from "@/lib/auth";
import type { AuthoringProgram } from "@/lib/types";
import { getAuthoringPrograms } from "@/lib/wordpress";

export default async function BuilderPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  let programs: AuthoringProgram[];

  try {
    ({ programs } = await getAuthoringPrograms());
  } catch (error) {
    // A participant who guesses this URL gets the same 403 panel as anywhere
    // else. WordPress decides; this only translates the answer.
    return renderAccessError(error, {
      title: "You do not have access to the builder",
      detail:
        "Building courses is limited to instructors and administrators. If you think that should include you, contact your programme administrator.",
    });
  }

  const published = programs.filter((program) => program.status === "publish").length;
  const participants = programs.reduce(
    (total, program) => total + (program.cohort?.participants ?? program.enrollees),
    0
  );

  const cards = Object.fromEntries(
    programs.map((program) => [program.id, <StudioCard key={program.id} program={program} />])
  );

  return (
    <PageShell code="P9" wide>
      <PageHeading
        eyebrow="Build"
        title="Your programmes"
        intro="Write, organise and publish courses and webinars. Changes stay drafts until you publish them."
      />

      {/*
        A programme is named up front, unlike everything else in the builder:
        it has no parent to be created inside. Everything below it is created
        with one click and renamed where it is edited.
      */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Published" value={published} />
          <Stat label="Drafts" value={programs.length - published} />
          <Stat label="Participants" value={participants} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 lg:w-[26rem]">
          <ActionForm action={createProgramAction} className="flex gap-2">
            <Input
              type="text"
              name="title"
              placeholder="Immigration Habeas Corpus — Spring 2027"
              aria-label="Title for the new programme"
              className="h-10 min-w-0 flex-1"
            />
            <Button type="submit" className="h-10 px-4">
              <PlusIcon className="size-4" />
              New programme
            </Button>
          </ActionForm>

          {/*
            Tucked away: restoring is rare. A restore always makes a new draft
            beside the others — it never replaces the one the backup came from.
          */}
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-900">
              Restore from a backup
            </summary>

            <ActionForm
              action={restoreProgramAction}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <Input
                type="file"
                name="backup"
                accept="application/json,.json"
                aria-label="Backup file"
                className="min-w-0 flex-1"
              />
              <Button type="submit" variant="outline">
                Restore as a new programme
              </Button>
              <span className="w-full text-xs text-zinc-500">
                A backup is downloaded from a programme&rsquo;s page. It comes
                back as a new draft, with nobody enrolled; nothing that exists
                is changed.
              </span>
            </ActionForm>
          </details>
        </div>
      </div>

      <div className="mt-10">
        {programs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
            Start your first programme: give it a title above.
          </p>
        ) : (
          <StudioBrowser programs={programs} cards={cards} />
        )}
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
