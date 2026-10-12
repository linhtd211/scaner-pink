/* ============ MÀN HÌNH CHÍNH ============ */
function render(){const a=$('#app');let h='';
 if(S.tab=='home'){const q=S.q.toLowerCase(),nq=norm(S.q),L=S.docs.filter(d=>!q||norm(d.name).includes(nq)||fmtDate(d.updated).includes(q)||norm(d.ocrText).includes(nq));
  h=`<h1>ScanPro</h1><input class="s" id="q" placeholder="Tìm kiếm tài liệu..." value="${esc(S.q)}" aria-label="Tìm kiếm">
  <div class="q"><button onclick="startScan()">${ic('scan')} Quét tài liệu</button><button onclick="importImgs()">${ic('img')} Nhập ảnh</button><button onclick="soon()">${ic('doc')} Nhập PDF</button><button onclick="S.tab='ocr';render()">${ic('ocr')} OCR</button></div>
  <h2 style="display:flex;justify-content:space-between;align-items:center">Tài liệu gần đây<button class="i" aria-label="Đổi kiểu hiển thị" onclick="S.view=S.view=='list'?'grid':'list';render()">${ic(S.view=='list'?'grid':'list')}</button></h2>`;
  if(!S.docs.length)h+=`<div class="empty"><h2>Chưa có tài liệu</h2><p>Quét tài liệu đầu tiên của bạn</p><button class="p" onclick="startScan()">Quét ngay</button></div>`;
  else h+=`<div class="${S.view=='grid'?'g':''}">`+L.map(d=>`<div class="row" ><img src="${d.thumb||''}" alt="" onclick="openDoc('${d.id}')"><div class="t" onclick="openDoc('${d.id}')"><b>${esc(d.name)}</b><span class="m">${d.pages.length} trang · ${fmtSize(d.size)}<br>${fmtDate(d.updated)}</span></div><button class="i" aria-label="Thêm thao tác" onclick="menu('${d.id}')">${ic('more')}</button></div>`).join('')+'</div>';
  if(!DB.persistent())h+='<p class="m">Lưu ý: trình duyệt hiện tại không cho lưu lâu dài; tài liệu sẽ mất khi đóng trang.</p>'}
 else if(S.tab=='set')h=`<h1>Cài đặt</h1><div class="row"><div class="t"><b>Giao diện</b></div><button onclick="theme()">Sáng / Tối</button></div><h2>Quyền riêng tư</h2><p>Tài liệu được xử lý trên thiết bị khi có thể. ScanPro không gửi tài liệu của bạn lên máy chủ. OCR chạy ngay trên thiết bị; lần đầu dùng cần tải mô hình tiếng Việt từ mạng (chỉ tải mô hình, không gửi tài liệu).</p>${deferredInstall?'<button class="p" onclick="installApp()">Cài ScanPro lên màn hình chính</button>':''}`;
 else if(S.tab=='ocr')h=ocrTab();
 else h=`<h1>Công cụ PDF</h1><div class="empty"><h2>Tính năng đang được hoàn thiện</h2><p>Phase 1 tập trung vào quét, xử lý ảnh, quản lý trang và xuất PDF.</p></div>`;
 a.innerHTML=h+`<nav class="nav" aria-label="Điều hướng">${[['home','Tài liệu','doc'],['tool','Công cụ','tool'],['sc','Scan','scan'],['ocr','OCR','ocr'],['set','Cài đặt','set']].map(([k,l,i])=>k=='sc'?`<button class="sc" aria-label="Scan" onclick="startScan()">${ic('scan',28)}</button>`:`<button class="${S.tab==k?'on':''}" onclick="S.tab='${k}';render()">${ic(i)}${l}</button>`).join('')}</nav>`;
 const q=$('#q');if(q)q.oninput=e=>{S.q=e.target.value;const p=e.target.selectionStart;render();const n=$('#q');n.focus();n.setSelectionRange(p,p)}}
const soon=()=>toast('Tính năng đang được hoàn thiện');
function theme(){const r=document.documentElement,d=r.dataset.theme=='dark'||(!r.dataset.theme&&matchMedia('(prefers-color-scheme:dark)').matches);r.dataset.theme=d?'light':'dark'}
function menu(id){const d=S.docs.find(x=>x.id==id);sheet(`<b>${esc(d.name)}</b><div class="ch" style="flex-direction:column"><button onclick="sheet();openDoc('${id}')">Mở</button><button onclick="renameDoc('${id}')">Đổi tên</button><button onclick="sheet();exportDoc('${id}')">Xuất PDF</button><button onclick="dupDoc('${id}')">Nhân bản</button><button onclick="delDoc('${id}')">Xóa</button></div>`)}
function renameDoc(id){const d=S.docs.find(x=>x.id==id);sheet(`<input class="s" id="rn" value="${esc(d.name)}" aria-label="Tên tài liệu"><div class="ch"><button class="p" id="rok">Lưu</button></div>`);$('#rok').onclick=async()=>{d.name=$('#rn').value.trim()||d.name;await DB.put(d);sheet();load();toast('Đã đổi tên')}}
async function dupDoc(id){const d={...S.docs.find(x=>x.id==id),id:uid(),updated:Date.now()};d.name+=' (bản sao)';await DB.put(d);sheet();load();toast('Đã nhân bản')}
async function delDoc(id){const d=S.docs.find(x=>x.id==id);await DB.del(id);sheet();load();toast('Đã xóa tài liệu',async()=>{await DB.put(d);load()})}
async function exportDoc(id,d){d=d||S.docs.find(x=>x.id==id);toast('Đang tạo PDF...');deliver(await makePDF(d.pages,{ocr:d.pages.some(p=>p.ocr)}),d.name.replace(/[\\/:*?"<>|]/g,'-')+'.pdf')}
function openDoc(id){S.cur=S.docs.find(x=>x.id==id);review()}
function importImgs(){newDoc();pickImages(review)}

// Tab OCR: danh sách tài liệu đã lưu và trạng thái nhận dạng
function ocrTab(){return `<h1>OCR tiếng Việt</h1><p class="m">Nhận dạng chữ Việt + Anh ngay trên thiết bị. Hãy kiểm tra lại kết quả vì độ chính xác phụ thuộc chất lượng ảnh.</p>`+(S.docs.length?S.docs.map(d=>`<div class="row"><img src="${d.thumb||''}" alt=""><div class="t"><b>${esc(d.name)}</b><span class="m">${d.pages.length} trang · ${d.pages.every(p=>p.ocr)?'Đã nhận dạng':d.pages.some(p=>p.ocr)?'Nhận dạng một phần':'Chưa nhận dạng'}</span></div><button class="p" onclick="ocrSaved('${d.id}')">Nhận dạng</button></div>`).join(''):'<div class="empty"><h2>Chưa có tài liệu</h2><p>Hãy quét hoặc nhập ảnh trước.</p></div>')}
