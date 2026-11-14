import Link from "next/link";

import { Cover } from "@/components/programme-card";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import { scheduled } from "@/lib/sessions";
import type { CatalogueProgram } from "@/lib/types";

/** "Kansas 3 h · Missouri 3 h": the hours, as a bar lists them. */
function creditLine(program: CatalogueProgram): string {
  return program.credits.map((credit) => `${credit.label} ${credit.hours} h`).join(" · ");
}

/** "2 units · 4 modules", or "Webinar". */
function sizeLine(program: CatalogueProgram): string {
  if (program.format === "webinar") {
    return "Webinar";
  }

  const units = `${program.units} ${program.units === 1 ? "unit" : "units"}`;
  const modules = `${program.modules} ${program.modules === 1 ? "module" : "modules"}`;

  return `${units} · ${modules}`;
}

/**
 * A programme in the catalogue: what it is, what it is worth, and — for a
 * signed-in reader who has it — that it is already theirs.
 */
export default function CatalogueCard({
  program,
  enrolled = false,
}: {
  program: CatalogueProgram;
  enrolled?: boolean;
}) {
  const live = program.next_live ? scheduled(program.next_live) : null;

  return (
    <Link
      href={`/catalogue/${program.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_-8px_rgb(15_23_42/0.18)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Cover
        colour={program.color ? swatchSolid(program.color) : undefined}
        webinar={program.format === "webinar"}
        image={program.cover}
        className="h-40"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {enrolled && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              In your training
            </span>
          )}
          {live && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
              Live {live.month} {live.day}
            </span>
          )}
          {program.access.plan && (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              {program.access.plan.name}
            </span>
          )}
          {program.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800"
            >
              {topic}
            </span>
          ))}
        </div>

        <h2 className="mt-2.5 text-xl leading-snug font-semibold text-zinc-950 group-hover:text-brand-800">
          {decodeEntities(program.title)}
        </h2>

        {program.excerpt && (
          <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-zinc-600">
            {decodeEntities(program.excerpt)}
          </p>
        )}

        <div className="mt-auto space-y-1 pt-5 text-sm">
          <p className="text-zinc-500">{sizeLine(program)}</p>
          {program.credits.length > 0 && (
            <p className="font-medium text-zinc-800">{creditLine(program)}</p>
          )}
          {program.access.sold_alone && program.access.price && (
            <p className="text-zinc-600">{program.access.price} on its own</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export { creditLine, sizeLine };
