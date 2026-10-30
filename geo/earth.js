(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,ns='http://www.w3.org/2000/svg';
const state={lon:120,lat:30,mode:'both',viewLon:80,viewLat:18,spinning:false,dn:false,t:12};
const h0=location.hash,restored=G.parseCoordinates(h0);
if(restored){state.lon=restored.lon;state.lat=restored.lat;state.viewLon=G.normLon(state.lon-28);state.viewLat=G.clamp(state.lat*.65,-65,65);}
if(G.parseNumber(h0,'dn',0,1)===1){state.dn=true;const t=G.parseNumber(h0,'t',0,24);if(t!==null)state.t=Math.round(t*2)/2;}
const stage=$('stage'),svg=$('globe'),reduce=Site.reduce;
const {path:pth,circle:circ,line:ln,text:txt}=Site.S;
const camera=()=>({lon:state.viewLon,lat:state.viewLat});
const sunLon=()=>G.subsolarLongitude(state.t);

function buildStand(){
 let b='<ellipse cx="198" cy="327" rx="78" ry="9" fill="#91a28a" opacity=".22" filter="url(#shadow)"/>';
 b+='<ellipse cx="198" cy="320" rx="60" ry="12" fill="#92a78d" stroke="#71866d" stroke-width=".6"/><path d="M138 312V320Q198 339 258 320V312Z" fill="url(#base)"/>';
 b+='<ellipse cx="198" cy="312" rx="60" ry="13" fill="#e0e8d6" stroke="#81967c" stroke-width=".7"/><ellipse cx="198" cy="312" rx="52" ry="9" fill="none" stroke="#9dad94" stroke-width=".6"/>';
 for(const [x,y] of [[148,312],[248,312],[179,305],[217,318]])b+=circ(x,y,1.8,'#c8d3bf','#798d73',.7)+ln(x-1,y,x+1,y,'#73866d',.7);
 b+='<rect x="189" y="284" width="18" height="26" rx="3" fill="url(#metal)"/><ellipse cx="198" cy="307" rx="10" ry="3" fill="#d8e4ce" stroke="#92a489" stroke-width=".7"/>';
 const tx=194+Math.sin(G.rad(14))*131,ty=160+Math.cos(G.rad(14))*131;
 b+=ln(tx,ty,tx,309,'#7f9577',8)+ln(tx,ty,tx,309,'#c7d3ba',5);
 b+='<g transform="rotate(-14 194 160)">';
 b+=pth('M194 29A131 131 0 0 1 194 291','#71886f',9)+pth('M194 29A131 131 0 0 1 194 291','#c3cdb6',6);
 for(let i=0;i<=36;i++){const a=G.rad(-90+i*5),r=131,len=i%6===0?7:3;b+=ln(194+Math.cos(a)*(r-len),160+Math.sin(a)*(r-len),194+Math.cos(a)*(r+3),160+Math.sin(a)*(r+3),'#6c8165',i%6===0?1:.65);}
 b+='</g>';
 b+=circ(239,305,6.5,'url(#metal)','#72866c',.8)+circ(239,305,3.5,'#dfe8d2','#82947a',.5);
 for(let i=0;i<16;i++){const a=i*Math.PI/8;b+=ln(239+Math.cos(a)*5.2,305+Math.sin(a)*5.2,239+Math.cos(a)*6.3,305+Math.sin(a)*6.3,'#73876c',.45);}
 $('stand').innerHTML=b;
}
buildStand();
const paths={meridians:[],parallels:[]};
for(let i=-180;i<180;i+=15){const el=document.createElementNS(ns,'path');el.setAttribute('fill','none');el.setAttribute('stroke','#8a9f7e');el.setAttribute('stroke-width','.72');$('grid-meridians').appendChild(el);paths.meridians.push({el,coords:G.meridian(i)});}
for(let i=-75;i<=75;i+=15){const el=document.createElementNS(ns,'path');el.setAttribute('fill','none');el.setAttribute('stroke','#859b79');el.setAttribute('stroke-width','.75');$('grid-parallels').appendChild(el);paths.parallels.push({el,coords:G.parallel(i)});}
let queued=false;
function queuePaint(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;paint();});}
function paint(){
 const cam=camera();
 for(const group of Object.values(paths))for(const item of group)item.el.setAttribute('d',G.visiblePath(item.coords,cam));
 $('prime').setAttribute('d',G.visiblePath(G.meridian(0),cam));
 $('equator').setAttribute('d',G.visiblePath(G.parallel(0),cam));
 $('select-lon').setAttribute('d',G.visiblePath(G.meridian(state.lon),cam));
 $('select-lat').setAttribute('d',G.visiblePath(G.parallel(state.lat),cam));
 const showLon=state.mode!=='parallels',showLat=state.mode!=='meridians';
 for(const id of ['grid-meridians','prime','select-lon'])$(id).style.display=showLon?'':'none';
 for(const id of ['grid-parallels','equator','select-lat'])$(id).style.display=showLat?'':'none';
 // 昼夜
 let labels='';
 if(state.dn){
  const sh=G.nightShape(cam,sunLon(),0);
  $('night').setAttribute('d',sh.night);$('terminator').setAttribute('d',sh.terminator);
  for(const [lon,name] of [[sunLon()-90,'晨线'],[sunLon()+90,'昏线']]){const q=G.project(lon,0,cam);if(q.z>.08)labels+='<g>'+circ(q.x,q.y,2.6,'#e9b26b')+txt(q.x+6,q.y+16,name,11,'#7a5426',600,'start','paint-order="stroke" stroke="#fff" stroke-width="3"')+'</g>';}
  const s=G.project(sunLon(),0,cam);
  if(s.z>.05)labels+='<g>'+circ(s.x,s.y,6,'#f4c56b','#d99a3c',1)+txt(s.x,s.y-11,'直射点',10,'#7a5426',600,'middle','paint-order="stroke" stroke="#fff" stroke-width="3"')+'</g>';
 }else{$('night').setAttribute('d','');$('terminator').setAttribute('d','');}
 $('dn-labels').innerHTML=labels;
 const p=G.project(state.lon,state.lat,cam),north=G.project(0,90,cam),south=G.project(0,-90,cam);
 $('point').setAttribute('transform','translate('+p.x.toFixed(2)+' '+p.y.toFixed(2)+')');
 $('point').style.display=p.z>=0?'':'none';
 $('occluded').hidden=p.z>=0;
 $('axis-back').innerHTML=ln(north.x,north.y,162.31,32.9,'#899d7f',3)+ln(south.x,south.y,198,287,'#809775',6)+ln(south.x,south.y,198,287,'#cad8bc',3.5);
 let poles='';
 for(const [q,name,off] of [[north,'N',-13],[south,'S',17]])if(q.z>=-1e-9)poles+=circ(q.x,q.y,3.3,'#dbe4cc','#839776',.6)+txt(q.x-8,q.y+off,name,11,'#4d6b47',600);
 $('pole-labels').innerHTML=poles;
 svg.setAttribute('aria-label','经纬网球体，点 P 位于'+G.longitudeText(state.lon)+'、'+G.latitudeText(state.lat)+(p.z<0?'，当前在背面':'')+(state.dn?'；北京时间 '+G.timeText(state.t):''));
 stage.dataset.viewLon=state.viewLon.toFixed(2);
}
function pointToFront(){stopSpin();state.viewLon=G.normLon(state.lon-28);state.viewLat=G.clamp(state.lat*.65,-65,65);queuePaint();}
function hashState(){return 'lon='+state.lon+'&lat='+state.lat+(state.dn?'&dn=1&t='+state.t:'');}
function updateHash(){Site.replaceHash(hashState());}
Site.setShareState(hashState);
function timeReadout(){
 const el=$('time-readout');el.hidden=!state.dn;if(!state.dn)return;
 const lt=G.localTime(state.t,state.lon),dot=G.sunDot(state.lon,state.lat,sunLon(),0);
 const phase=Math.abs(dot)<1e-6?'正好在晨昏线上':dot>0?'正处于白天':'正处于夜晚';
 el.textContent='北京时间 '+G.timeText(state.t)+'：P 点地方时 '+G.timeText(lt)+'，'+phase+'。';
}
function updateTime(t){
 state.t=G.mod(Math.round(t*2)/2,24);
 Site.setRange($('bj-time'),state.t,G.timeText(state.t));$('bj-output').textContent=G.timeText(state.t);
 timeReadout();updateHash();queuePaint();
}
function updateCoordinates(lon,lat,locate=true){
 state.lon=G.clamp(Math.round(lon),-180,180);state.lat=G.clamp(Math.round(lat),-90,90);
 const lt=G.longitudeText(state.lon),pt=G.latitudeText(state.lat),h=G.hemispheres(state.lon,state.lat);
 $('lon-readout').textContent=Math.abs(state.lat)===90?'汇聚':lt;$('lat-readout').textContent=pt;
 $('lon-output').textContent=lt;$('lat-output').textContent=pt;
 $('hemispheres').textContent=h.ns+' · '+h.ew;
 $('coordinate-description').textContent=G.description(state.lon,state.lat);
 Site.setRange($('longitude'),state.lon,lt);Site.setRange($('latitude'),state.lat,pt);
 $('lon-number').value=state.lon;$('lat-number').value=state.lat;
 stage.dataset.lon=state.lon;stage.dataset.lat=state.lat;
 timeReadout();updateHash();if(locate)pointToFront();else queuePaint();
 resetQuizFeedback();
}
function setDayNight(on){
 state.dn=on;$('daynight').setAttribute('aria-pressed',String(on));$('daynight-panel').hidden=!on;$('legend-night').hidden=!on;
 $('mode-hint').textContent=on?'亮面朝向太阳是白天，暗面是黑夜；虚线是晨昏线。':'橙色两线的交点，就是点 P。';
 if(on){stopSpin();state.viewLon=G.normLon(sunLon()+35);state.viewLat=12;}
 timeReadout();updateHash();queuePaint();resetQuizFeedback();
}
$('daynight').addEventListener('click',()=>setDayNight(!state.dn));
$('bj-time').addEventListener('input',e=>updateTime(Number(e.target.value)));
$('longitude').addEventListener('input',e=>updateCoordinates(Number(e.target.value),state.lat));
$('latitude').addEventListener('input',e=>updateCoordinates(state.lon,Number(e.target.value)));
$('coordinate-form').addEventListener('submit',e=>{e.preventDefault();if(e.target.reportValidity())updateCoordinates(Number($('lon-number').value),Number($('lat-number').value));});
for(const b of document.querySelectorAll('[data-lon]'))b.addEventListener('click',()=>updateCoordinates(Number(b.dataset.lon),Number(b.dataset.lat)));
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>{
 state.mode=b.dataset.mode;
 for(const o of document.querySelectorAll('[data-mode]')){o.classList.toggle('selected',o===b);o.setAttribute('aria-pressed',String(o===b));}
 $('legend-reference').textContent=state.mode==='meridians'?'本初子午线':state.mode==='parallels'?'赤道':'赤道 / 本初子午线';
 if(!state.dn)$('mode-hint').textContent=state.mode==='meridians'?'经线连接南北两极。旋转地球，观察它们如何汇聚。':state.mode==='parallels'?'纬线平行于赤道。离赤道越远，纬线圈越小。':'橙色两线的交点，就是点 P。';
 queuePaint();
});
let drag=null;
stage.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.isPrimary===false)return;stopSpin();drag={id:e.pointerId,x:e.clientX,start:e.clientX,moved:false};try{stage.setPointerCapture(e.pointerId);}catch(err){}});
stage.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const dx=e.clientX-drag.x;if(Math.abs(e.clientX-drag.start)>5){drag.moved=true;stage.classList.add('is-dragging');}
 if(drag.moved){state.viewLon=G.normLon(state.viewLon-dx*300/stage.clientWidth);queuePaint();}drag.x=e.clientX;
});
function endDrag(){drag=null;stage.classList.remove('is-dragging');}
stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);stage.addEventListener('lostpointercapture',endDrag);
stage.addEventListener('keydown',e=>{
 if(e.target!==stage)return;
 if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();stopSpin();state.viewLon=G.normLon(state.viewLon+(e.key==='ArrowRight'?10:-10));queuePaint();}
 if(e.key==='Home'){e.preventDefault();pointToFront();}
});
$('locate').addEventListener('click',pointToFront);$('reset-view').addEventListener('click',pointToFront);
// 自动旋转：地球自西向东转，表面向画面右侧移动。开昼夜时按“1 秒 = 1 小时”推进北京时间。
let frame=0,last=0,visible=true;
function stopSpin(){state.spinning=false;$('spin').textContent='自动旋转';$('spin').setAttribute('aria-pressed','false');cancelAnimationFrame(frame);frame=0;last=0;}
function tick(time){
 if(!state.spinning||!visible||document.hidden){frame=0;last=0;return;}
 const dt=last?Math.min((time-last)/1000,.05):0;last=time;
 if(state.dn){state.t=G.mod(state.t+dt,24);state.viewLon=G.normLon(state.viewLon-15*dt);
  Site.setRange($('bj-time'),Math.round(state.t*2)/2,G.timeText(state.t));$('bj-output').textContent=G.timeText(state.t);timeReadout();}
 else state.viewLon=G.normLon(state.viewLon-12*dt);
 queuePaint();frame=requestAnimationFrame(tick);
}
function resume(){if(state.spinning&&visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);}
$('spin').addEventListener('click',()=>{if(state.spinning){stopSpin();if(state.dn){state.t=Math.round(state.t*2)/2;updateTime(state.t);}return;}state.spinning=true;$('spin').textContent='暂停旋转';$('spin').setAttribute('aria-pressed','true');resume();});
if('IntersectionObserver' in window)new IntersectionObserver(e=>{visible=e[0].isIntersecting;resume();}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)resume();});
if(reduce.addEventListener)reduce.addEventListener('change',e=>{if(e.matches)stopSpin();});
document.addEventListener('geo:share-open',()=>{if(state.spinning){stopSpin();if(state.dn)updateTime(state.t);}});
// 练习
const questions=[
 {title:'找到赤道上的一个点',desc:'经度可以任意选，想一想：纬度应该是多少？',check:()=>state.lat===0,yes:'找到了！赤道就是 0° 纬线，赤道上的所有点纬度都为 0°。',no:'还不在赤道上。把纬度调到 0°，再检查一次。'},
 {title:'找到 120°E、30°N',desc:'先调经度，再调纬度。东经与北纬在精确输入时都使用正数。',check:()=>state.lon===120&&state.lat===30,yes:'正确！这两条经纬线只在球面上的这个位置相交。',no:'目标是东经 120°、北纬 30°。可以使用「精确输入坐标」。'},
 {title:'找一个在东半球的西经点',desc:'保持北纬 30°，选择一个西经点，并让它位于东半球内部（不选分界线）。',check:()=>state.lon<0&&state.lon>-20&&state.lat===30,yes:'正确！例如 10°W 位于 20°W 以东，属于东半球。西经不一定在西半球。',no:'提示：纬度调到 30°N，经度在 20°W 与 0° 之间，且不选两个端点。'},
 {title:'让 P 点进入黑夜',desc:'打开「昼夜」，保持 P 点不动，只拖动北京时间滑块，让 P 点落在夜半球。',check:()=>state.dn&&G.sunDot(state.lon,state.lat,sunLon(),0)<0,yes:'对了！地球自转让 P 点转进背向太阳的一侧，这就是昼夜交替。',no:'先点「昼夜」按钮，再把北京时间调到傍晚以后或凌晨。'}
];
let qi=0,passed=false;
function resetQuizFeedback(){if(passed){passed=false;$('quiz-feedback').textContent='状态已改变，可以重新检查。';$('quiz-feedback').className='';$('next-question').hidden=true;}}
$('check-answer').addEventListener('click',()=>{const q=questions[qi];passed=q.check();$('quiz-feedback').textContent=passed?q.yes:q.no;$('quiz-feedback').className=passed?'success':'retry';$('next-question').hidden=!passed;$('next-question').textContent=qi===questions.length-1?'完成，再练一次':'下一题';});
$('next-question').addEventListener('click',()=>{qi=(qi+1)%questions.length;passed=false;const q=questions[qi];$('quiz-title').textContent=q.title;$('quiz-description').textContent=q.desc;$('quiz-step').textContent=(qi+1)+' / '+questions.length;$('quiz-feedback').textContent='';$('quiz-feedback').className='';$('next-question').hidden=true;});
$('go-controls').addEventListener('click',()=>{document.querySelector('.controls').scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'center'});$('longitude').focus({preventScroll:true});});
window.addEventListener('hashchange',()=>{const p=G.parseCoordinates(location.hash);if(p&&(p.lon!==state.lon||p.lat!==state.lat))updateCoordinates(p.lon,p.lat);});
updateCoordinates(state.lon,state.lat,false);
if(state.dn){const t=state.t;setDayNight(true);updateTime(t);}else{Site.setRange($('bj-time'),state.t,G.timeText(state.t));}
paint();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'赤道的纬度是多少？',desc:'它是南北半球的分界线。',options:['0°','90°','180°','23.5°'],answer:0,hint:'纬度的起点。',explain:'赤道是 <b>0° 纬线</b>，也是最长的纬线。纬度最大到 90°（南北极点）。'},
 {level:'base',title:'经线指示什么方向？',desc:'经线连接南北两极。',options:['南北方向','东西方向','西北方向','随位置而变'],answer:0,hint:'它从北极连到南极。',explain:'经线指示<b>南北</b>，纬线指示<b>东西</b>。这组对应最容易记反。'},
 {level:'base',title:'地球自转一周大约多久？',desc:'自转产生昼夜交替。',options:['24 小时','365 天','12 小时','30 天'],answer:0,hint:'一天的长度。',explain:'自转约 <b>24 小时</b>（一天）→ 昼夜交替；公转约 365 天（一年）→ 四季更替。'},
 {level:'mid',title:'东西半球的分界线是？',desc:'不是 0° 和 180°。',options:['20°W 和 160°E','0° 和 180°','赤道','南北回归线'],answer:0,hint:'为了不把一个大洲劈成两半。',explain:'以 <b>20°W 和 160°E</b> 划分，避免把非洲、欧洲分到两个半球。用 0° 和 180° 是最经典的错误。'},
 {level:'mid',title:'所有经线的长度有什么特点？',desc:'想想经线是什么形状。',options:['都相等','赤道上的最长','越靠两极越长','没有规律'],answer:0,hint:'每条经线都是半圆。',explain:'所有经线<b>等长</b>；纬线则<b>赤道最长</b>、向两极变短，到极点成为一点。'},
 {level:'mid',title:'某地位于 40°N、116°E，在哪个半球？',desc:'分别判断南北和东西。',options:['北半球、东半球','北半球、西半球','南半球、东半球','南半球、西半球'],answer:0,hint:'N 是北纬；东西半球要和 20°W、160°E 比。',explain:'N → <b>北半球</b>；116°E 在 20°W 以东、160°E 以西 → <b>东半球</b>。这是北京的大致位置。'},
 {level:'mid',title:'为什么东边的城市先迎来日出？',desc:'和自转方向有关。',options:['地球自西向东自转','地球自东向西自转','东边海拔高','东边离太阳近'],answer:0,hint:'谁先转到向阳面？',explain:'地球<b>自西向东</b>自转，东边先转到向阳侧，所以<b>东早西晚</b>。深圳比乌鲁木齐早见日出。'},
 {level:'trap',title:'纬度越高，纬线越长还是越短？',desc:'上面转动地球看纬线圈的变化。',options:['越短，极点缩成一个点','越长','不变','先长后短'],answer:0,hint:'赤道最长，往两极怎么变？',explain:'纬度越高纬线<b>越短</b>，极点处缩成一点。注意<b>经线才都一样长</b>——这个差别年年考。'}
]);
