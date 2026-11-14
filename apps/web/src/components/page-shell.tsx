import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@pcle/ui/components/button";
import { cn } from "@pcle/ui/lib/utils";

import { logoutAction } from "@/app/actions/auth";
import { PageCode } from "@/components/screen-code";
import NavLink from "@/components/nav-link";
import { isAuthenticated } from "@/lib/auth";
import { pathsFor, type Path } from "@/lib/navigation";
import { getMe } from "@/lib/wordpress";

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
}) {
  /*
   * Signed out, the only screens that render a shell are the public ones
   * (the catalogue). They get the public header: what anyone may browse,
   * and a way in. Everything else sends a signed-out reader to /login
   * before it gets here.
   */
  const signedIn = await isAuthenticated();
  const paths: Path[] = signedIn
    ? await pathsFor()
    : [
        { href: "/catalogue", label: "Catalogue", description: "" },
        { href: "/pricing", label: "Pricing", description: "" },
      ];
  const name = signedIn ? await displayName() : "";

  return (
    /*
      flex-1, not min-h-screen. The body is a full-height flex column with the
      version stamp as its last child; a screen-height shell would push that
      below the fold on every page, which is a footer nobody ever reads.
    */
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 shadow-[0_1px_2px_rgb(15_23_42/0.04)] backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Wordmark />

          {/*
            The paths scroll sideways on a phone rather than wrapping: a
            wrapped header changes height from screen to screen, which reads
            as the page jumping.
          */}
          <nav
            aria-label="Main"
            className="-mx-1 flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none]"
          >
            {paths.map((path) => (
              <NavLink
                key={path.href}
                href={path.href}
                label={path.label}
                external={path.external}
              />
            ))}
          </nav>

          {!signedIn ? (
            <Button
              className="h-9 shrink-0 px-4"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          ) : (
            /* Everyone's, whatever their role, so it sits with Log out rather than in pathsFor(). */
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2 text-zinc-700"
                nativeButton={false}
                render={<Link href="/account" />}
              >
                <Initials name={name} />
                <span className="hidden sm:inline">Account</span>
                <span className="sr-only sm:hidden">Account</span>
              </Button>

              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  className="h-9 px-2.5 text-zinc-500"
                >
                  Log out
                </Button>
              </form>
            </div>
          )}
        </div>
      </header>

      <main
        className={cn(
          "mx-auto w-full px-4 py-10 sm:px-6 sm:py-12",
          wide ? "max-w-6xl" : "max-w-3xl"
        )}
      >
        {children}
      </main>

      <PageCode code={code} />
    </div>
  );
}

/**
 * The reader's name, or nothing if WordPress cannot say. Decoration only:
 * the header must render for a reader whose token has just expired.
 */
async function displayName(): Promise<string> {
  try {
    return (await getMe()).display_name;
  } catch {
    return "";
  }
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
function Initials({ name }: { name: string }) {
  const initials = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      aria-hidden="true"
      className="grid size-7 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800"
    >
      {initials || "·"}
    </span>
  );
}
