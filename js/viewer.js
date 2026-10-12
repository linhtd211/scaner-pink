/* ============ TRÌNH XEM TÀI LIỆU + TÌM KIẾM OCR ============ */
function viewer(start=0){
 const o=$('#ov2'),P=S.cur.pages,urls=P.map(p=>URL.createObjectURL(p.out)),hasO=P.some(p=>p.ocr);let z=1;
 o.hidden=false;o.className='ov';
 o.innerHTML=`<div style="position:sticky;top:0;z-index:3;background:var(--bg);padding-bottom:6px">
  <div style="display:flex;justify-content:space-between;align-items:center"><button class="i" aria-label="Đóng" id="vx">${ic('x')}</button><b id="vn" style="background:var(--card);padding:4px 12px;border-radius:12px">1 / ${urls.length}</b><span><button id="vm" aria-label="Thu nhỏ">−</button> <button id="vp" aria-label="Phóng to">+</button></span></div>
  ${hasO?`<input class="s" id="vs" placeholder="Tìm trong văn bản OCR..." value="${esc(S.q)}" style="margin-top:6px"><div id="vr" class="ch"></div>`:'<p class="m">Chạy OCR để tìm kiếm trong tài liệu.</p>'}</div>
  <div id="vw" style="overflow-x:auto;touch-action:manipulation">${urls.map((u,i)=>`<div class="rel" data-i="${i}" style="position:relative;width:100%;margin:10px auto;scroll-margin-top:120px"><img src="${u}" alt="Trang ${i+1}" style="display:block;width:100%;border:1px solid var(--bd);background:#fff"><div class="hl"></div></div>`).join('')}</div>`;
 const rels=[...o.querySelectorAll('.rel')],go=i=>rels[i]&&rels[i].scrollIntoView({behavior:'smooth',block:'start'});
 // Đánh dấu trang đang xem: "12 / 47"
 const ob=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)$('#vn').textContent=`${+e.target.dataset.i+1} / ${urls.length}`}),{threshold:.5});rels.forEach(r=>ob.observe(r));
 const zz=d=>{z=Math.min(4,Math.max(1,z+d));rels.forEach(r=>r.style.width=z*100+'%')};$('#vp').onclick=()=>zz(.5);$('#vm').onclick=()=>zz(-.5);
 // Tìm kiếm (không phân biệt dấu): tô sáng từ khớp, hiện danh sách trang, nhảy tới trang đầu tiên
 if(hasO){
  const find=()=>{const q=norm($('#vs').value.trim()),toks=q.split(' ').filter(Boolean),hit=[];
   rels.forEach((r,i)=>{const hl=r.querySelector('.hl'),oc=P[i].ocr;hl.innerHTML='';if(!q||!oc||!norm(oc.text).includes(q))return;hit.push(i);
    hl.innerHTML=oc.words.filter(w=>toks.some(t=>norm(w.t).includes(t))).map(w=>`<div style="position:absolute;left:${w.x0/oc.w*100}%;top:${w.y0/oc.h*100}%;width:${(w.x1-w.x0)/oc.w*100}%;height:${(w.y1-w.y0)/oc.h*100}%;background:rgba(255,200,0,.4)"></div>`).join('')});
   $('#vr').innerHTML=!q?'':hit.length?hit.map(i=>`<button class="go" data-i="${i}">Trang ${i+1}</button>`).join(''):'<span class="m">Không tìm thấy</span>';
   if(hit.length)go(hit[0])};
  let t;$('#vs').oninput=()=>{clearTimeout(t);t=setTimeout(find,300)};
  $('#vr').onclick=e=>{const b=e.target.closest('.go');if(b)go(+b.dataset.i)};
  if(S.q)find();
 }
 // Chạm đúp để phóng to / thu nhỏ (chữ nhỏ cần phóng to mới đọc được trên điện thoại)
 let lt=0;$('#vw').addEventListener('pointerup',e=>{const n=Date.now();if(n-lt<300){z=z>1?1:2.5;rels.forEach(r=>r.style.width=z*100+'%')}lt=n});
 if(start)requestAnimationFrame(()=>rels[start]&&rels[start].scrollIntoView({block:'start'}));
 $('#vx').onclick=()=>{ob.disconnect();urls.forEach(URL.revokeObjectURL);o.hidden=true;o.innerHTML=''};
}
