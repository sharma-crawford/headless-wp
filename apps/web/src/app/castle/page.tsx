import type { Metadata } from "next";
import CastleExplorer from "@/components/castle/castle-explorer";
import type { CastleProgram } from "@/components/castle/courses";
import { PageCode } from "@/components/screen-code";
import { isAuthenticated } from "@/lib/auth";
import { decodeEntities } from "@/lib/html";
import { getCatalogue, getMyTraining } from "@/lib/wordpress";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Explore the castle | The Armory" };

export default async function CastlePage() {
  const signedIn = await isAuthenticated();
  const [catalogue, training] = await Promise.allSettled([
    getCatalogue(),
    signedIn ? getMyTraining() : Promise.resolve({ programs: [] }),
  ]);
  const enrolled = new Map(training.status === "fulfilled" ? training.value.programs.map((item) => [item.id, item]) : []);
  const programs: CastleProgram[] = catalogue.status === "fulfilled" ? catalogue.value.programs.map((item) => ({
    id: item.id, title: decodeEntities(item.title), description: decodeEntities(item.excerpt),
    enrolled: enrolled.has(item.id), progress: enrolled.get(item.id)?.progress,
  })) : [];
  // Include assigned training even if it is not in the public catalogue.
  for (const item of enrolled.values()) {
    if (!programs.some((program) => program.id === item.id)) programs.push({
      id: item.id, title: decodeEntities(item.title), description: decodeEntities(item.excerpt ?? ""), enrolled: true, progress: item.progress,
    });
  }
  return <><CastleExplorer programs={programs} signedIn={signedIn} catalogueUnavailable={catalogue.status === "rejected"} /><PageCode code="P24" /></>;
}
