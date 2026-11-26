import type {Metadata} from 'next';
import ThemedRoom,{type RoomData} from '../themed-room';
import data from './study-data.json';
import questions from './quiz-data.json';
import CourseMap from './course-map';
import './evidence.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Evidence: The Admissibility Files | The Armory',description:'A noir Evidence review with rule explanations, case briefs, a glossary, and self-grading hypothetical quizzes.'};
export default function Evidence(){return <ThemedRoom data={data as RoomData} questions={questions} courseMap={<CourseMap/>}/>}
