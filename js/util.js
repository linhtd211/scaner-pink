/* ============ TIỆN ÍCH & ICON ============ */
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const IC={scan:'<path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3M4 12h16"/>',doc:'<path d="M7 3h7l5 5v13H7zM14 3v5h5"/>',tool:'<path d="M14 6l4 4-9 9H5v-4z"/>',ocr:'<path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3M8 12h8"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',more:'<circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>',img:'<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 16l5-5 4 4 3-3 4 4"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',grid:'<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',list:'<path d="M5 7h14M5 12h14M5 17h14"/>'};
const ic=(n,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
function toast(m,undo,keep){const t=$('#toast');t.innerHTML=`<div>${esc(m)}${undo?'<button id="un">HOÀN TÁC</button>':''}</div>`;if(undo)$('#un').onclick=()=>{undo();t.innerHTML=''};clearTimeout(toast.h);if(!keep)toast.h=setTimeout(()=>t.innerHTML='',5000)}
function sheet(h){const s=$('#sh');if(!h){s.style.display='none';return}s.innerHTML='<div>'+h+'</div>';s.style.display='flex';s.onclick=e=>{if(e.target===s)sheet()}}
const toBlob=(c,q=.88)=>new Promise(r=>c.toBlob(r,'image/jpeg',q));
const fmtSize=b=>b>1e6?(b/1e6).toFixed(1)+' MB':Math.round(b/1e3)+' KB';
const fmtDate=t=>new Date(t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
// Bỏ dấu tiếng Việt + chữ thường, để tìm "bao cao" vẫn ra "Báo cáo"
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d');
