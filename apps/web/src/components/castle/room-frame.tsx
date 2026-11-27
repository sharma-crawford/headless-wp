import type { ReactNode, Ref } from "react";
import styles from "./room-frame.module.css";

/** Which part of the courtyard picture the hero shows. */
type Art = "library" | "council" | "training" | "mine";

/**
 * The hero band of a place: its picture, its name, what it is for, and the way
 * back to the Castle. On its own it is the top of a page that already has a body
 * (My Training); RoomFrame adds the body.
 */
export function RoomHero({
  art,
  name,
  title,
  purpose,
  back,
  backLabel = "Castle",
  image,
  theme,
  headingRef,
}: {
  art: Art;
  /** The place, small: "The Library". */
  name: string;
  /** The page's heading. */
  title: string;
  /** One line: what the place is for. */
  purpose: string;
  /** Where "← Castle" goes: "#courtyard" inside the Castle, "/castle#courtyard" elsewhere. */
  back: string;
  /** What the way back is called: "Castle" by default. */
  backLabel?: string;
  /** A picture to use instead of the courtyard crop, such as a programme's cover. */
  image?: string | null;
  /** A room theme slug (room-themes.css): the band takes that room's deep colour. */
  theme?: string | null;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <header
      className={`${styles.hero} ${image ? styles.cover : styles[art]} ${theme ? `room-${theme}` : ""}`}
      style={image ? { backgroundImage: `url(${image})` } : undefined}
    >
      <div className={styles.inner}>
        <a className={styles.back} href={back}>← {backLabel}</a>
        <div>
          <p className={styles.name}>{name}</p>
          <h1 ref={headingRef} tabIndex={-1} className={styles.title}>{title}</h1>
          <p className={styles.purpose}>{purpose}</p>
        </div>
      </div>
    </header>
  );
}

/** A place: the shared hero, then the place's own body. */
export default function RoomFrame({ children, ...hero }: { children: ReactNode } & Parameters<typeof RoomHero>[0]) {
  return (
    <section>
      <RoomHero {...hero} />
      <div className={styles.body}>{children}</div>
    </section>
  );
}
