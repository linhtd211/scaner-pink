// Độ phân giải tối đa (cạnh dài): khi đọc ảnh và khi xuất trang đã chỉnh phối cảnh
const MAX_LOAD=2000,MAX_OUT=1700;
/* ============ SCANNER ENGINE: detect / warp / enhance / blur ============ */
const Eng={
 // Đọc ảnh, thu nhỏ tối đa 2000px để tiết kiệm RAM
 async load(b){const i=await createImageBitmap(b),s=Math.min(1,MAX_LOAD/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*s|0;c.height=i.height*s|0;c.getContext('2d').drawImage(i,0,0,c.width,c.height);return c},
 // Tìm vùng giấy sáng lớn nhất (xấp xỉ hình chữ nhật). Trả về góc chuẩn hoá TL,TR,BR,BL
 detect(c){const w=96,h=Math.max(8,Math.round(96*c.height/c.width)),t=document.createElement('canvas');t.width=w;t.height=h;const x=t.getContext('2d');x.drawImage(c,0,0,w,h);const d=x.getImageData(0,0,w,h).data,g=[];let s=0;for(let i=0;i<d.length;i+=4){const v=.3*d[i]+.59*d[i+1]+.11*d[i+2];g.push(v);s+=v}
  const th=Math.max(s/g.length*1.05,90),rows=Array(h).fill(0),cols=Array(w).fill(0);g.forEach((v,i)=>{if(v>th){rows[i/w|0]++;cols[i%w]++}});
  const r=rows.map((n,i)=>n>w*.25?i:-1).filter(i=>i>=0),k=cols.map((n,i)=>n>h*.25?i:-1).filter(i=>i>=0);
  if(!r.length||!k.length)return{ok:0,q:Eng.full(.06)};const x0=k[0]/w,x1=(k.at(-1)+1)/w,y0=r[0]/h,y1=(r.at(-1)+1)/h;
  if((x1-x0)*(y1-y0)<.25)return{ok:0,q:Eng.full(.06)};return{ok:1,q:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]]}},
 full:(m=0)=>[[m,m],[1-m,m],[1-m,1-m],[m,1-m]],
 // Chỉnh phối cảnh: ánh xạ hình vuông đơn vị -> tứ giác (homography), lấy mẫu song tuyến
 warp(c,q){const P=q.map(p=>[p[0]*c.width,p[1]*c.height]),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);let W=(dist(P[0],P[1])+dist(P[3],P[2]))/2,H=(dist(P[0],P[3])+dist(P[1],P[2]))/2;const k=Math.min(1,MAX_OUT/Math.max(W,H));W=Math.max(8,W*k|0);H=Math.max(8,H*k|0);
  const[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=P,dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3,den=dx1*dy2-dy1*dx2||1e-9,g=(dx3*dy2-dy3*dx2)/den,h=(dx1*dy3-dy1*dx3)/den,a=x1-x0+g*x1,b=x3-x0+h*x3,d=y1-y0+g*y1,e=y3-y0+h*y3;
  const sx=c.getContext('2d').getImageData(0,0,c.width,c.height),S=sx.data,o=document.createElement('canvas');o.width=W;o.height=H;const ox=o.getContext('2d'),od=ox.createImageData(W,H),D=od.data;
  for(let j=0;j<H;j++){const v=j/(H-1);for(let i=0;i<W;i++){const u=i/(W-1),z=g*u+h*v+1,X=Math.min(c.width-1.01,Math.max(0,(a*u+b*v+x0)/z)),Y=Math.min(c.height-1.01,Math.max(0,(d*u+e*v+y0)/z)),xi=X|0,yi=Y|0,fx=X-xi,fy=Y-yi,p=(yi*c.width+xi)*4,o4=(j*W+i)*4;
   for(let n=0;n<3;n++)D[o4+n]=(S[p+n]*(1-fx)+S[p+4+n]*fx)*(1-fy)+(S[p+c.width*4+n]*(1-fx)+S[p+c.width*4+4+n]*fx)*fy;D[o4+3]=255}}
  ox.putImageData(od,0,0);return o},
 // Ước lượng nền giấy (ảnh thu nhỏ rồi phóng to) để san đều ánh sáng
 bg(c){const s=document.createElement('canvas');s.width=Math.max(2,c.width/14|0);s.height=Math.max(2,c.height/14|0);s.getContext('2d').drawImage(c,0,0,s.width,s.height);const u=document.createElement('canvas');u.width=c.width;u.height=c.height;const x=u.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(s,0,0,c.width,c.height);return x.getImageData(0,0,c.width,c.height).data},
 // Bộ lọc + chỉnh tay (b: sáng, c: tương phản, t: nhiệt độ màu). Không đụng vào ảnh gốc.
 enhance(c,mode,adj){const x=c.getContext('2d'),im=x.getImageData(0,0,c.width,c.height),d=im.data,B=mode=='orig'||mode=='photo'?null:Eng.bg(c),cf=1+adj.c/100;
  for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2];
   if(B){const k=n=>Math.min(255,d[i+n]*250/Math.max(B[i+n],40));r=k(0);g=k(1);b=k(2);const l=.3*r+.59*g+.11*b;
    if(mode=='text'){const v=Math.max(0,Math.min(255,(l-95)*1.7));r=g=b=v}
    else if(mode=='bw'){r=g=b=l>172?255:0}
    else if(mode=='red'){const red=r-Math.max(g,b)>45,blue=b-r>40;if(!red&&!blue){const v=l>195?255:Math.max(0,(l-85)*1.5);r=g=b=v}}}
   else if(mode=='photo'){r=(r-128)*1.05+128;g=(g-128)*1.05+128;b=(b-128)*1.05+128}
   d[i]=(r-128)*cf+128+adj.b*1.5+adj.t*.4;d[i+1]=(g-128)*cf+128+adj.b*1.5;d[i+2]=(b-128)*cf+128+adj.b*1.5-adj.t*.4}
  x.putImageData(im,0,0)},
 rotate(c,n){if(!n)return c;const o=document.createElement('canvas'),s=n%2;o.width=s?c.height:c.width;o.height=s?c.width:c.height;const x=o.getContext('2d');x.translate(o.width/2,o.height/2);x.rotate(n*Math.PI/2);x.drawImage(c,-c.width/2,-c.height/2);return o},
 // Kiểm tra chất lượng: độ mờ (phương sai Laplacian) và độ sáng
 quality(c){const s=document.createElement('canvas');s.width=240;s.height=Math.max(8,240*c.height/c.width|0);const x=s.getContext('2d');x.drawImage(c,0,0,s.width,s.height);const d=x.getImageData(0,0,s.width,s.height).data,w=s.width,L=[];let m=0;for(let i=0;i<d.length;i+=4){const v=.3*d[i]+.59*d[i+1]+.11*d[i+2];L.push(v);m+=v}m/=L.length;
  let sum=0,sq=0,n=0;for(let y=1;y<s.height-1;y++)for(let i=1;i<w-1;i++){const p=y*w+i,l=4*L[p]-L[p-1]-L[p+1]-L[p-w]-L[p+w];sum+=l;sq+=l*l;n++}
  const w1=[];if(sq/n-(sum/n)**2<40)w1.push('Có thể bị mờ');if(m<60)w1.push('Quá tối');if(m>238)w1.push('Quá sáng');return w1}};
