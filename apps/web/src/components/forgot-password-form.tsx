"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";
import { Label } from "@pcle/ui/components/label";

import { forgotPasswordAction } from "@/app/actions/auth";

/** Asks for an emailed link to choose a new password. */
export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, {});

  if (state.sent) {
    return (
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-zinc-950">Check your email</h1>
        <p role="status" className="mt-3 text-zinc-700">
          If that address has an account, we have sent it a link to choose a new password. The link works once, and for a limited time.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/login" className="text-zinc-700 hover:text-zinc-950 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold text-zinc-950">Forgot your password?</h1>
      <p className="mt-2 text-zinc-600">Enter your email address and we will send you a link to choose a new one.</p>

      <div className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="forgot-email">Email address</Label>
          <Input id="forgot-email" name="email" type="email" autoComplete="email" className="h-11" required />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-11 w-full text-base">
          {pending ? "Sending..." : "Send the link"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="text-zinc-500 hover:text-zinc-900 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
