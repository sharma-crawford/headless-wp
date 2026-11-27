"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { courses } from "./courses";
import { audience, education, educationHref } from "./education";
import ArmoryNav from "@/components/armory/armory-nav";
import type { TrainingSummary } from "@/lib/training-summary";
import styles from "./castle.module.css";

/*
 * The Castle is the entrance, and holds no content of its own. Four views, chosen
 * by the address's hash so the browser's back button works without a page load:
 *
 *   #courtyard   the entrance: three doors
 *   #list        the Library: every course (also reached as #library)
 *   #council     consult: rights and family resources
 *   #training    practice: the court tour, Dice, the Simulator
 *
 * Old addresses (#library, #program-ID, #study-X) open the Library.
 */
const byPath = (paths: string[]) => paths.map((path) => education.find((item) => item.path === path)!);
const council = byPath(["/immigration-rights", "/icemap", "/habeas-corpus"]);
const training = byPath(["/immigration-court-tour", "/immigration-dice", "/immigration-simulator"]);
const VIEWS = ["courtyard", "list", "council", "training"];

const GROUPS: { key: "families" | "both" | "practitioners"; title: string }[] = [
  { key: "families", title: "For families" },
  { key: "both", title: "For families and practitioners" },
  { key: "practitioners", title: "For practitioners" },
];

function ResourceButton({ item }: { item: (typeof education)[number] }) {
  const href = educationHref(item.path);
  const external = href.startsWith("https:");
  return <a className={styles.resourceButton} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
    <strong>{item.title}</strong><span>{item.description}</span><b>{external ? "Open ↗" : "Open →"}</b>
  </a>;
}

export default function CastleExplorer({ library = null, catalogueUnavailable = false, signedIn = false, noPublished = false, training: mine = null, account = null }: {
  /** The Library: every course, with search and filters, drawn on the server. */
  library?: ReactNode;
  signedIn?: boolean;
  catalogueUnavailable?: boolean;
  /** WordPress answered but has no published course yet. */
  noPublished?: boolean;
  /** What the reader's own label says; null when signed out or not enrolled anywhere. */
  training?: TrainingSummary | null;
  /** The reader's name and menu for the header (armoryAccount()). */
  account?: { name: string; items: { href: string; label: string; external?: boolean; staff?: boolean }[] } | null;
}) {
  const [view, setView] = useState("courtyard");
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const room = courses.find((item) => item.id === view);
  const inRoom = view === "council" || view === "training";

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "castle-main") return;
      if (VIEWS.includes(hash)) setView(hash);
      else if (hash === "library" || hash.startsWith("program-") || hash.startsWith("study-")) setView("list");
      else setView("courtyard");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (navigated.current) { heading.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
    navigated.current = true;
  }, [view]);

  const notice = catalogueUnavailable
    ? <p role="status" className={styles.sampleNotice}>The course catalogue is temporarily unavailable, so only the courses built into the site are shown. Reload this page in a moment.</p>
    : noPublished ? <p role="status" className={styles.sampleNotice}>No published courses are in the catalogue yet.</p> : null;

  return <div className={styles.shell}>
    <a className={styles.skip} href="#castle-main">Skip to content</a>
    <ArmoryNav inCastle signedIn={signedIn} account={account} current={view === "courtyard" ? "courtyard" : undefined} />
    <main id="castle-main" className={styles.main}>
      {view === "courtyard" && <>
        <section className={styles.intro}><h1 ref={heading} tabIndex={-1}>A place to sharpen your practice.</h1><p>Choose a room. Discover a course. Build your craft.</p><span className={styles.previewNote}>The Pen & Sword · The Armory</span></section>
        <div className={styles.courtyard}>
          <Image className={styles.castleArt} src="/castle/courtyard-training.webp" alt="A stone castle courtyard with the library on the left, the council chamber ahead and the training hall on the right. In front of the fountain a wooden lectern holds an open study journal." width={1501} height={704} priority sizes="100vw" />
          <div className={styles.entrances} aria-label="Castle entrances">
            {courses.map((item) => <a key={item.id} href={item.href} className={`${styles.entrance} ${styles[item.position]}`}><strong>{item.name}</strong><span>{item.purpose}</span><b>{item.cta}</b></a>)}
            {signedIn
              ? <a href="/my-training" className={`${styles.entrance} ${styles.mytraining}`}>
                  <strong>My Training</strong>
                  <span>
                    <span className={styles.mineLine}>{mine?.next ? `${mine.next.started ? "Continue" : "Start"}: ${mine.next.title}` : mine && mine.count > 0 ? `${mine.count} ${mine.count === 1 ? "programme" : "programmes"}` : "Nothing enrolled yet"}</span>
                    {mine?.live && <span className={styles.mineLine}>Live {mine.live}</span>}
                  </span>
                  <b>Open →</b>
                </a>
              : <a href="/login" className={`${styles.entrance} ${styles.mytraining}`}>
                  <strong>My Training</strong>
                  <span>Sign in to see your training</span>
                  <b>Sign in →</b>
                </a>}
          </div>
        </div>
        <section className={styles.quickAccess} aria-label="Go directly to a resource"><h2>Choose your next stop.</h2><div className={styles.buttonGrid}>
          <a className={styles.actionButton} href="/castle-resources/advocate-101/index.html">Start Immigration 101, free →</a>
          <a className={styles.actionButton} href="#list">Browse every course →</a>
          <a className={styles.actionButton} href="#council">Find rights & family resources →</a>
          <a className={styles.actionButton} href="/castle-resources/court-tour/index.html">Tour the immigration courtroom →</a>
          <a className={styles.actionButton} href="/immigration-dice">Roll the dice, practice a scenario →</a>
          <a className={styles.actionButton} href="#training">Practice in the Training Hall →</a>
        </div></section>
        <footer className={styles.footer}><em>Explore at your own pace.</em><a href="#list">Browse every course →</a></footer>
      </>}

      {view === "list" && <section className={styles.listPage}>
        <a className={styles.back} href="#courtyard">← Back to the courtyard</a><h1 ref={heading} tabIndex={-1}>Library</h1>
        <p className={styles.roomDescription}>Every course and webinar, free and paid. Search, or filter by format and topic.</p>
        {notice}
        <section className={`${styles.education} armory-theme`}>{library}</section>
      </section>}

      {inRoom && room && <>
        <div className={styles.breadcrumb}><a className={styles.back} href="#courtyard">← Back to the courtyard</a></div>
        <section className={styles.room}>
          <div className={styles.roomArt}>
            <Image src="/castle/library.png" alt="A vaulted learning room with bookshelves, a reading desk, and a practice table." width={1316} height={1196} sizes="(max-width: 760px) 100vw, 62vw" priority />
            <nav className={styles.stations} aria-label="Room destinations">
              <a className={`${styles.station} ${styles.reading}`} href="#list">Browse courses →</a>
              <a className={`${styles.station} ${styles.resources}`} href="#council">Rights & resources →</a>
              <a className={`${styles.station} ${styles.practice}`} href="#training">Practice →</a>
            </nav>
          </div>
          <div className={styles.roomContent}>
            <p className={styles.roomName}>{room.room}</p>
            <h1 ref={heading} tabIndex={-1}>{room.title}</h1>
            <p className={styles.roomDescription}>{room.description}</p>

            {view === "council" && <>
              {GROUPS.map((group) => {
                const items = council.filter((item) => audience[item.path] === group.key);
                return items.length === 0 ? null : <section key={group.key}><h2>{group.title}</h2><div className={styles.resourceGrid}>{items.map((item) => <ResourceButton key={item.path} item={item} />)}</div></section>;
              })}
              <p className={styles.sampleNotice}>New to immigration law? <a href="/castle-resources/advocate-101/index.html">Start with Immigration 101, a free course →</a></p>
            </>}

            {view === "training" && <div className={styles.resourceGrid}>{training.map((item) => <ResourceButton key={item.path} item={item} />)}</div>}
          </div>
        </section>
      </>}
    </main>
  </div>;
}
