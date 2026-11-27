import Link from "next/link";

import ArmoryNav from "@/components/armory/armory-nav";
import { PageCode } from "@/components/screen-code";
import ResetPasswordForm from "@/components/reset-password-form";

export const dynamic = "force-dynamic";

/**
 * Choose a password (P26): where the emailed link lands, for a new account's
 * first password and for a forgotten one. The login and one-time key come from
 * the link; WordPress checks them when the password is sent.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const login = typeof params.login === "string" ? params.login : "";
  const key = typeof params.key === "string" ? params.key : "";

  return (
    <div className="armory-theme flex flex-1 flex-col bg-white">
      <ArmoryNav />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        {login && key ? (
          <ResetPasswordForm login={login} keyValue={key} />
        ) : (
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-semibold text-zinc-950">This link is not complete</h1>
            <p className="mt-3 text-zinc-700">
              Open the link from your email again, or ask for a new one.
            </p>
            <p className="mt-6 text-sm">
              <Link href="/forgot-password" className="text-zinc-700 underline">
                Ask for a new link
              </Link>
            </p>
          </div>
        )}
      </main>
      <PageCode code="P26" />
    </div>
  );
}
