/* 第 11 课：海陆变迁与板块运动 */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R,arrow:A}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const TYPES=[{id:'converge',name:'消亡边界（挤压）'},{id:'diverge',name:'生长边界（张裂）'}];
const CASES={converge:'喜马拉雅山脉：亚欧板块与印度洋板块碰撞挤压，古地中海消失成山，现在仍在缓慢抬升。大洋板块俯冲到大陆板块之下的地方，还会形成海沟与岛弧（如日本列岛东侧的日本海沟）。',
 diverge:'红海：非洲板块与印度洋板块张裂，红海每年加宽几厘米，几千万年后可能成为新的大洋。大西洋中脊也是生长边界，岩浆上涌形成海底山岭，海底岩石向两侧不断扩展。'};
const m=/^(converge|diverge)$/.exec(new URLSearchParams(location.hash.replace(/^#/,'')).get('b')||'');
const state={type:m?m[1]:'converge',t:1};

/* ---------- 剖面动画 ---------- */
function draw(){
 const W=420,H=240,base=178,sea=base-40;
 const h=G.plateProfile(state.type,state.t);
 const n=h.length,step=W/(n-1);
 const pts=h.map((v,i)=>[i*step,base-v*(v>0?1.15:0.85)]);
 let s=R(0,0,W,H,'#f6f8f2',12);
 const isC=state.type==='converge',flooded=!isC&&state.t>1.15;
 if(isC||flooded)s+=R(0,sea,W,H-sea,'#c8dde4');
 s+=P('M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ')+'L'+W+' '+base+'L0 '+base+'Z','#c9b382',1.5,'#dcc9a0');
 if(state.type==='converge'&&state.t>0.3){
  const amp=Math.min(1,(state.t-0.3)/0.7)*6;
  for(let k=0;k<3;k++){
   const off=base-8-k*7,fold=[];
   for(let i=0;i<n;i++){const x=i*step;fold.push([x,off-amp*Math.sin((x-W/2)/26+k)*Math.exp(-Math.abs(x-W/2)/90)]);}
   s+=P('M'+fold.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' '),'none',1,'#a98f5f');
  }
 }
 s+='<defs>'+A('pa','#8a6a2c')+'</defs>';
 const mid=W/2,ay=62;
 if(state.type==='converge'){
  const pull=Math.max(0,state.t)*24;
  s+=L(58+pull,ay,mid-46,ay,'#7a4520',3,'marker-end="url(#pa)"');
  s+=L(W-58-pull,ay,mid+46,ay,'#7a4520',3,'marker-end="url(#pa)"');
  s+=T(mid,ay-12,'板块相互挤压',12.5,'#7a4520',700,'middle');
 }else{
  const pull=Math.max(0,state.t)*28;
  s+=L(mid-44-pull,ay,52,ay,'#2f6377',3,'marker-end="url(#pa)"');
  s+=L(mid+44+pull,ay,W-52,ay,'#2f6377',3,'marker-end="url(#pa)"');
  s+=T(mid,ay-12,'板块相互张裂',12.5,'#2f6377',700,'middle');
 }
 if(!isC){
  s+=L(0,sea,W,sea,'#7fa8b8',1.6,'stroke-dasharray="6 4"');
  s+=T(W-8,sea-8,flooded?'海水涌入：裂谷 → 新海洋':'裂谷：仍在陆地上',12,'#2f6377',600,'end');
 }
 const maxH=Math.max(...h),minH=Math.min(...h);
 if(isC&&maxH>4){
  const i=h.indexOf(maxH);
  s+=T(pts[i][0],pts[i][1]-10,'隆起约 '+Math.round(maxH/38*8848)+' 米（对照珠峰）',12,'#7a4520',700,'middle','paint-order="stroke" stroke="#f5f6f0" stroke-width="3"');
 }else if(!isC&&minH<-4){
  const i=h.indexOf(minH);
  s+=T(pts[i][0],Math.min(pts[i][1]+22,H-14),'下陷 '+Math.round(-minH*100)+' 米（示意）',12,'#2f6377',700,'middle','paint-order="stroke" stroke="#f5f6f0" stroke-width="3"');
 }
 $('section').innerHTML=s;
 $('bound-title').textContent=isC?'消亡边界（碰撞挤压）':'生长边界（张裂）';
 $('bound-badge').textContent=isC?'山脉 / 海沟':'裂谷 / 新海洋';
 const phase=state.t<-0.94?(isC?'远古：两块板块中间隔着海洋':'远古：两侧大陆连为一体')
  :state.t<=1?(isC?'挤压中：海底沉积层褶皱隆起，山脉越来越高':'张裂中：裂谷越来越宽、越来越深')
  :(isC?'未来：山脉继续升高——今天的喜马拉雅山就是这样形成的':'未来：裂谷加宽、海水涌入，成为新海洋——红海正在经历这一步');
 $('bound-text').textContent=phase;
 $('bound-case').textContent=CASES[state.type];
 const eraText=Math.abs(state.t-1)<0.06?'现在':state.t<1?'约 '+Math.round(6500*(1-state.t)/2/50)*50+' 万年前':'约 '+Math.round(5000*(state.t-1)/50)*50+' 万年后';
 $('era-out').textContent=eraText;
}
$('type-chips').innerHTML=TYPES.map(t=>'<button data-t="'+t.id+'">'+t.name+'</button>').join('');
for(const b of $('type-chips').querySelectorAll('button'))b.addEventListener('click',()=>{
 state.type=b.dataset.t;state.t=1;$('era').value=1;
 Site.pressed($('type-chips'),b);draw();
 Site.replaceHash('b='+state.type);
});
$('era').addEventListener('input',e=>{state.t=Number(e.target.value);draw();});
$('era').addEventListener('change',()=>Site.replaceHash('b='+state.type));

/* ---------- 六大板块 ---------- */
$('plate-list').innerHTML=G.PLATES.map((p,i)=>'<li><b>'+(i+1)+'. '+p.name+'</b><span>'+p.note+'</span></li>').join('');

/* ---------- 海陆变迁证据 ---------- */
$('drift-list').innerHTML=G.DRIFT_EVIDENCE.map((e,i)=>'<div class="choice-row" data-e="'+i+'"><b>'+e.q+'</b><p class="verdict" hidden>▸ '+e.a+'</p><button class="ghost" data-btn>看解释</button></div>').join('');
for(const row of $('drift-list').querySelectorAll('.choice-row')){
 row.querySelector('[data-btn]').addEventListener('click',()=>{
  const v=row.querySelector('.verdict'),open=v.hidden===false;v.hidden=open;
  row.querySelector('[data-btn]').textContent=open?'看解释':'收起';
 });
}

/* ---------- 挤压 / 张裂判断 ---------- */
const pick=shuffle(G.BOUNDARY_CASES).slice(0,6);
$('bound-list').innerHTML=pick.map(c=>'<div class="choice-row"><b>'+c.name+'</b><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start"><button data-v="converge">挤压（消亡边界）</button><button data-v="diverge">张裂（生长边界）</button></div><p class="verdict" hidden></p></div>').join('');
let bd=0,br=0;
for(const row of $('bound-list').querySelectorAll('.choice-row')){
 const item=pick.find(c=>c.name===row.querySelector('b').textContent);
 for(const b of row.querySelectorAll('.chips button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';bd++;
  const ok=b.dataset.v===item.type;if(ok)br++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+item.why;
  $('bound-score').textContent=bd===pick.length?'答对 '+br+' / '+pick.length+'。'+(br===pick.length?'全对！':'红色选项是正确答案。'):'已完成 '+bd+' / '+pick.length;
 });
}

/* ---------- 练习 ---------- */
const qs=[
 {title:'喜马拉雅山脉是由哪两类板块的运动形成的？',opts:[['a','碰撞挤压'],['b','张裂'],['c','平移错动']],answer:'a',yes:'正确！亚欧板块与印度洋板块碰撞挤压，使古地中海消失、海底抬升成世界最高山脉。',no:'再拖一下上面的"挤压"时间轴看看。'},
 {title:'红海在慢慢变宽，是因为它处在——',opts:[['a','消亡边界（挤压）'],['b','生长边界（张裂）'],['c','板块内部']],answer:'b',yes:'对！非洲板块与印度洋板块张裂，红海可能成为未来的大洋。',no:'提示：变宽 = 两边在分开。'},
 {title:'下列最能证明"海陆变迁"的证据是——',opts:[['a','喜马拉雅山上发现海洋生物化石'],['b','沙漠里有仙人掌'],['c','冬天湖水结冰']],answer:'a',yes:'正确！山上发现海洋化石，说明这里曾经是海洋。',no:'想想哪种现象说明"这里以前不是陆地（或海洋）"。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();
if(m){for(const b of $('type-chips').querySelectorAll('button'))if(b.dataset.t===m[1]){Site.pressed($('type-chips'),b);break;}}
draw();
})();
