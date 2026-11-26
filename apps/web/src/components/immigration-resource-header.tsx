import ArmoryNav from "@/components/armory/armory-nav";
import { educationHref } from "@/components/castle/education";
const links=[['Court tour','/immigration-court-tour'],['Immigration 101','/immigration-101'],['The Line','/immigration-simulator'],['Detention finder','/icemap'],['Rights & family help','/immigration-rights']] as const;
export default function PenSwordHeader({current,signedIn=false}:{current:string;signedIn?:boolean}){return <><ArmoryNav signedIn={signedIn}/><nav className="ps-resource-header" aria-label="Immigration resources">{links.map(([label,href])=><a key={href} href={educationHref(href)} aria-current={current===href?'page':undefined}>{label}</a>)}</nav></>;}
