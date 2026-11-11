"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@pcle/ui/components/button";
import { Input } from "@pcle/ui/components/input";
import { Label } from "@pcle/ui/components/label";

import { loginAction } from "@/app/actions/auth";

/**
 * The sign-in form.
 *
 * Split out of the route so the route itself can be a server component and
 * answer a question this cannot: whether the reader is already signed in.
 */
export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="w-full max-w-sm">
      <h1 className="text-3xl font-semibold text-zinc-950">Welcome back</h1>
      <p className="mt-2 text-zinc-600">Sign in to continue your training.</p>

      <div className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="login-username">Username</Label>
          <Input
            id="login-username"
            name="username"
            type="text"
            placeholder="Username"
            autoComplete="username"
            className="h-11"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="h-11"
            required
          />
        </div>

        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-11 w-full text-base">
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </div>

      {/* Somewhere to go for anyone who arrived here by accident. */}
      <p className="mt-6 text-center text-sm">
        <Link
          href="/"
          className="text-zinc-500 hover:text-zinc-900 hover:underline"
        >
          Back to the home page
        </Link>
      </p>
    </form>
  );
}
