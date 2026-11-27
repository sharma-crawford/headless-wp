import ArmoryNav from "@/components/armory/armory-nav";
import { educationHref } from "@/components/castle/education";
const links=[['Court tour','/immigration-court-tour'],['Immigration 101','/immigration-101'],['The Line','/immigration-simulator'],['Detention finder','/icemap'],['Rights & family help','/immigration-rights']] as const;
type Account={name:string;items:{href:string;label:string;external?:boolean;staff?:boolean}[]}|null;
export default function PenSwordHeader({current,signedIn=false,account=null}:{current:string;signedIn?:boolean;account?:Account}){return <><ArmoryNav signedIn={signedIn} account={account}/><nav className="ps-resource-header" aria-label="Immigration resources">{links.map(([label,href])=><a key={href} href={educationHref(href)} aria-current={current===href?'page':undefined}>{label}</a>)}</nav></>;}
