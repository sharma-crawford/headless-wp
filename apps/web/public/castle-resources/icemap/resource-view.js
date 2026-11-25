(() => {
 const params=new URLSearchParams(location.search);const guide=params.get('view')==='rights'||location.pathname.replace(/\/$/,'')==='/immigration-rights';document.documentElement.dataset.resourceView=guide?'rights':'finder';
 const nav=document.querySelector('.ps-resource-header nav');nav.querySelectorAll('a').forEach(a=>{if(a.getAttribute('href')===(guide?'/castle-resources/icemap/map.html?view=rights':'/castle-resources/icemap/map.html'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 if(guide){const skip=document.querySelector('.skip');skip.href='#know-your-rights';skip.textContent='Skip to rights guide';}
 if(guide){document.title='Rights & family help | The Pen & Sword';document.querySelector('link[rel=canonical]').href='https://legal-renaissance.com/immigration-rights';}
 const guideHashes=['#know-your-rights','#bill-of-rights','#family-guide','#habeas-guide'];
 const routeOldLink=()=>{let hash=location.hash;try{if(parent!==window&&parent.location.hash)hash=parent.location.hash;}catch{}if(!guide&&guideHashes.includes(hash)){const url=new URL('/castle-resources/icemap/map.html?view=rights',location.origin);if(params.has('lang'))url.searchParams.set('lang',params.get('lang'));url.hash=hash;window.top.location.replace(url.href);}else if(guide&&hash){document.getElementById(hash.slice(1))?.scrollIntoView();}};
 routeOldLink();window.addEventListener('hashchange',routeOldLink);
 function guideLinks(){const lang=document.documentElement.lang;document.querySelectorAll('[data-guide-link]').forEach(a=>a.href='/castle-resources/icemap/map.html?view=rights&lang='+encodeURIComponent(lang));}
 document.addEventListener('icemap-language',guideLinks);guideLinks();
 if(guide){const back=document.querySelector('footer a[href="#workspace"]');back.setAttribute('href','/castle-resources/icemap/map.html');back.setAttribute('target','_top');back.textContent='Return to facility finder';}
})();
