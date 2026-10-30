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
