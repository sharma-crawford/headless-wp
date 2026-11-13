import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@pcle/ui/components/button";
import { Card, CardContent } from "@pcle/ui/components/card";

import { renderAccessError } from "@/components/access-error";
import Breadcrumbs from "@/components/breadcrumbs";
import EnrollParticipants from "@/components/enroll-participants";
import PageShell from "@/components/page-shell";
import RemoveParticipant from "@/components/remove-participant";
import { StateBadge } from "@/components/state-badge";
import { isAuthenticated } from "@/lib/auth";
import type { State } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import type { ProgramReport, ReportParticipant } from "@/lib/types";
import { getMe, getProgramReport } from "@/lib/wordpress";

/** A date the site recorded, or an honest admission that it did not. */
function RecordedDate({ value }: { value: string | null }) {
  if (!value) {
    return <span className="text-zinc-400">not recorded</span>;
  }

  return <>{value.slice(0, 10)}</>;
}

/**
 * Where a participant stands, for the status column.
 *
 * Not started is told apart from in progress: an instructor looking for who
 * has not begun should not have to read the modules column row by row.
 */
function participantState(row: ReportParticipant): State {
  if (row.finished) return "complete";
  return row.completed > 0 ? "inProgress" : "notStarted";
}

function ParticipantRow({
  row,
  programId,
}: {
  row: ReportParticipant;
  programId: number;
}) {
  return (
    <tr className="border-t border-zinc-100 align-top hover:bg-zinc-50/60">
      <td className="py-3.5 pr-4 pl-6">
        {/*
          The way into marking this person's modules. Participants no longer
          mark their own, so this is where a completion gets recorded.
        */}
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800"
          >
            {initials(row.name)}
          </span>
          <span>
            <Link
              href={`/reports/${programId}/participants/${row.id}`}
              className="font-medium text-zinc-900 underline-offset-2 hover:text-brand-800 hover:underline"
            >
              {row.name}
            </Link>
            <span className="block text-xs text-zinc-500">{row.email}</span>
          </span>
        </div>
      </td>

      <td className="py-3.5 pr-4 text-sm text-zinc-600">
        <RecordedDate value={row.enrolled_at} />
      </td>

      <td className="py-3.5 pr-4 text-sm text-zinc-900">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200" aria-hidden="true">
            <span
              className={row.finished ? "block h-full rounded-full bg-emerald-600" : "block h-full rounded-full bg-brand-600"}
              style={{ width: `${row.percent}%` }}
            />
          </span>
          {row.completed} / {row.total}
          <span className="text-zinc-500">({row.percent}%)</span>
        </span>

        {/*
          Said on the row rather than in a footnote: it changes what the row
          can be used to claim.
        */}
        {row.undated > 0 && (
          <div className="text-xs text-zinc-500">
            {row.undated}{" "}
            {row.undated === 1 ? "completion" : "completions"} without a date
          </div>
        )}
      </td>

      <td className="py-3.5 pr-4 text-sm text-zinc-600">
        {row.attended} / {row.sessions}
      </td>

      <td className="py-3.5 pr-4 text-sm text-zinc-600">
        {row.quizzes_passed} / {row.quizzes}

        {row.required_outstanding > 0 && (
          <div className="text-xs text-amber-700">
            {row.required_outstanding} required{" "}
            {row.required_outstanding === 1 ? "quiz" : "quizzes"} outstanding
          </div>
        )}
      </td>

      <td className="py-3.5 pr-4 text-sm">
        <StateBadge state={participantState(row)}>
          {row.finished ? "Finished" : undefined}
        </StateBadge>
      </td>

      <td className="py-3.5 pr-6 text-right">
        <RemoveParticipant
          programId={programId}
          userId={row.id}
          name={row.name}
        />
      </td>
    </tr>
  );
}

export default async function ProgramReportPage({
  params,
}: PageProps<"/reports/[id]">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id } = await params;

  let report: ProgramReport;

  try {
    report = await getProgramReport(Number(id));
  } catch (error) {
    return renderAccessError(error, {
      title: "You do not have access to this report",
      detail:
        "Cohort reports are limited to instructors and administrators. If you think that should include you, contact your programme administrator.",
    });
  }

  /*
   * Whether to offer the invite control. Fails closed: the report itself has
   * already loaded by here, and losing the whole screen because this second
   * request failed would be a worse answer than not offering a checkbox.
   */
  let canInvite = false;

  try {
    canInvite = (await getMe()).can_invite;
  } catch {
    canInvite = false;
  }

  const title = report.program ? decodeEntities(report.program.title) : "Report";
  const people = report.participants.length;
  const finished = report.participants.filter((row) => row.finished).length;
  const average = people
    ? Math.round(report.participants.reduce((total, row) => total + row.percent, 0) / people)
    : 0;
  const outstanding = report.participants.reduce((total, row) => total + row.required_outstanding, 0);

  return (
    <PageShell code="P13" wide>
      <Breadcrumbs
        trail={[{ label: "Reports", href: "/reports" }, { label: title }]}
      />

      <div className="mt-4 flex flex-wrap items-end gap-4 border-b border-zinc-200 pb-6">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">
            Cohort report
          </p>
          <h1 className="mt-1.5 text-3xl font-semibold text-zinc-950 sm:text-4xl">{title}</h1>
          {/*
            The programme's approved hours belong to the programme, not to any
            participant, so they are stated once rather than down a column.
          */}
          <p className="mt-2 text-sm text-zinc-500">
            {report.credits
              .map((credit) =>
                credit.hours > 0
                  ? `${credit.label}: ${credit.hours} h`
                  : `${credit.label}: not accredited`
              )
              .join(" · ")}
          </p>
        </div>

        {/*
          The same programme has three screens — this one, the editor, and
          what a participant sees — and until now no way between them. An
          instructor reading that nobody has finished module three had to
          return to the menu, open the builder and find the programme again
          by name. They are the same object; these say so.
        */}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/builder/programs/${id}`} />}
          >
            Open in builder
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/programs/${id}`} />}
          >
            View as participant
          </Button>

          <Button
            variant="outline"
            nativeButton={false}
            render={<a href={`/reports/${id}/csv`} />}
          >
            Download CSV
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Participants" value={String(people)} />
        <Stat label="Finished" value={String(finished)} />
        <Stat label="Average progress" value={`${average}%`} />
        <Stat
          label="Required quizzes outstanding"
          value={String(outstanding)}
          warn={outstanding > 0}
        />
      </div>

      <EnrollParticipants programId={Number(id)} canInvite={canInvite} />

      {report.participants.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
          Nobody is enrolled in this programme yet. Add people above.
        </p>
      ) : (
        <Card className="mt-8 p-0">
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full min-w-[48rem] text-left">
              <thead className="bg-zinc-50">
                <tr className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  <th className="py-3 pr-4 pl-6">Participant</th>
                  <th className="py-3 pr-4">Enrolled</th>
                  <th className="py-3 pr-4">Modules</th>
                  <th className="py-3 pr-4">Sessions</th>
                  <th className="py-3 pr-4">Quizzes</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="sr-only py-3 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {report.participants.map((row) => (
                  <ParticipantRow
                    key={row.id}
                    row={row}
                    programId={Number(id)}
                  />
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-sm text-zinc-500">
        Records as they stand, not conclusions. Whether they support a credit
        claim is a judgement for the person filing it.
      </p>
    </PageShell>
  );
}

/** Up to two letters from a name, for the round badge beside it. */
function initials(name: string): string {
  return (
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "·"
  );
}

function Stat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p
        className={
          warn
            ? "mt-1 font-serif text-3xl font-semibold text-amber-700"
            : "mt-1 font-serif text-3xl font-semibold text-zinc-950"
        }
      >
        {value}
      </p>
    </div>
  );
}
