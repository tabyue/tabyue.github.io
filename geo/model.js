/* 地理互动馆 · 纯计算模块（无 DOM），可在 Node 中单元测试。
   不含任何地图边界、海岸线数据。 */
(function(root){
'use strict';
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const mod=(v,m)=>((v%m)+m)%m;
function normLon(v){return mod(v+180,360)-180;}

/* ---------- 经纬度文字 ---------- */
function longitudeText(v){if(v===0)return '0°';if(Math.abs(v)===180)return '180°';return Math.abs(v)+'°'+(v>0?'E':'W');}
function latitudeText(v){return v===0?'0°':Math.abs(v)+'°'+(v>0?'N':'S');}
function hemispheres(lon,lat){
 if(Math.abs(lat)===90)return {ns:lat>0?'北极':'南极',ew:'经线在极点汇聚'};
 const l=normLon(lon);
 return {ns:lat===0?'南北半球分界':lat>0?'北半球':'南半球',ew:(l===-20||l===160)?'东西半球分界':(l>-20&&l<160)?'东半球':'西半球'};
}
function description(lon,lat){
 if(Math.abs(lat)===90)return (lat>0?'北极':'南极')+'：所有经线在这里相交，不能用不同经度区分极点位置。';
 const a=lon===0?'本初子午线':Math.abs(lon)===180?'180° 经线':(lon>0?'东经 ':'西经 ')+Math.abs(lon)+'°';
 const b=lat===0?'赤道':(lat>0?'北纬 ':'南纬 ')+Math.abs(lat)+'°';
 return a+'与'+b+'的交点。';
}

/* ---------- 正射投影球体 ----------
   相机坐标：X 向右，Y 向上，Z 指向观察者；最后按 tilt 旋转到屏幕。 */
function camVec(lon,lat,camera){
 const l=rad(lon-camera.lon),p=rad(lat),e=rad(camera.lat);
 return [Math.cos(p)*Math.sin(l),
  Math.sin(p)*Math.cos(e)-Math.cos(p)*Math.cos(l)*Math.sin(e),
  Math.sin(p)*Math.sin(e)+Math.cos(p)*Math.cos(l)*Math.cos(e)];
}
function toScreen(X,Y,camera){
 const {cx=194,cy=160,r=112,tilt=-14}=camera,t=rad(tilt);
 return {x:cx+r*(X*Math.cos(t)+Y*Math.sin(t)),y:cy+r*(X*Math.sin(t)-Y*Math.cos(t))};
}
function project(lon,lat,camera){const v=camVec(lon,lat,camera),s=toScreen(v[0],v[1],camera);return {x:s.x,y:s.y,z:v[2]};}
function visiblePath(coords,camera){
 let d='',prev=null;
 const pt=p=>p.x.toFixed(2)+' '+p.y.toFixed(2);
 for(const [lon,lat] of coords){
  const p=project(lon,lat,camera);
  if(prev&&(p.z>=0)!==(prev.z>=0)){
   const a=prev.z/(prev.z-p.z);
   d+=(p.z>=0?'M':'L')+pt({x:prev.x+a*(p.x-prev.x),y:prev.y+a*(p.y-prev.y)});
  }
  if(p.z>=0)d+=(prev?'L':'M')+pt(p);
  prev=p;
 }
 return d.replace(/^L/,'M');
}
function meridian(lon){return Array.from({length:91},(_,i)=>[lon,-90+i*2]);}
function parallel(lat){return Array.from({length:181},(_,i)=>[-180+i*2,lat]);}

/* ---------- 自转与昼夜 ---------- */
// 北京时间 = 120°E 的地方时（不计均时差）。12:00 时太阳直射 120°E。
function subsolarLongitude(beijingHour){return normLon(120-15*(beijingHour-12));}
function localTime(beijingHour,lon){return mod(beijingHour+(lon-120)/15,24);}
function timeText(h){const m=Math.round(mod(h,24)*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function sunDot(lon,lat,sLon,sLat){
 const a=rad(lat),b=rad(sLat),d=rad(lon-sLon);
 return Math.cos(a)*Math.cos(b)*Math.cos(d)+Math.sin(a)*Math.sin(b);
}
// 正射球面上“夜半球”的可见部分（屏幕路径）。返回 {night, terminator}
function nightShape(camera,sLon,sLat){
 const s=camVec(sLon,sLat,camera),h=Math.hypot(s[0],s[1]),N=96;
 const scr=(X,Y)=>{const p=toScreen(X,Y,camera);return p.x.toFixed(2)+' '+p.y.toFixed(2);};
 if(h<1e-6){
  if(s[2]>0)return {night:'',terminator:''};
  let d='';for(let i=0;i<=N;i++){const u=2*Math.PI*i/N;d+=(i?'L':'M')+scr(Math.cos(u),Math.sin(u));}
  return {night:d+'Z',terminator:''};
 }
 const e1=[s[1]/h,-s[0]/h,0];
 const e2=[s[1]*e1[2]-s[2]*e1[1],s[2]*e1[0]-s[0]*e1[2],s[0]*e1[1]-s[1]*e1[0]];
 let term='';
 for(let i=0;i<=N;i++){const t=Math.PI+Math.PI*i/N;term+=(i?'L':'M')+scr(Math.cos(t)*e1[0]+Math.sin(t)*e2[0],Math.cos(t)*e1[1]+Math.sin(t)*e2[1]);}
 const an=Math.atan2(-s[1],-s[0]);
 let limb='';
 for(let i=0;i<=N;i++){const u=an+Math.PI/2-Math.PI*i/N;limb+='L'+scr(Math.cos(u),Math.sin(u));}
 return {night:term+limb+'Z',terminator:term};
}

/* ---------- 公转与四季 ---------- */
const DAY_MS=86400000;
// 低精度太阳位置（《天文年历》近似公式，赤纬误差约 0.01°）
function sunPosition(date){
 const n=date.getTime()/DAY_MS+2440587.5-2451545.0;
 const L=mod(280.460+0.9856474*n,360);
 const g=rad(mod(357.528+0.9856003*n,360));
 const lambda=mod(L+1.915*Math.sin(g)+0.020*Math.sin(2*g),360);
 const eps=23.439-0.0000004*n;
 return {lambda,eps,decl:deg(Math.asin(Math.sin(rad(eps))*Math.sin(rad(lambda))))};
}
function daysInYear(y){return ((y%4===0&&y%100!==0)||y%400===0)?366:365;}
function dayOfYear(y,m,d){return Math.round((Date.UTC(y,m-1,d)-Date.UTC(y,0,1))/DAY_MS)+1;}
function dateOf(y,doy){const d=new Date(Date.UTC(y,0,doy));return {month:d.getUTCMonth()+1,day:d.getUTCDate()};}
function beijingNoon(y,doy){return new Date(Date.UTC(y,0,doy,4,0,0));}
function declinationOn(y,doy){return sunPosition(beijingNoon(y,doy)).decl;}
const TERMS=[[0,'春分'],[90,'夏至'],[180,'秋分'],[270,'冬至']];
// 逐小时扫描黄经穿越 0/90/180/270°，返回北京时间日期
function seasonMarkers(y){
 const out=[],start=Date.UTC(y,0,1,-8),end=Date.UTC(y+1,0,1,-8);
 let prev=sunPosition(new Date(start)).lambda;
 for(let t=start+3600000;t<=end;t+=3600000){
  const cur=sunPosition(new Date(t)).lambda;
  for(const [target,name] of TERMS){
   const crossed=target===0?(prev>300&&cur<60):(prev<target&&cur>=target);
   if(crossed){const bj=new Date(t+8*3600000),m=bj.getUTCMonth()+1,d=bj.getUTCDate();out.push({name,target,month:m,day:d,doy:dayOfYear(y,m,d)});}
  }
  prev=cur;
 }
 return out.sort((a,b)=>a.doy-b.doy);
}
// 昼长（小时）：几何算法，不计大气折射与太阳视半径
function dayLength(lat,decl){
 if(Math.abs(lat)>=89.9999)return Math.abs(decl)<1e-9?12:(lat*decl>0?24:0);
 const x=-Math.tan(rad(lat))*Math.tan(rad(decl));
 if(x<=-1)return 24;if(x>=1)return 0;
 return 2*deg(Math.acos(x))/15;
}
function noonAltitude(lat,decl){return 90-Math.abs(lat-decl);}
function hoursText(h){if(h>=24)return '24 小时（极昼）';if(h<=0)return '0 小时（极夜）';const m=Math.round(h*60);return Math.floor(m/60)+' 小时 '+(m%60)+' 分';}
// 某纬度一年内太阳直射的日期（北京时间正午取样，相邻两日跨越即记为直射日）
function directSunDates(y,lat){
 const n=daysInYear(y),out=[];
 let prev=declinationOn(y,1)-lat;
 for(let i=2;i<=n;i++){
  const cur=declinationOn(y,i)-lat;
  if(prev===0||prev*cur<0){const pick=Math.abs(prev)<Math.abs(cur)?i-1:i;if(!out.length||pick-out[out.length-1]>3)out.push(pick);}
  prev=cur;
 }
 return out.map(d=>Object.assign({doy:d},dateOf(y,d)));
}

/* ---------- 地图与地形：合成地形 ---------- */
const TERRAIN={w:100,h:70,kmPerUnit:0.1};
function segInfo(x,y,ax,ay,bx,by){
 const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy,t=clamp(((x-ax)*dx+(y-ay)*dy)/l2,0,1);
 return [Math.hypot(x-ax-t*dx,y-ay-t*dy),t];
}
function terrainHeight(x,y){
 // 主峰 A：带向西南、向南两条山脊；次峰 B：东坡陡、西坡缓
 const ga=Math.exp(-(((x-33)**2)/(2*(x<33?11:8)**2)+((y-28)**2)/(2*8**2)));
 const gb=Math.exp(-(((x-72)**2)/(2*(x<72?10:4.6)**2)+((y-30)**2)/(2*8**2)));
 const [d1,t1]=segInfo(x,y,33,28,10,62),[d2,t2]=segInfo(x,y,33,28,45,66);
 const s1=760*Math.exp(-(d1*d1)/(2*4.2*4.2))*Math.pow(1-t1,1.1);
 const s2=700*Math.exp(-(d2*d2)/(2*4*4))*Math.pow(1-t2,1.2);
 const a=820*ga,b=600*gb;
 const mA=Math.pow(a**8+s1**8+s2**8,.125);
 return 40+mA+b;
}
function makeGrid(fn,w,h,step){
 const nx=Math.round(w/step),ny=Math.round(h/step),v=new Float64Array((nx+1)*(ny+1));
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)v[j*(nx+1)+i]=fn(i*step,j*step);
 return {nx,ny,step,v};
}
// marching squares：返回线段数组 [x1,y1,x2,y2]
function contourSegments(grid,level){
 const {nx,ny,step,v}=grid,out=[],W=nx+1;
 const lerp=(a,b)=>(level-a)/(b-a);
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const a=v[j*W+i],b=v[j*W+i+1],c=v[(j+1)*W+i+1],d=v[(j+1)*W+i];
  const k=(a>=level?8:0)|(b>=level?4:0)|(c>=level?2:0)|(d>=level?1:0);
  if(k===0||k===15)continue;
  const x=i*step,y=j*step;
  const T=[x+lerp(a,b)*step,y],R=[x+step,y+lerp(b,c)*step],B=[x+lerp(d,c)*step,y+step],L=[x,y+lerp(a,d)*step];
  const add=(p,q)=>out.push([p[0],p[1],q[0],q[1]]);
  const centre=(a+b+c+d)/4>=level;
  switch(k){
   case 1:case 14:add(L,B);break;case 2:case 13:add(B,R);break;case 3:case 12:add(L,R);break;
   case 4:case 11:add(T,R);break;case 6:case 9:add(T,B);break;case 7:case 8:add(L,T);break;
   case 5:if(centre){add(L,T);add(B,R);}else{add(L,B);add(T,R);}break;
   case 10:if(centre){add(T,R);add(L,B);}else{add(L,T);add(B,R);}break;
  }
 }
 return out;
}
function terrainProfile(ax,ay,bx,by,n=160){
 const pts=[];
 for(let i=0;i<=n;i++){const t=i/n,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;pts.push({t,x,y,h:terrainHeight(x,y)});}
 return pts;
}
function localMax(x,y){
 let step=1;
 for(let k=0;k<400;k++){
  let best=[x,y],bh=terrainHeight(x,y);
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const h=terrainHeight(x+dx*step,y+dy*step);if(h>bh){bh=h;best=[x+dx*step,y+dy*step];}}
  if(best[0]===x&&best[1]===y){if(step<0.05)break;step/=2;}else{x=best[0];y=best[1];}
 }
 return {x,y,h:terrainHeight(x,y)};
}
let featureCache=null;
function terrainFeatures(){
 if(featureCache)return featureCache;
 const A=localMax(33,28),B=localMax(72,30);
 // 鞍部：两峰连线上的最低点，再沿垂直方向取最高点
 let low={h:Infinity};
 for(let i=0;i<=200;i++){const t=i/200,x=A.x+(B.x-A.x)*t,y=A.y+(B.y-A.y)*t,h=terrainHeight(x,y);if(t>.1&&t<.9&&h<low.h)low={x,y,h};}
 let saddle=low;
 for(let dy=-8;dy<=8;dy+=.1){const h=terrainHeight(low.x,low.y+dy);if(h>saddle.h||saddle===low)saddle={x:low.x,y:low.y+dy,h};}
 // 山谷：两条山脊之间 y=50 处的最低点
 let valley={h:Infinity};
 for(let x=20;x<=38;x+=.1){const h=terrainHeight(x,50);if(h<valley.h)valley={x,y:50,h};}
 const t=.45,ridgeX=33+(10-33)*t,ridgeY=28+(62-28)*t;
 featureCache={
  peakA:Object.assign({name:'山峰（主峰）'},A),
  peakB:Object.assign({name:'山峰（次峰）'},B),
  saddle:Object.assign({name:'鞍部'},saddle),
  ridge:{name:'山脊',x:ridgeX,y:ridgeY,h:terrainHeight(ridgeX,ridgeY)},
  valley:Object.assign({name:'山谷'},valley),
  steep:{name:'陡坡（次峰东坡）',x:B.x+6,y:B.y,h:terrainHeight(B.x+6,B.y)},
  gentle:{name:'缓坡（次峰西坡）',x:B.x-9,y:B.y,h:terrainHeight(B.x-9,B.y)}
 };
 return featureCache;
}
// 沿某方向从点出发，海拔下降 dh 所需的水平距离（地图单位）
function runForDrop(x,y,dirX,dirY,dh){
 const h0=terrainHeight(x,y),n=Math.hypot(dirX,dirY);
 for(let s=0;s<60;s+=.05){if(h0-terrainHeight(x+dirX/n*s,y+dirY/n*s)>=dh)return s;}
 return Infinity;
}

/* ---------- 天气与气候：1991–2020 气候标准值 ---------- */
const CLIMATE_TYPES={
 tropicalRainforest:{name:'热带雨林气候',trait:'全年高温多雨'},
 tropicalDesert:{name:'热带沙漠气候',trait:'全年炎热干燥'},
 mediterranean:{name:'地中海气候',trait:'夏季炎热干燥，冬季温和多雨'},
 oceanic:{name:'温带海洋性气候',trait:'冬暖夏凉，全年降水较均匀'},
 subtropicalMonsoon:{name:'亚热带季风气候',trait:'夏季高温多雨，冬季温和少雨'},
 temperateMonsoon:{name:'温带季风气候',trait:'夏季高温多雨，冬季寒冷干燥'}
};
const CITIES=[
 {id:'shenzhen',name:'深圳',where:'中国广东',type:'subtropicalMonsoon',station:'深圳（中国气象局，1991–2020）',
  temp:[15.7,16.8,19.4,23.1,26.4,28.3,29.0,28.8,27.9,25.5,21.7,17.4],prec:[35.2,36.8,64.0,140.1,237.1,368.7,309.5,364.3,242.5,73.4,31.7,29.6]},
 {id:'beijing',name:'北京',where:'中国',type:'temperateMonsoon',station:'北京（中国气象局，1991–2020）',
  temp:[-2.7,0.6,7.5,15.1,21.3,25.3,27.2,26.1,21.2,13.8,5.2,-1.0],prec:[2.2,5.8,8.6,21.7,36.1,72.4,169.7,113.4,53.7,28.7,13.5,2.2]},
 {id:'singapore',name:'新加坡',where:'新加坡',type:'tropicalRainforest',station:'新加坡（新加坡气象局，1991–2020）',
  temp:[26.8,27.3,27.8,28.2,28.6,28.5,28.2,28.1,28.0,27.9,27.2,26.8],prec:[221.6,105.1,151.7,164.3,164.3,135.3,146.6,146.9,124.9,168.3,252.3,331.9]},
 {id:'cairo',name:'开罗',where:'埃及',type:'tropicalDesert',station:'开罗国际机场（1991–2020）',
  temp:[14.4,15.6,18.3,21.8,25.6,28.2,29.1,29.2,27.6,24.6,20.0,15.9],prec:[4.8,3.8,6.3,1.3,0.2,0,0,0,0,0.7,4.3,3.4]},
 {id:'rome',name:'罗马',where:'意大利',type:'mediterranean',station:'罗马乌尔贝机场（1991–2020）',
  temp:[7.9,8.6,11.2,14.2,18.7,23.1,26.0,26.1,21.9,17.4,12.4,8.7],prec:[65.6,62.8,58.6,68.6,56.9,30.1,19.8,30.2,64.9,88.1,108.2,98.3]},
 {id:'london',name:'伦敦',where:'英国',type:'oceanic',station:'伦敦邱园（英国气象局，1991–2020）',
  temp:[5.3,5.6,7.7,10.1,13.3,16.2,18.5,18.2,15.4,11.9,8.0,5.6],prec:[59.9,45.4,39.0,43.6,44.6,49.7,45.2,55.1,51.9,67.9,66.0,59.2]}
];
function climateStats(c){
 const r1=v=>Math.round(v*10)/10;
 const hot=c.temp.indexOf(Math.max(...c.temp)),cold=c.temp.indexOf(Math.min(...c.temp));
 const total=c.prec.reduce((a,b)=>a+b,0);
 const wet=c.prec.indexOf(Math.max(...c.prec)),dry=c.prec.indexOf(Math.min(...c.prec));
 const summer=c.prec[5]+c.prec[6]+c.prec[7],winter=c.prec[11]+c.prec[0]+c.prec[1];
 const mayToSep=c.prec.slice(4,9).reduce((a,b)=>a+b,0);
 return {hotMonth:hot+1,hotTemp:c.temp[hot],coldMonth:cold+1,coldTemp:c.temp[cold],range:r1(c.temp[hot]-c.temp[cold]),
  mean:r1(c.temp.reduce((a,b)=>a+b,0)/12),total:r1(total),wetMonth:wet+1,dryMonth:dry+1,
  summer:r1(summer),winter:r1(winter),mayToSepShare:total?Math.round(mayToSep/total*100):0};
}
// 判读理由（据数据生成，不替代教材定义）
function climateReasons(c){
 const s=climateStats(c),out=[];
 out.push('最冷月 '+s.coldMonth+' 月 '+s.coldTemp+'℃，最热月 '+s.hotMonth+' 月 '+s.hotTemp+'℃，年温差 '+s.range+'℃。');
 out.push('年降水量 '+s.total+' 毫米；夏季（6—8 月）'+s.summer+' 毫米，冬季（12—2 月）'+s.winter+' 毫米。');
 const tips={
  tropicalRainforest:'每个月气温都在 26℃ 以上，年温差不到 2℃；每月降水都超过 100 毫米。',
  tropicalDesert:'年降水量不足 25 毫米，夏季连续几个月滴雨不下；夏季均温接近 30℃。',
  mediterranean:'冬季降水明显多于夏季，这是“雨热不同期”，与季风气候正好相反。',
  oceanic:'最热月不到 19℃，最冷月仍在 5℃ 以上；各月降水都在 39—68 毫米之间，分配较均匀。',
  subtropicalMonsoon:'冬季温和（最冷月高于 0℃），5—9 月降水占全年 '+s.mayToSepShare+'%，雨热同期。',
  temperateMonsoon:'最冷月低于 0℃，冬季寒冷干燥；5—9 月降水占全年 '+s.mayToSepShare+'%，集中在夏季。'
 };
 out.push(tips[c.type]);
 return out;
}
const LAPSE=0.6; // ℃/100 m，对流层气温垂直递减的平均值
function temperatureAtAltitude(t0,h){return t0-LAPSE*h/100;}
// 海陆热力性质差异（示意曲线，不代表实测）：陆地升降温快、振幅大；海洋滞后、振幅小
function landSeaSchematic(month){
 const a=2*Math.PI*(month-4.5)/12;
 return {land:15+14*Math.sin(a),sea:15+6*Math.sin(a-2*Math.PI/12)};
}

/* ---------- 中国与世界 ---------- */
const CONTINENTS=[['亚洲',4400],['非洲',3020],['北美洲',2422],['南美洲',1797],['南极洲',1400],['欧洲',1016],['大洋洲',897]];
const OCEANS=[['太平洋',17968],['大西洋',9336],['印度洋',7492],['北冰洋',1310]];

function parseCoordinates(hash){
 const params=new URLSearchParams(String(hash||'').replace(/^#/,''));
 const rawLon=params.get('lon'),rawLat=params.get('lat');
 if(rawLon===null||rawLat===null||rawLon.trim()===''||rawLat.trim()==='')return null;
 const lon=Number(rawLon),lat=Number(rawLat);
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||lon<-180||lon>180||lat<-90||lat>90)return null;
 return {lon:Math.round(lon),lat:Math.round(lat)};
}
function parseNumber(hash,key,min,max){
 const raw=new URLSearchParams(String(hash||'').replace(/^#/,'')).get(key);
 if(raw===null||raw.trim()==='')return null;
 const v=Number(raw);return Number.isFinite(v)&&v>=min&&v<=max?v:null;
}

const API={rad,deg,clamp,mod,normLon,longitudeText,latitudeText,hemispheres,description,camVec,toScreen,project,visiblePath,meridian,parallel,
 subsolarLongitude,localTime,timeText,sunDot,nightShape,
 sunPosition,daysInYear,dayOfYear,dateOf,declinationOn,seasonMarkers,dayLength,noonAltitude,hoursText,directSunDates,
 TERRAIN,terrainHeight,makeGrid,contourSegments,terrainProfile,terrainFeatures,runForDrop,
 CLIMATE_TYPES,CITIES,climateStats,climateReasons,LAPSE,temperatureAtAltitude,landSeaSchematic,
 CONTINENTS,OCEANS,parseCoordinates,parseNumber};
if(typeof module==='object'&&module.exports)module.exports=API;else root.Geo=API;
})(typeof globalThis!=='undefined'?globalThis:this);
