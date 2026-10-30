(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};

/* ---------- 三级阶梯 ---------- */
const STEPS=[
 {title:'第一级阶梯',alt:'平均海拔 4000 米以上',areas:'主要地形区：青藏高原（被称为“世界屋脊”）、柴达木盆地。',border:'与第二级阶梯的分界：昆仑山脉—祁连山脉—横断山脉。',x:[10,174]},
 {title:'第二级阶梯',alt:'平均海拔 1000—2000 米',areas:'以高原、盆地为主：内蒙古高原、黄土高原、云贵高原，准噶尔盆地、塔里木盆地、四川盆地。',border:'与第三级阶梯的分界：大兴安岭—太行山脉—巫山—雪峰山。',x:[174,352]},
 {title:'第三级阶梯',alt:'海拔多在 500 米以下',areas:'以平原、丘陵为主：东北平原、华北平原、长江中下游平原，辽东丘陵、山东丘陵、东南丘陵。',border:'再向东是近海的大陆架浅海。',x:[352,486]}
];
const PROFILE=[[14,4300],[40,4700],[60,4500],[80,4900],[100,4600],[120,4400],[140,4800],[160,4500],[172,5000],[188,2400],[200,1800],[215,1600],[230,1200],[245,700],[260,500],[275,550],[290,900],[305,1500],[320,1700],[335,1500],[350,2000],[362,600],[380,200],[400,100],[420,250],[435,80],[455,50],[470,25],[486,0]];
const hy=h=>232-h/5000*172,X=x=>48+(x-14)*(486-48)/(486-14);
const state={step:0};
const hs=G.parseNumber(location.hash,'step',0,2);if(hs!==null)state.step=Math.round(hs);
function drawSteps(){
 let s=R(0,0,520,262,'#f6f8f2',12);
 for(const h of [0,1000,2000,3000,4000,5000]){const y=hy(h);s+=L(40,y,512,y,'#e4e9de',.8)+T(36,y+4.5,h===0?'0':String(h),13,'#6f8268',400,'end');}
 s+=T(4,20,'海拔/米',13,'#6f8268');
 STEPS.forEach((st,i)=>{s+='<g class="svg-hit" data-step="'+i+'" role="button" tabindex="0" aria-label="'+st.title+'">'+R(X(st.x[0]),32,X(st.x[1])-X(st.x[0]),200,i===state.step?'#fbf1e0':'transparent')+'</g>';});
 let d='M'+X(PROFILE[0][0]).toFixed(1)+' '+hy(0);for(const [x,h] of PROFILE)d+='L'+X(x).toFixed(1)+' '+hy(h).toFixed(1);d+='L486 '+hy(0)+'Z';
 s+=P(d,'#8a7a5c',1.3,'#e4d7b8','pointer-events="none"');
 s+=R(486,hy(0)-3,26,12,'#9cc0cc',2,'pointer-events="none"')+T(499,hy(0)-8,'海',13,'#2f6377',700,'middle');
 const labels=[[92,'第一级'],[263,'第二级'],[419,'第三级']];
 labels.forEach(([x,t],i)=>{s+=T(X(x),26,t,18,i===state.step?'#7a4520':'#4f6549',700,'middle','pointer-events="none"');});
 for(const [x0,n] of [[174,'①'],[352,'②']]){const x=X(x0);s+=L(x,34,x,232,'#b97342',1.2,'stroke-dasharray="4 3" pointer-events="none"')+T(x,254,'分界线'+n,13,'#7a4520',700,'middle','pointer-events="none"');}
 s+=T(X(262),hy(500)-10,'盆地',13,'#6b5a3a',600,'middle','pointer-events="none"')+T(X(92),hy(4700)+28,'高原',13,'#6b5a3a',600,'middle','pointer-events="none"')+T(X(440),hy(50)-12,'平原',13,'#6b5a3a',600,'middle','pointer-events="none"');
 s+=T(44,254,'西',13,'#6f8268')+T(500,254,'东',13,'#6f8268',400,'end');
 $('steps').innerHTML=s;
 for(const g of $('steps').querySelectorAll('[data-step]')){g.addEventListener('click',()=>setStep(Number(g.dataset.step)));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setStep(Number(g.dataset.step));}});}
 const st=STEPS[state.step];
 $('step-title').textContent=st.title;$('step-alt').textContent=st.alt;$('step-areas').textContent=st.areas;$('step-border').textContent=st.border;
 for(const b of $('step-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.step)===state.step));
 Site.replaceHash('step='+state.step);
}
function setStep(i){state.step=i;drawSteps();}
for(const b of $('step-chips').querySelectorAll('button'))b.addEventListener('click',()=>setStep(Number(b.dataset.step)));
Site.setShareState(()=>'step='+state.step);

/* ---------- 南方与北方 ---------- */
const bj=G.CITIES.find(c=>c.id==='beijing'),sz=G.CITIES.find(c=>c.id==='shenzhen');
const t=v=>String(v).replace('-','−')+'℃';
const ROWS=[
 ['1 月平均气温',t(bj.temp[0]),t(sz.temp[0])],
 ['7 月平均气温',t(bj.temp[6]),t(sz.temp[6])],
 ['年降水量',Math.round(G.climateStats(bj).total)+' 毫米',Math.round(G.climateStats(sz).total)+' 毫米'],
 ['温度带','暖温带','亚热带'],
 ['干湿地区','半湿润区','湿润区'],
 ['河流冬季','有结冰期','不结冰'],
 ['耕地与作物','旱地为主；小麦、玉米','水田为主；水稻']
];
$('ns-table').innerHTML=ROWS.map(r=>'<tr><td>'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td></tr>').join('');

/* ---------- 七大洲四大洋 ---------- */
const CONT=G.CONTINENTS,OCEAN=G.OCEANS,maxC=CONT[0][1],maxO=OCEAN[0][1];
const bars=(list,max,cls)=>list.map(([n,a])=>'<div class="bar-item '+cls+'"><span>'+n+'</span><div class="track"><div class="fill" style="width:'+(a/max*100).toFixed(1)+'%"></div></div><em>'+a+' 万</em></div>').join('');
$('ocean-bars').innerHTML=bars(OCEAN,maxO,'ocean')+'<p class="note">单位：万平方千米</p>';
let next=0;
function resetPick(){next=0;$('cont-pick').innerHTML=shuffle(CONT).map(([n])=>'<button data-name="'+n+'">'+n+'</button>').join('');$('cont-result').textContent='第 1 大的是？';$('cont-bars').hidden=true;
 for(const b of $('cont-pick').querySelectorAll('button'))b.addEventListener('click',()=>{
  if(b.disabled)return;
  if(b.dataset.name===CONT[next][0]){b.disabled=true;b.textContent=(next+1)+'. '+b.dataset.name;next++;
   if(next===CONT.length){$('cont-result').textContent='全部正确！亚洲最大，大洋洲最小。';showContBars();}
   else $('cont-result').textContent='对！第 '+(next+1)+' 大的是？';}
  else $('cont-result').textContent=b.dataset.name+' 还不是第 '+(next+1)+' 大，再想想。';
 });}
function showContBars(){$('cont-bars').hidden=false;$('cont-bars').innerHTML=bars(CONT,maxC,'')+'<p class="note">单位：万平方千米。七大洲合计约 1.5 亿平方千米。</p>';}
$('cont-reveal').addEventListener('click',()=>{for(const b of $('cont-pick').querySelectorAll('button')){const i=CONT.findIndex(c=>c[0]===b.dataset.name);b.disabled=true;b.textContent=(i+1)+'. '+b.dataset.name;}
 const sorted=Array.from($('cont-pick').children).sort((a,b)=>parseInt(a.textContent)-parseInt(b.textContent));sorted.forEach(b=>$('cont-pick').appendChild(b));
 $('cont-result').textContent='面积从大到小：'+CONT.map(c=>c[0]).join(' > ');showContBars();});
resetPick();

/* ---------- 洲界 ---------- */
const BORDERS=[
 ['亚洲 — 欧洲','ural',[['ural','乌拉尔山脉等'],['suez','苏伊士运河'],['bering','白令海峡']],'以乌拉尔山脉、乌拉尔河、大高加索山脉和土耳其海峡为界。'],
 ['亚洲 — 非洲','suez',[['panama','巴拿马运河'],['suez','苏伊士运河'],['gib','直布罗陀海峡']],'以苏伊士运河为界。'],
 ['北美洲 — 南美洲','panama',[['bering','白令海峡'],['drake','德雷克海峡'],['panama','巴拿马运河']],'以巴拿马运河为界。'],
 ['亚洲 — 北美洲','bering',[['bering','白令海峡'],['gib','直布罗陀海峡'],['suez','苏伊士运河']],'以白令海峡为界。'],
 ['欧洲 — 非洲','gib',[['drake','德雷克海峡'],['gib','直布罗陀海峡'],['ural','乌拉尔山脉等']],'隔地中海相望，以直布罗陀海峡为界。'],
 ['南美洲 — 南极洲','drake',[['panama','巴拿马运河'],['bering','白令海峡'],['drake','德雷克海峡']],'以德雷克海峡为界。']
];
let bRight=0,bDone=0;
$('border-list').innerHTML=BORDERS.map(([q,,opts],i)=>'<div class="choice-row" data-i="'+i+'"><div><p><b>'+q+'</b></p><p class="verdict" hidden></p></div><div class="chips small">'+opts.map(([v,l])=>'<button data-v="'+v+'">'+l+'</button>').join('')+'</div></div>').join('');
for(const row of $('border-list').querySelectorAll('.choice-row')){
 const [,ans,,why]=BORDERS[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{
  if(row.dataset.done)return;row.dataset.done='1';bDone++;const ok=b.dataset.v===ans;if(ok)bRight++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);
  const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+why;
  $('border-score').textContent=bDone===BORDERS.length?'答对 '+bRight+' / '+BORDERS.length:'已答 '+bDone+' / '+BORDERS.length;
 });
}

/* ---------- 聚落选址 ---------- */
const SITES={
 A:{x:165,y:166,ok:false,text:'A 在河漫滩上：离水近、地势平，但地势低，汛期容易被洪水淹没。'},
 B:{x:78,y:126,ok:true,text:'B 在河流阶地上：地势平坦、靠近水源，又高出洪水位，不易被淹，是建村的好地方。'},
 C:{x:330,y:92,ok:false,text:'C 在陡峭的山坡上：建房、耕作和出行都不方便，雨季还可能有滑坡风险。'}
};
let picked=null;
function drawSettle(){
 let s=R(0,0,420,210,'#f3f7f1',12);
 s+=P('M0 130L120 130L136 170L196 172L198 182L236 182L240 170Q300 120 340 80Q370 52 420 40L420 210L0 210Z','#8a9f7e',1.2,'#dfe7d3');
 s+=R(196,172,42,10,'#6b97a6',0)+T(217,200,'河流',12,'#2f6377',700,'middle');
 s+=L(130,160,244,160,'#4f8197',1.2,'stroke-dasharray="4 3"')+T(250,158,'洪水位',11,'#2f6377',600,'start');
 for(const [k,p] of Object.entries(SITES)){const sel=picked===k,col=sel?(p.ok?'#2f7a52':'#b0663a'):'#b97342';
  s+='<g class="svg-hit" data-site="'+k+'" role="button" tabindex="0" aria-label="位置 '+k+'">'+C(p.x,p.y-12,16,'transparent')+P('M'+p.x+' '+(p.y-2)+'l-9 -10h18z',col,1,col)+R(p.x-9,p.y-22,18,10,col,2)+T(p.x,p.y-28,k,15,col,800,'middle')+'</g>';}
 s+=T(78,148,'河流阶地',11,'#5d6a3c',500,'middle')+T(166,190,'河漫滩',11,'#5d6a3c',500,'middle')+T(360,118,'陡坡',11,'#5d6a3c',500,'middle');
 $('settle').innerHTML=s;
 for(const g of $('settle').querySelectorAll('[data-site]')){const f=()=>{picked=g.dataset.site;const p=SITES[picked];$('settle-feedback').textContent=(p.ok?'✓ ':'✗ ')+p.text;$('settle-feedback').className='feedback '+(p.ok?'success':'retry');drawSettle();};
  g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();}});}
}

/* ---------- 练习 ---------- */
const qs=[
 {title:'我国地势第一、二级阶梯的分界线是？',opts:[['a','昆仑山脉—祁连山脉—横断山脉'],['b','大兴安岭—太行山脉—巫山—雪峰山'],['c','秦岭—淮河一线']],answer:'a',yes:'正确！大兴安岭—太行山脉—巫山—雪峰山是第二、三级阶梯的分界。',no:'提示：第一级阶梯就是青藏高原，看它的东、北边缘。'},
 {title:'面积最大的大洲和大洋分别是？',opts:[['a','亚洲、太平洋'],['b','非洲、大西洋'],['c','亚洲、大西洋']],answer:'a',yes:'对了！亚洲约 4400 万平方千米，太平洋约 17968 万平方千米。',no:'再看看上面的面积条形图。'},
 {title:'我国南方地区与北方地区的分界线大致是？',opts:[['a','黑龙江黑河—云南腾冲一线'],['b','秦岭—淮河一线'],['c','大兴安岭—太行山脉一线']],answer:'b',yes:'正确！黑河—腾冲一线是人口分布的分界线，别弄混。',no:'提示：这条线也大致是 1 月 0℃ 等温线。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawSteps();drawSettle();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'世界上面积最大的大洲是？',desc:'七大洲按面积排序的第一个。',options:['亚洲','非洲','北美洲','南极洲'],answer:0,hint:'口诀：亚非北南美……',explain:'<b>亚洲</b>最大。口诀「亚非北南美，南极欧大洋」就是七大洲面积从大到小的顺序。'},
 {level:'base',title:'面积最大的大洋是？',desc:'它占了地球表面很大一块。',options:['太平洋','大西洋','印度洋','北冰洋'],answer:0,hint:'它在亚洲和美洲之间。',explain:'<b>太平洋</b>最大，其次大西洋、印度洋，<b>北冰洋最小也最浅</b>。'},
 {level:'base',title:'我国的地势特点是？',desc:'上面看三级阶梯的剖面。',options:['西高东低，呈三级阶梯','东高西低','中间高四周低','四周高中间低'],answer:0,hint:'大河都往东流说明什么？',explain:'<b>西高东低、呈三级阶梯</b>。所以大河自西向东流，也利于海上湿润气流深入内陆。'},
 {level:'mid',title:'亚洲和欧洲的分界线是？',desc:'一条山脉加几条河海。',options:['乌拉尔山脉—乌拉尔河—大高加索山脉—土耳其海峡','苏伊士运河','巴拿马运河','白令海峡'],answer:0,hint:'想想欧亚大陆中间那条南北向的山脉。',explain:'亚欧分界是<b>乌拉尔山脉—乌拉尔河—里海—大高加索山脉—黑海—土耳其海峡</b>。苏伊士运河分<b>亚非</b>，巴拿马运河分<b>南北美</b>。'},
 {level:'mid',title:'秦岭—淮河一线是什么分界线？',desc:'我国南北方的分界。',options:['1 月 0℃ 等温线和 800 毫米年等降水量线','季风区与非季风区','内流区与外流区','地势一二级阶梯'],answer:0,hint:'它分开了南方和北方。',explain:'秦岭—淮河是<b>1 月 0℃ 等温线</b>与<b>800 毫米年等降水量线</b>经过的地方，也是我国<b>南方与北方</b>的分界。'},
 {level:'mid',title:'亚洲的河流大多呈放射状流向四周，原因是？',desc:'想想水往哪里流。',options:['地势中部高、四周低','降水集中在中部','人口集中在中部','受洋流影响'],answer:0,hint:'水往低处流。',explain:'亚洲<b>中部高、四周低</b>，所以河流从中部向四周呈<b>放射状</b>流出。地形决定水系是常考的因果关系。'},
 {level:'mid',title:'一个地方的人口密度大，通常和哪些条件有关？',desc:'想想人愿意住在哪里。',options:['地形平坦、气候适宜、交通便利','海拔越高越好','越靠近沙漠越好','纬度越高越好'],answer:0,hint:'世界人口稠密区都在什么地方？',explain:'人口稠密区多在<b>中低纬度的沿海平原</b>：地形平坦、气候温暖湿润、交通便利、农业发达。高原、沙漠、雨林、极地则人口稀少。'},
 {level:'trap',title:'大洲和大陆是一回事吗？',desc:'注意两个词的定义差别。',options:['不是，大陆加附近岛屿才叫大洲','是，完全相同','大陆比大洲大','大洲只指岛屿'],answer:0,hint:'亚洲包不包括日本群岛？',explain:'<b>大陆</b>指陆地主体，<b>大洲 = 大陆 + 附近岛屿</b>。所以亚洲包括日本群岛，而「亚欧大陆」不含这些岛。<b>南极洲有大陆，大洋洲没有大陆</b>（它以岛屿为主）。'}
]);
