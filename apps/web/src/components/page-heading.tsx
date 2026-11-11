import type { ReactNode } from "react";

/**
 * The top of a screen: a small label saying which part of the platform this
 * is, the title, and an optional line under it.
 *
 * Screens that adopt it read as one product rather than a set of pages that
 * each chose their own heading size. The rest still write their own <h1>,
 * and move across as they are next touched.
 */
export default function PageHeading({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Buttons that act on the whole screen, at the right on a wide one. */
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-3xl font-semibold text-zinc-950 sm:text-4xl">
          {title}
        </h1>
        {intro && <p className="mt-2 max-w-2xl text-lg text-zinc-600">{intro}</p>}
      </div>

      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
