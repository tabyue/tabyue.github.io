(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R,arrow:A}=Site.S;
const CITIES=G.CITIES,TYPES=G.CLIMATE_TYPES;
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('city');
const state={city:CITIES.some(c=>c.id===fromHash)?fromHash:'shenzhen'};
const fmt=v=>(Math.round(v*10)/10).toString().replace('-','−');

/* 气候图：左轴 −10~35℃，右轴 0~400 毫米 */
function chartSvg(c,{hideName=false}={}){
 const x0=46,x1=374,y0=252,y1=30,tMin=-10,tMax=35,pMax=400,bw=(x1-x0)/12;
 const ty=t=>y0-(t-tMin)/(tMax-tMin)*(y0-y1),py=p=>y0-p/pMax*(y0-y1);
 let s='';
 for(let t=tMin;t<=tMax;t+=5){const y=ty(t);s+=L(x0,y,x1,y,t===0?'#b9c6b2':'#e6ebe1',t===0?1:.7)+T(x0-6,y+4,String(t).replace('-','−'),11,'#b0663a',400,'end');}
 for(let p=0;p<=pMax;p+=100)s+=T(x1+6,py(p)+4,String(p),11,'#4f8197',400,'start');
 s+=T(4,y1-14,'气温/℃',11.5,'#b0663a',600,'start')+T(416,y1-14,'降水/毫米',11.5,'#4f8197',600,'end');
 c.prec.forEach((p,i)=>{const x=x0+i*bw+bw*.18,h=y0-py(Math.min(p,pMax));s+=R(x,y0-h,bw*.64,h,'#8fb3c0',2);});
 let d='';c.temp.forEach((t,i)=>{d+=(i?'L':'M')+(x0+(i+.5)*bw).toFixed(1)+' '+ty(t).toFixed(1);});
 s+=P(d,'#c0703f',2.4);
 c.temp.forEach((t,i)=>{s+=C(x0+(i+.5)*bw,ty(t),3,'#c0703f','#fff',1.2);});
 for(let i=0;i<12;i++)s+=T(x0+(i+.5)*bw,y0+17,String(i+1),11,'#6f8268',400,'middle');
 s+=T((x0+x1)/2,y0+36,'月份',11,'#6f8268',400,'middle');
 s+=L(x0,y0,x1,y0,'#9eb097',1);
 if(!hideName)s+=T(x0+6,y1+6,c.name,15,'#2f4a3c',700,'start','paint-order="stroke" stroke="#fff" stroke-width="4"');
 return s;
}
$('city-chips').innerHTML=CITIES.map(c=>'<button data-city="'+c.id+'">'+c.name+'</button>').join('');
for(const b of $('city-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.city=b.dataset.city;render();});
$('reveal').addEventListener('click',()=>{$('type-box').hidden=false;$('reveal').hidden=true;});
function render(){
 const c=CITIES.find(x=>x.id===state.city),s=G.climateStats(c);
 $('chart').innerHTML=chartSvg(c);$('chart').setAttribute('aria-label',c.name+'的气温曲线和降水柱状图');
 $('chart-source').textContent='数据：'+c.station+' 月平均气温与月平均降水量。';
 $('city-title').textContent=c.name;$('city-where').textContent=c.where;
 $('hot-readout').innerHTML=s.hotMonth+' 月 '+fmt(s.hotTemp)+'<small>℃</small>';
 $('cold-readout').innerHTML=s.coldMonth+' 月 '+fmt(s.coldTemp)+'<small>℃</small>';
 $('range-readout').innerHTML=fmt(s.range)+'<small>℃</small>';
 $('total-readout').innerHTML=Math.round(s.total)+'<small>毫米</small>';
 $('type-name').textContent=TYPES[c.type].name;$('type-trait').textContent=TYPES[c.type].trait;
 $('type-reasons').innerHTML=G.climateReasons(c).map(r=>'<li>'+Site.esc(r)+'</li>').join('');
 $('type-box').hidden=true;$('reveal').hidden=false;
 for(const b of $('city-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.city===state.city));
 Site.replaceHash('city='+state.city);
}
Site.setShareState(()=>'city='+state.city);

/* 类型表 */
$('type-table').querySelector('tbody').innerHTML=Object.entries(TYPES).map(([k,t])=>{const c=CITIES.find(x=>x.type===k);return '<tr><td style="color:var(--ink);font-weight:600">'+t.name+'</td><td>'+t.trait+'</td><td>'+(c?c.name:'')+'</td></tr>';}).join('');

/* 天气还是气候 */
const WC=[['今天午后有雷阵雨','weather'],['深圳夏季高温多雨','climate'],['明天最高气温 28℃','weather'],['昆明四季如春','climate'],['东边日出西边雨','weather'],['北京冬季寒冷干燥','climate']];
let wcRight=0,wcDone=0;
$('wc-list').innerHTML=WC.map(([q],i)=>'<div class="choice-row" data-i="'+i+'"><div><p>'+q+'</p><p class="verdict" hidden></p></div><div class="chips small"><button data-v="weather">天气</button><button data-v="climate">气候</button></div></div>').join('');
for(const row of $('wc-list').querySelectorAll('.choice-row')){
 const [,ans]=WC[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';wcDone++;
  const ok=b.dataset.v===ans;if(ok)wcRight++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+(ans==='weather'?'说的是短时间的大气状况，属于天气。':'说的是多年平均状况，属于气候。');
  $('wc-score').textContent=wcDone===WC.length?'答对 '+wcRight+' / '+WC.length:'已答 '+wcDone+' / '+WC.length;
 });
}

/* 地形：气温垂直递减与地形雨 */
function drawMountain(){
 const h=Number($('peak-h').value),t0=Number($('base-t').value),top=G.temperatureAtAltitude(t0,h);
 Site.setRange($('peak-h'),h,h+' 米');Site.setRange($('base-t'),t0,t0+'℃');
 $('peak-output').textContent=h+' 米';$('base-output').textContent=t0+'℃';
 const g=196,peakY=g-34-h/5000*150,px=236,mid=(g+peakY)/2;
 let s='<defs>'+A('wind','#6b97a6')+'</defs>';
 s+=R(0,g,124,44,'#9cc0cc')+T(10,g+26,'海洋',12,'#2f6377',600);
 s+=P('M118 '+g+'C160 '+(g-6)+' '+(px-70)+' '+(peakY+34)+' '+px+' '+peakY+'C'+(px+46)+' '+(peakY+30)+' '+(px+110)+' '+(g-8)+' 420 '+(g-2)+'L420 240L118 240Z','#8a9f7e',1.2,'#dfe7d3');
 // 迎风坡：云与降水贴着山坡
 const cx=px-(px-118)*.48,cyc=mid-22;
 s+='<ellipse cx="'+(cx-6)+'" cy="'+cyc+'" rx="40" ry="14" fill="#fff" stroke="#b9c9b4"/><ellipse cx="'+(cx+22)+'" cy="'+(cyc-9)+'" rx="28" ry="12" fill="#fff" stroke="#b9c9b4"/>';
 for(let i=0;i<6;i++){const x=cx-34+i*12;s+=L(x,cyc+12,x-5,cyc+30,'#6b97a6',1.3);}
 for(const [y,dy] of [[g-24,-10],[g-52,-14]])s+=L(18,y,104,y+dy,'#6b97a6',1.8,'marker-end="url(#wind)"');
 s+=T(14,g-70,'暖湿气流',12,'#2f6377',600);
 s+=T(186,g+26,'迎风坡：多雨',12,'#2f6377',600,'middle')+T(px+104,g+26,'背风坡：少雨',12,'#8a6a2c',600,'middle');
 s+=C(px,peakY,3.2,'#526f50')+T(px,peakY-11,'山顶 '+fmt(top)+'℃',13,'#2f4a3c',700,'middle');
 s+=T(130,g-10,'山脚 '+t0+'℃',12,'#2f4a3c',600,'start');
 $('mountain').innerHTML=s;
 $('top-t').innerHTML=fmt(top)+'<small>℃</small>';$('drop-t').innerHTML=fmt(t0-top)+'<small>℃</small>';
 $('mountain-text').textContent='海拔升高 '+h+' 米，气温约下降 '+h+' ÷ 100 × 0.6 = '+fmt(t0-top)+'℃。'+(top<=0?'山顶在 0℃ 以下，可能有积雪。':'');
}
$('peak-h').addEventListener('input',drawMountain);$('base-t').addEventListener('input',drawMountain);

/* 海陆差异与季风（示意） */
function drawMonsoon(){
 const m=Number($('month').value),v=G.landSeaSchematic(m),diff=v.land-v.sea;
 Site.setRange($('month'),m,m+' 月');$('month-output').textContent=m+' 月';
 const g=170;let s='<defs>'+A('mw','#4f8197')+A('mwW','#8a6a2c')+'</defs>';
 s+=R(0,g,230,60,'#e3e7cf')+R(230,g,190,60,'#9cc0cc');
 s+=T(16,g+40,'陆地（亚欧大陆）',12.5,'#5d6a3c',600)+T(404,g+40,'海洋（太平洋）',12.5,'#2f6377',600,'end');
 const therm=(x,t,label,color)=>{const h=Math.max(4,(t+5)/40*110);return R(x-6,g-122,12,116,'#fff',6,'stroke="#c9d3c2"')+R(x-4,g-8-h,8,h,color,4)+C(x,g-6,8,color)+T(x,g-130,label+' '+fmt(t)+'℃',12,'#2f4a3c',600,'middle');};
 s+=therm(110,v.land,'陆地','#c0703f')+therm(320,v.sea,'海洋','#4f8197');
 let title,badge,text;
 if(diff>2){title='夏季风';badge='海洋 → 陆地';text=m+' 月：陆地升温快，比海洋热，近地面形成低气压。风从海洋吹向陆地，温暖湿润，带来降水。我国东部盛行东南风或西南风。';
  for(const y of [g-30,g-60])s+=L(300,y,150,y,'#4f8197',2.4,'marker-end="url(#mw)"');}
 else if(diff<-2){title='冬季风';badge='陆地 → 海洋';text=m+' 月：陆地降温快，比海洋冷，近地面形成高气压。风从陆地吹向海洋，寒冷干燥。我国北方盛行西北风。';
  for(const y of [g-30,g-60])s+=L(150,y,300,y,'#8a6a2c',2.4,'marker-end="url(#mwW)"');}
 else{title='风向转换期';badge='海陆温差小';text=m+' 月：海洋和陆地气温相近，季风不明显，正处在冬、夏季风交替的时候。';}
 s+=T(225,26,title,15,'#2f4a3c',700,'middle');
 $('monsoon').innerHTML=s;
 $('wind-title').textContent=title;$('wind-badge').textContent=badge;$('wind-text').textContent=text;
}
$('month').addEventListener('input',drawMonsoon);

/* 盲测 */
let order=[],qi=0;
function shuffle(){order=CITIES.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}}
const opts=$('quiz-options');
opts.innerHTML=Object.entries(TYPES).map(([k,t])=>'<button data-value="'+k+'">'+t.name+'</button>').join('');
let answered=false;
function showQ(){
 const c=CITIES[order[qi]];answered=false;
 $('quiz-chart').innerHTML=chartSvg(c,{hideName:true});
 $('quiz-step').textContent=(qi+1)+' / '+CITIES.length;
 $('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 for(const b of opts.querySelectorAll('button'))b.classList.remove('correct','wrong');
 opts.dataset.answer=c.type;
}
for(const b of opts.querySelectorAll('button'))b.addEventListener('click',()=>{
 if(answered)return;const c=CITIES[order[qi]],ok=b.dataset.value===c.type;
 for(const o of opts.querySelectorAll('button'))o.classList.remove('correct','wrong');
 b.classList.add(ok?'correct':'wrong');
 if(!ok){$('quiz-feedback').textContent='再想想：'+G.climateReasons(c)[0]+' '+G.climateReasons(c)[1];$('quiz-feedback').className='feedback retry';return;}
 answered=true;for(const o of opts.querySelectorAll('button'))if(o.dataset.value===c.type)o.classList.add('correct');
 $('quiz-feedback').textContent='正确！这是'+c.name+'（'+c.where+'）。'+G.climateReasons(c)[2];$('quiz-feedback').className='feedback success';
 $('next-question').hidden=false;$('next-question').textContent=qi===CITIES.length-1?'全部完成，重新洗牌':'下一张';
});
$('next-question').addEventListener('click',()=>{qi++;if(qi>=CITIES.length){shuffle();qi=0;}showQ();});
shuffle();showQ();render();drawMountain();drawMonsoon();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'「今天下午有雷阵雨」描述的是？',desc:'注意时间尺度。',options:['天气','气候','季风','洋流'],answer:0,hint:'短时间还是长时间？',explain:'描述<b>短时间</b>大气状况，是<b>天气</b>。「深圳夏季高温多雨」才是气候。'},
 {level:'base',title:'海拔每升高 100 米，气温大约下降多少？',desc:'这是常用的递减率。',options:['0.6 ℃','6 ℃','1 ℃','0.1 ℃'],answer:0,hint:'所以山上比山下凉快。',explain:'约 <b>0.6 ℃</b>。所以「人间四月芳菲尽，山寺桃花始盛开」——山上气温低，花期推迟。'},
 {level:'base',title:'从赤道向两极，气温怎样变化？',desc:'想想太阳照射角度。',options:['逐渐降低','逐渐升高','先降后升','基本不变'],answer:0,hint:'赤道获得的太阳热量最多。',explain:'<b>逐渐降低</b>。低纬太阳高度大、获得热量多，高纬相反。这是气温分布的第一规律。'},
 {level:'mid',title:'山地的迎风坡和背风坡，哪边降水多？',desc:'气流被迫抬升会怎样。',options:['迎风坡','背风坡','一样多','取决于海拔'],answer:0,hint:'气流上升会冷却凝结。',explain:'<b>迎风坡</b>多雨：气流被迫抬升、冷却、水汽凝结成雨；背风坡气流下沉增温，降水少。'},
 {level:'mid',title:'深圳属于哪种气候类型？',desc:'看它的纬度和海陆位置。',options:['亚热带季风气候','热带雨林气候','温带季风气候','地中海气候'],answer:0,hint:'夏季高温多雨、冬季温和少雨。',explain:'深圳是<b>亚热带季风气候</b>：夏季高温多雨、冬季温和少雨，<b>雨热同期</b>。'},
 {level:'mid',title:'我国东部季风气候显著，主要原因是？',desc:'从海陆位置想。',options:['背靠世界最大的大陆，面临世界最大的大洋','纬度低','地势西高东低','河流众多'],answer:0,hint:'海陆热力性质差异越大，季风越强。',explain:'我国东临<b>太平洋</b>、背靠<b>亚欧大陆</b>，海陆热力差异全球最显著，所以季风气候最典型。'},
 {level:'mid',title:'读气温曲线和降水柱状图时，判断南北半球看什么？',desc:'看最热月出现在几月。',options:['看气温最高值出现在 7 月还是 1 月','看降水总量','看气温年较差','看柱子颜色'],answer:0,hint:'北半球 7 月最热，南半球 1 月最热。',explain:'<b>7 月气温最高 → 北半球；1 月最高 → 南半球</b>。这是判读气候图的第一步，之后再看降水定类型。'},
 {level:'trap',title:'地中海气候的特点是？',desc:'它和季风气候正好相反。',options:['夏季炎热干燥，冬季温和多雨','夏季高温多雨，冬季寒冷干燥','全年高温多雨','全年温和湿润'],answer:0,hint:'注意它是「雨热不同期」。',explain:'<b>夏干冬雨</b>，是<b>雨热不同期</b>的典型。而季风气候是夏季高温多雨（雨热同期），两者正好相反，看降水柱子高在夏季还是冬季就能分开。'}
]);
