import Link from "next/link";

import { cn } from "@pcle/ui/lib/utils";

import ProgressBar from "@/components/progress-bar";
import { FormatBadge } from "@/components/state-badge";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import type { TrainingProgram } from "@/lib/types";

/**
 * A programme as a card in a grid: a cover, the title, a line or two about
 * it, how far through it the reader is, and what clicking will do.
 *
 * The cover is drawn, not uploaded. Programme images are attached to CLE
 * content and so live behind protected delivery, which a browser on another
 * host cannot read; a drawn cover in the programme's own colour needs
 * nothing from WordPress and still tells programmes apart at a glance. Real
 * cover images are a later step, once it is decided they are public.
 *
 * Because the cover carries the programme's colour, the card does not also
 * draw a ColourStrip.
 */
export default function ProgrammeCard({ program }: { program: TrainingProgram }) {
  const { completed, total } = program.progress;
  const done = total > 0 && completed === total;
  const action = done ? "Review" : completed > 0 ? "Continue" : "Start";
  const colour = program.color ? swatchSolid(program.color) : undefined;

  return (
    <Link
      href={`/programs/${program.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_8px_24px_-8px_rgb(15_23_42/0.18)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Cover colour={colour} webinar={program.format === "webinar"} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {program.format === "webinar" && <FormatBadge format="webinar" />}
          {done && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Completed
            </span>
          )}
        </div>

        <h2 className="mt-2 text-xl leading-snug font-semibold text-zinc-950 group-hover:text-brand-800">
          {decodeEntities(program.title)}
        </h2>

        {program.excerpt && (
          <p className="mt-2 line-clamp-2 text-[0.95rem] leading-relaxed text-zinc-600">
            {decodeEntities(program.excerpt)}
          </p>
        )}

        <div className="mt-auto pt-5">
          <ProgressBar progress={program.progress} />

          <span
            className={cn(
              "mt-4 inline-flex items-center gap-1 text-sm font-semibold",
              done ? "text-zinc-600" : "text-brand-700"
            )}
          >
            {action}
            <span
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * A programme's cover: its uploaded image when it has one, otherwise drawn —
 * the programme's colour (navy when it has none) under a soft highlight and
 * a few faint rings. Either way with a mark for what kind of programme it is.
 */
export function Cover({
  colour,
  webinar,
  image = null,
  className = "h-28",
}: {
  colour?: string;
  webinar: boolean;
  image?: string | null;
  className?: string;
}) {
  const base = colour ?? "var(--color-brand-800)";

  if (image) {
    return (
      <div aria-hidden="true" className={`relative overflow-hidden bg-zinc-100 ${className}`}>
        {/*
          A plain <img>: covers come from WordPress, whose host differs per
          environment, and next/image would need each one allow-listed.
        */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
        <span className="absolute bottom-3 left-4 grid size-10 place-items-center rounded-lg bg-white/90 text-zinc-900 shadow-sm">
          {webinar ? <PlayIcon /> : <BookIcon />}
        </span>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: base,
        backgroundImage: `radial-gradient(120% 140% at 0% 0%, rgb(255 255 255 / 0.28), transparent 55%), linear-gradient(135deg, transparent 40%, rgb(0 0 0 / 0.22))`,
      }}
    >
      <svg
        className="absolute -right-6 -bottom-10 size-44 text-white/15"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="50" cy="50" r="18" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="42" />
      </svg>

      <span className="absolute bottom-3 left-4 grid size-10 place-items-center rounded-lg bg-white/90 text-zinc-900 shadow-sm">
        {webinar ? <PlayIcon /> : <BookIcon />}
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" />
    </svg>
  );
}
