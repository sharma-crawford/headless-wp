import Link from 'next/link';
import type {Metadata} from 'next';
import Quiz from '../quiz';
import data from './study-data.json';
import questions from './quiz-data.json';
import '../study.css';
import '../themed-room.css';
import './tidewater.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Criminal Law: The Tidewater Docket | The Armory',description:'A storm-soaked Criminal Law study room with original rule summaries, fourteen comics, case lenses, written hypotheticals, and self-grading quizzes.'};
const safe=questions.map(({id,section,prompt,options})=>({id,section,prompt,options}));
const names=data.sections.map(s=>s.title);
function Emphasis({text}:{text:string}){return <>{text.split(/(\*\*.*?\*\*)/g).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part)}</>}

export default function CriminalLawRoom(){return <main className="study themed-room tidewater-room">
 <header className="study-top"><Link href="/castle">The Armory</Link><Link href="/castle#library">← All study rooms</Link><Link href="/my-training">My training</Link></header>
 <section className="room-hero tidewater-hero"><div className="tidewater-hero-grid"><div><p className="study-eyebrow">The Armory / THE TIDEWATER DOCKET</p><p className="room-kicker">Criminal Law · three-volume review</p><h1>Criminal Law<em>The Tidewater Docket</em></h1><p className="room-intro">{data.intro}</p><div className="room-actions"><a className="study-button" href="#review">Enter the harbor ↓</a><a href="#practice">Take the docket quiz ↗</a></div></div><div className="tidewater-seal" aria-hidden="true"><span>⚓</span><small>ACT · MIND · CAUSE · DEFENSE</small></div></div></section>
 <div className="room-stats"><span><b>{data.sections.length}</b> chapters</span><span><b>{questions.length}</b> quiz hypotheticals</span><span><b>{data.sections.length}</b> written problems</span><span><b>{data.sections.length}</b> comic scenes</span></div>
 <nav className="study-tabs" aria-label="Criminal Law study modes"><a href="#review">The docket</a><a href="#chapters">Chapters</a><a href="#vocabulary">Working terms</a><a href="#practice">Quiz</a><a href="#sources">Sources</a></nav>
 <div className="study-layout"><aside className="study-outline"><p>THE HARBOR MAP</p><ol>{data.sections.map((s,i)=><li key={s.id}><a href={'#'+s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></aside><div className="study-content">
 <section className="study-scope" id="review"><p className="study-eyebrow">READ THE CHARGE · FOLLOW THE CURRENT</p><h2>Every theory needs its elements.</h2><p>Move from proof and conduct through mental states, property crimes, homicide, inchoate liability, and defenses. Each chapter gives you an original rule summary, an illustrated memory cue, a written problem, and a short quiz.</p><p>The harbor stories are fictional. They help you spot issues; the governing statute and jurisdiction decide the legal test. Historical common-law and Model Penal Code comparisons are labeled as such.</p></section>
 <section id="chapters" className="tidewater-chapter-intro"><p className="study-eyebrow">FOURTEEN CHAPTERS</p><h2>Open a case on the waterfront.</h2><p>Read in order or sail directly to the doctrine you want to test.</p></section>
 {data.sections.map((s,i)=><section className="study-section tidewater-section" id={s.id} key={s.id}><header><span className="study-number">{String(i+1).padStart(2,'0')}</span><div><h2>{s.title}</h2><p className="study-tagline">{s.subtitle}</p></div></header>
 <div className="study-rules">{s.rules.map(([title,text])=><article key={title}><h3>{title}</h3><p><Emphasis text={text}/></p></article>)}</div>
 <div className="study-example"><b>ON THE WATERFRONT</b><p>{s.scene}</p></div>
 <figure className="tidewater-comic"><img src={s.art} width={i < 12 ? 418 : 887} height={i < 12 ? 627 : 887} alt={s.comic}/><figcaption><b>ILLUSTRATED MEMORY CUE</b><p>{s.comic}</p><small>Original fictional scene. Apply the rule, not the drama.</small></figcaption></figure>
 {s.case&&<details className="study-case tidewater-case"><summary><span>CASE LENS FROM THE NOTES</span><strong>{s.case[0]}</strong></summary><div className="study-case-body"><p>{s.case[1]}</p><a href={data.sources[s.source as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">Read the Criminal Law notes ↗</a></div></details>}
 <article className="tidewater-hypo"><p className="study-eyebrow">THE DOCKET PROBLEM</p><h3>Build both arguments</h3><p>{s.written[0]}</p><details><summary>Reveal analysis and changed facts</summary><p>{s.written[1]}</p><h4>Change the facts</h4><p>{s.written[2]}</p></details></article>
 <details className="tidewater-terms"><summary>Terms for this chapter</summary><dl>{s.terms.map(([term,definition])=><div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></details>
 <details className="section-quiz"><summary>Test this chapter · {safe.filter(q=>q.section===i).length} questions</summary><Quiz subject="criminal-law" questions={safe.filter(q=>q.section===i)} sections={names} sources={data.sources} sectionIndex={i}/></details><a className="back-outline" href="#chapters">↑ Back to the map</a></section>)}
 <section className="weapons-glossary" id="vocabulary"><p className="study-eyebrow">THE WORKING LANGUAGE</p><h2>Terms before the tide turns</h2><div className="weapons-grid">{data.sections.flatMap(s=>s.terms.map(([term,definition])=><details key={s.id+term}><summary>{term}</summary><p>{definition} <a href={'#'+s.id}>See chapter ↗</a></p></details>))}</div></section>
 <section id="practice" className="practice"><p className="study-eyebrow">THE COMPLETE DOCKET</p><h2>Make the elements earn their place.</h2><p>Choose a chapter or take the complete review. Answers and explanations appear after submission, with a retry for missed questions.</p><Quiz subject="criminal-law" questions={safe} sections={names} sources={data.sources}/></section>
 <section id="sources" className="source-note"><h2>What anchors the docket.</h2><p>This room is an original study summary of Edward Schmalz’s three Criminal Law note volumes. The comics and harbor hypotheticals are fictional. Case lenses summarize selected decisions discussed in the notes; statutes and controlling decisions must be checked for the jurisdiction and date at issue.</p><ul>{['v1','v2','v3'].map(key=><li key={key}><a href={data.sources[key as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">{data.sources[key as keyof typeof data.sources].label} ↗</a></li>)}</ul><p>Selected official texts: <a href={data.sources.burglary.url} target="_blank" rel="noopener noreferrer">Kansas burglary statute</a>, <a href={data.sources.rape.url} target="_blank" rel="noopener noreferrer">Kansas rape statute</a>, <a href={data.sources.rehaif.url} target="_blank" rel="noopener noreferrer">Rehaif</a>, and <a href={data.sources.kahler.url} target="_blank" rel="noopener noreferrer">Kahler</a>.</p></section>
 </div></div><footer className="study-footer">The Tidewater Docket<span>Edward Schmalz · Personal study collection</span></footer>
 </main>}
