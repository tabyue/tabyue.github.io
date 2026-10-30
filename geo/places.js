/* 第 19 课：区域地理环境与未来图景（湘教版八下第八章） */
(function(){
'use strict';
const G=window.Geo,Site=window.Site,$=Site.$;
const PL=G.PLACES8,byId=id=>PL.find(p=>p.id===id);
const fromHash=new URLSearchParams(location.hash.replace(/^#/,'')).get('p');
const state={p:byId(fromHash)?fromHash:'bj'};

$('p-chips').innerHTML=PL.map(p=>'<button data-p="'+p.id+'">'+p.name+'</button>').join('')+'<a class="chip-link" href="zones.html" style="align-self:center;font-size:12px;color:var(--green);text-decoration:underline;text-underline-offset:2px;margin-left:4px">黄土高原 → 第 16 课</a>';
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

/* —— 知识自测（自动生成，勿手改） —— */
Site.knowledgeQuiz([
 {level:'base',title:'我国的首都是？',desc:'全国的政治中心。',options:['北京','上海','广州','深圳'],answer:0,hint:'故宫和天安门所在地。',explain:'<b>北京</b>是我国首都，全国<b>政治、文化、国际交往和科技创新</b>中心。'},
 {level:'base',title:'我国面积最大的岛屿是？',desc:'它在东南海域。',options:['中国台湾岛','海南岛','崇明岛','舟山岛'],answer:0,hint:'北回归线穿过它的中南部。',explain:'<b>中国台湾岛</b>是我国面积最大的岛屿，自古以来就是中国领土不可分割的一部分。'},
 {level:'base',title:'新疆的地形特点是？',desc:'山和盆地相间分布。',options:['三山夹两盆','山环水绕','一马平川','地势西高东低'],answer:0,hint:'阿尔泰山、天山、昆仑山。',explain:'<b>三山夹两盆</b>：阿尔泰山、天山、昆仑山之间夹着<b>准噶尔盆地和塔里木盆地</b>。'},
 {level:'mid',title:'新疆瓜果特别甜的主要原因是？',desc:'从光照和温差想。',options:['光照充足、昼夜温差大，糖分积累多','降水特别多','土壤特别肥沃','纬度特别低'],answer:0,hint:'白天制造养分，夜晚消耗少。',explain:'<b>光照强</b>利于白天光合作用制造糖分，<b>昼夜温差大</b>使夜间呼吸消耗少，糖分大量<b>积累</b>。这是干旱区农产品品质好的共同原因。'},
 {level:'mid',title:'新疆农业主要分布在哪里？',desc:'那里最缺水。',options:['盆地边缘的绿洲','盆地中心','高山顶部','沙漠腹地'],answer:0,hint:'高山冰雪融水流到哪里？',explain:'集中在<b>盆地边缘的绿洲</b>，依靠<b>高山冰雪融水</b>灌溉，称为<b>绿洲农业</b>（灌溉农业）。'},
 {level:'mid',title:'贵州发展大数据产业的有利自然条件是？',desc:'服务器最怕热。',options:['气候凉爽、电力充足，利于服务器散热','地形平坦','降水稀少','人口稠密'],answer:0,hint:'想想数据中心的散热成本。',explain:'贵州<b>气候凉爽</b>（夏季不热）可大幅降低<b>服务器散热成本</b>，加上<b>水电资源丰富</b>、地质结构稳定，成为大数据产业基地。'},
 {level:'mid',title:'贵州喀斯特地貌区发展农业的主要困难是？',desc:'想想那里的地表和土层。',options:['地表崎岖、土层薄、易水土流失','气温太低','光照太强','降水太少'],answer:0,hint:'石灰岩地区容易漏水。',explain:'喀斯特地区<b>地表崎岖、耕地破碎、土层薄、地表水易渗漏、水土流失严重</b>，所以要<b>因地制宜</b>发展立体农业和特色产业。'},
 {level:'trap',title:'北京作为首都，其城市职能不包括下列哪项？',desc:'注意首都的定位。',options:['全国最大的重工业基地','全国政治中心','全国文化中心','国际交往中心'],answer:0,hint:'首都适合大量发展重工业吗？',explain:'北京是<b>政治、文化、国际交往、科技创新</b>中心，<b>不是</b>重工业基地。为保护环境和疏解功能，北京正<b>迁出一般制造业</b>。我国最大的重工业基地在<b>东北</b>和环渤海地区。'}
]);
