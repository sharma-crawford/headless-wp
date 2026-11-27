import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@pcle/ui/lib/utils";

import ArmoryNav from "@/components/armory/armory-nav";
import { PageCode } from "@/components/screen-code";
import { isAuthenticated } from "@/lib/auth";
import { armoryAccount } from "@/lib/navigation";

/**
 * Shared frame for the signed-in pages: a header offering the same paths the
 * menu offers, and a way out, plus a readable content column.
 *
 * The header used to write its own list of links, which is how it came to
 * offer a different set from the menu — an administrator was shown
 * Administration on one screen and not on the next. Both now render
 * pathsFor(), so a path added in one place appears in both or in neither.
 *
 * The wordmark goes to the menu. It used to go to My Training, which was
 * reasonable while the menu was a dead end; now that signing in lands there,
 * the wordmark doing the conventional thing is also the useful thing.
 */
export default async function PageShell({
  children,
  code,
  wide = false,
  theme,
  hero,
}: {
  children: ReactNode;
  /**
   * The screen's code from docs/ui-map.md, shown in the corner. Required, so
   * a new screen cannot ship without one: pick the next free number and add
   * it to the map.
   */
  code: string;
  /**
   * Widens the content column. The default is sized for prose, which is what
   * almost every screen here is; a cohort table is the exception and gets
   * clipped in it.
   */
  wide?: boolean;
  /** `armory` puts the screen on the Castle fonts and colours (see armory-theme.css). Learner screens only. */
  theme?: "armory";
  /** A full-width band under the header (a place's hero), before the content column. */
  hero?: ReactNode;
}) {
  /*
   * Signed out, the only screens that render a shell are the public ones
   * (the catalogue). They get the public header: what anyone may browse,
   * and a way in. Everything else sends a signed-out reader to /login
   * before it gets here.
   */
  const signedIn = await isAuthenticated();
  const account = signedIn ? await armoryAccount() : null;

  return (
    /*
      flex-1, not min-h-screen. The body is a full-height flex column with the
      version stamp as its last child; a screen-height shell would push that
      below the fold on every page, which is a footer nobody ever reads.
    */
    <div className={cn("flex flex-1 flex-col bg-zinc-50", theme === "armory" && "armory-theme")}>
      <ArmoryNav signedIn={signedIn} account={account} />
      {hero}

      <main
        className={cn(
          "mx-auto w-full px-4 sm:px-6",
          hero ? "pt-8 pb-12 sm:pt-10 sm:pb-14" : "py-10 sm:py-12",
          wide ? "max-w-6xl" : "max-w-3xl"
        )}
      >
        {children}
      </main>

      <PageCode code={code} />
    </div>
  );
}

/** The site's mark: goes to the menu, like every wordmark. */
export function Wordmark({
  inverted = false,
  compact = true,
}: {
  inverted?: boolean;
  /** Only the mark on a phone, so the header's links keep the room. */
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="The Armory, menu"
      className={cn(
        "group flex shrink-0 items-center gap-2.5",
        inverted ? "text-white" : "text-brand-900"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 place-items-center rounded-md font-serif text-sm font-semibold",
          inverted ? "bg-white text-brand-900" : "bg-brand-600 text-white"
        )}
      >
        A
      </span>
      <span
        className={cn(
          "font-serif text-lg leading-none font-semibold tracking-tight",
          compact && "hidden sm:inline"
        )}
      >
        The <span className={inverted ? "text-brand-300" : "text-brand-600"}>Armory</span>
      </span>
    </Link>
  );
}

/** A round badge with the reader's initials, beside Account. */
