/* 第 17 课：认识大洲（湘教版七下第七章） */
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
