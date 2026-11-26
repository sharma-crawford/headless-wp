import ArmoryNav from '@/components/armory/armory-nav';
import { isAuthenticated } from '@/lib/auth';
import DiceGame from './game';
import './dice.css';
export const dynamic = 'force-dynamic';
export const metadata = {title:'Roll the Dice · Immigration Practice | The Armory',robots:{index:false,follow:false}};
export default async function Page(){return <><ArmoryNav signedIn={await isAuthenticated()}/><DiceGame/></>;}
