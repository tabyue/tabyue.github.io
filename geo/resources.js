/* 第 14 课：中国的自然资源 */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const m=/^(area|type)$/.exec(new URLSearchParams(location.hash.replace(/^#/,'')).get('sort')||'');
const state={sort:m?m[1]:'area'};

/* ---------- 水土矛盾 ---------- */
function drawMismatch(){
 const W=G.WATER_LAND;
 let s=R(0,0,420,210,'#f6f8f2',12);
 const rows=[
  {y:44,label:'水资源',a:W.waterS,at:'南方 '+W.waterS+'%',b:W.waterN,bt:'北方 '+W.waterN+'%',ca:'#5f97ae',cb:'#c58a4f'},
  {y:120,label:'耕地',a:W.landS,at:'南方 '+W.landS+'%',b:W.landN,bt:'北方 '+W.landN+'%',ca:'#8fae8a',cb:'#c9b382'}];
 const x0=110,x1=406;
 for(const r of rows){
  s+=T(100,r.y+22,r.label,14,'#203b35',700,'end');
  const wA=(x1-x0)*r.a/100,wB=(x1-x0)*r.b/100;
  // 南方条
  s+=R(x0,r.y,wA,32,r.ca,6);
  s+=T(x0+wA/2,r.y+21,r.at,13,'#fff',700,'middle');
  // 北方条（错开下一行）
  s+=R(x0,r.y+40,wB,32,r.cb,6);
  s+=T(x0+wB/2,r.y+61,r.bt,13,'#fff',700,'middle');
 }
 // 矛盾箭头：水从南调往北
 s+='<defs><marker id="wa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#5f97ae"/></marker></defs>';
 s+=L(390,60,390,140,'#5f97ae',2.4,'marker-end="url(#wa)"');
 s+=T(384,104,'调水',12,'#5f97ae',700,'end','paint-order="stroke" stroke="#f6f8f2" stroke-width="3"');
 s+=T(110,18,'南方水多、地少 · 北方地多、水少',12.5,'#7a4520',700);
 $('mismatch').innerHTML=s;
}

/* ---------- 人均对比 ---------- */
$('pc-rows').innerHTML=G.PER_CAPITA.map(p=>'<div class="dev-row"><span>'+p.k+'</span><div class="pair"><div><div class="trk"><div class="fl" data-w="'+Math.min(100,p.cn/p.world*100)+'"></div></div><b>中国 '+p.cn+'</b></div><div><div class="trk"><div class="fl alt" data-w="100"></div></div><b>世界平均 '+p.world+'</b></div></div></div>').join('');
requestAnimationFrame(()=>setTimeout(()=>{for(const el of document.querySelectorAll('#pc-rows .fl'))el.style.width=el.dataset.w+'%';},80));

/* ---------- 土地构成 ---------- */
function drawLand(){
 const colors={耕地:'#c9b382',园地:'#a8c07a',林地:'#7fae6b',草地:'#d3c98e',湿地:'#7fb3c4','城镇村及工矿用地':'#b0a494'};
 let data=G.LAND_TYPES.slice();
 if(state.sort==='type'){const order=['耕地','园地','林地','草地','湿地','城镇村及工矿用地'];data=order.map(k=>G.LAND_TYPES.find(d=>d[0]===k));}
 else data.sort((a,b)=>b[1]-a[1]);
 let s=R(0,0,420,200,'#f6f8f2',12);
 // 右边留出数值标签的位置；按类型排序时第一项不一定最大，所以用真正的最大值
 const x0=118,x1=340,y0=12,rowH=30;
 const max=Math.max.apply(null,data.map(d=>d[1]));
 data.forEach(([name,v],i)=>{
  const y=y0+i*rowH,w=(x1-x0)*v/max;
  s+=T(x0-8,y+16,name,11.5,'#40594b',500,'end');
  s+=R(x0,y+4,w,18,colors[name]||'#b0a494',4);
  s+=T(x0+w+6,y+17,v+' 亿亩',11.5,'#5d6f63',600);
 });
 $('land-bars').innerHTML=s;
}
$('land-chips').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 state.sort=b.dataset.k;Site.pressed($('land-chips'),b);drawLand();
 Site.replaceHash('sort='+state.sort);
});
for(const b of $('land-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.k===state.sort));

/* ---------- 可再生分类 ---------- */
const resOrder=shuffle(G.RES_CLASSIFY).slice(0,8);
$('res-list').innerHTML=resOrder.map(r=>'<div class="choice-row"><b>'+r[0]+'</b><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start"><button data-v="re">可再生</button><button data-v="non">非可再生</button></div><p class="verdict" hidden></p></div>').join('');
let rd=0,rr=0;
for(const row of $('res-list').querySelectorAll('.choice-row')){
 const name=row.querySelector('b').textContent,ans=resOrder.find(r=>r[0]===name)[1];
 for(const b of row.querySelectorAll('.chips button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';rd++;
  const ok=b.dataset.v===ans;if(ok)rr++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;
  v.textContent=ok?'✓ 正确。':'✗ '+name+'属于'+(ans==='re'?'可再生资源（但也经不起破坏和过度使用）':'非可再生资源，用一点就少一点');
  $('res-score').textContent=rd===resOrder.length?'答对 '+rr+' / '+resOrder.length:'已完成 '+rd+' / '+resOrder.length;
 });
}

/* ---------- 电力装机构成 ---------- */
function drawPower(){
 const data=G.POWER_2025,total=data.reduce((a,b)=>a+b.v,0);
 const x0=28,x1=392,y=64,h=44;
 let s=R(0,0,420,170,'#f6f8f2',12);
 let x=x0;
 data.forEach(d=>{
  const w=(x1-x0)*d.v/total;
  s+=R(x,y,w,h,d.color,0);
  const label=d.v+' 亿';
  s+=T(x+w/2,y+26,d.k,11.5,'#fff',700,'middle');
  s+=T(x+w/2,y+41,label,10.5,'#fff',500,'middle');
  x+=w;
 });
 s+=T(x0,40,'2025 年底全国发电装机 '+(total/10).toFixed(1)+' 亿千瓦（约数）',12.5,'#203b35',700);
 s+=T(x0,y+h+22,'风电 + 太阳能 = 18.4 亿千瓦，占比 47.3%，首次超过火电',12,'#b0663a',600);
 s+=T(x0,y+h+44,'全年风光发电量占总发电量 22%，每 10 度电约 4 度是绿电',11.5,'#6f8268');
 $('power').innerHTML=s;
}
drawPower();

/* ---------- 练习 ---------- */
const qs=[
 {title:'我国自然资源的基本国情是——',opts:[['a','总量丰富，人均不足'],['b','总量和人均都丰富'],['c','总量少，人均多']],answer:'a',yes:'正确！"地大物博"是真的，但除以 14 亿人口，人均耕地、人均水资源都远低于世界平均。',no:'想想：总量大，平均到每个人头上呢？'},
 {title:'缓解北方水资源短缺的跨流域调水工程是——',opts:[['a','南水北调'],['b','西气东输'],['c','北煤南运']],answer:'a',yes:'对！东、中线一期累计调水超 830 亿立方米，惠及 1.95 亿人。',no:'西气东输输的是天然气，北煤南运运的是煤。'},
 {title:'下列全部属于非可再生资源的是——',opts:[['a','煤炭、石油、铁矿'],['b','土地、水、森林'],['c','阳光、风、鱼虾']],answer:'a',yes:'正确！矿产资源的形成需要漫长的地质年代，用一点就少一点。',no:'B、C 里的都是可再生资源。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();
drawMismatch();drawLand();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'下列属于非可再生资源的是？',desc:'用一点就少一点。',options:['煤炭','太阳能','森林','水资源'],answer:0,hint:'它形成需要上亿年。',explain:'<b>煤炭</b>属于非可再生资源（矿产资源都是）。太阳能、森林、水在短时间内可以更新，属可再生资源。'},
 {level:'base',title:'我国资源国情可以概括为？',desc:'课本上的经典表述。',options:['总量丰富，人均不足','总量不足，人均丰富','总量和人均都丰富','总量和人均都不足'],answer:0,hint:'我国人口基数大。',explain:'<b>总量丰富、人均不足</b>。因为人口众多，总量再大除以 14 亿也变得紧张，所以必须节约资源。'},
 {level:'base',title:'我国水资源空间分布的特点是？',desc:'看南北和东西。',options:['南多北少、东多西少','北多南少','西多东少','分布均匀'],answer:0,hint:'想想降水的分布。',explain:'<b>南多北少、东多西少</b>，与降水分布一致。华北是我国缺水最严重的地区。'},
 {level:'mid',title:'解决水资源空间分布不均的主要措施是？',desc:'把水从多的地方调到少的地方。',options:['跨流域调水','修建水库','节约用水','海水淡化'],answer:0,hint:'南水北调属于哪一类？',explain:'<b>跨流域调水</b>（如南水北调）解决<b>空间</b>不均；<b>修建水库</b>解决<b>时间</b>（季节）不均。两者针对的问题不同，别答反。'},
 {level:'mid',title:'南水北调工程是把哪条河的水调往北方？',desc:'我国水量最大的河流。',options:['长江','黄河','珠江','黑龙江'],answer:0,hint:'它在南方且水量丰富。',explain:'把<b>长江</b>流域的水调往缺水的华北和西北，分东、中、西三条线路。'},
 {level:'mid',title:'我国土地资源的突出问题是？',desc:'从构成比例想。',options:['耕地比重小、后备耕地不足','林地过多','草地过多','土地总量太少'],answer:0,hint:'山地多、平原少意味着什么？',explain:'我国<b>耕地和林地比重小、难利用土地多、后备耕地不足</b>，加上人口多，人均耕地少，所以要「切实保护耕地」。'},
 {level:'mid',title:'下列做法中有利于节约水资源的是？',desc:'从生活细节想。',options:['使用节水器具、一水多用','用流水洗车','大水漫灌农田','随意排放污水'],answer:0,hint:'哪种做法减少了浪费？',explain:'<b>节水器具、一水多用、农业改用喷灌滴灌</b>都能节水。大水漫灌浪费严重，污水排放则会造成<b>水质型缺水</b>。'},
 {level:'trap',title:'华北地区缺水严重，主要原因有哪些？',desc:'既有自然原因也有人为原因。',options:['降水少且集中，人口城市密集、工农业用水量大','只是因为降水少','只是因为人口多','因为河流太短'],answer:0,hint:'缺水 = 供给少 + 需求大。',explain:'<b>自然</b>：降水少、季节变化大、径流量小；<b>人为</b>：人口与城市密集、工农业发达用水量大、浪费与污染严重。分析缺水原因要<b>自然和人为两方面都答</b>，只写一边要扣分。'}
]);
