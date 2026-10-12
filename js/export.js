/* ============ XUẤT PDF ============ */
// Bảng chọn trước khi xuất: có/không PDF tìm kiếm được
function exportSheet(){
 const P=S.cur.pages;if(!P.length)return;const has=P.some(p=>p.ocr),tot=P.reduce((s,p)=>s+p.out.size,0);
 sheet(`<b>Xuất PDF</b><p class="m">${P.length} trang · khoảng ${fmtSize(tot)}</p>
 <label style="display:flex;gap:10px;align-items:center;min-height:44px"><input type="checkbox" id="xo" ${has?'checked':''} style="width:22px;height:22px"> PDF có thể tìm kiếm (OCR)</label>
 <p class="m">Nếu chưa nhận dạng, ScanPro sẽ chạy OCR trước khi xuất. Ảnh scan được giữ nguyên.</p>
 <div class="ch"><button class="p" onclick="doExport($('#xo').checked)">Xuất PDF</button></div>`);
}
async function doExport(ocr){
 sheet();const d=S.cur;if(!d.pages.length)return;
 if(ocr&&!await runOCR(d))return;
 toast('Đang tạo PDF...');
 deliver(await makePDF(d.pages,{ocr}),d.name.replace(/[\\/:*?"<>|]/g,'-')+'.pdf');
}
