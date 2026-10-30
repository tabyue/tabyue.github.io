(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R,arrow:A}=Site.S;

/* ---------- 水循环 ---------- */
const PROC={
 evap:{name:'蒸发',d:'M96 226L96 128',lx:104,ly:186,text:'海洋表面的水吸收太阳热量变成水汽，进入大气。海洋是大气中水汽最主要的来源。'},
 precipSea:{name:'降水',d:'M52 128L52 224',lx:8,ly:186,text:'海洋上空的水汽凝结成云，再以降水形式直接落回海洋。'},
 transport:{name:'水汽输送',d:'M168 76Q240 50 312 66',lx:206,ly:48,text:'大气运动把海洋上空的水汽带到陆地上空。夏季风就是我国东部重要的水汽输送。'},
 precipLand:{name:'降水',d:'M372 98L372 158',lx:380,ly:134,text:'水汽上升冷却、凝结成云，再以雨、雪等形式落到陆地。'},
 transp:{name:'植物蒸腾',d:'M292 192Q302 140 330 104',lx:228,ly:150,text:'植物通过叶片把水分散发到大气中；陆地表面的水也会蒸发。它们参与陆地内循环。'},
 runoff:{name:'地表径流',d:'M416 150Q380 186 330 206Q280 224 226 232',lx:236,ly:258,text:'落到地面的水沿地表汇入河流，最终流回海洋。'},
 infil:{name:'下渗',d:'M352 196L352 262',lx:360,ly:240,text:'一部分降水渗入土壤和岩石，补给地下水。植被好、地面松软时，下渗更多。'},
 ground:{name:'地下径流',d:'M340 292Q290 304 232 296',lx:256,ly:322,text:'地下水在岩土中缓慢流动，补给河流或直接流入海洋。'}
};
const CYCLES={all:Object.keys(PROC),sealand:['evap','transport','precipLand','runoff','infil','ground'],sea:['evap','precipSea'],land:['transp','precipLand']};
const CYCLE_TEXT={
 all:['水循环','共 8 个环节','水在海洋、大气、陆地之间不停地运动和转化，这个过程叫水循环。太阳辐射提供能量，地球引力让水落下、向低处流。'],
 sealand:['海陆间循环','6 个环节','海洋水蒸发 → 水汽输送 → 陆地降水 → 地表径流、下渗与地下径流 → 回到海洋。它使陆地上的水不断得到补充和更新，是最重要的一种水循环。'],
 sea:['海上内循环','2 个环节','海面蒸发 → 降水落回海洋。它发生在海洋上空，参与的水量最大。'],
 land:['陆地内循环','2 个环节','陆面蒸发和植物蒸腾 → 降水落回陆地。内陆地区的水主要靠它补充，但补给量较少。']
};
const state={cycle:'all',proc:null,river:'yangtze',reach:0};
const hp=new URLSearchParams(location.hash.replace(/^#/,''));
if(['yangtze','yellow'].includes(hp.get('river')))state.river=hp.get('river');
const rr=G.parseNumber(location.hash,'reach',0,2);if(rr!==null)state.reach=Math.round(rr);

function drawCycle(){
 const active=new Set(CYCLES[state.cycle]);
 let s='<defs>'+A('wa','#4f8197')+A('wo','#b97342')+A('wd','#c3cdc0')+'<linearGradient id="sky" x2="0" y2="1"><stop stop-color="#eef5f6"/><stop offset="1" stop-color="#f8faf4"/></linearGradient></defs>';
 s+=R(0,0,520,340,'url(#sky)',12);
 s+=C(452,46,20,'#f4c56b','#e3a94a',1)+T(452,82,'太阳',11,'#8a6a2c',500,'middle');
 s+=R(0,228,226,112,'#9cc0cc')+T(14,322,'海洋',13,'#2f6377',700);
 s+=P('M220 230L262 226Q330 204 382 150L430 112L470 140Q500 160 520 166L520 340L220 340Z','#8a9f7e',1.2,'#dfe7d3');
 s+=P('M232 278Q300 270 360 270Q420 272 520 282','#a9bba3',1,'none','stroke-dasharray="3 4"')+T(452,300,'地下水',11,'#5d6a3c',500,'middle');
 s+=P('M416 150Q380 186 330 206Q280 224 226 232','#6b97a6',3.4);
 for(const [x,y] of [[284,206],[300,202],[316,198]])s+=L(x,y,x,y-14,'#7b6a4a',2)+C(x,y-18,8,'#9cbf88','#7fa06c',1);
 for(const [cx,cy,w] of [[104,104,52],[352,82,50]])s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+w+'" ry="17" fill="#fff" stroke="#c3d0bf"/><ellipse cx="'+(cx+22)+'" cy="'+(cy-11)+'" rx="30" ry="13" fill="#fff" stroke="#c3d0bf"/>';
 for(const [k,p] of Object.entries(PROC)){
  const on=active.has(k),sel=state.proc===k,col=sel?'#b97342':on?'#4f8197':'#c3cdc0',mk=sel?'wo':on?'wa':'wd';
  s+='<g class="svg-hit" data-proc="'+k+'" tabindex="0" role="button" aria-label="'+p.name+'">'+P(p.d,'transparent',18)+P(p.d,col,sel?3.2:2.4,'none','marker-end="url(#'+mk+')"'+(on?'':' stroke-dasharray="4 4"'))+
   T(p.lx,p.ly,p.name,12.5,sel?'#7a4520':on?'#2f5a6a':'#a4aea0',sel?700:600,'start','paint-order="stroke" stroke="#f8faf4" stroke-width="3.5"')+'</g>';
 }
 $('cycle').innerHTML=s;
 for(const g of $('cycle').querySelectorAll('[data-proc]')){
  g.addEventListener('click',()=>selectProc(g.dataset.proc));
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectProc(g.dataset.proc);}});
 }
}
function selectProc(k){
 state.proc=state.proc===k?null:k;
 for(const b of $('process-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.proc===state.proc));
 if(state.proc){const p=PROC[state.proc];$('process-title').textContent=p.name+(state.proc==='precipSea'?'（海洋）':state.proc==='precipLand'?'（陆地）':'');
  const inC=Object.entries(CYCLES).filter(([c,list])=>c!=='all'&&list.includes(state.proc)).map(([c])=>CYCLE_TEXT[c][0]);
  $('process-badge').textContent=inC.length?'属于 '+inC.join('、'):'';$('process-text').textContent=p.text;}
 else showCycleText();
 drawCycle();
}
function showCycleText(){const t=CYCLE_TEXT[state.cycle];$('process-title').textContent=t[0];$('process-badge').textContent=t[1];$('process-text').textContent=t[2];}
$('process-chips').innerHTML=Object.entries(PROC).map(([k,p])=>'<button data-proc="'+k+'">'+p.name+(k==='precipSea'?'（海）':k==='precipLand'?'（陆）':'')+'</button>').join('');
for(const b of $('process-chips').querySelectorAll('button'))b.addEventListener('click',()=>selectProc(b.dataset.proc));
for(const b of $('cycle-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.cycle=b.dataset.cycle;state.proc=null;Site.pressed($('cycle-chips'),b);for(const c of $('process-chips').querySelectorAll('button'))c.setAttribute('aria-pressed','false');showCycleText();drawCycle();});

/* ---------- 人类活动 ---------- */
const HU=[
 ['修建水库','runoff','改变地表径流的时间分配：汛期蓄水，枯水期放水。'],
 ['南水北调','runoff','跨流域调水，改变地表径流的空间分布。'],
 ['植树造林','infil','增加下渗、减少地表径流，起到涵养水源的作用。'],
 ['城市大面积硬化路面','infil','下渗减少，地表径流增加，暴雨时更容易积水。'],
 ['铺设透水砖（海绵城市）','infil','增加下渗，减轻城市内涝。'],
 ['人工增雨','precip','促使云中水汽凝结降落，影响的是降水环节。']
];
const HU_OPT=[['precip','降水'],['infil','下渗'],['runoff','地表径流']];
let huRight=0,huDone=0;
$('hu-list').innerHTML=HU.map(([q],i)=>'<div class="choice-row" data-i="'+i+'"><div><p>'+q+'</p><p class="verdict" hidden></p></div><div class="chips small">'+HU_OPT.map(([v,l])=>'<button data-v="'+v+'">'+l+'</button>').join('')+'</div></div>').join('');
for(const row of $('hu-list').querySelectorAll('.choice-row')){
 const [,ans,why]=HU[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';huDone++;const ok=b.dataset.v===ans;if(ok)huRight++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ 应是“'+HU_OPT.find(o=>o[0]===ans)[1]+'”。')+why;
  $('hu-score').textContent=huDone===HU.length?'答对 '+huRight+' / '+HU.length:'已答 '+huDone+' / '+HU.length;
 });
}

/* ---------- 分水岭 ---------- */
const RIDGE=210,VL=40,VR=380,GROUND=172,TOPY=42;
const ySurf=x=>{if(x<=VL||x>=VR)return GROUND;const t=x<RIDGE?(x-VL)/(RIDGE-VL):(VR-x)/(VR-RIDGE);return GROUND-(GROUND-TOPY)*Math.pow(Math.sin(t*Math.PI/2),1.4);};
let drop=null,anim=0;
function drawDivide(){
 let d='M0 '+GROUND;for(let x=0;x<=420;x+=4)d+='L'+x+' '+ySurf(x).toFixed(1);d+='L420 210L0 210Z';
 let s=R(0,0,420,210,'#f3f7f1',12)+P(d,'#8a9f7e',1.2,'#dfe7d3');
 s+=R(VL-18,GROUND-4,36,8,'#6b97a6',4)+R(VR-18,GROUND-4,36,8,'#6b97a6',4);
 s+=T(VL,GROUND+24,'甲河',13,'#2f6377',700,'middle')+T(VR,GROUND+24,'乙河',13,'#2f6377',700,'middle');
 s+=L(RIDGE,TOPY-22,RIDGE,TOPY,'#b97342',1.4,'stroke-dasharray="3 3"')+T(RIDGE,TOPY-26,'分水岭（山脊）',12,'#7a4520',700,'middle');
 s+=T(110,200,'← 甲河流域',11.5,'#5d6a3c',600,'middle')+T(310,200,'乙河流域 →',11.5,'#5d6a3c',600,'middle');
 if(drop)s+=C(drop.x,drop.y-4,5,'#4f8197','#fff',1.4);
 $('divide').innerHTML=s;
}
function rain(x){
 cancelAnimationFrame(anim);
 x=G.clamp(x,VL+4,VR-4);
 if(Math.abs(x-RIDGE)<3){drop={x,y:ySurf(x)};$('drop-badge').textContent='正好落在分水岭上';$('drop-text').textContent='落在山脊线上的雨，往哪边流取决于更细微的地形——这条线正是两个流域的分界。';drawDivide();return;}
 const target=x<RIDGE?VL:VR,name=x<RIDGE?'甲河':'乙河';
 $('drop-badge').textContent='流向'+name;
 $('drop-text').textContent='这滴雨落在分水岭'+(x<RIDGE?'西':'东')+'侧，顺坡流进'+name+'，属于'+name+'流域。';
 if(Site.reduce.matches){drop={x:target,y:GROUND};drawDivide();return;}
 const x0=x,t0=performance.now(),dur=900+Math.abs(target-x)*3;
 const step=now=>{const k=Math.min(1,(now-t0)/dur),e=k*k;const cx=x0+(target-x0)*e;drop={x:cx,y:ySurf(cx)};drawDivide();if(k<1)anim=requestAnimationFrame(step);};
 anim=requestAnimationFrame(step);
}
$('divide').addEventListener('click',e=>{const p=Site.svgPoint($('divide'),e);rain(p.x);});
$('divide').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();rain(RIDGE-60);}if(e.key==='ArrowRight'){e.preventDefault();rain(RIDGE+60);}});

/* ---------- 长江与黄河 ---------- */
const RIVERS={
 yangtze:{name:'长江',sea:'东海',source:'唐古拉山脉各拉丹冬雪山',
  info:'我国第一长河，全长 6300 多千米。发源于青藏高原唐古拉山脉主峰各拉丹冬雪山，自西向东流，注入东海。水量丰富，航运价值大，被誉为“黄金水道”。',
  reaches:[
   {name:'上游',range:'源头—湖北宜昌',len:4504,text:'河段最长，流经高原和山地，落差大、水流急，水能资源丰富。著名的长江三峡在这一段末端，三峡水利枢纽建在宜昌附近。'},
   {name:'中游',range:'湖北宜昌—江西湖口',len:955,text:'进入平原，地势低平，河道弯曲。荆江河段素有“九曲回肠”之称，汛期容易发生洪涝。沿岸的洞庭湖、鄱阳湖能调节长江水量。'},
   {name:'下游',range:'江西湖口—入海口',len:938,text:'江阔水深，水流平稳，航运便利，沿岸城市密集。最终在上海附近注入东海。'}],
  marks:['宜昌','湖口']},
 yellow:{name:'黄河',sea:'渤海',source:'巴颜喀拉山脉',
  info:'我国第二长河，全长 5464 千米。发源于青海省巴颜喀拉山脉，干流大致呈“几”字形，自西向东流，注入渤海。本页中下游分界采用黄河水利委员会的划分（桃花峪），部分教材写作“旧孟津”。',
  reaches:[
   {name:'上游',range:'源头—内蒙古河口镇',len:3472,text:'流经高原、峡谷，落差大，水能丰富，建有龙羊峡、刘家峡等水电站。宁夏平原、河套平原引黄灌溉，有“塞上江南”之称。'},
   {name:'中游',range:'河口镇—河南桃花峪',len:1206,text:'流经黄土高原。这里植被少、土质疏松，夏季多暴雨，水土流失严重，大量泥沙进入黄河，是黄河泥沙的主要来源。'},
   {name:'下游',range:'桃花峪—入海口',len:786,text:'地势平坦，水流变缓，泥沙大量淤积，河床不断抬高，高出两岸地面，形成“地上河”（悬河）。'}],
  marks:['河口镇','桃花峪']}
};
function drawRiver(){
 const r=RIVERS[state.river],total=r.reaches.reduce((a,b)=>a+b.len,0),x0=24,x1=396;
 const xs=[x0];r.reaches.forEach(re=>xs.push(xs[xs.length-1]+(x1-x0)*re.len/total));
 const yAt=x=>{const t=(x-x0)/(x1-x0);return 172-128*Math.pow(1-t,3.2)-(t<.62?8*(1-t/.62):0);};
 let s='';
 const colors=['#c9b48a','#b9cfa6','#a9c6cf'];
 r.reaches.forEach((re,i)=>{const sel=i===state.reach;s+=R(xs[i],40,xs[i+1]-xs[i],150,sel?'#fbf3e6':'transparent',0);});
 let d='M'+x0+' '+yAt(x0).toFixed(1);for(let x=x0;x<=x1;x+=3)d+='L'+x+' '+yAt(x).toFixed(1);
 s+=P(d+'L'+x1+' 190L'+x0+' 190Z','none',0,'#e7ecdf');
 r.reaches.forEach((re,i)=>{let seg='M'+xs[i]+' '+yAt(xs[i]).toFixed(1);for(let x=xs[i];x<=xs[i+1];x+=3)seg+='L'+x.toFixed(1)+' '+yAt(x).toFixed(1);seg+='L'+xs[i+1].toFixed(1)+' '+yAt(xs[i+1]).toFixed(1);
  s+='<g class="svg-hit" data-reach="'+i+'" role="button" tabindex="0" aria-label="'+r.name+re.name+'">'+P(seg,'transparent',22)+P(seg,i===state.reach?'#b97342':'#5f97ae',i===state.reach?4.4:3.2)+'</g>';
  const mid=(xs[i]+xs[i+1])/2,c=i===state.reach?'#7a4520':'#5d6a3c',w=i===state.reach?700:500;s+=T(mid,203,re.name,12,c,w,'middle')+T(mid,217,re.len+' 千米',10.5,c,w,'middle');});
 r.marks.forEach((m,i)=>{const x=xs[i+1];s+=L(x,46,x,190,'#9eb097',1,'stroke-dasharray="3 3"')+T(x,40,m,12,'#2f4a3c',700,'middle');});
 s+=C(x0,yAt(x0),3.5,'#5f97ae')+T(x0+10,yAt(x0)+4,'源头：'+r.source,11.5,'#2f4a3c',600,'start')+T(x1,yAt(x1)-12,'注入'+r.sea,11.5,'#2f6377',700,'end');
 s+=T(x1,16,'地势西高东低 →',11,'#8b9784',400,'end');
 $('river').innerHTML=s;
 for(const g of $('river').querySelectorAll('[data-reach]')){g.addEventListener('click',()=>setReach(Number(g.dataset.reach)));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setReach(Number(g.dataset.reach));}});}
 const re=r.reaches[state.reach];
 $('reach-title').textContent=r.name+re.name;$('reach-range').textContent=re.range;$('reach-text').textContent=re.text+'（约 '+re.len+' 千米）';
 $('river-title').textContent=r.name;$('river-text').textContent=r.info;
 for(const b of $('reach-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.reach)===state.reach));
 for(const b of $('river-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.river===state.river));
 Site.replaceHash('river='+state.river+'&reach='+state.reach);
}
function setReach(i){state.reach=i;drawRiver();}
for(const b of $('reach-chips').querySelectorAll('button'))b.addEventListener('click',()=>setReach(Number(b.dataset.reach)));
for(const b of $('river-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.river=b.dataset.river;drawRiver();});
Site.setShareState(()=>'river='+state.river+'&reach='+state.reach);

/* ---------- 练习 ---------- */
const qs=[
 {title:'哪种水循环让陆地上的水不断得到补充和更新？',opts:[['sealand','海陆间循环'],['sea','海上内循环'],['land','陆地内循环']],answer:'sealand',yes:'正确！海陆间循环把海洋水汽送到陆地，再通过径流流回海洋。',no:'提示：要“补充”陆地，水得从海洋来。'},
 {title:'黄河的泥沙主要来自哪个河段？',opts:[['up','上游'],['mid','中游'],['down','下游']],answer:'mid',yes:'对了！中游流经黄土高原，水土流失严重。',no:'提示：想想黄土高原在黄河的哪一段。'},
 {title:'城市大面积铺设不透水路面，哪个环节会明显减少？',opts:[['evap','蒸发'],['infil','下渗'],['precip','降水']],answer:'infil',yes:'正确！雨水渗不下去，地表径流就增加，暴雨时容易内涝。',no:'提示：水泥路面挡住的是水往哪里走？'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-description').textContent='';$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=q.opts.map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawCycle();drawDivide();drawRiver();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'我国最长的河流是？',desc:'它发源于青藏高原，注入东海。',options:['长江','黄河','珠江','黑龙江'],answer:0,hint:'约 6300 千米。',explain:'<b>长江</b>最长（约 6300 千米），也是水量最大的河流；黄河是第二长河。'},
 {level:'base',title:'黄河最突出的特点是？',desc:'它流经黄土高原。',options:['含沙量大','水量最大','最长','结冰期最长'],answer:0,hint:'「一碗水半碗沙」。',explain:'黄河<b>含沙量世界第一</b>。泥沙主要来自<b>中游黄土高原</b>的水土流失。'},
 {level:'base',title:'水循环的主要环节包括？',desc:'水从海洋到陆地再回去。',options:['蒸发、水汽输送、降水、径流','只有蒸发和降水','只有降水','只有径流'],answer:0,hint:'想想一滴水的完整旅程。',explain:'主要环节：<b>蒸发 → 水汽输送 → 降水 → 地表（地下）径流 → 回到海洋</b>。正是水循环使水资源可以不断更新。'},
 {level:'mid',title:'黄河下游形成「地上河」的原因是？',desc:'上游带来的泥沙到哪去了。',options:['中游泥沙在下游淤积，河床不断抬高','下游降水太多','下游人工筑高了河床','下游地势太低'],answer:0,hint:'流速变慢，泥沙就沉下来了。',explain:'中游流经<b>黄土高原</b>携带大量泥沙，下游进入平原<b>流速减慢</b>，泥沙<b>淤积抬高河床</b>，两岸不断筑堤，形成「地上河」。'},
 {level:'mid',title:'治理黄河的关键措施是？',desc:'从泥沙的来源下手。',options:['加强中游黄土高原的水土保持','在下游多筑堤坝','在上游多建水库','把河道挖深'],answer:0,hint:'治标还是治本？',explain:'关键是<b>中游水土保持</b>（植树种草、打坝淤地、修梯田），从源头<b>减少泥沙</b>。下游筑堤只是治标。'},
 {level:'mid',title:'长江被称为「黄金水道」，主要是因为？',desc:'从航运价值考虑。',options:['水量大、水流平稳、航运价值高','水能资源最丰富','含沙量小','流经城市最多'],answer:0,hint:'「黄金」说的是运输价值。',explain:'长江中下游<b>水量大、水流平稳、终年不冻</b>，航运价值极高，故称<b>黄金水道</b>；「水能宝库」说的则是上游落差大、水能丰富。'},
 {level:'mid',title:'分水岭的作用是？',desc:'上面点一滴雨看它往哪边流。',options:['划分不同的流域','阻挡河流','储存地下水','产生降水'],answer:0,hint:'山脊两侧的水流向不同方向。',explain:'分水岭（通常是<b>山脊</b>）把降水分别导向两侧，<b>划分不同的流域</b>。落在山脊两侧的雨，最终会流进不同的河。'},
 {level:'trap',title:'长江与黄河都发源于哪个高原？',desc:'我国地势第一级阶梯。',options:['青藏高原','黄土高原','云贵高原','内蒙古高原'],answer:0,hint:'中华水塔在哪里？',explain:'两条大河都发源于<b>青藏高原</b>（被称为「中华水塔」）。注意<b>黄土高原</b>是黄河<b>中游</b>流经的地方、泥沙的来源地，不是发源地——这两个最容易混。'}
]);
