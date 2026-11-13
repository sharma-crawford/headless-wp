import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@pcle/ui/components/button";

import Breadcrumbs from "@/components/breadcrumbs";
import { creditLine, sizeLine } from "@/components/catalogue/catalogue-card";
import PageShell from "@/components/page-shell";
import { Cover } from "@/components/programme-card";
import { isAuthenticated } from "@/lib/auth";
import { swatchSolid } from "@/lib/colours";
import { decodeEntities } from "@/lib/html";
import { scheduled } from "@/lib/sessions";
import type { CatalogueDetail } from "@/lib/types";
import { WordPressApiError, getCatalogueItem, getMyTraining } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

async function load(id: string): Promise<CatalogueDetail> {
  try {
    return await getCatalogueItem(Number(id));
  } catch (error) {
    if (error instanceof WordPressApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/catalogue/[id]">): Promise<Metadata> {
  const { id } = await params;

  try {
    const program = await getCatalogueItem(Number(id));
    const title = decodeEntities(program.title);
    const description = decodeEntities(program.excerpt);

    return {
      title: `${title} · The Armory`,
      description,
      openGraph: {
        title,
        description,
        images: program.cover ? [program.cover] : undefined,
      },
    };
  } catch {
    return { title: "The Armory" };
  }
}

/**
 * One programme in the catalogue (P19): what it covers, what it is worth,
 * and the way in.
 *
 * The way in depends on who is reading. Until plans exist (phase 6) a
 * programme is opened by an administrator enrolling someone, and the call to
 * action says so rather than offering a button that cannot work.
 */
export default async function CatalogueItemPage({
  params,
  searchParams,
}: PageProps<"/catalogue/[id]">) {
  const { id } = await params;
  const program = await load(id);
  // Sent here from the programme itself, by someone it is not open to.
  const locked = (await searchParams).locked === "1";

  const signedIn = await isAuthenticated();
  let enrolled = false;

  if (signedIn) {
    try {
      enrolled = (await getMyTraining()).programs.some((p) => p.id === program.id);
    } catch {
      enrolled = false;
    }
  }

  const webinar = program.format === "webinar";
  const live = program.next_live ? scheduled(program.next_live) : null;

  return (
    <PageShell code="P19" wide>
      <Breadcrumbs
        trail={[{ label: "Catalogue", href: "/catalogue" }, { label: program.title }]}
      />

      {locked && !enrolled && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-950"
        >
          <strong className="font-semibold">This programme isn&apos;t open to you yet.</strong>{" "}
          {program.access.plan
            ? `It's included in the ${program.access.plan.name} plan and above.`
            : "It is opened by enrolment."}
        </p>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700">
              {webinar ? "Webinar" : "Course"}
            </span>
            {program.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-800"
              >
                {topic}
              </span>
            ))}
          </div>

          <h1 className="mt-3 text-3xl leading-tight font-semibold text-zinc-950 sm:text-4xl">
            {decodeEntities(program.title)}
          </h1>

          {program.excerpt && (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              {decodeEntities(program.excerpt)}
            </p>
          )}

          <div className="mt-8 overflow-hidden rounded-xl border border-zinc-200">
            <Cover
              colour={program.color ? swatchSolid(program.color) : undefined}
              webinar={webinar}
              image={program.cover}
              className="h-56 sm:h-72"
            />
          </div>

          {program.outline.length > 0 && (
            <section aria-labelledby="inside" className="mt-12">
              <h2 id="inside" className="text-2xl font-semibold text-zinc-950">
                What&apos;s inside
              </h2>
              <p className="mt-1 text-zinc-600">{sizeLine(program)}</p>

              <ol className="mt-5 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
                {program.outline.map((unit) => (
                  <li key={unit.title} className="p-5">
                    <h3 className="font-semibold text-zinc-900">
                      {decodeEntities(unit.title)}
                    </h3>
                    {unit.modules.length > 0 && (
                      <ul className="mt-2 space-y-1 text-[0.95rem] text-zinc-600">
                        {unit.modules.map((module) => (
                          <li key={module} className="flex gap-2">
                            <span aria-hidden="true" className="text-zinc-400">
                              —
                            </span>
                            {decodeEntities(module)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="lg:pt-10">
          <div className="sticky top-24 rounded-xl border border-zinc-200 bg-white p-6 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
            <dl className="space-y-4 text-sm">
              <Fact label="Format">{webinar ? "Webinar" : sizeLine(program)}</Fact>
              <Fact label="CLE credit">
                {program.credits.length > 0 ? creditLine(program) : "Accreditation pending"}
              </Fact>
              <Fact label="Included in">
                {program.access.plan ? `${program.access.plan.name} plan and above` : "No plan"}
              </Fact>
              {program.access.sold_alone && (
                <Fact label="On its own">{program.access.price || "Available"}</Fact>
              )}
              {live && (
                <Fact label="Next live session">
                  {live.weekday} {live.month} {live.day} · {live.time}
                </Fact>
              )}
            </dl>

            <div className="mt-6 border-t border-zinc-200 pt-6">
              {enrolled ? (
                <Button
                  className="h-11 w-full text-base"
                  nativeButton={false}
                  render={<Link href={`/programs/${program.id}`} />}
                >
                  Go to {webinar ? "the webinar" : "the course"} →
                </Button>
              ) : (
                <WaysIn program={program} signedIn={signedIn} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</dt>
      <dd className="mt-1 font-medium text-zinc-900">{children}</dd>
    </div>
  );
}

/**
 * How someone who does not have the programme can get it: the plan that
 * opens it, buying it alone, or — until payment exists — asking.
 *
 * No button here pretends to take money. Phase 7 turns "Buy" into a
 * checkout; until then it says how it is done today.
 */
function WaysIn({ program, signedIn }: { program: CatalogueDetail; signedIn: boolean }) {
  const { plan, sold_alone: soldAlone, price } = program.access;

  return (
    <div className="space-y-4">
      {plan && (
        <div>
          <p className="text-sm text-zinc-700">
            Included in <strong className="font-semibold">{plan.name}</strong> and above.
          </p>
          <Button
            className="mt-3 h-11 w-full text-base"
            nativeButton={false}
            render={<Link href="/pricing" />}
          >
            See plans
          </Button>
        </div>
      )}

      {soldAlone && (
        <div>
          <p className="text-sm text-zinc-700">
            {plan ? "Or take it on its own" : "Available on its own"}
            {price ? (
              <>
                {" "}for <strong className="font-semibold">{price}</strong>
              </>
            ) : null}
            .
          </p>
          <span className="mt-3 flex h-11 w-full items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-500">
            Buying online — coming soon
          </span>
        </div>
      )}

      {!plan && !soldAlone && (
        <p className="text-sm leading-relaxed text-zinc-600">
          Enrolment in this programme is by invitation.
        </p>
      )}

      {signedIn ? (
        <p className="text-xs leading-relaxed text-zinc-500">
          Until online sign-up opens, your programme administrator can add a
          plan or this programme to your account.
        </p>
      ) : (
        <Button
          variant={plan ? "outline" : "default"}
          className="h-11 w-full text-base"
          nativeButton={false}
          render={<Link href="/login" />}
        >
          Sign in
        </Button>
      )}
    </div>
  );
}
