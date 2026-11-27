import ArmoryNav from "@/components/armory/armory-nav";
import ForgotPasswordForm from "@/components/forgot-password-form";
import { PageCode } from "@/components/screen-code";

export const dynamic = "force-dynamic";

/** Forgot your password (P25): public, and says the same whether or not the address has an account. */
export default function ForgotPasswordPage() {
  return (
    <div className="armory-theme flex flex-1 flex-col bg-white">
      <ArmoryNav />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <ForgotPasswordForm />
      </main>
      <PageCode code="P25" />
    </div>
  );
}
