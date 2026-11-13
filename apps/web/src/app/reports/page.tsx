import Link from "next/link";
import { redirect } from "next/navigation";

import { renderAccessError } from "@/components/access-error";
import { ColourStrip } from "@/components/colour-marks";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import { StateBadge } from "@/components/state-badge";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import type { AuthoringProgram } from "@/lib/types";
import { getAuthoringPrograms } from "@/lib/wordpress";

/**
 * Which cohort to report on.
 *
 * The list comes from the authoring endpoint because it answers the same
 * question the report guard asks — which programmes may this person work on —
 * and having two lists that could disagree about that is worse than reusing
 * one that cannot.
 */
export default async function ReportsPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  let programs: AuthoringProgram[];

  try {
    ({ programs } = await getAuthoringPrograms());
  } catch (error) {
    return renderAccessError(error, {
      title: "You do not have access to reports",
      detail:
        "Cohort reports are limited to instructors and administrators. If you think that should include you, contact your programme administrator.",
    });
  }

  const participants = programs.reduce(
    (total, program) => total + (program.cohort?.participants ?? program.enrollees),
    0
  );
  const withCohort = programs.filter((program) => (program.cohort?.participants ?? 0) > 0);
  const average = withCohort.length
    ? Math.round(
        withCohort.reduce((total, program) => total + (program.cohort?.percent ?? 0), 0) /
          withCohort.length
      )
    : 0;

  return (
    <PageShell code="P12" wide>
      <PageHeading
        eyebrow="Reports"
        title="Reports"
        intro="Who is taking each programme, what they have completed, and what is outstanding."
      />

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Programmes" value={String(programs.length)} />
        <Stat label="Participants" value={String(participants)} />
        <Stat label="Average progress" value={`${average}%`} />
      </div>

      {programs.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
          There are no programmes yet.
        </p>
      ) : (
        <ul className="mt-8 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {programs.map((program) => {
            const cohort = program.cohort ?? { participants: program.enrollees, percent: 0 };

            return (
              <li key={program.id} className="border-t border-zinc-100 first:border-t-0">
                <Link
                  href={`/reports/${program.id}`}
                  className="group relative flex flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 transition hover:bg-zinc-50"
                >
                  <ColourStrip swatch={program.color} />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-zinc-950 group-hover:text-brand-800">
                        {decodeEntities(program.title)}
                      </h2>
                      {program.status !== "publish" && <StateBadge state="draft" />}
                    </div>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {cohort.participants} {cohort.participants === 1 ? "participant" : "participants"} ·{" "}
                      {program.modules} {program.modules === 1 ? "module" : "modules"}
                    </p>
                  </div>

                  <div className="w-48">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Average progress</span>
                      <span className="font-semibold text-zinc-800">{cohort.percent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${cohort.percent}%` }} />
                    </div>
                  </div>

                  <span aria-hidden="true" className="text-zinc-300 group-hover:text-brand-600">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}
