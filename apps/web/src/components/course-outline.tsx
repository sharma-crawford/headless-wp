import Link from "next/link";

import { cn } from "@pcle/ui/lib/utils";

import ProgressBar from "@/components/progress-bar";
import { decodeEntities } from "@/lib/html";
import { keepPreview } from "@/lib/preview";
import type { Program, QuizSummary } from "@/lib/types";

/**
 * Where the reader is in a programme: every unit and module, ticked as they
 * are completed, with the current one marked.
 *
 * Quizzes are listed only under the module being read, because the
 * programme endpoint does not carry them and fetching every module to find
 * them would cost a request per module on every screen. The module screen
 * already has its own quizzes; that is enough to show them where they matter.
 */
export default function CourseOutline({
  program,
  current,
  quizzes = [],
  preview = false,
}: {
  program: Program;
  /**
   * What is open: a unit, a module, or a quiz under a module. Only the page
   * itself is marked, so a module's unit is not passed alongside it.
   */
  current: { unit?: number; module?: number; quiz?: number };
  /** The current module's quizzes. */
  quizzes?: QuizSummary[];
  preview?: boolean;
}) {
  return (
    <nav aria-label="Course outline" className="text-sm">
      <Link
        href={keepPreview(`/programs/${program.id}`, preview)}
        className="block font-serif text-lg leading-snug font-semibold text-zinc-950 hover:text-brand-800"
      >
        {decodeEntities(program.title)}
      </Link>

      <div className="mt-3">
        <ProgressBar progress={program.progress} />
      </div>

      <ol className="mt-6 space-y-5">
        {program.units.map((unit) => {
          const unitCurrent = current.unit === unit.id;

          return (
            <li key={unit.id}>
              <Link
                href={keepPreview(`/units/${unit.id}`, preview)}
                aria-current={unitCurrent ? "page" : undefined}
                className={cn(
                  "block rounded-md px-2 py-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase hover:text-brand-800",
                  unitCurrent && "bg-brand-50 text-brand-800"
                )}
              >
                {decodeEntities(unit.title)}
              </Link>

              <ol className="mt-1.5 space-y-0.5">
                {unit.modules.map((module) => {
                  const here = current.module === module.id;

                  return (
                    <li key={module.id}>
                      <Link
                        href={keepPreview(`/modules/${module.id}`, preview)}
                        aria-current={here && !current.quiz ? "page" : undefined}
                        className={cn(
                          "flex items-start gap-2.5 rounded-md px-2 py-1.5 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
                          here && "bg-brand-50 font-medium text-brand-900 hover:bg-brand-50"
                        )}
                      >
                        <Tick done={module.completed} current={here} />
                        <span>
                          {decodeEntities(module.title)}
                          {module.draft && (
                            <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-900">
                              Draft
                            </span>
                          )}
                          <span className="sr-only">
                            {module.completed ? " (completed)" : " (not completed)"}
                          </span>
                        </span>
                      </Link>

                      {here && quizzes.length > 0 && (
                        <ul className="mt-0.5 mb-1 ml-[1.15rem] space-y-0.5 border-l border-zinc-200 pl-3">
                          {quizzes.map((quiz) => (
                            <li key={quiz.id}>
                              <Link
                                href={keepPreview(`/quizzes/${quiz.id}`, preview)}
                                aria-current={current.quiz === quiz.id ? "page" : undefined}
                                className={cn(
                                  "flex items-center gap-2 rounded-md px-2 py-1 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950",
                                  current.quiz === quiz.id &&
                                    "bg-brand-50 font-medium text-brand-900"
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    "text-xs",
                                    quiz.passed ? "text-emerald-600" : "text-zinc-400"
                                  )}
                                >
                                  {quiz.passed ? "✓" : "?"}
                                </span>
                                Quiz: {decodeEntities(quiz.title)}
                                <span className="sr-only">
                                  {quiz.passed ? " (passed)" : " (not passed yet)"}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** A circle: filled green and ticked when done, ringed in teal when open. */
function Tick({ done, current }: { done: boolean; current: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border text-[10px] leading-none font-bold",
        done
          ? "border-emerald-600 bg-emerald-600 text-white"
          : current
            ? "border-brand-700 border-2"
            : "border-zinc-300 bg-white"
      )}
    >
      {done ? "✓" : ""}
    </span>
  );
}
