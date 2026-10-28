(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const K=5,W=G.TERRAIN.w,H=G.TERRAIN.h,KM=G.TERRAIN.kmPerUnit; // 1 地图单位 = 5 px = 0.1 km
const F=G.terrainFeatures(),grid=G.makeGrid(G.terrainHeight,W,H,0.5);
const state={interval:100,tint:true,feature:null,a:{x:4,y:24},b:{x:96,y:40},probe:null};
for(const [k,key] of [['a','a'],['b','b']]){
 const x=G.parseNumber(location.hash,key+'x',0,W),y=G.parseNumber(location.hash,key+'y',0,H);
 if(x!==null&&y!==null)state[k]={x:Math.round(x*10)/10,y:Math.round(y*10)/10};
}
const svg=$('map');
const BANDS=['#b6d9a2','#c9e2a6','#e3e8ae','#efe6a9','#ecd79a','#e5c48a','#dcae7a','#cf9b6c','#c38a62'];
function tintImage(){
 const c=document.createElement('canvas'),w=250,h=175;c.width=w;c.height=h;
 const ctx=c.getContext('2d'),img=ctx.createImageData(w,h);
 const rgb=BANDS.map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const v=G.terrainHeight((i+.5)/w*W,(j+.5)/h*H),k=Math.min(BANDS.length-1,Math.floor(v/100)),o=(j*w+i)*4;img.data[o]=rgb[k][0];img.data[o+1]=rgb[k][1];img.data[o+2]=rgb[k][2];img.data[o+3]=255;}
 ctx.putImageData(img,0,0);return c.toDataURL('image/png');
}
const tintURL=tintImage();
function riverPath(){
 const pts=[];let x=F.valley.x;
 for(let y=41;y<=64;y+=1){let best=x,bh=Infinity;for(let dx=-3;dx<=3;dx+=.1){const h=G.terrainHeight(x+dx,y);if(h<bh){bh=h;best=x+dx;}}x=best;pts.push([x,y]);}
 pts.push([x+1,H]);
 return 'M'+pts.map(p=>(p[0]*K).toFixed(1)+' '+(p[1]*K).toFixed(1)).join('L');
}
const river=riverPath();
function contourLayer(){
 const top=Math.max(F.peakA.h,F.peakB.h);let s='';const labels=[];
 for(let lv=state.interval;lv<top;lv+=state.interval){
  const segs=G.contourSegments(grid,lv),index=lv%(state.interval*5)===0;
  let d='';for(const g of segs)d+='M'+(g[0]*K).toFixed(1)+' '+(g[1]*K).toFixed(1)+'L'+(g[2]*K).toFixed(1)+' '+(g[3]*K).toFixed(1);
  s+='<path d="'+d+'" fill="none" stroke="'+(index?'#7a5a3a':'#9b7b58')+'" stroke-width="'+(index?1.5:.8)+'" stroke-linecap="round"/>';
  // 标注：沿主峰向西北的射线，每 200 米标一个数字
  if(lv%200===0){const dx=-.93,dy=-.37;for(let r=0;r<40;r+=.05){const x=F.peakA.x+dx*r,y=F.peakA.y+dy*r;if(G.terrainHeight(x,y)<lv){labels.push([x*K,y*K,lv]);break;}}}
 }
 for(const [x,y,lv] of labels)s+=T(x,y+4.5,String(lv),13,'#6b4d30',700,'middle','paint-order="stroke" stroke="#fffdf4" stroke-width="3.5"');
 return s;
}
function featureMarker(){
 const f=state.feature;if(!f||f==='cliff')return '';
 const p=F[f];let s=C(p.x*K,p.y*K,9,'none','#b97342',2,'stroke-dasharray="3 2"')+C(p.x*K,p.y*K,3,'#b97342');
 const name=f==='peakA'?'山峰':p.name.replace(/（.*）/,'');
 s+=T(p.x*K,p.y*K-15,name,16,'#7a4520',700,'middle','paint-order="stroke" stroke="#fffdf4" stroke-width="4"');
 if(f==='peakA')s+=C(F.peakB.x*K,F.peakB.y*K,9,'none','#b97342',2,'stroke-dasharray="3 2"')+C(F.peakB.x*K,F.peakB.y*K,3,'#b97342');
 return s;
}
function drawMap(){
 let s='<defs><clipPath id="mapClip"><rect width="500" height="350" rx="12"/></clipPath></defs><g clip-path="url(#mapClip)">';
 s+=R(0,0,500,350,'#f3f1e4');
 if(state.tint)s+='<image href="'+tintURL+'" x="0" y="0" width="500" height="350" preserveAspectRatio="none" opacity=".85"/>';
 s+=contourLayer();
 s+=P(river,'#5f97ae',2.2)+T(F.valley.x*K+9,58*K,'河流',14,'#3f7489',600,'start','paint-order="stroke" stroke="#fffdf4" stroke-width="3"');
 s+='<g transform="translate(470 34)">'+P('M0 -16L6 6L0 1L-6 6Z','#4a5f45',1,'#4a5f45')+T(0,-21,'N',14,'#4a5f45',700,'middle')+'</g>';
 s+='<g transform="translate(18 326)">'+R(0,0,25,5,'#4a5f45')+R(25,0,25,5,'#fff',0,'stroke="#4a5f45" stroke-width="1"')+T(0,-6,'0',13,'#4a5f45')+T(50,-6,'1 千米',13,'#4a5f45',400,'middle')+'</g>';
 s+=featureMarker();
 if(state.probe)s+=C(state.probe.x*K,state.probe.y*K,4,'#fff','#2f5a44',1.6)+T(state.probe.x*K+8,state.probe.y*K-6,Math.round(G.terrainHeight(state.probe.x,state.probe.y)/10)*10+' 米',15,'#2f5a44',700,'start','paint-order="stroke" stroke="#fffdf4" stroke-width="3"');
 const ax=state.a.x*K,ay=state.a.y*K,bx=state.b.x*K,by=state.b.y*K;
 s+=L(ax,ay,bx,by,'#b97342',2.2,'stroke-dasharray="6 4"');
 for(const [k,x,y] of [['A',ax,ay],['B',bx,by]])s+='<g class="handle" data-handle="'+k.toLowerCase()+'" style="cursor:grab">'+C(x,y,16,'#b97342','none',0,'fill-opacity=".14"')+C(x,y,7,'#b97342','#fff',2)+T(x,y-14,k,17,'#7a4520',700,'middle','paint-order="stroke" stroke="#fffdf4" stroke-width="3.5"')+'</g>';
 s+='</g>';
 svg.innerHTML=s;
}
function drawProfile(){
 const pts=G.terrainProfile(state.a.x,state.a.y,state.b.x,state.b.y,200);
 const len=Math.hypot(state.b.x-state.a.x,state.b.y-state.a.y)*KM;// km
 const x0=48,x1=386,y0=164,y1=22,top=1000,sx=(x1-x0)/Math.max(len,.001),sy=(y0-y1)/top;
 let s='';
 for(let h=0;h<=top;h+=200){const y=y0-h*sy;s+=L(x0,y,x1,y,'#dfe6d8',.8)+T(x0-6,y+4,String(h),12,'#6f8268',400,'end');}
 s+=T(x0-6,y1-9,'海拔/米',12,'#6f8268',400,'start');
 const step=len>6?2:1;for(let k=0;k<=len+1e-9;k+=step){const x=x0+k*sx;s+=L(x,y0,x,y0+4,'#9eb097',1)+T(x,y0+17,String(k),12,'#6f8268',400,'middle');}
 s+=T(x1,y0+33,'距离/千米',12,'#6f8268',400,'end');
 let d='M'+x0+' '+y0;for(const p of pts)d+='L'+(x0+p.t*len*sx).toFixed(1)+' '+(y0-p.h*sy).toFixed(1);d+='L'+x1+' '+y0+'Z';
 s+='<path d="'+d+'" fill="#d8c39a" stroke="#8a6a44" stroke-width="1.4" stroke-linejoin="round"/>';
 const max=pts.reduce((m,p)=>p.h>m.h?p:m,pts[0]);
 s+=C(x0+max.t*len*sx,y0-max.h*sy,3.5,'#b97342')+T(x0+max.t*len*sx,y0-max.h*sy-8,Math.round(max.h/10)*10+' 米',13,'#7a4520',700,'middle');
 s+=T(x0+6,y0-pts[0].h*sy-8,'A',14,'#7a4520',700,'middle')+T(x1-6,y0-pts[pts.length-1].h*sy-8,'B',14,'#7a4520',700,'middle');
 $('profile').innerHTML=s;
 const vx=Math.round(sy/(sx/1000));
 $('vx-badge').textContent='垂直放大约 '+vx+' 倍';
 $('dist-readout').innerHTML=len.toFixed(1)+'<small>千米</small>';
 $('max-readout').innerHTML=Math.round(max.h/10)*10+'<small>米</small>';
 $('a-readout').innerHTML=Math.round(pts[0].h/10)*10+'<small>米</small>';
 $('b-readout').innerHTML=Math.round(pts[pts.length-1].h/10)*10+'<small>米</small>';
 svg.dataset.profileMax=Math.round(max.h);
}
const FEATURE_TEXT={
 peakA:'山峰：一组闭合等高线，数值中间高、四周低。本图有两座山峰，主峰约 '+Math.round(F.peakA.h/10)*10+' 米，次峰约 '+Math.round(F.peakB.h/10)*10+' 米。',
 ridge:'山脊：从主峰向西南伸出的部分，等高线向海拔低处凸出。雨水落在山脊上会向两侧流走。',
 valley:'山谷：等高线向海拔高处凸出，两条山脊之间的低处。这里的河流就沿山谷向南流。',
 saddle:'鞍部：两座山峰之间相对低洼的部位，海拔约 '+Math.round(F.saddle.h/10)*10+' 米，像马鞍。',
 steep:'陡坡：次峰东侧等高线挤在一起，海拔下降 200 米只需水平走约 '+(G.runForDrop(F.peakB.x,F.peakB.y,1,0,200)*KM).toFixed(1)+' 千米。',
 gentle:'缓坡：次峰西侧等高线疏散，坡度和缓。同一座山，西坡比东坡好爬得多。',
 cliff:'陡崖：多条等高线重合在一起的地方，地面近乎垂直。本图没有陡崖；在地形图上它常用专门符号标出。'
};
function setFeature(f){
 state.feature=state.feature===f?null:f;
 for(const b of $('feature-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.f===state.feature));
 $('feature-text').textContent=state.feature?FEATURE_TEXT[state.feature]:'选一个地形部位，看它在等高线图上长什么样。';
 drawMap();
}
for(const b of $('feature-chips').querySelectorAll('button'))b.addEventListener('click',()=>setFeature(b.dataset.f));
for(const b of $('interval-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.interval=Number(b.dataset.interval);Site.pressed($('interval-chips'),b);drawMap();});
$('tint-toggle').addEventListener('click',()=>{state.tint=!state.tint;$('tint-toggle').setAttribute('aria-pressed',String(state.tint));$('tint-toggle').classList.toggle('selected',state.tint);drawMap();});

/* 拖动与点击 */
let drag=null;
const toUnits=e=>{const p=Site.svgPoint(svg,e);return {x:G.clamp(p.x/K,0,W),y:G.clamp(p.y/K,0,H)};};
svg.addEventListener('pointerdown',e=>{
 const h=e.target.closest('[data-handle]');
 drag={id:e.pointerId,handle:h?h.dataset.handle:null,start:toUnits(e),moved:false};
 svg.setPointerCapture(e.pointerId);
});
svg.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;const p=toUnits(e);
 if(Math.hypot(p.x-drag.start.x,p.y-drag.start.y)>.8)drag.moved=true;
 if(drag.handle&&drag.moved){state[drag.handle]={x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10};schedule();}
});
svg.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 if(!drag.moved){const p=toUnits(e);state.probe=p;
  $('probe-text').textContent='所点位置海拔约 '+Math.round(G.terrainHeight(p.x,p.y)/10)*10+' 米。';
  onMapClick(p);drawMap();}
 else{resetFeedback();}
 drag=null;updateHash();
});
svg.addEventListener('pointercancel',()=>{drag=null;});
svg.addEventListener('keydown',e=>{
 const step={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!step)return;e.preventDefault();
 const k=e.shiftKey?'a':'b';state[k]={x:G.clamp(state[k].x+step[0],0,W),y:G.clamp(state[k].y+step[1],0,H)};schedule();updateHash();
});
let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;drawMap();drawProfile();});}
function hashState(){return 'ax='+state.a.x+'&ay='+state.a.y+'&bx='+state.b.x+'&by='+state.b.y;}
function updateHash(){Site.replaceHash(hashState());}
Site.setShareState(hashState);

/* 比例尺换算 */
function scaleCalc(){
 const cm=Number($('map-cm').value),den=Number($('scale-select').value);
 if(!(cm>0)){$('real-readout').textContent='—';return;}
 const km=cm*den/100000;
 $('real-readout').textContent=(km>=1?(Math.round(km*100)/100)+' 千米':Math.round(km*1000)+' 米');
 $('scale-note').textContent=cm+' 厘米 × '+den.toLocaleString('zh-CN')+' = '+(cm*den).toLocaleString('zh-CN')+' 厘米 = '+(km>=1?(Math.round(km*100)/100)+' 千米':Math.round(km*1000)+' 米')+'。比例尺 1:'+den.toLocaleString('zh-CN')+' 表示图上 1 厘米代表实地 '+(den/100000>=1?den/100000+' 千米':den/100+' 米')+'。';
}
$('map-cm').addEventListener('input',scaleCalc);$('scale-select').addEventListener('change',scaleCalc);

/* 练习 */
$('fact-peak').textContent=Math.round(F.peakA.h/10)*10;$('fact-rel').textContent=Math.round((F.peakA.h-F.saddle.h)/10)*10;
const near=(p,f,r)=>Math.hypot(p.x-F[f].x,p.y-F[f].y)<=r;
const segDist=(p)=>{const ax=state.a.x,ay=state.a.y,dx=state.b.x-ax,dy=state.b.y-ay,t=G.clamp(((p.x-ax)*dx+(p.y-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-ax-t*dx,p.y-ay-t*dy);};
const qs=[
 {type:'click',title:'点出主峰的位置',desc:'在地图上找到海拔最高的山顶（一组最小的闭合等高线中间），点一下。',check:p=>near(p,'peakA',3.5),yes:'找到了！主峰约 '+Math.round(F.peakA.h/10)*10+' 米，闭合等高线中间高、四周低。',no:p=>'这里海拔约 '+Math.round(G.terrainHeight(p.x,p.y)/10)*10+' 米，还不是最高处。找数值最大的那组闭合等高线。'},
 {type:'click',title:'点出鞍部的位置',desc:'鞍部在两座山峰之间。点一下你认为的鞍部。',check:p=>near(p,'saddle',4.5),yes:'对了！两峰之间这处低洼约 '+Math.round(F.saddle.h/10)*10+' 米，向两峰方向都升高，向南北两侧都降低。',no:'再找找：从主峰走向次峰，要先下坡再上坡，最低的那段就是鞍部。'},
 {type:'choice',title:'次峰的哪一坡更陡？',desc:'比较次峰（右侧那座）东、西两侧等高线的疏密。',answer:'east',yes:'正确！东坡等高线更密，海拔下降 200 米只需约 '+(G.runForDrop(F.peakB.x,F.peakB.y,1,0,200)*KM).toFixed(1)+' 千米，西坡要约 '+(G.runForDrop(F.peakB.x,F.peakB.y,-1,0,200)*KM).toFixed(1)+' 千米。',no:'再看看：等高线越密，坡越陡。'},
 {type:'check',title:'让剖面线穿过两座山峰',desc:'拖动 A、B 两端，让剖面线同时经过主峰和次峰，然后点“检查”。剖面图上会出现两个山头。',check:()=>segDist(F.peakA)<2.5&&segDist(F.peakB)<2.5,yes:'漂亮！剖面上两个山头之间的低处，就是刚才的鞍部。',no:'还差一点：A—B 线要同时靠近两个山顶。'}
];
let qi=0,passed=false;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-description').textContent=q.desc;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').hidden=q.type!=='choice';$('check-answer').hidden=q.type!=='check';$('quiz-hint').textContent=q.type==='click'?'在左边的地图上点一下':q.type==='choice'?'选一个答案':'拖动剖面线后检查';
 $('quiz-feedback').textContent='';$('quiz-feedback').className='';$('next-question').hidden=true;passed=false;resetOptions();}
function finish(ok,msg){passed=ok;$('quiz-feedback').textContent=msg;$('quiz-feedback').className=ok?'success':'retry';$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}
function onMapClick(p){const q=qs[qi];if(q.type!=='click'||passed)return;const ok=q.check(p);finish(ok,ok?q.yes:(typeof q.no==='function'?q.no(p):q.no));}
function resetFeedback(){if(passed&&qs[qi].type==='check'){passed=false;$('quiz-feedback').textContent='剖面线已改变，可以重新检查。';$('quiz-feedback').className='';$('next-question').hidden=true;}}
const resetOptions=Site.optionQuiz($('quiz-options'),{answer:'east',onAnswer:ok=>finish(ok,ok?qs[2].yes:qs[2].no)});
$('check-answer').addEventListener('click',()=>{const q=qs[qi];if(q.type!=='check')return;const ok=q.check();finish(ok,ok?q.yes:q.no);});
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();scaleCalc();drawMap();drawProfile();
})();
