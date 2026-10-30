(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R,arrow:A}=Site.S;
const year=new Date().getFullYear(),N=G.daysInYear(year),markers=G.seasonMarkers(year);
const EPS=23.44,POLAR=66.56;
const today=(()=>{const d=new Date();return G.dayOfYear(year,d.getMonth()+1,d.getDate());})();
const state={doy:today,lat:22.5};
const hd=G.parseNumber(location.hash,'d',1,N),hl=G.parseNumber(location.hash,'lat',-90,90);
if(hd!==null)state.doy=Math.round(hd);if(hl!==null)state.lat=Math.round(hl*10)/10;
const dateText=doy=>{const d=G.dateOf(year,doy);return d.month+'月'+d.day+'日';};
const latText=v=>Math.abs(v)<0.05?'0°':Math.abs(v).toFixed(1).replace(/\.0$/,'')+'°'+(v>0?'N':'S');
const declText=v=>Math.abs(v)<0.05?'0°（赤道）':Math.abs(v).toFixed(1)+'°'+(v>0?'N':'S');
$('doy').max=N;

/* 二分二至按钮 */
$('term-chips').innerHTML=markers.map(m=>'<button data-doy="'+m.doy+'">'+m.name+' '+m.month+'/'+m.day+'</button>').join('')+'<button data-doy="'+today+'">今天</button>';
for(const b of $('term-chips').querySelectorAll('button'))b.addEventListener('click',()=>setDoy(Number(b.dataset.doy)));

/* 公转轨道俯视图 */
function drawOrbit(lambda){
 const cx=200,cy=118,a=116,b=54,al=G.rad(lambda-90);
 const ex=cx+a*Math.cos(al),ey=cy-b*Math.sin(al),far=Math.sin(al)>0,r=13-3*Math.sin(al);
 let s='<defs>'+A('ah','#8ea489')+'<radialGradient id="sunG"><stop stop-color="#fff3c9"/><stop offset=".55" stop-color="#f4c56b"/><stop offset="1" stop-color="#f4c56b" stop-opacity="0"/></radialGradient><radialGradient id="eG" cx="35%" cy="30%"><stop stop-color="#fbfff4"/><stop offset="1" stop-color="#a9bfa6"/></radialGradient></defs>';
 s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+a+'" ry="'+b+'" fill="none" stroke="#b9c8b1" stroke-dasharray="4 4"/>';
 // 公转方向箭头：从北极上空看逆时针
 const tA=G.rad(-40),tx=cx+a*Math.cos(tA),ty=cy-b*Math.sin(tA),dx=a*Math.sin(-tA)*.18,dy=-b*Math.cos(tA)*.18;
 s+='<path d="M'+(tx-dx).toFixed(1)+' '+(ty-dy).toFixed(1)+'L'+(tx+dx).toFixed(1)+' '+(ty+dy).toFixed(1)+'" stroke="#8ea489" stroke-width="1.6" marker-end="url(#ah)"/>';
 s+=T(tx+14,ty+18,'公转方向',12,'#6f8268');
 const marks=[[0,'春分'],[90,'夏至'],[180,'秋分'],[270,'冬至']];
 for(const [lam,name] of marks){
  const m=markers.find(k=>k.target===lam),q=G.rad(lam-90),mx=cx+a*Math.cos(q),my=cy-b*Math.sin(q);
  const side=Math.abs(Math.cos(q))>.5,lx=cx+(a+(side?24:0))*Math.cos(q),ly=cy-(b+(side?0:24))*Math.sin(q);
  s+=C(mx,my,2.6,'#9db095');
  const anchor=side?(Math.cos(q)>0?'start':'end'):'middle',date=m?m.month+'/'+m.day:'';
  if(side)s+=T(lx,ly-3,name,12.5,'#4f6549',600,anchor)+T(lx,ly+12,date,11.5,'#6f8268',400,anchor);
  else s+=T(lx,ly+(Math.sin(q)>0?0:8),name+' '+date,12.5,'#4f6549',600,anchor);
 }
 const earth=()=>{
  let e=C(ex,ey,r,'url(#eG)','#7f967a',.8);
  const th=Math.atan2(ey-cy,ex-cx),x1=ex+r*Math.cos(th-Math.PI/2),y1=ey+r*Math.sin(th-Math.PI/2),x2=ex+r*Math.cos(th+Math.PI/2),y2=ey+r*Math.sin(th+Math.PI/2);
  e+='<path d="M'+x1.toFixed(2)+' '+y1.toFixed(2)+'A'+r+' '+r+' 0 0 1 '+x2.toFixed(2)+' '+y2.toFixed(2)+'Z" fill="#1f3a40" fill-opacity=".45"/>';
  const k=r+8,sx=Math.sin(G.rad(EPS)),cz=Math.cos(G.rad(EPS));
  e+=L(ex+k*sx,ey+k*cz,ex-k*sx,ey-k*cz,'#526f50',1.4);
  e+=T(ex-(k+6)*sx,ey-(k+6)*cz,'N',11,'#526f50',700,'middle');
  return e;
 };
 const sun=C(cx,cy,30,'url(#sunG)')+C(cx,cy,13,'#f4c56b','#e3a94a',.8)+T(cx,cy+31,'太阳',12,'#8a6a2c',500,'middle');
 s+=far?earth()+sun:sun+earth();
 $('orbit').innerHTML=s;
}

/* 侧视光照图 */
function drawSide(decl){
 const cx=206,cy=145,Rr=92,d=G.rad(decl),u=[-Math.sin(d),-Math.cos(d)],v=[Math.cos(d),-Math.sin(d)];
 let s='<defs>'+A('ray','#e3a94a')+'<radialGradient id="sideG" cx="30%" cy="35%" r="80%"><stop stop-color="#fbfff4"/><stop offset=".7" stop-color="#dfe8d3"/><stop offset="1" stop-color="#b4c6ad"/></radialGradient><clipPath id="sideClip"><circle cx="'+cx+'" cy="'+cy+'" r="'+Rr+'"/></clipPath></defs>';
 for(const dy of [-78,-40,40,78])s+=L(8,cy+dy,cx-Math.sqrt(Math.max(0,Rr*Rr-dy*dy))-6,cy+dy,'#ecc787',1.2,'marker-end="url(#ray)"');
 s+=L(8,cy,cx-Rr-6,cy,'#e3a94a',2,'marker-end="url(#ray)"');
 s+=T(8,cy-88,'太阳光',12.5,'#9a7230',600);
 s+=C(cx,cy,Rr,'url(#sideG)','#83997e',1);
 s+='<g clip-path="url(#sideClip)">';
 const seg=(phi,stroke,w,extra)=>{const sp=Math.sin(G.rad(phi)),cp=Math.cos(G.rad(phi)),mx=cx+Rr*sp*u[0],my=cy+Rr*sp*u[1];return L(mx-Rr*cp*v[0],my-Rr*cp*v[1],mx+Rr*cp*v[0],my+Rr*cp*v[1],stroke,w,extra);};
 for(let phi=-75;phi<=75;phi+=15)if(phi!==0)s+=seg(phi,'#c3d0bb',.6);
 for(const phi of [POLAR,-POLAR])s+=seg(phi,'#6e8a9a',1,'stroke-dasharray="4 3"');
 for(const phi of [EPS,-EPS])s+=seg(phi,'#c08a4a',1,'stroke-dasharray="4 3"');
 s+=seg(0,'#526f50',1.5);
 // 观察纬度：白天段实线、夜晚段虚线
 const sp=Math.sin(G.rad(state.lat)),cp=Math.cos(G.rad(state.lat)),mx=cx+Rr*sp*u[0],my=cy+Rr*sp*u[1];
 const ax=mx-Rr*cp*v[0],ay=my-Rr*cp*v[1],bx=mx+Rr*cp*v[0],by=my+Rr*cp*v[1];
 if(Math.abs(bx-ax)>1e-6){const t=G.clamp((cx-ax)/(bx-ax),0,1),ix=ax+(bx-ax)*t,iy=ay+(by-ay)*t;
  s+=L(ax,ay,ix,iy,'#b97342',2.6)+L(ix,iy,bx,by,'#b97342',1.8,'stroke-dasharray="3 3"');}
 s+='<path d="M'+cx+' '+(cy-Rr)+'A'+Rr+' '+Rr+' 0 0 1 '+cx+' '+(cy+Rr)+'Z" fill="#1f3a40" fill-opacity=".36"/>';
 s+='</g>';
 s+=L(cx,cy-Rr-8,cx,cy+Rr+8,'#e9b26b',1.2,'stroke-dasharray="5 4"');
 s+=T(cx+4,cy+Rr+21,'晨昏线',12,'#9a7230',500,'middle');
 const k=Rr+18;
 s+=L(cx-k*u[0],cy-k*u[1],cx+k*u[0],cy+k*u[1],'#526f50',1.2,'stroke-dasharray="2 3"');
 s+=T(cx+(k+9)*u[0],cy+(k+9)*u[1]+4,'N',13,'#405c3c',700,'middle');
 s+=T(cx-(k+9)*u[0],cy-(k+9)*u[1]+4,'S',13,'#405c3c',700,'middle');
 const labels=[[POLAR,'北极圈'],[EPS,'北回归线'],[0,'赤道'],[-EPS,'南回归线'],[-POLAR,'南极圈']];
 for(const [phi,name] of labels){const sp2=Math.sin(G.rad(phi)),cp2=Math.cos(G.rad(phi));const ey=cy+Rr*sp2*u[1]+Rr*cp2*v[1];s+=T(cx+Rr+8,ey+4.5,name,12,phi===0?'#405c3c':Math.abs(phi)>60?'#56788a':'#9a6a33',500);}
 s+=C(cx-Rr,cy,5.5,'#f4c56b','#d99a3c',1)+T(cx-Rr-4,cy-12,'直射点 '+declText(decl).replace('（赤道）',''),12,'#7a5426',600,'end','paint-order="stroke" stroke="#f5f6f0" stroke-width="3"');
 $('side').innerHTML=s;
}

/* 正午立竿 */
function drawShadow(lat,decl){
 const H=G.noonAltitude(lat,decl),g=92,px=150,h=56;
 let s=L(14,g,286,g,'#9eb097',1.2)+T(16,g+20,'南',12,'#6f8268')+T(284,g+20,'北',12,'#6f8268',400,'end');
 s+=L(px,g,px,g-h,'#526f50',3);
 if(H<=0){s+=T(px,24,'正午太阳也在地平线以下（极夜）',12,'#56788a',500,'middle');}
 else{
  const dir=Math.abs(decl-lat)<0.05?0:(decl<lat?1:-1);// 1：太阳在南，影子朝北
  const len=dir===0?0:Math.min(126,h/Math.tan(G.rad(H)));
  if(dir!==0)s+=L(px,g,px+dir*len,g,'#7c8b74',5,'opacity=".55"');
  const sunX=px-(dir||0)*Math.cos(G.rad(H))*70,sunY=g-h-Math.sin(G.rad(H))*30-6;
  s+=C(dir===0?px:sunX,dir===0?14:Math.max(14,sunY),7,'#f4c56b','#d99a3c',1);
  s+=T(px,g+20,dir===0?'太阳直射，正午无影':'影子朝'+(dir>0?'北':'南')+'，影长 ≈ '+(h/Math.tan(G.rad(H))/h).toFixed(2)+' 倍竿高',12,'#4f6549',500,'middle');
 }
 $('shadow').innerHTML=s;
}

function seasonInfo(doy,decl){
 const next=G.declinationOn(year,Math.min(N,doy+1)),prev=G.declinationOn(year,Math.max(1,doy-1));
 const on=markers.find(m=>m.doy===doy);
 const moving=on&&on.name==='夏至'?'到达最北':on&&on.name==='冬至'?'到达最南':(doy===N?decl-prev:next-decl)>0?'向北移':'向南移';
 let after=null;for(const m of markers)if(m.doy<=doy)after=m;
 const before=markers.find(m=>m.doy>doy);
 const badge=on?on.name:(after?after.name:'冬至')+' → '+(before?before.name:'春分');
 let text;
 if(Math.abs(decl)<0.25)text='太阳直射赤道附近，全球昼夜基本等长。';
 else if(decl>0)text='太阳直射北半球：北半球昼长夜短，纬度越高白昼越长'+(decl>EPS-0.3?'；北极圈以内出现极昼。':'。');
 else text='太阳直射南半球：北半球昼短夜长，纬度越高白昼越短'+(decl<-EPS+0.3?'；北极圈以内出现极夜。':'。');
 return {moving,badge,text};
}
function render(){
 const sp=G.sunPosition(new Date(Date.UTC(year,0,state.doy,4))),decl=sp.decl;
 drawOrbit(sp.lambda);drawSide(decl);drawShadow(state.lat,decl);
 const info=seasonInfo(state.doy,decl);
 $('date-output').textContent=dateText(state.doy);
 $('decl-readout').textContent=declText(decl);$('move-readout').textContent=info.moving;
 $('term-badge').textContent=info.badge;$('season-text').textContent=dateText(state.doy)+'：'+info.text;
 const dl=G.dayLength(state.lat,decl),H=G.noonAltitude(state.lat,decl);
 $('obs-output').textContent=latText(state.lat);
 $('day-readout').textContent=G.hoursText(dl);$('night-readout').textContent=G.hoursText(24-dl);
 $('noon-readout').textContent=H>0?H.toFixed(1)+'°':'太阳不升起';
 const ds=Math.abs(state.lat)<=EPS?G.directSunDates(year,state.lat):[];
 $('direct-text').textContent=Math.abs(state.lat)>EPS?latText(state.lat)+' 在回归线以外，一年中没有太阳直射。':
  ds.length?latText(state.lat)+' 一年中太阳直射的日子：'+ds.map(d=>d.month+'月'+d.day+'日').join('、')+'（前后一两天内）。':'';
 Site.setRange($('doy'),state.doy,dateText(state.doy));Site.setRange($('obs-lat'),state.lat,latText(state.lat));
 for(const b of $('term-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.doy)===state.doy&&b.textContent!=='今天'));
 for(const b of $('lat-presets').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.lat)===state.lat));
 document.body.dataset.decl=decl.toFixed(3);
 Site.replaceHash('d='+state.doy+'&lat='+state.lat);
}
function setDoy(v){state.doy=G.clamp(Math.round(v),1,N);render();resetFeedback();}
function setLat(v){state.lat=G.clamp(Math.round(v*10)/10,-90,90);render();resetFeedback();}
$('doy').addEventListener('input',e=>setDoy(Number(e.target.value)));
$('obs-lat').addEventListener('input',e=>setLat(Number(e.target.value)));
for(const b of $('lat-presets').querySelectorAll('button'))b.addEventListener('click',()=>setLat(Number(b.dataset.lat)));
Site.setShareState(()=>'d='+state.doy+'&lat='+state.lat);

/* 练习 */
const decl=()=>G.declinationOn(year,state.doy);
const qs=[
 {title:'让太阳直射北回归线',desc:'拖动日期，找到太阳直射北回归线（23°26′N）的那一天。',check:()=>Math.abs(decl()-23.44)<0.06,yes:()=>'正确！'+dateText(state.doy)+'前后是夏至，太阳直射点到达最北。之后开始南移。',no:'提示：太阳直射点最北的那天，叫什么节气？'},
 {title:'让北京的白昼短于 10 小时',desc:'北京约 39.9°N。找一个日子，让北京白昼不足 10 小时（不用改观察纬度）。',check:()=>G.dayLength(39.9,decl())<10,yes:()=>'对了！'+dateText(state.doy)+'北京白昼约 '+G.hoursText(G.dayLength(39.9,decl()))+'。太阳直射南半球时，北半球昼短夜长。',no:()=>'现在北京白昼约 '+G.hoursText(G.dayLength(39.9,decl()))+'。试试冬季的日子。'},
 {title:'让太阳直射深圳',desc:'深圳约 22.5°N，在北回归线以南。一年里太阳会直射深圳两次，找到其中一次。',check:()=>Math.abs(decl()-22.54)<0.2,yes:()=>'找到了！'+dateText(state.doy)+'深圳正午几乎无影。另一次在夏至的另一侧。',no:'提示：在夏至前后各找一找，直射点纬度要接近 22.5°N。'}
];
let qi=0,passed=false;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-description').textContent=q.desc;$('quiz-step').textContent=(qi+1)+' / '+qs.length;$('quiz-feedback').textContent='';$('quiz-feedback').className='';$('next-question').hidden=true;passed=false;}
function resetFeedback(){if(passed){passed=false;$('quiz-feedback').textContent='日期已改变，可以重新检查。';$('quiz-feedback').className='';$('next-question').hidden=true;}}
$('check-answer').addEventListener('click',()=>{const q=qs[qi];passed=q.check();const msg=passed?q.yes:q.no;$('quiz-feedback').textContent=typeof msg==='function'?msg():msg;$('quiz-feedback').className=passed?'success':'retry';$('next-question').hidden=!passed;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';});
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();render();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'北半球夏至日太阳直射哪条纬线？',desc:'夏至是 6 月 22 日前后。',options:['北回归线','赤道','南回归线','北极圈'],answer:0,hint:'直射点到达最北。',explain:'夏至直射 <b>北回归线（23.5°N）</b>，北半球昼最长夜最短；冬至直射南回归线。'},
 {level:'base',title:'地球公转一周需要多久？',desc:'公转产生四季。',options:['一年','一天','一个月','24 小时'],answer:0,hint:'一年四季轮一遍。',explain:'公转约 <b>365 天</b>（一年）→ 四季；自转约 24 小时（一天）→ 昼夜交替。'},
 {level:'base',title:'春分和秋分这两天，全球昼夜长短如何？',desc:'此时太阳直射赤道。',options:['全球昼夜平分','北半球昼长','南半球昼长','两极出现极昼'],answer:0,hint:'直射赤道时最公平。',explain:'直射<b>赤道</b>，全球<b>昼夜平分</b>（各 12 小时）。'},
 {level:'mid',title:'深圳在 6 月和 12 月相比，哪个月白昼更长？',desc:'深圳在北半球。',options:['6 月','12 月','一样长','无法确定'],answer:0,hint:'6 月直射北半球。',explain:'北半球<b>6 月（近夏至）昼长</b>。口诀：<b>直射哪个半球，哪个半球昼长</b>。'},
 {level:'mid',title:'热带和温带的分界线是？',desc:'五带划分的依据。',options:['回归线','极圈','赤道','本初子午线'],answer:0,hint:'有没有太阳直射是关键。',explain:'<b>回归线</b>分热带与温带（回归线之间有直射）；<b>极圈</b>分温带与寒带（极圈内有极昼极夜）。'},
 {level:'mid',title:'澳大利亚的圣诞节（12 月）是什么季节？',desc:'南北半球季节相反。',options:['夏季','冬季','春季','秋季'],answer:0,hint:'12 月直射南回归线。',explain:'12 月直射<b>南</b>半球，澳大利亚是<b>夏季</b>。南北半球<b>季节永远相反</b>。'},
 {level:'mid',title:'我国科考队去南极，一般选在什么时候？',desc:'要挑南极较暖、有极昼的时候。',options:['11 月至次年 3 月','6 月至 8 月','任何时候','只能 9 月'],answer:0,hint:'南极的夏季是几月？',explain:'11 月至次年 3 月是<b>南半球夏季</b>，南极气温较高且有<b>极昼</b>，便于科考。'},
 {level:'trap',title:'太阳直射点会直射北京（40°N）吗？',desc:'直射点只在哪个范围移动？',options:['不会，只在南北回归线之间移动','会，每年夏至直射','会，每年两次','会，春分秋分各一次'],answer:0,hint:'直射点最北只到 23.5°N。',explain:'直射点只在<b>南北回归线之间</b>往返，北京 40°N <b>从不被直射</b>。而深圳约 22.5°N 在回归线以南，<b>每年有两次直射</b>。'}
]);
