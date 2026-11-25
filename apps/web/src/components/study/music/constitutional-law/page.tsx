import Link from 'next/link';
import type {Metadata} from 'next';
import {CourseSongs} from '../course-songs';
import '../music.css';
export const metadata:Metadata={title:'Constitutional Law Soundtrack | The Armory',description:'Memory songs for constitutional amendments, congressional powers, and the Dormant Commerce Clause.'};
export default function ConstitutionSongs(){return <main className="music-home"><header><Link href="/castle">The Armory Legal Education</Link><Link href="/castle#library">← All soundtracks</Link></header><section className="music-intro"><p className="song-eyebrow">CONSTITUTIONAL LAW</p><h1>Power.<br/>Limits.<br/>A chorus.</h1><p>A soundtrack for constitutional amendments, congressional powers, and interstate commerce.</p></section><CourseSongs subject="constitutional-law"/><footer>Edward Schmalz · Constitutional Law</footer></main>}
