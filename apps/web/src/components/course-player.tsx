import type { ReactNode } from "react";

/**
 * The course player: the outline beside the content on a wide screen, and
 * folded into a disclosure above it on a narrow one.
 *
 * Without an outline (a webinar, or a programme that could not be fetched)
 * it is just the content, at reading width.
 *
 * Goes inside a `wide` PageShell: the outline needs the room, and the
 * content column keeps its own reading width.
 */
export default function CoursePlayer({
  outline,
  children,
}: {
  outline: ReactNode | null;
  children: ReactNode;
}) {
  if (!outline) {
    return <div className="mx-auto max-w-3xl">{children}</div>;
  }

  return (
    <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        {/*
          Sticky below the 4rem header, and scrolls on its own when a long
          programme is taller than the window.
        */}
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
          {outline}
        </div>
      </aside>

      <details className="group mb-6 rounded-xl border border-zinc-200 bg-white lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-800 [&::-webkit-details-marker]:hidden">
          Course outline
          <span aria-hidden="true" className="text-zinc-400 transition group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="border-t border-zinc-200 p-4">{outline}</div>
      </details>

      <div className="min-w-0 max-w-3xl">{children}</div>
    </div>
  );
}
