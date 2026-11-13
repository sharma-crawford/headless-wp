import { redirect } from "next/navigation";

import { Card, CardContent } from "@pcle/ui/components/card";

import { renderAccessError } from "@/components/access-error";
import Breadcrumbs from "@/components/breadcrumbs";
import MarkParticipantModule from "@/components/mark-participant-module";
import PageShell from "@/components/page-shell";
import ProgressBar from "@/components/progress-bar";
import { StateBadge } from "@/components/state-badge";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import type { ParticipantModule, ParticipantProgress } from "@/lib/types";
import { getParticipantProgress } from "@/lib/wordpress";

/**
 * How a completion came to be recorded — a credit record should be able to
 * say whose word it rests on.
 */
function CompletionNote({ module }: { module: ParticipantModule }) {
  if (!module.completed) {
    return module.blockers.length > 0 ? (
      <span className="text-amber-700">
        Required quiz not passed yet:{" "}
        {module.blockers.map((quiz) => decodeEntities(quiz.title)).join(", ")}
      </span>
    ) : null;
  }

  const when = module.completed_at ? module.completed_at.slice(0, 10) : null;
  const by = module.marked_by
    ? `marked by ${module.marked_by.name ?? "a former account"}`
    : "recorded by the participant";

  return (
    <span className="text-zinc-500">
      {when ? `${when}, ${by}` : `No date recorded, ${by}`}
    </span>
  );
}

export default async function ParticipantProgressPage({
  params,
}: PageProps<"/reports/[id]/participants/[userId]">) {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const { id, userId } = await params;
  const programId = Number(id);

  let data: ParticipantProgress;

  try {
    data = await getParticipantProgress(programId, Number(userId));
  } catch (error) {
    return renderAccessError(error, {
      title: "You cannot see this participant",
      detail:
        "Marking progress is limited to instructors and administrators, and only for people enrolled in the programme.",
    });
  }

  const programTitle = data.program
    ? decodeEntities(data.program.title)
    : "Report";

  return (
    <PageShell code="P14">
      <Breadcrumbs
        trail={[
          { label: "Reports", href: "/reports" },
          { label: programTitle, href: `/reports/${programId}` },
          { label: data.participant.name },
        ]}
      />

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-100 font-serif text-xl font-semibold text-brand-800"
          >
            {data.participant.name
              .split(/[\s@._-]+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("") || "·"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">
              Participant · {programTitle}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-zinc-950">{data.participant.name}</h1>
            <p className="mt-0.5 text-sm text-zinc-500">{data.participant.email}</p>
          </div>
          <div className="w-full sm:w-72">
            <ProgressBar progress={data.progress} label="Programme progress" />
          </div>
        </div>

        <p className="mt-5 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900">
          Participants don&apos;t mark modules themselves. Mark each one here once
          they have finished it; the record keeps who marked it and when.
        </p>
      </div>

      {data.units.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
          This programme has no published units yet.
        </p>
      ) : (
        data.units.map((unit) => (
          <Card key={unit.id} className="mt-6 p-0">
            <CardContent className="p-0">
              <h2 className="border-b border-zinc-100 bg-zinc-50/70 px-6 py-3.5 text-lg font-semibold text-zinc-950">
                {decodeEntities(unit.title)}
              </h2>

              {unit.modules.length === 0 ? (
                <p className="px-6 py-4 text-sm text-zinc-500">No modules.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {unit.modules.map((module) => (
                    <li
                      key={module.id}
                      className="flex flex-wrap items-center gap-3 px-6 py-3.5"
                    >
                      <span
                        aria-hidden="true"
                        className={
                          module.completed
                            ? "grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                            : "size-6 shrink-0 rounded-full border-2 border-zinc-300"
                        }
                      >
                        {module.completed ? "✓" : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-zinc-900">
                            {decodeEntities(module.title)}
                          </span>
                          {module.completed && (
                            <StateBadge state="complete">Completed</StateBadge>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs">
                          <CompletionNote module={module} />
                        </div>
                      </div>

                      <MarkParticipantModule
                        programId={programId}
                        userId={data.participant.id}
                        moduleId={module.id}
                        moduleTitle={decodeEntities(module.title)}
                        completed={module.completed}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </PageShell>
  );
}
