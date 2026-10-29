/* 第 19 课：区域地理环境与未来图景（湘教版八下第八章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$;
const PL=G.PLACES8,byId=id=>PL.find(p=>p.id===id);
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('p');
const state={p:byId(fromHash)?fromHash:'bj'};

$('p-chips').innerHTML=PL.map(p=>'<button data-p="'+p.id+'">'+p.name+'</button>').join('')+'<a class="chip-link" href="zones.html" style="align-self:center;font-size:12px;color:var(--green);text-decoration:underline;text-underline-offset:2px;margin-left:4px">黄土高原 → 第 14 课</a>';
function show(){
 const p=byId(state.p);
 for(const b of $('p-chips').querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.p===p.id));
 $('p-title').textContent=p.name;$('p-sec').textContent='八下 '+p.sec;$('p-sub').textContent=p.title;
 $('p-facts').innerHTML=p.facts.map(([k,v])=>'<li><b>'+Site.esc(k)+'</b><span>'+Site.esc(v)+'</span></li>').join('');
 $('p-dev').textContent='发展思路：'+p.dev+'。';
 const m=window.GeoMap&&GeoMap.get('p-map');if(m)m.show(p.id);
 Site.replaceHash('p='+p.id);
}
for(const b of $('p-chips').querySelectorAll('button'))b.addEventListener('click',()=>{state.p=b.dataset.p;show();});

const items=Site.shuffle(G.PLACE_CLUES).slice(0,8);
Site.matchRows('pc-list','pc-score',items,PL.map(p=>[p.id,p.name]),(t,ans)=>t+'：'+byId(ans).name+'。');

Site.runQuiz([
 {title:'新疆的瓜果特别甜，主要是因为——',opts:[['a','光照充足、昼夜温差大'],['b','降水多'],['c','纬度低']],answer:'a',yes:'正确！白天光合作用强，夜间呼吸作用弱，糖分积累多。',no:'提示：想想沙漠地区白天和夜晚的温度。'},
 {title:'贵州发展大数据产业的有利条件是——',opts:[['a','气候凉爽、电力充足'],['b','平原广阔'],['c','石油资源丰富']],answer:'a',yes:'对！数据中心需要散热和大量用电。',no:'贵州"地无三里平"，可不是平原。'},
 {title:'台湾岛的人口和城市主要分布在——',opts:[['a','西部沿海平原'],['b','中央山脉'],['c','东部山地']],answer:'a',yes:'正确！西部地势平坦，台北、台中、高雄都在西部。',no:'山地丘陵约占台湾岛的 2/3，人口会集中在哪里？'}
]);
show();
})();
