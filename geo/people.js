/* 第 12 课：世界的居民与文化 */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const mB=Number(new URLSearchParams(location.hash.replace(/^#/,'')).get('b'));
const mD=Number(new URLSearchParams(location.hash.replace(/^#/,'')).get('d'));
const state={birth:Number.isFinite(mB)&&mB>=1&&mB<=50?mB:10.2,death:Number.isFinite(mD)&&mD>=1&&mD<=50?mD:7.3};

/* ---------- 人口曲线 ---------- */
function drawPop(){
 const W=420,H=230,x0=52,x1=406,y0=192,y1=26;
 const hist=G.POP_HISTORY;
 const yrs=hist.map(h=>h[0]),pops=hist.map(h=>h[1]);
 const yMin=0,yMax=110;
 const x=v=>x0+(v-yrs[0])/(yrs[yrs.length-1]-yrs[0])*(x1-x0);
 const y=v=>y0-(v-yMin)/(yMax-yMin)*(y0-y1);
 let s=R(0,0,W,H,'#f6f8f2',12);
 // 网格与纵轴
 for(const v of [0,25,50,75,100]){
  s+=L(x0,y(v),x1,y(v),'#e4e9de',1);
  s+=T(x0-6,y(v)+4,v===0?'0':v,11.5,'#6f8268',400,'end');
 }
 s+=T(x0-6,y1-6,'人口/亿',12,'#6f8268',400,'start');
 // 关键年份横轴
 const marks=[[1650,'1650'],[1830,'1830'],[1930,'1930'],[1974,'1974'],[2011,'2011'],[2084,'2084·峰值']];
 for(const [v,t] of marks){
  s+=L(x(v),y0,x(v),y0+4,'#9eb097',1);
  s+=T(v===2084?x1+11:x(v),y0+18,t,11,'#6f8268',400,v===2084?'end':'middle');
 }
 // 历史曲线（绿色实线到 2025）与预测（虚线）
 const past=hist.filter(h=>h[0]<=2025),future=hist.filter(h=>h[0]>=2025);
 s+=P('M'+past.map(h=>x(h[0]).toFixed(1)+' '+y(h[1]).toFixed(1)).join(' '),'#3d7391',2.8);
 s+=P('M'+future.map(h=>x(h[0]).toFixed(1)+' '+y(h[1]).toFixed(1)).join(' '),'#a98f5f',2.4,'none','stroke-dasharray="8 5"');
 // 关键点标注
 const dots=[[1830,10,'10 亿'],[1930,20,'20 亿'],[1974,40,'40 亿'],[2022,80,'80 亿']];
 for(const [yr,p,label] of dots){
  s+=C(x(yr),y(p),3.2,'#4f8197','#fff',1.4);
  s+=T(x(yr),y(p)-9,label,11.5,'#2f6377',700,'middle','paint-order="stroke" stroke="#f5f6f0" stroke-width="3"');
 }
 // 2084 峰值
 s+=C(x(2084),y(103),3.4,'#b0663a','#fff',1.4);
 s+=T(x(2084)-8,y(103)-12,'约 103 亿',12.5,'#b0663a',700,'end','paint-order="stroke" stroke="#f5f6f0" stroke-width="3"');
 s+=T(x0+6,y1+6,'人口每增加 10 亿所用的时间越来越短',11.5,'#8b9784');
 $('pop').innerHTML=s;
}

/* ---------- 自然增长率 ---------- */
function drawGrowth(){
 const g=state.birth-state.death;
 $('birth-out').textContent=state.birth.toFixed(1)+' ‰';
 $('death-out').textContent=state.death.toFixed(1)+' ‰';
 $('growth-out').textContent=(g>=0?'+':'')+g.toFixed(1)+'‰';
 $('growth-badge').textContent=g>5?'增长较快':g>0.5?'缓慢增长':g>-0.5?'基本持平':'负增长';
 $('growth-badge').style.background=g>0.5?'#eaf3e6':g<-0.5?'#fbeee2':'#eef2e8';
 let note;
 if(g>20)note='自然增长率超过 20‰——像尼日尔等少数国家，人口快速增长。';
 else if(g>5)note='增长较快：多见于非洲和南亚部分发展中国家。';
 else if(g>0.5)note='缓慢增长：目前世界平均约 2.9‰（2025 年前后），中国已降到 0 附近。';
 else if(g>-0.5)note='基本持平：出生与死亡接近平衡。';
 else note='负增长：日本、意大利、德国等发达国家和现在的中国都在经历，人口会逐渐减少。';
 $('growth-note').textContent=note;
 Site.replaceHash('b='+state.birth.toFixed(1)+'&d='+state.death.toFixed(1));
}
for(const id of ['birth','death'])$(id).addEventListener('input',e=>{
 state[id==='birth'?'birth':'death']=Number(e.target.value);drawGrowth();
});

/* ---------- 列表 ---------- */
$('pop-top').innerHTML=G.WORLD_POP.top.map(([n,p])=>'<li><b>'+n+'</b><span>'+p+' 亿人</span></li>').join('');
$('dense-list').innerHTML=G.POP_DENSE.map(([n,w])=>'<li><b>'+n+'</b><span>'+w+'</span></li>').join('');
$('sparse-list').innerHTML=G.POP_SPARSE.map(([n,w])=>'<li><b>'+n+'</b><span>'+w+'</span></li>').join('');
$('race-list').innerHTML=G.RACES.map(r=>'<li><b>'+r.name+'</b><span>'+r.skin+'，'+r.hair+'。主要分布：'+r.dist+'。</span></li>').join('');
$('lang-list').innerHTML=G.LANGUAGES.map(([n,d])=>'<li><b>'+n+'</b><span>'+d+'</span></li>').join('');
$('rel-list').innerHTML=G.RELIGIONS.map(r=>'<li><b>'+r.name+'</b><span>起源：'+r.origin+'；主要分布：'+r.dist+'；'+r.followers+'。</span></li>').join('');
$('dev-list').textContent=G.DEV_EXAMPLES.dev.join('、')+' 等';
$('deving-list').textContent=G.DEV_EXAMPLES.deving.join('、')+' 等';

/* ---------- 发展差异对比条 ---------- */
$('dev-rows').innerHTML=G.DEV_COMPARE.map(c=>'<div class="dev-row"><span>'+c.k+'</span><div class="pair"><div><div class="trk"><div class="fl" data-w="'+c.dv+'"></div></div><b>'+c.dev+'</b></div><div><div class="trk"><div class="fl alt" data-w="'+c.dv2+'"></div></div><b>'+c.deving+'</b></div></div></div>').join('');
requestAnimationFrame(()=>{setTimeout(()=>{
 for(const el of document.querySelectorAll('#dev-rows .fl'))el.style.width=el.dataset.w+'%';
},80);});

/* ---------- 练习 ---------- */
const qs=[
 {title:'人口自然增长率的计算公式是——',opts:[['a','出生率 − 死亡率'],['b','出生率 + 死亡率'],['c','出生人口 − 死亡人口']],answer:'a',yes:'正确！自然增长率 = 出生率 − 死亡率（千分率）。',no:'拖一下上面的出生率、死亡率滑块，看读数怎么变。'},
 {title:'2025 年世界人口约 82.3 亿，预计何时达到约 103 亿的峰值？',opts:[['a','2084 年前后'],['b','2030 年前后'],['c','永远不会达到峰值']],answer:'a',yes:'对！联合国预测 2084 年前后达峰，随后进入长期下降。',no:'看曲线上最后一个棕色的点。'},
 {title:'"南北对话"中的"南"和"北"分别指——',opts:[['a','南半球国家和北半球国家'],['b','发展中国家和发达国家'],['c','南方国家和北方国家']],answer:'b',yes:'正确！发展中国家多在南半球和北半球南部，发达国家多在北部，故称南北对话。',no:'提示：这不是地理方位，是发展水平的代称。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();
drawPop();drawGrowth();
})();
