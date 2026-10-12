/* ============ LƯU TRỮ (IndexedDB, có dự phòng bộ nhớ tạm) ============ */
const DB=(()=>{let db,mem=[];const open=()=>new Promise(r=>{try{const q=indexedDB.open('scanpro',1);q.onupgradeneeded=()=>q.result.createObjectStore('docs',{keyPath:'id'});q.onsuccess=()=>{db=q.result;r()};q.onerror=()=>r()}catch(e){r()}});
const tx=(m,f)=>new Promise((res,rej)=>{const t=db.transaction('docs',m),o=f(t.objectStore('docs'));t.oncomplete=()=>res(o.result);t.onerror=()=>rej(t.error)});
return{open,all:()=>db?tx('readonly',s=>s.getAll()):mem.slice(),put:d=>{if(!db){mem=mem.filter(x=>x.id!=d.id);mem.push(d);return}return tx('readwrite',s=>s.put(d))},del:id=>{if(!db){mem=mem.filter(x=>x.id!=id);return}return tx('readwrite',s=>s.delete(id))},persistent:()=>!!db}})();
