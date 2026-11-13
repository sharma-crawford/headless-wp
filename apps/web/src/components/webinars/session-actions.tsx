"use client";

import { useEffect, useState } from "react";

import { cn } from "@pcle/ui/lib/utils";

import {
  JOIN_OPENS_MINUTES,
  phaseAt,
  startMs,
  untilText,
  type SessionTimes,
} from "@/lib/sessions";

/**
 * A session's state and its two actions: join, and add to calendar.
 *
 * "Join" is a real link only from shortly before the start until the end.
 * Earlier, a click lands in an empty waiting room and people assume they have
 * the wrong link; later, the room is closed. Either way the link is not
 * hidden from someone who needs it — it is in the calendar file.
 *
 * A client component for the clock alone. It starts from the server's
 * `now`, so the first render matches the HTML, then ticks every 30 seconds:
 * a hub left open turns "in 3 min" into "Live now" without a reload. A
 * screen with no server clock to hand passes none, and the time-dependent
 * parts appear on the first tick instead.
 */
export default function SessionActions({
  session,
  serverNow,
  calendarHref,
  size = "default",
}: {
  session: SessionTimes & { id: number; join_url?: string };
  serverNow?: number;
  calendarHref: string;
  size?: "default" | "large";
}) {
  const [now, setNow] = useState<number | null>(serverNow ?? null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Once straight away, to swap the server's clock for the reader's.
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 30_000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);

  if (now === null) {
    return <div className="h-10" aria-hidden="true" />;
  }

  const phase = phaseAt(session, now);
  const joinable = (phase === "opening" || phase === "live") && !!session.join_url;
  const large = size === "large";

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <Status phase={phase} until={startMs(session) - now} />

      <div className="flex flex-wrap items-center gap-2">
        {phase !== "ended" && phase !== "undated" && (
          <a
            href={calendarHref}
            download
            className="inline-flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-3.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Add to calendar
          </a>
        )}

        {joinable ? (
          <a
            href={session.join_url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg bg-brand-400 px-5 font-semibold text-brand-950 transition hover:bg-brand-300",
              large ? "h-11 text-base" : "h-10 text-sm"
            )}
          >
            Join now <span aria-hidden="true">↗</span>
          </a>
        ) : (
          phase !== "ended" && (
            <span
              className={cn(
                "inline-flex items-center rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-500",
                large ? "h-11" : "h-10"
              )}
            >
              {session.join_url
                ? `Join opens ${JOIN_OPENS_MINUTES} min before`
                : "Join link to follow"}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function Status({ phase, until }: { phase: string; until: number }) {
  if (phase === "live") {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-700">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-red-600" />
        </span>
        Live now
      </span>
    );
  }

  if (phase === "ended") {
    return <span className="text-sm text-zinc-500">This session has ended</span>;
  }

  if (phase === "undated") {
    return <span className="text-sm text-zinc-500">Date to be announced</span>;
  }

  return (
    <span className="text-sm font-medium text-brand-700">
      Starts {untilText(until)}
    </span>
  );
}
