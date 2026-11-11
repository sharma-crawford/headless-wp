import type { Metadata } from "next";

import CatalogueBrowser from "@/components/catalogue/catalogue-browser";
import CatalogueCard from "@/components/catalogue/catalogue-card";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import { isAuthenticated } from "@/lib/auth";
import type { Catalogue } from "@/lib/types";
import { getCatalogue, getMyTraining } from "@/lib/wordpress";

// Who is asking decides the header and the "In your training" marks.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue · The Armory",
  description:
    "Continuing Legal Education courses and webinars on immigration practice, with credit hours by state.",
};

/**
 * The catalogue (P18): every published programme, readable signed out.
 *
 * The first screen of the platform a stranger can see. Signed in, each card
 * the reader already has is marked, so the catalogue doubles as "what else
 * is there" for someone who is already learning.
 */
export default async function CataloguePage() {
  let catalogue: Catalogue;

  try {
    catalogue = await getCatalogue();
  } catch (error) {
    console.error("The catalogue could not be read from WordPress.", error);
    catalogue = { programs: [], topics: [] };
  }

  const enrolled = await enrolledIds();

  const cards = Object.fromEntries(
    catalogue.programs.map((program) => [
      program.id,
      <CatalogueCard key={program.id} program={program} enrolled={enrolled.has(program.id)} />,
    ])
  );

  return (
    <PageShell code="P18" wide>
      <PageHeading
        eyebrow="Catalogue"
        title="Courses and webinars"
        intro="Practical training for immigration practitioners, accredited for continuing legal education."
      />

      <div className="mt-8">
        {catalogue.programs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600">
            The catalogue is being prepared. Check back soon.
          </p>
        ) : (
          <CatalogueBrowser
            programs={catalogue.programs}
            topics={catalogue.topics}
            cards={cards}
          />
        )}
      </div>
    </PageShell>
  );
}

/** What a signed-in reader already has; nothing for anyone else. */
async function enrolledIds(): Promise<Set<number>> {
  if (!(await isAuthenticated())) {
    return new Set();
  }

  try {
    return new Set((await getMyTraining()).programs.map((program) => program.id));
  } catch {
    return new Set();
  }
}
