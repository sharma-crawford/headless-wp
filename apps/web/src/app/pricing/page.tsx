import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@pcle/ui/components/button";
import { cn } from "@pcle/ui/lib/utils";

import PageShell from "@/components/page-shell";
import { isAuthenticated } from "@/lib/auth";
import type { HeldPlan, Plan } from "@/lib/types";
import { getMe, getPlans } from "@/lib/wordpress";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Plans and pricing · The Armory",
  description: "Choose the plan that fits your practice: live webinars, courses and CLE credit.",
};

/**
 * Pricing (P21): every plan, side by side. Public.
 *
 * Nothing is sold here yet — payment is phase 7. Until then the way to a
 * plan is to ask, and the button says so rather than pretending to be a
 * checkout.
 */
export default async function PricingPage() {
  let plans: Plan[] = [];

  try {
    ({ plans } = await getPlans());
  } catch (error) {
    console.error("The plans could not be read from WordPress.", error);
  }

  const signedIn = await isAuthenticated();
  let held: HeldPlan | null = null;

  if (signedIn) {
    try {
      held = (await getMe()).plan;
    } catch {
      held = null;
    }
  }

  // The plan in the middle is the one most people want; with two, the higher.
  const featured = plans.length >= 2 ? plans[Math.floor(plans.length / 2)].id : null;

  return (
    <PageShell code="P21" wide>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-600 uppercase">
          Plans and pricing
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-zinc-950 sm:text-5xl">
          Training that grows with your practice
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Every plan includes the plans below it. Courses and webinars can also
          be taken one at a time — see the catalogue.
        </p>
      </div>

      {plans.length === 0 ? (
        <p className="mx-auto mt-12 max-w-xl rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-zinc-600">
          Plans are being prepared.{" "}
          <Link href="/catalogue" className="font-medium text-brand-700 hover:underline">
            Browse the catalogue
          </Link>{" "}
          in the meantime.
        </p>
      ) : (
        <ol
          className={cn(
            "mx-auto mt-12 grid gap-6",
            plans.length === 1 && "max-w-sm",
            plans.length === 2 && "max-w-3xl sm:grid-cols-2",
            plans.length >= 3 && "lg:grid-cols-3"
          )}
        >
          {plans.map((plan, index) => (
            <li key={plan.id}>
              <PlanCard
                plan={plan}
                below={index > 0 ? plans[index - 1].name : null}
                featured={plan.id === featured}
                current={held?.id === plan.id}
                signedIn={signedIn}
              />
            </li>
          ))}
        </ol>
      )}

      <p className="mx-auto mt-10 max-w-xl text-center text-sm text-zinc-500">
        Online sign-up and payment are coming soon. Until then, contact your
        programme administrator to join a plan.
      </p>
    </PageShell>
  );
}

function PlanCard({
  plan,
  below,
  featured,
  current,
  signedIn,
}: {
  plan: Plan;
  below: string | null;
  featured: boolean;
  current: boolean;
  signedIn: boolean;
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white p-7",
        featured
          ? "border-brand-800 shadow-[0_12px_32px_-12px_rgb(15_23_42/0.35)] ring-1 ring-brand-800"
          : "border-zinc-200"
      )}
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-amber-400 px-3 py-0.5 text-xs font-bold text-brand-950">
          Most popular
        </span>
      )}

      <h2 className="text-2xl font-semibold text-zinc-950">{plan.name}</h2>
      {plan.description && <p className="mt-2 text-zinc-600">{plan.description}</p>}

      <p className="mt-6 font-serif text-3xl font-semibold text-zinc-950">
        {plan.price || "Ask us"}
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        {plan.programs} {plan.programs === 1 ? "programme" : "programmes"} included
      </p>

      <ul className="mt-6 space-y-2.5 text-[0.95rem] text-zinc-700">
        {below && (
          <Feature>
            Everything in <strong className="font-semibold">{below}</strong>
          </Feature>
        )}
        {plan.features.map((feature) => (
          <Feature key={feature}>{feature}</Feature>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        {current ? (
          <span className="flex h-11 items-center justify-center rounded-lg bg-emerald-50 font-semibold text-emerald-800">
            Your current plan
          </span>
        ) : signedIn ? (
          <span className="flex h-11 items-center justify-center rounded-lg bg-zinc-100 text-sm font-medium text-zinc-600">
            Ask your administrator to join
          </span>
        ) : (
          <Button
            variant={featured ? "default" : "outline"}
            className="h-11 w-full text-base"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        )}
      </div>
    </article>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700"
      >
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}
