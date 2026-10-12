/* Service worker ScanPro: cache app shell để chạy offline, cache thêm thư viện/mô hình OCR khi đã tải lần đầu */
const V='scanpro-v2',OCR_C='scanpro-ocr-v1';
const SHELL=['./','index.html','css/style.css','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
 'js/util.js','js/storage.js','js/scanner-engine.js','js/pdf.js','js/ocr.js','js/documents.js','js/home.js','js/camera.js','js/review.js','js/export.js','js/crop.js','js/viewer.js','js/main.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==OCR_C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 // File của app: dùng bản cache ngay, đồng thời cập nhật ngầm
 if(u.origin===location.origin){
  e.respondWith(caches.open(V).then(async c=>{const hit=await c.match(r,{ignoreSearch:true});
   const net=fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}));return}
 // Thư viện + mô hình OCR từ CDN: lưu lại sau lần tải đầu
 if(/jsdelivr\.net|projectnaptha\.com/.test(u.host)){
  e.respondWith(caches.open(OCR_C).then(async c=>{const hit=await c.match(r);if(hit)return hit;
   const res=await fetch(r);if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))}
});
