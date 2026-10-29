/* 地理互动馆 · 地图模块（天地图 JS API 4.0）
 * 用法：<div class="geo-map" id="xxx" data-preset="bayarea" data-group="all"></div>
 * 本模块以 defer 方式加载，执行时 DOM 已解析完，会立即挂载页面上所有 .geo-map。
 * 页面脚本可用 GeoMap.get('xxx').show('group') 切换分组、.focus(i) 定位某个点。
 */
(function(){
'use strict';
const CFG=window.GEO_MAP_CONFIG||{enabled:false};
const DATA=(window.GeoMapData||{}).PRESETS||{};
const MNR='http://bzdt.ch.mnr.gov.cn/';
const COLORS={city:'#3d7391',land:'#9c6334',water:'#2f7f97',route:'#b0472e',station:'#7a4520',zone:'#4f7a48'};
const instances={};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtLat=v=>Math.abs(v).toFixed(1).replace(/\.0$/,'')+'°'+(v>=0?'N':'S');
const fmtLng=v=>Math.abs(v).toFixed(1).replace(/\.0$/,'')+'°'+(v>=0?'E':'W');
const fmt=m=>fmtLat(m.lat)+'，'+fmtLng(m.lng);
const tdtReady=()=>!!(CFG.enabled&&window.T&&typeof T.Map==='function'&&typeof T.LngLat==='function');

function listHtml(group,active){
 return '<ol class="map-list">'+group.markers.map((m,i)=>'<li data-i="'+i+'"'+(i===active?' class="on"':'')+'><button type="button" data-i="'+i+'"><i style="background:'+(COLORS[m.kind]||COLORS.city)+'"></i><b>'+esc(m.name)+'</b><span>'+fmt(m)+'</span></button>'+(m.note?'<em>'+esc(m.note)+'</em>':'')+'</li>').join('')+'</ol>';
}

function Instance(el){
 this.el=el;this.preset=DATA[el.dataset.preset]||{groups:{}};
 this.groupId=el.dataset.group||Object.keys(this.preset.groups)[0];
 this.type=this.preset.type||'normal';this.map=null;this.active=-1;
 el.innerHTML='<div class="map-head"><div class="map-types" role="group" aria-label="底图类型"></div><span class="map-status"></span></div><div class="map-canvas"></div><div class="map-foot"></div>';
 this.canvas=el.querySelector('.map-canvas');this.foot=el.querySelector('.map-foot');
 this.status=el.querySelector('.map-status');this.types=el.querySelector('.map-types');
 this.foot.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(b)this.focus(Number(b.dataset.i));});
 if(tdtReady()){try{this.initMap();}catch(err){this.map=null;this.fail=String(err&&err.message||err);}}
 this.render();
}
Instance.prototype.group=function(){return this.preset.groups[this.groupId]||{center:[105,35],zoom:3,markers:[]};};
Instance.prototype.initMap=function(){
 const map=new T.Map(this.canvas);
 this.map=map;
 const g=this.group();
 map.centerAndZoom(new T.LngLat(g.center[0],g.center[1]),g.zoom);
 try{this.fit();}catch(e){}
 if(map.disableScrollWheelZoom)map.disableScrollWheelZoom();
 if(map.disableDoubleClickZoom)map.disableDoubleClickZoom();
 if(T.Control&&T.Control.Zoom)map.addControl(new T.Control.Zoom());
 this.applyType();
 this.types.innerHTML=[['normal','矢量'],['terrain','地形'],['hybrid','影像']].map(([k,l])=>'<button type="button" data-t="'+k+'" aria-pressed="'+(k===this.type)+'">'+l+'</button>').join('');
 this.types.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;this.type=b.dataset.t;this.applyType();
  for(const x of this.types.querySelectorAll('button'))x.setAttribute('aria-pressed',String(x===b));});
 this.el.classList.add('is-live');
 const re=()=>{clearTimeout(this.dt);this.dt=setTimeout(()=>this.declutter(),120);};
 if(map.addEventListener)for(const ev of ['zoomend','moveend'])try{map.addEventListener(ev,re);}catch(e){}
 window.addEventListener('resize',re);
};
Instance.prototype.fit=function(){
 const g=this.group(),ms=g.markers.filter(m=>!m.nofit);
 if(g.fit===false||ms.length<2||typeof this.map.setViewport!=='function'){this.map.centerAndZoom(new T.LngLat(g.center[0],g.center[1]),g.zoom);return;}
 let x0=180,x1=-180,y0=85,y1=-85;
 for(const m of ms){x0=Math.min(x0,m.lng);x1=Math.max(x1,m.lng);y0=Math.min(y0,m.lat);y1=Math.max(y1,m.lat);}
 const dx=Math.max(x1-x0,.4),dy=Math.max(y1-y0,.3);
 const px=g.padX!=null?g.padX:.08;
 this.map.setViewport([new T.LngLat(Math.max(-179,x0-dx*px),Math.max(-84,y0-dy*.3)),new T.LngLat(Math.min(179,x1+dx*px),Math.min(84,y1+dy*.22))]);
};
Instance.prototype.applyType=function(){
 if(!this.map)return;
 const t={normal:window.TMAP_NORMAL_MAP,terrain:window.TMAP_TERRAIN_MAP,hybrid:window.TMAP_HYBRID_MAP}[this.type];
 if(t)this.map.setMapType(t);
 // 叠加天地图官方「全球境界」图层（国界、省界），小比例尺下也能看清国界
 try{
  if(this.border)this.map.removeLayer(this.border);
  if(CFG.tk&&T.TileLayer){
   this.border=new T.TileLayer('https://t0.tianditu.gov.cn/ibo_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ibo&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk='+CFG.tk,{minZoom:1,maxZoom:18,zIndex:6});
   this.map.addLayer(this.border);
  }
 }catch(e){this.border=null;}
};
Instance.prototype.draw=function(){
 const map=this.map,g=this.group();
 map.clearOverLays();
 (g.lines||[]).forEach(l=>{
  const line=new T.Polyline(l.pts.map(p=>new T.LngLat(p[0],p[1])),{color:l.color||'#b0472e',weight:4,opacity:.9,lineStyle:l.dash?'dashed':'solid'});
  map.addOverLay(line);
 });
 g.markers.forEach((m,i)=>{
  const c=COLORS[m.kind]||COLORS.city,on=i===this.active;
  const icon=new T.DivIcon({className:'gm-icon',iconSize:[14,14],iconAnchor:[7,7],
   html:'<div class="gm-pin k-'+m.kind+' side-'+(m.side||'r')+(on?' on':'')+'" style="--c:'+c+'"><i></i><span>'+esc(m.name)+'</span></div>'});
  const mk=new T.Marker(new T.LngLat(m.lng,m.lat),{icon,title:m.name+'：'+fmt(m)});
  if(mk.addEventListener)mk.addEventListener('click',()=>this.focus(i));
  map.addOverLay(mk);
 });
};
// 标签避让：按点位顺序放置，和已放标签、其他圆点、底部版权区重叠的先隐藏（选中的点优先）
Instance.prototype.declutter=function(){
 const box=this.canvas.getBoundingClientRect();if(!box.width)return;
 const pins=[...this.canvas.querySelectorAll('.gm-pin')];
 const dots=pins.map(p=>p.querySelector('i').getBoundingClientRect());
 const order=pins.map((p,i)=>i).sort((a,b)=>(pins[b].classList.contains('on')?1:0)-(pins[a].classList.contains('on')?1:0)||a-b);
 const kept=[],hit=(r,q,m)=>r.left<q.right+m&&r.right>q.left-m&&r.top<q.bottom+m&&r.bottom>q.top-m;
 for(const p of pins)p.classList.remove('gm-hide');
 let hidden=0;
 for(const i of order){
  const pin=pins[i],span=pin.querySelector('span');if(!span||getComputedStyle(span).display==='none')continue;
  const pref=(pin.className.match(/side-([rltb])/)||[])[1]||'r',tries=[pref,...['r','l','t','b'].filter(x=>x!==pref)];
  const bad=r=>r.left<box.left+2||r.right>box.right-2||r.top<box.top+2||r.bottom>box.bottom-30||kept.some(q=>hit(r,q,2))||dots.some((d,j)=>j!==i&&hit(r,d,1));
  let placed=null;
  for(const sd of tries){pin.classList.remove('side-r','side-l','side-t','side-b');pin.classList.add('side-'+sd);const r=span.getBoundingClientRect();if(!bad(r)){placed=r;break;}}
  if(!placed){pin.classList.remove('side-r','side-l','side-t','side-b');pin.classList.add('side-'+pref);
   if(pin.classList.contains('on'))kept.push(span.getBoundingClientRect());else{pin.classList.add('gm-hide');hidden++;}}
  else kept.push(placed);
 }
 this.hidden=hidden;
};
Instance.prototype.render=function(){
 const g=this.group();
 if(this.map){
  this.status.textContent='底图：天地图';
  try{this.draw();}catch(err){this.status.textContent='标注加载失败';}
  clearTimeout(this.dt);this.dt=setTimeout(()=>this.declutter(),350);
 }else{
  this.el.classList.add('is-fallback');
  this.types.innerHTML='';
  this.status.textContent='';
  this.canvas.innerHTML='<div class="map-fallback"><p class="mf-title">地图暂时无法显示</p><p class="mf-sub">'+
   (CFG.enabled?'天地图服务连接失败，请稍后刷新页面。':'本站地图使用天地图，地图服务尚未开通。')+
   '下面列出了图上要标注的地点和经纬度，可以对照<a href="'+MNR+'" target="_blank" rel="noopener">自然资源部标准地图服务</a>的地图来找。</p></div>';
 }
 this.foot.innerHTML=listHtml(g,this.active)+'<p class="map-credit">'+(this.map?'地图来源：天地图 · 国家地理信息公共服务平台。点击地点可在地图上定位。':'试试先用经纬度在标准地图上找到它们。')+'坐标为约数。</p>';
};
Instance.prototype.show=function(groupId){
 if(!this.preset.groups[groupId])return;
 this.groupId=groupId;this.active=-1;
 if(this.map){try{this.fit();}catch(e){const g=this.group();this.map.centerAndZoom(new T.LngLat(g.center[0],g.center[1]),g.zoom);}}
 this.render();
};
Instance.prototype.focus=function(i){
 const m=this.group().markers[i];if(!m)return;
 this.active=i;
 if(this.map){const z=this.map.getZoom?this.map.getZoom():this.group().zoom;this.map.centerAndZoom(new T.LngLat(m.lng,m.lat),z);}
 this.render();
 this.el.dispatchEvent(new CustomEvent('geomap:focus',{detail:{index:i,marker:m}}));
};

function mountAll(){
 for(const el of document.querySelectorAll('.geo-map[data-preset]')){
  if(!el.id||instances[el.id])continue;
  instances[el.id]=new Instance(el);
 }
}
window.GeoMap={get:id=>instances[id],mountAll,ready:tdtReady,fmt};
mountAll();
})();
