(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const hm=h=>{const m=Math.round(h*60);return Math.floor(m/60)+':'+String(m%60).padStart(2,'0');};

/* ---------- 四至与时差 ---------- */
const E=G.EXTREMES;
$('extreme-table').innerHTML=[['最北端','约 '+E.north.lat+'°N',E.north.where],['最南端','约 '+E.south.lat+'°N',E.south.where],['最东端','约 '+E.east.lon+'°E',E.east.where],['最西端','约 '+E.west.lon+'°E',E.west.where]].map(r=>'<tr><td>'+r[0]+'</td><td style="white-space:nowrap">'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('');
const PLACES=[['最东端',E.east.lon,'#b97342'],['深圳',114,'#4f8197'],['最西端',E.west.lon,'#526f50']];
const bj=(local,lon)=>local-(lon-120)/15;
function drawSpan(){
 const local=Number($('local-rise').value);Site.setRange($('local-rise'),local,hm(local));$('rise-output').textContent=hm(local);
 const t0=3,t1=11,x0=30,x1=396,X=t=>x0+(t-t0)/(t1-t0)*(x1-x0);
 let s=R(0,0,420,210,'#f6f8f2',12)+T(x0,24,'北京时间',11.5,'#6f8268',600);
 for(let t=t0;t<=t1;t++){const x=X(t);s+=L(x,150,x,156,'#9eb097',1)+T(x,172,t+':00',11,'#6f8268',400,'middle');}
 s+=L(x0,150,x1,150,'#9eb097',1.2);
 PLACES.forEach(([n,lon,col],i)=>{const t=bj(local,lon),x=X(t),y=48+i*34;
  s+=L(x,y+8,x,150,col,1.2,'stroke-dasharray="3 3"')+C(x,y,7,'#f4c56b','#d99a3c',1)+T(x>250?x-12:x+12,y+4,n+'（约 '+lon+'°E）日出 '+hm(t),12,col,700,x>250?'end':'start');});
 const a=X(bj(local,E.east.lon)),b=X(bj(local,E.west.lon));
 s+=L(a,186,b,186,'#7a4520',1.6)+L(a,181,a,191,'#7a4520',1.6)+L(b,181,b,191,'#7a4520',1.6);
 const gap=G.sunriseGapMinutes(E.east.lon,E.west.lon);
 s+=T((a+b)/2,202,'相差约 '+Math.floor(gap/60)+' 小时 '+(gap%60)+' 分',12,'#7a4520',700,'middle');
 $('span').innerHTML=s;
 $('span-text').textContent='东西跨经度约 '+(E.east.lon-E.west.lon)+'°，每 15° 差 1 小时，所以东端比西端早约 '+Math.floor(gap/60)+' 小时 '+(gap%60)+' 分见到日出。南北跨纬度近 50°，南方已经春暖花开，北方可能还冰天雪地。';
}
$('local-rise').addEventListener('input',drawSpan);

/* ---------- 邻国速答 ---------- */
$('nb-land').textContent=G.LAND_NEIGHBORS.join('、')+'。';$('nb-sea').textContent=G.SEA_NEIGHBORS.join('、')+'。';
const POOL=[...G.LAND_NEIGHBORS.map(n=>[n,'land']),...G.SEA_NEIGHBORS.map(n=>[n,'sea']),...G.NOT_NEIGHBORS.map(n=>[n,'none'])];
let nbList=[],nbI=0,nbRight=0,nbDone=false;
const NB_TEXT={land:'陆上邻国',sea:'隔海相望',none:'既不接壤也不隔海相望'};
function nbStart(){nbList=shuffle(POOL).slice(0,10);nbI=0;nbRight=0;nbShow();}
function nbShow(){nbDone=false;const [n]=nbList[nbI];$('nb-name').textContent=n;$('nb-score').textContent=nbRight+' / '+nbI;$('nb-feedback').textContent='';$('nb-feedback').className='feedback';$('nb-next').hidden=true;for(const b of $('nb-options').querySelectorAll('button'))b.classList.remove('correct','wrong');}
for(const b of $('nb-options').querySelectorAll('button'))b.addEventListener('click',()=>{
 if(nbDone)return;nbDone=true;const [n,ans]=nbList[nbI],ok=b.dataset.v===ans;if(ok)nbRight++;
 b.classList.add(ok?'correct':'wrong');if(!ok)$('nb-options').querySelector('[data-v='+ans+']').classList.add('correct');
 $('nb-feedback').textContent=(ok?'✓ ':'✗ ')+n+'：'+NB_TEXT[ans]+'。';$('nb-feedback').className='feedback '+(ok?'success':'retry');
 $('nb-score').textContent=nbRight+' / '+(nbI+1);$('nb-next').hidden=false;$('nb-next').textContent=nbI===nbList.length-1?'再来 10 题（本轮答对 '+nbRight+' 题）':'下一个';
});
$('nb-next').addEventListener('click',()=>{if(nbI===nbList.length-1){nbStart();return;}nbI++;nbShow();});

/* ---------- 省级行政区闪卡与表 ---------- */
const PV=G.PROVINCES;
const state={mode:'abbr',type:'全部'};
let fc=null,fcRight=0,fcTotal=0;
function fcNext(){
 const pool=state.mode==='capital'?PV.filter(p=>p.type==='省'||p.type==='自治区'):PV.filter(p=>p.short!==p.abbr);
 const p=pool[Math.floor(Math.random()*pool.length)];
 const others=shuffle(pool.filter(x=>x!==p)).slice(0,3);
 fc={p,answered:false};
 $('fc-q').textContent=state.mode==='abbr'?p.abbr:p.full;
 $('fc-hint').textContent=state.mode==='abbr'?'这是哪个省级行政区的简称？':'它的行政中心是？';
 const opts=shuffle([p,...others]);
 $('fc-options').innerHTML=opts.map(o=>'<button data-v="'+o.full+'">'+(state.mode==='abbr'?o.short:o.capital)+'</button>').join('');
 $('fc-feedback').textContent='';$('fc-feedback').className='feedback';
 for(const b of $('fc-options').querySelectorAll('button'))b.addEventListener('click',()=>{
  if(fc.answered)return;fc.answered=true;fcTotal++;const ok=b.dataset.v===fc.p.full;if(ok)fcRight++;
  b.classList.add(ok?'correct':'wrong');if(!ok)$('fc-options').querySelector('[data-v="'+fc.p.full+'"]').classList.add('correct');
  $('fc-feedback').textContent=(ok?'✓ ':'✗ ')+fc.p.full+'：简称“'+fc.p.abbr+'”，行政中心'+fc.p.capital+'。';$('fc-feedback').className='feedback '+(ok?'success':'retry');
  $('fc-score').textContent='已答 '+fcTotal+' 题，答对 '+fcRight+' 题 · 1 秒后换下一题';
  setTimeout(fcNext,ok?900:1800);
 });
}
for(const b of $('fc-mode').querySelectorAll('button'))b.addEventListener('click',()=>{state.mode=b.dataset.mode;for(const o of $('fc-mode').querySelectorAll('button'))o.setAttribute('aria-pressed',String(o===b));fcNext();});
const TYPES=['全部','省','自治区','直辖市','特别行政区'];
$('type-chips').innerHTML=TYPES.map(t=>'<button data-t="'+t+'">'+t+(t==='全部'?' 34':' '+PV.filter(p=>p.type===t).length)+'</button>').join('');
function drawTable(){
 $('prov-table').innerHTML=PV.filter(p=>state.type==='全部'||p.type===state.type).map(p=>'<tr><td style="color:var(--ink)">'+p.full+'</td><td>'+p.abbr+'</td><td>'+p.capital+'</td></tr>').join('');
 for(const b of $('type-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.t===state.type));
}
for(const b of $('type-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.type=b.dataset.t;drawTable();});

/* ---------- 人口 ---------- */
const PO=G.POPULATION;
$('pop-stats').innerHTML=[['七普全国人口',(PO.census2020/1e4).toFixed(2)+'<small>亿</small>'],['2024 年末人口',(PO.end2024/1e4).toFixed(2)+'<small>亿</small>'],['城镇化率（2024）',(PO.urban2024/PO.end2024*100).toFixed(1)+'<small>%</small>'],['汉族占比（七普）',PO.han+'<small>%</small>']].map(([k,v])=>'<div class="stat"><span>'+k+'</span><strong>'+v+'</strong></div>').join('');
function growth(){
 const b=Number($('birth').value),d=Number($('death').value),g=G.naturalGrowth(b,d);
 Site.setRange($('birth'),b,b+'‰');Site.setRange($('death'),d,d+'‰');
 $('birth-out').textContent=b.toFixed(2)+'‰';$('death-out').textContent=d.toFixed(2)+'‰';
 $('growth-out').innerHTML=(g>0?'+':'')+g.toFixed(2).replace('-','−')+'<small>‰</small>';
 $('growth-text').textContent=g<0?'出生少于死亡，人口自然减少（负增长）。2024 年我国就是这样：出生率 6.77‰、死亡率 7.76‰。':g===0?'出生与死亡相当，人口自然增长为零。':'出生多于死亡，人口自然增长。';
}
for(const id of ['birth','death'])$(id).addEventListener('input',growth);
$('preset-2024').addEventListener('click',()=>{$('birth').value=PO.birth2024;$('death').value=PO.death2024;growth();});
$('preset-high').addEventListener('click',()=>{$('birth').value=35;$('death').value=20;growth();});

/* ---------- 民族 ---------- */
const maxE=G.ETHNIC_TOP[0][1];
$('eth-bars').innerHTML=G.ETHNIC_TOP.map(([n,v])=>'<div class="bar-item" style="grid-template-columns:58px 1fr 76px"><span>'+n+'</span><div class="track"><div class="fill" style="width:'+(v/maxE*100).toFixed(1)+'%"></div></div><em>'+(v/1e4).toFixed(0)+' 万</em></div>').join('');
const ETH=[...new Set(G.FESTIVALS.map(f=>f[1]))];
let fRight=0,fDone=0;
$('fest-list').innerHTML=G.FESTIVALS.map(([f,e],i)=>{const opts=shuffle([e,...shuffle(ETH.filter(x=>x!==e)).slice(0,2)]);return '<div class="choice-row" data-i="'+i+'"><div><p><b>'+f+'</b></p><p class="verdict" hidden></p></div><div class="chips small">'+opts.map(o=>'<button data-v="'+o+'">'+o+'</button>').join('')+'</div></div>';}).join('');
for(const row of $('fest-list').querySelectorAll('.choice-row')){
 const [f,e]=G.FESTIVALS[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';fDone++;const ok=b.dataset.v===e;if(ok)fRight++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+f+'是'+e+'的传统节日。';
  $('fest-score').textContent=fDone===G.FESTIVALS.length?'答对 '+fRight+' / '+G.FESTIVALS.length:'';
 });
}

/* ---------- 练习 ---------- */
const qs=[
 {title:'我国陆地面积约 960 万平方千米，居世界第几？',opts:[['a','第二'],['b','第三，仅次于俄罗斯和加拿大'],['c','第四']],answer:'b',yes:'正确！',no:'提示：比我国大的国家有两个。'},
 {title:'简称“黔”的省级行政区是？',opts:[['a','贵州省'],['b','广西壮族自治区'],['c','甘肃省']],answer:'a',yes:'对了！广西简称“桂”，甘肃简称“甘”或“陇”。',no:'提示：“黔”和“贵”是同一个省的两个简称。'},
 {title:'我国人口最多的少数民族是？',opts:[['a','回族'],['b','满族'],['c','壮族']],answer:'c',yes:'正确！壮族约 1957 万人，主要分布在广西。',no:'再看看上面的条形图。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawSpan();nbStart();fcNext();drawTable();growth();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'我国陆地面积约多少，居世界第几？',desc:'课本上的基本数据。',options:['约 960 万平方千米，居世界第三','约 960 万平方千米，居世界第一','约 360 万平方千米，第三','约 1700 万平方千米，第一'],answer:0,hint:'比我国大的有俄罗斯和加拿大。',explain:'约 <b>960 万平方千米</b>，仅次于俄罗斯、加拿大，居世界<b>第三</b>。'},
 {level:'base',title:'我国人口最多的少数民族是？',desc:'主要分布在广西。',options:['壮族','回族','满族','维吾尔族'],answer:0,hint:'广西壮族自治区因它得名。',explain:'<b>壮族</b>人口最多，主要分布在<b>广西</b>。我国共有 56 个民族，汉族约占 91%。'},
 {level:'base',title:'简称「黔」的省级行政区是？',desc:'它在西南地区。',options:['贵州省','广西壮族自治区','甘肃省','云南省'],answer:0,hint:'贵州还有一个简称「贵」。',explain:'<b>贵州省</b>简称「黔」或「贵」。广西简称「桂」，甘肃简称「甘」或「陇」，云南简称「滇」或「云」。'},
 {level:'mid',title:'我国人口分布的分界线是？',desc:'一条著名的人口地理分界线。',options:['黑河—腾冲一线','秦岭—淮河一线','大兴安岭—太行山一线','长江'],answer:0,hint:'它从黑龙江西北斜到云南西南。',explain:'<b>黑河—腾冲一线</b>：东南人口稠密、西北稀疏。注意<b>秦岭—淮河</b>是南北方分界，两条线作用完全不同。'},
 {level:'mid',title:'我国领土最南端在哪里？',desc:'它在南海。',options:['曾母暗沙','海南岛','漠河','台湾岛'],answer:0,hint:'南沙群岛中的一处。',explain:'最南端是<b>曾母暗沙</b>（南沙群岛）。最北在漠河以北的黑龙江主航道中心线，南北跨<b>纬度近 50 度</b>。'},
 {level:'mid',title:'我国南北跨纬度广，带来的影响是？',desc:'纬度决定热量。',options:['南北气温差异大，农作物熟制不同','东西时间差异大','人口分布不均','地势西高东低'],answer:0,hint:'冬季海南在过夏天，黑龙江在零下。',explain:'南北跨纬度近 50 度 → <b>热量差异大</b> → 气候类型多样、农作物熟制从一年一熟到一年三熟。注意<b>东西跨经度广</b>带来的才是<b>时间差异</b>。'},
 {level:'mid',title:'我国的行政区划分为哪三级？',desc:'课本上的基本制度。',options:['省、县、乡三级','省、市、区三级','国、省、市三级','市、县、村三级'],answer:0,hint:'最高一级是省级。',explain:'基本是<b>省、县、乡</b>三级。省级行政区共 <b>34 个</b>：23 个省、5 个自治区、4 个直辖市、2 个特别行政区。'},
 {level:'trap',title:'为什么乌鲁木齐比北京天亮得晚？',desc:'想想东西位置和自转方向。',options:['乌鲁木齐在西边，地球自西向东自转','乌鲁木齐纬度高','乌鲁木齐海拔高','两地用不同时区'],answer:0,hint:'谁先转到向阳面？',explain:'地球<b>自西向东</b>自转，<b>东边先见日出</b>。乌鲁木齐在西，所以天亮晚。我国统一使用<b>北京时间</b>，更放大了这种感受。注意这和纬度、海拔无关。'}
]);
