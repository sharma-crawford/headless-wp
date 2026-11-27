"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";
import { Label } from "@pcle/ui/components/label";

import { resetPasswordAction } from "@/app/actions/auth";

/** Chooses a password from the emailed link. The login and key travel in hidden fields. */
export default function ResetPasswordForm({ login, keyValue }: { login: string; keyValue: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, {});

  return (
    <form action={formAction} className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold text-zinc-950">Choose your password</h1>
      <p className="mt-2 text-zinc-600">At least 12 characters. A few unrelated words is easier to remember than symbols.</p>

      <input type="hidden" name="login" value={login} />
      <input type="hidden" name="key" value={keyValue} />

      <div className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="reset-password">New password</Label>
          <Input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={12} className="h-11" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reset-confirm">New password again</Label>
          <Input id="reset-confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} className="h-11" required />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}{" "}
            {state.error.includes("expired") && (
              <Link href="/forgot-password" className="underline">
                Ask for a new link
              </Link>
            )}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-11 w-full text-base">
          {pending ? "Saving..." : "Set my password"}
        </Button>
      </div>
    </form>
  );
}
