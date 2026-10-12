/* ============ KHỞI ĐỘNG + PWA ============ */
let deferredInstall;
// Trình duyệt báo ứng dụng có thể cài lên màn hình chính
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;if(S.tab=='set')render()});
async function installApp(){if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;render()}
// Đăng ký service worker để chạy offline
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
DB.open().then(load).then(render);
