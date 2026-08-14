// XVIDSHUB public frontend — template-compatible build
// REST API is intentionally fixed to the existing backend.
const API_BASE_URL='https://teledriveggjsj.onrender.com';
const THUMBNAIL_BASE_URL=`${API_BASE_URL}/api/v1/public/thumbnail`;
let currentCategory='ALL',currentSearch='',allFiles=[],currentPlayingFile=null,siteConfig={};
const likedKey='xvidshub_liked_files';
const $=id=>document.getElementById(id);
const idOf=f=>f?.id??f?._id??f?.file_id??f?.fileId;
const thumbOf=f=>f?.thumbnail_url||(f?.type==='video'&&idOf(f)?`${THUMBNAIL_BASE_URL}/${encodeURIComponent(idOf(f))}`:f?.media_url||'');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function liked(){try{return JSON.parse(localStorage.getItem(likedKey)||'[]')}catch{return[]}}
function setLiked(a){localStorage.setItem(likedKey,JSON.stringify(a))}

async function loadSiteConfig(){
  try{const r=await fetch(`${API_BASE_URL}/api/v1/public/config`,{cache:'no-store'});const d=await r.json();if(d.success)siteConfig=d}catch{}
  renderCategories();
  const badge=$('monetization-badge');if(badge&&siteConfig.monetization?.enabled)badge.classList.remove('hidden');
}
function renderCategories(){
  const el=$('category-chips');if(!el)return;
  const cats=Array.isArray(siteConfig.categories)?siteConfig.categories:[];
  const items=[{id:'ALL',name:'Semua'}].concat(cats);
  el.innerHTML=items.map(c=>`<button type="button" onclick="setCategory(${JSON.stringify(c.id||c.name)})" class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${currentCategory===(c.id||c.name)?'bg-rose-600 text-white shadow-lg shadow-rose-600/20':'bg-slate-900 text-slate-400 border border-slate-800 hover:border-rose-500/50'}">${esc(c.name||c.id)}</button>`).join('');
}
function setCategory(c){currentCategory=c;fetchPublicMedia()}

async function fetchPublicMedia(){
  const grid=$('file-grid');if(!grid)return;
  grid.innerHTML='<div class="col-span-full py-16 text-center text-slate-400 font-mono text-xs"><i class="fa-solid fa-circle-notch fa-spin text-rose-500 text-3xl mb-3"></i><p class="font-bold text-slate-200">Memuat koleksi video menarik XVIDSHUB...</p></div>';
  try{
    const q=currentCategory==='ALL'?'':`?category=${encodeURIComponent(currentCategory)}&vault_id=${encodeURIComponent(currentCategory)}`;
    const r=await fetch(`${API_BASE_URL}/api/v1/public/media${q}`,{cache:'no-store'});const d=await r.json();
    if(!d.success||!Array.isArray(d.media))throw Error('invalid media response');
    allFiles=d.media;
    const badge=$('video-count-badge');if(badge)badge.textContent=`${allFiles.length} Video`;
    renderGrid();
  }catch(e){grid.innerHTML='<div class="col-span-full py-16 text-center text-slate-400"><i class="fa-solid fa-triangle-exclamation text-rose-500 text-3xl mb-3"></i><p class="font-bold">Media tidak ditemukan</p><p class="text-xs mt-1">REST API tidak mengembalikan data media.</p></div>'}
}
function handleSearch(){currentSearch=($('search-input')?.value||'').trim().toLowerCase();renderGrid()}
function renderGrid(){
  const grid=$('file-grid');if(!grid)return;
  let list=allFiles.filter(f=>!currentSearch||`${f.title||''} ${f.vault?.name||''} ${f.category||''} ${f.topic||''}`.toLowerCase().includes(currentSearch));
  if(!list.length){grid.innerHTML='<div class="col-span-full py-16 text-center text-slate-400"><i class="fa-regular fa-folder-open text-4xl mb-3"></i><p class="font-bold">Tidak ada media yang sesuai.</p></div>';return}
  grid.innerHTML=list.map(card).join('');
}
function card(f){
  const id=idOf(f),t=esc(f.title||f.name||'Untitled'),u=thumbOf(f),type=esc(f.type||'video');
  const img=u?`<img src="${esc(u)}" alt="${t}" loading="lazy" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.style.display='none'">`:'<div class="absolute inset-0 flex items-center justify-center text-slate-700"><i class="fa-solid fa-film text-4xl"></i></div>';
  return `<article class="file-card group bg-[#0f1422] border border-slate-800/80 hover:border-rose-500/60 rounded-2xl overflow-hidden transition duration-300 shadow-xl cursor-pointer flex flex-col justify-between" onclick="openWatchView(${JSON.stringify(id)})"><div><div class="w-full h-44 bg-slate-950 relative overflow-hidden">${img}<div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div><div class="absolute inset-0 flex items-center justify-center pointer-events-none"><span class="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl"><i class="fa-solid fa-play ml-1"></i></span></div><span class="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-rose-300">${type}</span></div><div class="p-3.5 space-y-2"><h4 class="text-xs font-bold text-slate-100 line-clamp-2 group-hover:text-rose-400">${t}</h4><p class="text-[10px] text-slate-400 font-mono truncate"><i class="fa-solid fa-folder text-rose-500/70 mr-1"></i>${esc(f.vault?.name||f.category||f.topic||'Umum')}</p></div></div><div class="p-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-900/90"><span>👁 ${f.views??f.view_count??0}</span><span class="text-rose-400">♥ ${f.likes??f.like_count??0}</span></div></article>`;
}

function openWatchView(fileId){
  const f=allFiles.find(x=>String(idOf(x))===String(fileId));if(!f)return;
  currentPlayingFile=f;
  $('tab-home')?.classList.add('hidden');$('tab-watch')?.classList.remove('hidden');
  const title=$('watch-title');if(title)title.textContent=f.title||f.name||'Video';
  const cat=$('watch-category-badge');if(cat)cat.textContent=f.vault?.name||f.category||f.topic||'XVIDSHUB';
  const size=$('watch-size-badge');if(size)size.textContent=f.size_formatted||'';
  const views=$('watch-views-count');if(views)views.textContent=f.views??f.view_count??0;
  const likes=$('watch-likes-count');if(likes)likes.textContent=f.likes??f.like_count??0;
  const date=$('watch-date');if(date)date.textContent=f.created_at?new Date(f.created_at).toLocaleDateString('id-ID'):'Hari ini';
  const dl=$('watch-download-link');if(dl)dl.href=f.download_url||f.media_url||'#';
  const player=$('watch-video-player');if(player){player.pause();player.src=f.media_url||'';player.load();player.onwaiting=()=>showLoader(true);player.onplaying=()=>showLoader(false);player.oncanplay=()=>showLoader(false)}
  const overlay=$('watch-player-ad-overlay');if(overlay)overlay.classList.remove('hidden');
  const related=$('related-grid');if(related)related.innerHTML=allFiles.filter(x=>String(idOf(x))!==String(idOf(f))).slice(0,8).map(card).join('');
  history.pushState({},'',`#watch/${encodeURIComponent(fileId)}`);window.scrollTo({top:0,behavior:'smooth'});
  // Keep the existing API's like/view contract; do not alter response/config.
  fetch(`${API_BASE_URL}/api/v1/public/media/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:idOf(f),action:'view'})}).catch(()=>{});
}
function showLoader(on){const l=$('watch-video-loader');if(l)l.classList.toggle('hidden',!on)}
function showHomeView(){const p=$('watch-video-player');if(p){p.pause();p.removeAttribute('src');p.load()}$('tab-watch')?.classList.add('hidden');$('tab-home')?.classList.remove('hidden');history.pushState({},'',location.pathname);window.scrollTo({top:0,behavior:'smooth'})}
function handleVideoOverlayClick(){const p=$('watch-video-player');const o=$('watch-player-ad-overlay');if(!p)return;if(o)o.classList.add('hidden');p.play().catch(()=>{})}
async function likeCurrentWatchMedia(){const f=currentPlayingFile;if(!f)return;const id=idOf(f),a=liked();if(a.includes(id))return;a.push(id);setLiked(a);f.likes=(f.likes??f.like_count??0)+1;const c=$('watch-likes-count');if(c)c.textContent=f.likes;const tx=$('watch-like-text');if(tx)tx.textContent='Disukai';try{await fetch(`${API_BASE_URL}/api/v1/public/media/like`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,action:'like'})})}catch{}}
function copyCurrentStreamUrl(){if(!currentPlayingFile)return;navigator.clipboard?.writeText(location.href).then(()=>{const b=document.getElementById('watch-like-text');if(b){const old=b.textContent;b.textContent='Link disalin';setTimeout(()=>b.textContent=old,1200)}})}

window.addEventListener('popstate',()=>{if(location.hash.startsWith('#watch/')){const id=decodeURIComponent(location.hash.slice(7));openWatchView(id)}else showHomeView()});
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#watch/')){const id=decodeURIComponent(location.hash.slice(7));openWatchView(id)}else showHomeView()});
document.addEventListener('DOMContentLoaded',()=>{loadSiteConfig();fetchPublicMedia();const r=$('refresh-media');if(r)r.addEventListener('click',fetchPublicMedia);if(location.hash.startsWith('#watch/'))setTimeout(()=>openWatchView(decodeURIComponent(location.hash.slice(7))),700)});
