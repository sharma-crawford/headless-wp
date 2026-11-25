import data from './study-data.json';
export default function CourseMap(){return <section className="study-scope" id="topic-guide"><p className="study-eyebrow">TOPIC GUIDE</p><h2>Choose a topic to review.</h2><p>Study at your own pace. Open a topic, review the rule, and apply it to a hypothetical.</p><ul>{data.sections.map(s=><li key={s.id}><a href={'#'+s.id}>{s.title}</a></li>)}</ul></section>}
