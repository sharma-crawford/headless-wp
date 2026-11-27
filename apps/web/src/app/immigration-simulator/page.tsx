import { isAuthenticated } from '@/lib/auth';
import { armoryAccount } from '@/lib/navigation';
import Simulator from './simulator';
import './simulator.css';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'The Line · The Pen & Sword', robots: { index: false, follow: false } };
export default async function Page() { const signedIn = await isAuthenticated(); return <Simulator signedIn={signedIn} account={signedIn ? await armoryAccount() : null} />; }
