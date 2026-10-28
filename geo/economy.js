(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const IN=G.INDUSTRY,COLORS=['#7fae6b','#c58a4f','#5f97ae'],NAMES=['第一产业','第二产业','第三产业'];

/* ---------- 产业结构 ---------- */
function drawInd(){
 const rows=[['全国',IN.national],['广州',IN.guangzhou],['深圳',IN.shenzhen]],x0=56,x1=400,w=x1-x0;
 let s=R(0,0,420,220,'#f6f8f2',12);
 NAMES.forEach((n,i)=>{s+=R(18+i*130,14,12,12,COLORS[i],3)+T(36+i*130,24,n,12,'#4f6549',600);});
 rows.forEach(([name,v],r)=>{const y=50+r*54;let x=x0;s+=T(x0-8,y+24,name,13,'#2f4a3c',700,'end');
  v.forEach((p,i)=>{const ww=w*p/100;s+=R(x,y,ww,34,COLORS[i],i===0?4:0);
   if(ww>34)s+=T(x+ww/2,y+22,p+'%',12,'#fff',700,'middle');
   else s+=T(x+2,y+48,p+'%',11,COLORS[i],700,'start');
   x+=ww;});});
 $('ind').innerHTML=s;
 $('ind-text').textContent='深圳第一产业只占 '+IN.shenzhen[0]+'%，几乎没有农业；第二产业 '+IN.shenzhen[1]+'%，比全国（'+IN.national[1]+'%）还高，说明深圳是制造业强市；广州第三产业占 '+IN.guangzhou[2]+'%，服务业比重更大。';
}

/* ---------- 归类 ---------- */
let aR=0,aD=0;
$('act-list').innerHTML=G.ACTIVITIES.map(([n],i)=>'<div class="choice-row" data-i="'+i+'"><div><p>'+n+'</p><p class="verdict" hidden></p></div><div class="chips small"><button data-v="1">第一</button><button data-v="2">第二</button><button data-v="3">第三</button></div></div>').join('');
const WHY={1:'属于农业（种植、林、牧、渔），是第一产业。',2:'属于工业或建筑业，是第二产业。',3:'属于服务业，是第三产业。'};
for(const row of $('act-list').querySelectorAll('.choice-row')){const [n,a]=G.ACTIVITIES[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{if(row.dataset.done)return;row.dataset.done='1';aD++;const ok=Number(b.dataset.v)===a;if(ok)aR++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+n+WHY[a];
  $('act-score').textContent=aD===G.ACTIVITIES.length?'答对 '+aR+' / '+aD:'已答 '+aD+' / '+G.ACTIVITIES.length;});}

/* ---------- 因地制宜 ---------- */
const FARM=[['地势平坦、水源充足的平原','耕作业（种植业）'],['草场辽阔、降水较少的高原','畜牧业'],['坡度大、不宜开垦的山区','林业'],['沿海的浅海和滩涂','渔业（水产养殖）']];
const FOPT=FARM.map(f=>f[1]);
$('farm-list').innerHTML=FARM.map(([q],i)=>'<div class="choice-row" data-i="'+i+'" style="flex-direction:column;align-items:stretch"><div><p><b>'+q+'</b></p><p class="verdict" hidden></p></div><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start">'+shuffle(FOPT).map(o=>'<button data-v="'+o+'">'+o+'</button>').join('')+'</div></div>').join('');
for(const row of $('farm-list').querySelectorAll('.choice-row')){const [q,a]=FARM[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{if(row.dataset.done)return;row.dataset.done='1';const ok=b.dataset.v===a;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+q+(ok?'适合':'更适合')+'发展'+a+'。';});}

/* ---------- 交通方式 ---------- */
const MODES=G.TRANSPORT_MODES;let tc=[],ti=0,tR=0,tDone=false;
$('tr-options').innerHTML=Object.entries(MODES).map(([k,n])=>'<button data-value="'+k+'">'+n+'</button>').join('');
function trStart(){tc=shuffle(G.TRANSPORT_CASES);ti=0;tR=0;trShow();}
function trShow(){tDone=false;$('tr-q').textContent=tc[ti].q;$('tr-feedback').textContent='';$('tr-feedback').className='feedback';$('tr-next').hidden=true;$('tr-score').textContent=tR+' / '+ti;for(const b of $('tr-options').querySelectorAll('button'))b.classList.remove('correct','wrong');}
for(const b of $('tr-options').querySelectorAll('button'))b.addEventListener('click',()=>{if(tDone)return;tDone=true;const c=tc[ti],ok=b.dataset.value===c.a;if(ok)tR++;
 b.classList.add(ok?'correct':'wrong');if(!ok)$('tr-options').querySelector('[data-value='+c.a+']').classList.add('correct');
 $('tr-feedback').textContent=(ok?'✓ ':'✗ 应选'+MODES[c.a]+'。')+c.why;$('tr-feedback').className='feedback '+(ok?'success':'retry');
 $('tr-score').textContent=tR+' / '+(ti+1);$('tr-next').hidden=false;$('tr-next').textContent=ti===tc.length-1?'再来一轮':'下一题';});
$('tr-next').addEventListener('click',()=>{if(ti===tc.length-1){trStart();return;}ti++;trShow();});

/* ---------- 练习 ---------- */
const qs=[
 {title:'2024 年深圳比重最高的是哪个产业？',opts:[['a','第一产业'],['b','第二产业'],['c','第三产业']],answer:'c',yes:'正确！第三产业占 62.1%。',no:'再看看上面的条形图。'},
 {title:'下列经济活动中，属于第二产业的是？',opts:[['a','盖楼房'],['b','送外卖'],['c','种蔬菜']],answer:'a',yes:'对了！建筑业属于第二产业。',no:'提示：第二产业包括工业和建筑业。'},
 {title:'“西气东输”工程主要采用哪种运输方式？',opts:[['a','铁路'],['b','管道'],['c','水路']],answer:'b',yes:'正确！天然气用管道连续输送。',no:'提示：输送天然气最常用的方式。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawInd();trStart();
})();
