'use client';
import { useState } from 'react';
const observations = [
 [['The notice','The hearing date and instructions need to be understood before Elena can plan.'],['The household','The same table holds family life and the legal case. Neither waits for the other.'],['The next shift','Elena has to decide how to get help without losing the time she needs for work.']],
 [['The move','A new room brings a new address, a new route to court, and another expense.'],['The mail','Elena needs a dependable way to receive notices while her housing changes.'],['The child','Lucía’s stability is part of the decision even though it does not appear in a court file.']],
 [['The phone calls','Each referral creates another call, wait, and explanation.'],['The waiting list','Finding a qualified organization does not mean representation is available.'],['The promise','A guaranteed result sounds comforting when the real process offers uncertainty.']],
 [['The record','Obtaining a document can require people, money, time, and access across borders.'],['The relative','A request for evidence may put a person back home in a difficult position.'],['The gap','A missing record needs an explanation and a discussion of possible alternatives.']],
 [['The connection','A phone plan affects whether the clinic can reach Elena.'],['The groceries','Money spent on communication is money unavailable for the next household need.'],['The library','A free connection can still require travel, opening hours, and a private place to speak.']],
 [['The interpreter','Elena needs to be understood in the language and dialect she uses.'],['The timeline','An uncertain date and an uncertain event are different questions.'],['The child waiting','An interview can be harder to complete when a parent is also managing childcare.']],
 [['The original','Elena keeps the original record so it can be reviewed with the translation.'],['The translation','Translation is a task with its own cost, qualifications, and turnaround time.'],['The deadline','A useful document may still take time to prepare in the required format.']],
 [['The appointment','Medical care and case preparation can collide on the same afternoon.'],['The calendar','Rescheduling can solve one problem while shortening preparation time.'],['The caregiver','Elena’s role as a parent continues throughout the legal process.']],
 [['The folder','An organized packet makes it easier to see what is ready and what remains unresolved.'],['The copies','Keeping copies helps Elena track what she has submitted.'],['The missing item','Unavailable evidence, unfinished work, and unanswered legal questions need different follow-up.']],
 [['The bus','Transportation depends on routes, timing, cost, and a backup plan.'],['The early start','Arriving at court can begin long before a hearing starts.'],['The child beside her','Childcare is part of transportation planning, not an afterthought.']],
 [['The room','The judge, government attorney, respondent, and interpreter have different roles.'],['The interpreter','Language access helps Elena follow the proceeding; it is different from legal representation.'],['The folder','The file cannot show every barrier Elena faced while preparing it.']],
 [['The dinner','Daily life continues while a decision or another hearing remains pending.'],['The waiting','Uncertainty has a household cost even when there is no new document to file.'],['The relationship','Elena and Lucía have a life together beyond the legal case.']]
] as const;
const descriptions=[
 'Fictional illustration of Elena and Lucía reading a hearing notice at their kitchen table.',
 'Fictional illustration of Elena and Lucía moving into a modest room.',
 'Fictional illustration of Elena making calls to legal-service organizations.',
 'Fictional illustration of Elena reviewing a record while contacting a relative.',
 'Fictional illustration of Elena using library communication facilities with household groceries nearby.',
 'Fictional illustration of Elena in an interpreted consultation while her daughter waits nearby.',
 'Fictional illustration of Elena and a translator reviewing a medical record.',
 'Fictional illustration of Elena caring for her daughter at a medical appointment.',
 'Fictional illustration of Elena organizing evidence in a folder.',
 'Fictional illustration of Elena and Lucía waiting for a morning bus.',
 'Fictional illustration of an immigration hearing with separate participants and an interpreter.',
 'Fictional illustration of Elena and Lucía preparing dinner at home.'
];
export function ScenePicture({index,className=''}:{index:number;className?:string}){
 const panel=index%4;
 return <div className={`line-scene-picture ${className}`} role="img" aria-label={descriptions[index]} style={{backgroundImage:`url('/immigration-simulator/art/chapter-${Math.floor(index/4)+1}.webp')`,backgroundPosition:`${panel%2?100:0}% ${panel>=2?100:0}%`}}/>;
}
export default function SceneArt({index,narrative,showImages}:{index:number;narrative:string;showImages:boolean}){
 const [selected,setSelected]=useState<number|null>(null);
 return <div className="line-scene-context"><div className={showImages?'line-illustrated-narrative':'line-text-narrative'}>{showImages&&<ScenePicture index={index}/>}<div><p className="line-narrative">{narrative}</p>{showImages&&<small className="line-art-credit">Original illustration · Fictional characters</small>}</div></div>{showImages&&<div className="line-look-closer"><p className="line-eyebrow">Explore this moment</p><div className="line-detail-controls">{observations[index].map(([label],i)=><button key={label} aria-pressed={selected===i} aria-controls={`scene-detail-${index}`} onClick={()=>setSelected(selected===i?null:i)}>{label}</button>)}</div><div id={`scene-detail-${index}`} className="line-detail-note" aria-live="polite">{selected===null?<p>Choose a detail to consider what may sit outside the case file.</p>:<p><strong>{observations[index][selected][0]}.</strong> {observations[index][selected][1]}</p>}</div></div>}</div>;
}
