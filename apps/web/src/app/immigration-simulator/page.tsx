import { isAuthenticated } from '@/lib/auth';
import Simulator from './simulator';
import './simulator.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'The Line · The Pen & Sword', robots: { index: false, follow: false } };
export default async function Page() { return <Simulator signedIn={await isAuthenticated()} />; }
