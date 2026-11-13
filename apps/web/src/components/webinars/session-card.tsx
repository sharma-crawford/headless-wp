import Link from "next/link";

import { cn } from "@pcle/ui/lib/utils";

import SessionActions from "@/components/webinars/session-actions";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import { calendarHref, scheduled } from "@/lib/sessions";
import type { WebinarSession } from "@/lib/types";

/**
 * One upcoming session: a date tile, what it is and when, and its actions.
 * `featured` is the next one, drawn larger at the top of the hub.
 */
export default function SessionCard({
  session,
  serverNow,
  featured = false,
}: {
  session: WebinarSession;
  serverNow: number;
  featured?: boolean;
}) {
  const when = session.starts_at ? scheduled(session.starts_at) : null;
  const colour = session.program.color ? swatchSolid(session.program.color) : undefined;
  const webinar = session.program.format === "webinar";
  // A webinar's session is named after the webinar; a series' has its own name.
  const title = webinar ? session.program.title : session.title;

  return (
    <article
      className={cn(
        "relative flex flex-col gap-5 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] sm:flex-row sm:items-center",
        featured ? "p-6 sm:p-8" : "p-5"
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: colour ?? "var(--color-brand-700)" }}
      />

      {when && (
        <div
          className={cn(
            "flex shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-900",
            featured ? "size-24" : "size-20"
          )}
        >
          <span className="text-xs font-semibold tracking-wider text-brand-600 uppercase">
            {when.month}
          </span>
          <span className={cn("font-serif leading-none font-semibold", featured ? "text-4xl" : "text-3xl")}>
            {when.day}
          </span>
          <span className="mt-0.5 text-xs text-brand-700">{when.weekday}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold tracking-[0.12em] text-zinc-500 uppercase">
          {webinar ? "Live webinar" : `Live session · ${decodeEntities(session.program.title)}`}
        </p>

        <h3
          className={cn(
            "mt-1 font-serif leading-snug font-semibold text-zinc-950",
            featured ? "text-2xl sm:text-3xl" : "text-xl"
          )}
        >
          <Link href={session.href} className="hover:text-brand-800">
            {decodeEntities(title)}
          </Link>
        </h3>

        {when && (
          <p className="mt-1.5 text-[0.95rem] text-zinc-600">
            <time dateTime={session.starts_at}>
              {when.weekday} {when.month} {when.day} · {when.time}
            </time>
            {session.duration ? <> · {session.duration} min</> : null}
          </p>
        )}
      </div>

      <SessionActions
        session={session}
        serverNow={serverNow}
        calendarHref={calendarHref(session.id)}
        size={featured ? "large" : "default"}
      />
    </article>
  );
}
