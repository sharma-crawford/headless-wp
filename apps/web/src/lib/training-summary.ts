import { firstUnfinished } from "@/lib/outline";
import { decodeEntities } from "@/lib/html";
import type { TrainingProgram, Webinars } from "@/lib/types";
import { getProgram } from "@/lib/wordpress";

/**
 * What the Castle's "My Training" label says about the reader: the next module to
 * do and, if there is one, the next live session. A shortcut: any part that
 * cannot be worked out is left out, and the label still leads to My Training.
 */
export type TrainingSummary = {
  /** How many programmes the reader is enrolled in. */
  count: number;
  /** "Module title", the next thing to do, and whether they have begun. */
  next: { title: string; started: boolean } | null;
  /** "Thu Dec 3": the next live session's day, or null. */
  live: string | null;
};

export async function trainingSummary(
  programs: TrainingProgram[],
  webinars: Webinars | null
): Promise<TrainingSummary> {
  const unfinished = (p: TrainingProgram) => p.progress.total > 0 && p.progress.completed < p.progress.total;
  const pick = programs.find((p) => unfinished(p) && p.progress.completed > 0) ?? programs.find(unfinished);

  let next: TrainingSummary["next"] = null;

  if (pick) {
    try {
      const program = await getProgram(pick.id);
      const step = program.format === "webinar" ? null : firstUnfinished(program);
      const title = program.format === "webinar" ? program.title : step?.module.title;
      if (title) next = { title: decodeEntities(title), started: pick.progress.completed > 0 };
    } catch {
      next = null;
    }
  }

  const session = webinars?.upcoming?.[0];
  const live = session?.starts_at
    ? new Date(session.starts_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : null;

  return { count: programs.length, next, live };
}
