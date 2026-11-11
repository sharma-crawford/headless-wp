import { redirect } from "next/navigation";

import { renderAccessError } from "@/components/access-error";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import ProgrammeCard from "@/components/programme-card";
import SessionCard from "@/components/webinars/session-card";
import { isAuthenticated } from "@/lib/auth";
import type { Webinars } from "@/lib/types";
import { getWebinars } from "@/lib/wordpress";

/**
 * The webinars hub (P17): what is live soon, and what can be watched now.
 *
 * Sessions from series programmes are listed beside live webinars, because
 * to a participant both are "a live session I can join" — which programme
 * holds it is a detail on the card, not a reason to look somewhere else.
 */
export default async function WebinarsPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  let webinars: Webinars;

  try {
    webinars = await getWebinars();
  } catch (error) {
    return renderAccessError(error);
  }

  // WordPress's clock, not this server's: the same one that decided what is upcoming.
  const serverNow = Date.parse(webinars.now);
  const [next, ...later] = webinars.upcoming;

  return (
    <PageShell code="P17" wide>
      <PageHeading
        eyebrow="Learn live"
        title="Webinars"
        intro="Join live sessions with your instructors, or watch past webinars whenever suits you."
      />

      <section aria-labelledby="upcoming" className="mt-10">
        <h2 id="upcoming" className="text-2xl font-semibold text-zinc-950">
          Upcoming live sessions
        </h2>

        {next ? (
          <div className="mt-5 space-y-4">
            <SessionCard session={next} serverNow={serverNow} featured />
            {later.map((session) => (
              <SessionCard key={session.id} session={session} serverNow={serverNow} />
            ))}
          </div>
        ) : (
          <Empty>
            Nothing is scheduled right now. New sessions appear here as soon as
            they are announced.
          </Empty>
        )}
      </section>

      <section aria-labelledby="on-demand" className="mt-14">
        <h2 id="on-demand" className="text-2xl font-semibold text-zinc-950">
          On demand
        </h2>
        <p className="mt-1 text-zinc-600">Recorded webinars, ready to watch.</p>

        {webinars.on_demand.length > 0 ? (
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {webinars.on_demand.map((program) => (
              <li key={program.id}>
                <ProgrammeCard program={program} />
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No recordings yet. Webinars appear here once they have been held.</Empty>
        )}
      </section>
    </PageShell>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-zinc-600">
      {children}
    </p>
  );
}
