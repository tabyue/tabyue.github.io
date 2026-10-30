(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const hp=new URLSearchParams(location.hash.replace(/^#/,''));
const state={cross:G.CROSSINGS.some(c=>c.id===hp.get('cross'))?hp.get('cross'):'szzs',metric:'density'};
const fmtMin=m=>m>=60?(m%60?Math.floor(m/60)+' 小时 '+(m%60)+' 分钟':(m/60)+' 小时'):m+' 分钟';

/* ---------- 示意关系图 ---------- */
const NODES={广州:[210,38],佛山:[112,72],肇庆:[40,48],东莞:[312,92],惠州:[382,66],江门:[52,168],中山:[118,150],深圳:[320,162],珠海:[130,238],澳门:[78,270],香港:[346,242]};
const ROUTES={szzs:[['深圳','中山']],hzmb:[['香港','__hub'],['__hub','珠海'],['__hub','澳门']],hsr:[['香港','深圳'],['深圳','广州']]};
const HUB=[168,252];
const pt=n=>n==='__hub'?HUB:NODES[n];
function drawNet(){
 let s=R(0,0,420,334,'#f6f8f2',12);
 s+=R(176,70,72,222,'#cfe1e6',18)+T(212,186,'珠江口',12,'#3f7489',600,'middle')+T(212,201,'（示意）',10,'#5f8796',400,'middle');
 s+=T(56,292,'西岸',12,'#6f8268',600,'middle')+T(364,292,'东岸',12,'#6f8268',600,'middle');
 for(const [id,segs] of Object.entries(ROUTES)){
  const on=id===state.cross;
  for(const [a,b] of segs){const p=pt(a),q=pt(b);s+=L(p[0],p[1],q[0],q[1],on?'#b97342':'#b9c7b2',on?4:2.2,id==='hsr'?'stroke-dasharray="7 4"':'');}
 }
 for(const [n,[x,y]] of Object.entries(NODES)){
  const sar=n==='香港'||n==='澳门',hot=ROUTES[state.cross].some(sg=>sg.includes(n));
  s+=C(x,y,sar?8:6.5,hot?'#b97342':sar?'#4f8197':'#6f8a68','#fff',1.6)+T(x,y-12,n,13,'#2f4a3c',hot?800:600,'middle','paint-order="stroke" stroke="#f6f8f2" stroke-width="3.5"');
 }
 const ly=318;s+=C(16,ly,5,'#4f8197','#fff',1.2)+T(26,ly+4,'特别行政区',11,'#5d6f63')+C(110,ly,4.5,'#6f8a68','#fff',1.2)+T(119,ly+4,'广东 9 市',11,'#5d6f63')+L(190,ly,214,ly,'#9fb39a',2.2,'stroke-dasharray="7 4"')+T(220,ly+4,'高铁',11,'#5d6f63')+L(258,ly,282,ly,'#9fb39a',2.2)+T(288,ly+4,'跨海通道',11,'#5d6f63');
 $('net').innerHTML=s;
}
const HSR_STOPS=[['西九龙 → 福田',14],['西九龙 → 深圳北',18],['西九龙 → 广州南',47]];
function drawCross(){
 const c=G.CROSSINGS.find(x=>x.id===state.cross);
 $('cross-title').textContent=c.name;$('cross-open').textContent=c.opened+'通车';
 $('cross-route').textContent=c.route+(c.length?' · 全长'+c.length:'');
 let bars='';
 if(c.before){const max=c.before;bars+='<div class="bar-item"><span>通车前</span><div class="track"><div class="fill" style="width:100%;background:#c9b48a"></div></div><em>约 '+fmtMin(c.before)+'</em></div>';
  bars+='<div class="bar-item"><span>通车后</span><div class="track"><div class="fill" style="width:'+(c.after/max*100).toFixed(1)+'%"></div></div><em>约 '+fmtMin(c.after)+'</em></div>';
  bars+='<p class="lead" style="margin-top:8px">车程缩短到原来的约 '+Math.round(c.after/c.before*100)+'%，省下约 '+fmtMin(c.before-c.after)+'。</p>';}
 else{const max=HSR_STOPS[HSR_STOPS.length-1][1];bars+=HSR_STOPS.map(([n,m])=>'<div class="bar-item" style="grid-template-columns:110px 1fr 64px"><span>'+n+'</span><div class="track"><div class="fill" style="width:'+(m/max*100).toFixed(1)+'%"></div></div><em>约 '+m+' 分钟</em></div>').join('')+'<p class="lead" style="margin-top:8px">香港与内地高铁网络直接相连，无须转车。</p>';}
 $('cross-bars').innerHTML=bars;$('cross-src').textContent='来源：'+c.src+'。';
 for(const b of $('cross-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.c===state.cross));
 Site.replaceHash('cross='+state.cross);drawNet();
}
$('cross-chips').innerHTML=G.CROSSINGS.map(c=>'<button data-c="'+c.id+'">'+c.name+'</button>').join('');
for(const b of $('cross-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.cross=b.dataset.c;drawCross();});
Site.setShareState(()=>'cross='+state.cross);

$('gba-facts').innerHTML=[
 '土地面积约 '+(G.GBA.area/1e4).toFixed(2)+' 万平方千米，常住人口约 '+(G.GBA.pop/1e4).toFixed(2)+' 亿（'+G.GBA.year+' 年）。',
 '地区生产总值约 '+(G.GBA.gdp/1e4).toFixed(1)+' 万亿元，以不到全国 1% 的土地、约 6% 的人口，创造了全国约 1/9 的经济总量。',
 '来源：澳门统计暨普查局“粤港澳大湾区统计专页”、粤港澳大湾区门户网。'
].map(t=>'<li>'+t+'</li>').join('');

/* ---------- 四城对比 ---------- */
const METRIC={
 density:{title:'人口密度 = 人口 ÷ 面积',unit:'人/平方千米',val:c=>G.density(c),fmt:v=>Math.round(v).toLocaleString('zh-CN')},
 pop:{title:'人口',unit:'万人',val:c=>c.pop,fmt:v=>v.toLocaleString('zh-CN')},
 area:{title:'土地面积',unit:'平方千米',val:c=>c.area,fmt:v=>v.toLocaleString('zh-CN')}
};
function drawCities(){
 const m=METRIC[state.metric],list=G.GBA_CITIES.slice().sort((a,b)=>m.val(b)-m.val(a)),max=m.val(list[0]);
 $('city-bars').innerHTML=list.map(c=>'<div class="bar-item" style="grid-template-columns:44px 1fr 108px"><span>'+c.name+'</span><div class="track"><div class="fill" style="width:'+Math.max(1.5,m.val(c)/max*100).toFixed(1)+'%;background:'+(c.name==='深圳'?'#b97342':'#8fae8a')+'"></div></div><em>'+m.fmt(m.val(c))+' '+m.unit+'</em></div>').join('');
 $('metric-title').textContent=m.title;
 const sz=G.GBA_CITIES.find(c=>c.name==='深圳'),mo=G.GBA_CITIES.find(c=>c.name==='澳门');
 $('metric-text').textContent=state.metric==='density'?'深圳每平方千米约 '+Math.round(G.density(sz)).toLocaleString('zh-CN')+' 人，已是内地人口密度最高的城市之一；澳门约 '+Math.round(G.density(mo)).toLocaleString('zh-CN')+' 人，是深圳的 '+(G.density(mo)/G.density(sz)).toFixed(1)+' 倍。':
  state.metric==='pop'?'广州和深圳常住人口都接近 1900 万；香港约 753 万，澳门不到 70 万。':
  '广州面积约是深圳的 '+(7238/1997.47).toFixed(1)+' 倍；深圳约是香港的 '+(1997.47/1114.57).toFixed(1)+' 倍；澳门只有约 33 平方千米。';
 for(const b of $('metric-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.m===state.metric));
}
for(const b of $('metric-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.metric=b.dataset.m;drawCities();});

$('sz-facts').innerHTML=[
 '1980 年设立经济特区，是我国最早设立的经济特区之一。',
 '土地面积 1997.47 平方千米，2024 年末常住人口 1798.95 万。',
 '2024 年三次产业比重为 '+G.SZ_2024.ind.join(' : ')+'，第三产业占六成以上。',
 '2024 年港口集装箱吞吐量约 '+Math.round(G.SZ_2024.teu)+' 万标箱；地铁运营线路 '+G.SZ_2024.metroLines+' 条、约 '+G.SZ_2024.metroKm+' 千米。',
 '来源：深圳市 2024 年国民经济和社会发展统计公报。'
].map(t=>'<li>'+t+'</li>').join('');

/* ---------- 9+2 点选 ---------- */
const MEMBERS=new Set([...G.GBA.nine,...G.GBA.sar]);
function resetPick(){
 $('city-pick').innerHTML=shuffle([...MEMBERS,...G.GBA.distractors]).map(n=>'<button data-n="'+n+'" aria-pressed="false">'+n+'</button>').join('');
 for(const b of $('city-pick').querySelectorAll('button'))b.addEventListener('click',()=>{const on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',String(on));b.classList.toggle('selected',on);});
 $('pick-feedback').textContent='';$('pick-feedback').className='feedback';$('pick-score').textContent='';
}
$('pick-check').addEventListener('click',()=>{
 const sel=[...$('city-pick').querySelectorAll('[aria-pressed="true"]')].map(b=>b.dataset.n);
 const miss=[...MEMBERS].filter(n=>!sel.includes(n)),wrong=sel.filter(n=>!MEMBERS.has(n));
 const ok=!miss.length&&!wrong.length;
 $('pick-score').textContent='选中 '+sel.length+' 个';
 $('pick-feedback').className='feedback '+(ok?'success':'retry');
 $('pick-feedback').textContent=ok?'全对！广东 9 市加上香港、澳门，正好 11 座城市。':
  (wrong.length?wrong.join('、')+' 是广东城市，但不在大湾区内。':'')+(miss.length?' 还漏了 '+miss.length+' 座城市。':'');
});
resetPick();

/* ---------- 练习 ---------- */
const qs=[
 {title:'澳门人口最少，为什么人口密度却最高？',opts:[['a','土地面积非常小，只有约 33 平方千米'],['b','人口增长速度最快'],['c','外来游客都算作常住人口']],answer:'a',yes:'正确！密度看的是“人口 ÷ 面积”，面积小，密度就高。',no:'提示：人口密度 = 人口 ÷ 面积。'},
 {title:'深中通道主要把哪两部分连了起来？',opts:[['a','珠江口东岸的“深莞惠”与西岸的“珠中江”'],['b','香港与澳门'],['c','广州与佛山']],answer:'a',yes:'对了！深圳到中山的车程从约 2 小时缩短到约 30 分钟。',no:'提示：看看示意图里深中通道两端的城市。'},
 {title:'下列城市中，不属于粤港澳大湾区的是？',opts:[['a','江门'],['b','肇庆'],['c','汕头']],answer:'c',yes:'正确！汕头在粤东，不在“9+2”之内。',no:'再看看“9+2”名单：广东 9 市里有江门和肇庆。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawCross();drawCities();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'粤港澳大湾区由多少个城市组成？',desc:'通常说「9+2」。',options:['11 个','9 个','2 个','13 个'],answer:0,hint:'广东 9 市加港澳 2 个特别行政区。',explain:'<b>9 + 2 = 11</b> 个：广东九市加<b>香港、澳门</b>两个特别行政区。'},
 {level:'base',title:'下列哪个城市不属于粤港澳大湾区？',desc:'注意「9+2」的名单。',options:['汕头','江门','肇庆','惠州'],answer:0,hint:'汕头在粤东。',explain:'<b>汕头</b>位于粤东，不在「9+2」之内。名单里容易被忽略的是<b>江门和肇庆</b>。'},
 {level:'base',title:'深中通道连接的是哪两个城市？',desc:'从名字就能看出来。',options:['深圳和中山','深圳和珠海','深圳和东莞','深圳和广州'],answer:0,hint:'跨越珠江口。',explain:'<b>深圳—中山</b>，把珠江口<b>东岸与西岸</b>直接连起来，车程从约 2 小时缩短到约 30 分钟。'},
 {level:'mid',title:'澳门人口最少，为什么人口密度却很高？',desc:'密度 = 人口 ÷ 面积。',options:['土地面积非常小','人口增长最快','游客也算常住人口','统计方法不同'],answer:0,hint:'分母很小的时候商会怎样。',explain:'澳门<b>面积极小</b>（约 33 平方千米），人口虽少但<b>密度极高</b>。人口密度 = 人口 ÷ 面积，<b>分母小则密度大</b>。'},
 {level:'mid',title:'大湾区建设跨海通道的主要意义是？',desc:'从交通联系想。',options:['缩短时空距离，促进两岸要素流动','增加旅游景点','扩大城市面积','减少人口'],answer:0,hint:'路通了，人和货就流动起来了。',explain:'港珠澳大桥、深中通道等<b>缩短了时空距离</b>，促进<b>人员、资金、技术、信息</b>流动，推动区域一体化和分工协作。'},
 {level:'mid',title:'深圳在大湾区中的突出优势是？',desc:'想想它的产业特色。',options:['高新技术产业和创新能力强','耕地面积最大','矿产资源最丰富','历史最悠久'],answer:0,hint:'华为、腾讯、比亚迪都在那里。',explain:'深圳以<b>高新技术产业和创新能力</b>著称，是大湾区的<b>科技创新引擎</b>。香港强在金融和贸易，广州强在商贸和教育。'},
 {level:'mid',title:'大湾区「一个国家、两种制度、三个关税区」中，三个关税区指？',desc:'注意不是三个国家。',options:['内地、香港、澳门','广州、深圳、珠海','中国、英国、葡萄牙','广东、香港、台湾'],answer:0,hint:'港澳各自是独立关税区。',explain:'指<b>内地、香港、澳门</b>三个<b>单独关税区</b>。这是大湾区制度上的特殊性，既带来灵活性也带来协调难度。'},
 {level:'trap',title:'大湾区各城市应该发展成完全一样的产业结构吗？',desc:'想想分工协作的意义。',options:['不应该，要错位发展、优势互补','应该，这样最公平','应该，可以互相竞争','无所谓'],answer:0,hint:'如果大家都做同样的事会怎样？',explain:'应<b>错位发展、优势互补</b>：香港金融航运、深圳科技创新、广州商贸教育、东莞佛山制造……<b>产业同质化会造成重复建设和恶性竞争</b>。区域合作的核心是<b>分工</b>。'}
]);
