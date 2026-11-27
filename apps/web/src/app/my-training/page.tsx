import { redirect } from "next/navigation";

import { renderAccessError } from "@/components/access-error";
import ContinueCard from "@/components/continue-card";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import ProgrammeCard from "@/components/programme-card";
import SessionCard from "@/components/webinars/session-card";
import { isAuthenticated } from "@/lib/auth";
import type { TrainingProgram, Webinars } from "@/lib/types";
import { getMyTraining, getWebinars } from "@/lib/wordpress";

export default async function MyTrainingPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  let programs: TrainingProgram[];

  try {
    ({ programs } = await getMyTraining());
  } catch (error) {
    return renderAccessError(error);
  }

  /*
   * The live sessions of what this reader is enrolled in, a webinar's or a
   * series'. Best effort: My Training must still open if this cannot be read.
   */
  let webinars: Webinars | null = null;

  try {
    webinars = await getWebinars();
  } catch {
    webinars = null;
  }

  // WordPress's clock, not this server's: the same one that decided what is upcoming.
  const serverNow = webinars ? Date.parse(webinars.now) : 0;
  const upcoming = webinars?.upcoming ?? [];

  return (
    <PageShell code="P2" wide theme="armory">
      <PageHeading
        eyebrow="Your learning"
        title="My Training"
        intro={
          programs.length === 0
            ? undefined
            : "Pick up where you left off, or start something new."
        }
      />

      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming" className="mt-10">
          <h2 id="upcoming" className="text-2xl font-semibold text-zinc-950">
            Upcoming live sessions
          </h2>
          <div className="mt-5 space-y-4">
            {upcoming.map((session, index) => (
              <SessionCard key={session.id} session={session} serverNow={serverNow} featured={index === 0} />
            ))}
          </div>
        </section>
      )}

      {programs.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <p className="font-serif text-lg text-zinc-900">Nothing here yet</p>
          <p className="mx-auto mt-2 max-w-md text-zinc-600">
            You are not enrolled in any programme yet. Once an administrator
            enrolls you, it will appear here.
          </p>
        </div>
      ) : (
        <>
          <ContinueCard programs={programs} />

          <h2 className="mt-12 text-2xl font-semibold text-zinc-950">
            Your programmes
          </h2>

          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <li key={program.id}>
                <ProgrammeCard program={program} />
              </li>
            ))}
          </ul>
        </>
      )}
    </PageShell>
  );
}
