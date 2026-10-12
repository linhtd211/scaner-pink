/* ============ PDF WRITER (tự viết, không phụ thuộc thư viện) ============ */
// pages: [{out:Blob JPEG, w, h, ocr?:{words:[{t,x0,y0,x1,y1}]}}]
// opt.ocr = true: thêm lớp chữ vô hình nằm đúng vị trí chữ trên ảnh scan (ảnh scan vẫn giữ nguyên)
async function makePDF(pages,opt={}){
 const E=new TextEncoder(),parts=[],off=[];let len=0;
 const add=x=>{const u=typeof x=='string'?E.encode(x):x;parts.push(u);len+=u.length},n=pages.length;
 // Bảng mã ký tự -> mã 2 byte; ToUnicode CMap giúp tìm kiếm/copy ra đúng tiếng Việt
 const map=new Map(),code=ch=>{if(!map.has(ch))map.set(ch,map.size+1);return map.get(ch)};
 const hex=c=>c.toString(16).toUpperCase().padStart(4,'0');
 const useT=!!opt.ocr&&pages.some(p=>p.ocr&&p.ocr.words&&p.ocr.words.length),FB=3+3*n;
 add('%PDF-1.4\n');
 const obj=(i,body,stream)=>{off[i]=len;add(`${i} 0 obj\n${body}\n`);if(stream!==undefined){add('stream\n');add(stream);add('\nendstream\n')}add('endobj\n')};
 obj(1,'<</Type/Catalog/Pages 2 0 R>>');
 obj(2,`<</Type/Pages/Count ${n}/Kids[${pages.map((_,i)=>`${3+3*i} 0 R`).join(' ')}]>>`);
 for(let i=0;i<n;i++){
  const p=pages[i],W=595,H=Math.round(595*p.h/p.w),jb=new Uint8Array(await p.out.arrayBuffer());
  let cs=`q ${W} 0 0 ${H} 0 0 cm /Im Do Q`;
  if(useT&&p.ocr&&p.ocr.words&&p.ocr.words.length){
   const sx=W/p.w,sy=H/p.h;cs+='\nBT\n3 Tr\n'; // 3 Tr = chữ vô hình
   for(const w of p.ocr.words){
    const units=w.t.split(''),fs=Math.max(4,(w.y1-w.y0)*sy),bw=(w.x1-w.x0)*sx;
    const tz=Math.min(400,Math.max(10,bw/(units.length*.5*fs)*100)); // co giãn chữ cho vừa bề ngang ô nhận dạng
    const hx=units.map(u=>hex(code(u))).join('')+hex(code(' '));
    cs+=`/F1 ${fs.toFixed(2)} Tf ${tz.toFixed(1)} Tz 1 0 0 1 ${(w.x0*sx).toFixed(2)} ${(H-w.y1*sy+fs*.2).toFixed(2)} Tm <${hx}> Tj\n`;
   }
   cs+='ET';
  }
  obj(3+3*i,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${W} ${H}]/Resources<</XObject<</Im ${5+3*i} 0 R>>${useT?`/Font<</F1 ${FB} 0 R>>`:''}>>/Contents ${4+3*i} 0 R>>`);
  obj(4+3*i,`<</Length ${cs.length}>>`,cs);
  obj(5+3*i,`<</Type/XObject/Subtype/Image/Width ${p.w}/Height ${p.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jb.length}>>`,jb);
 }
 if(useT){
  const ents=[...map].map(([ch,c])=>`<${hex(c)}> <${hex(ch.charCodeAt(0))}>`);let bf='';
  for(let k=0;k<ents.length;k+=100){const s=ents.slice(k,k+100);bf+=`${s.length} beginbfchar\n${s.join('\n')}\nendbfchar\n`}
  const cm=`/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo<</Registry(Adobe)/Ordering(UCS)/Supplement 0>> def\n/CMapName /Adobe-Identity-UCS def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <FFFF>\nendcodespacerange\n${bf}endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend`;
  obj(FB,`<</Type/Font/Subtype/Type0/BaseFont/Arial/Encoding/Identity-H/DescendantFonts[${FB+1} 0 R]/ToUnicode ${FB+3} 0 R>>`);
  obj(FB+1,`<</Type/Font/Subtype/CIDFontType2/BaseFont/Arial/CIDSystemInfo<</Registry(Adobe)/Ordering(Identity)/Supplement 0>>/FontDescriptor ${FB+2} 0 R/DW 500/CIDToGIDMap/Identity>>`);
  obj(FB+2,'<</Type/FontDescriptor/FontName/Arial/Flags 4/FontBBox[0 -200 1000 800]/ItalicAngle 0/Ascent 800/Descent -200/CapHeight 700/StemV 80>>');
  obj(FB+3,`<</Length ${cm.length}>>`,cm);
 }
 const xr=len,N=useT?FB+4:FB;
 add(`xref\n0 ${N}\n0000000000 65535 f \n`+off.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<</Size ${N}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);
 return new Blob(parts,{type:'application/pdf'});
}
// Chia sẻ (điện thoại) hoặc tải xuống (máy tính); dùng cho cả PDF và TXT
async function deliver(blob,name){
 const f=new File([blob],name,{type:blob.type});
 try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});toast(blob.type=='application/pdf'?'Đã xuất PDF':'Đã xuất tệp');return}}catch(e){if(e.name=='AbortError')return}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();
 toast(blob.type=='application/pdf'?'Đã xuất PDF':'Đã xuất tệp');
}
