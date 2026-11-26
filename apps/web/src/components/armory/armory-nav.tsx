import Image from "next/image";
import styles from "./armory-nav.module.css";

type Props = {
  /** Highlights the matching link. */
  current?: "courtyard" | "list" | "training";
  signedIn?: boolean;
  /** True on /castle itself, where the Castle views switch by hash without a page load. */
  inCastle?: boolean;
};

/** The one Armory header: Castle, Course rooms, My Training / Sign in. */
export default function ArmoryNav({ current, signedIn = false, inCastle = false }: Props) {
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
        <a href={`${base}#list`} aria-current={page("list")}>Course rooms</a>
        <a href={signedIn ? "/my-training" : "/login"} aria-current={page("training")}>{signedIn ? "My Training" : "Sign in"}</a>
      </nav>
    </header>
  );
}
