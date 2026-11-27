import { getModule, getProgram, submitQuizAttempt } from "@/lib/wordpress";

/**
 * Saves what a learner answered in an interactive room to the matching quiz in
 * WordPress, so it counts as an attempt in their record and in Reports.
 *
 * Best effort, and never in the learner's way: the room's own marking has
 * already happened. The matching is by what the migration created: one module
 * per section, titled as the section, holding that section's practice quiz,
 * with questions keyed `q<id>` and choices keyed `c<index>`. If the programme
 * is not published yet, a section has no module, or the quiz is not there, that
 * section is skipped and nothing is said, so the room works the same before and
 * after the content is moved.
 *
 * @param programId   The WordPress programme for this subject.
 * @param sections    Section titles, in the order the question bank indexes them.
 * @param answered    What was answered: question id, its section index, the option chosen.
 * @returns How many sections were saved.
 */
export async function saveRoomAttempts(
  programId: number,
  sections: string[],
  answered: { id: number; section: number; option: number }[]
): Promise<number> {
  const bySection = new Map<number, Record<string, string>>();

  for (const { id, section, option } of answered) {
    if (!Number.isInteger(section) || section < 0 || section >= sections.length || !Number.isInteger(option) || option < 0) {
      continue;
    }

    bySection.set(section, { ...(bySection.get(section) ?? {}), [`q${id}`]: `c${option}` });
  }

  if (bySection.size === 0) {
    return 0;
  }

  const program = await getProgram(programId);
  const modules = program.units.flatMap((unit) => unit.modules);

  const saved = await Promise.allSettled(
    [...bySection].map(async ([section, answers]) => {
      const lesson = modules.find((item) => item.title === sections[section]);

      if (!lesson) {
        throw new Error("no module for this section");
      }

      const quiz = (await getModule(lesson.id)).quizzes[0];

      if (!quiz) {
        throw new Error("no quiz for this section");
      }

      await submitQuizAttempt(quiz.id, answers);
    })
  );

  return saved.filter((result) => result.status === "fulfilled").length;
}
