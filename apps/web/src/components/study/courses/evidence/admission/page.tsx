import type { Metadata } from 'next';
import AdmissionFlow from './admission-flow';
import './admission.css';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Evidence Admission Flowchart | renAIssance Legal Education', description: 'Explore the federal evidence admission gates with a clickable flowchart, guided analysis, rules, and case references from Jeffrey Bellin’s The Law of Evidence.' };
export default function AdmissionPage() { return <AdmissionFlow/>; }
