import Link from 'next/link';
import type {Metadata} from 'next';
import Quiz from '../quiz';
import {CourseSongs,LessonSongs} from '../../music/course-songs';
import data from './study-data.json';
import questions from './quiz-data.json';
import '../study.css';
import '../themed-room.css';
import './property.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Property: The Noble Estates | The Armory',description:'Property law in a fantasy court: original study notes, fourteen illustrated chapters, case lenses, and self-grading quizzes.'};
const safe=questions.map(({id,section,prompt,options})=>({id,section,prompt,options}));
const names=data.sections.map(s=>s.title);
function Emphasis({text}:{text:string}){return <>{text.split(/(\*\*.*?\*\*)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part)}</>}

export default function PropertyRoom(){return <main className="study themed-room noble-room">
 <header className="study-top"><Link href="/castle">The Armory</Link><Link href="/castle#library">← All study rooms</Link><Link href="/my-training">My training</Link></header>
 <section className="room-hero noble-hero"><div className="noble-hero-grid"><div><p className="study-eyebrow">The Armory / THE NOBLE ESTATES</p><p className="room-kicker">A Property law fantasy court</p><h1>Property<em>The Noble Estates</em></h1><p className="room-intro">{data.intro}</p><div className="room-actions"><a className="study-button" href="#review">Enter the realm ↓</a><a href="#songs">Study songs</a><a href="#practice">Begin the trials ↗</a></div></div><div className="noble-crest" aria-hidden="true"><span>⚜</span><small>CLAIM · HOLD · CONVEY</small></div></div></section>
 <div className="room-stats"><span><b>{data.sections.length}</b> chapters</span><span><b>{questions.length}</b> quiz hypotheticals</span><span><b>{data.sections.length}</b> written problems</span><span><b>{data.sections.length}</b> comic scenes</span></div>
 <nav className="study-tabs" aria-label="Property study modes"><a href="#review">The realm</a><a href="#chapters">Chapters</a><a href="#vocabulary">Court vocabulary</a><a href="#songs">Study songs</a><a href="#practice">Trials</a><a href="#sources">Notes &amp; sources</a></nav>
 <div className="study-layout"><aside className="study-outline"><p>THE ROYAL MAP</p><ol>{data.sections.map((s,i)=><li key={s.id}><a href={'#'+s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></aside><div className="study-content"><CourseSongs subject="property"/>
 <section className="study-scope" id="review"><p className="study-eyebrow">FROM THE CASTLE GATE TO THE CROWN</p><h2>Every claim has an interest behind it.</h2><p>Begin by naming the property interest, then the act that created or limited it. Each chapter pairs a legal test with a fantasy scene, an illustrated memory cue, a written problem, and a short quiz. The full trial brings all chapters together.</p><p>The realm is fictional; the doctrines follow Edward Schmalz’s Property notes. State rules and statutes may change the result, especially for adverse possession, landlord–tenant law, recording, and land use.</p></section>
 <section id="chapters" className="noble-chapter-intro"><p className="study-eyebrow">FOURTEEN CHAPTERS</p><h2>Open the royal map.</h2><p>Read in sequence or choose the doctrine you want to practice.</p></section>
 {data.sections.map((s,i)=><section className="study-section noble-section" id={s.id} key={s.id}><header><span className="study-number">{String(i+1).padStart(2,'0')}</span><div><h2>{s.title}</h2><p className="study-tagline">{s.subtitle}</p></div></header><LessonSongs subject="property" sectionId={s.id}/>
 <div className="study-rules">{s.rules.map(([title,text])=><article key={title}><h3>{title}</h3><p><Emphasis text={text}/></p></article>)}</div>
 <div className="study-example"><b>A DISPUTE IN THE REALM</b><p>{s.scene}</p></div>
 <figure className="noble-comic"><img src={s.art} width="560" height="560" alt={s.comic}/><figcaption><b>ILLUSTRATED MEMORY CUE</b><p>{s.comic}</p><small>Original fictional art. Apply the legal elements to real facts.</small></figcaption></figure>
 {s.case&&<details className="study-case noble-case"><summary><span>CASE LENS FROM THE NOTES</span><strong>{s.case[0]}</strong></summary><div className="study-case-body"><p>{s.case[1]}</p><a href={data.sources[s.source as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">Read the Property notes ↗</a></div></details>}
 <article className="noble-hypo"><p className="study-eyebrow">THE LORDS&apos; PROBLEM</p><h3>Argue the claim</h3><p>{s.written[0]}</p><details><summary>Reveal analysis and changed facts</summary><p>{s.written[1]}</p><h4>Change the facts</h4><p>{s.written[2]}</p></details></article>
 <details className="noble-terms"><summary>Terms to carry into court</summary><dl>{s.terms.map(([term,definition])=><div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></details>
 <details className="section-quiz"><summary>Test this chapter · {safe.filter(q=>q.section===i).length} questions</summary><Quiz subject="property" questions={safe.filter(q=>q.section===i)} sections={names} sources={data.sources} sectionIndex={i}/></details><a className="back-outline" href="#chapters">↑ Back to the map</a></section>)}
 <section className="weapons-glossary" id="vocabulary"><p className="study-eyebrow">THE COURT&apos;S LANGUAGE</p><h2>Court vocabulary</h2><div className="weapons-grid">{data.sections.flatMap(s=>s.terms.map(([term,definition])=><details key={s.id+term}><summary>{term}</summary><p>{definition} <a href={'#'+s.id}>See chapter ↗</a></p></details>))}</div></section>
 <section id="practice" className="practice"><p className="study-eyebrow">THE FINAL TRIAL</p><h2>Who has the better claim?</h2><p>Choose a chapter or take the complete review. Submit to see explanations and your strongest next study targets.</p><Quiz subject="property" questions={safe} sections={names} sources={data.sources}/></section>
 <section id="sources" className="source-note"><h2>The notes behind the realm.</h2><p>This original study room is organized from Edward Schmalz’s three Property note volumes and open-book outline. Case lenses are short summaries of cases discussed in those notes, not substitutes for judicial opinions. The fantasy scenarios and comics are fictional memory aids.</p><ul>{['v1','v2','v3','outline'].map(key=><li key={key}><a href={data.sources[key as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">{data.sources[key as keyof typeof data.sources].label} ↗</a></li>)}</ul><p>Federal illustrations include the <a href={data.sources.fha.url} target="_blank" rel="noopener noreferrer">Fair Housing Act</a> and <a href={data.sources.kelo.url} target="_blank" rel="noopener noreferrer">Kelo in the official U.S. Reports</a>. Always check current local law for a real dispute.</p></section>
 </div></div><footer className="study-footer">The Noble Estates<span>Edward Schmalz · Personal study collection</span></footer>
 </main>}
