'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { gates, mainPath, outcomes, caseNotes, resolveChoice, type Choice } from './flow-data';
const byId = Object.fromEntries(gates.map(g => [g.id,g]));
type Step = {from:string;label:string;to:string;limited?:boolean};
export default function AdmissionFlow(){
 const [mode,setMode]=useState<'map'|'guide'>('map');
 const [selected,setSelected]=useState('relevance');
 const [current,setCurrent]=useState('scope');
 const [history,setHistory]=useState<Step[]>([]);
 const [context,setContext]=useState<'criminal'|'civil'>('criminal');
 const heading=useRef<HTMLHeadingElement>(null);
 const id=mode==='map'?selected:current;
 const gate=byId[id]; const result=outcomes[id];
 const focus=()=>requestAnimationFrame(()=>heading.current?.focus());
 const open=(next:string)=>{setSelected(next);focus();};
 const choose=(choice:Choice)=>{
  if(mode==='map'){open(choice.to);return;}
  const next=resolveChoice(choice,history);
  setHistory([...history,{from:current,label:choice.label,to:next,limited:choice.limited}]);setCurrent(next);focus();
 };
 const back=()=>{const last=history.at(-1);if(last){setCurrent(last.from);setHistory(history.slice(0,-1));focus();}};
 const restart=()=>{setCurrent('scope');setHistory([]);focus();};
 const choices=gate?.choices.filter(c=>context==='criminal'||c.to!=='confrontation')??[];
 const completed=new Set(history.map(s=>s.from));
 const outcome=result?result.kind:'';
 return <main className="admission-app">
 <header className="admission-top"><Link href="/castle">The Armory</Link><Link href="/study/evidence">Evidence study room</Link><Link href="/my-training">My training</Link></header>
 <section className="admission-intro"><div><p className="admission-eyebrow">THE ADMISSIBILITY FILES / FEDERAL EVIDENCE</p><h1>Does the evidence<br/><em>get in?</em></h1><p>Follow the inference. Clear every applicable gate. Open a decision for its rule, foundation, and case law.</p></div><div className="admission-context"><label htmlFor="proceeding">Trial context</label><select id="proceeding" value={context} onChange={e=>{setContext(e.target.value as 'criminal'|'civil');setCurrent('scope');setHistory([]);setSelected('scope');}}><option value="criminal">Federal criminal trial</option><option value="civil">Federal civil trial</option></select><p>{context==='criminal'?'Check confrontation and the right to present a defense separately.':'The Sixth Amendment confrontation screen does not apply. Check state-law privilege where Rule 501 requires it.'}</p></div></section>
 <div className="admission-controls"><div role="group" aria-label="Analysis mode"><button aria-pressed={mode==='map'} onClick={()=>{setMode('map');setSelected(current);}}>Clickable flowchart</button><button aria-pressed={mode==='guide'} onClick={()=>setMode('guide')}>Walk through an item</button></div><p>{mode==='map'?'Select any gate; explore its branches below the explanation.':'Choose an answer after applying the test to your item and proposed use.'}</p></div>
 <div className={'admission-workspace '+(mode==='guide'?'is-guided':'')}>
 <section className="admission-map" aria-label={mode==='map'?'Evidence admission flowchart':'Progress through admission gates'}>
 <div className="map-key"><span className="key-main">Admission path</span><span className="key-branch">Special branches</span><span className="key-stop">Stop / build foundation</span></div>
 <ol className="flow-spine">{mainPath.map((nodeId,i)=>{const node=byId[nodeId];const branches=node.choices.filter(c=>byId[c.to]?.branch);return <li key={nodeId} className={(nodeId===id?'is-selected ':'')+(completed.has(nodeId)?'is-reviewed':'')}>
 {i>0&&<div className="flow-connector" aria-hidden="true"><span>continue if cleared</span></div>}
 <div className="flow-row"><button className="flow-node" aria-current={nodeId===id?'step':undefined} onClick={()=>{if(mode==='guide'){setMode('map');}open(nodeId);}}><span className="flow-number">{String(i+1).padStart(2,'0')}</span><span><strong>{node.title}</strong><small>{node.rules.length?'FRE '+node.rules.slice(0,4).join(' · ')+(node.rules.length>4?' +':''):'Constitution'}</small></span><span className="node-diamond" aria-hidden="true">◇</span></button>
 <div className="flow-offshoot">{branches.length?<>{branches.map(c=><button key={c.to} className="branch-node" onClick={()=>{setMode('map');open(c.to);}}>{byId[c.to].title}</button>)}</>:<span>{nodeId==='relevance'?'No relevant inference: exclude':nodeId==='privilege'?'Protected: exclude':nodeId==='balancing'?'Dangers substantially outweigh: exclude':nodeId==='limits'?'Specify purpose & preserve ruling':'Unmet requirement: stop or cure'}</span>}</div></div>
 </li>})}</ol>
 <div className="flow-end"><b>Eligible for the permitted use</b><span>The court decides admission.</span></div>
 <details className="branch-directory"><summary>All special branches</summary><div>{gates.filter(g=>g.branch).map(g=><button key={g.id} onClick={()=>{setMode('map');open(g.id);}}>{g.title}</button>)}</div></details>
 </section>
 <section className={'admission-panel outcome-'+outcome} aria-label="Selected decision and authorities">
 <div className="panel-header"><p className="admission-eyebrow">{mode==='guide'?'YOUR ANALYSIS · '+(history.length+1):gate?.branch?'SPECIAL BRANCH':'SELECTED GATE'}</p>{mode==='guide'&&<div className="guide-tools"><button onClick={back} disabled={!history.length}>Back</button><button onClick={restart}>Restart</button></div>}</div>
 <h2 ref={heading} tabIndex={-1}>{gate?.title??result?.title}</h2>
 {gate?<><p className="gate-question">{context==='civil'&&gate.id==='constitutional'?'Do any constitutional limits affect the proposed use or exclusion?':gate.question}</p><p className="gate-summary">{gate.summary}</p>
 {gate.rules.length>0&&<div className="rule-links" aria-label="Applicable rules">{gate.rules.map(n=><a key={n} href={'https://www.law.cornell.edu/rules/fre/rule_'+n} target="_blank" rel="noopener noreferrer">FRE {n}</a>)}</div>}
 <h3>Apply the test</h3><ul className="gate-checks">{gate.checks.map(c=><li key={c}>{c}</li>)}</ul>
 <aside className="gate-trap"><b>Watch the inference</b><p>{gate.trap}</p></aside>
 {context==='civil'&&gate.id==='constitutional'&&<p className="context-note">This civil path omits the testimonial-confrontation branch. Other applicable constitutional limits still require their own analysis.</p>}
 {gate.cases?.length? <section className="gate-cases"><h3>Cases from the book</h3>{gate.cases.map(key=>{const c=caseNotes[key];return <details key={key}><summary><strong>{c.name}</strong><span>{c.cite}</span></summary><div><p>{c.point}</p><p><b>Limit:</b> {c.limit}</p><p className="book-ref">Bellin, <i>The Law of Evidence</i>, {c.book}</p><a href={c.url} target="_blank" rel="noopener noreferrer">Read the opinion</a></div></details>})}</section>:null}
 <p className="book-ref">Book cross-reference: Bellin, <i>The Law of Evidence</i> · {gate.book}</p>
 <div className="gate-choices"><h3>{mode==='guide'?'Apply to your item':'Explore the next decision'}</h3>{choices.map((c,i)=><button key={i} className={(c.to==='excluded'?'choice-stop':c.to==='pending'?'choice-pending':'')} onClick={()=>choose(c)}><span>{c.label}</span><small>{byId[c.to]?.title??outcomes[c.to]?.title}</small></button>)}</div>
 </>:result?<><p className="outcome-text">{result.text}</p><div className="gate-trap"><b>Next action</b><p>{result.action}</p></div>{mode==='map'?<button className="start-guide" onClick={()=>{setMode('guide');restart();}}>Analyze an item from the beginning</button>:<p>Your result reflects the answers below. Use Back to correct the last answer or Restart to analyze another item.</p>}</>:null}
 {mode==='guide'&&history.length>0&&<section className="analysis-trail"><h3>Your path</h3><ol>{history.map((s,i)=><li key={i}><b>{byId[s.from].title}</b><span>{s.label}</span></li>)}</ol></section>}
 </section></div>
 <footer className="admission-sources"><h2>The authorities behind the chart</h2><p>Original study summaries based on Jeffrey Bellin’s <i>The Law of Evidence</i>, your existing Evidence study materials, and the Federal Rules. Book page references use the printed page numbers in the supplied 601-page copy. Cases identified here appear in that book; their holdings are linked to judicial opinions. Circuit decisions illustrate their jurisdiction’s law.</p><p>The official compilation is dated December 1, 2025, checked October 2, 2026. Current text controls over older quoted rule language. This chart includes the 2023 changes to Rules 106 and 702 and the 2024 changes to Rules 107, 613, and 1006. Some doctrines and exceptions require additional case-specific research; clearing one gate never clears the rest.</p><p><a href="https://www.uscourts.gov/sites/default/files/document/federal-rules-of-evidence.pdf" target="_blank" rel="noopener noreferrer">Official Federal Rules of Evidence</a><Link href="/study/evidence#case-index">Existing case briefs</Link><Link href="/study/evidence">Return to Evidence</Link></p></footer>
 </main>;
}
