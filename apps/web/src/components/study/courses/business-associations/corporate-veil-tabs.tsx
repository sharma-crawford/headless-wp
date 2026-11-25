'use client';

import {useState} from 'react';

const cases = [
  {
    id:'walkovszky', short:'Walkovszky', name:'Walkovszky v. Carlton', cite:'223 N.E.2d 6 (N.Y. 1966)',
    facts:'A pedestrian injured by a taxicab sued Carlton personally. Carlton held shares in ten cab corporations, each with only two cabs and the statutory minimum insurance. The complaint described an integrated fleet but did not allege that Carlton operated the cab business in his individual capacity.',
    issue:'Do a fragmented taxi fleet and minimal insurance, without more, state a claim against the individual shareholder?',
    holding:'No. The majority dismissed the claim against Carlton with leave to amend. The allegations could suggest a larger enterprise, but they did not adequately plead that the corporations were dummies for Carlton personally. The majority left the adequacy of compulsory insurance to the legislature.',
    takeaway:'Enterprise liability and owner liability are different targets. Underinsurance alone did not make this shareholder personally liable on the pleadings.',
    url:'https://law.justia.com/cases/new-york/court-of-appeals/1966/18-n-y-2d-414-1966.html'
  },
  {
    id:'radaszewski', short:'Radaszewski', name:'Radaszewski v. Telecom Corp.', cite:'981 F.2d 305 (8th Cir. 1992)',
    facts:'After a trucking accident, the injured plaintiff tried to reach the subsidiary carrier’s parent. The subsidiary had little equity but maintained substantial liability insurance when it operated; an excess insurer later became insolvent.',
    issue:'Did the parent’s control and the subsidiary’s thin equity establish wrongful use of the corporate form under Missouri law?',
    holding:'No. The court affirmed dismissal for lack of personal jurisdiction over the parent because the veil piercing showing failed. Under the Missouri three part test, control alone was insufficient; it had to be used to commit a wrong causing the injury. Insurance showed that the subsidiary was financially responsible when the accident occurred, despite the insurer’s later failure.',
    takeaway:'Measure financial responsibility in context. Insurance can answer an undercapitalization claim, but it is evidence rather than automatic immunity.',
    url:'https://openjurist.org/981/f2d/305/radaszewski-radaszewski-v-telecom-corporation-radaszewski-radaszewski'
  },
  {
    id:'freeman', short:'Freeman', name:'Freeman v. Complex Computing Co.', cite:'119 F.3d 1044 (2d Cir. 1997)',
    facts:'A consultant sought to compel Glazier to arbitrate a software company’s obligation. Glazier exercised substantial control over the company but did not hold its shares in his own name.',
    issue:'Can an individual who is an equitable owner face veil piercing without formal share ownership, and is domination enough?',
    holding:'Equitable ownership can qualify. The Second Circuit rejected a categorical formal ownership requirement but remanded because the lower court had not determined whether Glazier used his domination to commit a fraud or wrong that caused the plaintiff’s injury.',
    takeaway:'Look through paper title to real control, then separately prove wrongful use and causation. Domination by itself does not complete the claim.',
    url:'https://law.justia.com/cases/federal/appellate-courts/F3/119/1044/486494/'
  },
  {
    id:'theberge', short:'Theberge', name:'Theberge v. Darbro, Inc.', cite:'684 A.2d 1298 (Me. 1996)',
    facts:'Experienced sellers contracted with a corporation for a business transaction but did not require personal guarantees. After default, they sought to collect from individuals associated with the corporation.',
    issue:'Did the corporation’s informality and the defendants’ conduct justify piercing for sophisticated contract creditors?',
    holding:'No. Maine’s high court vacated the piercing judgment. The sellers knew how to obtain guarantees, had not done so, and the trial court had found no fraud or illegality. The evidence did not justify shifting their bargained for risk to the individuals.',
    takeaway:'For a voluntary contract creditor, ask what protection the creditor negotiated and whether there was real misuse. Missing formalities alone did not carry this case.',
    url:'https://law.justia.com/cases/maine/supreme-court/1996/684-a-2d-1298-0.html'
  },
  {
    id:'gardemal', short:'Gardemal', name:'Gardemal v. Westin Hotel Co.', cite:'186 F.3d 588 (5th Cir. 1999)',
    facts:'Following a drowning at a Mexican resort, the estate sued the hotel parent as well as the Mexican operating company. The plaintiff pointed to shared branding, reservation systems, and operating manuals.',
    issue:'Did ordinary parent subsidiary coordination make the parent the operator’s alter ego for the tort claim?',
    holding:'No. The Fifth Circuit affirmed summary judgment for the parent. The cited connections were ordinary features of an affiliated hotel business and did not establish the degree of domination and injustice needed to disregard the entities.',
    takeaway:'Common branding and oversight are not enough. Identify the specific misuse of separateness, and distinguish a parent’s own tort from piercing.',
    url:'https://law.justia.com/cases/federal/appellate-courts/F3/186/588/569426/'
  },
  {
    id:'otr', short:'OTR Associates', name:'OTR Associates v. IBC Services, Inc.', cite:'801 A.2d 407 (N.J. Super. Ct. App. Div. 2002)',
    facts:'Blimpie arranged franchise leases through thin, judgment proof subsidiaries. After a lease default, the landlord sought unpaid rent from the parent whose franchising business benefited from the arrangement.',
    issue:'Could a contract landlord pierce to the parent despite having dealt with a subsidiary?',
    holding:'Yes. The appellate court affirmed the rent judgment against the parent. The subsidiaries served the parent’s purposes while insulating it from lease obligations, and the record supported both domination and unjust use of the corporate form under New Jersey law.',
    takeaway:'Contract creditors can prevail when facts show misuse beyond ordinary affiliation. Contrast Theberge’s unprotected bargain and Gardemal’s routine coordination.',
    url:'https://law.justia.com/cases/new-jersey/appellate-division-published/2002/a2826-00-opn.html'
  }
];

export default function CorporateVeilTabs(){
  const [active,setActive]=useState(0);
  const c=cases[active];
  return <section id="corporate-veil-practice" className="pcv-worksheet" aria-labelledby="pcv-title">
    <p className="study-eyebrow">PIERCING THE CORPORATE VEIL</p>
    <h2 id="pcv-title">PCV case notes</h2>
    <p>Use the four worksheet prompts to compare the six cases. Each tab identifies the governing court’s result; apply the jurisdiction’s own test to a new problem.</p>
    <div className="pcv-tablist" role="tablist" aria-label="Corporate veil case notes">
      {cases.map((item,i)=><button key={item.id} type="button" role="tab" id={'pcv-tab-'+item.id} aria-controls={'pcv-panel-'+item.id} aria-selected={active===i} tabIndex={active===i?0:-1} onClick={()=>setActive(i)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault(); const next=(i+(e.key==='ArrowRight'?1:-1)+cases.length)%cases.length;setActive(next);document.getElementById('pcv-tab-'+cases[next].id)?.focus();}}}>{item.short}</button>)}
    </div>
    <div className="pcv-panel" role="tabpanel" id={'pcv-panel-'+c.id} aria-labelledby={'pcv-tab-'+c.id} tabIndex={0}>
      <h3>{c.name}</h3><p className="pcv-cite">{c.cite}</p>
      <dl>
        <div><dt>Case name and identifying facts</dt><dd>{c.facts}</dd></div>
        <div><dt>Issue</dt><dd>{c.issue}</dd></div>
        <div><dt>Holding and reasoning</dt><dd>{c.holding}</dd></div>
        <div><dt>Takeaway term or phrase</dt><dd>{c.takeaway}</dd></div>
      </dl>
      <a href={c.url} target="_blank" rel="noopener noreferrer">Read the opinion ↗</a>
    </div>
  </section>;
}
