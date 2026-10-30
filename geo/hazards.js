(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,line:L,circle:C,text:T,rect:R}=Site.S;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const W=G.SZ_WARNINGS,KIND={typhoon:'台风',rain:'暴雨'};
const m=/^(typhoon|rain)-(\d)$/.exec(new URLSearchParams(location.hash.replace(/^#/,'')).get('sig')||'');
const state={kind:m?m[1]:'typhoon',i:m?Math.min(Number(m[2]),W[m?m[1]:'typhoon'].length-1):2};
const TIPS={
 typhoon:['进入注意状态：关注台风最新消息。','加固门窗，收好阳台和窗台上的物品，避免去海边和人多的户外场所。','中小学停课：未出门不必到校，留在安全场所，远离门窗。','留在室内或安全场所避风，危房、工棚、海边的人员要撤离。','确保留在安全场所。台风中心经过时风会突然减弱，这不是台风结束，要防强风再袭。'],
 rain:['关注雨情，防范局部内涝和山体滑坡。','暂停户外活动，避开地铁出入口、地下车库、地下通道等低洼地方。','中小学停课：未出门不必到校，途中就近到安全场所暂避，危险地带人员撤离。']
};

/* ---------- 预警信号 ---------- */
function chips(kind,el){$(el).innerHTML=W[kind].map((w,i)=>'<button data-k="'+kind+'" data-i="'+i+'" style="border-left:6px solid '+w.color+'">'+w.level+'</button>').join('');
 for(const b of $(el).querySelectorAll('button'))b.addEventListener('click',()=>{state.kind=b.dataset.k;state.i=Number(b.dataset.i);drawSignal();});}
chips('typhoon','ty-chips');chips('rain','rs-chips');
function drawSignal(){
 const w=W[state.kind][state.i],name=KIND[state.kind]+w.level+'预警',white=w.level==='白色';
 let s=R(0,0,420,170,'#f6f8f2',12);
 s+=R(22,22,126,126,w.color,18,white?'stroke="#b8c0b4" stroke-width="2"':'');
 s+=T(85,78,KIND[state.kind],26,white?'#4a5a4a':'#fff',800,'middle')+T(85,112,w.level,20,white?'#4a5a4a':'#fff',700,'middle');
 const stop=w.stop;
 s+=R(176,34,222,102,stop?'#fbeee2':'#eaf3e6',14);
 s+=T(196,66,'中小学',14,'#5d6f63',600)+T(196,104,stop?'停课':'正常上课',30,stop?'#b0472e':'#2f6a4a',800);
 s+=T(196,126,stop?'未出门的学生不必到校':'留意天气，注意安全',12,'#6f8268');
 $('signal').innerHTML=s;
 $('sig-title').textContent=name;$('sig-school').textContent=stop?'中小学停课':'不停课';
 $('sig-meaning').textContent=w.meaning;$('sig-tip').textContent='防御要点：'+TIPS[state.kind][state.i];
 for(const el of ['ty-chips','rs-chips'])for(const b of $(el).querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.k===state.kind&&Number(b.dataset.i)===state.i));
 Site.replaceHash('sig='+state.kind+'-'+state.i);
}
Site.setShareState(()=>'sig='+state.kind+'-'+state.i);

/* ---------- 风力 ---------- */
function drawWind(){
 const v=Number($('wind-ms').value),f=G.windForce(v),g=G.cycloneGrade(v);
 Site.setRange($('wind-ms'),v,v+' 米/秒');$('wind-out').textContent=v+' 米/秒';
 $('force-out').innerHTML=(f>=17?'17 级以上':f+' 级');$('grade-out').textContent=g||'未达热带气旋强度';
}
$('wind-ms').addEventListener('input',drawWind);

/* ---------- 天气符号 ---------- */
const Y='#f4c56b',GR='#9aa8a0',BL='#4f8197';
const cloud=(x,y,c='#c3ccc6')=>'<path d="M'+(x-22)+' '+(y+8)+'a10 10 0 0 1 4-19a13 13 0 0 1 25-3a10 10 0 0 1 15 12a8 8 0 0 1-2 10z" fill="'+c+'" stroke="#8e9b94" stroke-width="1.2"/>';
const sun=(x,y,r=11)=>{let s=C(x,y,r,Y,'#d99a3c',1.2);for(let i=0;i<8;i++){const a=i*Math.PI/4;s+=L(x+Math.cos(a)*(r+3),y+Math.sin(a)*(r+3),x+Math.cos(a)*(r+8),y+Math.sin(a)*(r+8),'#d99a3c',1.6);}return s;};
const drops=(x,y,n)=>{let s='';for(let i=0;i<n;i++){const dx=x-((n-1)*7)/2+i*7;s+=L(dx,y,dx-3,y+9,BL,2);}return s;};
const flake=(x,y)=>{let s='';for(let i=0;i<3;i++){const a=i*Math.PI/3;s+=L(x-Math.cos(a)*5,y-Math.sin(a)*5,x+Math.cos(a)*5,y+Math.sin(a)*5,'#5f86a0',1.6);}return s;};
const SYMBOLS=[
 ['晴',sun(30,28,12)],['多云',sun(22,20,9)+cloud(34,30)],['阴',cloud(30,26,'#aab4ae')],
 ['小雨',cloud(30,20)+drops(30,36,1)],['中雨',cloud(30,20)+drops(30,36,2)],['大雨',cloud(30,20)+drops(30,36,3)],
 ['暴雨',cloud(30,20,'#9aa6a0')+drops(30,36,4)],['雷阵雨',cloud(30,20)+P('M32 32l-6 9h6l-4 9','#e3a94a',2.2)],['雨夹雪',cloud(30,20)+drops(23,36,1)+flake(38,42)],
 ['雪',cloud(30,20)+flake(22,42)+flake(38,42)],['雾',[18,26,34].map(y=>L(12,y,48,y,GR,2.6)).join('')],['沙尘暴',T(30,40,'S',30,'#a9845a',800,'middle')+L(14,28,48,28,'#a9845a',2.2)]
];
$('sym-grid').innerHTML=SYMBOLS.map(([n,svg])=>'<figure><svg viewBox="0 0 60 56" aria-hidden="true">'+svg+'</svg><figcaption>'+n+'</figcaption></figure>').join('');

/* ---------- 风向风力标 ---------- */
const DIRS=[['北',0],['东北',45],['东',90],['东南',135],['南',180],['西南',225],['西',270],['西北',315]];
let vdir=135;
$('dir-chips').innerHTML=DIRS.map(([n,b])=>'<button data-b="'+b+'">'+n+'风</button>').join('');
for(const b of $('dir-chips').querySelectorAll('button'))b.addEventListener('click',()=>{vdir=Number(b.dataset.b);drawVane();});
function drawVane(){
 const f=Number($('vane-force').value),cx=130,cy=104,len=76,b=vdir*Math.PI/180,ux=Math.sin(b),uy=-Math.cos(b);
 Site.setRange($('vane-force'),f,f+' 级');$('vane-out').textContent=f+' 级';
 let s=R(0,0,260,200,'#f6f8f2',12)+T(cx,18,'北',12,'#6f8268',600,'middle')+T(cx,196,'南',12,'#6f8268',600,'middle')+T(14,cy+4,'西',12,'#6f8268',600)+T(246,cy+4,'东',12,'#6f8268',600,'end');
 s+=L(cx,26,cx,182,'#e1e7dc',1)+L(22,cy,238,cy,'#e1e7dc',1);
 const tx=cx+ux*len,ty=cy+uy*len;
 s+=L(cx+ux*6,cy+uy*6,tx,ty,'#2f4a3c',2.2)+C(cx,cy,6,'#fff','#2f4a3c',2);
 const px=-uy,py=ux,longN=Math.floor(f/2),short=f%2;let k=0;
 const feather=(l)=>{const sx=tx-ux*k*8,sy=ty-uy*k*8;s+=L(sx,sy,sx+(px*0.94-ux*0.34)*l,sy+(py*0.94-uy*0.34)*l,'#2f4a3c',2);k++;};
 for(let i=0;i<longN;i++)feather(22);if(short)feather(11);
 $('vane').innerHTML=s;
 const name=DIRS.find(d=>d[1]===vdir)[0];
 $('vane-text').textContent=name+'风 '+f+' 级：风从'+name+'方吹来，杆就指向'+name+'；'+(longN?longN+' 条长风尾':'')+(longN&&short?'加 ':'')+(short?'1 条短风尾':'')+' = '+f+' 级。';
 for(const bt of $('dir-chips').querySelectorAll('button'))bt.setAttribute('aria-pressed',String(Number(bt.dataset.b)===vdir));
}
$('vane-force').addEventListener('input',drawVane);

/* ---------- AQI ---------- */
$('aqi-scale').innerHTML=G.AQI_LEVELS.map((l,i)=>{const lo=i?G.AQI_LEVELS[i-1][0]+1:0,hi=l[0]===Infinity?'>300':l[0];return '<span style="background:'+l[2]+'">'+l[1]+'<small>'+(l[0]===Infinity?'301+':lo+'–'+hi)+'</small></span>';}).join('');
function drawAqi(){const v=Number($('aqi').value),l=G.aqiLevel(v);Site.setRange($('aqi'),v,String(v));$('aqi-out').textContent=v;
 $('aqi-level').textContent=['一','二','三','四','五','六'][l.index-1]+'级';$('aqi-name').innerHTML='<span style="color:'+l.color+'">'+l.name+'</span>';$('aqi-advice').textContent=l.advice;}
$('aqi').addEventListener('input',drawAqi);

/* ---------- 回南天 ---------- */
function drawDew(){
 const t=Number($('air-t').value),rh=Number($('air-rh').value),w=Number($('wall-t').value),dp=G.dewPoint(t,rh),wet=w<=dp;
 for(const [id,v,u] of [['air-t',t,'℃'],['air-rh',rh,'%'],['wall-t',w,'℃']])Site.setRange($(id),v,v+u);
 $('air-out').textContent=t+'℃';$('rh-out').textContent=rh+'%';$('wall-out').textContent=w+'℃';
 $('dp-out').innerHTML=dp.toFixed(1)+'<small>℃</small>';$('cond-out').innerHTML=wet?'<span style="color:#2f6a8a">会结露</span>':'<span style="color:#2f6a4a">不会</span>';
 $('dew-text').textContent=wet?'墙面 '+w+'℃ 低于露点 '+dp.toFixed(1)+'℃，贴近墙面的空气被冷却到露点以下，水汽凝结成水珠——这就是回南天。':'墙面 '+w+'℃ 高于露点 '+dp.toFixed(1)+'℃，空气碰到墙面也不会凝结。试试调高湿度或调低墙温。';
 let s=R(0,0,420,190,'#f6f8f2',12)+R(26,20,96,150,'#e2e6dc',6,'stroke="#b7c0b2"')+T(74,186,'墙面 '+w+'℃',12,'#4f6549',600,'middle');
 const n=wet?Math.min(26,4+Math.round((dp-w)*3)):0;
 for(let i=0;i<n;i++){const x=40+((i*37)%70),y=34+((i*53)%120);s+='<ellipse cx="'+x+'" cy="'+y+'" rx="3" ry="4.2" fill="#7fb0c7" opacity=".85"/>';}
 for(let i=0;i<Math.round(rh/6);i++){const x=170+((i*47)%220),y=32+((i*29)%120);s+=C(x,y,2.2,'#9cc0cc');}
 s+=T(280,180,'暖湿空气 '+t+'℃ · 湿度 '+rh+'%',12,'#2f6377',600,'middle');
 for(const y of [70,110])s+=L(300,y,140,y,'#6b97a6',1.6,'stroke-dasharray="5 4"');
 $('dew').innerHTML=s;
}
for(const id of ['air-t','air-rh','wall-t'])$(id).addEventListener('input',drawDew);

/* ---------- 自然灾害 ---------- */
const DZ=[['台风','东南沿海，夏秋季多发'],['寒潮','冬半年，北方降温剧烈'],['干旱','华北春季较突出（春旱）'],['洪涝','东部季风区，夏季汛期多发'],['滑坡、泥石流','西南山区，雨季多发'],['地震','两大地震带之间，西南、西北、华北和台湾多发']];
let dzR=0,dzD=0;
$('dz-list').innerHTML=DZ.map(([n,a],i)=>{const opts=shuffle([a,...shuffle(DZ.filter(d=>d[1]!==a).map(d=>d[1])).slice(0,2)]);return '<div class="choice-row" data-i="'+i+'" style="flex-direction:column;align-items:stretch"><div><p><b>'+n+'</b></p><p class="verdict" hidden></p></div><div class="chips small" style="flex-wrap:wrap;justify-content:flex-start">'+opts.map(o=>'<button data-v="'+o+'">'+o+'</button>').join('')+'</div></div>';}).join('');
for(const row of $('dz-list').querySelectorAll('.choice-row')){const [n,a]=DZ[Number(row.dataset.i)];
 for(const b of row.querySelectorAll('button'))b.addEventListener('click',()=>{if(row.dataset.done)return;row.dataset.done='1';dzD++;const ok=b.dataset.v===a;if(ok)dzR++;
  row.classList.add(ok?'correct':'wrong');Site.pressed(row.querySelector('.chips'),b);const v=row.querySelector('.verdict');v.hidden=false;v.textContent=(ok?'✓ ':'✗ ')+n+'：'+a+'。';
  $('dz-score').textContent=dzD===DZ.length?'答对 '+dzR+' / '+DZ.length:'已答 '+dzD+' / '+DZ.length;});}

/* ---------- 练习 ---------- */
const qs=[
 {title:'深圳发布下列哪种预警信号时，中小学会停课？',opts:[['a','台风黄色预警'],['b','暴雨黄色预警'],['c','台风蓝色预警']],answer:'a',yes:'正确！台风黄色及以上、暴雨红色时中小学停课。',no:'提示：台风从黄色起停课，暴雨要到红色。'},
 {title:'风向杆上有两条长风尾、一条短风尾，风力是几级？',opts:[['a','3 级'],['b','5 级'],['c','6 级']],answer:'b',yes:'对了！2 + 2 + 1 = 5 级。',no:'提示：一长线 2 级，一短线 1 级。'},
 {title:'某天空气质量指数（AQI）为 120，属于哪一类？',opts:[['a','良'],['b','轻度污染'],['c','中度污染']],answer:'b',yes:'正确！101—150 为轻度污染（三级）。',no:'用上面的 AQI 滑块试一试 120。'}
];
let qi=0;
function showQ(){const q=qs[qi];$('quiz-title').textContent=q.title;$('quiz-step').textContent=(qi+1)+' / '+qs.length;
 $('quiz-options').innerHTML=shuffle(q.opts).map(([v,l])=>'<button data-value="'+v+'">'+l+'</button>').join('');$('quiz-feedback').textContent='';$('quiz-feedback').className='feedback';$('next-question').hidden=true;
 Site.optionQuiz($('quiz-options'),{answer:q.answer,onAnswer:ok=>{$('quiz-feedback').textContent=ok?q.yes:q.no;$('quiz-feedback').className='feedback '+(ok?'success':'retry');$('next-question').hidden=!ok;$('next-question').textContent=qi===qs.length-1?'完成，再练一次':'下一题';}});}
$('next-question').addEventListener('click',()=>{qi=(qi+1)%qs.length;showQ();});
showQ();drawSignal();drawWind();drawVane();drawAqi();drawDew();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'我国气象预警信号中，哪个级别最高？',desc:'颜色越深越严重。',options:['红色','橙色','黄色','蓝色'],answer:0,hint:'蓝黄橙红由轻到重。',explain:'<b>红色</b>最高。顺序是<b>蓝 → 黄 → 橙 → 红</b>，深圳发布台风或暴雨红色预警时会停课停工。'},
 {level:'base',title:'台风主要影响我国哪个地区？',desc:'想想台风从哪里来。',options:['东南沿海','西北内陆','青藏高原','东北平原'],answer:0,hint:'台风生成于热带洋面。',explain:'台风生成于<b>热带洋面</b>，主要影响<b>东南沿海</b>，夏秋季节最多。广东是受影响最频繁的省份之一。'},
 {level:'base',title:'天气预报中「多云转晴」描述的是？',desc:'注意时间尺度。',options:['天气','气候','季节','节气'],answer:0,hint:'短时间的大气状况。',explain:'这是<b>天气</b>。气候说的是多年平均状况，不会用「今天、明天」这种说法。'},
 {level:'mid',title:'台风带来的影响，下列说法正确的是？',desc:'台风只有坏处吗？',options:['既有破坏也能缓解旱情','只有危害没有好处','只带来降温','只影响内陆'],answer:0,hint:'想想夏季伏旱时谁能带来降水。',explain:'台风会带来<b>狂风、暴雨、风暴潮</b>造成破坏，但也能<b>缓解长江流域的伏旱</b>、带来淡水资源。评价自然现象要<b>一分为二</b>。'},
 {level:'mid',title:'华北地区春旱严重的主要原因是？',desc:'从降水和蒸发两方面想。',options:['春季降水少而蒸发旺盛，又正值作物需水期','春季降水过多','地势太高','人口太少'],answer:0,hint:'夏季风还没来，气温却升高了。',explain:'华北春季<b>夏季风未到、降水稀少</b>，气温回升<b>蒸发旺盛</b>，又正值冬小麦返青需水，所以春旱突出。'},
 {level:'mid',title:'深圳「回南天」墙上出水，是什么现象？',desc:'暖湿空气遇到冷物体会怎样。',options:['水汽遇冷凝结','下雨渗进来','地下水上涌','空气干燥'],answer:0,hint:'像夏天冰镇饮料瓶外壁。',explain:'春季暖湿气流北上，遇到温度较低的墙面地面，水汽<b>凝结</b>成水珠。和冰镇饮料瓶「出汗」是同一个道理。'},
 {level:'mid',title:'风向标显示「西北风 5 级」，表示风从哪里吹来？',desc:'风向指的是风的来向。',options:['从西北方吹来','吹向西北方','在西北方打转','与方向无关'],answer:0,hint:'风向永远说来向。',explain:'<b>风向指风的来向</b>，西北风就是<b>从西北吹向东南</b>。风羽上两条长线加一条短线表示 5 级。'},
 {level:'trap',title:'地震发生时，在教室里的正确做法是？',desc:'先躲后跑。',options:['先躲在课桌下护住头部，震后迅速有序撤离','立刻冲向楼梯口','跳窗逃生','站在窗边等待'],answer:0,hint:'地震只有几十秒，盲目奔跑更危险。',explain:'正确做法是<b>先躲（课桌下护头）、后撤（震后有序撤离）</b>。强震期间盲目奔跑、跳窗、挤楼梯都极其危险——<b>伏地、遮挡、手抓牢</b>是国际通用口诀。'}
]);
