import Link from "next/link";

import { cn } from "@pcle/ui/lib/utils";

import { decodeEntities } from "@/lib/html";
import { keepPreview } from "@/lib/preview";

type Target = { href: string; title: string };

/**
 * Previous and next at the foot of a module or quiz, so finishing one leads
 * straight into the next without a trip back to the programme screen.
 *
 * The last module's "next" is the programme itself, labelled as such.
 */
export default function StepNav({
  previous,
  next,
  preview = false,
}: {
  previous: Target | null;
  next: Target | null;
  preview?: boolean;
}) {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Previous and next"
      className="mt-14 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2"
    >
      {previous ? (
        <StepLink target={previous} direction="previous" preview={preview} />
      ) : (
        <span className="hidden sm:block" />
      )}
      {next && <StepLink target={next} direction="next" preview={preview} />}
    </nav>
  );
}

function StepLink({
  target,
  direction,
  preview,
}: {
  target: Target;
  direction: "previous" | "next";
  preview: boolean;
}) {
  const isNext = direction === "next";

  return (
    <Link
      href={keepPreview(target.href, preview)}
      rel={isNext ? "next" : "prev"}
      className={cn(
        "group rounded-xl border px-5 py-4 transition",
        isNext
          ? "border-brand-800 bg-brand-800 text-white hover:bg-brand-900 sm:text-right"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      )}
    >
      <span
        className={cn(
          "block text-xs font-semibold tracking-wide uppercase",
          isNext ? "text-brand-200" : "text-zinc-500"
        )}
      >
        {isNext ? "Next →" : "← Previous"}
      </span>
      <span
        className={cn(
          "mt-1 block font-medium",
          isNext ? "text-white" : "text-zinc-900 group-hover:text-brand-800"
        )}
      >
        {decodeEntities(target.title)}
      </span>
    </Link>
  );
}
