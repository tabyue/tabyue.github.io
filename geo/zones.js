/* 第 16 课：中国的地域差异与区域发展 */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const m=/^(north|south|nw|tb)$/.exec(new URLSearchParams(location.hash.replace(/^#/,'')).get('z')||'');
const ZKEY={north:'north',south:'south',nw:'nw',tb:'tb'};
const state={zone:m?m[1]:'nw',inland:0};
const ZONES=[
 {id:'north',name:'北方地区',badge:'旱地·小麦',color:'#d3c98e',pos:[62,74]},
 {id:'south',name:'南方地区',badge:'水田·水稻',color:'#8fae8a',pos:[88,128]},
 {id:'nw',name:'西北地区',badge:'干旱',color:'#d9b98a',pos:[70,44]},
 {id:'tb',name:'青藏地区',badge:'高寒',color:'#b9d3dd',pos:[60,22]}];

/* ---------- 四大区域示意（分区色块，非地图轮廓） ---------- */
function drawZones(){
 const z=G.FOUR_ZONES.find(x=>x.name.startsWith(ZONES.find(t=>t.id===state.zone).name.replace('地区','')))||G.FOUR_ZONES[2];
 // 用网格色块矩阵示意空间格局（东密西疏、北 cold 南 hot），不画轮廓
 let s=R(0,0,420,250,'#f6f8f2',12);
 // 简化方位：左西右东、上北下南。用色块网格表达四区相对位置。
 const cells=[];
 for(let gx=0;gx<10;gx++)for(let gy=0;gy<6;gy++){
  const x=30+gx*36,y=26+gy*34;
  let id;
  if(gx<=5&&gy<=1)id='tb';           // 西北角上部：青藏
  else if(gy<=1)id='tb';             // 上部：青藏横亘（示意）
  else if(gx<=3)id='nw';             // 西部中下：西北
  else if(gy<=3)id='north';          // 东部上：北方
  else id='south';                   // 东部下：南方
  cells.push({x,y,id});
 }
 for(const c of cells){
  const zc=ZONES.find(t=>t.id===c.id);
  const on=c.id===state.zone;
  s+=R(c.x,c.y,32,30,zc.color,on?0:5,on?'stroke="#40594b" stroke-width="2.2"':'');
 }
 // 图例
 let lx=30;
 for(const t of ZONES){s+=R(lx,238,12,12,t.color,2);s+=T(lx+16,248,t.name,11,'#40594b',500);lx+=78;}
 // 方位标注
 s+=T(18,26,'西',12,'#8b9784',600)+T(404,26,'东',12,'#8b9784',600,'end');
 $('zone-svg').innerHTML=s;
}

/* ---------- 区域读数 ---------- */
function drawZoneInfo(){
 const idx={north:0,south:1,nw:2,tb:3}[state.zone];
 const z=G.FOUR_ZONES[idx],t=ZONES[idx];
 $('zone-title').textContent=z.name;
 $('zone-key').textContent=t.badge;
 $('zone-line').textContent=z.line;
 $('zone-climate').textContent='气候与生产：'+z.climate+'；'+z.key+'。';
}
$('zone-chips').innerHTML=ZONES.map(t=>'<button data-z="'+t.id+'">'+t.name+'</button>').join('');
for(const b of $('zone-chips').querySelectorAll('button'))b.addEventListener('click',()=>{
 state.zone=b.dataset.z;Site.pressed($('zone-chips'),b);
 drawZones();drawZoneInfo();Site.replaceHash('z='+state.zone);
});

/* ---------- 西北离海距离 ---------- */
const INLAND=[
 {name:'草原',rain:'年降水 200—400 毫米',desc:'温带草原，风吹草低见牛羊',color:'#a8c07a'},
 {name:'荒漠草原',rain:'年降水 100—200 毫米',desc:'草变矮变稀，开始露出黄土',color:'#d3c98e'},
 {name:'荒漠',rain:'年降水不足 100 毫米',desc:'沙漠、戈壁广布',color:'#d9b98a'}];
function drawInland(){
 const c=INLAND[state.inland];
 $('inland-out').textContent=['较近','较远','最深居内陆'][state.inland];
 $('inland-cards').innerHTML='<div class="choice-row correct" style="margin-bottom:8px"><b style="font-size:15px">'+c.name+'</b></div><p class="note">'+c.rain+' · '+c.desc+'。</p><p class="note" style="margin-top:4px">成因：深居内陆、距海遥远，加之山岭阻挡，湿润气流难以到达。</p>';
}
$('inland').addEventListener('input',e=>{state.inland=Number(e.target.value);drawInland();});

/* ---------- 黄土高原因果链排序 ---------- */
const chain=shuffle(G.LOESS_CHAIN.map((c,i)=>({...c,idx:i})));
let chainSeq=[];
$('loess-chain').innerHTML=chain.map(c=>'<button data-i="'+c.idx+'" data-tag="'+c.tag+'">'+c.step+'</button>').join('');
for(const b of $('loess-chain').querySelectorAll('button'))b.addEventListener('click',()=>{
 if(b.dataset.used)return;
 b.dataset.used='1';chainSeq.push(Number(b.dataset.i));
 b.style.order=chainSeq.length;
 b.classList.add('picked');
 if(chainSeq.length===chain.length){
  const right=chainSeq.every((v,i)=>v===i);
  $('loess-feedback').textContent=right?'✓ 全部正确！自然条件 + 人为活动 → 流水侵蚀 → 千沟万壑。治理要生物措施与工程措施结合。':'顺序：'+G.LOESS_CHAIN.map(c=>c.step).join(' → ');
  $('loess-feedback').className='feedback '+(right?'success':'retry');
 }
});
$('loess-fix').innerHTML=G.LOESS_FIX.map(([k,v])=>'<li><b>'+k+'</b><span>'+v+'</span></li>').join('');

/* ---------- 长江经济带 ---------- */
const B=G.YANGTZE_BELT;
$('belt-facts').innerHTML=[
 '<li><b>国土面积</b><span>约 21%，横跨东、中、西三大板块</span></li>',
 '<li><b>人口</b><span>约 43%</span></li>',
 '<li><b>经济总量</b><span>占全国 '+B.gdpShare+'%（十年前 '+B.gdpShare2014+'%）</span></li>',
 '<li><b>水质</b><span>'+B.waterQuality+'</span></li>',
 '<li><b>航运</b><span>'+B.throughput+'</span></li>'].join('');
$('belt-cities').textContent=B.cities.join(' · ');
$('belt-decade').textContent='生产总值翻了一番多；'+B.income+'；'+'沿线新能源汽车、电子信息等世界级产业集群加速形成。';

/* ---------- 区域案例 ---------- */
$('case-list').innerHTML=G.REGION_CASES.map(c=>'<li><b>'+c.name+'</b><span>'+c.pos+'；'+(c.agri!=='—'?'农业：'+c.agri+'；':'')+'产业：'+c.ind+'。</span></li>').join('');

/* ---------- 练习 ---------- */
const qs=[
 {title:'北方地区与南方地区的分界线是——',opts:[['a','秦岭—淮河一线'],['b','400 毫米年等降水量线'],['c','第一、二级阶梯分界线']],answer:'a',yes:'正确！秦岭—淮河是 1 月 0℃ 等温线、800 毫米年等降水量线经过的地方。',no:'400 毫米线分的是北方与西北，阶梯线分的是青藏与其他区域。'},
 {title:'西北地区最突出的自然特征是——',opts:[['a','干旱'],['b','高寒'],['c','湿热']],answer:'a',yes:'正确！深居内陆、远离海洋，降水自东向西递减：草原→荒漠草原→荒漠。',no:'高寒是青藏地区的特征。'},
 {title:'黄土高原水土流失的人为原因是——',opts:[['a','过垦过牧、破坏植被'],['b','黄土土质疏松'],['c','夏季暴雨集中']],answer:'a',yes:'正确！土质疏松和暴雨是自然原因，破坏植被是人为原因。',no:'B、C 是自然原因，想想人类做了什么。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();
if(m){for(const b of $('zone-chips').querySelectorAll('button'))if(b.dataset.z===m[1]){Site.pressed($('zone-chips'),b);break;}}
else Site.pressed($('zone-chips'),$('zone-chips').querySelector('[data-z=nw]'));
drawZones();drawZoneInfo();drawInland();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'我国四大地理区域不包括下列哪个？',desc:'记住四个名称。',options:['东南地区','北方地区','西北地区','青藏地区'],answer:0,hint:'四大区域是北方、南方、西北、青藏。',explain:'四大地理区域是<b>北方、南方、西北、青藏</b>，没有「东南地区」这个说法。'},
 {level:'base',title:'北方地区与南方地区的分界线是？',desc:'最著名的那条线。',options:['秦岭—淮河一线','400 毫米等降水量线','昆仑山—祁连山','大兴安岭'],answer:0,hint:'1 月 0℃ 等温线经过的地方。',explain:'<b>秦岭—淮河</b>一线，大致与 <b>1 月 0℃ 等温线</b>和 <b>800 毫米年等降水量线</b>吻合。'},
 {level:'base',title:'青藏地区最突出的自然特征是？',desc:'它海拔很高。',options:['高寒','干旱','湿热','多雨'],answer:0,hint:'平均海拔 4000 米以上。',explain:'<b>高寒</b>是青藏地区的主导特征，根本原因是<b>海拔高</b>。西北地区的主导特征则是<b>干旱</b>。'},
 {level:'mid',title:'划分青藏地区的主导因素是？',desc:'和划分南北方的依据不同。',options:['地势','气温','降水','植被'],answer:0,hint:'它被高大的山脉圈起来。',explain:'青藏地区由<b>地势（海拔）</b>决定；南北方分界主要看<b>气候</b>；东部与西北的分界主要看<b>降水</b>。'},
 {level:'mid',title:'西北地区最主要的自然特征是干旱，原因是？',desc:'看它离海远近。',options:['深居内陆，距海遥远，又有山脉阻挡','纬度太高','海拔太高','植被太少'],answer:0,hint:'海洋水汽能不能到达？',explain:'<b>深居内陆、距海遥远</b>，加上<b>山脉阻挡</b>湿润气流，水汽难以到达，所以干旱。<b>干旱是因，植被少是果</b>，不要倒过来说。'},
 {level:'mid',title:'南方地区的耕地类型和主要粮食作物是？',desc:'水热充足的地方。',options:['水田，水稻','旱地，小麦','水田，小麦','旱地，水稻'],answer:0,hint:'南方降水多。',explain:'南方<b>水田</b>为主，种<b>水稻</b>；北方<b>旱地</b>为主，种<b>小麦</b>。这组对应关系年年考。'},
 {level:'mid',title:'青藏地区的农业主要分布在哪里？',desc:'海拔太高的地方种不了庄稼。',options:['海拔较低的河谷地带','高原面上','雪山上','湖泊中'],answer:0,hint:'雅鲁藏布江谷地、湟水谷地。',explain:'集中在<b>海拔较低的河谷</b>（雅鲁藏布江谷地、湟水谷地），那里<b>热量较充足</b>，称为<b>河谷农业</b>。主要作物是青稞、小麦。'},
 {level:'trap',title:'西北地区发展农业最主要的限制因素是？',desc:'那里最缺什么？',options:['水源','热量','光照','土地'],answer:0,hint:'那里光照充足但降水稀少。',explain:'西北<b>光照充足、昼夜温差大</b>（这是优势），最大的限制是<b>水源不足</b>，所以发展的是<b>灌溉农业</b>（绿洲农业）。注意<b>青藏地区的限制因素才是热量</b>（高寒），两者别搞混。'}
]);
