import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";
import { Textarea } from "@pcle/ui/components/textarea";

import { savePlanAction } from "@/app/actions/plans";
import ActionForm from "@/components/builder/action-form";
import type { Plan } from "@/lib/types";

/**
 * One plan's fields, for a new plan or an existing one.
 *
 * Keyed by the caller on what is saved, so a save draws a fresh form: the
 * inputs are uncontrolled.
 */
export default function PlanForm({
  plan,
  suggestedRank,
}: {
  plan?: Plan;
  suggestedRank?: number;
}) {
  const key = plan?.id ?? "new";

  return (
    <ActionForm action={savePlanAction} className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_minmax(0,12rem)]">
      {plan && <input type="hidden" name="id" value={plan.id} />}

      <Field id={`${key}-name`} label="Name">
        <Input id={`${key}-name`} name="name" defaultValue={plan?.name} placeholder="Standard" required />
      </Field>

      <Field id={`${key}-rank`} label="Rank">
        <Input
          id={`${key}-rank`}
          name="rank"
          type="number"
          min="1"
          max="99"
          defaultValue={plan?.rank ?? suggestedRank}
          required
        />
      </Field>

      <Field id={`${key}-price`} label="Price, as shown">
        <Input id={`${key}-price`} name="price" defaultValue={plan?.price} placeholder="$199 a year" />
      </Field>

      <div className="sm:col-span-3">
        <Field id={`${key}-description`} label="Description">
          <Input
            id={`${key}-description`}
            name="description"
            defaultValue={plan?.description}
            placeholder="For practitioners who want the full live programme."
          />
        </Field>
      </div>

      <div className="sm:col-span-3">
        <Field id={`${key}-features`} label="What it includes, one per line">
          <Textarea
            id={`${key}-features`}
            name="features"
            rows={3}
            defaultValue={plan?.features.join("\n")}
            placeholder={"Every live webinar\nThe on-demand library"}
          />
        </Field>
      </div>

      <div className="sm:col-span-3">
        <Button type="submit">{plan ? "Save plan" : "Create plan"}</Button>
      </div>
    </ActionForm>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <span className="block">
      <label htmlFor={id} className="block text-xs font-medium text-zinc-600">
        {label}
      </label>
      <span className="mt-1 block">{children}</span>
    </span>
  );
}
