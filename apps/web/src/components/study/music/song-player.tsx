'use client';

import {useEffect,useId,useRef,useState} from 'react';
import type {StudySong} from './songs';

const playerEvent = 'renaissance-study-song';
export default function SongPlayer({song}:{song:StudySong}) {
  const widgetId=useId();
  const [versionId,setVersionId]=useState(song.versions[0].id);
  const [loaded,setLoaded]=useState(false);
  const audioRef=useRef<HTMLAudioElement>(null);
  const version=song.versions.find(v=>v.id===versionId)!;
  useEffect(()=>{
    const stopOther=(event:Event)=>{
      if((event as CustomEvent<string>).detail!==widgetId) {audioRef.current?.pause();}
    };
    window.addEventListener(playerEvent,stopOther);
    return ()=>window.removeEventListener(playerEvent,stopOther);
  },[widgetId]);
  const load=()=>{
    window.dispatchEvent(new CustomEvent(playerEvent,{detail:widgetId}));
    setLoaded(true);
  };
  return <article className="song-card">
    <div className="song-heading"><span className="song-symbol" aria-hidden="true">♪</span><div><h3>{song.title}</h3><p>{song.topic}</p></div></div>
    <div className="song-controls">
      <label htmlFor={widgetId}>Recording
        <select id={widgetId} value={versionId} onChange={e=>{setVersionId(e.target.value);setLoaded(false);}}>
          {song.versions.map((v,i)=><option key={v.id} value={v.id}>Version {i+1} · {v.duration}</option>)}
        </select>
      </label>
      {version.audioSrc&&<button type="button" onClick={()=>loaded?setLoaded(false):load()}>{loaded?'Close player':'Load player'} <span aria-hidden="true">{loaded?'×':'▶'}</span></button>}
      <a href={'https://suno.com/song/'+versionId} target="_blank" rel="noopener noreferrer">Open in Suno ↗</a>
    </div>
    {loaded&&version.audioSrc&&<div className="song-audio"><audio ref={audioRef} key={versionId} src={version.audioSrc} controls preload="none" onPlay={()=>window.dispatchEvent(new CustomEvent(playerEvent,{detail:widgetId}))} aria-label={song.title+' · Version '+(song.versions.indexOf(version)+1)}><a href={version.audioSrc}>Listen to this recording</a></audio></div>}
    {!version.audioSrc&&<p className="song-footnote">This recording is available through the Suno link above.</p>}
  </article>;
}
