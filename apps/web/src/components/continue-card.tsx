import Link from "next/link";

import { firstUnfinished } from "@/lib/outline";
import { decodeEntities } from "@/lib/html";
import type { TrainingProgram } from "@/lib/types";
import { getProgram } from "@/lib/wordpress";

/**
 * "Continue where you left off": one module, named, one click away.
 *
 * Which programme: the first one under way, else the first not yet begun.
 * Which module: the first one in it not completed. Nothing records what a
 * reader last opened, so this is "what is next" rather than "what was last",
 * which for a course is usually the more useful question anyway.
 *
 * Renders nothing when everything is finished, or when the programme cannot
 * be fetched — it is a shortcut, and the cards below still lead everywhere.
 */
export default async function ContinueCard({
  programs,
}: {
  programs: TrainingProgram[];
}) {
  const unfinished = (p: TrainingProgram) =>
    p.progress.total > 0 && p.progress.completed < p.progress.total;

  const pick =
    programs.find((p) => unfinished(p) && p.progress.completed > 0) ??
    programs.find(unfinished);

  if (!pick) {
    return null;
  }

  let target: { href: string; title: string; unit?: string } | null = null;

  try {
    const program = await getProgram(pick.id);

    if (program.format === "webinar") {
      target = program.webinar_module
        ? { href: `/modules/${program.webinar_module}`, title: program.title }
        : null;
    } else {
      const step = firstUnfinished(program);
      target = step && {
        href: `/modules/${step.module.id}`,
        title: step.module.title,
        unit: step.unit.title,
      };
    }
  } catch {
    return null;
  }

  if (!target) {
    return null;
  }

  const started = pick.progress.completed > 0;

  return (
    <section
      aria-label="Continue where you left off"
      className="mt-8 overflow-hidden rounded-2xl bg-brand-900 text-white"
      style={{
        backgroundImage:
          "radial-gradient(80% 120% at 0% 0%, rgb(255 255 255 / 0.12), transparent 60%), radial-gradient(50% 90% at 100% 100%, oklch(65.5% 0.121 222.8 / 0.45), transparent 70%)",
      }}
    >
      <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">
            {started ? "Continue where you left off" : "Ready to start"}
          </p>
          <h2 className="mt-2 text-2xl leading-snug font-semibold sm:text-3xl">
            {decodeEntities(target.title)}
          </h2>
          <p className="mt-1.5 text-brand-100">
            {decodeEntities(pick.title)}
            {target.unit && <> · {decodeEntities(target.unit)}</>}
          </p>

          <div className="mt-4 flex max-w-sm items-center gap-3 text-sm text-brand-100">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-brand-400"
                style={{ width: `${pick.progress.percentage}%` }}
              />
            </div>
            <span>
              {pick.progress.completed} of {pick.progress.total} modules
            </span>
          </div>
        </div>

        <Link
          href={target.href}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-brand-400 px-6 font-semibold text-brand-950 transition hover:bg-brand-300 focus-visible:ring-3 focus-visible:ring-brand-300/50 focus-visible:outline-none sm:self-center"
        >
          {started ? "Continue" : "Start"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
