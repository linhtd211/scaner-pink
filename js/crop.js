/* ============ ĐIỀU CHỈNH VÙNG QUÉT (kéo 4 góc) ============ */
async function cropPage(i){sheet();const p=S.cur.pages[i],o=$('#ov2');o.hidden=false;o.className='ov';const url=URL.createObjectURL(p.orig),q=p.corners.map(x=>[...x]);
 o.innerHTML=`<h2>Điều chỉnh vùng quét</h2><div class="cr" id="cr"><img id="ci" src="${url}" alt="Ảnh gốc"><svg viewBox="0 0 1 1" preserveAspectRatio="none"><polygon id="cp" fill="rgba(76,155,240,.2)" stroke="#4c9bf0" stroke-width=".004"/>${[0,1,2,3].map(n=>`<circle data-n="${n}" r=".035" fill="#4c9bf0" stroke="#fff" stroke-width=".006" style="cursor:grab"/>`).join('')}</svg></div>
 <div class="bar"><button id="ca">Tự động</button><button id="cf">Toàn ảnh</button><button id="cx">Hủy</button><button class="p" id="co">Xác nhận</button></div>`;
 const draw=()=>{$('#cp').setAttribute('points',q.map(a=>a.join(',')).join(' '));o.querySelectorAll('circle').forEach(c=>{c.setAttribute('cx',q[c.dataset.n][0]);c.setAttribute('cy',q[c.dataset.n][1])})};draw();
 let act=null;const cr=$('#cr');cr.onpointerdown=e=>{if(e.target.dataset.n!=null){act=+e.target.dataset.n;cr.setPointerCapture(e.pointerId)}};cr.onpointermove=e=>{if(act==null)return;const r=cr.getBoundingClientRect();q[act]=[Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))];draw()};cr.onpointerup=()=>act=null;
 const close=()=>{URL.revokeObjectURL(url);o.hidden=true;o.innerHTML=''};
 $('#ca').onclick=async()=>{q.splice(0,4,...Eng.detect(await Eng.load(p.orig)).q);draw()};$('#cf').onclick=()=>{q.splice(0,4,...Eng.full());draw()};$('#cx').onclick=close;
 $('#co').onclick=async()=>{p.corners=q;close();toast('Đang xử lý...');await upd(i)}}
