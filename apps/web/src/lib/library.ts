import { education, educationHref, freeCourses } from "@/components/castle/education";
import type { LibraryProgram } from "@/lib/types";

/** The programme whose next live session is soonest and still ahead, or undefined. */
export function soonestLive<T extends { next_live: string }>(programs: T[]): T | undefined {
  const now = Date.now();

  return programs
    .filter((program) => program.next_live && Date.parse(program.next_live) >= now)
    .sort((a, b) => Date.parse(a.next_live) - Date.parse(b.next_live))[0];
}

/**
 * The courses that are still code, as Library cards: the nine law-school rooms and
 * Immigration 101. They sit beside the WordPress programmes so the Library has one
 * list, one search and one set of filters. They go when Phase 3 and 4 move them to
 * WordPress; until then each carries its own address.
 *
 * Their ids are negative so they can never meet a WordPress id.
 */
/**
 * Cover pictures for the code courses, by the course's path. Illustrated in the
 * Armory style and kept in public/castle/covers. A course without one shows the
 * plain cover. (Course art in course-assets is not used: it is behind the course's
 * login, and these are shown to everyone.)
 */
const covers: Record<string, string> = {
  "/what-like-its-hard/contracts": "/castle/covers/contracts.webp",
  "/immigration-101": "/castle/covers/immigration-101.webp",
};

export function codeCourses(): LibraryProgram[] {
  const courses = education.filter(
    (item) => item.group === "Doctrinal courses" || freeCourses.includes(item.path)
  );

  return courses.map((item, index) => {
    const free = freeCourses.includes(item.path);

    return {
      id: -(index + 1),
      title: item.title,
      excerpt: item.description,
      format: "series",
      color: null,
      cover: covers[item.path] ?? null,
      topics: [free ? "Immigration" : "Law school"],
      credits: [],
      units: 0,
      modules: 0,
      next_live: "",
      access: { min_rank: 0, plan: null, sold_alone: false, price: "" },
      href: educationHref(item.path),
      free,
      note: free ? "Interactive course" : "Interactive course room",
    } as LibraryProgram;
  });
}
