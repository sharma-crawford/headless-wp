import { isAuthenticated } from "@/lib/auth";
import { armoryAccount } from "@/lib/navigation";
import ArmoryNav from "./armory-nav";

/** The Armory header for a server page: works out whether the reader is signed in and who they are. */
export default async function ArmoryHeader({ current }: { current?: "courtyard" }) {
  const signedIn = await isAuthenticated();
  return <ArmoryNav current={current} signedIn={signedIn} account={signedIn ? await armoryAccount() : null} />;
}
