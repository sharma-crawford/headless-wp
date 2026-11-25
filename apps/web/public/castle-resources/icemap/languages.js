/* Local unofficial, AI-assisted translations. No search text or case information is sent to translation services. */
(async()=>{
const all=await fetch('/castle-resources/icemap/data/languages.json').then(r=>r.json());
const bill=await fetch('/castle-resources/icemap/data/bill-of-rights.json').then(r=>r.json());
const full=await fetch('/castle-resources/icemap/data/bill-of-rights-full.json').then(r=>r.json());
const select=document.getElementById('language');
const roman=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
let active='en';
function fullText(code){
 const target=document.getElementById('bill-full-text');
 const opened=new Set([...target.querySelectorAll('details')].map((x,i)=>x.open?i:-1));
 const first=!target.dataset.rendered;target.replaceChildren();
 full.languages[code].forEach((text,i)=>{
  const item=document.createElement('details');item.open=opened.has(i)||first;
  const h=document.createElement('summary');h.textContent=roman[i];
  const row=document.createElement('div');row.className='full-translation-row';
  const add=(value,language,label)=>{const col=document.createElement('div');col.className='amendment-column';col.lang=language;col.dir=language==='ar'?'rtl':'ltr';const title=document.createElement('strong');title.className='column-label';title.textContent=label;const p=document.createElement('p');p.textContent=value;col.append(title,p);row.append(col);};
  add(text,code,code==='en'?all[code].originalLabel:all[code].translationLabel);
  if(document.getElementById('bill-compare').checked&&code!=='en')add(full.languages.en[i],'en',all[code].originalLabel);
  item.append(h,row);target.append(item);
 });target.dataset.rendered='true';
}
function themeLabel(){const d=all[active];document.getElementById('theme-toggle').textContent=document.documentElement.dataset.theme==='dark'?d.lightTheme:d.darkTheme;}
try{document.documentElement.dataset.theme=localStorage.getItem('ice-map-theme')||'light';}catch{}
document.getElementById('theme-toggle').onclick=()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('ice-map-theme',document.documentElement.dataset.theme);}catch{}themeLabel();};
document.getElementById('bill-open-all').onclick=()=>document.querySelectorAll('#bill-full-text details').forEach(x=>x.open=true);
document.getElementById('bill-close-all').onclick=()=>document.querySelectorAll('#bill-full-text details').forEach(x=>x.open=false);
document.getElementById('bill-compare').onchange=()=>fullText(active);
for(const [code,d] of Object.entries(all))select.add(new Option(d.name,code));
const bindings={'.intro h1':'title','.intro>p':'subtitle','.directory-top h2':'find','#facilities-tab':'facilities','#deaths-tab':'deaths','#districts-tab':'districts','#download':'download','#fit-results':'fit'};
for(const [css,key] of Object.entries(bindings)){const el=document.querySelector(css);if(el)el.dataset.i18n=key;}
const textNodes=new Map();
const phraseKeys={'Map':'map','Family guide':'family','Sources':'sources','State':'state','Facility inventory':'inventory','Death-associated locations':'deathLocations','Federal judicial districts':'boundaries','Only facilities with death records':'recordsOnly'};
const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const n=walker.currentNode;const key=phraseKeys[n.textContent.trim()];if(key)textNodes.set(n,key);}
let saved='en';try{saved=localStorage.getItem('ice-map-language')||'en';}catch{}
function apply(code){if(!all[code])code='en';const d=all[code];active=code;select.value=code;fullText(code);themeLabel();const panel=document.getElementById('bill-amendments');const opened=new Set([...panel.querySelectorAll('details')].map((x,i)=>x.open?i:-1));panel.replaceChildren();bill.languages[code].forEach((text,i)=>{const item=document.createElement('details');item.open=opened.has(i);const heading=document.createElement('summary');heading.textContent=String(i+1).padStart(2,'0');const content=document.createElement('p');content.textContent=text;item.append(heading,content);panel.append(item);});document.documentElement.lang=code;document.documentElement.dir=code==='ar'?'rtl':'ltr';document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=d[el.dataset.i18n]||all.en[el.dataset.i18n]);for(const [node,key]of textNodes)node.textContent=' '+d[key];document.getElementById('search').placeholder=d.search;document.querySelector('label[for=search]').textContent=d.search;document.querySelector('.dateline strong').textContent=d.reviewed;document.querySelector('.dateline span').lang='en';document.querySelector('#state option[value=""]').textContent=d.all;document.getElementById('rights-print').onclick=()=>window.print();document.getElementById('language-notice').hidden=code==='en';document.getElementById('english-records-notice').hidden=code==='en';try{localStorage.setItem('ice-map-language',code);}catch{}const u=new URL(location.href);u.searchParams.set('lang',code);history.replaceState({},'',u);try{if(parent!==window){const pu=new URL(parent.location.href);pu.searchParams.set('lang',code);parent.history.replaceState({},'',pu);}}catch{}document.dispatchEvent(new CustomEvent('icemap-language',{detail:{code}}));}
select.addEventListener('change',()=>apply(select.value));apply(new URLSearchParams(location.search).get('lang')||saved);
})();
