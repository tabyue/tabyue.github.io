/* 首页：湘教版（2024）四册章节与本站课程对照 */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const L=(n,h)=>'<a href="'+h+'">第 '+n+' 课</a>';
// status: ok 已覆盖 · part 部分覆盖 · todo 待做
const ROWS=[
 ['七上','第一章 让我们走进地理',[L(1,'terrain.html')],'ok','地图三要素、等高线、选对地图'],
 ['七上','第二章 认识地球',[L(2,'earth.html'),L(3,'seasons.html')],'ok',''],
 ['七上','第三章 地球的面貌',[L(4,'regions.html'),L(5,'plates.html')],'ok','大洲大洋 + 海陆变迁、板块运动'],
 ['七上','第四章 世界的居民与文化',[L(4,'regions.html'),L(6,'people.html')],'ok',''],
 ['七上','第五章 世界的气候',[L(7,'climate.html'),L(8,'hazards.html')],'ok',''],
 ['七上','第六章 世界的发展差异',[L(6,'people.html')],'ok','发达国家与发展中国家、南北对话'],
 ['七下','第七章 认识大洲',[L(4,'regions.html'),L(9,'continents.html')],'ok','亚洲及欧洲、非洲、美洲，配地形图'],
 ['七下','第八章 了解地区',[L(10,'areas.html')],'ok','东南亚、南亚、西亚、欧洲西部、两极，配地图'],
 ['七下','第九章 走近国家',[L(11,'countries.html')],'ok','六国 + 探究「走进巴西」，配地图'],
 ['八上','第一章 中国的疆域与人口',[L(12,'china.html')],'ok',''],
 ['八上','第二章 中国的自然环境',[L(4,'regions.html'),L(7,'climate.html'),L(8,'hazards.html'),L(13,'water.html')],'ok',''],
 ['八上','第三章 中国的自然资源',[L(14,'resources.html')],'ok',''],
 ['八上','第四章 中国的主要产业',[L(15,'economy.html')],'ok',''],
 ['八下','第五章 中国的地域差异',[L(4,'regions.html'),L(16,'zones.html')],'ok','四大区域、西北、青藏、黄土高原'],
 ['八下','第六章 区域地理特征与城乡分布',[L(17,'northeast.html')],'ok','东北地区：位置与自然、人口与城乡、产业布局'],
 ['八下','第七章 区域内外联系与协同发展',[L(16,'zones.html'),L(18,'bayarea.html')],'ok','大湾区 + 长江经济带'],
 ['八下','第八章 区域地理环境与未来图景',[L(16,'zones.html'),L(19,'places.html')],'ok','北京、台湾省、新疆、贵州 + 黄土高原'],
 ['八下','第九章 建设永续发展的美丽中国',[L(20,'green.html')],'ok','国家公园、深圳垃圾分类、双碳目标']
];
const TXT={ok:'已覆盖',part:'部分覆盖',todo:'待做'};
const cnt={ok:0,part:0,todo:0};ROWS.forEach(r=>cnt[r[3]]++);
$('cover-sum').innerHTML='<span>共 '+ROWS.length+' 章</span><span style="color:#2f6a4a">已覆盖 '+cnt.ok+'</span><span style="color:#9c6334">部分覆盖 '+cnt.part+'</span><span style="color:#6f7d68">待做 '+cnt.todo+'</span>';
$('cover-body').innerHTML=ROWS.map(([b,ch,links,st,note])=>'<tr><td>'+b+'</td><td>'+ch+(note?'<br><span class="note" style="margin:0">'+note+'</span>':'')+'</td><td>'+(links.join('、')||'—')+'</td><td class="st '+st+'">'+TXT[st]+'</td></tr>').join('');
})();
