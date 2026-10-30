/* 第 20 课：建设永续发展的美丽中国（湘教版八下第九章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$;

/* ---------- 国家公园面积 ---------- */
const P=G.NATIONAL_PARKS,max=P[0][1],total=P.reduce((a,b)=>a+b[1],0);
$('np-bars').innerHTML=P.map(([n,a,feat,prov])=>'<div class="np-row"><div class="np-name"><b>'+n.replace('国家公园','')+'</b><span>'+prov+' · '+feat+'</span></div><div class="trk"><div class="fl" style="width:'+Math.max(1.5,a/max*100).toFixed(1)+'%"></div></div><em>'+(a>=10000?(a/10000).toFixed(2).replace(/0$/,'')+' 万':a)+' km²</em></div>').join('')+
 '<p class="note" style="margin-top:6px">合计约 '+(total/10000).toFixed(1)+' 万平方千米。</p>';

/* ---------- 深圳垃圾分类 ---------- */
const TYPES=G.WASTE_TYPES,name=v=>TYPES.find(t=>t[0]===v)[1];
const TIP={rec:'适宜回收利用的物品，要尽量保持清洁干燥。',haz:'对人体健康或环境有危害，要单独投放。',food:'易腐烂的生物质垃圾，要沥干水分。',other:'除以上三类之外的生活垃圾。'};
let order=Site.shuffle(G.WASTE_ITEMS),wi=0,right=0,done=0,answered=false;
$('w-bins').innerHTML=TYPES.map(([v,l,c])=>'<button data-v="'+v+'" style="border-left:6px solid '+c+'">'+l+'</button>').join('');
function showItem(){
 answered=false;$('w-item').textContent=order[wi][0];
 $('w-feedback').textContent='';$('w-feedback').className='feedback';$('w-next').hidden=true;
 for(const b of $('w-bins').querySelectorAll('button'))b.classList.remove('correct','wrong');
}
for(const b of $('w-bins').querySelectorAll('button'))b.addEventListener('click',()=>{
 if(answered)return;answered=true;done++;
 const [item,ans]=order[wi],ok=b.dataset.v===ans;if(ok)right++;
 b.classList.add(ok?'correct':'wrong');
 if(!ok)$('w-bins').querySelector('[data-v='+ans+']').classList.add('correct');
 $('w-feedback').textContent=(ok?'✓ 对了！':'✗ 应该是'+name(ans)+'。')+item+'属于'+name(ans)+'：'+TIP[ans];
 $('w-feedback').className='feedback '+(ok?'success':'retry');
 $('w-score').textContent='· 已分 '+done+' 件，对 '+right+' 件';
 $('w-next').hidden=false;$('w-next').textContent=wi===order.length-1?'再来一轮':'下一件';
});
$('w-next').addEventListener('click',()=>{wi++;if(wi>=order.length){wi=0;order=Site.shuffle(order);}showItem();});

/* ---------- 人地协调判断 ---------- */
Site.matchRows('pr-list','pr-score',Site.shuffle(G.PRACTICES).slice(0,6),[['true','符合'],['false','不符合']],
 (t,ans)=>ans?'这样做兼顾了发展和保护。':'这样做破坏了资源和环境，不可持续。');

/* ---------- 时间线 ---------- */
$('tl').innerHTML=G.GREEN_TIMELINE.map(([y,t])=>'<li><b>'+y+(y>2026?' 年（目标）':' 年')+'</b><span>'+t+'</span></li>').join('');

Site.runQuiz([
 {title:'下列属于深圳垃圾分类中"有害垃圾"的是——',opts:[['a','过期药品'],['b','易拉罐'],['c','果皮']],answer:'a',yes:'正确！过期药品要投进有害垃圾桶。',no:'易拉罐是可回收物，果皮是厨余垃圾。'},
 {title:'我国提出的"双碳"目标是——',opts:[['a','2030 年前碳达峰、2060 年前碳中和'],['b','2025 年碳达峰、2030 年碳中和'],['c','2050 年碳达峰']],answer:'a',yes:'对！这是 2020 年提出的目标。',no:'看看页面上的时间线。'},
 {title:'建立国家公园的主要目的是——',opts:[['a','保护自然生态系统的原真性和完整性'],['b','开发旅游度假区'],['c','扩大耕地面积']],answer:'a',yes:'正确！国家公园实行最严格的保护。',no:'国家公园是自然保护地，重在"保护"。'}
]);
showItem();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'可持续发展的含义是？',desc:'关键在「后代」两个字。',options:['既满足当代人需要，又不损害后代人的需要','只追求经济快速增长','完全不开发资源','先污染后治理'],answer:0,hint:'发展要能持续下去。',explain:'<b>既满足当代人的需要，又不损害后代人满足其需要的能力</b>。强调<b>经济、社会、环境</b>三者协调。'},
 {level:'base',title:'深圳生活垃圾分为哪四类？',desc:'想想小区里的垃圾桶。',options:['可回收物、厨余垃圾、有害垃圾、其他垃圾','干垃圾和湿垃圾','工业和生活垃圾','可燃和不可燃'],answer:0,hint:'废电池属于哪一类？',explain:'分为<b>可回收物、厨余垃圾、有害垃圾、其他垃圾</b>。废电池、过期药品属<b>有害垃圾</b>，要单独投放。'},
 {level:'base',title:'下列属于清洁能源的是？',desc:'使用时污染小、可再生。',options:['太阳能','煤炭','石油','天然气'],answer:0,hint:'它取之不尽。',explain:'<b>太阳能</b>是清洁可再生能源，还有风能、水能、地热能。煤和石油是化石能源，燃烧产生污染和二氧化碳。'},
 {level:'mid',title:'我国西北地区土地荒漠化加剧的人为原因是？',desc:'从人类活动找。',options:['过度放牧、过度开垦、滥伐植被','降水增多','气温降低','风力减弱'],answer:0,hint:'植被被破坏后会怎样？',explain:'人为原因是<b>过度放牧、过度开垦、过度樵采、水资源利用不当</b>，破坏植被后土地失去保护而沙化。自然原因是气候干旱、多大风。'},
 {level:'mid',title:'建立国家公园的主要目的是？',desc:'从保护角度想。',options:['保护自然生态系统的原真性和完整性','增加旅游收入','开发矿产资源','扩大耕地面积'],answer:0,hint:'国家公园首先是保护地。',explain:'首要目的是<b>保护生态系统的原真性和完整性</b>，保护生物多样性，同时适度开展科研、教育和生态旅游。'},
 {level:'mid',title:'「碳中和」指的是？',desc:'排放与吸收相抵。',options:['排放的二氧化碳与吸收的相抵，净排放为零','完全不排放二氧化碳','把二氧化碳全部液化','减少一半排放'],answer:0,hint:'关键词是「相抵」。',explain:'指<b>排放量与吸收量相抵消，净排放为零</b>。途径包括减少排放（清洁能源、节能）和增加吸收（<b>植树造林</b>、碳捕集）。'},
 {level:'mid',title:'下列做法符合可持续发展理念的是？',desc:'找对环境友好的那个。',options:['垃圾分类、绿色出行、节约用水用电','为增产大量使用化肥农药','围湖造田扩大耕地','砍伐森林出口木材'],answer:0,hint:'哪一项兼顾了发展与保护？',explain:'<b>垃圾分类、绿色出行、节水节电</b>都符合。围湖造田会加剧洪涝，滥伐森林导致水土流失，过量化肥农药污染土壤和水体。'},
 {level:'trap',title:'保护环境就意味着完全不开发利用自然资源吗？',desc:'想想可持续发展的三个支柱。',options:['不是，要在保护前提下合理开发利用','是，应该完全不开发','是，开发必然破坏环境','无所谓，先发展再说'],answer:0,hint:'可持续发展同时要求发展和保护。',explain:'可持续发展<b>不是不开发，而是合理、适度地开发</b>，使经济发展与环境保护相协调。「完全不开发」和「先污染后治理」<b>都是错误</b>的极端认识。'}
]);
