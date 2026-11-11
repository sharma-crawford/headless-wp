import type { ModuleSummary, Program, Unit } from "@/lib/types";
import { getProgram } from "@/lib/wordpress";

/**
 * The shape of a programme as a participant walks it: every module, in the
 * order the units and modules are authored, with the unit each sits in.
 *
 * Built from the programme endpoint the programme screen already uses, so
 * the course player needs nothing new from WordPress.
 */
type Step = {
  module: ModuleSummary;
  unit: Unit;
};

function stepsOf(program: Program): Step[] {
  return program.units.flatMap((unit) =>
    unit.modules.map((module) => ({ module, unit }))
  );
}

/** The modules either side of one, for previous and next. */
function neighbours(
  program: Program,
  moduleId: number
): { previous: Step | null; next: Step | null } {
  const steps = stepsOf(program);
  const at = steps.findIndex((step) => step.module.id === moduleId);

  if (at === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: steps[at - 1] ?? null,
    next: steps[at + 1] ?? null,
  };
}

/**
 * Where to pick up: the first module not yet completed, in authored order.
 *
 * Not "the last one opened" — nothing records what a reader opened, and a
 * participant's completions are marked by their instructor, so the first gap
 * is the honest answer to "what is left".
 */
function firstUnfinished(program: Program): Step | null {
  return stepsOf(program).find((step) => !step.module.completed) ?? null;
}

/**
 * The programme for the outline, or null when it cannot be had.
 *
 * Never throws: the outline is navigation around a screen that already
 * loaded. A screen that renders without its sidebar beats one that fails
 * because the sidebar could not be fetched.
 */
async function outlineFor(
  programId: number | undefined,
  preview: boolean
): Promise<Program | null> {
  if (!programId) {
    return null;
  }

  try {
    const program = await getProgram(programId, preview);

    // A webinar is one module: an outline of one item is not navigation.
    return program.format === "webinar" ? null : program;
  } catch {
    return null;
  }
}

export { firstUnfinished, neighbours, outlineFor, stepsOf };
export type { Step };
