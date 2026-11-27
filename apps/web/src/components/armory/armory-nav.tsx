import Image from "next/image";
import AccountMenu from "./account-menu";
import styles from "./armory-nav.module.css";

type NavItem = { href: string; label: string; external?: boolean; staff?: boolean };

type Props = {
  /** Highlights Castle on the courtyard. */
  current?: "courtyard";
  signedIn?: boolean;
  /** True on /castle itself, where the Castle views switch by hash without a page load. */
  inCastle?: boolean;
  /** The reader's name and what is theirs (armoryAccount()). Without it a signed-in reader gets a plain My Training link. */
  account?: { name: string; items: NavItem[] } | null;
};

/**
 * The one Armory header. It carries only what every page needs: the way back to the
 * Castle, and the reader's own menu (or Sign in). The Library, the Council Chamber
 * and the Training Hall are the Castle's doors, so they are not repeated here.
 */
export default function ArmoryNav({ current, signedIn = false, inCastle = false, account }: Props) {
  const base = inCastle ? "" : "/castle";
  return (
    <header className={styles.header}>
      <a className={styles.brand} href={`${base}#courtyard`} aria-label="The Armory courtyard">
        <Image className={styles.brandLogo} src="/castle/pen-sword-logo.png" alt="The Pen & Sword" width={190} height={67} />
        <span><strong>ARMORY</strong><small>Explore. Learn. Practice.</small></span>
      </a>
      <nav aria-label="Armory navigation">
        <a href={`${base}#courtyard`} aria-current={current === "courtyard" ? "page" : undefined}>Castle</a>
        {signedIn
          ? (account ? <AccountMenu name={account.name} items={account.items} /> : <a href="/my-training">My Training</a>)
          : <a href="/login">Sign in</a>}
      </nav>
    </header>
  );
}
