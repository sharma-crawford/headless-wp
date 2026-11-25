#!/usr/bin/env python3
"""Stage original education files and prepare draft Platform CLE course imports.
No network calls and no writes to WordPress. Run with SOURCE_CHECKOUT OUTPUT_DIR.
"""
import argparse, concurrent.futures, hashlib, html, json, re, shutil
from pathlib import Path

SUBJECTS = ['business-associations','criminal-procedure','evidence','professional-responsibility','property','criminal-law','contracts','torts','civil-procedure']
IMMIGRATION = ['immigration-101','immigration-court-tour','habeas-corpus','immigration-rights','immigration-dice','immigration-simulator','icemap','immigration-law']
ASSETS = ['study-art','study-songs','advocate-101','court-tour','habeas-primer','immigration-dice','immigration-simulator','icemap','pen-sword']

def node(kind, title, content='', children=None, **fields):
    return dict(type=kind,title=title,status='draft',excerpt='',content=content,children=children or [],attachments=[],**fields)

def render(value, key=''):
    """Lossless text rendering of heterogeneous course data, with safe HTML."""
    if value is None: return ''
    if isinstance(value, dict):
        return ''.join('<section><h4>'+html.escape(k.replace('_',' ').title())+'</h4>'+render(v,k)+'</section>' for k,v in value.items())
    if isinstance(value, list): return '<ul>'+''.join('<li>'+render(v,key)+'</li>' for v in value)+'</ul>'
    text=str(value)
    if text.startswith('/study-art/'):
        return '<figure><img src="https://legal-renaissance.com'+html.escape(text,quote=True)+'" alt="Course illustration" /></figure>'
    if text.startswith(('https://','http://')):
        return '<a href="'+html.escape(text,quote=True)+'">'+html.escape(text)+'</a>'
    return '<p>'+html.escape(text)+'</p>'

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path);parser.add_argument('output',type=Path)
    args=parser.parse_args(); source=args.source.resolve();out=args.output.resolve()
    if source==out or source in out.parents: raise ValueError('Output must be outside source checkout')
    out.mkdir(parents=True,exist_ok=True)
    paths=['app/collection-catalog.ts','app/pen-sword-header.tsx','app/what-like-its-hard','app/music']+['app/'+x for x in IMMIGRATION]+['public/'+x for x in ASSETS]
    files=[]
    for relative in paths:
        p=source/relative
        if not p.exists(): raise FileNotFoundError(p)
        files.extend([p] if p.is_file() else [f for f in p.rglob('*') if f.is_file() and not f.name.startswith('.')])
    def copy_one(p):
        relative=p.relative_to(source); dest=out/'source'/relative;dest.parent.mkdir(parents=True,exist_ok=True)
        data=p.read_bytes();dest.write_bytes(data)
        return dict(path=str(relative),bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        records=list(pool.map(copy_one,sorted(set(files))))
    (out/'source-manifest.json').write_text(json.dumps(records,indent=2)+'\n')
    imports=out/'draft-programmes';imports.mkdir(exist_ok=True)
    summary=[]
    for subject in SUBJECTS:
        folder=out/'source/app/what-like-its-hard'
        if subject!='business-associations': folder=folder/subject
        data=json.loads((folder/'study-data.json').read_text());questions=json.loads((folder/'quiz-data.json').read_text())
        sections=data['sections']; sources=data.get('sources',{})
        seen=set()
        for question in questions:
            assert question['id'] not in seen;seen.add(question['id'])
            assert 0<=question['section']<len(sections)
            assert 0<=question['answer']<len(question['options'])
        units=[]
        for index,section in enumerate(sections):
            title=section['title'];selected=[q for q in questions if q['section']==index]
            quizzes=[]
            if selected:
                converted=[]
                for q in selected:
                    refs='\n'.join(str(sources.get(r,{}).get('url',r)) for r in q.get('refs',[]))
                    converted.append(dict(key='q'+str(q['id']),type='single',prompt=q['prompt'],help='',feedback=q['explanation']+'\n'+refs,required=False,choices=[dict(key='c'+str(i),text=option,correct=i==q['answer']) for i,option in enumerate(q['options'])]))
                quizzes=[node('quiz',title+' — practice',questions=converted,pass_mark=0,gates_completion=False)]
            module=node('module',title,render(section),quizzes)
            units.append(node('unit',title,children=[module]))
        extras={k:v for k,v in data.items() if k!='sections'}
        units.append(node('unit','Case briefs and source collection',children=[node('module','Original course reference material',render(extras))]))
        title=subject.replace('-',' ').title()
        programme=node('programme',title, '<p>Original educational material by Edward Schmalz, migrated from renAIssance Legal Education. Draft for import review; no CLE credit assigned.</p>',units,credits={},program_format='course')
        payload=dict(format='platform-cle/programme',version=1,site='https://legal-renaissance.com',programme=programme)
        target=imports/(subject+'.json');target.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n')
        assert target.stat().st_size<4_000_000
        summary.append(dict(subject=subject,sections=len(sections),questions=len(questions),case_briefs=len(data.get('cases',[])),draft=str(target.relative_to(out))))
    (out/'course-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
    (out/'README.md').write_text('''# Armory education migration staging

This directory preserves original source files and prepares nine draft Platform CLE programme imports. Nothing has been uploaded or published.

- `source-manifest.json`: byte counts and SHA-256 for every staged file.
- `source/`: original course source, study music, illustrations, and immigration resources including the courtroom tour.
- `draft-programmes/`: nine version-1 Platform CLE programme backup files. All nodes are drafts, no credit hours assigned, practice quizzes do not gate completion.
- `course-summary.json`: exact section and question counts.

The structured lesson data, case briefs, sources, questions, options, answers and explanations are converted to the existing course schema. Original TSX, interactive custom exercises and media are preserved separately; they still require integration and browser verification. Draft lesson illustrations currently point to their original legal-renaissance.com URLs. Transfer assets and rewrite these URLs before retiring the original site. Study audio and custom exercises are not yet attached to imported modules.

Immigration interactive applications are preserved in full in their selected app/public folders. Their API dependencies and access policies must be ported before replacing source links. These files must not be copied wholesale into a public route: the original course access restrictions still apply.

Import each programme through the existing curriculum builder Restore flow only after reviewing the content. Production import, media hosting, enrolment mapping, and publication remain outstanding. No publication or CLE accreditation is implied.
''')
    print(json.dumps(dict(files=len(records),bytes=sum(r['bytes'] for r in records),courses=summary),indent=2),flush=True)

if __name__=='__main__': main()
