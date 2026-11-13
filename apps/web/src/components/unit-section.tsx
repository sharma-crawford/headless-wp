import Link from "next/link";
import { ChevronRightIcon, RadioIcon } from "lucide-react";

import { ColourDot, ColourStrip } from "@/components/colour-marks";
import SessionActions from "@/components/webinars/session-actions";
import { decodeEntities } from "@/lib/html";
import { keepPreview } from "@/lib/preview";
import { calendarHref, scheduled } from "@/lib/sessions";
import type { Unit } from "@/lib/types";

/**
 * One unit with its modules and live sessions.
 *
 * Shared by the programme page (which lists every unit) and the unit page
 * (which shows one), so the two can never drift into showing different things
 * about the same unit.
 */
export default function UnitSection({
  unit,
  headingLevel = "h2",
  linkHeading = true,
  preview = false,
  index,
}: {
  unit: Unit;
  headingLevel?: "h1" | "h2";
  linkHeading?: boolean;
  preview?: boolean;
  /** Its place in the programme, when listed among the others. */
  index?: number;
}) {
  const Heading = headingLevel;
  const title = decodeEntities(unit.title);
  const { completed, total, percentage } = unit.progress;
  const done = total > 0 && completed === total;

  return (
    <section className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
      <ColourStrip swatch={unit.color} />

      <div className="flex flex-wrap items-start gap-x-6 gap-y-3 px-6 py-5">
        <div className="min-w-0 flex-1">
          {index !== undefined && (
            <p className="text-xs font-semibold tracking-[0.12em] text-brand-600 uppercase">
              Unit {index}
            </p>
          )}
          <Heading
            className={
              headingLevel === "h1"
                ? "mt-1 text-3xl font-semibold text-zinc-950 sm:text-4xl"
                : "mt-1 text-xl font-semibold text-zinc-950"
            }
          >
            {linkHeading ? (
              <Link
                href={keepPreview(`/units/${unit.id}`, preview)}
                className="hover:text-brand-800"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </Heading>

          {unit.excerpt && (
            <p className="mt-1.5 text-[0.95rem] text-zinc-600">{decodeEntities(unit.excerpt)}</p>
          )}
        </div>

        {/* The unit's progress, compact: the programme's is the headline one. */}
        <div className="w-40 shrink-0 text-right">
          <p className={done ? "text-sm font-semibold text-emerald-700" : "text-sm text-zinc-500"}>
            {total === 0 ? "No modules yet" : done ? "Completed" : `${completed} of ${total} modules`}
          </p>
          {total > 0 && (
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`This unit: ${completed} of ${total} modules · ${percentage}%`}
            >
              <div
                className={done ? "h-full rounded-full bg-emerald-600" : "h-full rounded-full bg-brand-600"}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {unit.modules.length > 0 && (
        <ul className="divide-y divide-zinc-100 border-t border-zinc-100">
          {unit.modules.map((module) => (
            <li key={module.id}>
              <Link
                href={keepPreview(`/modules/${module.id}`, preview)}
                className="group flex items-center gap-4 px-6 py-3.5 transition hover:bg-zinc-50"
              >
                <span
                  aria-hidden="true"
                  className={
                    module.completed
                      ? "grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                      : "size-6 shrink-0 rounded-full border-2 border-zinc-300 bg-white"
                  }
                >
                  {module.completed ? "✓" : ""}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2 font-medium text-zinc-900 group-hover:text-brand-800">
                    {/*
                      Only when it differs from the unit's: the strip already
                      says the rest, and a dot on every row would only repeat it.
                    */}
                    {module.color && module.color !== unit.color && (
                      <ColourDot swatch={module.color} className="size-2.5" />
                    )}
                    {decodeEntities(module.title)}
                    {/* Only an author's preview shows drafts; say which they are. */}
                    {module.draft && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                        Draft
                      </span>
                    )}
                    <span className="sr-only">
                      {module.completed ? " (completed)" : " (not completed)"}
                    </span>
                  </span>

                  {module.excerpt && (
                    <span className="mt-0.5 block text-sm text-zinc-500">
                      {decodeEntities(module.excerpt)}
                    </span>
                  )}
                </span>

                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {unit.events.length > 0 && (
        <div className="border-t border-zinc-100 bg-zinc-50/70 px-6 py-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            <RadioIcon aria-hidden="true" className="size-3.5 text-red-600" />
            Live sessions
          </h3>

          <ul className="mt-3 space-y-3">
            {unit.events.map((event) => {
              const when = event.starts_at ? scheduled(event.starts_at) : null;

              return (
                <li
                  key={event.id}
                  className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center"
                >
                  {when && (
                    <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-md bg-brand-50 text-brand-900">
                      <span className="text-[10px] font-semibold tracking-wider text-brand-600 uppercase">
                        {when.month}
                      </span>
                      <span className="font-serif text-xl leading-none font-semibold">{when.day}</span>
                    </span>
                  )}

                  <span className="min-w-0 flex-1 text-sm">
                    <span className="block font-medium text-zinc-900">
                      {decodeEntities(event.title)}
                    </span>
                    {event.formatted && (
                      <time dateTime={event.starts_at || undefined} className="text-zinc-500">
                        {decodeEntities(event.formatted)}
                        {event.duration ? ` · ${event.duration} min` : ""}
                      </time>
                    )}
                  </span>

                  {event.starts_at && (
                    <SessionActions session={event} calendarHref={calendarHref(event.id)} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
