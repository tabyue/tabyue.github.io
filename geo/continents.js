/* 第 9 课：认识大洲（湘教版七下第七章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{line:L,text:T,rect:R}=Site.S;
const K=G.CONTINENT_INFO,byId=id=>K.find(k=>k.id===id);
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('k');
const state={k:byId(fromHash)?fromHash:'asia'};

$('k-chips').innerHTML=K.map(k=>'<button data-k="'+k.id+'">'+k.name+'</button>').join('');
function show(){
 const k=byId(state.k);
 for(const b of $('k-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.k===k.id));
 $('k-title').textContent=k.name;$('k-sec').textContent='七下 '+k.sec;$('k-area').textContent=k.area;
 $('k-terrain').textContent=k.terrain;$('k-river').textContent=k.river;$('k-climate').textContent=k.climate;$('k-people').textContent=k.people;
 const m=window.GeoMap&&GeoMap.get('k-map');if(m)m.show(k.id);
 Site.replaceHash('k='+k.id);
}
for(const b of $('k-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.k=b.dataset.k;show();});

/* ---------- 非洲气候南北对称 ---------- */
const BAND_TEXT={'热带雨林气候':'赤道附近，终年高温多雨，刚果盆地有大片热带雨林。',
 '热带草原气候':'一年分为干季和湿季，是非洲分布最广的气候类型；湿季草木茂盛，干季草木枯黄，动物随季节迁徙。',
 '热带沙漠气候':'回归线附近，终年炎热干燥。北边是撒哈拉沙漠（世界最大的沙漠），南边也有沙漠。',
 '地中海气候':'非洲最北端和最南端，夏季炎热干燥，冬季温和多雨。'};
let picked=-1;
function drawBands(){
 const y0=14,y1=316,lat2y=l=>y0+(37-l)/(37+35)*(y1-y0),x=78,w=150;
 let s=R(0,0,300,330,'#f6f8f2',12);
 let labels='';
 G.AFRICA_BANDS.forEach((b,i)=>{
  const ya=lat2y(b.from),yb=lat2y(b.to),on=i===picked;
  s+=R(x,ya,w,yb-ya,b.color,0,'data-b="'+i+'" style="cursor:pointer"'+(on?' stroke="#203b35" stroke-width="2.5"':''));
  if(yb-ya>16)labels+=T(x+w/2,(ya+yb)/2+4.5,b.name,12,'#2f3f2a',on?800:600,'middle','pointer-events="none" paint-order="stroke" stroke="'+b.color+'" stroke-width="6"');
 });
 for(const [lat,name] of [[23.44,'北回归线'],[0,'赤道'],[-23.44,'南回归线']]){
  const y=lat2y(lat);s+=L(x-10,y,x+w+10,y,lat===0?'#b0472e':'#5f97ae',lat===0?2:1.3,'stroke-dasharray="5 4" pointer-events="none"');
  s+=T(x+w+14,y+4,name,11.5,lat===0?'#b0472e':'#2f6377',700,'start','pointer-events="none"');
 }
 s+=labels;
 for(const lat of [30,15,0,-15,-30]){const y=lat2y(lat);s+=T(x-14,y+4,Math.abs(lat)+'°'+(lat>0?'N':lat<0?'S':''),10.5,'#6f8268',400,'end','pointer-events="none"');}
 s+=T(x+w/2,y0-2+0,'北',11,'#6f8268',600,'middle')+T(x+w/2,y1+12,'南',11,'#6f8268',600,'middle');
 $('bands').innerHTML=s;
}
$('bands').addEventListener('click',e=>{const t=e.target.closest('[data-b]');if(!t)return;picked=Number(t.dataset.b);const b=G.AFRICA_BANDS[picked];
 $('band-text').textContent=b.name+'：'+BAND_TEXT[b.name]+(picked===3?'':'（赤道另一侧对称的位置也是'+b.name+'。）');drawBands();});

/* ---------- 猜大洲 ---------- */
const items=Site.shuffle(K.flatMap(k=>k.clues.map(c=>[c,k.id]))).slice(0,8);
Site.matchRows('kc-list','kc-score',items,K.map(k=>[k.id,k.name]),(t,ans)=>'这是'+byId(ans).name+'的特征。');

Site.runQuiz([
 {title:'亚洲的河流大多从中部向四周流出，主要是因为——',opts:[['a','地势中部高、四周低'],['b','降水中部多'],['c','人口集中在中部']],answer:'a',yes:'正确！水往低处流，河流随地势呈放射状。',no:'提示：河流从高处流向低处。'},
 {title:'非洲分布面积最广的气候类型是——',opts:[['a','热带草原气候'],['b','热带雨林气候'],['c','地中海气候']],answer:'a',yes:'对！赤道两侧各有一大片热带草原气候。',no:'点一下上面的色带比比宽度。'},
 {title:'北美洲和南美洲的分界线是——',opts:[['a','巴拿马运河'],['b','苏伊士运河'],['c','白令海峡']],answer:'a',yes:'正确！巴拿马运河沟通太平洋和大西洋。',no:'苏伊士运河是亚洲和非洲的分界。'}
]);
show();drawBands();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'世界上最长的山脉是？',desc:'它在南美洲西部。',options:['安第斯山脉','喜马拉雅山脉','落基山脉','阿尔卑斯山脉'],answer:0,hint:'沿着南美洲西海岸纵贯南北。',explain:'<b>安第斯山脉</b>是世界最长的山脉；喜马拉雅山脉最<b>高</b>。最长和最高是两回事。'},
 {level:'base',title:'被称为「高原大陆」的是哪个大洲？',desc:'它的地形以高原为主。',options:['非洲','亚洲','欧洲','大洋洲'],answer:0,hint:'赤道横穿它的中部。',explain:'<b>非洲</b>以高原为主，有「高原大陆」之称。欧洲平均海拔最低，有「平原大陆」之称。'},
 {level:'base',title:'世界上最大的沙漠是？',desc:'它在非洲北部。',options:['撒哈拉沙漠','塔克拉玛干沙漠','戈壁沙漠','阿拉伯沙漠'],answer:0,hint:'面积接近整个中国。',explain:'<b>撒哈拉沙漠</b>位于非洲北部，是世界最大的沙漠。'},
 {level:'mid',title:'亚洲河流呈放射状流向四周的原因是？',desc:'水往低处流。',options:['地势中部高、四周低','降水集中在中部','板块运动','人口分布影响'],answer:0,hint:'看地形剖面。',explain:'亚洲<b>中部高、四周低</b>，河流自然从中部向四周<b>放射状</b>流出。地形决定水系。'},
 {level:'mid',title:'欧洲西部冬季比同纬度地区温暖，主要原因是？',desc:'注意那股暖流和盛行风。',options:['受北大西洋暖流和西风影响','纬度低','地势低平','工业发达散热'],answer:0,hint:'暖流把热量带来，西风把热量吹上陆地。',explain:'<b>北大西洋暖流</b>提供热量，<b>西风</b>把海洋的暖湿空气吹向陆地，形成冬暖夏凉的<b>温带海洋性气候</b>。'},
 {level:'mid',title:'非洲气候以赤道为轴南北对称分布，主要因为？',desc:'看赤道穿过哪里。',options:['赤道横穿非洲中部','非洲是高原大陆','非洲多沙漠','非洲人口稠密'],answer:0,hint:'气候带是按纬度排列的。',explain:'<b>赤道横穿中部</b>，气候带以赤道为轴向南北两侧<b>对称</b>排列：热带雨林—热带草原—热带沙漠—地中海气候。'},
 {level:'mid',title:'北美洲和南美洲地形的共同特点是？',desc:'都分三大南北纵列带。',options:['西部高山、中部平原、东部高原','中部高、四周低','全部是平原','东部高山、西部平原'],answer:0,hint:'想想落基山、安第斯山的位置。',explain:'两洲都是<b>西部高山、中部平原、东部高原山地</b>的<b>南北纵列</b>格局，这让来自海洋的气流容易深入中部平原。'},
 {level:'trap',title:'亚洲跨纬度最广，带来的直接影响是？',desc:'纬度跨度大意味着什么？',options:['气候类型复杂多样','人口最多','面积最大','海岸线最长'],answer:0,hint:'纬度决定热量，跨得越广热量差异越大。',explain:'跨纬度广 → <b>热量差异大</b> → <b>气候类型复杂多样</b>。亚洲几乎拥有除温带海洋性气候外的所有气候类型。注意「人口最多」「面积最大」是另外的事实，不是跨纬度广的直接结果。'}
]);
