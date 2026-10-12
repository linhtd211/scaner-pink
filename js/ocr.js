/* ============ OCR ENGINE ============ */
// Dùng Tesseract.js chạy ngay trên thiết bị (Việt + Anh). Muốn đổi engine khác (cloud, Gemini...)
// chỉ cần thay 3 hàm: recognizePage / recognizeDocument / (PDF tìm kiếm nằm ở pdf.js).
const TESS_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const OCR={
 worker:null,
 // Tải thư viện Tesseract khi cần (không tải nếu người dùng không dùng OCR)
 loadLib(){return window.Tesseract?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src=TESS_URL;s.onload=ok;s.onerror=()=>no(new Error('Không tải được thư viện OCR'));document.head.appendChild(s)})},
 async init(){if(this.worker)return this.worker;await this.loadLib();this.worker=await Tesseract.createWorker('vie+eng',1);return this.worker},
 // Chuẩn hoá danh sách từ + tọa độ, bất kể phiên bản trả về dạng words hay blocks
 words(data){let w=data.words;if(!w){w=[];(data.blocks||[]).forEach(b=>(b.paragraphs||[]).forEach(p=>(p.lines||[]).forEach(l=>(l.words||[]).forEach(x=>w.push(x)))))}
  return w.filter(x=>x.text&&x.text.trim()).map(x=>({t:x.text.trim().normalize('NFC'),x0:x.bbox.x0,y0:x.bbox.y0,x1:x.bbox.x1,y1:x.bbox.y1}))},
 async recognizePage(p){const w=await this.init(),{data}=await w.recognize(p.out);
  p.ocr={text:(data.text||'').normalize('NFC').trim(),words:this.words(data),w:p.w,h:p.h,conf:Math.round(data.confidence||0)}},
 async recognizeDocument(d,onPage){for(let i=0;i<d.pages.length;i++){onPage(i+1,d.pages.length);if(!d.pages[i].ocr)await this.recognizePage(d.pages[i])}}
};
const OCR_FAIL='Không thể nhận dạng. Lần đầu cần kết nối mạng để tải mô hình tiếng Việt, hãy kiểm tra mạng rồi thử lại.';
// Nhận dạng cả tài liệu, hiển thị tiến trình, không khóa giao diện (Tesseract chạy trong worker riêng)
async function runOCR(d){
 if(!d.pages.some(p=>!p.ocr))return true;
 try{await OCR.recognizeDocument(d,(i,n)=>toast(`Đang nhận dạng trang ${i}/${n}...`,null,true));toast('Đã nhận dạng xong');return true}
 catch(e){toast(OCR_FAIL);return false}
}
async function ocrDoc(){if(!S.cur.pages.length)return;if(await runOCR(S.cur))review()}
async function ocrPage(i){sheet();const p=S.cur.pages[i];try{toast(`Đang nhận dạng trang ${i+1}...`,null,true);await OCR.recognizePage(p);toast('Đã nhận dạng trang '+(i+1));review()}catch(e){toast(OCR_FAIL)}}
// Nhận dạng tài liệu đã lưu (từ tab OCR)
async function ocrSaved(id){const d=S.docs.find(x=>x.id==id);if(!await runOCR(d))return;d.ocrText=d.pages.map(p=>p.ocr?p.ocr.text:'').join('\n');await DB.put(d);await load();render()}
// Xem văn bản OCR: sao chép / xuất TXT. i = số trang (bỏ trống = cả tài liệu)
function textView(i){
 const P=S.cur.pages,idx=i==null?P.map((_,k)=>k):[i];
 const t=idx.map(k=>`--- Trang ${k+1} ---\n${P[k].ocr?P[k].ocr.text||'(không có chữ)':'(chưa nhận dạng, bấm OCR trước)'}`).join('\n\n');
 sheet();const o=$('#ov2');o.hidden=false;o.className='ov';
 o.innerHTML=`<div style="display:flex;gap:8px;align-items:center"><button class="i" aria-label="Đóng" id="tx">${ic('x')}</button><b>Văn bản OCR</b></div><p class="m">Hãy kiểm tra lại, đặc biệt với số liệu và dấu tiếng Việt.</p><textarea id="tt" readonly style="width:100%;height:60vh;font-size:16px;padding:10px;border:1px solid var(--bd);border-radius:12px;background:var(--card);color:var(--tx)"></textarea>
 <div class="bar"><button id="tc">Sao chép</button><button class="p" id="te">Xuất TXT</button></div>`;
 $('#tt').value=t;$('#tx').onclick=()=>{o.hidden=true;o.innerHTML=''};
 $('#tc').onclick=async()=>{try{await navigator.clipboard.writeText(t)}catch(e){$('#tt').select();document.execCommand('copy')}toast('Đã sao chép')};
 $('#te').onclick=()=>deliver(new Blob([t],{type:'text/plain'}),S.cur.name.replace(/[\\/:*?"<>|]/g,'-')+'.txt');
}
