import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@pcle/ui/components/button";
import { Card, CardContent } from "@pcle/ui/components/card";
import { cn } from "@pcle/ui/lib/utils";

import { logoutAction } from "@/app/actions/auth";
import { Wordmark } from "@/components/page-shell";
import { PageCode } from "@/components/screen-code";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import { pathsFor, type Path } from "@/lib/navigation";
import { wordpressFetch } from "@/lib/wordpress";

/*
 * Never prerendered. What this page shows depends on who is asking — the
 * signed-in reader's role decides which paths are offered — and the site name
 * and tagline come from WordPress at request time. Static generation would
 * both bake in a signed-out page for everyone and make the build depend on
 * WordPress being reachable, because the fetch above runs before the cookie
 * read that would otherwise mark this route dynamic.
 */
export const dynamic = "force-dynamic";

type WordPressSite = {
  name: string;
  description: string;
};

/**
 * The site's own name and tagline, or the app's if WordPress cannot say.
 *
 * Never throws. This is the only page an anonymous visitor can reach that
 * asks WordPress anything, so an unreachable backend — or an unset
 * WORDPRESS_API_URL — used to turn the front door into a 500 while every
 * other route carried on. The name and the tagline are decoration; the door's
 * job is to offer a way in, and it can do that with neither.
 *
 * The failure is not hidden: it is logged, and a monitor that watches for a
 * heading rather than a status code still sees the difference.
 */
async function getWordPressSite(): Promise<WordPressSite> {
  try {
    return (await wordpressFetch("/")) as WordPressSite;
  } catch (error) {
    console.error("The front door could not read the site from WordPress.", error);

    return {
      name: "The Armory",
      description: "",
    };
  }
}

/** One way in, with a word about where it leads. */
function PathCard({ path }: { path: Path }) {
  const card = (
    <Card className="h-full p-6 text-left transition group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_-8px_rgb(15_23_42/0.18)] group-hover:ring-foreground/20">
      <CardContent className="p-0">
        <h3 className="text-lg font-semibold text-zinc-950 group-hover:text-brand-800">
          {path.label}
          <span aria-hidden="true" className="ml-1 text-brand-600">
            {path.external ? "↗" : "→"}
          </span>
        </h3>
        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-zinc-600">
          {path.description}
        </p>
      </CardContent>
    </Card>
  );

  const className = "group block h-full";

  return path.external ? (
    <a href={path.href} className={className}>
      {card}
    </a>
  ) : (
    <Link href={path.href} className={className}>
      {card}
    </Link>
  );
}

/**
 * The front door.
 *
 * It used to be the site's name and tagline and nothing else — the only screen
 * in the app with nothing to click, so anyone arriving read a sentence and
 * stopped. What someone needs here depends entirely on who they are, and the
 * server already knows: whether they are signed in, and whether they teach.
 */
export default async function Home() {
  const signedIn = await isAuthenticated();
  const paths = signedIn ? await pathsFor() : [];

  /*
   * A participant's menu is not a choice worth stopping for.
   *
   * Signing in lands here, which is right for anyone with a choice to make
   * and a toll gate for everyone else: a participant's paths are their
   * training and the webinars, and showing them two cards to click is
   * asking them to confirm the obvious. They go straight to My Training,
   * which is the first path and links onward; the header offers the rest.
   *
   * Only for a path inside the app. Bouncing someone out to wp-admin before
   * they have seen a single screen of this one would be a different and
   * much ruder decision.
   */
  if (paths.length > 0 && !paths.some((path) => path.staff) && !paths[0].external) {
    redirect(paths[0].href);
  }

  const site = await getWordPressSite();

  return (
    <main className="flex flex-1 flex-col bg-zinc-50">
      <section
        className={cn(
          "bg-brand-900 text-white",
          /* Signed out, the hero is the whole page: nothing waits below it. */
          !signedIn && "flex flex-1 flex-col"
        )}
        style={{
          backgroundImage:
            "radial-gradient(80% 90% at 0% 0%, rgb(255 255 255 / 0.12), transparent 60%), radial-gradient(60% 80% at 100% 100%, oklch(76.9% 0.188 70.08 / 0.16), transparent 70%)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Wordmark inverted compact={false} />

          {/*
            The way out. Every other screen carries the shared header; this
            one carries its own, and it is where signing in lands.
          */}
          {signedIn && (
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="text-brand-100 hover:bg-white/10 hover:text-white"
              >
                Log out
              </Button>
            </form>
          )}
        </div>

        <div
          className={cn(
            "mx-auto w-full max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24",
            !signedIn && "my-auto"
          )}
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-amber-300 uppercase">
            Continuing Legal Education
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-semibold sm:text-5xl">
            {decodeEntities(site.name)}
          </h1>

          {site.description !== "" && (
            <p className="mt-4 max-w-2xl text-lg text-brand-100 sm:text-xl">
              {decodeEntities(site.description)}
            </p>
          )}

          {!signedIn && (
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                className="h-11 bg-amber-400 px-6 text-base text-brand-950 hover:bg-amber-300"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in
              </Button>

              <p className="text-sm text-brand-200">
                Course materials are available to enrolled participants.
              </p>
            </div>
          )}
        </div>
      </section>

      {signedIn && (
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-2xl font-semibold text-zinc-950">Where to next?</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => (
              <PathCard key={path.href} path={path} />
            ))}
          </div>
        </section>
      )}

      <PageCode code="P1" />
    </main>
  );
}
