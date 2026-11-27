"use server";

import { redirect } from "next/navigation";

import { login, logout, requestPasswordReset, resetPassword, WordPressApiError, WordPressAuthError } from "@/lib/wordpress";

type LoginActionState = {
  error?: string;
};

async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return { error: "Username and password are required." };
  }

  try {
    await login(username, password);
  } catch (error) {
    if (error instanceof WordPressAuthError) {
      return { error: "Invalid username or password." };
    }

    return { error: "Unable to log in right now. Please try again later." };
  }

  /*
   * The menu, not My Training. Signing in says nothing about what someone
   * came to do: an instructor arriving at a participant's programme list had
   * to leave it again, and the menu is the one screen that knows which paths
   * this reader actually has.
   */
  redirect("/");
}

async function logoutAction(): Promise<void> {
  await logout();
  redirect("/login");
}

type ForgotActionState = { sent?: boolean; error?: string };

/**
 * "Forgot your password?": asks for an emailed link. Says the same thing
 * whether or not the address has an account, because that is what WordPress
 * does and what keeps this from being a way to find out who does.
 */
async function forgotPasswordAction(
  _prevState: ForgotActionState,
  formData: FormData
): Promise<ForgotActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Enter the email address you signed up with." };
  }

  try {
    await requestPasswordReset(email);
  } catch {
    return { error: "We could not send that right now. Please try again later." };
  }

  return { sent: true };
}

type ResetActionState = { error?: string };

/** Sets the password from the emailed link, then sends the person to sign in. */
async function resetPasswordAction(
  _prevState: ResetActionState,
  formData: FormData
): Promise<ResetActionState> {
  const login = String(formData.get("login") ?? "");
  const key = String(formData.get("key") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password !== String(formData.get("confirm") ?? "")) {
    return { error: "The two passwords are not the same." };
  }

  try {
    await resetPassword(login, key, password);
  } catch (error) {
    if (error instanceof WordPressApiError && error.code === "pcle_reset_link_invalid") {
      return { error: "This link has expired or was already used. Ask for a new one." };
    }

    if (error instanceof WordPressApiError && (error.code === "pcle_password_short" || error.code === "pcle_password_guessable")) {
      return { error: error.message };
    }

    return { error: "The password could not be set. Please try again." };
  }

  // Outside the try: redirect() works by throwing.
  redirect("/login?changed=password");
}

export { loginAction, logoutAction, forgotPasswordAction, resetPasswordAction };
