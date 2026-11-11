import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";

import { setPersonPlanAction } from "@/app/actions/plans";
import ActionForm from "@/components/builder/action-form";
import type { Person, Plan } from "@/lib/types";

/**
 * A person's plan on People (P8): which one, and until when.
 *
 * Granted by hand until payment exists (phase 7). Keyed on what is saved, so
 * a save draws a fresh form.
 */
export default function PersonPlan({ person, plans }: { person: Person; plans: Plan[] }) {
  return (
    <ActionForm
      key={`${person.plan?.id ?? ""}|${person.plan?.until ?? ""}`}
      action={setPersonPlanAction}
      className="flex flex-wrap items-center gap-2"
    >
      <input type="hidden" name="user_id" value={person.id} />

      <label htmlFor={`plan-${person.id}`} className="sr-only">
        Plan for {person.name}
      </label>
      <select
        id={`plan-${person.id}`}
        name="plan"
        defaultValue={person.plan?.id ?? ""}
        className="h-8 rounded-lg border border-input bg-background px-2 text-sm"
      >
        <option value="">No plan</option>
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>

      <label htmlFor={`until-${person.id}`} className="sr-only">
        Plan ends on
      </label>
      <Input
        id={`until-${person.id}`}
        type="date"
        name="until"
        defaultValue={person.plan?.until ?? ""}
        title="Last day of the plan; leave empty for no end"
        className="h-8 w-40"
      />

      <Button type="submit" size="sm" variant="outline">
        Save
      </Button>
    </ActionForm>
  );
}
