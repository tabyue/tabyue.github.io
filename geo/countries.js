/* 第 11 课：走近国家（湘教版七下第九章） */
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
 {title:'日本多火山、地震，是因为它位于——',opts:[['a','亚欧板块与太平洋板块交界处'],['b','板块内部'],['c','赤道附近']],answer:'a',yes:'正确！板块交界处地壳活跃，富士山就是一座火山。',no:'回顾第 5 课：板块交界处地壳比较活跃。'},
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

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'世界上面积最大的国家是？',desc:'它地跨亚欧两洲。',options:['俄罗斯','加拿大','中国','美国'],answer:0,hint:'横跨欧亚大陆北部。',explain:'<b>俄罗斯</b>面积最大（约 1710 万平方千米），其次是加拿大、中国、美国。'},
 {level:'base',title:'唯一独占一个大陆的国家是？',desc:'它在南半球。',options:['澳大利亚','巴西','印度','加拿大'],answer:0,hint:'那里有袋鼠。',explain:'<b>澳大利亚</b>独占澳大利亚大陆，特有生物多（袋鼠、鸸鹋、考拉），因长期与其他大陆隔离而独立演化。'},
 {level:'base',title:'世界上热带面积最大的国家是？',desc:'它在南美洲。',options:['巴西','印度','埃及','澳大利亚'],answer:0,hint:'亚马孙雨林在它境内。',explain:'<b>巴西</b>热带面积最大，拥有世界最大的<b>热带雨林</b>——亚马孙雨林。'},
 {level:'mid',title:'日本工业主要分布在太平洋沿岸和濑户内海沿岸，原因是？',desc:'从原料和市场想。',options:['便于原料进口和产品出口','那里矿产最多','那里人口最少','为了躲避地震'],answer:0,hint:'日本矿产贫乏，原料靠进口。',explain:'日本<b>矿产资源贫乏</b>，原料几乎全靠进口，产品大量出口，<b>临海布局</b>可大幅降低运输成本。注意不是因为那里矿多。'},
 {level:'mid',title:'日本多火山地震的原因是？',desc:'看它的板块位置。',options:['位于亚欧板块与太平洋板块交界处','因为是岛国','因为纬度高','因为多山'],answer:0,hint:'它在环太平洋火山地震带上。',explain:'日本处于<b>亚欧板块与太平洋板块交界地带</b>，又在<b>环太平洋火山地震带</b>上，地壳活跃。'},
 {level:'mid',title:'俄罗斯的交通运输以什么为主？',desc:'它地域辽阔、资源分布在内陆。',options:['铁路和管道运输','航空运输','内河航运','海洋运输'],answer:0,hint:'运石油天然气用什么最划算？',explain:'<b>铁路</b>（如西伯利亚大铁路）承担主要客货运，<b>管道</b>运输石油天然气。因为纬度高、多数港口冬季封冻，海运受限。'},
 {level:'mid',title:'印度最主要的粮食作物是？',desc:'南亚的热带季风气候适合种什么。',options:['水稻和小麦','玉米和大豆','咖啡和甘蔗','棉花和黄麻'],answer:0,hint:'雨季降水丰沛的地方适合种什么？',explain:'印度以<b>水稻</b>（降水多的东北部和沿海）和<b>小麦</b>（降水较少的西北部）为主。棉花、黄麻是经济作物。'},
 {level:'trap',title:'澳大利亚特有生物多的主要原因是？',desc:'想想它的地理隔离。',options:['长期与其他大陆隔离，生物独立演化','气候特别温暖','人类保护得好','面积特别大'],answer:0,hint:'很早就孤立在海洋中了。',explain:'澳大利亚大陆<b>很早就与其他大陆分离</b>，长期<b>地理隔离</b>使生物独立演化，保留了袋鼠等古老物种。「保护得好」是次要因素，<b>根本原因是隔离</b>。'}
]);
