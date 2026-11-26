import type {Metadata} from 'next';
import ThemedRoom,{type RoomData} from '../themed-room';
import data from './study-data.json';
import questions from './quiz-data.json';
import CourseMap from './course-map';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Professional Responsibility: Counsel of the Fairy Court | The Armory',description:'A fairy-themed Professional Responsibility review with Model Rules, case briefs, a glossary, and self-grading hypothetical quizzes.'};
export default function ProfessionalResponsibility(){return <ThemedRoom data={data as RoomData} questions={questions} courseMap={<CourseMap/>}/>}
