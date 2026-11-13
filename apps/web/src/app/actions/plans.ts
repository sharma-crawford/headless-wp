"use server";

import { revalidatePath } from "next/cache";

import {
  WordPressApiError,
  deletePlan,
  savePlan,
  setPersonPlan,
  updateNode,
} from "@/lib/wordpress";

type PlanActionState = { error?: string; saved?: boolean };

/**
 * The plugin's refusals about plans are written for the person making the
 * change ("Rank 2 is already Plus. Each plan needs its own rank."), so they
 * are shown as they come.
 */
function describe(error: unknown): string {
  if (error instanceof WordPressApiError) {
    if (error.status === 401) {
      return "Your session expired. Sign in again and retry — nothing was saved.";
    }
    if (error.status === 403) {
      return "Only an administrator can change plans.";
    }
    if (error.detail) {
      return error.detail;
    }
  }

  return "That change could not be saved. Please try again.";
}

/** Plans show up on the Plans screen, Pricing, the catalogue and the builder. */
function refresh() {
  revalidatePath("/", "layout");
}

/** Creates a plan, or saves one when the form carries its id. */
async function savePlanAction(
  _prev: PlanActionState,
  formData: FormData
): Promise<PlanActionState> {
  const id = String(formData.get("id") ?? "") || undefined;

  try {
    await savePlan(
      {
        name: String(formData.get("name") ?? ""),
        rank: Number(formData.get("rank") ?? 0),
        price: String(formData.get("price") ?? ""),
        description: String(formData.get("description") ?? ""),
        features: String(formData.get("features") ?? "")
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean),
      },
      id
    );
  } catch (error) {
    return { error: describe(error) };
  }

  refresh();
  return { saved: true };
}

async function deletePlanAction(
  _prev: PlanActionState,
  formData: FormData
): Promise<PlanActionState> {
  try {
    await deletePlan(String(formData.get("id") ?? ""));
  } catch (error) {
    return { error: describe(error) };
  }

  refresh();
  return {};
}

/** Gives a person a plan, changes its end date, or takes it away. */
async function setPersonPlanAction(
  _prev: PlanActionState,
  formData: FormData
): Promise<PlanActionState> {
  const userId = Number(formData.get("user_id"));

  if (!Number.isInteger(userId) || userId <= 0) {
    return { error: "That person could not be identified." };
  }

  try {
    await setPersonPlan(
      userId,
      String(formData.get("plan") ?? ""),
      String(formData.get("until") ?? "")
    );
  } catch (error) {
    return { error: describe(error) };
  }

  refresh();
  return { saved: true };
}

/** Which plans open a programme, and whether it is also sold on its own. */
async function setProgramAccessAction(
  _prev: PlanActionState,
  formData: FormData
): Promise<PlanActionState> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return { error: "That programme could not be identified." };
  }

  try {
    await updateNode(id, {
      access: {
        min_rank: Number(formData.get("min_rank") ?? 0),
        sold_alone: formData.get("sold_alone") === "on",
        price: String(formData.get("price") ?? ""),
      },
    });
  } catch (error) {
    return { error: describe(error) };
  }

  refresh();
  return { saved: true };
}

export { deletePlanAction, savePlanAction, setPersonPlanAction, setProgramAccessAction };
export type { PlanActionState };
