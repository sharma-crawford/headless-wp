"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { courses, type CastleProgram } from "./courses";
import { education, educationHref } from "./education";
import ArmoryNav from "@/components/armory/armory-nav";
import styles from "./castle.module.css";

const EMPTY_PROGRAMS: CastleProgram[] = [];
const studyCourses = education.filter((item) => item.group === "Doctrinal courses");
const immigration = education.filter((item) => item.group === "Immigration");
const practicePaths = ["/immigration-court-tour", "/immigration-dice", "/immigration-simulator"];
const courseKey = (path: string) => `study-${path.split("/").pop()}`;

function ResourceButton({ item }: { item: (typeof education)[number] }) {
  const href = educationHref(item.path);
  const external = href.startsWith("https:");
  return <a className={styles.resourceButton} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
    <strong>{item.title}</strong><span>{item.description}</span><b>{external ? "Open on renAIssance ↗" : "Open resource →"}</b>
  </a>;
}

export default function CastleExplorer({ programs = EMPTY_PROGRAMS, signedIn = false, catalogueUnavailable = false }: {
  programs?: CastleProgram[];
  signedIn?: boolean;
  catalogueUnavailable?: boolean;
}) {
  const [view, setView] = useState("courtyard");
  const [query, setQuery] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const wing = courses.find((item) => item.id === view);
  const program = programs.find((item) => `program-${item.id}` === view);
  const study = studyCourses.find((item) => courseKey(item.path) === view);
  const inRoom = Boolean(wing || program || study);
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const filteredPrograms = programs.filter((item) => matches(`${item.title} ${item.description}`));
  const filteredStudy = studyCourses.filter((item) => matches(`${item.title} ${item.description}`));
  const filteredResources = immigration.filter((item) => matches(`${item.title} ${item.description}`));

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      if (hash === "castle-main") return;
      const known = ["courtyard", "list", ...courses.map((item) => item.id), ...programs.map((item) => `program-${item.id}`), ...studyCourses.map((item) => courseKey(item.path))];
      setView(known.includes(hash) ? hash : "courtyard");
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [programs]);

  useEffect(() => {
    if (navigated.current) { heading.current?.focus({ preventScroll: true }); window.scrollTo(0, 0); }
    navigated.current = true;
  }, [view]);

  function programDoors(items: CastleProgram[]) {
    return items.map((item) => <a className={styles.resourceButton} href={`#program-${item.id}`} key={item.id}>
      <strong>{item.title}</strong><span>{item.enrolled ? "In your training" : "Armory catalogue"}{item.progress ? ` · ${item.progress.completed} of ${item.progress.total} completed` : ""}</span><b>Enter course room →</b>
    </a>);
  }
  function studyDoors() {
    return filteredStudy.map((item) => <a className={styles.resourceButton} href={`#${courseKey(item.path)}`} key={item.path}><strong>{item.title}</strong><span>{item.description}</span><b>Enter course room →</b></a>);
  }
  const catalogueNotice = catalogueUnavailable ? <p role="status" className={styles.sampleNotice}>The Armory catalogue is temporarily unavailable. You can still explore the education resources or <Link href="/catalogue">try the catalogue again</Link>.</p> : programs.length === 0 ? <p>No published Armory courses are available yet. Explore the education library below.</p> : null;

  return <div className={styles.shell}>
    <a className={styles.skip} href="#castle-main">Skip to courses</a>
    <ArmoryNav inCastle signedIn={signedIn} current={view === "courtyard" ? "courtyard" : view === "list" ? "list" : undefined} />
    <main id="castle-main" className={styles.main}>
      {view === "courtyard" && <>
        <section className={styles.intro}><h1 ref={heading} tabIndex={-1}>A place to sharpen your practice.</h1><p>Choose a room. Discover a course. Build your craft.</p><span className={styles.previewNote}>The Pen & Sword · The Armory</span></section>
        <div className={styles.courtyard}>
          <Image className={styles.castleArt} src="/castle/courtyard.png" alt="A stone castle courtyard with the library on the left, council chamber ahead, and training hall on the right." width={1832} height={860} priority sizes="100vw" />
          <div className={styles.entrances} aria-label="Castle entrances">{courses.map((item) => <a key={item.id} href={`#${item.id}`} className={`${styles.entrance} ${styles[item.position]}`}><strong>{item.room}</strong><span>{item.title}</span><b>Enter room →</b></a>)}</div>
        </div>
        <section className={styles.quickAccess} aria-label="Go directly to a resource"><h2>Choose your next stop.</h2><div className={styles.buttonGrid}>
          <a className={styles.actionButton} href="/castle-resources/court-tour/index.html">Tour the immigration courtroom →</a>
          <a className={styles.actionButton} href="/castle-resources/advocate-101/index.html">Start Immigration 101 →</a>
          <a className={styles.actionButton} href="#library">Explore all course rooms →</a>
          <a className={styles.actionButton} href="#council">Find rights & family resources →</a>
          <a className={styles.actionButton} href="/my-training">Return to My Training →</a>
          <a className={styles.actionButton} href="/webinars">Open webinars →</a>
        </div></section>
        <footer className={styles.footer}><em>Explore at your own pace.</em><a href="#list">Browse every course and resource →</a></footer>
      </>}

      {view === "list" && <section className={styles.listPage}>
        <a className={styles.back} href="#courtyard">← Back to the courtyard</a><h1 ref={heading} tabIndex={-1}>Courses & resources</h1>
        <label className={styles.search}>Find a course or resource<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles and topics" /></label>
        <section className={styles.education}><h2>Armory courses</h2>{catalogueNotice}<div className={styles.buttonGrid}>{programDoors(filteredPrograms)}</div></section>
        <section className={styles.education}><h2>The nine law-school courses</h2><div className={styles.buttonGrid}>{studyDoors()}</div></section>
        <section className={styles.education}><h2>Immigration resources</h2><div className={styles.buttonGrid}>{filteredResources.map((item) => <ResourceButton key={item.path} item={item} />)}</div></section>
        {filteredPrograms.length + filteredStudy.length + filteredResources.length === 0 && <p role="status">No courses or resources match “{query}”. Try another title or topic.</p>}
      </section>}

      {inRoom && <>
        <div className={styles.breadcrumb}><a className={styles.back} href={program || study ? "#library" : "#courtyard"}>← {program || study ? "Back to the library" : "Back to the courtyard"}</a></div>
        <section className={styles.room}>
          <div className={styles.roomArt}>
            <Image src="/castle/library.png" alt="A vaulted learning room with bookshelves, a reading desk, and a practice table." width={1316} height={1196} sizes="(max-width: 760px) 100vw, 62vw" priority />
            <nav className={styles.stations} aria-label="Room destinations">
              <a className={`${styles.station} ${styles.reading}`} href={program ? (program.enrolled ? `/programs/${program.id}` : `/catalogue/${program.id}`) : study ? educationHref(study.path) : "#list"}>{program || study ? "Open course →" : "Browse courses →"}</a>
              <a className={`${styles.station} ${styles.resources}`} href="#council">Rights & resources →</a>
              <a className={`${styles.station} ${styles.practice}`} href="/castle-resources/court-tour/index.html">Courtroom tour →</a>
            </nav>
          </div>
          <div className={styles.roomContent}>
            <p className={styles.roomName}>{wing?.room ?? "Your course room"}</p>
            <h1 ref={heading} tabIndex={-1}>{wing?.title ?? program?.title ?? study?.title}</h1>
            <p className={styles.roomDescription}>{wing?.description ?? program?.description ?? study?.description}</p>
            {program && <>
              {program.progress && <p>{program.progress.completed} of {program.progress.total} learning items completed.</p>}
              <a className={styles.actionButton} href={program.enrolled ? `/programs/${program.id}` : `/catalogue/${program.id}`}>{program.enrolled ? "Continue course" : "View course & enrollment"} →</a>
              <p className={styles.sampleNotice}>Lessons, quizzes, and saved progress are available through the course page.</p>
            </>}
            {study && <><ResourceButton item={study} /><p className={styles.sampleNotice}>This course opens on renAIssance while its Armory import is prepared.</p></>}
            {wing?.id === "library" && <>
              <h2>Armory courses</h2>{catalogueNotice}<div className={styles.resourceGrid}>{programDoors(programs)}</div>
              <h2>The nine law-school courses</h2><div className={styles.resourceGrid}>{studyCourses.map((item) => <a className={styles.resourceButton} href={`#${courseKey(item.path)}`} key={item.path}><strong>{item.title}</strong><b>Enter course room →</b></a>)}</div>
            </>}
            {wing?.id === "council" && <div className={styles.resourceGrid}>{immigration.filter((item) => !practicePaths.includes(item.path)).map((item) => <ResourceButton key={item.path} item={item} />)}</div>}
            {wing?.id === "training" && <div className={styles.resourceGrid}>
              <a className={styles.actionButton} href="/my-training">Open My Training →</a><a className={styles.actionButton} href="/webinars">Join or watch webinars →</a>
              {immigration.filter((item) => practicePaths.includes(item.path)).map((item) => <ResourceButton key={item.path} item={item} />)}
            </div>}
            {(program || study) && <div className={styles.resourceGrid}><h2>Explore more</h2><a className={styles.actionButton} href="#council">Open immigration resources →</a><a className={styles.actionButton} href="#training">Open the training hall →</a></div>}
          </div>
        </section>
      </>}
    </main>
  </div>;
}
