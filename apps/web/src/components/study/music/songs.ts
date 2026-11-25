import catalog from './catalog.json';

export type SongVersion = {id:string; duration:string; audioSrc?:string};
export type StudySong = {id:string; subject:string; title:string; topic:string; sectionIds:string[]; versions:SongVersion[]};
export const studySongs:StudySong[] = catalog;
export const musicCourses = [
  {id:'business-associations',title:'Business Associations',href:'/study/business-associations'},
  {id:'evidence',title:'Evidence',href:'/study/evidence'},
  {id:'property',title:'Property',href:'/study/property'},
  {id:'contracts',title:'Contracts',href:'/study/contracts'},
  {id:'civil-procedure',title:'Civil Procedure',href:'/study/civil-procedure'},
  {id:'constitutional-law',title:'Constitutional Law',href:'/music/constitutional-law'},
] as const;
export function songsFor(subject:string,sectionId?:string) {
  return studySongs.filter(s=>s.subject===subject && (sectionId===undefined || s.sectionIds.includes(sectionId)));
}
