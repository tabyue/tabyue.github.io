/* 第 16 课：走近国家（湘教版七下第九章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const CS=G.COUNTRIES,byId=id=>CS.find(c=>c.id===id);
// 排序用的数值（与 model.js 文字口径一致）：面积 万平方千米，人口 亿
const NUM={jp:[37.8,1.23,'亚洲'],eg:[100,1.09,'非洲（地跨亚、非）'],ru:[1709.8,1.46,'欧洲、亚洲'],fr:[55,0.69,'欧洲'],us:[937,3.42,'北美洲'],au:[769,0.279,'大洋洲'],br:[851,2.14,'南美洲']};
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('c');
const state={c:byId(fromHash)?fromHash:'jp',sort:null};

/* ---------- 国家切换 ---------- */
$('c-chips').innerHTML=CS.map(c=>'<button data-c="'+c.id+'">'+c.name+'</button>').join('');
function showCountry(){
 const c=byId(state.c),i=CS.indexOf(c);
 for(const b of $('c-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.c===c.id));
 $('c-title').textContent=c.name;$('c-sec').textContent=c.sec==='探究'?'七下第九章 探究':'七下 9.'+(i+1);
 $('c-capital').textContent=c.capital;$('c-area').textContent=c.area;$('c-pop').textContent=c.pop;
 $('c-pos').textContent=c.pos;$('c-terrain').textContent=c.terrain;$('c-climate').textContent=c.climate;$('c-economy').textContent=c.economy;
 const m=window.GeoMap&&GeoMap.get('c-map');if(m)m.show(c.id);
 Site.replaceHash('c='+c.id);
}
for(const b of $('c-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.c=b.dataset.c;showCountry();});

/* ---------- 线索猜国家 ---------- */
let order=shuffle(CS.map(c=>c.id)),gi=0,shown=1,total=0,played=0,done=false;
function drawGuess(){
 const c=byId(order[gi]);
 $('g-clues').innerHTML=c.clues.slice(0,shown).map(t=>'<li><span>'+Site.esc(t)+'</span></li>').join('');
 $('g-more').hidden=done||shown>=c.clues.length;
 $('g-next').hidden=!done;
 $('g-score').textContent=played?'· 已猜 '+played+' 个，得分 '+total+' / '+played*4:'';
}
function newRound(){
 done=false;shown=1;
 $('g-feedback').textContent='';$('g-feedback').className='feedback';
 $('g-options').innerHTML=shuffle(CS).map(c=>'<button data-g="'+c.id+'">'+c.name+'</button>').join('');
 for(const b of $('g-options').querySelectorAll('button'))b.addEventListener('click',()=>guess(b));
 drawGuess();
}
function guess(b){
 if(done)return;
 const c=byId(order[gi]);
 if(b.dataset.g===c.id){
  done=true;const pts=5-shown;total+=pts;played++;
  b.setAttribute('aria-pressed','true');
  $('g-feedback').textContent='✓ 是'+c.name+'！用了 '+shown+' 条线索，得 '+pts+' 分。首都：'+c.capital+'。';
  $('g-feedback').className='feedback success';
  shown=c.clues.length;
 }else{
  b.disabled=true;b.style.opacity=.45;
  if(shown<c.clues.length){shown++;$('g-feedback').textContent='✗ 不是'+byId(b.dataset.g).name+'，再给你一条线索。';}
  else{done=true;played++;$('g-feedback').textContent='✗ 答案是'+c.name+'。';}
  $('g-feedback').className='feedback retry';
 }
 drawGuess();
}
$('g-more').addEventListener('click',()=>{const c=byId(order[gi]);if(shown<c.clues.length){shown++;drawGuess();}});
$('g-next').addEventListener('click',()=>{gi=(gi+1)%order.length;if(gi===0)order=shuffle(order);newRound();});

/* ---------- 六国一览 ---------- */
function drawTable(){
 let rows=CS.slice();
 if(state.sort==='area')rows.sort((a,b)=>NUM[b.id][0]-NUM[a.id][0]);
 if(state.sort==='pop')rows.sort((a,b)=>NUM[b.id][1]-NUM[a.id][1]);
 const th=(k,l)=>'<th><button type="button" class="ghost" data-sort="'+k+'" style="font:inherit;padding:0;background:none;border:0;cursor:pointer;color:inherit">'+l+(state.sort===k?' ↓':'')+'</button></th>';
 $('c-table').innerHTML='<thead><tr><th>国家</th><th>所在大洲</th><th>首都</th>'+th('area','面积')+th('pop','人口')+'</tr></thead><tbody>'+
  rows.map(c=>'<tr><td><b>'+c.name+'</b></td><td>'+NUM[c.id][2]+'</td><td>'+c.capital+'</td><td>'+c.area.replace('平方千米','km²')+'</td><td>'+c.pop+'</td></tr>').join('')+'</tbody>';
 for(const b of $('c-table').querySelectorAll('[data-sort]'))b.addEventListener('click',()=>{state.sort=b.dataset.sort;drawTable();});
}

/* ---------- 练习 ---------- */
const qs=[
 {title:'日本多火山、地震，是因为它位于——',opts:[['a','亚欧板块与太平洋板块交界处'],['b','板块内部'],['c','赤道附近']],answer:'a',yes:'正确！板块交界处地壳活跃，富士山就是一座火山。',no:'回顾第 11 课：板块交界处地壳比较活跃。'},
 {title:'俄罗斯的大部分河流向北流入北冰洋，说明它的地势——',opts:[['a','南高北低'],['b','北高南低'],['c','东西两侧高中间低']],answer:'a',yes:'对！河流从高处流向低处。',no:'提示：水往低处流。'},
 {title:'澳大利亚被称为"骑在羊背上的国家"，主要是因为——',opts:[['a','养羊业发达，羊毛出口量大'],['b','国旗上有羊'],['c','全国都是草原']],answer:'a',yes:'正确！大自流盆地丰富的地下水为养羊业提供了条件。',no:'再看看澳大利亚的经济特点。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();showCountry();newRound();drawTable();
})();
