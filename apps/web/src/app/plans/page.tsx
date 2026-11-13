import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@pcle/ui/components/button";

import { deletePlanAction } from "@/app/actions/plans";
import { renderAccessError } from "@/components/access-error";
import ActionForm from "@/components/builder/action-form";
import PageHeading from "@/components/page-heading";
import PageShell from "@/components/page-shell";
import PlanForm from "@/components/plans/plan-form";
import { isAuthenticated } from "@/lib/auth";
import type { Plan } from "@/lib/types";
import { WordPressApiError, getMe, getPlans } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

/**
 * Plans (P20): the tiers an administrator defines.
 *
 * Nothing about which plans exist is in the code. They are proposed at
 * meetings and set up here: a name, a rank, a price to show, and what to
 * say about it. A programme's place in them is set on the programme (P10).
 */
export default async function PlansPage() {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  let plans: Plan[];

  try {
    if (!(await getMe()).is_admin) {
      return renderAccessError(new WordPressApiError("Administrators only.", 403), {
        title: "Plans are an administrator's",
        detail: "Which plans exist and what they cost is decided by an administrator.",
      });
    }

    ({ plans } = await getPlans());
  } catch (error) {
    return renderAccessError(error);
  }

  const nextRank = plans.length ? Math.max(...plans.map((plan) => plan.rank)) + 1 : 1;

  return (
    <PageShell code="P20" wide>
      <PageHeading
        eyebrow="Administration"
        title="Plans"
        intro="Ranked tiers: each plan opens every programme at its rank or below. Set a programme's rank on the programme itself."
        actions={
          <Button variant="outline" nativeButton={false} render={<Link href="/pricing" />}>
            See the Pricing page
          </Button>
        }
      />

      {plans.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-zinc-600">
          No plans yet. Until there are, programmes are opened only by enrolling people.
        </p>
      ) : (
        <ol className="mt-8 space-y-5">
          {plans.map((plan) => (
            <li key={plan.id} className="rounded-xl border border-zinc-200 bg-white p-6">
              <div className="mb-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
                  Rank {plan.rank}
                </span>
                <h2 className="text-xl font-semibold text-zinc-950">{plan.name}</h2>
                <span className="text-sm text-zinc-500">
                  Opens {plan.programs} {plan.programs === 1 ? "programme" : "programmes"} ·{" "}
                  {plan.holders ?? 0} {plan.holders === 1 ? "person holds" : "people hold"} it
                </span>

                <ActionForm action={deletePlanAction} className="ml-auto">
                  <input type="hidden" name="id" value={plan.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    Delete
                  </Button>
                </ActionForm>
              </div>

              <PlanForm
                key={`${plan.id}|${plan.name}|${plan.rank}|${plan.price}|${plan.description}|${plan.features.join("/")}`}
                plan={plan}
              />
            </li>
          ))}
        </ol>
      )}

      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-zinc-950">New plan</h2>
        <p className="mt-1 mb-5 text-sm text-zinc-500">
          A higher rank opens more. Ranks need not be consecutive: leaving gaps
          lets a plan be added between two later.
        </p>
        <PlanForm key={`new-${plans.length}`} suggestedRank={nextRank} />
      </section>

      <p className="mt-6 text-sm text-zinc-500">
        Deleting a plan takes it from whoever holds it. Their progress,
        attendance and certificates stay.
      </p>
    </PageShell>
  );
}
