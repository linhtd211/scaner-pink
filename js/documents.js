/* ============ TRANG & TÀI LIỆU ============ */
let S={tab:'home',docs:[],q:'',view:'list',cur:null,sel:null};
// Xử lý lại một trang từ ảnh gốc theo góc/bộ lọc/chỉnh tay hiện tại
async function renderPage(p){p.ocr=null;const c=await Eng.load(p.orig);let w=Eng.warp(c,p.corners);Eng.enhance(w,p.filter,p.adj);w=Eng.rotate(w,p.rot);p.warn=Eng.quality(w);p.out=await toBlob(w,.9);p.w=w.width;p.h=w.height;const t=document.createElement('canvas');t.width=520;t.height=Math.round(520*w.height/w.width);const tx=t.getContext('2d');tx.imageSmoothingQuality='high';tx.drawImage(w,0,0,t.width,t.height);p.thumb=t.toDataURL('image/jpeg',.82)}
async function addBlob(b,auto=true){const c=await Eng.load(b),p={id:uid(),orig:b,corners:Eng.detect(c).q,filter:'auto',adj:{b:0,c:0,t:0},rot:0};await renderPage(p);S.cur.pages.push(p);return p}
function newDoc(){const n=new Date();S.cur={id:uid(),name:'Tài liệu '+n.toLocaleDateString('vi-VN')+' '+n.toTimeString().slice(0,5),pages:[],created:Date.now()}}
async function saveDoc(){const d=S.cur;d.updated=Date.now();d.ocrText=d.pages.map(p=>p.ocr?p.ocr.text:'').join('\n');d.size=d.pages.reduce((s,p)=>s+p.out.size,0);d.thumb=d.pages[0]?.thumb;await DB.put(d);await load();toast('Đã lưu tài liệu')}
async function load(){S.docs=(await DB.all()).sort((a,b)=>b.updated-a.updated);if(S.tab=='home'&&!S.cur)render()}
function pickImages(cb){const i=document.createElement('input');i.type='file';i.accept='image/*';i.multiple=true;i.onchange=async()=>{if(!i.files.length)return;toast('Đang xử lý ảnh...');for(const f of i.files)await addBlob(f);cb()};i.click()}
