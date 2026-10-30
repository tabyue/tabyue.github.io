/* 第 10 课：了解地区（湘教版七下第八章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const AREAS=G.AREAS,byId=id=>AREAS.find(a=>a.id===id);
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('a');
const state={area:byId(fromHash)?fromHash:'sea',pole:'n'};

/* ---------- 地区切换 ---------- */
$('area-chips').innerHTML=AREAS.map(a=>'<button data-a="'+a.id+'">'+a.name+'</button>').join('');
function showArea(){
 const a=byId(state.area);
 for(const b of $('area-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.a===a.id));
 $('area-title').textContent=a.name;$('area-sec').textContent='七下 '+a.sec;
 $('area-keys').innerHTML=a.keys.map(k=>'<button type="button" tabindex="-1" aria-pressed="false">'+Site.esc(k)+'</button>').join('');
 $('a-pos').textContent=a.pos;$('a-terrain').textContent=a.terrain;$('a-climate').textContent=a.climate;$('a-feature').textContent=a.feature;
 const m=window.GeoMap&&GeoMap.get('area-map');if(m)m.show(a.id);
 Site.replaceHash('a='+a.id);
}
for(const b of $('area-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.area=b.dataset.a;showArea();});

/* ---------- 极地视图（只画经纬网） ---------- */
const STATIONS={
 n:[['黄河站',78.92,11.93,'2004 年建成，位于斯瓦尔巴群岛新奥尔松']],
 s:[['长城站',-62.22,-58.96,'1985 年建成，我国第一个南极科考站'],['中山站',-69.37,76.37,'1989 年建成'],['泰山站',-73.86,76.98,'2014 年建成'],['昆仑站',-80.42,77.12,'2009 年建成，靠近南极内陆冰盖最高点'],['秦岭站',-74.93,163.71,'2024 年建成']]};
function drawPolar(){
 const n=state.pole==='n',cx=150,cy=150,R0=118,span=40; // 画到纬度 50°
 const rOf=lat=>(90-Math.abs(lat))/span*R0;
 // 北极俯视：0° 在下，东经逆时针；南极俯视：0° 在上，东经顺时针
 const xy=(lat,lon)=>{const r=rOf(lat),t=lon*Math.PI/180;return n?[cx+r*Math.sin(t),cy+r*Math.cos(t)]:[cx+r*Math.sin(t),cy-r*Math.cos(t)];};
 let s=R(0,0,300,300,'#f6f8f2',12);
 s+=C(cx,cy,R0,'#eaf1f3','#c5d3cf',1);
 for(const lat of [80,70,60]){const r=rOf(lat);s+=C(cx,cy,r,'none','#c9d6cf',.9);s+=T(cx+3,cy-r-3,lat+'°'+(n?'N':'S'),9.5,'#6f7f6a',500,'start','paint-order="stroke" stroke="#eaf1f3" stroke-width="3"');}
 const circle=rOf(66.5);s+=C(cx,cy,circle,'none','#5f97ae',1.4,'stroke-dasharray="5 4"');
 s+=T(cx-circle*.72,cy+circle*.72+12,n?'北极圈':'南极圈',10.5,'#2f6377',600,'middle');
 for(let lon=0;lon<360;lon+=30){const [x,y]=xy(50,lon);s+=L(cx,cy,x,y,'#c9d6cf',.8);}
 for(const [lon,label] of [[0,'0°'],[90,'90°E'],[180,'180°'],[-90,'90°W']]){const [x,y]=xy(46,lon);s+=T(x,y+4,label,11,'#40594b',600,'middle');}
 // 自转方向弧
 const arc=R0+6,a0=-20*Math.PI/180,a1=40*Math.PI/180;
 s+='<defs><marker id="rot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#b0663a"/></marker></defs>';
 const p0=[cx+arc*Math.cos(a0),cy-arc*Math.sin(a0)],p1=[cx+arc*Math.cos(a1),cy-arc*Math.sin(a1)];
 s+=n?P('M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+'A'+arc+' '+arc+' 0 0 0 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1),'#b0663a',2,'none','marker-end="url(#rot)"')
     :P('M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'A'+arc+' '+arc+' 0 0 1 '+p0[0].toFixed(1)+' '+p0[1].toFixed(1),'#b0663a',2,'none','marker-end="url(#rot)"');
 s+=T(cx+arc*.86+4,cy-arc*.62,n?'逆时针':'顺时针',10.5,'#b0663a',700);
 s+=C(cx,cy,4,'#203b35')+T(cx+7,cy-6,n?'北极点':'南极点',11,'#203b35',700);
 for(const [name,lat,lon] of STATIONS[state.pole]){const [x,y]=xy(lat,lon);s+=C(x,y,4.2,'#b0472e','#fff',1.4)+T(x+7,y+4,name,11,'#7a4520',700,'start','paint-order="stroke" stroke="#f6f8f2" stroke-width="3"');}
 $('polar').innerHTML=s;
 $('pole-text').textContent=n?'俯视北极点：经线向四周放射，0° 经线在下方，东经沿逆时针方向增加，地球自转呈逆时针。站在北极点上，四面八方都是南方。'
  :'俯视南极点：0° 经线在上方，东经沿顺时针方向增加，地球自转呈顺时针。站在南极点上，四面八方都是北方。';
 $('pole-list').innerHTML=STATIONS[state.pole].map(([name,lat,lon,note])=>'<li><b>'+name+'</b><span>'+Math.abs(lat).toFixed(1)+'°'+(lat>=0?'N':'S')+'，'+Math.abs(lon).toFixed(1)+'°'+(lon>=0?'E':'W')+' · '+note+'</span></li>').join('');
 for(const b of $('pole-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.p===state.pole));
}
for(const b of $('pole-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.pole=b.dataset.p;drawPolar();});

/* ---------- 特征归属 ---------- */
const clues=shuffle(G.AREA_CLUES).slice(0,8);
$('clue-list').innerHTML=clues.map(([t],i)=>'<div class="choice-row" data-i="'+i+'" style="flex-direction:column;align-items:stretch"><p><b>'+Site.esc(t)+'</b></p><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start">'+AREAS.map(a=>'<button data-v="'+a.id+'">'+a.name+'</button>').join('')+'</div><p class="verdict" hidden></p></div>').join('');
let cd=0,cr=0;
for(const row of $('clue-list').querySelectorAll('.choice-row')){
 const [t,ans]=clues[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';cd++;
  const ok=b.dataset.v===ans;if(ok)cr++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ 应该是')+byId(ans).name+'。';
  $('clue-score').textContent=cd===clues.length?'答对 '+cr+' / '+clues.length:'已答 '+cd+' / '+clues.length;
 });
}

/* ---------- 练习 ---------- */
const qs=[
 {title:'连接太平洋和印度洋、被称为"十字路口"的海峡是——',opts:[['a','马六甲海峡'],['b','霍尔木兹海峡'],['c','直布罗陀海峡']],answer:'a',yes:'正确！马六甲海峡位于马来半岛和苏门答腊岛之间。',no:'切到「东南亚」看看地图上的海峡。'},
 {title:'欧洲西部冬季比同纬度地区温暖，主要原因是——',opts:[['a','受西风和北大西洋暖流影响'],['b','地势高'],['c','靠近赤道']],answer:'a',yes:'对！暖流和西风把海洋的热量带上陆地，形成温带海洋性气候。',no:'提示：看「欧洲西部」地图上那股洋流。'},
 {title:'我国科学家去南极考察，一般选在——',opts:[['a','11 月至次年 3 月'],['b','6 月至 8 月'],['c','全年任何时候']],answer:'a',yes:'正确！这时是南半球的夏季，气温较高、有极昼。',no:'想想南极什么时候是夏季。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();showArea();drawPolar();
})();
