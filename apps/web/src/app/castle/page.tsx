import type { Metadata } from "next";
import CastleExplorer from "@/components/castle/castle-explorer";
import CatalogueBrowser from "@/components/catalogue/catalogue-browser";
import CatalogueCard from "@/components/catalogue/catalogue-card";
import { PageCode } from "@/components/screen-code";
import { isAuthenticated } from "@/lib/auth";
import { codeCourses } from "@/lib/library";
import type { LibraryProgram } from "@/lib/types";
import { getCatalogue, getMyTraining } from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Explore the castle | The Armory" };

/**
 * The Castle (P24): the entrance. Its Library view lists every course: the
 * published programmes from WordPress, and the courses that are still code
 * (the nine law-school rooms, Immigration 101) until they move there.
 */
export default async function CastlePage() {
  const signedIn = await isAuthenticated();
  const [catalogue, training] = await Promise.allSettled([
    getCatalogue(),
    signedIn ? getMyTraining() : Promise.resolve({ programs: [] }),
  ]);
  const enrolled = new Set(training.status === "fulfilled" ? training.value.programs.map((item) => item.id) : []);
  const published = catalogue.status === "fulfilled" ? catalogue.value : { programs: [], topics: [] };

  const programs: LibraryProgram[] = [...published.programs, ...codeCourses()];
  const topics = [...published.topics];
  for (const program of programs) {
    for (const topic of program.topics) if (!topics.includes(topic)) topics.push(topic);
  }

  const library = (
    <CatalogueBrowser
      programs={programs}
      topics={topics}
      cards={Object.fromEntries(programs.map((item) => [
        item.id, <CatalogueCard key={item.id} program={item} enrolled={enrolled.has(item.id)} />,
      ]))}
    />
  );

  return <>
    <CastleExplorer library={library} signedIn={signedIn} catalogueUnavailable={catalogue.status === "rejected"} noPublished={catalogue.status === "fulfilled" && published.programs.length === 0} />
    <PageCode code="P24" />
  </>;
}
