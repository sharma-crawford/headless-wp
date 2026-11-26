import Link from 'next/link';
import type {Metadata} from 'next';
import Quiz from '../quiz';
import data from './study-data.json';
import questions from './quiz-data.json';
import '../study.css';
import '../themed-room.css';
import './orbit.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Torts: Tort Station | The Armory',description:'A sci-fi Torts study room spanning three note volumes, with sixteen comic lessons, refreshers, hypotheticals, and self-grading quizzes.'};
const safe=questions.map(({id,section,prompt,options})=>({id,section,prompt,options}));
const names=data.sections.map(s=>s.title);
const volumeNames:Record<string,string>={I:'Intentional invasions',II:'Negligence & causation',III:'Duties, defenses & remedies'};

export default function TortsRoom(){return <main className="study themed-room orbit-room">
 <header className="study-top"><Link href="/castle">The Armory</Link><Link href="/castle#library">← All study rooms</Link><Link href="/my-training">My training</Link></header>
 <section className="room-hero orbit-hero"><div className="orbit-hero-grid"><div><p className="study-eyebrow">The Armory / TORT STATION</p><p className="room-kicker">Torts · three-volume field guide</p><h1>Torts<em>Tort Station</em></h1><p className="room-intro">{data.intro}</p><div className="room-actions"><a className="study-button" href="#review">Board the station ↓</a><a href="#practice">Run the simulation ↗</a></div></div><aside className="orbit-console" aria-label="Station case method"><span className="orbit-pulse" aria-hidden="true">✦</span><strong>CASE METHOD / SECTOR 07</strong><ol><li>Identify the protected interest</li><li>Test duty or intent</li><li>Trace the causal chain</li><li>Assess defenses and harm</li></ol></aside></div></section>
 <div className="room-stats"><span><b>3</b> note volumes</span><span><b>{data.sections.length}</b> comic lessons</span><span><b>{data.sections.length}</b> refreshers & written problems</span><span><b>{questions.length}</b> quiz questions</span></div>
 <nav className="study-tabs" aria-label="Torts study modes"><a href="#review">Mission brief</a><a href="#chapters">Sectors</a><a href="#practice">Simulation</a><a href="#sources">Sources</a></nav>
 <div className="study-layout"><aside className="study-outline"><p>STATION DIRECTORY</p><ol>{data.sections.map((s,i)=><li key={s.id}><a href={'#'+s.id}><span>{String(i+1).padStart(2,'0')}</span>{s.title}</a></li>)}</ol></aside><div className="study-content">
 <section className="study-scope" id="review"><p className="study-eyebrow">VALE · AX-7 · THE ADJUDICATOR</p><h2>Every injury has a legal pathway.</h2><p>Dr. Mira Vale and android advocate AX-7 investigate each fictional incident. Begin with the short refresher, use the comic to remember the distinction, then test the rule in the written problem and self-grading questions.</p><p>The stories are study devices. Actual duties, defenses, comparative-fault rules, and remedies vary by jurisdiction; identify the governing law before treating a result as settled.</p></section>
 <section id="chapters" className="orbit-chapter-intro"><p className="study-eyebrow">THREE VOLUMES · SIXTEEN SECTORS</p><h2>Choose your next incident.</h2><div className="orbit-volume-links">{Object.entries(volumeNames).map(([v,name])=><a href={'#'+data.sections.find(s=>s.volume===v)?.id} key={v}>Volume {v}<b>{name}</b></a>)}</div></section>
 {data.sections.map((s,i)=><section className="study-section orbit-section" id={s.id} key={s.id}><header><span className="study-number">{String(i+1).padStart(2,'0')}</span><div><p className="orbit-volume">VOLUME {s.volume} · {volumeNames[s.volume]}</p><h2>{s.title}</h2><p className="study-tagline">{s.tag}</p></div></header>
 <div className="orbit-refresher"><b>AX-7&apos;S 30-SECOND REFRESHER</b><p>{s.refresher}</p></div>
 <figure className="orbit-comic"><img src={s.art} width="611" height="611" alt={s.scene}/><figcaption><b>FIELD RECORD / {String(i+1).padStart(2,'0')}</b><p>{s.scene}</p><strong>{s.memory}</strong></figcaption></figure>
 <article className="orbit-rule"><h3>Vale&apos;s rule scan</h3><p>{s.rule}</p></article>
 <article className="orbit-hypo"><p className="study-eyebrow">THE ADJUDICATOR&apos;S CHANGED-FACTS FILE</p><h3>Argue the incident</h3><p>{s.hypo[0]}</p><details><summary>Reveal the analysis and new data</summary><p>{s.hypo[1]}</p><h4>New data</h4><p>{s.hypo[2]}</p></details></article>
 <details className="section-quiz"><summary>Test this sector · {safe.filter(q=>q.section===i).length} questions</summary><Quiz subject="torts" questions={safe.filter(q=>q.section===i)} sections={names} sources={data.sources} sectionIndex={i}/></details>
 <p className="orbit-source-link">Mapped from <a href={data.sources[s.source as keyof typeof data.sources].url} target="_blank" rel="noopener noreferrer">{data.sources[s.source as keyof typeof data.sources].label} ↗</a></p><a className="back-outline" href="#chapters">↑ Back to sectors</a></section>)}
 <section id="practice" className="practice"><p className="study-eyebrow">FULL-STATION SIMULATION</p><h2>Make every element count.</h2><p>Practice one sector or the complete course. Answers and explanations appear after submission; missed questions can be retried.</p><Quiz subject="torts" questions={safe} sections={names} sources={data.sources}/></section>
 <section id="sources" className="source-note"><h2>Source transmissions.</h2><p>This room is an original teaching summary of Edward Schmalz&apos;s three Torts note volumes, checked against his final outline. Characters, comics, and space-station problems are fictional. Jurisdiction-specific law must be checked for real matters.</p><ul>{Object.values(data.sources).map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a></li>)}</ul><p>For a concrete state-law comparison, see <a href="https://kslegislature.gov/b2025_26/laws/060_000_0000_chapter/060_002_0000_article/060_002_0058a_section/060_002_0058a_k/" target="_blank" rel="noopener noreferrer">Kansas&apos;s comparative-negligence statute</a>.</p></section>
 </div></div><footer className="study-footer">Tort Station<span>Edward Schmalz · Personal study collection</span></footer>
 </main>}
