/* ============ XEM LẠI TÀI LIỆU / QUẢN LÝ TRANG ============ */
function review(){const d=S.cur,o=$('#ov');o.hidden=false;o.className='ov';const tot=d.pages.reduce((s,p)=>s+p.out.size,0);
 o.innerHTML=`<div style="display:flex;gap:8px;align-items:center"><button class="i" aria-label="Đóng" onclick="closeReview()">${ic('x')}</button><input class="s" id="dnm" value="${esc(d.name)}" aria-label="Tên tài liệu"></div><p class="m">${d.pages.length} trang · khoảng ${fmtSize(tot)} · chạm vào trang để chỉnh sửa</p>
 <div class="g">${d.pages.map((p,i)=>`<div class="pg" onclick="pageMenu(${i})"><span class="n">${i+1}</span><img src="${p.thumb}" alt="Trang ${i+1}">${p.warn.length?`<span class="w">Trang ${i+1}: ${p.warn.join(', ')}</span>`:''}</div>`).join('')}</div>
 <div class="bar"><button onclick="addMore()">Thêm trang</button><button onclick="pickImages(review)">Nhập ảnh</button><button onclick="viewer()">Xem</button><button onclick="ocrDoc()">OCR</button><button onclick="textView()">Văn bản</button><button onclick="exportSheet()">Xuất PDF</button><button class="p" onclick="doSave()">Lưu</button></div>`;
 $('#dnm').onchange=e=>d.name=e.target.value.trim()||d.name}
function closeReview(){$('#ov').hidden=true;S.cur=null;render()}
const addMore=()=>openCam();
async function doSave(){if(!S.cur.pages.length)return toast('Chưa có trang nào');await saveDoc();closeReview()}
const FL=[['auto','Tự động'],['orig','Gốc'],['text','Văn bản'],['bw','Đen trắng'],['color','Màu'],['red','Dấu đỏ'],['photo','Ảnh']];
function pageMenu(i){const p=S.cur.pages[i];sheet(`<b>Trang ${i+1}</b><div class="ch">${FL.map(([k,l])=>`<button class="${p.filter==k?'on':''}" onclick="setF(${i},'${k}')">${l}</button>`).join('')}</div>
 <label class="r">Độ sáng<input type="range" min="-60" max="60" value="${p.adj.b}" oninput="p_(${i},'b',this.value)"></label><label class="r">Tương phản<input type="range" min="-50" max="80" value="${p.adj.c}" oninput="p_(${i},'c',this.value)"></label><label class="r">Nhiệt độ màu<input type="range" min="-60" max="60" value="${p.adj.t}" oninput="p_(${i},'t',this.value)"></label>
 <div class="ch"><button onclick="cropPage(${i})">Cắt lại</button><button onclick="rot(${i},3)">Xoay trái</button><button onclick="rot(${i},1)">Xoay phải</button><button onclick="mv(${i},-1)">Lùi lại</button><button onclick="mv(${i},1)">Tiến lên</button><button onclick="dupP(${i})">Nhân bản</button><button onclick="ocrPage(${i})">OCR trang này</button><button onclick="textView(${i})">Văn bản trang</button><button onclick="resetP(${i})">Khôi phục</button><button onclick="delP(${i})">Xóa</button></div>`)}
async function upd(i){await renderPage(S.cur.pages[i]);review()}
let tmr;function p_(i,k,v){S.cur.pages[i].adj[k]=+v;clearTimeout(tmr);tmr=setTimeout(async()=>{await renderPage(S.cur.pages[i]);review();pageMenu(i)},350)}
async function setF(i,k){S.cur.pages[i].filter=k;await upd(i);pageMenu(i)}
async function rot(i,n){const p=S.cur.pages[i];p.rot=(p.rot+n)%4;await upd(i);toast('Đã xoay trang');sheet()}
function mv(i,s){const a=S.cur.pages,j=i+s;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];sheet();review();toast('Đã đổi thứ tự')}
function dupP(i){const a=S.cur.pages;a.splice(i+1,0,{...a[i],id:uid(),adj:{...a[i].adj}});sheet();review();toast('Đã nhân bản trang')}
async function resetP(i){const p=S.cur.pages[i];Object.assign(p,{filter:'auto',adj:{b:0,c:0,t:0},rot:0});p.corners=Eng.detect(await Eng.load(p.orig)).q;await upd(i);sheet();toast('Đã khôi phục ảnh gốc')}
function delP(i){const a=S.cur.pages,p=a.splice(i,1)[0];sheet();review();toast(`Đã xóa trang ${i+1}`,()=>{a.splice(i,0,p);review()})}
