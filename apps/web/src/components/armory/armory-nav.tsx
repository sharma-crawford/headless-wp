import Image from "next/image";
import styles from "./armory-nav.module.css";

type NavPath = { href: string; label: string; external?: boolean };

type Props = {
  /** Highlights the matching link. */
  current?: "courtyard" | "list" | "training";
  signedIn?: boolean;
  /** True on /castle itself, where the Castle views switch by hash without a page load. */
  inCastle?: boolean;
  /**
   * The reader's own paths (My Training, Webinars, and the staff ones),
   * from pathsFor(). When given they replace the default My Training / Sign in link.
   */
  paths?: NavPath[];
  /** Server action that signs the reader out. Adds Account and Log out when signed in. */
  logout?: () => Promise<void>;
};

/** The one Armory header: Castle, Library, the reader's paths, and sign in or out. */
export default function ArmoryNav({ current, signedIn = false, inCastle = false, paths, logout }: Props) {
  const base = inCastle ? "" : "/castle";
  const page = (key: NonNullable<Props["current"]>) => (current === key ? "page" : undefined);
  return (
    <header className={styles.header}>
      <a className={styles.brand} href={`${base}#courtyard`} aria-label="The Armory courtyard">
        <Image className={styles.brandLogo} src="/castle/pen-sword-logo.png" alt="The Pen & Sword" width={190} height={67} />
        <span><strong>ARMORY</strong><small>Explore. Learn. Practice.</small></span>
      </a>
      <nav aria-label="Armory navigation">
        <a href={`${base}#courtyard`} aria-current={page("courtyard")}>Castle</a>
        <a href={`${base}#list`} aria-current={page("list")}>Library</a>
        {paths ? (
          paths
            .filter((path) => !path.href.startsWith("/castle"))
            .map((path) => <a key={path.href} href={path.href}>{path.label}</a>)
        ) : (
          <a href={signedIn ? "/my-training" : "/login"} aria-current={page("training")}>{signedIn ? "My Training" : "Sign in"}</a>
        )}
        {paths && !signedIn && <a href="/login">Sign in</a>}
        {paths && signedIn && <a href="/account">Account</a>}
        {paths && signedIn && logout && (
          <form action={logout}><button type="submit">Log out</button></form>
        )}
      </nav>
    </header>
  );
}
