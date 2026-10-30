/* 第 17 课：东北地区（湘教版八下第六章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$,{path:P,text:T,rect:R}=Site.S;
const N=G.NORTHEAST,SEC=N.sections;
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('s');
const state={s:SEC.some(x=>x.id===fromHash)?fromHash:'pos'};

$('ne-chips').innerHTML=SEC.map(x=>'<button data-s="'+x.id+'">'+x.sec+' '+x.name+'</button>').join('');
function show(){
 const x=SEC.find(t=>t.id===state.s);
 for(const b of $('ne-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.s===x.id));
 $('ne-title').textContent=x.name;$('ne-sec').textContent='八下 '+x.sec;
 $('ne-items').innerHTML=x.items.map(([k,v])=>'<li><b>'+Site.esc(k)+'</b><span>'+Site.esc(v)+'</span></li>').join('');
 Site.replaceHash('s='+x.id);
}
for(const b of $('ne-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.s=b.dataset.s;show();});

/* ---------- 山环水绕结构示意（不是地图轮廓） ---------- */
const PARTS={
 dx:['大兴安岭','西部的山地屏障，以西是内蒙古高原；山地森林资源丰富。','#9c6334'],
 xx:['小兴安岭','北部的山地屏障，森林茂密，有"红松故乡"之称。','#9c6334'],
 cb:['长白山','东部的山地，主峰附近有火山口湖——长白山天池，是松花江、鸭绿江、图们江的发源地。','#9c6334'],
 sj:['三江平原','黑龙江、乌苏里江、松花江冲积而成，曾经是"北大荒"，如今是"北大仓"。','#7a8f3c'],
 sn:['松嫩平原','松花江、嫩江冲积而成，黑土肥沃，是重要的商品粮基地。','#7a8f3c'],
 lh:['辽河平原','辽河冲积而成，南临渤海，城市和工业集中。','#7a8f3c'],
 hlj:['黑龙江','北部和东北部的界河。','#2f7f97'],wsl:['乌苏里江','东部的界河，与黑龙江汇合处在我国最东端附近。','#2f7f97'],
 yl:['鸭绿江、图们江','东南部的界河，隔江与朝鲜相望。','#2f7f97'],sea:['渤海、黄海','南部临海，大连等港口城市便于对外联系。','#2f7f97']};
let picked='';
function drawRing(){
 const on=k=>k===picked;
 const hit=(k,inner)=>'<g data-r="'+k+'" style="cursor:pointer">'+inner+'</g>';
 let s=R(0,0,320,300,'#f6f8f2',12);
 // 外围水系
 s+=hit('hlj',P('M40 46Q120 6 230 22Q268 30 290 70','#5f97ae',on('hlj')?6:4)+T(112,46,'黑龙江',12,'#2f6377',700,'middle'));
 s+=hit('wsl',P('M290 70Q300 130 286 178','#5f97ae',on('wsl')?6:4)+T(298,128,'乌苏里江',11,'#2f6377',700,'end','transform="rotate(90 298 128)"'));
 s+=hit('yl',P('M286 196Q258 238 214 252','#5f97ae',on('yl')?6:4)+T(306,250,'鸭绿江',11,'#2f6377',700,'end')+T(306,264,'图们江',11,'#2f6377',700,'end'));
 s+=hit('sea',R(96,262,130,26,on('sea')?'#a9cad6':'#c8dde4',10)+T(161,280,'渤海 · 黄海',12,'#2f6377',700,'middle'));
 // 三面山地
 s+=hit('dx',P('M70 62Q46 150 86 240','#b98a5a',on('dx')?16:12)+T(40,154,'大兴安岭',12,'#7a4520',700,'middle','transform="rotate(-80 40 154)"'));
 s+=hit('xx',P('M150 54Q210 40 262 74','#b98a5a',on('xx')?16:12)+T(206,72,'小兴安岭',12,'#7a4520',700,'middle'));
 s+=hit('cb',P('M262 120Q262 176 228 226','#b98a5a',on('cb')?16:12)+T(268,186,'长白山',12,'#7a4520',700,'start'));
 // 中部平原
 s+=hit('sj',R(196,90,58,40,on('sj')?'#c8d38c':'#dfe7b8',10)+T(225,115,'三江平原',11,'#4f5f22',700,'middle'));
 s+=hit('sn',R(100,92,90,72,on('sn')?'#c8d38c':'#dfe7b8',14)+T(145,133,'松嫩平原',12,'#4f5f22',700,'middle'));
 s+=hit('lh',R(118,176,96,50,on('lh')?'#c8d38c':'#dfe7b8',12)+T(166,206,'辽河平原',12,'#4f5f22',700,'middle'));
 $('ring').innerHTML=s;
}
$('ring').addEventListener('click',e=>{const g=e.target.closest('[data-r]');if(!g)return;picked=g.dataset.r;const [n,t]=PARTS[picked];$('ring-text').textContent=n+'：'+t;drawRing();});

/* ---------- 产业与条件 ---------- */
const F=Site.shuffle(N.factors),ALL=N.factors.map(f=>f[1]);
Site.matchRows('nf-list','nf-score',F,i=>Site.shuffle([F[i][1],...Site.shuffle(ALL.filter(x=>x!==F[i][1])).slice(0,2)]).map(x=>[x,x]),(t,ans)=>t+'：'+ans+'。');

Site.runQuiz([
 {title:'东北地区"山环水绕"中的"山"不包括——',opts:[['a','秦岭'],['b','大兴安岭'],['c','长白山']],answer:'a',yes:'正确！秦岭是北方与南方的分界线，不在东北。',no:'点一下上面的示意图，看看是哪三座山。'},
 {title:'东北地区的主要城市大多沿哪条铁路分布？',opts:[['a','哈尔滨—大连铁路'],['b','京广铁路'],['c','京九铁路']],answer:'a',yes:'对！哈尔滨、长春、沈阳、大连都在哈大线上。',no:'看地图上的四个省会和港口城市连成的线。'},
 {title:'东北地区能成为我国重要商品粮基地，下列条件中不正确的是——',opts:[['a','全年高温多雨'],['b','黑土肥沃'],['c','地势平坦、便于机械化']],answer:'a',yes:'正确！东北冬季寒冷漫长，是温带季风气候，不是全年高温。',no:'想想东北的冬天。'}
]);
show();drawRing();
})();

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'东北地区的地形特点可以概括为？',desc:'看它的山和平原。',options:['山环水绕、沃野千里','地势西高东低','多高原盆地','全部是山地'],answer:0,hint:'三面环山，中间是大平原。',explain:'<b>山环水绕、沃野千里</b>：三面被大小兴安岭和长白山环绕，中间是广阔的<b>东北平原</b>。'},
 {level:'base',title:'东北地区农作物的熟制是？',desc:'那里冬季漫长。',options:['一年一熟','一年两熟','一年三熟','两年三熟'],answer:0,hint:'纬度最高，热量不足。',explain:'东北<b>纬度最高、热量不足</b>，农作物<b>一年一熟</b>。海南则可以一年三熟。'},
 {level:'base',title:'东北平原肥沃的土壤叫什么？',desc:'它颜色很深。',options:['黑土','红壤','黄土','紫色土'],answer:0,hint:'有机质含量高，颜色乌黑。',explain:'<b>黑土</b>（黑钙土），有机质丰富，是东北成为商品粮基地的重要条件。'},
 {level:'mid',title:'东北成为我国重要商品粮基地的有利条件是？',desc:'从地广人稀和机械化想。',options:['土壤肥沃、地广人稀、适合大规模机械化','降水特别丰富','热量特别充足','人口特别多'],answer:0,hint:'商品粮的关键是「余粮多」。',explain:'<b>黑土肥沃 + 地广人稀 + 大规模机械化</b> → 产量高、本地消费少、<b>商品率高</b>。注意东北热量其实不足，这是它的短板而非优势。'},
 {level:'mid',title:'东北发展重工业的有利条件是？',desc:'从资源说起。',options:['煤、铁、石油等资源丰富，交通便利','气候温暖','人口稠密','水资源最丰富'],answer:0,hint:'重工业最需要什么？',explain:'<b>煤铁石油等矿产资源丰富</b>（鞍山铁矿、大庆油田、抚顺煤矿），加上<b>铁路网密集</b>，为重工业提供了基础。'},
 {level:'mid',title:'东北老工业基地面临的主要问题是？',desc:'想想为什么需要「振兴」。',options:['资源减少、设备老化、产业结构单一','劳动力严重过剩','完全没有工业基础','交通极不便利'],answer:0,hint:'靠资源起家的地区后来会遇到什么？',explain:'主要问题是<b>资源日渐枯竭、设备和技术老化、产业结构单一</b>、环境污染较重。出路在于<b>产业升级、发展多元经济和新兴产业</b>。'},
 {level:'mid',title:'东北地区冬季漫长寒冷，对当地民居的影响是？',desc:'为了保暖。',options:['墙体厚、屋顶坡度小、设有火炕','墙体薄、通风好','屋顶坡度很大','房屋架空'],answer:0,hint:'北方民居和南方有什么不同？',explain:'为<b>保暖防寒</b>：墙体厚实、窗户较小、屋顶坡度小（积雪保温）、室内有<b>火炕</b>。南方则强调通风防雨，屋顶坡度大。'},
 {level:'trap',title:'东北地区纬度高、热量不足，为什么粮食产量仍然很高？',desc:'产量 = 单产 × 面积。',options:['耕地面积广大、机械化程度高，总产量高','因为那里一年三熟','因为热量其实很充足','因为人口多劳动力足'],answer:0,hint:'热量不足限制的是熟制，不是面积。',explain:'热量不足使它<b>一年只能一熟</b>，但<b>耕地面积极为广阔、地势平坦、机械化程度高</b>，所以<b>总产量</b>仍然很高，商品率也高。关键是区分<b>熟制</b>和<b>总产量</b>。'}
]);
