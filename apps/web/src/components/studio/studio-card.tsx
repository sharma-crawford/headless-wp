import Link from "next/link";

import { authorshipText } from "@/components/builder/authorship-line";
import { Cover } from "@/components/programme-card";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import type { AuthoringProgram } from "@/lib/types";

/**
 * A programme on the Build screen (P9).
 *
 * A published one shows how its cohort is doing; a draft shows what is left
 * before it can go out — the first few unticked lines of its checklist —
 * because those are the two questions an author opens it to answer.
 */
export default function StudioCard({ program }: { program: AuthoringProgram }) {
  const published = program.status === "publish";
  const webinar = program.format === "webinar";
  const todo = (program.checklist ?? []).filter((item) => !item.done);
  const done = (program.checklist ?? []).length - todo.length;

  return (
    <Link
      href={`/builder/programs/${program.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_-8px_rgb(15_23_42/0.18)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative">
        <Cover
          colour={program.color ? swatchSolid(program.color) : undefined}
          webinar={webinar}
          image={program.cover ?? null}
          className="h-32"
        />
        <span
          className={
            published
              ? "absolute top-3 left-4 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
              : "absolute top-3 left-4 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900"
          }
        >
          {published ? "Published" : todo.length > 0 ? `Draft · ${todo.length} to do` : "Draft · ready"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl leading-snug font-semibold text-zinc-950 group-hover:text-brand-800">
          {decodeEntities(program.title)}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {webinar
            ? "Webinar"
            : `${program.units} ${program.units === 1 ? "unit" : "units"} · ${program.modules} ${program.modules === 1 ? "module" : "modules"}`}
          {" · "}
          {program.cohort?.participants ?? program.enrollees}{" "}
          {(program.cohort?.participants ?? program.enrollees) === 1 ? "participant" : "participants"}
        </p>

        {published ? (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Cohort progress</span>
              <span>{program.cohort?.percent ?? 0}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${program.cohort?.percent ?? 0}%` }}
              />
            </div>
            {todo.length > 0 && (
              <p className="mt-2 text-xs text-amber-800">
                {done} of {done + todo.length} ready · {todo[0].label.toLowerCase()}
              </p>
            )}
          </div>
        ) : (
          <ul className="mt-4 space-y-1 text-sm">
            {(program.checklist ?? []).slice(0, 4).map((item) => (
              <li
                key={item.key}
                className={item.done ? "text-emerald-700" : "text-zinc-500"}
              >
                <span aria-hidden="true">{item.done ? "✓" : "○"}</span> {item.label}
                <span className="sr-only">{item.done ? " (done)" : " (to do)"}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
          <span className="truncate">{authorshipText(program)}</span>
          <span className="shrink-0 font-semibold text-brand-700">
            {published ? "Open" : "Continue"} →
          </span>
        </div>
      </div>
    </Link>
  );
}
