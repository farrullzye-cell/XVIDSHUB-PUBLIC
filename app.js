// XVIDSHUB — High Speed Public Video & Media Portal Client JavaScript

function injectHTMLWithScripts(container, htmlContent) {
  if (!container) return;
  container.innerHTML = htmlContent;
  const scripts = Array.from(container.getElementsByTagName('script'));
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
    if (oldScript.innerHTML) newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
}

const API_BASE_URL = 'https://teledriveggjsj.onrender.com';
const THUMBNAIL_BASE_URL = `${API_BASE_URL}/api/v1/public/thumbnail`;
function getPersistentThumbnailUrl(file) {
  if (file.thumbnail_url) return file.thumbnail_url;
  const id = file.id || file._id || file.file_id || file.fileId;
  return id && file.type === 'video' ? `${THUMBNAIL_BASE_URL}/${encodeURIComponent(id)}` : '';
}

let currentCategory = 'ALL';
let currentSearch = '';
let allFiles = [];
let siteConfig = { title:'XVIDSHUB', categories:[], monetization:{enabled:false} };
let currentPlayingFile = null;
let currentPageSize = 12;
let visibleItemCount = 12;

function getLikedFiles(){ try{return JSON.parse(localStorage.getItem('xvidshub_liked_files')||'[]')}catch{return[]}}
function saveLikedFile(id){const a=getLikedFiles();if(!a.includes(id)){a.push(id);localStorage.setItem('xvidshub_liked_files',JSON.stringify(a))}}

function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

async function loadSiteConfig(){
  try{const r=await fetch(`${API_BASE_URL}/api/v1/public/config`);const d=await r.json();if(d.success)siteConfig=d;}catch{}
  renderCategories();
}

function renderCategories(){
  const c=document.getElementById('category-container');
  if(!c)return;
  const cats=Array.isArray(siteConfig.categories)?siteConfig.categories:[];
  c.innerHTML=[{id:'ALL',name:'Semua'}].concat(cats).map(x=>`<button onclick="setCategory('${safe(x.id||x.name)}')" class="category-btn px-4 py-2 rounded-full text-xs font-bold border border-slate-700 ${currentCategory===(x.id||x.name)?'bg-rose-600 text-white':'bg-slate-900 text-slate-400'}">${safe(x.name||x.id)}</button>`).join('');
}
function setCategory(c){currentCategory=c;visibleItemCount=12;renderCategories();fetchPublicMedia()}

async function fetchPublicMedia(){
  const grid=document.getElementById('file-grid');
  if(!grid)return;
  grid.innerHTML='<div class="col-span-full py-16 text-center text-slate-400 font-mono text-xs"><i class="fa-solid fa-circle-notch fa-spin text-rose-500 text-3xl mb-3"></i><p class="font-bold text-slate-200">Memuat koleksi video menarik XVIDSHUB...</p></div>';
  try{
    const url=`${API_BASE_URL}/api/v1/public/media?category=${encodeURIComponent(currentCategory)}&vault_id=${encodeURIComponent(currentCategory)}`;
    const res=await fetch(url,{cache:'no-store'}); const data=await res.json();
    if(!data.success||!Array.isArray(data.media)) throw new Error('Invalid media response');
    allFiles=data.media;
    renderGrid(allFiles);
  }catch(err){grid.innerHTML='<div class="col-span-full py-12 text-center bg-[#0f1422] border border-slate-800 rounded-3xl p-6 text-slate-300 text-xs"><i class="fa-solid fa-rotate-right text-3xl mb-2 text-rose-500"></i><p class="font-bold text-sm">Gagal memuat media. Coba muat ulang halaman.</p></div>';}
}

function initVideoObserver() {}

function renderGrid(files){
  const grid=document.getElementById('file-grid'); if(!grid)return;
  let filtered=files;
  if(currentSearch)filtered=files.filter(f=>String(f.title||'').toLowerCase().includes(currentSearch.toLowerCase())||String(f.vault?.name||'').toLowerCase().includes(currentSearch.toLowerCase()));
  if(!filtered.length){grid.innerHTML='<div class="col-span-full py-12 text-center text-slate-400">Tidak ada video yang sesuai pencarian.</div>';return;}
  const liked=getLikedFiles();
  const visible=filtered.slice(0,visibleItemCount);
  grid.innerHTML=visible.map(file=>{
    const isImage=file.type==='image',isVideo=file.type==='video',likedFile=liked.includes(file.id),thumb=getPersistentThumbnailUrl(file);
    let thumbnailHtml=`<div class="w-full h-44 bg-slate-900 flex items-center justify-center text-slate-500"><i class="${isVideo?'fa-solid fa-film':'fa-regular fa-file'} text-3xl"></i></div>`;
    if(isImage)thumbnailHtml=`<div class="w-full h-44 bg-slate-950 overflow-hidden relative"><img src="${safe(file.thumbnail_url||file.media_url)}" alt="${safe(file.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover" /></div>`;
    if(isVideo)thumbnailHtml=`<div class="w-full h-44 bg-slate-950 relative overflow-hidden flex items-center justify-center"><div class="absolute inset-0 bg-slate-950 flex items-center justify-center"><i class="fa-solid fa-film text-slate-800 text-3xl"></i></div>${thumb?`<img src="${safe(thumb)}" alt="${safe(file.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover relative z-10 group-hover:scale-105 transition duration-500" onerror="this.style.display='none'" />`:''}<div class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"><div class="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl"><i class="fa-solid fa-play ml-1"></i></div></div></div>`;
    return `<article onclick="openWatchView('${safe(file.id)}')" class="file-card group bg-[#0f1422] border border-slate-800/80 hover:border-rose-500/60 rounded-2xl overflow-hidden transition duration-300 shadow-xl cursor-pointer flex flex-col justify-between"><div>${thumbnailHtml}<div class="p-3.5 space-y-2"><div class="flex items-center justify-between text-[10px] font-mono"><span class="px-2 py-0.5 rounded font-bold bg-slate-900 text-rose-400 uppercase border border-slate-800">${safe(file.type)}</span><span class="text-slate-400 font-bold">${safe(file.size_formatted||'')}</span></div><h4 class="text-xs font-bold text-slate-100 line-clamp-2 group-hover:text-rose-400 transition leading-snug">${safe(file.title)}</h4><p class="text-[10px] text-slate-400 font-mono truncate"><i class="fa-solid fa-folder text-rose-500/70 mr-1"></i>${safe(file.vault?.name||'Umum')}</p></div></div><div class="p-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-900/90 mt-1 bg-slate-950/40"><span>👁 ${file.views??file.view_count??0}</span><button onclick="event.stopPropagation();toggleLike('${safe(file.id)}')" class="text-amber-400">♥ ${file.likes??file.like_count??0}</button></div></article>`;
  }).join('');
  if(filtered.length>visibleItemCount)grid.innerHTML+=`<div class="col-span-full text-center py-5"><button class="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold" onclick="visibleItemCount+=12;renderGrid(allFiles)">Muat lebih banyak</button></div>`;
}

function handleSearchInput(v){currentSearch=v;visibleItemCount=12;renderGrid(allFiles)}
function openWatchView(fileId){
  const file=allFiles.find(f=>String(f.id)===String(fileId)); if(!file)return;
  currentPlayingFile=file; window.location.hash=`watch/${encodeURIComponent(fileId)}`; renderWatch(file);
}
function renderWatch(file){
  const home=document.getElementById('home-view'),watch=document.getElementById('watch-view');
  if(home)home.classList.add('hidden'); if(watch)watch.classList.remove('hidden');
  const title=document.getElementById('watch-title');if(title)title.textContent=file.title||'Video';
  const player=document.getElementById('watch-video-player');if(player){player.src=file.media_url||'';player.load();}
  const views=document.getElementById('watch-views-count');if(views)views.textContent=file.views??file.view_count??0;
  const likes=document.getElementById('watch-likes-count');if(likes)likes.textContent=file.likes??file.like_count??0;
  const dl=document.getElementById('watch-download-link');if(dl)dl.href=file.download_url||file.media_url||'#';
  const thumb=document.getElementById('watch-thumbnail'); if(thumb){const u=getPersistentThumbnailUrl(file);thumb.src=u||file.thumbnail_url||'';}
  const related=document.getElementById('related-grid');if(related)related.innerHTML=allFiles.filter(f=>String(f.id)!==String(file.id)).slice(0,8).map(f=>`<article onclick="openWatchView('${safe(f.id)}')" class="file-card cursor-pointer bg-[#0f1422] border border-slate-800 rounded-xl overflow-hidden"><div class="aspect-video bg-black">${getPersistentThumbnailUrl(f)?`<img src="${safe(getPersistentThumbnailUrl(f))}" loading="lazy" decoding="async" class="w-full h-full object-cover" />`:''}</div><div class="p-2 text-xs font-bold text-slate-200 truncate">${safe(f.title)}</div></article>`).join('');
}
function closeWatchView(){const p=document.getElementById('watch-video-player');if(p){p.pause();p.removeAttribute('src');p.load()}const w=document.getElementById('watch-view'),h=document.getElementById('home-view');if(w)w.classList.add('hidden');if(h)h.classList.remove('hidden');history.pushState({},'',location.pathname);}
async function toggleLike(id){saveLikedFile(id);const f=allFiles.find(x=>String(x.id)===String(id));if(f){f.likes=(f.likes??f.like_count??0)+1;renderGrid(allFiles)}try{await fetch(`${API_BASE_URL}/api/v1/public/media/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action:'like'})})}catch{}}
function shareCurrent(){if(!currentPlayingFile)return;navigator.share?navigator.share({title:currentPlayingFile.title,url:location.href}):navigator.clipboard?.writeText(location.href)}
function copyCurrentLink(){navigator.clipboard?.writeText(location.href)}

window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#watch\/(.+)$/);if(m){const f=allFiles.find(x=>String(x.id)===decodeURIComponent(m[1]));if(f)renderWatch(f)}else closeWatchView()});
document.addEventListener('DOMContentLoaded',()=>{
  const search=document.getElementById('search-input'); if(search)search.addEventListener('input',e=>handleSearchInput(e.target.value));
  loadSiteConfig(); fetchPublicMedia();
  const refresh=document.getElementById('refresh-media'); if(refresh)refresh.addEventListener('click',fetchPublicMedia);
  const back=document.getElementById('watch-back'); if(back)back.addEventListener('click',closeWatchView);
  const like=document.getElementById('watch-like-button'); if(like)like.addEventListener('click',()=>currentPlayingFile&&toggleLike(currentPlayingFile.id));
  const share=document.getElementById('watch-share-button'); if(share)share.addEventListener('click',shareCurrent);
  const copy=document.getElementById('watch-copy-link'); if(copy)copy.addEventListener('click',copyCurrentLink);
  if(location.hash){const m=location.hash.match(/^#watch\/(.+)$/);if(m)setTimeout(()=>{const f=allFiles.find(x=>String(x.id)===decodeURIComponent(m[1]));if(f)renderWatch(f)},500)}
});
