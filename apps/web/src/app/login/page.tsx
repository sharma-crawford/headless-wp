import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import LoginForm from "@/components/login-form";
import { Wordmark } from "@/components/page-shell";
import { PageCode } from "@/components/screen-code";
import { isAuthenticated } from "@/lib/auth";

/*
 * Depends on the cookie, so it can never be prerendered: a cached signed-out
 * login screen is exactly what this route must not serve.
 */
export const dynamic = "force-dynamic";

/**
 * Sign in — or, for someone who is already signed in, don't.
 *
 * Asking a reader who holds a valid session to type their password again is
 * the app failing to know something it does know. They are sent to the menu,
 * which is where signing in would have taken them anyway.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  /*
   * A session WordPress refused still leaves its cookie behind, so "has a
   * cookie" is not "signed in" when the refusal is what sent them here.
   * Signing in again overwrites it.
   */
  const sessionEnded = params.session === "ended";

  if (!sessionEnded && (await isAuthenticated())) {
    redirect("/");
  }

  /*
   * A password change ends every session. If signing straight back in with
   * the new one failed, the person lands here and should know why.
   */
  const passwordChanged = params.changed === "password";

  return (
    <main className="grid flex-1 bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <BrandPanel />

      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16 sm:px-6">
        <div className="mb-4 lg:hidden">
          <Wordmark compact={false} />
        </div>

        {sessionEnded && !passwordChanged && (
          <p role="status" className="max-w-sm text-center text-sm text-zinc-600">
            You were signed out — perhaps your password was changed on another
            device. Sign in again.
          </p>
        )}
        {passwordChanged && (
          <p role="status" className="max-w-sm text-center text-sm text-emerald-700">
            Your password is changed. Sign in with the new one.
          </p>
        )}
        <LoginForm />
      </div>
      <PageCode code="P0" />
    </main>
  );
}

/**
 * The teal half of the screen on a wide display: who this is, and what is
 * waiting on the other side of the form. Hidden on a phone, where it would
 * only push the form below the fold.
 *
 * Says nothing it cannot back up. Certificates are not offered here because
 * they are still drafts until the accreditation details arrive.
 */
function BrandPanel() {
  return (
    <div
      className="relative hidden overflow-hidden bg-brand-900 px-12 py-14 text-white lg:flex lg:flex-col"
      style={{
        backgroundImage:
          "radial-gradient(90% 70% at 0% 0%, rgb(255 255 255 / 0.12), transparent 60%), radial-gradient(70% 60% at 100% 100%, oklch(65.5% 0.121 222.8 / 0.45), transparent 70%)",
      }}
    >
      <Wordmark inverted compact={false} />

      <div className="my-auto max-w-md">
        <p className="text-xs font-semibold tracking-[0.14em] text-brand-300 uppercase">
          Continuing Legal Education
        </p>
        <h2 className="mt-3 text-4xl leading-tight font-semibold">
          Training built for practitioners.
        </h2>

        <ul className="mt-10 space-y-5 text-brand-100">
          <Point title="Live and on-demand webinars">
            Join sessions as they happen, or watch the recording later.
          </Point>
          <Point title="Credit hours, by state">
            Every programme states the hours it is approved for.
          </Point>
          <Point title="Learn at your own pace">
            Your progress is saved as you go.
          </Point>
        </ul>
      </div>
    </div>
  );
}

function Point({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-brand-400 text-[11px] font-bold text-brand-950"
      >
        ✓
      </span>
      <span>
        <span className="block font-semibold text-white">{title}</span>
        <span className="text-[0.95rem]">{children}</span>
      </span>
    </li>
  );
}
