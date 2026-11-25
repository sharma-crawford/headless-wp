import Link from 'next/link';
import type {Metadata} from 'next';
import Quiz from '../quiz';
import {CourseSongs,LessonSongs} from '../../music/course-songs';
import data from './study-data.json';
import questions from './quiz-data.json';
import '../study.css';
import '../themed-room.css';
import './infernal.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Contracts: The Infernal Bar | renAIssance Legal Education',description:'A Contracts study room taught by demon lawyers, with four volumes, sixteen illustrated refreshers, written problems, and self-grading quizzes.'};
const safe=questions.map(({id,section,prompt,options})=>({id,section,prompt,options}));
const names=data.sections.map(s=>s.title);
const volumeNames:Record<string,string>={I:'The bargain',II:'Assent',III:'Defenses & meaning',IV:'Performance & remedies'};

export default function ContractsRoom(){return <main className="study themed-room infernal-room">
 <header className="study-top"><Link href="/castle">The Armory</Link><Link href="/castle#library">← All study rooms</Link><Link href="/my-training">My training</Link></header>
 <section className="room-hero infernal-hero"><div className="infernal-hero-grid"><div><p className="study-eyebrow">renAIssance / THE INFERNAL BAR</p><p className="room-kicker">Contracts · a four-volume course</p><h1>Contracts<em>The Infernal Bar</em></h1><p className="room-intro">{data.intro}</p><div className="room-actions"><a className="study-button" href="#review">Enter chambers ↓</a><a href="#songs">Study songs</a><a href="#practice">Take the bar quiz ↗</a></div></div><aside className="infernal-seal" aria-label="The demon counsel's method"><span>⚖</span><strong>THE DEMON COUNSEL&apos;S METHOD</strong><ol><li>Classify the transaction</li><li>Find assent and exchange</li><li>Test terms and defenses</li><li>Prove breach and remedy</li></ol></aside></div></section>
 <div className="room-stats"><span><b>4</b> note volumes</span><span><b>{data.sections.length}</b> illustrated chapters</span><span><b>{data.sections.length}</b> refreshers</span><span><b>{questions.length}</b> quiz questions</span></div>
 <nav className="study-tabs" aria-label="Contracts study modes"><a href="#review">The case method</a><a href="#chapters">Chambers</a><a href="#songs">Study songs</a><a href="#practice">Quiz</a><a href="#sources">Sources</a></nav>
 <div className="study-layout"><aside className="study-outline"><p>THE INFERNAL INDEX</p><ol>{data.sections.map((s,i)=><li key={s.id}><a href={'#'+s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></aside><div className="study-content"><CourseSongs subject="contracts"/>
 <section className="study-scope" id="review"><p className="study-eyebrow">COUNSEL FOR BOTH SIDES</p><h2>Read the bargain. Spot the trap.</h2><p>Vesper, Ash, and Judge Cinder guide each issue. Start with the refresher, read the rule, argue the fictional dispute, then work the changed-facts problem before checking the answer. The characters are fictional; the doctrinal distinctions come from the four linked note volumes.</p><p>Contracts doctrine varies by jurisdiction, especially for mixed transactions, modifications, form terms, defenses, and remedies. Apply the governing rule to the actual facts in front of you.</p></section>
 <section id="chapters" className="infernal-chapter-intro"><p className="study-eyebrow">THE FOUR VOLUMES</p><h2>Sixteen hearings before the bar.</h2><div className="infernal-volume-links">{Object.entries(volumeNames).map(([v,name])=><a href={'#'+data.sections.find(s=>s.volume===v)?.id} key={v}>Volume {v} <b>{name}</b></a>)}</div></section>
 {data.sections.map((s,i)=><section className="study-section infernal-section" id={s.id} key={s.id}><header><span className="study-number">{String(i+1).padStart(2,'0')}</span><div><p className="infernal-volume">VOLUME {s.volume} · {volumeNames[s.volume]}</p><h2>{s.title}</h2><p className="study-tagline">{s.tag}</p></div></header><LessonSongs subject="contracts" sectionId={s.id}/>
 <div className="infernal-refresher"><b>VESPER&apos;S 30-SECOND REFRESHER</b><p>{s.refresher}</p></div>
 <figure className="infernal-comic"><img src={s.art} width="611" height="611" alt={s.scene}/><figcaption><b>DEMON COUNSEL AT WORK</b><p>{s.scene}</p></figcaption></figure>
 <div className="study-rules">{s.rules.map(([title,text])=><article key={title}><h3>Counsel&apos;s rule · {title}</h3><p>{text}</p></article>)}</div>
 <article className="infernal-hypo"><p className="study-eyebrow">JUDGE CINDER&apos;S CHAMBERS PROBLEM</p><h3>Argue both sides</h3><p>{s.hypo[0]}</p><details><summary>Reveal demon counsel&apos;s analysis and a changed fact</summary><p>{s.hypo[1]}</p><h4>Judge Cinder changes the facts</h4><p>{s.hypo[2]}</p></details></article>
 <details className="section-quiz"><summary>Test this chapter · {safe.filter(q=>q.section===i).length} questions</summary><Quiz subject="contracts" questions={safe.filter(q=>q.section===i)} sections={names} sources={data.sources} sectionIndex={i}/></details>
 <p className="infernal-source-link">From <a href={data.sources[s.source as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">{data.sources[s.source as keyof typeof data.sources].label} ↗</a></p><a className="back-outline" href="#chapters">↑ Back to chambers</a></section>)}
 <section id="practice" className="practice"><p className="study-eyebrow">THE COMPLETE BAR EXAM</p><h2>Prove it on new facts.</h2><p>Choose one chapter or take the complete review. Explanations appear after submission, with a retry for missed questions.</p><Quiz subject="contracts" questions={safe} sections={names} sources={data.sources}/></section>
 <section id="sources" className="source-note"><h2>The notes behind the counsel.</h2><p>This room summarizes Edward Schmalz&apos;s four Contracts note volumes in original language. Demon lawyers, scenes, illustrations, and hypotheticals are fictional study devices. Check controlling authority for the jurisdiction and date of any real problem.</p><ul>{Object.values(data.sources).map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>)}</ul><p>Selected official Kansas Article 2 texts for comparison: <a href="https://www.kslegislature.gov/b2025_26/laws/084_000_0000_chapter/084_002_0000_article/084_002_0207_section/084_002_0207_k/" target="_blank" rel="noopener noreferrer">additional terms in acceptance</a> and <a href="https://kslegislature.gov/b2025_26/laws/084_000_0000_chapter/084_002_0000_article/084_002_0715_section/084_002_0715_k/" target="_blank" rel="noopener noreferrer">buyer consequential damages</a>.</p></section>
 </div></div><footer className="study-footer">The Infernal Bar<span>Edward Schmalz · Personal study collection</span></footer>
 </main>}
