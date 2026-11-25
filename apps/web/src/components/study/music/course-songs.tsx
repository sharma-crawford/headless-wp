import SongPlayer from './song-player';
import {songsFor} from './songs';
import './music.css';
import lessonNames from './lesson-titles.json';
const lessonTitles:Record<string,Record<string,string>>=lessonNames;

export function LessonSongs({subject,sectionId}:{subject:string;sectionId:string}) {
  const songs=songsFor(subject,sectionId);
  if(!songs.length) return null;
  return <aside className="lesson-songs" aria-label="Songs for this lesson"><p className="song-eyebrow">LEARN IT BY HEART</p><h3>Listen to this lesson</h3>{songs.map(song=><SongPlayer key={song.id} song={song}/>)}</aside>;
}
export function CourseSongs({subject}:{subject:string}) {
  const songs=songsFor(subject);
  if(!songs.length) return null;
  return <section id="songs" className="course-songs"><p className="song-eyebrow">THE COURSE SOUNDTRACK</p><h2>Learn it by heart.</h2><p>Choose a topic and a recording. Recordings with a player play here; other recordings open in Suno. Songs appear beside the matching lessons, too.</p><p className="song-count">{songs.length} topics · {songs.reduce((n,s)=>n+s.versions.length,0)} recordings</p><div className="course-song-list">{songs.map(song=><details key={song.id}><summary><span>{song.title}</span><small>{song.versions.length} recordings</small></summary><SongPlayer song={song}/>{song.sectionIds.length>0&&<p className="song-lesson-links">Read the lesson: {song.sectionIds.map(id=><a href={'#'+id} key={id}>{lessonTitles[subject]?.[id]??'Go to topic'} ↗</a>)}</p>}</details>)}</div><p className="song-footnote">Original Suno study songs by Edward Schmalz. Use the lesson for the full rule and its exceptions.</p><a className="song-library-link" href="/castle#library">Browse all course soundtracks →</a></section>;
}
