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
